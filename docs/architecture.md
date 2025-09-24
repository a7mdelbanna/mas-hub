# MAS Business OS - Technical Architecture Document

## Executive Summary

This document outlines the technical architecture for the MAS Business OS, a comprehensive enterprise platform built on React and Firebase. The architecture follows a microservices approach with clear module boundaries, event-driven communication, and a Firebase-first strategy. The system is designed to support multi-tenant portals, real-time data synchronization, and extensive automation capabilities as specified in the PRD.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├───────────┬───────────┬───────────┬───────────┬─────────────────┤
│ Admin App │ Employee  │  Client   │ Candidate │   Mobile Apps   │
│  (React)  │  Portal   │  Portal   │  Portal   │  (React Native) │
└─────┬─────┴─────┬─────┴─────┬─────┴─────┬─────┴────────┬────────┘
      │           │           │           │              │
      └───────────┴───────────┴───────────┴──────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   API Gateway       │
                    │  (Firebase Auth +   │
                    │   Cloud Functions)  │
                    └─────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌───────▼────────┐   ┌───────▼────────┐
│  Firestore DB  │   │ Cloud Functions│   │ Firebase Storage│
│  (Real-time)   │   │  (Business     │   │   (Files/Docs)  │
│                │   │   Logic)       │   │                 │
└────────────────┘   └───────┬────────┘   └─────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Event Bus         │
                    │ (Pub/Sub + FCM)    │
                    └─────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌───────▼────────┐   ┌───────▼────────┐
│   Stripe API   │   │  Paymob API    │   │  Slack/Email   │
│                │   │                │   │  Notifications  │
└────────────────┘   └────────────────┘   └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **UI Library**: Material-UI (MUI) v5
- **Forms**: React Hook Form + Yup validation
- **Real-time**: Firebase Realtime listeners
- **Routing**: React Router v6
- **Charts**: Recharts
- **Tables**: MUI DataGrid Pro
- **PWA**: Workbox for offline support

#### Backend
- **Authentication**: Firebase Auth with custom claims
- **Database**: Firestore (NoSQL)
- **Functions**: Firebase Cloud Functions (Node.js 18)
- **Storage**: Firebase Storage
- **Messaging**: Firebase Cloud Messaging (FCM)
- **Event Bus**: Google Cloud Pub/Sub
- **Queue**: Cloud Tasks for async operations
- **Cache**: Firestore with TTL documents

#### Infrastructure
- **Hosting**: Firebase Hosting (CDN)
- **Environments**: Development, Staging, Production
- **CI/CD**: GitHub Actions
- **Monitoring**: Google Cloud Monitoring + Sentry
- **Analytics**: Google Analytics 4 + Mixpanel
- **Logging**: Google Cloud Logging

## Module Boundaries

### Core Modules

#### 1. Settings Module (`/src/modules/settings`)
**Responsibility**: System configuration and administration
**Public Interface**:
```typescript
interface ISettingsModule {
  getOrganizationSettings(): Promise<OrgSettings>
  updateOrganizationSettings(settings: Partial<OrgSettings>): Promise<void>
  getProjectTypes(): Promise<ProjectType[]>
  createProjectTemplate(template: ProjectTemplate): Promise<string>
  getCustomFields(entity: EntityType): Promise<CustomField[]>
}
```
**Dependencies**: None (Core module)
**Events Published**:
- `settings.updated`
- `template.created`

#### 2. Identity & Access Module (`/src/modules/identity`)
**Responsibility**: Authentication, authorization, and user management
**Public Interface**:
```typescript
interface IIdentityModule {
  authenticateUser(credentials: Credentials): Promise<AuthToken>
  createUser(user: UserProfile, roles: string[]): Promise<string>
  checkPermission(userId: string, resource: string, action: string): Promise<boolean>
  getDepartments(): Promise<Department[]>
  assignUserToDepartment(userId: string, deptId: string): Promise<void>
}
```
**Dependencies**: Settings
**Events Published**:
- `user.created`
- `user.authenticated`
- `role.assigned`

#### 3. Projects Module (`/src/modules/projects`)
**Responsibility**: Project lifecycle management
**Public Interface**:
```typescript
interface IProjectsModule {
  createProject(data: ProjectData): Promise<Project>
  updateProjectPhase(projectId: string, phaseId: string, data: PhaseUpdate): Promise<void>
  createTask(task: TaskData): Promise<Task>
  logTimesheet(entry: TimesheetEntry): Promise<void>
  getProjectBudgetStatus(projectId: string): Promise<BudgetStatus>
}
```
**Dependencies**: Identity, Settings, Finance
**Events Published**:
- `project.created`
- `phase.completed`
- `task.assigned`
- `timesheet.submitted`
- `budget.threshold.reached`

