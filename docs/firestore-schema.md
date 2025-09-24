# MAS Business OS - Firestore Database Schema

## Overview

This document defines the complete Firestore NoSQL database schema for the MAS Business OS. The schema is optimized for real-time updates, multi-tenant portals, and complex business workflows while maintaining cost efficiency and query performance.

## Design Principles

1. **Denormalization Strategy**: Strategic data duplication to minimize reads
2. **Collection Structure**: Flat collections with subcollections for hierarchical data
3. **Query Optimization**: Composite indexes for all PRD-defined query patterns
4. **Real-time Updates**: Optimized for Firestore listeners
5. **Multi-tenancy**: Portal-based data isolation with field-level security
6. **Soft Deletes**: Preservation of historical data with deletedAt timestamps

## Collection Structure

### 1. Organizations & Settings

#### `organizations` (Top-level)
Primary organization configuration and global settings.

```javascript
{
  id: string,                  // Auto-generated UUID
  name: string,                 // Organization name
  logo?: string,                // URL to logo image
  website?: string,             // Company website
  baseCurrency: Currency,       // Default currency (USD, EGP, EUR, etc.)
  timezone: string,             // Default timezone
  languages: Language[],        // Supported languages
  defaultLanguage: Language,    // Default language
  fiscalYearStart: number,      // Month (1-12)
  taxId?: string,               // Tax identification
  registrationNumber?: string,  // Business registration
  address: {
    street?: string,
    city?: string,
    state?: string,
    country: string,
    postalCode?: string
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: string,            // User ID
  updatedBy: string             // User ID
}
```

**Subcollections:**
- `organizations/{orgId}/settings` - Module and feature configurations
- `organizations/{orgId}/customFields` - Custom field definitions per entity type

### 2. Identity & Access Management

#### `users` (Top-level)
System users across all portals with role-based permissions.

```javascript
{
  id: string,                   // Firebase Auth UID
  email: string,
  name: string,
  photoUrl?: string,
  phoneNumber?: string,
  active: boolean,
  departmentId?: string,
  managerId?: string,           // Direct manager's user ID
  employeeId?: string,          // HR employee code
  title?: string,               // Job title
  startDate?: timestamp,
  endDate?: timestamp,
  timezone?: string,
  language: Language,
  portalAccess: {
    employee: boolean,
    client?: string[]           // Array of accountIds for client portal access
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt?: timestamp,        // Soft delete
  createdBy: string,
  updatedBy: string
}
```

**Subcollections:**
- `users/{userId}/roles` - User role assignments
- `users/{userId}/notifications` - User notifications

**Indexes:**
- `departmentId, active, name`
- `managerId, active`
- `portalAccess.employee, active`

#### `departments` (Top-level)
Organizational structure for user grouping and hierarchy.

```javascript
{
  id: string,
  name: string,
  code: string,                 // Unique department code
  managerId?: string,           // Department manager user ID
  parentId?: string,            // Parent department for hierarchy
  active: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `roles` (Top-level)
Role definitions with granular permissions.

```javascript
{
  id: string,
  name: string,                 // e.g., 'admin', 'project_manager', 'finance_manager'
  description?: string,
  permissions: Permission[],    // Array of permission objects
  isSystem: boolean,            // System roles cannot be deleted
  createdAt: timestamp,
  updatedAt: timestamp
}

