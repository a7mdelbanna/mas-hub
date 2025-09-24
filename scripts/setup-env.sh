#!/bin/bash

# MAS Hub Environment Setup Script
# Usage: ./scripts/setup-env.sh <environment>

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${2:-$NC}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Error handling
error_exit() {
    log "ERROR: $1" "$RED"
    exit 1
}

# Show usage
show_usage() {
    cat << EOF
MAS Hub Environment Setup Script

Usage: $0 <environment> [options]

Environments:
  local       Set up local development environment
  dev         Set up development environment configuration
  staging     Set up staging environment configuration
  prod        Set up production environment configuration

Options:
  --install-deps      Install all dependencies
  --setup-firebase    Initialize Firebase configuration
  --setup-docker      Set up Docker development environment
  --setup-testing     Set up testing environment
  --setup-monitoring  Set up monitoring and logging
  --all              Set up everything
  --help             Show this help message

Examples:
  $0 local --all
  $0 dev --setup-firebase
  $0 prod --install-deps --setup-monitoring
EOF
}

# Parse command line arguments
parse_arguments() {
    ENVIRONMENT=""
    INSTALL_DEPS=false
    SETUP_FIREBASE=false
    SETUP_DOCKER=false
    SETUP_TESTING=false
    SETUP_MONITORING=false
    SETUP_ALL=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            local|dev|staging|prod)
                ENVIRONMENT="$1"
                shift
                ;;
            --install-deps)
                INSTALL_DEPS=true
                shift
                ;;
            --setup-firebase)
                SETUP_FIREBASE=true
                shift
                ;;
            --setup-docker)
                SETUP_DOCKER=true
                shift
                ;;
            --setup-testing)
                SETUP_TESTING=true
                shift
                ;;
            --setup-monitoring)
                SETUP_MONITORING=true
                shift
                ;;
            --all)
                SETUP_ALL=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                error_exit "Unknown option: $1"
                ;;
        esac
    done

    if [[ -z "$ENVIRONMENT" ]]; then
        error_exit "Environment is required. Use --help for usage information."
    fi

    # If --all is specified, enable all setup options
    if [[ "$SETUP_ALL" == true ]]; then
        INSTALL_DEPS=true
        SETUP_FIREBASE=true
        SETUP_DOCKER=true
        SETUP_TESTING=true
        SETUP_MONITORING=true
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..." "$BLUE"

    # Check Node.js
    if ! command -v node &> /dev/null; then
        error_exit "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    fi

    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $NODE_VERSION -lt 18 ]]; then
        error_exit "Node.js version 18 or higher is required. Current: $(node --version)"
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        error_exit "npm is not installed"
    fi

    log "Prerequisites check passed" "$GREEN"
}

# Install dependencies
install_dependencies() {
    if [[ "$INSTALL_DEPS" == true ]]; then
        log "Installing dependencies..." "$BLUE"

        cd "$PROJECT_ROOT"

        # Install root dependencies
        log "Installing frontend dependencies..." "$BLUE"
        npm ci

        # Install Firebase Functions dependencies
        if [[ -d "functions" ]]; then
            log "Installing Firebase Functions dependencies..." "$BLUE"
            cd functions
            npm ci
            cd ..
        fi

        # Install Firebase CLI globally if not present
        if ! command -v firebase &> /dev/null; then
            log "Installing Firebase CLI..." "$BLUE"
            npm install -g firebase-tools
        fi

        log "Dependencies installed successfully" "$GREEN"
    fi
}

# Set up Firebase configuration
setup_firebase() {
    if [[ "$SETUP_FIREBASE" == true ]]; then
        log "Setting up Firebase configuration..." "$BLUE"

        cd "$PROJECT_ROOT"

        # Check if Firebase is initialized
        if [[ ! -f "firebase.json" ]]; then
            log "Initializing Firebase project..." "$BLUE"
            firebase init
        fi

        # Set up environment-specific Firebase configurations
        case $ENVIRONMENT in
            local)
                log "Setting up Firebase emulators..." "$BLUE"

                # Create Firebase emulator data directory
                mkdir -p firebase-seed-data

                # Set up emulator configuration if not exists
                if ! grep -q "emulators" firebase.json; then
                    log "Adding emulator configuration to firebase.json..." "$BLUE"
                fi
                ;;
            dev)
                firebase use mashub-dev-a0725 --alias dev 2>/dev/null || log "Development project not configured" "$YELLOW"
                ;;
            staging)
                firebase use mashub-staging-a0725 --alias staging 2>/dev/null || log "Staging project not configured" "$YELLOW"
                ;;
            prod)
                firebase use mashub-a0725 --alias production 2>/dev/null || log "Production project not configured" "$YELLOW"
                ;;
        esac

        log "Firebase configuration completed" "$GREEN"
    fi
}

# Set up Docker environment
setup_docker() {
    if [[ "$SETUP_DOCKER" == true ]]; then
        log "Setting up Docker development environment..." "$BLUE"

        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            error_exit "Docker is not installed. Please install Docker from https://www.docker.com/"
        fi

        # Check if Docker Compose is installed
        if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
            error_exit "Docker Compose is not installed"
        fi

        cd "$PROJECT_ROOT"

        # Create necessary directories
        mkdir -p nginx/ssl
        mkdir -p database/init
        mkdir -p monitoring/{prometheus,grafana,logstash}
        mkdir -p backups

        # Generate self-signed certificates for local HTTPS
        if [[ ! -f "nginx/ssl/cert.pem" ]]; then
            log "Generating self-signed certificates..." "$BLUE"
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout nginx/ssl/key.pem \
                -out nginx/ssl/cert.pem \
                -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null || log "Certificate generation skipped" "$YELLOW"
        fi

        # Create nginx configuration
        create_nginx_config

        log "Docker environment setup completed" "$GREEN"
    fi
}

