# MAS Business OS — ERD & Architecture (vFinal)

> Ultra-think blueprint: high-level module map + domain-sliced ERDs. Each ERD focuses on a bounded context for clarity. Use these as source for codegen and DB migrations.
> Legend: `||` = 1, `o{` = many (optional), `|{` = many (required); dashed arrows = async/event.

---

## 1) High-Level Module Architecture (C4: Container/Module)

```mermaid
flowchart LR
  A[Settings / Admin]:::core
  B[Identity & Access<br/>Users · Roles · Depts · Permissions]:::core
  C[CRM & Sales<br/>Leads · Deals · Quotes]:::crm
  D[Projects & Delivery<br/>Projects · Phases · Tasks · Timesheets]:::proj
  E[Finance & Billing<br/>Accounts · Invoices · Payments · Contracts]:::fin
  F[Catalog & Pricebooks<br/>Products · Services · Bundles]:::catalog
  G[Stock & Assets<br/>Inventory · Installed Assets · Client Sites]:::assets
  H[Support & SLA<br/>Tickets · Visits · Policies]:::support
  I[Training / LMS<br/>Courses · Lessons · Quizzes · Assignments]:::lms
  J[HR / Recruitment<br/>Candidates · Interviews · Onboarding]:::hr
  K[Automations & Approvals<br/>Rules · Steps · Webhooks · Notifications]:::auto
  L[Portals<br/>Client · Employee · Candidate]:::portals
  M[Integrations<br/>Stripe/Paymob · GitHub · Slack · Storage]:::integrations

  A --> B
  A --> F
  A --> E
  A --> K
  A --> L

  B --> D
  B --> H
  B --> I
  B --> J

  C -->|Deal Won| D
  C -->|Quote→Contract| E
  F --> C
  F --> D
  F --> E

  D --> E
  D --> I
  D --> H

  G <-->|hardware sales| E
  G --> H

  H --> E
  I --> L
  J --> I
  J --> B

  K -.events.-> C
  K -.events.-> D
  K -.events.-> E
  K -.events.-> H
  K -.events.-> I
  K -.events.-> J
  K -.events.-> L

  L <-->|auth/scope| B
  L --> E

  M -.webhooks.-> K
  E --> M

  classDef core fill:#111,stroke:#555,color:#fff;
  classDef crm fill:#3b82f6,stroke:#0f172a,color:#fff;
  classDef proj fill:#10b981,stroke:#064e3b,color:#fff;
  classDef fin fill:#f59e0b,stroke:#7c2d12,color:#111;
  classDef catalog fill:#a78bfa,stroke:#4c1d95,color:#fff;
  classDef assets fill:#f472b6,stroke:#831843,color:#fff;
  classDef support fill:#60a5fa,stroke:#1e3a8a,color:#fff;
  classDef lms fill:#34d399,stroke:#065f46,color:#111;
  classDef hr fill:#fca5a5,stroke:#7f1d1d,color:#111;
  classDef auto fill:#fde047,stroke:#854d0e,color:#111;
  classDef portals fill:#22d3ee,stroke:#0e7490,color:#111;
  classDef integrations fill:#cbd5e1,stroke:#334155,color:#111;
```

**Key flows**

* **Deal → Project → Billing:** CRM creates Projects; Quotes convert to Contracts; Finance issues invoices.
* **Service/Hardware → Stock/Assets:** Selling hardware creates Installed Assets at Client Sites.
* **Candidate → Hire → Onboard:** HR assigns pre-hire courses, then converts Candidate to Employee + onboarding checklist.
* **Training across audiences:** Same LMS engine assigns courses to **Employees**, **Candidates**, and **Clients** (per product).

---

## 2) Identity & Settings (RBAC, Depts, Project Types)