#### 4. Finance Module (`/src/modules/finance`)
**Responsibility**: Financial operations and billing
**Public Interface**:
```typescript
interface IFinanceModule {
  createInvoice(data: InvoiceData): Promise<Invoice>
  processPayment(payment: PaymentData): Promise<PaymentResult>
  createContract(contract: ContractData): Promise<Contract>
  runPayroll(period: PayrollPeriod): Promise<PayrollResult>
  getFinancialReports(filters: ReportFilters): Promise<FinancialReport>
}
```
**Dependencies**: Identity, Projects, CRM
**Events Published**:
- `invoice.created`
- `invoice.paid`
- `contract.signed`
- `payroll.processed`
- `payment.received`

#### 5. CRM Module (`/src/modules/crm`)
**Responsibility**: Sales and customer relationship management
**Public Interface**:
```typescript
interface ICRMModule {
  createLead(lead: LeadData): Promise<Lead>
  createOpportunity(opp: OpportunityData): Promise<Opportunity>
  moveOpportunityStage(oppId: string, stage: string): Promise<void>
  createQuote(quote: QuoteData): Promise<Quote>
  convertDealToProject(dealId: string): Promise<Project>
}
```
**Dependencies**: Identity, Finance, Projects
**Events Published**:
- `lead.created`
- `opportunity.won`
- `quote.sent`
- `deal.converted`

#### 6. Support Module (`/src/modules/support`)
**Responsibility**: IT support and ticketing
**Public Interface**:
```typescript
interface ISupportModule {
  createTicket(ticket: TicketData): Promise<Ticket>
  scheduleVisit(visit: VisitData): Promise<Visit>
  updateTicketStatus(ticketId: string, status: TicketStatus): Promise<void>
  getSLAStatus(ticketId: string): Promise<SLAStatus>
}
```
**Dependencies**: Identity, CRM, Assets
**Events Published**:
- `ticket.created`
- `ticket.resolved`
- `sla.breached`
- `visit.scheduled`

#### 7. LMS Module (`/src/modules/lms`)
**Responsibility**: Training and learning management
**Public Interface**:
```typescript
interface ILMSModule {
  createCourse(course: CourseData): Promise<Course>
  assignCourse(assignment: CourseAssignment): Promise<void>
  trackProgress(userId: string, courseId: string, progress: number): Promise<void>
  submitQuiz(submission: QuizSubmission): Promise<QuizResult>
  generateCertificate(userId: string, courseId: string): Promise<Certificate>
}
```
**Dependencies**: Identity, HR
**Events Published**:
- `course.assigned`
- `course.completed`
- `quiz.passed`
- `certificate.issued`

#### 8. HR Module (`/src/modules/hr`)
**Responsibility**: Human resources and recruitment
**Public Interface**:
```typescript
interface IHRModule {
  createCandidate(candidate: CandidateData): Promise<Candidate>
  scheduleInterview(interview: InterviewData): Promise<Interview>
  convertCandidateToEmployee(candidateId: string): Promise<Employee>
  startOnboarding(employeeId: string, templateId: string): Promise<OnboardingPlan>
}
```
**Dependencies**: Identity, LMS
**Events Published**:
- `candidate.created`
- `interview.scheduled`
- `candidate.hired`
- `onboarding.started`

#### 9. Assets Module (`/src/modules/assets`)
**Responsibility**: Inventory and asset management
**Public Interface**:
```typescript
interface IAssetsModule {
  addInventory(item: InventoryItem): Promise<void>
  installAsset(asset: AssetInstallation): Promise<InstalledAsset>
  trackWarranty(assetId: string): Promise<WarrantyStatus>
  getStockLevels(sku: string): Promise<StockLevel>
}
```
**Dependencies**: Finance, Support
**Events Published**:
- `stock.low`
- `asset.installed`
- `warranty.expiring`

#### 10. Portals Module (`/src/modules/portals`)
**Responsibility**: Multi-tenant portal management
**Public Interface**:
```typescript
interface IPortalsModule {
  createPortalInvite(invite: PortalInvite): Promise<string>
  getPortalContent(portalType: PortalType, userId: string): Promise<PortalData>
  updatePortalAccess(userId: string, access: AccessLevel): Promise<void>
}
```
**Dependencies**: Identity, All other modules (read-only)
**Events Published**:
- `portal.accessed`
- `portal.invite.sent`

