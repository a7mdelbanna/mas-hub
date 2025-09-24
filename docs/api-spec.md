# MAS Business OS - API Specification

## API Standards

### Base URLs
- **Development**: `https://mas-business-os-dev.cloudfunctions.net/api`
- **Staging**: `https://mas-business-os-staging.cloudfunctions.net/api`
- **Production**: `https://api.mas-business.com`

### Authentication
All API requests require Bearer token authentication:
```
Authorization: Bearer {firebase-id-token}
```

### Request/Response Format
- **Content-Type**: `application/json`
- **Accept**: `application/json`
- **Timezone**: UTC (ISO 8601 format)

### Standard Response Structure
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2024-01-24T12:00:00Z",
    "requestId": "uuid",
    "version": "1.0"
  }
}
```

### Error Response Structure
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {},
    "timestamp": "2024-01-24T12:00:00Z",
    "requestId": "uuid"
  }
}
```

### Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Rate Limiting
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640361600
```

## Authentication & Authorization APIs

### Login
```http
POST /auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "twoFactorCode": "123456"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "refreshToken": "refresh-token",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "roles": ["employee", "project_manager"],
      "permissions": ["projects:read", "projects:write"],
      "department": "engineering"
    },
    "expiresIn": 3600
  }
}
```

### Refresh Token
```http
POST /auth/refresh
```

**Request:**
```json
{
  "refreshToken": "refresh-token"
}
```

### Logout
```http
POST /auth/logout
```

### Reset Password
```http
POST /auth/reset-password
```

**Request:**
```json
{
  "email": "user@example.com"
}
```

## Projects Module APIs

### List Projects
```http
GET /projects?status=active&page=1&limit=20&sort=createdAt:desc
```

**Query Parameters:**
- `status`: `active`, `completed`, `on_hold`, `cancelled`
- `type`: Project type ID
- `managerId`: Filter by project manager
- `clientId`: Filter by client
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field and direction

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project-uuid",
        "name": "POS System Implementation",
        "type": "pos_system",
        "client": {
          "id": "client-uuid",
          "name": "Client Corp"
        },
        "status": "active",
        "progress": 45,
        "budget": {
          "estimated": 50000,
          "spent": 22500,
          "remaining": 27500
        },
        "startDate": "2024-01-01",
        "dueDate": "2024-06-30",
        "manager": {
          "id": "user-uuid",
          "name": "Jane Smith"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### Create Project
```http
POST /projects
```

**Request:**
```json
{
  "name": "New POS Implementation",
  "typeId": "pos_system",
  "clientId": "client-uuid",
  "managerId": "user-uuid",
  "templateId": "template-uuid",
  "startDate": "2024-02-01",
  "dueDate": "2024-07-31",
  "estimatedBudget": 75000,
  "description": "POS system for retail chain",
  "team": ["user-1", "user-2", "user-3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-project-uuid",
    "name": "New POS Implementation",
    "phases": [
      {
        "id": "phase-1",
        "name": "Discovery",
        "tasks": []
      }
    ]
  }
}
```

### Get Project Details
```http
GET /projects/{projectId}
```

### Update Project
```http
PUT /projects/{projectId}
```

### Delete Project
```http
DELETE /projects/{projectId}
```

### Create Task
```http
POST /projects/{projectId}/tasks
```

**Request:**
```json
{
  "title": "Design database schema",
  "description": "Create ERD for POS system",
  "phaseId": "phase-uuid",
  "assigneeId": "user-uuid",
  "priority": "high",
  "estimatedHours": 8,
  "dueDate": "2024-02-15",
  "dependencies": ["task-uuid-1"]
}
```

### Log Timesheet
```http
POST /projects/{projectId}/timesheets
```

**Request:**
```json
{
  "taskId": "task-uuid",
  "date": "2024-01-24",
  "hours": 4.5,
  "description": "Implemented user authentication",
  "billable": true
}
```

### Get Project Budget Status
```http
GET /projects/{projectId}/budget
```

**Response:**
```json
{
  "success": true,
  "data": {
    "estimated": 50000,
    "allocated": 45000,
    "spent": 22500,
    "committed": 5000,
    "remaining": 22500,
    "percentUsed": 45,
    "alerts": [
      {
        "level": "warning",
        "message": "Budget 45% consumed, 3 months remaining"
      }
    ]
  }
}
```

## Finance Module APIs

### Create Invoice
```http
POST /invoices
```

**Request:**
```json
{
  "clientId": "client-uuid",
  "projectId": "project-uuid",
  "type": "milestone",
  "dueDate": "2024-02-28",
  "currency": "USD",
  "items": [
    {
      "description": "Phase 1 Completion",
      "quantity": 1,
      "unitPrice": 15000,
      "tax": 0.15
    }
  ],
  "notes": "Payment due upon receipt"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "invoice-uuid",
    "number": "INV-2024-001",
    "total": 17250,
    "status": "draft",
    "paymentUrl": "https://portal.mas.com/pay/invoice-uuid"
  }
}
```

### Send Invoice
```http
POST /invoices/{invoiceId}/send
```

**Request:**
```json
{
  "recipients": ["client@example.com"],
  "cc": ["finance@mas.com"],
  "message": "Please find attached invoice for Phase 1"
}
```

### Process Payment
```http
POST /payments
```

**Request:**
```json
{
  "invoiceId": "invoice-uuid",
  "amount": 17250,
  "method": "stripe",
  "paymentMethodId": "pm_stripe_id",
  "currency": "USD"
}
```

### Stripe Webhook
```http
POST /payments/stripe/webhook
```

**Headers:**
```
Stripe-Signature: webhook-signature
```

### Paymob Callback
```http
POST /payments/paymob/callback
```

### Process Payroll
```http
POST /payroll/process
```

**Request:**
```json
{
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "type": "monthly",
  "includeBonuses": true,
  "includeDeductions": true
}
```

### Get Financial Reports
```http
GET /reports/financial?type=pnl&startDate=2024-01-01&endDate=2024-12-31
```

**Query Parameters:**
- `type`: `pnl`, `cashflow`, `balance_sheet`, `aging`
- `startDate`: Report start date
- `endDate`: Report end date
- `groupBy`: `month`, `quarter`, `year`
- `format`: `json`, `pdf`, `excel`

## CRM Module APIs

### Create Lead
```http
POST /leads
```

**Request:**
```json
{
  "company": "Prospect Corp",
  "contactName": "John Smith",
  "email": "john@prospect.com",
  "phone": "+1234567890",
  "source": "website",
  "interest": "pos_system",
  "estimatedValue": 50000
}
```

### Create Opportunity
```http
POST /opportunities
```

**Request:**
```json
{
  "accountId": "account-uuid",
  "name": "POS System Deal",
  "amount": 75000,
  "expectedCloseDate": "2024-03-31",
  "stage": "qualification",
  "probability": 30,
  "products": ["pos_software", "hardware", "support"]
}
```

### Move Opportunity Stage
```http
PUT /opportunities/{oppId}/stage
```

**Request:**
```json
{
  "stage": "proposal",
  "reason": "Client approved initial requirements",
  "nextSteps": "Send formal proposal by Friday"
}
```

### Create Quote
```http
POST /quotes
```

**Request:**
```json
{
  "opportunityId": "opp-uuid",
  "pricebookId": "pricebook-uuid",
  "validUntil": "2024-02-28",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 5,
      "discount": 0.1
    }
  ],
  "terms": "Net 30"
}
```

### Convert Deal to Project
```http
POST /opportunities/{oppId}/convert
```

**Request:**
```json
{
  "projectName": "Client POS Implementation",
  "projectTemplateId": "template-uuid",
  "startDate": "2024-02-01",
  "teamMembers": ["user-1", "user-2"]
}
```

## Support Module APIs

### Create Ticket
```http
POST /tickets
```

**Request:**
```json
{
  "clientId": "client-uuid",
  "subject": "POS Terminal Not Working",
  "description": "Terminal shows error on startup",
  "priority": "high",
  "category": "hardware",
  "assetId": "asset-uuid"
}
```

### Update Ticket Status
```http
PUT /tickets/{ticketId}/status
```

**Request:**
```json
{
  "status": "in_progress",
  "assigneeId": "tech-uuid",
  "notes": "Dispatching technician for on-site visit"
}
```

### Schedule Visit
```http
POST /tickets/{ticketId}/visits
```

**Request:**
```json
{
  "scheduledAt": "2024-01-25T10:00:00Z",
  "technicianId": "tech-uuid",
  "estimatedDuration": 2,
  "siteId": "site-uuid",
  "billable": true
}
```

### Get SLA Status
```http
GET /sla/status/{ticketId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "policy": "gold_sla",
    "responseTime": {
      "target": 60,
      "actual": 45,
      "status": "met"
    },
    "resolutionTime": {
      "target": 240,
      "elapsed": 120,
      "remaining": 120,
      "status": "on_track"
    }
  }
}
```

## LMS Module APIs

### Create Course
```http
POST /courses
```

**Request:**
```json
{
  "title": "POS System Training",
  "description": "Complete training for POS operators",
  "audience": ["employee", "client"],
  "duration": 120,
  "lessons": [
    {
      "title": "Introduction",
      "type": "video",
      "url": "https://videos.mas.com/intro.mp4",
      "duration": 15
    }
  ]
}
```

### Assign Course
```http
POST /courses/{courseId}/assign
```

**Request:**
```json
{
  "assignees": [
    {
      "userId": "user-uuid",
      "type": "employee",
      "dueDate": "2024-02-28"
    }
  ],
  "mandatory": true,
  "notifyAssignees": true
}
```

### Track Progress
```http
PUT /courses/{courseId}/progress
```

**Request:**
```json
{
  "lessonId": "lesson-uuid",
  "progress": 100,
  "completedAt": "2024-01-24T15:30:00Z"
}
```

### Submit Quiz
```http
POST /quizzes/{quizId}/submit
```

**Request:**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "answer": 2
    },
    {
      "questionId": "q2",
      "answer": 0
    }
  ],
  "timeSpent": 300
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "passed": true,
    "correctAnswers": 17,
    "totalQuestions": 20,
    "certificate": {
      "id": "cert-uuid",
      "url": "https://certs.mas.com/cert-uuid.pdf"
    }
  }
}
```