```mermaid
erDiagram
  USER ||--o{ USER_ROLE : has
  ROLE ||--o{ USER_ROLE : includes
  ROLE ||--o{ PERMISSION : grants
  DEPARTMENT ||--o{ USER : groups

  SETTINGS ||--|{ PROJECT_TYPE : defines
  PROJECT_TYPE ||--o{ PROJECT_TEMPLATE : defaults

  USER {
    uuid id PK
    string email
    string name
    bool active
  }
  ROLE {
    uuid id PK
    string name
  }
  PERMISSION {
    uuid id PK
    string object
    string action
    string scope
  }
  USER_ROLE {
    uuid id PK
    uuid userId FK
    uuid roleId FK
  }
  DEPARTMENT {
    uuid id PK
    string name
    uuid managerId FK
  }
  SETTINGS {
    uuid id PK
    string baseCurrency
    string timezone
  }
  PROJECT_TYPE {
    uuid id PK
    string name
    string code
    uuid defaultTemplateId FK
    uuid defaultPricebookId FK
  }
  PROJECT_TEMPLATE {
    uuid id PK
    string name
    json phases
  }
```

---

## 3) CRM & Catalog (Leads, Deals, Pricebooks, Bundles)

```mermaid
erDiagram
  ACCOUNT ||--o{ OPPORTUNITY : has
  ACCOUNT ||--o{ ACTIVITY : logs
  OPPORTUNITY ||--o{ QUOTE : proposes
  QUOTE ||--|{ QUOTE_LINE : contains
  PRICEBOOK ||--o{ PRICEBOOK_ENTRY : contains
  PRODUCT ||--o{ PRICEBOOK_ENTRY : priced_in
  SERVICE ||--o{ PRICEBOOK_ENTRY : priced_in
  BUNDLE ||--o{ BUNDLE_COMP : has
  PRODUCT ||--o{ BUNDLE_COMP : component
  SERVICE ||--o{ BUNDLE_COMP : component

  ACCOUNT {
    uuid id PK
    string name
    string tier
  }
  OPPORTUNITY {
    uuid id PK
    uuid accountId FK
    decimal amount
    date expectedClose
    string stage
  }
  QUOTE {
    uuid id PK
    uuid opportunityId FK
    uuid pricebookId FK
    string status
    currency currency
    decimal total
  }
  QUOTE_LINE {
    uuid id PK
    uuid quoteId FK
    uuid itemId
    string itemType  // product|service|bundle
    int qty
    decimal unitPrice
    decimal lineTotal
  }
  PRICEBOOK {
    uuid id PK
    string name
    currency currency
    date validFrom
    date validTo
    string region
  }
  PRICEBOOK_ENTRY {
    uuid id PK
    uuid pricebookId FK
    uuid itemId
    decimal unitPrice
    string taxClass
  }
  PRODUCT {
    uuid id PK
    string sku
    string name
    bool trackStock
  }
  SERVICE {
    uuid id PK
    string code
    string name
    bool fixedFee
    decimal defaultFee
  }
  BUNDLE {
    uuid id PK
    string name
    uuid pricebookId FK
    decimal bundlePrice
  }
  BUNDLE_COMP {
    uuid id PK
    uuid bundleId FK
    uuid itemId
    int qty
  }
```

---

## 4) Projects & Delivery (Projects, Phases, Tasks, Timesheets)

```mermaid
erDiagram
  ACCOUNT ||--o{ PROJECT : commissions
  PROJECT_TYPE ||--o{ PROJECT : classifies
  PROJECT ||--o{ PHASE : contains
  PHASE ||--o{ TASK : contains
  TASK ||--o{ TIMESHEET : has
  USER ||--o{ TIMESHEET : logs
  USER ||--o{ TASK : assigned

  PROJECT {
    uuid id PK
    uuid accountId FK
    uuid projectTypeId FK
    uuid managerId FK
    date startDate
    date dueDate
    decimal estimateBudget
    string status
  }
  PHASE {
    uuid id PK
    uuid projectId FK
    string name
    date start
    date due
    int weight
  }
  TASK {
    uuid id PK
    uuid projectId FK
    uuid phaseId FK
    string title
    string status
    int priority
    decimal estimateH
    decimal spentH
  }
  TIMESHEET {
    uuid id PK
    uuid taskId FK
    uuid userId FK
    date day
    decimal hours
    bool billable
  }
```

---

## 5) Finance & Billing (Contracts, Invoices, Accounts, Transactions)

