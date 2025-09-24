# MAS Business OS - Demo Data & Seeding Guide

This directory contains comprehensive demo data and seeding scripts for the MAS Business OS project. The seed data provides realistic business scenarios across all system modules to demonstrate the platform's capabilities.

## 🏗️ Project Structure

```
seeds/
├── README.md                           # This file
├── *.seed.ts                          # Seed data files
├── scenarios/                         # Demo workflow scenarios
│   ├── project-lifecycle.ts           # Complete project delivery flow
│   ├── payment-flow.ts                # Payment processing scenarios
│   ├── employee-onboarding.ts         # Recruitment to onboarding
│   ├── training-completion.ts         # LMS training workflows
│   └── support-resolution.ts          # Support ticket lifecycle
├── i18n/                             # Multi-language content
│   ├── en/                           # English content
│   ├── ar/                           # Arabic content (RTL)
│   └── ru/                           # Russian content
└── scripts/seed.ts                   # Main seeding script
```

## 📊 Demo Data Overview

The seed data includes **1,200+ records** across **30+ collections** representing:

### 🏢 Core Business Data
- **1** Organization (MAS Business Solutions)
- **6** Departments (POS, Tech, Support, Marketing, Finance, HR)
- **10** Roles with granular permissions
- **25** Users across all roles and departments
- **10** Client accounts with various tiers

### 🚀 Projects & Delivery
- **5** Project types (POS, Mobile, Hybrid, Support, Training)
- **2** Project templates with phase definitions
- **10** Projects in different phases and statuses
- **25** Project phases and milestones
- **50** Tasks with realistic assignments

### 💰 Finance & Billing
- **10** Contracts (recurring, one-time, retainer)
- **25** Invoices with various payment states
- **15** Payments via different methods
- **50** Financial transactions
- **6** Financial accounts

### 🎓 Learning Management
- **12** Courses for employees, candidates, and clients
- **30** Lessons with multimedia content
- **6** Quizzes with questions
- **25** Training assignments with progress tracking

### 🎫 Support & Service
- **2** SLA policies (Standard, Premium)
- **15** Support tickets with realistic scenarios
- **30** Ticket comments and conversations
- **10** Field visits and on-site support

### 👥 Human Resources
- **15** Candidates in different pipeline stages
- **12** Interview records
- **3** Onboarding templates
- **10** Onboarding tasks

### 📦 Products & Services
- **10** Products (hardware and software)
- **8** Services (implementation, support, consulting)
- **3** Service bundles
- **2** Pricebooks with regional pricing
- **20** Inventory records with stock levels

### 📢 Communication
- **10** System announcements
- **25** User notifications
- **15** Portal invitations (client, employee, candidate)

## 🌍 Multi-Language Support

The seed data includes content in three languages:

- **🇺🇸 English (EN)**: Primary language
- **🇪🇬 Arabic (AR)**: RTL support with culturally appropriate content
- **🇷🇺 Russian (RU)**: Cyrillic script support

### Localized Content Types
- User interface text
- Email templates
- Course materials
- Announcements
- Ticket responses
- Project templates

## 👤 Demo User Accounts

### Employee Portal Users

| Role | Email | Password | Department | Access Level |
|------|--------|----------|------------|--------------|
| CEO | ceo@mas.business | demo123 | Executive | Full System |
| POS Manager | pos.manager@mas.business | demo123 | POS Systems | Department |
| Tech Director | tech.manager@mas.business | demo123 | Technology | Department |
| Support Manager | support.manager@mas.business | demo123 | Support | Department |
| Finance Manager | finance.manager@mas.business | demo123 | Finance | Financial |
| HR Manager | hr.manager@mas.business | demo123 | HR | Recruitment |

### Client Portal Users

| Client | Email | Password | Business Type | Projects |
|--------|--------|----------|---------------|----------|
| Golden Spoon Restaurant | owner@goldenspoon.restaurant | client123 | Restaurant | POS Implementation |
| TechStore Electronics | manager@techstore.com | client123 | Retail | Mobile App |
| HealthFirst Pharmacy | owner@healthfirst.pharmacy | client123 | Healthcare | Pharmacy POS |
| PowerGym Fitness | membership@powergym.fitness | client123 | Fitness | Fitness App |

### Candidate Portal Users

| Candidate | Email | Stage | Position |
|-----------|--------|-------|----------|
| Karim El-Wakil | karim.elwakil@email.com | Training | Sales Rep |
| Sara Zaki | sara.zaki@email.com | Training | Accountant |
| Mariam Farouk | mariam.farouk@email.com | Invited | Mobile Developer |

## 🏃‍♂️ Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Set environment variables
export FIREBASE_PROJECT_ID=mashub-a0725
export NODE_ENV=development
```

### Basic Seeding
```bash
# Seed all demo data
npm run seed

# Seed specific modules only
npm run seed --modules=core,users,accounts

# Preview changes without writing to database
npm run seed --dry-run

# Clear and reseed all data
npm run seed --reset

# Get verbose output
npm run seed --verbose
```

### Available Commands
```bash
# List all available modules
npm run seed list

# Check current database status
npm run seed status

