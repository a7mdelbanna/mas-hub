# MAS Business OS - Deployment Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Environment Setup](#environment-setup)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Deployment Procedures](#deployment-procedures)
7. [Monitoring & Alerting](#monitoring--alerting)
8. [Security Considerations](#security-considerations)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)
11. [Runbooks](#runbooks)

## Overview

This document provides comprehensive guidance for deploying and managing the MAS Business OS, a React + Firebase application with multi-environment support, automated CI/CD pipelines, and comprehensive monitoring.

### Key Features

- **Multi-Environment Support**: Development, Staging, and Production
- **Zero-Downtime Deployments**: Blue-green deployment strategy
- **Automated Rollback**: Automatic rollback on failure detection
- **Comprehensive Security**: Vulnerability scanning and security monitoring
- **Performance Monitoring**: Real-time metrics and alerting
- **Disaster Recovery**: Automated backups and recovery procedures

## Architecture

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
                    │   GitHub Actions   │
                    │    CI/CD Pipeline  │
                    └─────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌───────▼────────┐   ┌───────▼────────┐
│  Development   │   │    Staging     │   │   Production   │
│   Environment  │   │  Environment   │   │  Environment   │
└────────────────┘   └────────────────┘   └────────────────┘
```

### Technology Stack

- **Frontend**: React 18+ with TypeScript, Material-UI
- **Backend**: Firebase Cloud Functions (Node.js 18)
- **Database**: Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting with CDN
- **Monitoring**: Google Cloud Monitoring + Custom Dashboards
- **CI/CD**: GitHub Actions

### Environment Configuration

| Environment | Purpose | Firebase Project | URL |
|-------------|---------|------------------|-----|
| Development | Feature development | `mashub-dev-a0725` | `https://mashub-dev-a0725.web.app` |
| Staging | UAT and pre-production | `mashub-staging-a0725` | `https://mashub-staging-a0725.web.app` |
| Production | Live system | `mashub-a0725` | `https://mashub-a0725.web.app` |

## Prerequisites

### Required Software

1. **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
2. **Firebase CLI**: `npm install -g firebase-tools`
3. **Docker**: Download from [docker.com](https://www.docker.com/)
4. **Git**: Version control system
5. **jq**: JSON processor for scripts

### Required Accounts & Access

1. **Firebase**: Access to all three project environments
2. **GitHub**: Repository access and Actions permissions
3. **Google Cloud**: Service account with appropriate permissions
4. **Stripe**: Test and live API keys
5. **Paymob**: Integration credentials
6. **Sentry**: Error tracking (optional)

### System Requirements

- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: Minimum 20GB free space
- **Network**: Stable internet connection
- **OS**: macOS, Linux, or Windows with WSL2

## Environment Setup

### 1. Local Development Setup

```bash
# Clone the repository
git clone https://github.com/a7mdelbanna/mas-hub.git
cd mas-hub

# Run setup script
./scripts/setup-env.sh local --all

# Start development environment
docker-compose up -d
```

Access the application:
- App: http://localhost:3000
- Firebase UI: http://localhost:4000
- Grafana: http://localhost:3001 (admin/admin)

### 2. GitHub Secrets Configuration

Configure the following secrets in GitHub repository settings:

#### Firebase Credentials
```
FIREBASE_TOKEN                    # Firebase CLI token
FIREBASE_SERVICE_ACCOUNT_DEVELOPMENT
FIREBASE_SERVICE_ACCOUNT_STAGING
FIREBASE_SERVICE_ACCOUNT_PRODUCTION
```

#### Firebase Configuration (per environment)
```
FIREBASE_API_KEY_DEVELOPMENT
FIREBASE_AUTH_DOMAIN_DEVELOPMENT
FIREBASE_STORAGE_BUCKET_DEVELOPMENT
FIREBASE_MESSAGING_SENDER_ID_DEVELOPMENT
FIREBASE_APP_ID_DEVELOPMENT

FIREBASE_API_KEY_STAGING
FIREBASE_AUTH_DOMAIN_STAGING
FIREBASE_STORAGE_BUCKET_STAGING
FIREBASE_MESSAGING_SENDER_ID_STAGING
FIREBASE_APP_ID_STAGING

FIREBASE_API_KEY_PRODUCTION
FIREBASE_AUTH_DOMAIN_PRODUCTION
FIREBASE_STORAGE_BUCKET_PRODUCTION
FIREBASE_MESSAGING_SENDER_ID_PRODUCTION
FIREBASE_APP_ID_PRODUCTION
```

#### Payment Gateway Credentials
```
STRIPE_SECRET_KEY_DEVELOPMENT
STRIPE_SECRET_KEY_STAGING
STRIPE_SECRET_KEY_PRODUCTION
STRIPE_PUBLIC_KEY_DEVELOPMENT
STRIPE_PUBLIC_KEY_STAGING
STRIPE_PUBLIC_KEY_PRODUCTION

PAYMOB_API_KEY_DEVELOPMENT
PAYMOB_API_KEY_STAGING
PAYMOB_API_KEY_PRODUCTION
PAYMOB_PUBLIC_KEY_DEVELOPMENT
PAYMOB_PUBLIC_KEY_STAGING
PAYMOB_PUBLIC_KEY_PRODUCTION
```

#### Notification Services
```
SLACK_WEBHOOK_URL
SLACK_WEBHOOK_URL_DEVELOPMENT
SLACK_WEBHOOK_URL_STAGING
SLACK_WEBHOOK_URL_PRODUCTION
SLACK_WEBHOOK_EMERGENCY
SLACK_SECURITY_WEBHOOK_URL

EMAIL_SMTP_HOST
EMAIL_SMTP_USER
EMAIL_SMTP_PASSWORD
```

#### Monitoring & Security
```
SENTRY_DSN_DEVELOPMENT
SENTRY_DSN_STAGING
SENTRY_DSN_PRODUCTION

GA_MEASUREMENT_ID_PRODUCTION

SNYK_TOKEN
SEMGREP_APP_TOKEN
```

#### Testing
```
TEST_USER_EMAIL
TEST_USER_PASSWORD
DEPLOYMENT_WEBHOOK_URL
```

### 3. Firebase Project Setup

For each environment, ensure the following are configured:

1. **Authentication**: Enable Email/Password provider
2. **Firestore**: Set up with security rules
3. **Storage**: Configure with appropriate rules
4. **Functions**: Deploy with environment-specific configuration
5. **Hosting**: Set up with custom domain (production)

## CI/CD Pipeline

### Pipeline Overview

The CI/CD pipeline consists of five main workflows:

1. **Continuous Integration** (`ci.yml`)
2. **Development Deployment** (`deploy-dev.yml`)
3. **Staging Deployment** (`deploy-staging.yml`)
4. **Production Deployment** (`deploy-prod.yml`)
5. **Security Scanning** (`security-scan.yml`)

### Pipeline Triggers

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| CI | Push/PR to main, develop | Code quality, testing, building |
| Deploy Dev | Push to develop | Automatic development deployment |
| Deploy Staging | Push to main | Staging deployment with comprehensive testing |
| Deploy Prod | Release published | Production deployment with approval |
| Security Scan | Daily, PR | Vulnerability and security scanning |

### Workflow Details

#### 1. Continuous Integration (CI)

**Stages:**
1. **Setup**: Install dependencies, cache management
2. **Lint & Format**: ESLint, Prettier, TypeScript checking
3. **Test Frontend**: Unit tests, coverage reporting
4. **Test Functions**: Firebase Functions testing
5. **Build**: Multi-environment builds
6. **Integration Tests**: End-to-end testing
7. **Quality Gates**: Security audits, bundle analysis

**Quality Gates:**
- All tests must pass (>80% coverage)
- No linting errors
- No critical security vulnerabilities
- Bundle size within limits

#### 2. Development Deployment

**Stages:**
1. **Frontend Deploy**: Build and deploy to Firebase Hosting
2. **Functions Deploy**: Deploy with development configuration
3. **Database Deploy**: Firestore rules and indexes
4. **Smoke Tests**: Basic functionality verification
5. **Performance Tests**: Lighthouse auditing

**Auto-Triggers:** Push to `develop` branch

#### 3. Staging Deployment

**Stages:**
1. **Pre-deployment Checks**: Verify CI status
2. **Blue-Green Deploy**: Preview channel deployment
3. **Functions Deploy**: Staging environment functions
4. **Comprehensive Testing**: API, E2E, security scanning
5. **Performance Monitoring**: Load testing, metrics
6. **Promotion**: Move to live channel
7. **Verification**: Post-deployment health checks

**Auto-Triggers:** Push to `main` branch

#### 4. Production Deployment

**Stages:**
1. **Manual Approval**: Required approval gate
2. **Backup Creation**: Database and storage backup
3. **Canary Deploy**: 5% traffic deployment
4. **Monitoring**: 10-minute observation period
5. **Full Deploy**: Gradual traffic migration
6. **Testing**: Critical path verification
7. **Cleanup**: Remove canary deployment

**Triggers:** Release published or manual dispatch

### Branch Protection Rules

Configure the following branch protection rules:

#### `main` branch:
- Require pull request reviews (2 reviewers)
- Require status checks (CI workflow)
- Require branches to be up to date
- Restrict pushes to administrators only
- Require linear history

#### `develop` branch:
- Require pull request reviews (1 reviewer)
- Require status checks (CI workflow)
- Allow squash merging

## Deployment Procedures

### Manual Deployment Using Scripts

#### Development Deployment
```bash
./scripts/deploy.sh dev
```

#### Staging Deployment
```bash
./scripts/deploy.sh staging --skip-tests
```

#### Production Deployment
```bash
./scripts/deploy.sh prod --version v1.2.3
```

### Deployment Options

| Option | Description | Example |
|--------|-------------|---------|
| `--skip-tests` | Skip running tests | `./scripts/deploy.sh dev --skip-tests` |
| `--skip-build` | Skip building application | `./scripts/deploy.sh staging --skip-build` |
| `--functions-only` | Deploy only functions | `./scripts/deploy.sh prod --functions-only` |
| `--frontend-only` | Deploy only frontend | `./scripts/deploy.sh dev --frontend-only` |
| `--dry-run` | Show deployment plan | `./scripts/deploy.sh prod --dry-run` |
| `--version VERSION` | Deploy specific version | `./scripts/deploy.sh prod --version v2.1.0` |

### Emergency Procedures

#### Rollback Production
```bash
./scripts/rollback.sh prod --previous-version
```

#### Rollback to Specific Version
```bash
./scripts/rollback.sh prod --backup-id 20241125_143022
```

#### List Available Backups
```bash
./scripts/rollback.sh prod --list-backups
```

## Monitoring & Alerting

### Key Metrics

#### System Health
- **Uptime**: Target >99.9%
- **Response Time**: P95 <500ms
- **Error Rate**: <0.1%
- **Throughput**: 100-1000 RPS

#### Business Metrics
- **Daily Active Users**: Track growth trends
- **Payment Success Rate**: Target >95%
- **Client Portal Usage**: Monitor engagement
- **Support Ticket Volume**: Track and trend

#### Performance Metrics
- **Database Query Time**: P95 <100ms
- **Function Cold Starts**: <10% of executions
- **Memory Utilization**: <80%
- **CPU Utilization**: <70%

### Alert Configuration

#### Critical Alerts
- Application downtime
- High error rates (>5%)
- Payment failures
- Security incidents

#### Warning Alerts
- High response times
- Resource utilization
- Business metric anomalies

#### Alert Channels
- **Slack**: Real-time notifications
- **Email**: Critical alerts and summaries
- **PagerDuty**: Production incidents (optional)

### Dashboard Access

- **Grafana**: http://localhost:3001 (local)
- **Firebase Console**: Project-specific dashboards
- **Google Cloud Monitoring**: Infrastructure metrics

## Security Considerations

### Security Scanning

#### Automated Scans
- **Daily**: Dependency vulnerabilities
- **PR-based**: Code security analysis
- **Weekly**: Full application security scan

#### Tools Used
- **Snyk**: Dependency vulnerability scanning
- **CodeQL**: Static code analysis
- **Semgrep**: Security rule enforcement
- **OWASP ZAP**: Web application security testing

### Security Best Practices

#### Authentication & Authorization
- JWT tokens with short expiration
- Role-based access control (RBAC)
- Multi-factor authentication (optional)
- Session timeout enforcement

#### Data Protection
- Encryption at rest and in transit
- PII data masking in logs
- GDPR compliance measures
- Regular security audits

#### Infrastructure Security
- Security headers enforcement
- CSP policy implementation
- Rate limiting and DDoS protection
- Regular security updates

### Compliance Requirements

#### Data Privacy
- GDPR compliance for EU users
- Data retention policies
- Right to be forgotten implementation
- Privacy policy enforcement

#### Financial Compliance
- PCI DSS for payment processing
- SOX compliance for financial reporting
- Audit trail maintenance
- Regulatory reporting capabilities

## Backup & Recovery

### Backup Strategy

#### Automated Backups
- **Daily**: Full Firestore and Storage backup
- **Hourly**: Critical data incremental backup
- **Retention**: 30 days for development, 365 days for production

#### Backup Types
- **Full**: Complete database and storage
- **Incremental**: Changed data only
- **Configuration**: Firebase rules and settings

### Recovery Procedures

#### Database Recovery
```bash
./scripts/backup.sh prod --full --compress --encrypt
```

#### Point-in-Time Recovery
```bash
./scripts/rollback.sh prod --backup-id 20241125_143022 --database-only
```

#### Disaster Recovery
1. **RTO**: 4 hours (Recovery Time Objective)
2. **RPO**: 1 hour (Recovery Point Objective)
3. **Multi-region**: Automatic failover capability

### Testing Recovery

Monthly disaster recovery tests should include:
1. Database restoration verification
2. Application functionality testing
3. Data integrity validation
4. Performance impact assessment

## Troubleshooting

### Common Issues

#### Deployment Failures

**Symptom**: CI/CD pipeline fails
**Causes**:
- Authentication issues
- Configuration errors
- Resource limits exceeded
- Network connectivity problems

**Resolution Steps**:
1. Check GitHub Actions logs
2. Verify Firebase authentication
3. Validate configuration files
4. Check resource quotas

#### Performance Issues

**Symptom**: Slow response times
**Causes**:
- Database query inefficiency
- Function cold starts
- Network latency
- Resource contention

**Resolution Steps**:
1. Review performance metrics
2. Analyze database query patterns
3. Optimize function memory allocation
4. Implement caching strategies

#### Security Alerts

**Symptom**: Security vulnerabilities detected
**Causes**:
- Outdated dependencies
- Misconfigured security rules
- Exposed secrets
- Malicious traffic

**Resolution Steps**:
1. Review security scan reports
2. Update vulnerable dependencies
3. Audit security configurations
4. Implement additional security measures

### Debug Commands

#### Check Application Health
```bash
curl -f https://mashub-a0725.web.app
curl -f https://us-central1-mashub-a0725.cloudfunctions.net/api/health
```

#### View Logs
```bash
firebase functions:log --project=mashub-a0725
```

#### Test Firebase Connection
```bash
firebase projects:list
firebase use mashub-a0725
```

### Log Analysis

#### Application Logs
- **Location**: Google Cloud Logging
- **Retention**: 30 days
- **Access**: Firebase Console → Functions → Logs

#### Error Tracking
- **Sentry**: Application errors and performance
- **Firebase Crashlytics**: Mobile app crashes
- **Custom Logging**: Business logic errors

## Runbooks

### Incident Response

#### Production Down
1. **Immediate**: Check system status dashboard
2. **Diagnose**: Review recent deployments and alerts
3. **Mitigate**: Implement rollback if needed
4. **Communicate**: Notify stakeholders via Slack
5. **Resolve**: Fix root cause and verify solution
6. **Document**: Update incident log and lessons learned

#### High Error Rate
1. **Assess**: Determine error types and affected endpoints
2. **Isolate**: Identify if issue is environment-specific
3. **Investigate**: Review logs and error patterns
4. **Fix**: Apply targeted fixes or rollback
5. **Monitor**: Verify error rate returns to normal
6. **Follow-up**: Implement preventive measures

#### Security Incident
1. **Contain**: Isolate affected systems
2. **Assess**: Determine scope and impact
3. **Notify**: Alert security team and stakeholders
4. **Investigate**: Gather evidence and analyze
5. **Remediate**: Apply security fixes
6. **Report**: Document incident and improvements

### Maintenance Procedures

#### Scheduled Maintenance
1. **Plan**: Define maintenance window and scope
2. **Notify**: Communicate to users 48 hours in advance
3. **Prepare**: Create rollback plan and verify backups
4. **Execute**: Perform maintenance during low-traffic hours
5. **Verify**: Test all critical functionality
6. **Communicate**: Confirm completion to stakeholders

#### Database Maintenance
1. **Backup**: Create full backup before changes
2. **Index**: Optimize database indexes
3. **Clean**: Remove obsolete data per retention policy
4. **Analyze**: Review query performance
5. **Update**: Apply security rules updates

### Performance Optimization

#### Frontend Optimization
1. **Analyze**: Use Lighthouse and Web Vitals
2. **Bundle**: Optimize JavaScript bundle size
3. **Images**: Implement WebP with fallbacks
4. **Caching**: Configure service worker caching
5. **CDN**: Optimize Firebase Hosting settings

#### Backend Optimization
1. **Profile**: Identify slow functions and queries
2. **Optimize**: Improve database query patterns
3. **Cache**: Implement response caching
4. **Scale**: Adjust function memory and timeout
5. **Monitor**: Track performance improvements

---

## Appendix

### Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)

### Support Contacts

- **Development Team**: engineering@mashub.com
- **DevOps Team**: devops@mashub.com
- **Security Team**: security@mashub.com
- **Emergency Contact**: +1-XXX-XXX-XXXX

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-25 | CI/CD Architect | Initial deployment guide |

---

**Document Status**: ACTIVE
**Next Review Date**: 2025-01-25
**Owner**: DevOps Team
**Distribution**: All Engineering Teams