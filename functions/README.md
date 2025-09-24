# MAS Business OS - Backend Functions

## Overview

This is the complete backend implementation for the MAS Business OS using Firebase Cloud Functions. The system provides a comprehensive suite of APIs for project management, finance, CRM, support, LMS, HR, and more.

## Architecture

```
functions/
├── src/
│   ├── config/           # Configuration and Firebase initialization
│   │   ├── firebase.ts   # Firebase admin SDK and constants
│   │   └── environment.ts # Environment-specific configuration
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # Authentication and authorization
│   │   └── validation.ts # Request validation with Zod
│   ├── repositories/     # Data access layer
│   │   └── BaseRepository.ts # Generic repository pattern
│   ├── services/         # Business logic layer
│   │   ├── ProjectService.ts
│   │   ├── FinanceService.ts
│   │   ├── CRMService.ts
│   │   └── ...
│   ├── api/             # REST API endpoints
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── finance/
│   │   └── ...
│   ├── webhooks/        # External webhook handlers
│   │   ├── stripe.ts
│   │   └── paymob.ts
│   ├── scheduled/       # Scheduled functions
│   │   ├── daily.ts
│   │   ├── weekly.ts
│   │   └── monthly.ts
│   ├── utils/           # Utility functions
│   │   ├── email.ts
│   │   ├── pdf.ts
│   │   └── helpers.ts
│   └── index.ts         # Main entry point
```

## Setup

### Prerequisites

- Node.js v20 or higher
- Firebase CLI
- TypeScript

### Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start local emulators
npm run serve
```

### Environment Configuration

Set Firebase functions configuration:

```bash
# Stripe configuration
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."

# Paymob configuration
firebase functions:config:set paymob.api_key="..."
firebase functions:config:set paymob.integration_id="..."

# SendGrid configuration
firebase functions:config:set sendgrid.api_key="..."
firebase functions:config:set sendgrid.from_email="noreply@mas-business.com"

# JWT configuration
firebase functions:config:set jwt.secret="your-secret-key"
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login with email/password |
| POST | `/api/auth/refresh` | Refresh authentication token |
| POST | `/api/auth/logout` | Logout and invalidate token |
| POST | `/api/auth/reset-password` | Request password reset |
| POST | `/api/auth/verify-token` | Verify and decode JWT token |

### Projects Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects with filtering |
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/{id}` | Get project details |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Soft delete project |
| POST | `/api/projects/{id}/tasks` | Create task in project |
| GET | `/api/projects/{id}/tasks` | List project tasks |
| POST | `/api/projects/{id}/timesheets` | Log time entry |
| GET | `/api/projects/{id}/budget` | Get budget status |

### Finance Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create invoice |
| GET | `/api/invoices/{id}` | Get invoice details |
| PUT | `/api/invoices/{id}` | Update invoice |
| POST | `/api/invoices/{id}/send` | Send invoice to client |
| POST | `/api/payments` | Process payment |
| GET | `/api/payments` | List payments |
| POST | `/api/payroll/process` | Process payroll |
| GET | `/api/reports/financial` | Get financial reports |

### CRM Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leads` | Create lead |
| GET | `/api/opportunities` | List opportunities |
| POST | `/api/opportunities` | Create opportunity |
| PUT | `/api/opportunities/{id}/stage` | Update opportunity stage |
| POST | `/api/opportunities/{id}/convert` | Convert to project |
| POST | `/api/quotes` | Create quote |
| GET | `/api/quotes/{id}` | Get quote details |

### Support Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | List support tickets |
| POST | `/api/tickets` | Create ticket |
| GET | `/api/tickets/{id}` | Get ticket details |
| PUT | `/api/tickets/{id}/status` | Update ticket status |
| POST | `/api/tickets/{id}/comments` | Add comment |
| POST | `/api/tickets/{id}/visits` | Schedule visit |
| GET | `/api/sla/status/{ticketId}` | Get SLA status |

### Portal APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portal/client/dashboard` | Client portal dashboard |
| GET | `/api/portal/employee/dashboard` | Employee portal dashboard |
| GET | `/api/portal/candidate/dashboard` | Candidate portal dashboard |
| POST | `/api/portal/invites` | Send portal invitation |

## Webhook Handlers

### Stripe Webhook
- **Endpoint**: `/webhooks/stripe`
- **Events Handled**:
  - `payment_intent.succeeded`
  - `payment_intent.failed`
  - `invoice.paid`
  - `subscription.created/updated/deleted`

### Paymob Webhook
- **Endpoint**: `/webhooks/paymob`
- **Events Handled**:
  - `transaction.processed`
  - `transaction.failed`
  - `refund.processed`

