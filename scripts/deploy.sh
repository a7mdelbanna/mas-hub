#!/bin/bash

# MAS Hub Deployment Script
# Usage: ./scripts/deploy.sh <environment> [options]

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${2:-$NC}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1" "$RED"
    exit 1
}

# Show usage
show_usage() {
    cat << EOF
Usage: $0 <environment> [options]

Environments:
  dev         Deploy to development environment
  staging     Deploy to staging environment
  prod        Deploy to production environment

Options:
  --skip-tests        Skip running tests before deployment
  --skip-build        Skip building the application
  --functions-only    Deploy only Firebase functions
  --frontend-only     Deploy only frontend application
  --dry-run          Show what would be deployed without executing
  --rollback         Rollback to previous deployment
  --version VERSION  Deploy specific version (prod only)
  --help             Show this help message

Environment Variables:
  FIREBASE_TOKEN      Firebase authentication token
  SKIP_CONFIRMATION   Skip confirmation prompts (CI mode)

Examples:
  $0 dev
  $0 staging --skip-tests
  $0 prod --version v1.2.3
  $0 prod --rollback
EOF
}

# Parse command line arguments
parse_arguments() {
    ENVIRONMENT=""
    SKIP_TESTS=false
    SKIP_BUILD=false
    FUNCTIONS_ONLY=false
    FRONTEND_ONLY=false
    DRY_RUN=false
    ROLLBACK=false
    VERSION=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            dev|staging|prod)
                ENVIRONMENT="$1"
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --functions-only)
                FUNCTIONS_ONLY=true
                shift
                ;;
            --frontend-only)
                FRONTEND_ONLY=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --rollback)
                ROLLBACK=true
                shift
                ;;
            --version)
                VERSION="$2"
                shift 2
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
}

# Set environment-specific variables
set_environment_config() {
    case $ENVIRONMENT in
        dev)
            FIREBASE_PROJECT_ID="mashub-dev-a0725"
            TARGET_URL="https://mashub-dev-a0725.web.app"
            FUNCTIONS_URL="https://us-central1-mashub-dev-a0725.cloudfunctions.net"
            ;;
        staging)
            FIREBASE_PROJECT_ID="mashub-staging-a0725"
            TARGET_URL="https://mashub-staging-a0725.web.app"
            FUNCTIONS_URL="https://us-central1-mashub-staging-a0725.cloudfunctions.net"
            ;;
        prod)
            FIREBASE_PROJECT_ID="mashub-a0725"
            TARGET_URL="https://mashub-a0725.web.app"
            FUNCTIONS_URL="https://us-central1-mashub-a0725.cloudfunctions.net"
            ;;
        *)
            error_exit "Invalid environment: $ENVIRONMENT"
            ;;
    esac

    log "Environment: $ENVIRONMENT" "$BLUE"
    log "Firebase Project: $FIREBASE_PROJECT_ID" "$BLUE"
    log "Target URL: $TARGET_URL" "$BLUE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..." "$BLUE"

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error_exit "Node.js is not installed"
    fi

    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        error_exit "Firebase CLI is not installed. Run: npm install -g firebase-tools"
    fi

    # Check if authenticated with Firebase
    if [[ -z "$FIREBASE_TOKEN" ]] && ! firebase projects:list &> /dev/null; then
        error_exit "Not authenticated with Firebase. Run: firebase login"
    fi

    # Check if in correct directory
    if [[ ! -f "$PROJECT_ROOT/firebase.json" ]]; then
        error_exit "Not in a Firebase project directory"
    fi

    log "Prerequisites check passed" "$GREEN"
}

# Backup current deployment (production only)
backup_deployment() {
    if [[ "$ENVIRONMENT" == "prod" && "$ROLLBACK" == false ]]; then
        log "Creating backup of current deployment..." "$BLUE"

        BACKUP_DIR="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"

        # Backup Firestore
        if [[ "$DRY_RUN" == false ]]; then
            firebase firestore:export "$BACKUP_DIR/firestore" --project="$FIREBASE_PROJECT_ID" || log "Firestore backup failed" "$YELLOW"
        fi

        log "Backup created: $BACKUP_DIR" "$GREEN"
    fi
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == false ]]; then
        log "Running tests..." "$BLUE"

        cd "$PROJECT_ROOT"

        # Run frontend tests
        if [[ "$FUNCTIONS_ONLY" == false ]]; then
            log "Running frontend tests..." "$BLUE"
            npm run test:ci || error_exit "Frontend tests failed"
        fi

        # Run functions tests
        if [[ "$FRONTEND_ONLY" == false ]]; then
            log "Running functions tests..." "$BLUE"
            cd functions
            npm run test:ci || error_exit "Functions tests failed"
            cd ..
        fi

        log "All tests passed" "$GREEN"
    else
        log "Skipping tests (--skip-tests flag)" "$YELLOW"
    fi
}

# Build application
build_application() {
    if [[ "$SKIP_BUILD" == false ]]; then
        log "Building application..." "$BLUE"

        cd "$PROJECT_ROOT"

        # Install dependencies
        log "Installing dependencies..." "$BLUE"
        npm ci

        # Build frontend
        if [[ "$FUNCTIONS_ONLY" == false ]]; then
            log "Building frontend..." "$BLUE"

            # Set environment variables based on deployment target
            export REACT_APP_FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID"
            export REACT_APP_ENVIRONMENT="$ENVIRONMENT"

            npm run build || error_exit "Frontend build failed"
        fi

        # Build functions
        if [[ "$FRONTEND_ONLY" == false ]]; then
            log "Building functions..." "$BLUE"
            cd functions
            npm ci
            npm run build || error_exit "Functions build failed"
            cd ..
        fi

        log "Build completed successfully" "$GREEN"
    else
        log "Skipping build (--skip-build flag)" "$YELLOW"
    fi
}