#### 11. Automations Module (`/src/modules/automations`)
**Responsibility**: Business process automation
**Public Interface**:
```typescript
interface IAutomationsModule {
  createRule(rule: AutomationRule): Promise<void>
  executeWorkflow(trigger: TriggerEvent): Promise<WorkflowResult>
  configureApprovalChain(chain: ApprovalChain): Promise<void>
  sendNotification(notification: NotificationData): Promise<void>
}
```
**Dependencies**: All modules (event consumer)
**Events Published**:
- `workflow.executed`
- `approval.required`
- `notification.sent`

## Event Bus Architecture

### Event Naming Conventions
```
{module}.{entity}.{action}
```
Examples:
- `projects.task.created`
- `finance.invoice.paid`
- `hr.candidate.hired`

### Event Payload Structure
```typescript
interface EventPayload<T = any> {
  eventId: string
  eventType: string
  timestamp: number
  source: string
  correlationId?: string
  userId: string
  data: T
  metadata?: Record<string, any>
}
```

### Publisher-Subscriber Mappings

| Event | Publishers | Subscribers |
|-------|------------|-------------|
| `crm.opportunity.won` | CRM | Projects, Finance, Automations |
| `projects.milestone.completed` | Projects | Finance, Portals, Automations |
| `finance.invoice.overdue` | Finance | CRM, Automations, Portals |
| `hr.candidate.hired` | HR | Identity, LMS, Automations |
| `projects.budget.exceeded` | Projects | Finance, Automations |
| `support.ticket.created` | Support | Automations, Portals |
| `lms.course.completed` | LMS | HR, Portals, Automations |

### Event Flow Diagram
```
Producer Module → Pub/Sub Topic → Cloud Function Router → Subscriber Modules
                        ↓
                  Event Store (Firestore)
```

## Cloud Functions API Surface

### Authentication Functions
```typescript
// HTTP Triggers
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/verify-2fa
POST /api/auth/reset-password

// Auth Triggers
onCreate: user.created → Setup custom claims
onDelete: user.deleted → Cleanup user data
```

### Project Management Functions
```typescript
// HTTP Triggers
GET /api/projects
POST /api/projects
GET /api/projects/:id
PUT /api/projects/:id
DELETE /api/projects/:id
POST /api/projects/:id/tasks
POST /api/projects/:id/timesheets
GET /api/projects/:id/budget

// Firestore Triggers
onUpdate: projects/:id → Check budget thresholds
onCreate: timesheets/:id → Update task hours
```

### Finance Functions
```typescript
// HTTP Triggers
POST /api/invoices
GET /api/invoices/:id
POST /api/invoices/:id/send
POST /api/payments
POST /api/payments/stripe/webhook
POST /api/payments/paymob/callback
POST /api/payroll/process
GET /api/reports/financial

// Scheduled Triggers
monthly: processPayroll → Run payroll calculation
daily: sendInvoiceReminders → Check overdue invoices
```

### CRM Functions
```typescript
// HTTP Triggers
POST /api/leads
POST /api/opportunities
PUT /api/opportunities/:id/stage
POST /api/quotes
POST /api/opportunities/:id/convert

// Firestore Triggers
onUpdate: opportunities/:id → Check stage transitions
```

### Support Functions
```typescript
// HTTP Triggers
POST /api/tickets
PUT /api/tickets/:id
POST /api/tickets/:id/visits
GET /api/sla/status/:ticketId

// Firestore Triggers
onCreate: tickets/:id → Apply SLA policy
onUpdate: tickets/:id → Check SLA breach
```

### LMS Functions
```typescript
// HTTP Triggers
POST /api/courses
POST /api/courses/:id/assign
POST /api/courses/:id/progress
POST /api/quizzes/:id/submit
GET /api/certificates/:userId/:courseId

// Firestore Triggers
onUpdate: assignments/:id → Check completion
```

### HR Functions
```typescript
// HTTP Triggers
POST /api/candidates
POST /api/interviews
POST /api/candidates/:id/hire
POST /api/employees/:id/onboard

// Firestore Triggers
onCreate: candidates/:id → Send portal invite
```

### Portal Functions
```typescript
// HTTP Triggers
GET /api/portal/:type/dashboard
GET /api/portal/:type/content
POST /api/portal/invites
PUT /api/portal/access

// Auth Triggers
onSignIn: → Log portal access
```

