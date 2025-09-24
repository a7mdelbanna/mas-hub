# MAS Business OS - Web Application

A comprehensive enterprise management system built with React, TypeScript, and Firebase. This application provides multiple portals for different user types including Admin, Employee, Client, and Candidate portals.

## 🚀 Features

### Core Features
- **Multi-Portal Architecture**: Separate portals for Admin, Employee, Client, and Candidate users
- **Role-Based Access Control (RBAC)**: Fine-grained permissions system
- **Real-time Updates**: Firebase-powered real-time data synchronization
- **Internationalization**: Support for English and Arabic with RTL layout
- **Theme System**: Light/dark mode with custom theming
- **Responsive Design**: Mobile-first design that works on all devices
- **Progressive Web App**: Offline support and app-like experience

### Modules
- **Authentication**: Firebase Auth with custom claims
- **Dashboard**: Role-based dashboards with KPIs and quick actions
- **Projects**: Project management with tasks, timesheets, and budget tracking
- **Finance**: Invoice management, payments, and financial reporting
- **CRM**: Lead and opportunity management
- **Support**: Ticket management with SLA tracking
- **LMS**: Learning management system with courses and assessments
- **HR**: Recruitment and employee onboarding
- **Assets**: Inventory and asset management
- **Settings**: Organization and user management

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling and development
- **Redux Toolkit** with RTK Query for state management
- **React Router v6** for routing with lazy loading
- **Tailwind CSS** for styling
- **React Hook Form** with Zod validation
- **React Query** for server state management
- **i18next** for internationalization
- **Lucide React** for icons

### Backend Integration
- **Firebase Auth** for authentication
- **Firestore** for database
- **Firebase Storage** for file storage
- **Firebase Functions** for serverless API
- **Firebase Hosting** for deployment

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Authentication, Firestore, and Storage enabled

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=mashub-a0725
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

The application will open in your browser at `http://localhost:3000`.

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run type-check` - Run TypeScript type checking

### Building
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Testing
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage report

### Linting
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix

## 🌐 Portal Types

### Admin Portal (`/admin`)
- **Access**: Admin and Super Admin roles
- **Features**: Full system management, user administration, settings
- **Navigation**: All modules with advanced configuration options

### Employee Portal (`/employee`)
- **Access**: Employee, Manager, Admin roles
- **Features**: Task management, timesheet, training, payroll
- **Navigation**: Work-focused modules with personal productivity tools

### Client Portal (`/client`)
- **Access**: Client users with portal access
- **Features**: Project tracking, invoices, support tickets, training
- **Navigation**: Client-focused views with customizable branding

### Candidate Portal (`/candidate`)
- **Access**: Candidate users during recruitment process
- **Features**: Application tracking, pre-hire training, assessments
- **Navigation**: Recruitment-focused modules with progress tracking

## 🔐 Authentication & Authorization

### Authentication Flow
1. User logs in with email/password via Firebase Auth
2. Custom claims are added to the JWT token with roles and permissions
3. Client-side auth state is managed with Redux
4. Protected routes check authentication and authorization

### Role-Based Access Control
- **Roles**: Admin, Manager, Employee, Client, Candidate
- **Permissions**: Fine-grained permissions for each resource and action
- **Scoping**: Permissions can be scoped to 'own', 'department', or 'all'

## 🎨 Theming & Customization

### Theme System
- **Light/Dark Mode**: System preference detection with manual override
- **Custom Theming**: Client portal supports custom branding
- **CSS Variables**: Consistent theming through CSS custom properties

### Responsive Design
- **Mobile First**: Designed for mobile with progressive enhancement
- **Breakpoints**: xs (480px), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Adaptive Navigation**: Hamburger menu on mobile, sidebar on desktop

## 🌍 Internationalization

### Supported Languages
- **English**: Default language with LTR layout
- **Arabic**: Full RTL support with proper font loading
- **Russian**: Planned for Phase 3

### RTL Support
- Automatic layout mirroring for Arabic
- RTL-aware component styling
- Proper text direction handling

## 📦 Deployment

### Build Process
1. **Type Checking**: Ensure TypeScript types are correct
2. **Linting**: Check code quality with ESLint
3. **Testing**: Run test suite
4. **Building**: Create optimized production build

### Performance Optimization
- **Code Splitting**: Route-based and manual chunks
- **Tree Shaking**: Remove unused code
- **Minification**: Compress JavaScript and CSS

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ |
| `VITE_API_BASE_URL` | API base URL | ✅ |

## 🤝 Contributing

1. Create feature branch from `develop`
2. Implement feature with tests
3. Run linting and tests
4. Submit pull request

---

Built with ❤️ by the MAS Development Team