## HR Module APIs

### Create Candidate
```http
POST /candidates
```

**Request:**
```json
{
  "name": "Jane Developer",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "position": "Senior Developer",
  "cvUrl": "https://storage.mas.com/cvs/jane.pdf",
  "source": "linkedin",
  "skills": ["React", "Node.js", "TypeScript"]
}
```

### Schedule Interview
```http
POST /interviews
```

**Request:**
```json
{
  "candidateId": "candidate-uuid",
  "type": "technical",
  "scheduledAt": "2024-01-30T14:00:00Z",
  "interviewers": ["interviewer-1", "interviewer-2"],
  "location": "online",
  "meetingUrl": "https://meet.google.com/xxx"
}
```

### Convert Candidate to Employee
```http
POST /candidates/{candidateId}/hire
```

**Request:**
```json
{
  "startDate": "2024-02-15",
  "position": "Senior Developer",
  "department": "engineering",
  "salary": 120000,
  "employmentType": "full_time",
  "onboardingTemplateId": "onboard-template-uuid"
}
```

### Start Onboarding
```http
POST /employees/{employeeId}/onboard
```

**Request:**
```json
{
  "templateId": "onboard-template-uuid",
  "buddy": "mentor-uuid",
  "equipment": ["laptop", "phone", "access_card"],
  "trainings": ["course-1", "course-2"]
}
```