```mermaid
erDiagram
  ACCOUNT(=Client) ||--o{ CONTRACT : signs
  CONTRACT ||--o{ INVOICE : bills
  INVOICE ||--o{ PAYMENT : receives
  FIN_ACCOUNT ||--o{ TRANSACTION : posts
  PROJECT ||--o{ TRANSACTION : consumes_budget
  QUOTE ||--|| CONTRACT : converts

  CONTRACT {
    uuid id PK
    uuid accountId FK
    uuid productId FK
    date start
    date end
    bool autoRenew
    uuid slaPolicyId FK
    json entitlements
  }
  INVOICE {
    uuid id PK
    uuid contractId FK
    uuid projectId FK
    date issueDate
    date dueDate
    currency currency
    decimal total
    string status
  }
  PAYMENT {
    uuid id PK
    uuid invoiceId FK
    date paidAt
    decimal amount
    string method // stripe|paymob|instapay|bank
    string ref
  }
  FIN_ACCOUNT {
    uuid id PK
    string name
    string type // bank|cash|wallet|income|expense
    currency currency
  }
  TRANSACTION {
    uuid id PK
    uuid finAccountId FK
    uuid projectId FK
    date date
    string type // income|expense|transfer
    decimal amount
    string memo
  }
```

---

## 6) Support, Sites & Assets (Tickets, Visits, Installed Assets)

```mermaid
erDiagram
  ACCOUNT ||--o{ CLIENT_SITE : has
  CLIENT_SITE ||--o{ INSTALLED_ASSET : hosts
  PRODUCT ||--o{ INSTALLED_ASSET : materialized
  ACCOUNT ||--o{ TICKET : opens
  TICKET ||--o{ VISIT : schedules
  SLA_POLICY ||--o{ TICKET : governs

  CLIENT_SITE {
    uuid id PK
    uuid accountId FK
    string name
    string address
    string timezone
  }
  INSTALLED_ASSET {
    uuid id PK
    uuid clientSiteId FK
    uuid productId FK
    string serial
    date warrantyEnd
    string status
  }
  TICKET {
    uuid id PK
    uuid accountId FK
    uuid projectId FK
    string subject
    string status
    string priority
    uuid slaPolicyId FK
  }
  VISIT {
    uuid id PK
    uuid ticketId FK
    date scheduledAt
    uuid assigneeId FK
    bool billable
  }
  SLA_POLICY {
    uuid id PK
    string name
    json targets
  }
```

---

## 7) Training / LMS (Courses, Lessons, Quizzes, Assignments)

```mermaid
erDiagram
  COURSE ||--o{ LESSON : contains
  LESSON ||--o{ QUIZ : may_have
  QUIZ ||--o{ QUESTION : has
  COURSE ||--o{ ASSIGNMENT : targeted_by
  USER ||--o{ ASSIGNMENT : receives
  CANDIDATE ||--o{ ASSIGNMENT : receives
  PRODUCT ||--o{ COURSE : product_training

  COURSE {
    uuid id PK
    string title
    string audience // employee|candidate|client|mixed
  }
  LESSON {
    uuid id PK
    uuid courseId FK
    string title
    string type // video|pdf|article
    string url
  }
  QUIZ {
    uuid id PK
    uuid lessonId FK
    string title
  }
  QUESTION {
    uuid id PK
    uuid quizId FK
    string text
    json options
    int correctIndex
  }
  ASSIGNMENT {
    uuid id PK
    uuid courseId FK
    uuid userId FK
    uuid candidateId FK
    decimal progressPct
    decimal score
    date lastActivity
  }
```

---

## 8) HR / Recruitment (Candidates, Interviews, Onboarding)

```mermaid
erDiagram
  CANDIDATE ||--o{ INTERVIEW : has
  CANDIDATE ||--o{ NOTE : annotated
  CANDIDATE ||--|| USER : converts_to
  ONBOARDING_TEMPLATE ||--o{ ONBOARDING_TASK : defines
  USER ||--o{ ONBOARDING_TASK : assigned

  CANDIDATE {
    uuid id PK
    string name
    string email
    string stage // applied|shortlist|invited|training|interview|offer|hired|rejected
    string cvUrl
    string portfolioUrl
  }
  INTERVIEW {
    uuid id PK
    uuid candidateId FK
    date at
    string type
    string result
  }
  NOTE {
    uuid id PK
    uuid candidateId FK
    uuid authorId FK
    string text
  }
  ONBOARDING_TEMPLATE {
    uuid id PK
    string name
    json tasks
  }
  ONBOARDING_TASK {
    uuid id PK
    uuid userId FK
    string title
    string status
  }
```

