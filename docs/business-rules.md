# MAS Business OS - Business Rules Documentation

## Table of Contents
1. [Overview](#overview)
2. [Approval Workflows](#approval-workflows)
3. [Automation Rules](#automation-rules)
4. [SLA Policies](#sla-policies)
5. [Workflow Conversions](#workflow-conversions)
6. [Security Rules](#security-rules)
7. [Validation Rules](#validation-rules)
8. [Scheduled Tasks](#scheduled-tasks)

## Overview

This document outlines all business rules implemented in the MAS Business OS system. These rules enforce business logic, automate workflows, and ensure data integrity across the platform.

## Approval Workflows

### Discount Approvals

| Discount % | Approval Required | Escalation |
|------------|------------------|------------|
| ≤ 10% | Auto-approved | None |
| 11-20% | Sales Manager | None |
| 21-30% | Sales Manager → Finance Manager | Sequential |
| > 30% | Sales Manager → Finance Manager → Admin/CEO | Sequential |

**Implementation**: `functions/src/rules/approval-rules.ts`

### Budget Approvals

| Budget Increase | Approval Required | Notes |
|-----------------|------------------|-------|
| ≤ $5,000 | Project Manager | Direct approval |
| $5,001-$20,000 | Department Head | Escalated |
| $20,001-$50,000 | Department Head → Finance Manager | Sequential |
| > $50,000 | Department Head → Finance Manager → CEO | Full chain |

**Alerts**:
- 80% budget usage: Warning to Project Manager
- 90% budget usage: Alert to Department Head
- 100% budget usage: Block new expenses, create review task

### Hiring Approvals

| Salary Range | Approval Chain | Additional Requirements |
|--------------|----------------|------------------------|
| ≤ $50,000 | Department Head → HR Manager | Standard process |
| $50,001-$100,000 | Department Head → HR Manager → Finance Manager | Financial review |
| > $100,000 | Department Head → HR Manager → Finance Manager → CEO | Executive approval |

### Expense Approvals

| Amount | Approval Required | Processing |
|--------|------------------|------------|
| ≤ $500 | Auto-approved | Immediate |
| $501-$2,000 | Direct Manager | 24 hours |
| $2,001-$10,000 | Manager → Department Head | 48 hours |
| > $10,000 | Manager → Department Head → Finance Manager → Admin | 72 hours |

## Automation Rules

### Invoice Overdue Automation

**Trigger**: Invoice due date passed

**Actions by Days Overdue**:
- **Day 1**: Send friendly reminder email
- **Day 7**: Send urgent reminder + notify account manager
- **Day 15**: Block client portal access + final notice + escalate to finance
- **Day 30**: Move to collections + executive escalation

**Implementation**: `functions/src/rules/automation-rules.ts`

### Deal Won → Project Creation

**Trigger**: Opportunity status changed to "Won"

**Automated Actions**:
1. Create project with deal information
2. Generate project phases from template
3. Create kickoff tasks:
   - Schedule kickoff meeting (due in 2 days)
   - Prepare project charter (due in 3 days)
   - Setup workspace (due in 1 day)
   - Identify team (due in 2 days)
   - Create communication plan (due in 5 days)
4. Enable client portal access
5. Send welcome email to client
6. Notify project team

### Quote Approved → Contract Generation

**Trigger**: Quote status changed to "Accepted"

**Automated Actions**:
1. Generate contract from quote
2. Create billing schedule
3. Attach SLA policy if applicable
4. Create signature request task
5. Notify sales team
6. Update opportunity status

### Ticket Creation → SLA Timer

**Trigger**: New ticket created

**Automated Actions**:
1. Calculate SLA targets based on priority
2. Start SLA timer
3. Auto-assign to available agent
4. Send acknowledgment email
5. Schedule SLA breach checks

### Candidate Invited → Portal Access

**Trigger**: Candidate stage changed to "Invited"

**Automated Actions**:
1. Generate portal invite token
2. Assign pre-hire training courses
3. Send invitation email
4. Create follow-up task for HR (7 days)
5. Track portal activation

### Employee Onboarding

**Trigger**: New employee record created

**Automated Actions**:
1. Create onboarding checklist from template
2. Assign mandatory training
3. Create equipment request
4. Schedule first day meeting
5. Grant system access
6. Send welcome email

## SLA Policies

### Ticket Response Times

| Priority | First Response | Resolution | Update Frequency |
|----------|---------------|------------|------------------|
| Critical | 15 minutes | 4 hours | Every 30 minutes |
| High | 1 hour | 8 hours | Every 2 hours |
| Medium | 4 hours | 24 hours | Every 8 hours |
| Low | 24 hours | 72 hours | Daily |

**Business Hours**: Monday-Friday, 9:00 AM - 6:00 PM (Cairo Time)

### SLA Breach Escalation

| Threshold | Action | Notification |
|-----------|--------|--------------|
| 50% time used | Warning | Assignee |
| 75% time used | Alert | Assignee + Manager |
| 90% time used | Critical Alert | Manager + Department Head |
| 100% (Breach) | Escalation | Executive + Auto-reassign |

**Pause Conditions**:
- Waiting for customer response
- Scheduled maintenance windows
- After hours (if not 24/7 support)
- Public holidays

## Workflow Conversions

### Deal to Project Conversion

**Prerequisites**:
- Deal status = "Won"
- Amount > 0
- Account verified

**Process**:
1. Validate deal data
2. Create project structure
3. Copy relevant information
4. Setup project team
5. Enable client access
6. Archive opportunity

### Quote to Contract Conversion

**Prerequisites**:
- Quote status = "Accepted"
- Valid until date not passed
- Line items present

**Process**:
1. Generate contract number
2. Set contract terms
3. Create billing schedule
4. Request signatures
5. Activate upon signing

### Candidate to Employee Conversion

**Prerequisites**:
- Candidate stage = "Hired"
- Background check complete
- Offer accepted

**Process**:
1. Create employee record
2. Transfer training progress
3. Setup payroll
4. Create system accounts
5. Schedule orientation
6. Deactivate candidate portal

## Security Rules

### Role-Based Access Control (RBAC)

**System Roles**:
- `super_admin`: Full system access
- `admin`: Administrative access
- `department_manager`: Department-level access
- `project_manager`: Project management
- `finance_manager`: Financial operations
- `hr_manager`: Human resources
- `sales_manager`: Sales and CRM
- `support_manager`: Support operations

### Portal Access Control

**Client Portal**:
- View own projects
- Access invoices and payments
- Download documents marked as client-visible
- Submit support tickets
- Access training materials

**Employee Portal**:
- View assigned tasks
- Submit timesheets
- Access payroll information
- View announcements
- Complete training

**Candidate Portal**:
- View application status
- Complete assessments
- Access pre-hire training
- Upload documents

### Financial Operations

**Forced Through Cloud Functions**:
- Invoice creation/updates
- Payment processing
- Transaction recording
- Payroll processing

**Reason**: Ensures data integrity and audit trail

## Validation Rules

### Data Validation

**Email Validation**:
```regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
```

**Phone Number Validation**:
- Must include country code
- 10-15 digits total

**Date Validation**:
- Start date must be before end date
- Due dates cannot be in the past
- Business days calculation excludes weekends/holidays

### Business Logic Validation

**Project Creation**:
- Budget > 0
- Valid project type
- Assigned manager exists
- Account is active

**Invoice Creation**:
- Line items present
- Total > 0
- Valid payment terms
- Account not blocked

**Task Assignment**:
- Assignee is active user
- User has project access
- Not assigned to terminated employee

## Scheduled Tasks

### Daily Tasks

**9:00 AM Cairo Time**:
- Check overdue invoices
- Process SLA breach checks
- Send daily digest emails
- Update project metrics

**6:00 PM Cairo Time**:
- Generate timesheet reminders
- Close expired quotes
- Archive completed tasks

### Weekly Tasks

**Monday 8:00 AM**:
- Generate weekly reports
- Send project status updates
- Process recurring invoices
- Review pending approvals

**Friday 5:00 PM**:
- Backup critical data
- Generate payroll preview
- Send weekend on-call schedule

### Monthly Tasks

**1st of Month**:
- Process monthly billing
- Generate financial reports
- Update subscription renewals
- Review SLA performance

**Last Day of Month**:
- Process payroll
- Close monthly books
- Generate commission calculations
- Archive old logs

## Business Rule Enforcement

### Critical Rules

1. **No Direct Financial Writes**: All financial operations must go through Cloud Functions
2. **Audit Trail**: All data modifications must be logged
3. **Data Isolation**: Multi-tenant data must be completely isolated
4. **Soft Deletes**: No hard deletes for critical records
5. **Approval Chain**: Cannot skip approval levels

### Performance Optimization

1. **Batch Operations**: Process bulk updates in batches of 500
2. **Async Processing**: Long-running operations use queues
3. **Caching**: Frequently accessed data cached for 5 minutes
4. **Index Strategy**: Composite indexes for complex queries

### Error Handling

1. **Retry Logic**: 3 attempts with exponential backoff
2. **Dead Letter Queue**: Failed operations after retries
3. **Notification**: Admin alerted for critical failures
4. **Rollback**: Transaction support for multi-step operations

## Testing Requirements

### Unit Tests

- Each business rule must have corresponding tests
- Minimum 80% code coverage
- Test both success and failure paths

### Integration Tests

- End-to-end workflow testing
- Multi-user scenarios
- Concurrent operation handling

### Security Tests

- Permission boundary testing
- Data isolation verification
- Injection attack prevention

## Deployment Notes

### Environment Variables Required

```bash
CLIENT_PORTAL_URL=https://portal.mas-hub.com
EMPLOYEE_PORTAL_URL=https://employees.mas-hub.com
CANDIDATE_PORTAL_URL=https://careers.mas-hub.com
STRIPE_WEBHOOK_SECRET=whsec_...
PAYMOB_API_KEY=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@mas-hub.com
```

### Firebase Functions Configuration

```bash
firebase functions:config:set \
  stripe.webhook_secret="..." \
  paymob.api_key="..." \
  email.smtp_host="smtp.gmail.com" \
  email.smtp_port="587" \
  email.smtp_user="noreply@mas-hub.com"
```

### Deployment Commands

```bash
# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Storage rules
firebase deploy --only storage

# Deploy only Functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:onInvoiceCreated

# Full deployment
firebase deploy
```

## Monitoring & Alerts

### Key Metrics to Monitor

1. **SLA Breach Rate**: Target < 5%
2. **Invoice Collection Rate**: Target > 95% within 30 days
3. **Approval Processing Time**: Target < 24 hours
4. **System Uptime**: Target > 99.9%
5. **API Response Time**: Target < 200ms average

### Alert Thresholds

- **Critical**: SLA breach, payment failure, system down
- **High**: Budget exceeded, overdue invoice > 30 days
- **Medium**: Approval pending > 48 hours, low stock
- **Low**: Training overdue, profile incomplete

## Support & Maintenance

### Regular Maintenance Tasks

- **Daily**: Review error logs, check scheduled task execution
- **Weekly**: Performance metrics review, security scan
- **Monthly**: Database optimization, archive old data
- **Quarterly**: Security audit, dependency updates

### Troubleshooting Guide

Common issues and solutions documented in `/docs/troubleshooting.md`

---

**Document Version**: 1.0
**Last Updated**: 2024-01-24
**Maintained By**: MAS DevOps Team
**Review Cycle**: Quarterly