// Permission structure
{
  resource: string,             // e.g., 'projects', 'invoices'
  actions: string[],            // ['create', 'read', 'update', 'delete']
  scope?: 'own' | 'department' | 'all'
}
```

### 3. Projects & Delivery

#### `projects` (Top-level)
Project management with phases, tasks, and budget tracking.

```javascript
{
  id: string,
  name: string,
  code: string,                 // Unique project code
  accountId: string,            // Client account
  projectTypeId: string,
  managerId: string,            // Project manager user ID
  description?: string,
  status: ProjectStatus,
  startDate: timestamp,
  dueDate: timestamp,
  actualStartDate?: timestamp,
  actualEndDate?: timestamp,
  estimateBudget: number,
  actualBudget?: number,
  currency: Currency,
  completionPercentage: number, // Auto-calculated from phases/tasks
  members: string[],            // Array of user IDs
  tags?: string[],
  customFields?: map,
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt?: timestamp,
  createdBy: string,
  updatedBy: string
}
```

**Subcollections:**
- `projects/{projectId}/phases` - Project phases with milestones
- `projects/{projectId}/tasks` - All project tasks
- `projects/{projectId}/members` - Team member details and roles

**Indexes:**
- `accountId, status, createdAt DESC`
- `managerId, status, dueDate`
- `projectTypeId, status, startDate`

#### `timesheets` (Top-level)
Time tracking for billing and payroll.

```javascript
{
  id: string,
  userId: string,
  projectId: string,
  taskId?: string,
  date: timestamp,
  hours: number,
  billable: boolean,
  description?: string,
  status: TimesheetStatus,     // draft, submitted, approved, rejected
  approvedBy?: string,
  approvedAt?: timestamp,
  rejectionReason?: string,
  rate?: number,                // Hourly billing rate
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `userId, status, date DESC`
- `projectId, billable, date DESC`
- `status, date` (for payroll processing)

### 4. CRM & Sales

#### `accounts` (Top-level)
Client/customer account management.

```javascript
{
  id: string,
  name: string,
  type: 'prospect' | 'customer' | 'partner' | 'vendor',
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum',
  industry?: string,
  website?: string,
  phoneNumber?: string,
  email?: string,
  taxId?: string,
  registrationNumber?: string,
  assignedTo?: string,          // Sales rep user ID
  address: {
    billing?: Address,
    shipping?: Address
  },
  creditLimit?: number,
  paymentTerms?: number,        // Days
  customFields?: map,
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt?: timestamp
}
```

**Indexes:**
- `assignedTo, type, tier`
- `type, createdAt DESC`

#### `opportunities` (Top-level)
Sales pipeline and deal management.

```javascript
{
  id: string,
  accountId: string,
  name: string,
  stage: OpportunityStage,
  amount: number,
  currency: Currency,
  probability: number,          // 0-100
  expectedClose: timestamp,
  actualClose?: timestamp,
  ownerId: string,              // Sales rep user ID
  source?: string,
  campaignId?: string,
  competitorNames?: string[],
  notes?: string,
  lostReason?: string,
  customFields?: map,
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt?: timestamp
}
```

**Indexes:**
- `accountId, stage, expectedClose`
- `ownerId, stage, amount DESC`

#### `quotes` (Top-level)
Quote management with line items and pricing.

```javascript
{
  id: string,
  opportunityId?: string,
  accountId: string,
  quoteNumber: string,          // Auto-generated
  pricebookId?: string,
  status: QuoteStatus,
  validFrom: timestamp,
  validUntil: timestamp,
  currency: Currency,
  subtotal: number,
  discount?: number,
  discountType?: 'percentage' | 'fixed',
  tax: number,
  total: number,
  terms?: string,
  notes?: string,
  lineItems: QuoteLineItem[],
  customFields?: map,
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt?: timestamp
}
```

**Indexes:**
- `opportunityId, status, createdAt DESC`
- `accountId, status, validUntil`

### 5. Finance & Billing

#### `contracts` (Top-level)
Contract lifecycle management with SLA linkage.

```javascript
{
  id: string,
  accountId: string,
  contractNumber: string,       // Auto-generated
  title: string,
  type: 'one-time' | 'recurring' | 'retainer',
  status: ContractStatus,
  startDate: timestamp,
  endDate: timestamp,
  autoRenew: boolean,
  renewalTermMonths?: number,
  value: number,
  currency: Currency,
  billingFrequency?: 'monthly' | 'quarterly' | 'annually',
  paymentTerms?: number,        // Days
  slaPolicyId?: string,
  signedDate?: timestamp,
  signedBy?: string,
  attachments?: string[],
  entitlements?: {
    supportHours?: number,
    includedProducts?: string[],
    includedServices?: string[]
  },
  customFields?: map,
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt?: timestamp
}
```

**Indexes:**
- `accountId, status, endDate`
- `autoRenew, endDate` (for renewal processing)

#### `invoices` (Top-level)
Invoice management with payment tracking.

```javascript
{
  id: string,
  invoiceNumber: string,        // Auto-generated sequential
  accountId: string,
  contractId?: string,
  projectId?: string,
  type: 'one-time' | 'milestone' | 'recurring',
  status: InvoiceStatus,
  issueDate: timestamp,
  dueDate: timestamp,
  currency: Currency,
  subtotal: number,
  discount?: number,
  discountType?: 'percentage' | 'fixed',
  tax: number,
  total: number,
  paidAmount: number,
  balanceDue: number,
  terms?: string,
  notes?: string,
  lineItems: InvoiceLineItem[],
  attachments?: string[],
  customFields?: map,
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt?: timestamp
}
```

**Indexes:**
- `accountId, status, dueDate`
- `status, dueDate` (for overdue processing)
- `projectId, status, issueDate DESC`

#### `payments` (Top-level)
Payment processing and reconciliation.

```javascript
{
  id: string,
  paymentNumber: string,        // Auto-generated
  invoiceId?: string,
  accountId: string,
  amount: number,
  currency: Currency,
  status: PaymentStatus,
  method: PaymentMethod,
  paidAt?: timestamp,
  reference?: string,
  gatewayTransactionId?: string,
  gatewayResponse?: map,
  receiptUrl?: string,
  notes?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `accountId, status, paidAt DESC`
- `invoiceId, status`

#### `transactions` (Top-level)
Financial transaction ledger for accounting.

```javascript
{
  id: string,
  transactionNumber: string,    // Auto-generated
  finAccountId: string,         // Financial account
  projectId?: string,
  type: TransactionType,
  category?: string,
  date: timestamp,
  amount: number,
  currency: Currency,
  description?: string,
  reference?: string,
  reconciled: boolean,
  reconciledAt?: timestamp,
  attachments?: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `projectId, type, date DESC`
- `finAccountId, date DESC`

### 6. Support & Ticketing

#### `tickets` (Top-level)
Support ticket management with SLA tracking.

```javascript
{
  id: string,
  ticketNumber: string,         // Auto-generated
  accountId: string,
  projectId?: string,
  assetId?: string,             // For asset-related tickets
  subject: string,
  description: string,
  status: TicketStatus,
  priority: TicketPriority,
  category?: string,
  assigneeId?: string,
  slaPolicyId?: string,
  slaBreached: boolean,
  firstResponseAt?: timestamp,
  resolvedAt?: timestamp,
  closedAt?: timestamp,
  rating?: number,              // 1-5 customer satisfaction
  feedback?: string,
  customFields?: map,
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt?: timestamp
}
```

**Subcollections:**
- `tickets/{ticketId}/comments` - Ticket conversation thread

**Indexes:**
- `accountId, status, priority DESC`
- `assigneeId, status, createdAt DESC`
- `slaPolicyId, status, slaBreached`

### 7. Learning Management System

#### `courses` (Top-level)
Training course management for multiple audiences.

```javascript
{
  id: string,
  title: string,
  description?: string,
  audience: CourseAudience,     // employee, candidate, client, mixed
  duration?: number,            // Hours
  thumbnail?: string,
  active: boolean,
  productId?: string,           // For product-specific training
  certificateTemplateId?: string,
  passingScore?: number,        // Percentage
  tags?: string[],
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt?: timestamp
}
```

**Subcollections:**
- `courses/{courseId}/lessons` - Course lessons/modules
- `courses/{courseId}/quizzes` - Course assessments

#### `assignments` (Top-level)
Training assignments and progress tracking.

```javascript
{
  id: string,
  courseId: string,
  userId?: string,              // For employees
  candidateId?: string,         // For candidates
  accountId?: string,           // For client training
  assignedBy: string,
  dueDate?: timestamp,
  status: AssignmentStatus,
  startedAt?: timestamp,
  completedAt?: timestamp,
  progressPct: number,
  score?: number,
  certificate?: string,         // URL to certificate
  lastActivity?: timestamp,
  lessonProgress?: LessonProgress[],
  quizAttempts?: QuizAttempt[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `userId, status, lastActivity DESC`
- `candidateId, status, courseId`
- `courseId, status, progressPct DESC`

### 8. Human Resources

#### `candidates` (Top-level)
Recruitment pipeline management.

```javascript
{
  id: string,
  name: string,
  email: string,
  phoneNumber?: string,
  stage: CandidateStage,
  position: string,
  department?: string,
  source?: string,
  cvUrl?: string,
  portfolioUrl?: string,
  linkedinUrl?: string,
  githubUrl?: string,
  expectedSalary?: number,
  noticePeriod?: number,        // Days
  skills?: string[],
  experience?: number,          // Years
  referredBy?: string,
  portalInviteId?: string,
  notes?: string,
  customFields?: map,
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt?: timestamp
}
```

**Subcollections:**
- `candidates/{candidateId}/interviews` - Interview scheduling and feedback

**Indexes:**
- `stage, createdAt DESC`

### 9. Assets & Inventory

#### `installedAssets` (Top-level)
Client-installed hardware and asset tracking.

```javascript
{
  id: string,
  clientSiteId: string,
  accountId: string,
  productId: string,
  serialNumber?: string,
  installDate: timestamp,
  warrantyEnd?: timestamp,
  status: AssetStatus,
  lastMaintenanceDate?: timestamp,
  nextMaintenanceDate?: timestamp,
  notes?: string,
  customFields?: map,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `clientSiteId, status, warrantyEnd`
- `accountId, productId, status`

#### `clientSites` (Top-level)
Client location management for multi-site accounts.

```javascript
{
  id: string,
  accountId: string,
  name: string,
  address: Address,
  contactPerson?: string,
  contactPhone?: string,
  contactEmail?: string,
  timezone?: string,
  accessInstructions?: string,
  active: boolean,
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt?: timestamp
}
```

**Indexes:**
- `accountId, active, name`

### 10. Automations & Workflows

#### `automations` (Top-level)
Business process automation rules.

```javascript
{
  id: string,
  name: string,
  description?: string,
  triggerType: 'event' | 'schedule' | 'webhook',
  trigger: {
    event?: string,             // e.g., 'invoice.overdue'
    schedule?: string,          // Cron expression
    webhookUrl?: string
  },
  conditions?: Condition[],
  actions: Action[],
  active: boolean,
  priority: number,
  lastTriggeredAt?: timestamp,
  triggerCount: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `triggerType, active, priority DESC`

#### `auditLogs` (Top-level)
Immutable audit trail for compliance.

```javascript
{
  id: string,
  timestamp: timestamp,
  userId: string,
  userEmail?: string,
  action: string,
  entityType: string,
  entityId: string,
  changes?: Change[],
  ipAddress?: string,
  userAgent?: string,
  metadata?: map
}
```

**Indexes:**
- `entityType, entityId, timestamp DESC`
- `userId, action, timestamp DESC`

### 11. Portal Management

#### `portalInvites` (Top-level)
Portal access invitation management.

```javascript
{
  id: string,
  email: string,
  portalType: PortalType,
  accountId?: string,           // For client portal
  candidateId?: string,         // For candidate portal
  userId?: string,              // For employee portal
  token: string,                // Unique invitation token
  status: 'pending' | 'accepted' | 'expired',
  expiresAt: timestamp,
  acceptedAt?: timestamp,
  customMessage?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `email, status, expiresAt`

#### `announcements` (Top-level)
System-wide and targeted announcements.

```javascript
{
  id: string,
  title: string,
  content: string,
  type: 'info' | 'warning' | 'success' | 'error',
  targetAudience: string[],     // ['all', 'employees', 'clients', specific accountIds]
  publishedAt?: timestamp,
  expiresAt?: timestamp,
  pinned: boolean,
  attachments?: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `targetAudience ARRAY_CONTAINS, publishedAt DESC`

## Query Patterns & Access Patterns

### High-Frequency Queries (from PRD)

1. **Project Dashboard**
   - Query: `projects WHERE accountId == X AND status IN ['in_progress', 'planning'] ORDER BY dueDate`
   - Denormalization: Project includes `completionPercentage` to avoid phase/task aggregation

2. **Employee Task List**
   - Query: `tasks WHERE assigneeId == X AND status != 'completed' ORDER BY priority DESC, dueDate`
   - Strategy: Collection group query on tasks subcollection

3. **Client Portal Projects**
   - Query: `projects WHERE accountId == X ORDER BY createdAt DESC`
   - Security: Client portal token includes accountId claim

4. **Invoice Overdue Processing**
   - Query: `invoices WHERE status IN ['sent', 'viewed'] AND dueDate < NOW()`
   - Schedule: Daily Cloud Function trigger

5. **Timesheet Approval Queue**
   - Query: `timesheets WHERE status == 'submitted' AND managerId == X ORDER BY date`
   - Denormalization: Timesheet includes managerId from user's department

6. **Support Ticket SLA Monitoring**
   - Query: `tickets WHERE slaPolicyId == X AND status != 'closed' AND slaBreached == false`
   - Strategy: Firestore trigger updates slaBreached field

7. **Training Progress by User**
   - Query: `assignments WHERE userId == X AND status == 'in_progress' ORDER BY lastActivity DESC`
   - Real-time: Listener for progress updates

8. **Financial Dashboard**
   - Query: Multiple parallel queries for revenue, expenses, cash flow
   - Strategy: Aggregation documents updated via Cloud Functions

## Denormalization Strategy

### Principles
1. **Read Optimization**: Duplicate data to minimize document reads
2. **Write Consistency**: Use Cloud Functions to maintain consistency
3. **Cost Balance**: Weigh storage cost vs. read cost

### Key Denormalizations

1. **User Names & Photos**
   - Stored in: Projects, Tasks, Comments, Audit Logs
   - Update: Batch update via Cloud Function on user profile change

2. **Account Names**
   - Stored in: Projects, Invoices, Tickets
   - Update: Rare changes, batch update when needed

3. **Project Completion**
   - Calculated from: Phase and Task completion
   - Stored in: Project document
   - Update: Firestore trigger on task/phase updates

4. **Invoice Balance**
   - Calculated from: Total minus payments
   - Stored in: Invoice document
   - Update: Payment creation trigger

5. **Ticket SLA Status**
   - Calculated from: Creation time and SLA policy
   - Stored in: Ticket document
   - Update: Scheduled function every 15 minutes

## Security Considerations

### Multi-Tenant Isolation
1. **Portal Segregation**: Separate auth tokens with portal type and access claims
2. **Row-Level Security**: Firestore rules enforce accountId/userId checks
3. **Field-Level Security**: Sensitive fields (SSN, salary) only visible to authorized roles

### Data Protection
1. **Soft Deletes**: Preserve data with deletedAt timestamp
2. **Audit Trail**: Immutable logs for all data modifications
3. **Encryption**: Firebase automatic encryption at rest, TLS in transit

### Access Patterns
1. **Client Portal**: Read-only access to own data
2. **Employee Portal**: CRUD on assigned items, read on department data
3. **Admin Portal**: Full CRUD with audit logging

## Migration Considerations

### From Existing Systems
1. **Batch Import**: Use Cloud Functions for large data sets
2. **ID Mapping**: Maintain legacy ID references during transition
3. **Incremental Migration**: Module-by-module approach per PRD phases

### Schema Evolution
1. **Field Addition**: Non-breaking, add with defaults
2. **Field Removal**: Mark deprecated, remove after migration period
3. **Structure Changes**: Version documents, migrate via Cloud Functions

## Performance Optimization

### Index Strategy
1. **Composite Indexes**: Created for all multi-field queries
2. **Collection Group Indexes**: For cross-collection queries (tasks, notifications)
3. **Array Contains**: For multi-value filters (tags, members)

### Caching Strategy
1. **Client-Side**: Firestore offline persistence
2. **Computed Fields**: Store calculations to avoid client-side processing
3. **Aggregations**: Maintain counter documents for totals

### Real-Time Updates
1. **Selective Listeners**: Subscribe only to visible data
2. **Pagination**: Limit initial loads, lazy load on scroll
3. **Debouncing**: Batch rapid updates to reduce writes

## TODOs from PRD Analysis

The following fields/features were identified as technically necessary but not explicitly defined in the PRD:

1. **TODO[PRD]**: Add `riskScore` and `riskFactors` fields to Project entity for risk assessment tracking
2. **TODO[PRD]**: Add `capacity` field to User entity for resource capacity planning
3. **TODO[PRD]**: Add `exchangeRate` and `exchangeRateDate` to multi-currency transactions
4. **TODO[PRD]**: Add `escalationLevel` to Ticket entity for multi-tier escalation
5. **TODO[PRD]**: Add `companySize` and `annualRevenue` to Account entity for segmentation
6. **TODO[PRD]**: Add `costCenter` field to Project and Department for financial allocation
7. **TODO[PRD]**: Add `taxRate` and `taxJurisdiction` to Invoice for multi-region tax compliance
8. **TODO[PRD]**: Add `integrationId` field to entities synced with external systems
9. **TODO[PRD]**: Add `version` field to documents requiring version control
10. **TODO[PRD]**: Add `ipRestrictions` to User entity for security compliance

## Appendix: Type Definitions

See `/src/types/models.ts` for complete TypeScript interfaces for all collections.

## Document Metadata

- **Version**: 1.0
- **Last Updated**: 2024-01-24
- **Status**: COMPLETE
- **Next Review**: Post Phase 1 Implementation