### Automation Functions
```typescript
// HTTP Triggers
POST /api/automations/rules
POST /api/automations/test
GET /api/automations/history

// Pub/Sub Triggers
onMessage: automation-queue → Execute workflows
```

### Integration Functions
```typescript
// Webhook Handlers
POST /api/webhooks/stripe
POST /api/webhooks/paymob
POST /api/webhooks/github
POST /api/webhooks/slack

// Scheduled Functions
hourly: syncExchangeRates → Update currency rates
daily: backupDatabase → Create database backup
```

## Data Architecture

### Firestore Collections Structure

```javascript
// Core Collections
/organizations/{orgId}
  /settings
  /departments/{deptId}
  /roles/{roleId}
  /permissions/{permId}
  /customFields/{fieldId}

// User Management
/users/{userId}
  /profile
  /roles/{roleId}
  /notifications/{notifId}
  /preferences

// Projects
/projects/{projectId}
  /phases/{phaseId}
  /tasks/{taskId}
  /timesheets/{timesheetId}
  /documents/{docId}
  /budgets/{budgetId}

// Finance
/accounts/{accountId}
/invoices/{invoiceId}
  /lineItems/{itemId}
  /payments/{paymentId}
/contracts/{contractId}
/transactions/{transId}

// CRM
/leads/{leadId}
/opportunities/{oppId}
  /activities/{activityId}
/quotes/{quoteId}
  /lineItems/{itemId}

// Support
/tickets/{ticketId}
  /comments/{commentId}
  /visits/{visitId}
/slaPolices/{policyId}

// LMS
/courses/{courseId}
  /lessons/{lessonId}
  /quizzes/{quizId}
/assignments/{assignId}
  /progress/{progressId}

// HR
/candidates/{candidateId}
  /interviews/{interviewId}
  /notes/{noteId}
/onboarding/{onboardId}
  /tasks/{taskId}

// Assets
/inventory/{inventoryId}
/installedAssets/{assetId}
/clientSites/{siteId}

// Portals
/portalInvites/{inviteId}
/portalSessions/{sessionId}
/announcements/{announceId}

// Automations
/automationRules/{ruleId}
/workflows/{workflowId}
/approvalChains/{chainId}
```

### Security Rules Structure
```javascript
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

    function hasPermission(resource, action) {
      return request.auth.token.permissions[resource + ':' + action] == true;
    }

    // Organization-wide rules
    match /organizations/{orgId} {
      allow read: if isAuthenticated();
      allow write: if hasRole('admin');
    }

    // Project rules
    match /projects/{projectId} {
      allow read: if isAuthenticated() &&
        (hasPermission('projects', 'read') ||
         resource.data.members[request.auth.uid] == true);
      allow create: if hasPermission('projects', 'create');
      allow update: if hasPermission('projects', 'update') &&
        resource.data.managerId == request.auth.uid;
      allow delete: if hasRole('admin');
    }

    // Portal-specific rules
    match /portal/{portalType}/users/{userId} {
      allow read: if isOwner(userId) || hasRole('admin');
      allow write: if hasRole('admin');
    }
  }
}
```

## State Management

### Client-Side Architecture
```typescript
// Store Structure
{
  auth: {
    user: User | null,
    token: string | null,
    permissions: Permission[]
  },
  projects: {
    entities: { [id: string]: Project },
    ids: string[],
    loading: boolean,
    error: string | null
  },
  realtime: {
    subscriptions: { [key: string]: Unsubscribe },
    updates: { [collection: string]: any[] }
  },
  ui: {
    theme: 'light' | 'dark',
    language: 'en' | 'ar' | 'ru',
    sidebar: boolean,
    notifications: Notification[]
  }
}
```

### Real-time Synchronization Strategy
1. **Firestore Listeners**: Active on current view data
2. **Optimistic Updates**: Immediate UI updates with rollback
3. **Conflict Resolution**: Server wins with user notification
4. **Offline Queue**: Actions stored in IndexedDB
5. **Background Sync**: Progressive Web App sync on connection

## Environment Configuration

### Development Environment
```env
# Firebase
REACT_APP_FIREBASE_API_KEY=dev-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=mas-dev.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=mas-business-os-dev
REACT_APP_FIREBASE_STORAGE_BUCKET=mas-business-os-dev.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=dev-sender-id
REACT_APP_FIREBASE_APP_ID=dev-app-id

# Functions
FUNCTIONS_EMULATOR_HOST=localhost:5001
FIRESTORE_EMULATOR_HOST=localhost:8080
AUTH_EMULATOR_HOST=localhost:9099

# Integrations
STRIPE_PUBLIC_KEY=pk_test_xxx
PAYMOB_MERCHANT_ID=test_merchant
SLACK_WEBHOOK_URL=https://hooks.slack.com/test

# Features
ENABLE_DEBUG_LOGGING=true
ENABLE_OFFLINE_MODE=true
ENABLE_MOCK_DATA=true
```