## Portal Module APIs

### Get Portal Dashboard
```http
GET /portal/{portalType}/dashboard
```

**Portal Types:** `client`, `employee`, `candidate`

**Response (Client Portal):**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project-uuid",
        "name": "POS Implementation",
        "progress": 65,
        "nextMilestone": "UAT"
      }
    ],
    "invoices": [
      {
        "id": "invoice-uuid",
        "number": "INV-2024-001",
        "amount": 15000,
        "status": "pending",
        "dueDate": "2024-02-15"
      }
    ],
    "tickets": [
      {
        "id": "ticket-uuid",
        "subject": "Support Request",
        "status": "open",
        "priority": "medium"
      }
    ],
    "trainings": [
      {
        "id": "course-uuid",
        "title": "POS Training",
        "progress": 30
      }
    ]
  }
}
```

### Create Portal Invite
```http
POST /portal/invites
```

**Request:**
```json
{
  "email": "client@example.com",
  "portalType": "client",
  "entityId": "client-uuid",
  "expiresIn": 604800,
  "sendEmail": true
}
```

### Update Portal Access
```http
PUT /portal/access
```

**Request:**
```json
{
  "userId": "user-uuid",
  "portalType": "client",
  "permissions": ["view_projects", "view_invoices", "create_tickets"],
  "active": true
}
```

## Automation Module APIs

### Create Automation Rule
```http
POST /automations/rules
```

**Request:**
```json
{
  "name": "Budget Alert",
  "trigger": {
    "type": "threshold",
    "entity": "project",
    "field": "budget.percentUsed",
    "operator": ">=",
    "value": 80
  },
  "conditions": [
    {
      "field": "status",
      "operator": "==",
      "value": "active"
    }
  ],
  "actions": [
    {
      "type": "notification",
      "recipients": ["manager", "finance"],
      "template": "budget_alert"
    },
    {
      "type": "create_task",
      "assignee": "manager",
      "title": "Review project budget"
    }
  ],
  "active": true
}
```

### Test Automation
```http
POST /automations/test
```

**Request:**
```json
{
  "ruleId": "rule-uuid",
  "testData": {
    "project": {
      "budget": {
        "percentUsed": 85
      },
      "status": "active"
    }
  }
}
```

### Get Automation History
```http
GET /automations/history?ruleId={ruleId}&startDate={date}&endDate={date}
```

## Webhook Endpoints

### Stripe Webhook
```http
POST /webhooks/stripe
```

**Headers:**
```
Stripe-Signature: t=timestamp,v1=signature
```

**Events Handled:**
- `payment_intent.succeeded`
- `payment_intent.failed`
- `invoice.paid`
- `subscription.created`
- `subscription.updated`
- `subscription.deleted`

### Paymob Webhook
```http
POST /webhooks/paymob
```

**Events Handled:**
- `transaction.processed`
- `transaction.failed`
- `refund.processed`

### GitHub Webhook
```http
POST /webhooks/github
```

**Events Handled:**
- `push`
- `pull_request`
- `issues`
- `release`

### Slack Webhook
```http
POST /webhooks/slack
```

**Events Handled:**
- `slash_commands`
- `interactive_messages`
- `events_api`

## Rate Limiting Strategy

### Rate Limit Tiers

| Tier | Requests/Min | Requests/Hour | Requests/Day |
|------|--------------|---------------|--------------|
| Anonymous | 10 | 100 | 500 |
| Basic | 60 | 1,000 | 10,000 |
| Premium | 300 | 10,000 | 100,000 |
| Enterprise | 1,000 | 50,000 | 500,000 |

### Rate Limit Headers
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640361600
X-RateLimit-Tier: premium
```

