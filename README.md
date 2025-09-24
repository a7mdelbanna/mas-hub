# MAS Business OS

Enterprise management system for MAS operations including Projects, Finance, CRM, HR, Support, and more.

## 🚀 Overview

MAS Business OS is an all-in-one enterprise platform that centralizes:
- Project Management & Delivery
- Finance & Billing
- CRM & Sales Pipeline
- HR & Recruitment
- Support & SLA Management
- Learning Management System (LMS)
- Multi-Portal System (Employee, Client, Candidate)
- Automation & Workflows

## 📋 Documentation

- [Product Requirements Document (PRD)](./docs/PRD.md)
- [Technical Architecture](./docs/architecture.md)
- [API Specification](./docs/api-spec.md)
- [Design System](./docs/design-system.md)
- [Firestore Schema](./docs/firestore-schema.md)

## 🏗️ Project Structure

```
/
├── docs/                    # Documentation
├── design-system/           # Design tokens and UI specifications
├── src/
│   ├── types/              # TypeScript type definitions
│   ├── lib/                # Shared libraries
│   └── modules/            # Feature modules
├── functions/              # Firebase Cloud Functions
├── orchestration/          # Build pipeline orchestration
└── setup/                  # Setup and scaffolding scripts
```

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Firebase (Firestore, Auth, Functions, Storage)
- **Payments**: Stripe & Paymob integration
- **Real-time**: Firestore listeners + Cloud Messaging
- **Deployment**: Firebase Hosting + Cloud Functions

## 📊 Implementation Status

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1 (MVP) | In Development | 33% |
| Phase 2 | Planned | 0% |
| Phase 3 | Planned | 0% |

### Completed Modules
- ✅ Product Requirements Document
- ✅ System Architecture
- ✅ Design System
- ✅ Firestore Schema

### In Progress
- 🚧 Frontend Application
- 🚧 Business Rules Engine
- 🚧 Backend Services

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Firebase CLI
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/a7mdelbanna/mas-hub.git
cd mas-hub
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up Firebase:
```bash
firebase login
firebase use mashub-a0725
```

4. Copy environment variables:
```bash
cp .env.example .env
# Edit .env with your Firebase config
```

5. Run the development server:
```bash
npm run dev
```

## 🔧 Development

### Orchestration Pipeline

The project uses an orchestration system to manage the development pipeline:

```bash
cd orchestration
pnpm orchestrator status  # Check pipeline status
pnpm orchestrator next    # See next available tasks
pnpm orchestrator run <task>  # Run a specific task
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run deploy` - Deploy to Firebase

## 📝 License

Private - All rights reserved

## 👥 Team

MAS Development Team

---

Built with Firebase and React