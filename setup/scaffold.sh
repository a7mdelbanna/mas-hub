#!/bin/bash

# MAS Business OS - Project Scaffolding Script
# This script sets up the complete project structure for the MAS Business OS

set -e  # Exit on error

echo "🚀 MAS Business OS - Project Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi

    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        print_info "Firebase CLI not found. Installing..."
        npm install -g firebase-tools
    fi

    print_step "Prerequisites checked"
}

# Initialize React Application
init_react_app() {
    print_info "Initializing React application with TypeScript..."

    if [ ! -d "client" ]; then
        npx create-react-app client --template typescript
        print_step "React app created"
    else
        print_info "React app already exists"
    fi

    cd client

    # Install core dependencies
    print_info "Installing core dependencies..."
    npm install \
        @reduxjs/toolkit \
        react-redux \
        react-router-dom \
        @mui/material \
        @mui/icons-material \
        @mui/x-data-grid-pro \
        @emotion/react \
        @emotion/styled \
        firebase \
        react-hook-form \
        yup \
        @hookform/resolvers \
        recharts \
        axios \
        date-fns \
        react-intl \
        workbox-webpack-plugin

    # Install dev dependencies
    print_info "Installing dev dependencies..."
    npm install -D \
        @types/react-redux \
        @types/react-router-dom \
        eslint \
        prettier \
        husky \
        lint-staged \
        @testing-library/react \
        @testing-library/jest-dom \
        @testing-library/user-event

    print_step "Dependencies installed"
    cd ..
}

# Create directory structure
create_directory_structure() {
    print_info "Creating directory structure..."

    # Client directories
    mkdir -p client/src/{modules,components,services,hooks,utils,types,store,styles,assets,config}

    # Module subdirectories
    modules=(
        "settings"
        "identity"
        "projects"
        "finance"
        "crm"
        "support"
        "lms"
        "hr"
        "assets"
        "portals"
        "automations"
    )

    for module in "${modules[@]}"; do
        mkdir -p client/src/modules/$module/{components,services,hooks,types,store}
    done

    # Shared components
    mkdir -p client/src/components/{common,layout,forms,charts,tables}

    # Functions directories
    mkdir -p functions/src/{api,triggers,utils,types,config}

    # API subdirectories
    mkdir -p functions/src/api/{auth,projects,finance,crm,support,lms,hr,assets,portals,automations,webhooks}

    # Root directories
    mkdir -p {docs,scripts,config,tests}

    print_step "Directory structure created"
}

# Initialize Firebase
init_firebase() {
    print_info "Initializing Firebase..."

    if [ ! -f "firebase.json" ]; then
        # Create firebase.json
        cat > firebase.json << 'EOF'
{
  "hosting": {
    "public": "client/build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|map)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=86400"
          }
        ]
      }
    ]
  },
  "functions": {
    "runtime": "nodejs18",
    "source": "functions",
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"],
    "ignore": ["node_modules", ".git", "**/*.log"]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
EOF
        print_step "firebase.json created"
    fi

    # Create Firestore rules
    if [ ! -f "firestore.rules" ]; then
        cat > firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function hasRole(role) {
      return request.auth.token.roles[role] == true;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Default deny all, then allow specific paths
    match /{document=**} {
      allow read, write: if false;
    }

    // Users can read their own profile
    match /users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow write: if hasRole('admin');
    }

    // Project access
    match /projects/{projectId} {
      allow read: if isAuthenticated();
      allow write: if hasRole('project_manager') || hasRole('admin');
    }
  }
}
EOF
        print_step "firestore.rules created"
    fi

    # Create Firestore indexes
    if [ ! -f "firestore.indexes.json" ]; then
        cat > firestore.indexes.json << 'EOF'
{
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "priority", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "invoices",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "dueDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "tickets",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "priority", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
EOF
        print_step "firestore.indexes.json created"
    fi

    # Create Storage rules
    if [ ! -f "storage.rules" ]; then
        cat > storage.rules << 'EOF'
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function hasRole(role) {
      return request.auth.token.roles[role] == true;
    }

    // User profile images
    match /users/{userId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId;
    }

    // Project files
    match /projects/{projectId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if hasRole('project_manager') || hasRole('admin');
    }

    // Public assets
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if hasRole('admin');
    }
  }
}
EOF
        print_step "storage.rules created"
    fi
}

# Initialize Cloud Functions
init_functions() {
    print_info "Initializing Cloud Functions..."

    if [ ! -d "functions" ]; then
        mkdir functions
    fi

    cd functions

    # Initialize package.json if not exists
    if [ ! -f "package.json" ]; then
        npm init -y
        npm install firebase-functions firebase-admin express cors
        npm install -D typescript @types/node @types/express @types/cors eslint

        # Create tsconfig.json
        cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "outDir": "lib",
    "sourceMap": true,
    "strict": true,
    "target": "es2017",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "compileOnSave": true,
  "include": ["src"]
}
EOF

        # Update package.json scripts
        npm pkg set scripts.build="tsc"
        npm pkg set scripts.watch="tsc --watch"
        npm pkg set scripts.serve="npm run build && firebase emulators:start --only functions"
        npm pkg set scripts.shell="npm run build && firebase functions:shell"
        npm pkg set scripts.start="npm run shell"
        npm pkg set scripts.deploy="firebase deploy --only functions"
        npm pkg set scripts.logs="firebase functions:log"

        print_step "Cloud Functions initialized"
    fi

    cd ..
}