### Staging Environment
```env
# Firebase
REACT_APP_FIREBASE_API_KEY=staging-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=mas-staging.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=mas-business-os-staging
REACT_APP_FIREBASE_STORAGE_BUCKET=mas-business-os-staging.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=staging-sender-id
REACT_APP_FIREBASE_APP_ID=staging-app-id

# Integrations
STRIPE_PUBLIC_KEY=pk_test_xxx
PAYMOB_MERCHANT_ID=staging_merchant
SLACK_WEBHOOK_URL=https://hooks.slack.com/staging

# Features
ENABLE_DEBUG_LOGGING=true
ENABLE_OFFLINE_MODE=true
ENABLE_MOCK_DATA=false
```

### Production Environment
```env
# Firebase
REACT_APP_FIREBASE_API_KEY=prod-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=mas.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=mas-business-os
REACT_APP_FIREBASE_STORAGE_BUCKET=mas-business-os.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=prod-sender-id
REACT_APP_FIREBASE_APP_ID=prod-app-id

# Integrations
STRIPE_PUBLIC_KEY=pk_live_xxx
PAYMOB_MERCHANT_ID=prod_merchant
SLACK_WEBHOOK_URL=https://hooks.slack.com/prod

# Features
ENABLE_DEBUG_LOGGING=false
ENABLE_OFFLINE_MODE=true
ENABLE_MOCK_DATA=false

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
GA_MEASUREMENT_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=prod-token
```

### Secret Management Strategy
- **Development**: Local `.env` files (git-ignored)
- **CI/CD**: GitHub Secrets
- **Cloud Functions**: Firebase Functions config
- **Runtime**: Firebase Remote Config for feature flags

## Security Architecture

### Authentication Flow
```
User Login → Firebase Auth → Custom Token with Claims → JWT Validation → Access Granted
                    ↓
            Store User Roles/Permissions in Firestore
                    ↓
            Apply Security Rules Based on Claims
```

### Authorization Model (RBAC)
```typescript
// Role Hierarchy
SuperAdmin
  ├── Admin
  │   ├── DepartmentManager
  │   │   ├── TeamLead
  │   │   └── Employee
  │   └── FinanceManager
  └── SupportManager

// Permission Structure
{
  resource: 'projects',
  actions: ['create', 'read', 'update', 'delete'],
  scope: 'department' | 'own' | 'all'
}
```

### Data Protection
1. **Encryption at Rest**: Firebase automatic encryption
2. **Encryption in Transit**: TLS 1.3 for all connections
3. **Field-Level Encryption**: Sensitive data (SSN, bank accounts)
4. **Data Masking**: PII hidden in logs and non-privileged views
5. **Audit Logging**: All data modifications tracked

### API Security
```typescript
// Rate Limiting
const rateLimiter = {
  anonymous: '10 requests per minute',
  authenticated: '100 requests per minute',
  premium: '1000 requests per minute'
}

// Request Validation
const validateRequest = (req) => {
  validateToken(req.headers.authorization)
  validateSchema(req.body)
  checkRateLimit(req.user)
  logAccess(req)
}
```

## Performance Considerations

### Optimization Strategies

#### 1. Database Optimization
- **Compound Indexes**: Multi-field queries
- **Collection Group Queries**: Cross-collection searches
- **Denormalization**: Strategic data duplication
- **Pagination**: Cursor-based pagination for large datasets
- **Caching**: Firestore offline persistence + Redis

#### 2. Frontend Optimization
- **Code Splitting**: Route-based lazy loading
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: WebP with fallback, lazy loading
- **Service Workers**: PWA with offline support
- **Virtual Scrolling**: Large lists and tables

#### 3. Cloud Functions Optimization
- **Cold Start Mitigation**: Minimum instances, lightweight dependencies
- **Batch Operations**: Firestore batch writes
- **Async Processing**: Cloud Tasks for long operations
- **Memory Allocation**: Right-sized function memory
- **Regional Deployment**: Multi-region for global users

