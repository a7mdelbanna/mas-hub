# MAS Business OS - Frontend UI

Enterprise management system UI for MAS operations including Projects, Finance, CRM, HR, Support, and more.

## 🚀 Overview

MAS Business OS is a **frontend-only** showcase application demonstrating a comprehensive enterprise platform UI that includes:
- Project Management & Delivery interfaces
- Finance & Billing dashboards
- CRM & Sales Pipeline views
- HR & Recruitment screens
- Support & SLA Management panels
- Learning Management System (LMS) UI
- Multi-Portal System (Employee, Client, Candidate)
- Modern, responsive design with dark mode support

**Note: This is a frontend-only project with mock data services. No backend or database is required.**

## 📋 Documentation

- [Product Requirements Document (PRD)](./docs/PRD.md)
- [Technical Architecture](./docs/architecture.md)
- [Design System](./docs/design-system.md)
- [UI Components Guide](./docs/components.md)

## 🏗️ Project Structure

```
/
├── apps/web/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── modules/        # Feature modules
│   │   ├── services/mock/  # Mock data services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Redux store
│   │   └── types/          # TypeScript definitions
│   └── public/             # Static assets
├── docs/                   # Documentation
└── design-system/          # Design tokens and specifications
```

## 🛠️ Technology Stack

- **Framework**: React 19 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router v7
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query
- **Internationalization**: i18next
- **Icons**: Lucide React
- **Charts**: Recharts
- **Testing**: Vitest
- **Build Tool**: Vite

## 📊 Features

### Completed UI Modules
- ✅ Multi-portal authentication screens
- ✅ Admin dashboard with analytics
- ✅ User management interface
- ✅ Organization settings
- ✅ Theme customization
- ✅ Project management views
- ✅ Finance & billing dashboards
- ✅ CRM pipeline interface
- ✅ Support ticket system
- ✅ Dark mode support
- ✅ Responsive mobile design

### Mock Services
- 🔧 Authentication (accepts any credentials)
- 🔧 User management with CRUD operations
- 🔧 Organization switching
- 🔧 Sample data for all modules

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/a7mdelbanna/mas-hub.git
cd mas-hub
```

2. Navigate to the web application:
```bash
cd apps/web
```

3. Install dependencies:
```bash
npm install
# or
pnpm install
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Access
The application runs with mock authentication. Use any email/password combination to log in:
- Example: `admin@mashub.com` / `any-password`

## 🔧 Development

### Available Scripts

From the `apps/web` directory:

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Mock Data Customization

All mock data is located in `/apps/web/src/services/mock/`. You can modify these files to:
- Add new mock users
- Change organization settings
- Customize demo data
- Adjust mock API responses

### UI Customization

The application uses Tailwind CSS for styling. Key customization points:
- `/apps/web/tailwind.config.js` - Tailwind configuration
- `/apps/web/src/styles/globals.css` - Global styles
- Theme settings are persisted in localStorage

## 🎨 Design System

The application includes a comprehensive design system with:
- Consistent color palette
- Typography scale
- Spacing system
- Component library
- Dark mode variants
- Responsive breakpoints

## 📝 License

Private - All rights reserved

## 👥 Team

MAS Development Team

---

Built with React, TypeScript, and Tailwind CSS - Frontend UI Only