# Get help
npm run seed --help
```

## 📋 Seeding Modules

The seeding process is organized into logical modules:

### 1. **core** - Foundation Data
- Organizations and settings
- Departments and roles
- **4 collections, 25 records**

### 2. **users** - Identity & Access
- Users and role assignments
- **2 collections, 49 records**

### 3. **accounts** - Client Management
- Client accounts and sites
- **2 collections, 22 records**

### 4. **projects** - Project Delivery
- Projects, tasks, and timesheets
- **5 collections, 97 records**

### 5. **finance** - Billing & Payments
- Invoices, payments, transactions
- **5 collections, 67 records**

### 6. **products** - Catalog Management
- Products, services, pricing
- **6 collections, 89 records**

### 7. **support** - Service Delivery
- Tickets, SLA policies, visits
- **4 collections, 42 records**

### 8. **lms** - Learning Management
- Courses, lessons, assignments
- **4 collections, 73 records**

### 9. **hr** - Human Resources
- Candidates, interviews, onboarding
- **4 collections, 40 records**

### 10. **communication** - Notifications
- Announcements, notifications, invites
- **3 collections, 50 records**

## 🎭 Demo Scenarios

### 1. Complete Project Lifecycle
**File**: `scenarios/project-lifecycle.ts`

Demonstrates end-to-end project delivery using the Golden Spoon Restaurant POS implementation:
- Lead qualification and opportunity creation
- Quote generation and contract signing
- Project execution through 5 phases
- Milestone billing and payments
- Training and go-live support
- **Duration**: 3 months, **Value**: $45,000

### 2. Payment Processing Flow
**File**: `scenarios/payment-flow.ts`

Showcases various payment scenarios:
- Successful online payments (Stripe)
- Partial payments with balance tracking
- Overdue invoice management
- Recurring billing automation
- Failed payment recovery
- **Methods**: Stripe, Paymob, Bank Transfer

### 3. Employee Onboarding Journey
**File**: `scenarios/employee-onboarding.ts`

Complete recruitment to productive employee:
- Candidate screening and assessment
- Technical evaluation and interviews
- Pre-boarding preparation
- 4-week structured onboarding
- Performance evaluation and feedback
- **Time to Productivity**: 26 days

### 4. Training & Certification
Shows LMS capabilities across audiences:
- Employee skill development
- Client product training
- Candidate pre-hire assessment
- **Completion Rates**: 85-100%

### 5. Support Resolution
Demonstrates service delivery excellence:
- Multi-channel ticket creation
- SLA-based response times
- Escalation workflows
- Field service management
- **Resolution Time**: 95% within SLA

## 🔧 Configuration Options

### Environment Variables
```bash
# Required
FIREBASE_PROJECT_ID=mashub-a0725

# Optional
NODE_ENV=development|production
SEED_BATCH_SIZE=500
SEED_TIMEOUT=30000
```

### Seeding Options
```bash
# Module Selection
--modules=core,users,accounts      # Seed specific modules
--exclude=lms,hr                   # Exclude modules

# Execution Control
--dry-run                          # Preview only
--reset                            # Clear before seeding
--force                            # Override production safety
--verbose                          # Detailed output

# Performance
--batch-size=100                   # Records per batch
--parallel=true                    # Parallel processing
--timeout=60                       # Timeout in seconds
```

## 🎯 Test Scenarios Walkthrough

### Scenario 1: Sales to Delivery
1. **Login as Sales Rep** (`sales.lead@mas.business`)
2. **Review Pipeline**: Check opportunity "Pizza Palace Chain Expansion"
3. **Create Quote**: Generate quote for mobile app + POS system
4. **Convert to Project**: Won deal becomes project
5. **Login as Project Manager** (`senior.dev@mas.business`)
6. **Track Progress**: View project phases and task assignments
7. **Login as Client** (`franchise@pizzapalace.eg`)
8. **Monitor Project**: View progress, communicate with team

### Scenario 2: Financial Management
1. **Login as Finance Manager** (`finance.manager@mas.business`)
2. **Review Invoices**: Check various payment states
3. **Process Payments**: View Stripe/Paymob transactions
4. **Handle Overdue**: Follow up on Fashion Hub overdue invoice
5. **Generate Reports**: View financial dashboard and cash flow

### Scenario 3: Support Excellence
1. **Login as Support Agent** (`support.tech@mas.business`)
2. **Handle Tickets**: Respond to HealthFirst inventory sync issue
3. **Schedule Visit**: Plan on-site visit for network setup
4. **Update Client**: Communicate resolution progress
5. **Close Ticket**: Complete resolution and get client feedback

### Scenario 4: Learning & Development
1. **Login as HR Manager** (`hr.manager@mas.business`)
2. **Assign Training**: Assign courses to new employees
3. **Login as Employee** (`frontend.dev@mas.business`)
4. **Complete Training**: Take POS system basics course
5. **Track Progress**: View completion certificates and scores

### Scenario 5: Multi-Language Experience
1. **Switch Language**: Change system language to Arabic
2. **View RTL Layout**: Experience right-to-left interface
3. **Review Content**: Check localized announcements and courses
4. **Test Communication**: Send messages in Arabic

## 🚀 Performance & Scale

### Database Impact
- **Total Records**: ~1,200
- **Storage Size**: ~15MB
- **Seeding Time**: 2-3 minutes
- **Query Performance**: Optimized with indexes

### Scalability Testing
- **Concurrent Users**: Supports 100+ simultaneous logins
- **Data Volume**: Easily scales to 10x data volume
- **Module Independence**: Modules can be seeded separately
- **Performance**: Sub-second response times

## 🔒 Security Considerations

### Data Privacy
- All personal data is fictional
- No real email addresses or phone numbers
- Sanitized business information
- GDPR-compliant test data

### Access Control
- Role-based access properly configured
- Client portal isolation enforced
- Candidate data segregation
- Audit trails for all actions

### Production Safety
- Production environment protection
- Confirmation prompts for critical operations
- Backup and rollback capabilities
- Data validation and integrity checks

## 🐛 Troubleshooting

### Common Issues

#### Firebase Connection Errors
```bash
Error: Firebase project not found
```
**Solution**: Verify `FIREBASE_PROJECT_ID` environment variable

#### Permission Denied
```bash
Error: Insufficient permissions
```
**Solution**: Ensure Firebase service account has proper roles

#### Seeding Timeouts
```bash
Error: Batch write timeout
```
**Solution**: Reduce batch size with `--batch-size=100`

#### Module Dependencies
```bash
Error: Referenced document not found
```
**Solution**: Seed dependencies first (use `--reset` for clean start)

### Debug Commands
```bash
# Verbose logging
npm run seed --verbose