# Deploy to Firebase
deploy_firebase() {
    log "Deploying to Firebase..." "$BLUE"

    cd "$PROJECT_ROOT"

    if [[ "$DRY_RUN" == true ]]; then
        log "DRY RUN: Would deploy the following targets:" "$YELLOW"
        if [[ "$FRONTEND_ONLY" == true ]]; then
            log "- Firebase Hosting" "$YELLOW"
        elif [[ "$FUNCTIONS_ONLY" == true ]]; then
            log "- Firebase Functions" "$YELLOW"
        else
            log "- Firebase Hosting" "$YELLOW"
            log "- Firebase Functions" "$YELLOW"
            log "- Firestore Rules" "$YELLOW"
            log "- Firestore Indexes" "$YELLOW"
            log "- Storage Rules" "$YELLOW"
        fi
        return 0
    fi

    # Handle rollback
    if [[ "$ROLLBACK" == true ]]; then
        log "Rolling back deployment..." "$YELLOW"
        firebase hosting:channel:deploy live --project="$FIREBASE_PROJECT_ID" --last-successful
        return $?
    fi

    # Determine deployment targets
    DEPLOY_TARGETS=""
    if [[ "$FRONTEND_ONLY" == true ]]; then
        DEPLOY_TARGETS="hosting"
    elif [[ "$FUNCTIONS_ONLY" == true ]]; then
        DEPLOY_TARGETS="functions"
    else
        DEPLOY_TARGETS="hosting,functions,firestore:rules,firestore:indexes,storage"
    fi

    # Set Firebase project
    firebase use "$FIREBASE_PROJECT_ID" || error_exit "Failed to set Firebase project"

    # Deploy with message
    DEPLOY_MESSAGE="Deploy $ENVIRONMENT $(date +'%Y-%m-%d %H:%M:%S')"
    if [[ -n "$VERSION" ]]; then
        DEPLOY_MESSAGE="Deploy $VERSION to $ENVIRONMENT"
    fi

    # Execute deployment
    if [[ -n "$FIREBASE_TOKEN" ]]; then
        FIREBASE_TOKEN="$FIREBASE_TOKEN" firebase deploy --only="$DEPLOY_TARGETS" --message="$DEPLOY_MESSAGE" || error_exit "Deployment failed"
    else
        firebase deploy --only="$DEPLOY_TARGETS" --message="$DEPLOY_MESSAGE" || error_exit "Deployment failed"
    fi

    log "Deployment completed successfully" "$GREEN"
}

# Run post-deployment tests
run_post_deployment_tests() {
    log "Running post-deployment tests..." "$BLUE"

    # Health check
    log "Performing health check..." "$BLUE"

    # Check frontend
    if [[ "$FUNCTIONS_ONLY" == false ]]; then
        if curl -f -s "$TARGET_URL" > /dev/null; then
            log "Frontend health check passed" "$GREEN"
        else
            error_exit "Frontend health check failed"
        fi
    fi

    # Check functions
    if [[ "$FRONTEND_ONLY" == false ]]; then
        if curl -f -s "$FUNCTIONS_URL/api/health" > /dev/null; then
            log "Functions health check passed" "$GREEN"
        else
            error_exit "Functions health check failed"
        fi
    fi

    # Run smoke tests if available
    if [[ -f "$PROJECT_ROOT/package.json" ]] && npm run | grep -q "test:smoke"; then
        log "Running smoke tests..." "$BLUE"
        npm run test:smoke -- --baseUrl="$TARGET_URL" || log "Smoke tests failed" "$YELLOW"
    fi

    log "Post-deployment tests completed" "$GREEN"
}

# Confirm deployment (for production)
confirm_deployment() {
    if [[ "$ENVIRONMENT" == "prod" && "$SKIP_CONFIRMATION" != "true" ]]; then
        log "Production deployment confirmation required" "$YELLOW"
        read -p "Are you sure you want to deploy to PRODUCTION? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log "Deployment cancelled by user" "$YELLOW"
            exit 0
        fi
    fi
}

# Update deployment record
update_deployment_record() {
    log "Updating deployment record..." "$BLUE"

    DEPLOYMENT_RECORD="$PROJECT_ROOT/deployment-history.json"
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Create record if it doesn't exist
    if [[ ! -f "$DEPLOYMENT_RECORD" ]]; then
        echo "[]" > "$DEPLOYMENT_RECORD"
    fi

    # Add deployment entry
    TEMP_FILE=$(mktemp)
    jq ". += [{
        \"timestamp\": \"$TIMESTAMP\",
        \"environment\": \"$ENVIRONMENT\",
        \"version\": \"${VERSION:-unknown}\",
        \"commit\": \"$(git rev-parse HEAD 2>/dev/null || echo 'unknown')\",
        \"deployer\": \"$(whoami)\",
        \"targets\": \"${DEPLOY_TARGETS:-all}\"
    }]" "$DEPLOYMENT_RECORD" > "$TEMP_FILE" && mv "$TEMP_FILE" "$DEPLOYMENT_RECORD"

    log "Deployment record updated" "$GREEN"
}

# Main deployment function
main() {
    log "Starting MAS Hub deployment process..." "$BLUE"

    parse_arguments "$@"
    set_environment_config
    check_prerequisites
    confirm_deployment
    backup_deployment
    run_tests
    build_application
    deploy_firebase
    run_post_deployment_tests
    update_deployment_record

    log "Deployment completed successfully!" "$GREEN"
    log "Application URL: $TARGET_URL" "$GREEN"

    if [[ "$ENVIRONMENT" == "prod" ]]; then
        log "🎉 Production deployment completed!" "$GREEN"
    fi
}

# Run main function with all arguments
main "$@"