---

## 9) Portals & Content (KB, Announcements, Invites)

```mermaid
erDiagram
  ACCOUNT ||--o{ KB_SPACE : has
  KB_SPACE ||--o{ KB_ARTICLE : contains
  ACCOUNT ||--o{ ANNOUNCEMENT : sees
  PORTAL_INVITE ||--|| ACCOUNT : for_client
  PORTAL_INVITE ||--|| CANDIDATE : for_candidate

  KB_SPACE {
    uuid id PK
    uuid accountId FK
    string visibility // internal|client
  }
  KB_ARTICLE {
    uuid id PK
    uuid spaceId FK
    string title
    string type // article|video|pdf
    string url
    int version
  }
  ANNOUNCEMENT {
    uuid id PK
    uuid accountId FK
    string title
    string body
  }
  PORTAL_INVITE {
    uuid id PK
    string email
    string portal // client|candidate
    string token
    date expiresAt
  }
```

---

## 10) Automations, Approvals, Notifications

```mermaid
flowchart LR
  subgraph Events
    E1[deal.won]
    E2[budget.80%]
    E3[invoice.overdue]
    E4[ticket.created]
    E5[candidate.invited]
  end

  R[Rules Engine] --> A1[Create Task]
  R --> A2[Send Email/Portal Notice]
  R --> A3[Move Stage / Update Field]
  R --> A4[Generate Invoice]
  R --> A5[Block/Unblock Portal]
  R --> A6[Start Approval]

  E1 --> R
  E2 --> R
  E3 --> R
  E4 --> R
  E5 --> R

  subgraph Approvals
    P0[Policy]
    P1[Step 1: Role/Threshold]
    P2[Step 2: Finance]
    P3[Step 3: Exec]
  end

  A6 --> P0 --> P1 --> P2 --> P3

  classDef default fill:#0ea5e9,stroke:#0369a1,color:#fff;
```

---

## 11) Sequence: Quote → Contract → Project → Invoice

```mermaid
sequenceDiagram
  participant S as Sales (CRM)
  participant F as Finance
  participant P as Projects
  participant C as Client Portal

  S->>S: Create Quote (Pricebook/Bundle)
  S->>F: Submit for Approval (if discount)
  F-->>S: Approved
  S->>F: Convert to Contract (plan, SLA)
  F->>P: Create Project (from ProjectType template)
  P->>C: Portal Invite + Kickoff Announcement
  P->>F: Milestone complete → Draft Invoice
  C->>F: Pay via Stripe/Paymob/Manual
  F-->>C: Receipt & Status Update
```

---

## 12) Sequence: Candidate → Training → Hire → Onboarding

```mermaid
sequenceDiagram
  participant HR as HR/Recruiter
  participant Cand as Candidate Portal
  participant LMS as Training/LMS
  participant IAM as Identity

  HR->>Cand: Invitation Link
  HR->>LMS: Assign Course(s)
  Cand-->>LMS: Watch/Read/Quiz
  LMS-->>HR: Progress & Scores
  HR->>IAM: Convert to Employee
  HR->>IAM: Apply Onboarding Template
```

---

## 13) Notes for Implementation

* Keep ERD slices in separate schemas or modules to reduce coupling (monorepo friendly).
* Use **UUIDs** for keys; add `createdAt/updatedAt/deletedAt` on mutables.
* Indexes: tasks(projectId,status,assigneeId), transactions(projectId,date), invoices(status,dueDate), assets(clientSiteId,status), assignments(userId|candidateId,courseId).
* Enforce **approval checks** in write APIs (no bypass).
* Add **event bus** (internal) for Automations.

---

## 14) Open Questions (to finalize with stakeholders)

1. Do we need per-client **custom fields** in portals?
2. Any legal/e-sign integration for **contracts**?
3. Do we require **per-branch** pricing overrides at Client Site level?
4. First FX provider of record (daily rate source)?
5. SLA pause rules for after-hours and client-waiting: confirm.

---

**End of Ultra-Think ERD & Architecture**