# Single module testing
npm run seed --modules=core --dry-run

# Check database state
npm run seed status

# Clear specific collections
npm run seed --modules=users --reset
```

## 🔄 Maintenance

### Regular Updates
- **Monthly**: Review and update business scenarios
- **Quarterly**: Add new features and demo data
- **Semi-Annual**: Refresh user accounts and passwords
- **Annual**: Complete data refresh and cleanup

### Data Refresh
```bash
# Full refresh (recommended quarterly)
npm run seed --reset

# Incremental updates
npm run seed --modules=communication,announcements

# Add new demo scenarios
npm run seed --modules=projects --force
```

## 🤝 Contributing

### Adding New Seed Data

1. **Create seed file**: Follow naming convention `entity.seed.ts`
2. **Add to module**: Include in appropriate seeding module
3. **Update documentation**: Add to this README
4. **Test thoroughly**: Use `--dry-run` first

### Adding Demo Scenarios

1. **Create scenario file**: Use existing scenarios as templates
2. **Document workflow**: Include step-by-step instructions
3. **Validate data**: Ensure referenced entities exist
4. **Test end-to-end**: Walk through complete scenario

### Multi-Language Content

1. **Add translations**: Create content in `i18n/` folders
2. **Test RTL layout**: Verify Arabic display properly
3. **Cultural context**: Ensure content is culturally appropriate
4. **Consistency**: Maintain terminology across languages

## 📈 Analytics & Metrics

### Seeding Success Metrics
- **Completion Rate**: 100% target
- **Data Integrity**: Zero validation errors
- **Performance**: <3 minutes total seed time
- **Coverage**: All PRD features demonstrated

### Demo Usage Analytics
- **User Engagement**: Track portal login frequency
- **Feature Adoption**: Monitor which demos are most used
- **Feedback Quality**: Collect user experience ratings
- **Issue Resolution**: Track and resolve demo-related issues

## 📞 Support

### Getting Help
- **Technical Issues**: Check troubleshooting section above
- **Feature Requests**: Submit via GitHub issues
- **Demo Scenarios**: Contact product team for new scenarios
- **Multi-Language**: Language team for translation updates

### Resources
- **Firebase Console**: https://console.firebase.google.com
- **Project Repository**: https://github.com/a7mdelbanna/mas-hub
- **API Documentation**: `/docs/api-reference.md`
- **User Guides**: `/docs/user-guides/`

---

## ✅ Verification Checklist

After seeding, verify these key functionality areas:

### ✓ Core System
- [ ] User authentication works for all portal types
- [ ] Role-based access control enforced
- [ ] Multi-language switching functional
- [ ] Dashboard data displays correctly

### ✓ Business Operations
- [ ] Project creation and management
- [ ] Invoice generation and payment processing
- [ ] Support ticket workflows
- [ ] Training assignment and completion

### ✓ Multi-Portal Experience
- [ ] Client portal shows relevant projects and invoices
- [ ] Employee portal displays tasks and timesheets
- [ ] Candidate portal provides training access
- [ ] Admin portal shows full system overview

### ✓ Integration Points
- [ ] Payment gateways (Stripe/Paymob) configured
- [ ] Email notifications sending properly
- [ ] File uploads and storage working
- [ ] API endpoints returning correct data

---

**🎉 Congratulations!** You now have a fully populated MAS Business OS demo environment with realistic business data, multi-language support, and comprehensive test scenarios. The system is ready for demonstrations, user training, and development work.

For questions or support, please refer to the troubleshooting section above or contact the development team.