## Scheduled Functions

### Daily Tasks (9 AM UTC)
- Check overdue invoices
- SLA breach monitoring (every 15 min)
- Data cleanup (2 AM)

### Weekly Tasks (Monday 10 AM UTC)
- Generate weekly reports
- Backup critical data (Sunday 3 AM)

### Monthly Tasks (1st of month)
- Process recurring billing
- Contract renewal checks (28th)
- Performance reports

## Authentication & Authorization

### Authentication Flow
1. User logs in with email/password
2. Firebase verifies credentials
3. Custom JWT token generated with claims
4. Token includes:
   - User ID
   - Roles
   - Portal access
   - Account IDs (for client portal)

### Authorization Levels
- **Super Admin**: Full system access
- **Admin**: Organization-wide access
- **Manager**: Department-level access
- **User**: Own resources only
- **Client**: Client portal access only
- **Candidate**: Candidate portal access only

### Middleware Usage

```typescript
// Require authentication
app.use(authenticate);

// Require specific permission
app.use(authorize('projects', 'create'));

// Require admin role
app.use(requireAdmin);

// Portal-specific auth
app.use(authenticatePortal('client'));
```

## Data Validation

All API endpoints use Zod schemas for validation:

```typescript
// Example: Create project validation
const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  accountId: z.string().min(1),
  projectTypeId: z.string().min(1),
  managerId: z.string().min(1),
  startDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  estimateBudget: z.number().min(0),
  currency: z.enum(['USD', 'EGP', 'EUR']),
});
```

## Error Handling

Standard error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {},
    "timestamp": "2024-01-24T12:00:00Z",
    "requestId": "uuid"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `PAYMENT_FAILED` - Payment processing failed

## Business Logic Implementation

### Key Workflows

#### Deal to Project Conversion
1. Validate opportunity is in "Won" stage
2. Create project from opportunity data
3. Convert quote to contract
4. Generate project phases from template
5. Send portal invitations to client
6. Create kickoff tasks
7. Update opportunity status

#### Invoice Payment Processing
1. Receive payment webhook (Stripe/Paymob)
2. Verify webhook signature
3. Find related invoice
4. Create payment record
5. Update invoice status
6. Update account balance
7. Send receipt email
8. Trigger post-payment automations

#### Payroll Processing
1. Get all approved timesheets for period
2. Calculate employee salaries
3. Calculate contractor payments
4. Apply deductions and bonuses
5. Create payroll entries
6. Generate payment transactions
7. Send payslips

## Security

### Security Measures
- Firebase Authentication for all APIs
- Role-based access control (RBAC)
- Field-level permissions
- Input sanitization
- SQL injection prevention
- XSS protection
- Rate limiting per user/IP
- Audit logging for all operations

### Data Protection
- Encryption at rest (Firebase default)
- TLS for all communications
- Sensitive data masking in logs
- PCI compliance for payment data
- GDPR compliance for EU clients

## Performance Optimization

### Caching Strategy
- Redis for session data
- Firestore offline persistence
- CDN for static assets
- Computed fields for aggregations

### Database Optimization
- Composite indexes for all queries
- Denormalized data for reads
- Batch operations for writes
- Collection group queries

### Scaling
- Horizontal scaling with Cloud Functions
- Read replicas for reporting
- Async processing with Pub/Sub
- Rate limiting and throttling

## Monitoring & Logging

### Logging Levels
- `ERROR`: System errors and exceptions
- `WARNING`: Performance issues, deprecated features
- `INFO`: Important business events
- `DEBUG`: Detailed debugging information

### Metrics Tracked
- API response times
- Error rates
- Payment success rates
- User activity
- System resource usage

## Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

## Deployment

### Production Deployment

```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:projectAPI
```

### Environment-specific Deployment

```bash
# Deploy to staging
firebase use staging
firebase deploy --only functions

# Deploy to production
firebase use production
firebase deploy --only functions
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify Firebase Admin SDK is initialized
   - Check service account permissions
   - Ensure tokens are not expired

2. **Payment Webhook Failures**
   - Verify webhook secrets are configured
   - Check webhook URL is accessible
   - Ensure idempotency keys are implemented

3. **Performance Issues**
   - Check Firestore indexes
   - Review function cold starts
   - Optimize database queries

## Support

For issues or questions:
- GitHub Issues: https://github.com/a7mdelbanna/mas-hub/issues
- Documentation: /docs
- API Reference: /docs/api-spec.md

## License

Proprietary - MAS Business OS

---

**Version**: 1.0.0
**Last Updated**: September 2024
**Maintained By**: MAS Development Team