# Create initial configuration files
create_config_files() {
    print_info "Creating configuration files..."

    # Create .env.example
    cat > .env.example << 'EOF'
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id

# API Configuration
REACT_APP_API_URL=http://localhost:5001/your-project-id/us-central1/api
REACT_APP_FUNCTIONS_REGION=us-central1

# Stripe Configuration
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx

# Paymob Configuration
REACT_APP_PAYMOB_PUBLIC_KEY=your-paymob-key
REACT_APP_PAYMOB_IFRAME_ID=your-iframe-id

# Feature Flags
REACT_APP_ENABLE_DEBUG=true
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_OFFLINE=true

# Environment
REACT_APP_ENV=development
EOF

    # Create .gitignore if not exists
    if [ ! -f ".gitignore" ]; then
        cat > .gitignore << 'EOF'
# Dependencies
node_modules/
client/node_modules/
functions/node_modules/
functions/lib/

# Production builds
client/build/
functions/lib/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.env

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log
storage-debug.log
pubsub-debug.log

# IDE
.idea/
.vscode/
*.swp
*.swo
.DS_Store

# Testing
coverage/
*.lcov

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Misc
*.pem
*.key
*.cert
EOF
        print_step ".gitignore created"
    fi

    # Create README
    if [ ! -f "README.md" ]; then
        cat > README.md << 'EOF'
# MAS Business OS

Comprehensive enterprise management system for MAS operations.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install
   cd ../functions && npm install
   ```

2. **Configure Firebase:**
   ```bash
   firebase login
   firebase use --add
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers:**
   ```bash
   # Terminal 1: Start Firebase emulators
   firebase emulators:start

   # Terminal 2: Start React app
   cd client && npm start
   ```

## Project Structure

```
.
├── client/              # React frontend application
│   ├── src/
│   │   ├── modules/    # Feature modules
│   │   ├── components/ # Shared components
│   │   ├── services/   # API services
│   │   ├── hooks/      # Custom hooks
│   │   ├── store/      # Redux store
│   │   └── utils/      # Utility functions
│   └── public/
├── functions/          # Firebase Cloud Functions
│   └── src/
│       ├── api/       # API endpoints
│       ├── triggers/  # Firestore triggers
│       └── utils/     # Utility functions
├── docs/              # Documentation
├── scripts/           # Build and deployment scripts
└── tests/            # E2E tests
```

## Available Scripts

- `npm start` - Start development servers
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Firebase

## Documentation

- [Architecture](./docs/architecture.md)
- [API Specification](./docs/api-spec.md)
- [PRD](./docs/PRD.md)

## License

Proprietary - MAS Business Solutions
EOF
        print_step "README.md created"
    fi
}

# Create initial source files
create_initial_files() {
    print_info "Creating initial source files..."

    # Create main App component
    cat > client/src/App.tsx << 'EOF'
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import { theme } from './styles/theme';
import { AppRouter } from './router';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
EOF

    # Create Redux store
    cat > client/src/store/index.ts << 'EOF'
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
  reducer: {
    // Add reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Firebase Timestamp objects
        ignoredActions: ['firestore/update'],
        ignoredPaths: ['firestore'],
      },
    }),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
EOF

    # Create theme file
    mkdir -p client/src/styles
    cat > client/src/styles/theme.ts << 'EOF'
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});
EOF

    # Create router file
    cat > client/src/router.tsx << 'EOF'
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<div>MAS Business OS</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
EOF

    # Create Firebase configuration
    cat > client/src/config/firebase.ts << 'EOF'
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, process.env.REACT_APP_FUNCTIONS_REGION);
export const storage = getStorage(app);
export const analytics = process.env.REACT_APP_ENABLE_ANALYTICS === 'true'
  ? getAnalytics(app)
  : null;

export default app;
EOF

    # Create main Cloud Functions index
    cat > functions/src/index.ts << 'EOF'
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Export API function
export const api = functions.https.onRequest(app);

// Export other functions
export { auth } from './api/auth';
export { projects } from './api/projects';
export { finance } from './api/finance';
EOF

    print_step "Initial source files created"
}

# Create package.json scripts
create_npm_scripts() {
    print_info "Creating npm scripts..."

    # Root package.json
    cat > package.json << 'EOF'
{
  "name": "mas-business-os",
  "version": "1.0.0",
  "description": "MAS Business Operating System",
  "private": true,
  "scripts": {
    "start": "concurrently \"npm run emulators\" \"npm run client\"",
    "client": "cd client && npm start",
    "functions": "cd functions && npm run serve",
    "emulators": "firebase emulators:start",
    "build": "npm run build:client && npm run build:functions",
    "build:client": "cd client && npm run build",
    "build:functions": "cd functions && npm run build",
    "test": "npm run test:client && npm run test:functions",
    "test:client": "cd client && npm test",
    "test:functions": "cd functions && npm test",
    "deploy": "npm run build && firebase deploy",
    "deploy:hosting": "npm run build:client && firebase deploy --only hosting",
    "deploy:functions": "npm run build:functions && firebase deploy --only functions",
    "deploy:rules": "firebase deploy --only firestore:rules,storage:rules"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
EOF

    npm install

    print_step "npm scripts created"
}

# Main execution
main() {
    echo ""
    print_info "Starting MAS Business OS setup..."
    echo ""

    check_prerequisites
    init_react_app
    create_directory_structure
    init_firebase
    init_functions
    create_config_files
    create_initial_files
    create_npm_scripts

    echo ""
    echo "=================================="
    print_step "Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Configure Firebase project:"
    echo "   firebase login"
    echo "   firebase use --add"
    echo ""
    echo "2. Copy .env.example to .env and add your configuration:"
    echo "   cp .env.example .env"
    echo ""
    echo "3. Start development servers:"
    echo "   npm start"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main