### Caching Strategy
```typescript
// Cache Layers
1. Browser Cache: Static assets (1 year)
2. Service Worker: API responses (24 hours)
3. Redux Store: Active session data
4. Firestore Offline: Automatic persistence
5. CDN: Static files and images
```

### Performance Metrics
- **Target Load Time**: < 2 seconds
- **API Response**: < 200ms (p50), < 500ms (p95)
- **Real-time Updates**: < 100ms latency
- **Offline Capability**: Full CRUD operations
- **Bundle Size**: < 500KB initial, < 100KB per route

## Deployment Architecture

### CI/CD Pipeline
```yaml
# GitHub Actions Workflow
1. Code Push → GitHub
2. Run Tests (Unit, Integration)
3. Build Application
4. Deploy to Environment
   - main → Production
   - staging → Staging
   - develop → Development
5. Run E2E Tests
6. Update Documentation
7. Notify Slack
```

### Deployment Strategy
```
Blue-Green Deployment with Firebase Hosting
1. Deploy to Preview Channel
2. Run Smoke Tests
3. Gradual Traffic Migration (10% → 50% → 100%)
4. Monitor Error Rates
5. Automatic Rollback on Failure
```

### Infrastructure as Code
```typescript
// Firebase Configuration
{
  hosting: {
    public: "build",
    ignore: ["firebase.json", "**/.*", "**/node_modules/**"],
    rewrites: [{
      source: "/api/**",
      function: "api"
    }],
    headers: [{
      source: "**/*.@(js|css)",
      headers: [{
        key: "Cache-Control",
        value: "public, max-age=31536000"
      }]
    }]
  },
  functions: {
    runtime: "nodejs18",
    region: "us-central1",
    minInstances: 1,
    maxInstances: 100
  },
  firestore: {
    rules: "firestore.rules",
    indexes: "firestore.indexes.json"
  }
}
```

## Scalability Considerations

### Horizontal Scaling
1. **Firestore**: Automatic scaling with sharding
2. **Cloud Functions**: Auto-scaling based on load
3. **Firebase Hosting**: Global CDN distribution
4. **Cloud Storage**: Unlimited file storage

### Vertical Scaling
1. **Function Memory**: Adjustable from 128MB to 8GB
2. **Timeout Settings**: Up to 9 minutes for long operations
3. **Batch Operations**: Process up to 500 documents

### Multi-Tenancy Architecture
```typescript
// Tenant Isolation Strategy
/tenants/{tenantId}/
  /users
  /projects
  /data

// Shared Resources
/shared/
  /templates
  /currencies
  /timezones
```

## PRD Requirement Traceability

| PRD Requirement | Architecture Component | Status |
|-----------------|----------------------|---------|
| Multi-module system | Microservices architecture with 11 modules | ✓ Addressed |
| Real-time updates | Firestore listeners + Pub/Sub | ✓ Addressed |
| Multi-tenant portals | Portal module with tenant isolation | ✓ Addressed |
| Payment integrations | Cloud Functions for Stripe/Paymob | ✓ Addressed |
| Offline support | PWA + Firestore offline | ✓ Addressed |
| 99.9% uptime | Multi-region deployment + monitoring | ✓ Addressed |
| RBAC authorization | Firebase Auth + custom claims | ✓ Addressed |
| Automation engine | Event-driven with Pub/Sub | ✓ Addressed |
| Multi-language | i18n with React-Intl | ✓ Addressed |
| File storage | Firebase Storage with CDN | ✓ Addressed |

## TODOs and Open Items

### Technical Decisions Needed
- **TODO[PRD]**: Confirm VoIP provider for Phase 3 integration
- **TODO[PRD]**: Specify e-signature integration (DocuSign/Adobe Sign)
- **TODO[PRD]**: Define exact FX rate provider for multi-currency
- **TODO[PRD]**: Clarify data retention policies by record type
- **TODO[PRD]**: Determine mobile app strategy (React Native vs PWA)

### Architecture Clarifications
- **TODO[ARCH]**: Decide on workflow engine for complex automations (Step Functions vs custom)
- **TODO[ARCH]**: Choose APM solution (New Relic vs Datadog vs Cloud Monitoring)
- **TODO[ARCH]**: Define disaster recovery RTO/RPO targets precisely
- **TODO[ARCH]**: Specify PCI compliance requirements for payment processing
- **TODO[ARCH]**: Determine GDPR compliance requirements for EU clients

---

**Document Status**: COMPLETE
**Version**: 1.0
**Last Updated**: 2024-01-24
**Next Review**: Post Phase 1 Implementation