### Rate Limit Response (429)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded",
    "retryAfter": 60,
    "limit": 60,
    "reset": 1640361600
  }
}
```

## Pagination Standards

### Request Parameters
- `page`: Page number (1-based)
- `limit`: Items per page (max: 100)
- `cursor`: Cursor for cursor-based pagination
- `sort`: Sort field and direction (e.g., `createdAt:desc`)

### Response Format
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false,
    "nextCursor": "cursor-token",
    "prevCursor": null
  }
}
```

## Batch Operations

### Batch Request
```http
POST /batch
```

**Request:**
```json
{
  "operations": [
    {
      "method": "POST",
      "path": "/projects",
      "body": {}
    },
    {
      "method": "PUT",
      "path": "/tasks/task-1",
      "body": {}
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "status": 201,
      "body": {}
    },
    {
      "status": 200,
      "body": {}
    }
  ]
}
```

## WebSocket Events (Real-time)

### Connection
```javascript
wss://realtime.mas-business.com/socket?token={jwt-token}
```

### Subscribe to Events
```json
{
  "action": "subscribe",
  "channels": ["projects.{projectId}", "notifications.{userId}"]
}
```

### Event Format
```json
{
  "event": "project.updated",
  "data": {},
  "timestamp": "2024-01-24T12:00:00Z"
}
```

---

**Document Status**: COMPLETE
**Version**: 1.0
**Last Updated**: 2024-01-24
**API Version**: v1