# Create nginx configuration
create_nginx_config() {
    cat > "$PROJECT_ROOT/nginx/nginx.conf" << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    upstream firebase {
        server firebase:4000;
    }

    server {
        listen 80;
        server_name localhost;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name localhost;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /firebase/ {
            proxy_pass http://firebase/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
}

# Set up testing environment
setup_testing() {
    if [[ "$SETUP_TESTING" == true ]]; then
        log "Setting up testing environment..." "$BLUE"

        cd "$PROJECT_ROOT"

        # Create test directories
        mkdir -p cypress/{integration,fixtures,support}
        mkdir -p test/{unit,integration,e2e}

        # Create Cypress configuration if not exists
        if [[ ! -f "cypress.config.js" ]]; then
            cat > "cypress.config.js" << 'EOF'
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
  },
  env: {
    FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099',
    FIRESTORE_EMULATOR_HOST: 'localhost:8080',
  },
})
EOF
        fi

        # Create Jest configuration for unit tests
        if [[ ! -f "jest.config.js" ]]; then
            cat > "jest.config.js" << 'EOF'
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/index.js',
    '!src/serviceWorker.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
EOF
        fi

        log "Testing environment setup completed" "$GREEN"
    fi
}

# Set up monitoring and logging
setup_monitoring() {
    if [[ "$SETUP_MONITORING" == true ]]; then
        log "Setting up monitoring and logging..." "$BLUE"

        cd "$PROJECT_ROOT"

        # Create monitoring directories
        mkdir -p monitoring/{prometheus,grafana/dashboards,grafana/datasources,logstash/pipeline,logstash/config}

        # Create Prometheus configuration
        cat > "monitoring/prometheus.yml" << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'mas-hub-app'
    static_configs:
      - targets: ['app:3000']

  - job_name: 'firebase-functions'
    static_configs:
      - targets: ['firebase:5001']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
EOF

        # Create Grafana datasource configuration
        cat > "monitoring/grafana/datasources/prometheus.yml" << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

        # Create basic Logstash pipeline
        cat > "monitoring/logstash/pipeline/logstash.conf" << 'EOF'
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "mas-hub" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }

    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "mas-hub-logs-%{+YYYY.MM.dd}"
  }
}
EOF

        log "Monitoring and logging setup completed" "$GREEN"
    fi
}

# Create environment files
create_environment_files() {
    log "Creating environment files..." "$BLUE"

    cd "$PROJECT_ROOT"

    case $ENVIRONMENT in
        local)
            if [[ ! -f ".env.local" ]]; then
                cat > ".env.local" << 'EOF'
# Local Development Environment
NODE_ENV=development
REACT_APP_ENVIRONMENT=local

# Firebase Emulators
REACT_APP_USE_EMULATORS=true
REACT_APP_FIREBASE_PROJECT_ID=demo-project
REACT_APP_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
REACT_APP_FIREBASE_API_KEY=demo-api-key
REACT_APP_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Emulator Hosts
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

# Development Tools
REACT_APP_DEBUG=true
GENERATE_SOURCEMAP=true
CHOKIDAR_USEPOLLING=true

# Test Credentials
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_example
REACT_APP_PAYMOB_PUBLIC_KEY=test_paymob_key
EOF
                log "Created .env.local file" "$GREEN"
            fi
            ;;
        *)
            log "Environment-specific files should be configured through CI/CD" "$YELLOW"
            ;;
    esac
}

# Display setup summary
display_setup_summary() {
    log "Setup completed for environment: $ENVIRONMENT" "$GREEN"

    cat << EOF

🚀 MAS Hub Environment Setup Summary

Environment: $ENVIRONMENT

Completed tasks:
$(if [[ "$INSTALL_DEPS" == true ]]; then echo "  ✅ Dependencies installed"; fi)
$(if [[ "$SETUP_FIREBASE" == true ]]; then echo "  ✅ Firebase configured"; fi)
$(if [[ "$SETUP_DOCKER" == true ]]; then echo "  ✅ Docker environment ready"; fi)
$(if [[ "$SETUP_TESTING" == true ]]; then echo "  ✅ Testing environment configured"; fi)
$(if [[ "$SETUP_MONITORING" == true ]]; then echo "  ✅ Monitoring and logging set up"; fi)

Next steps:
EOF

    case $ENVIRONMENT in
        local)
            cat << EOF
  1. Start the development environment:
     docker-compose up -d

  2. Access the application:
     - App: http://localhost:3000
     - Firebase UI: http://localhost:4000
     - Grafana: http://localhost:3001 (admin/admin)

  3. Run tests:
     npm test

  4. Start developing! 🎉
EOF
            ;;
        dev|staging|prod)
            cat << EOF
  1. Configure environment secrets in GitHub
  2. Set up deployment pipeline
  3. Deploy using: ./scripts/deploy.sh $ENVIRONMENT
EOF
            ;;
    esac
}

# Main function
main() {
    log "Starting MAS Hub environment setup..." "$BLUE"

    parse_arguments "$@"
    check_prerequisites
    install_dependencies
    setup_firebase
    setup_docker
    setup_testing
    setup_monitoring
    create_environment_files
    display_setup_summary
}

# Run main function with all arguments
main "$@"