import { Organization, Settings, Currency, Language } from '../src/types/models';

export const organizations: Partial<Organization>[] = [
  {
    id: 'mas-hub-org',
    name: 'MAS Business Solutions',
    logo: 'https://storage.googleapis.com/mashub-assets/logos/mas-logo.png',
    website: 'https://mas.business',
    baseCurrency: 'USD' as Currency,
    timezone: 'Africa/Cairo',
    languages: ['en', 'ar', 'ru'] as Language[],
    defaultLanguage: 'en' as Language,
    fiscalYearStart: 1, // January
    taxId: 'EG123456789',
    registrationNumber: 'CR-2020-MAS-001',
    address: {
      street: '123 Business District',
      city: 'Cairo',
      state: 'Cairo Governorate',
      country: 'Egypt',
      postalCode: '11511'
    }
  }
];

export const settings: Partial<Settings>[] = [
  {
    id: 'mas-hub-settings',
    organizationId: 'mas-hub-org',
    modules: {
      projects: true,
      finance: true,
      crm: true,
      support: true,
      lms: true,
      hr: true,
      assets: true,
      portals: true,
      automations: true
    },
    features: {
      multiCurrency: true,
      multiLanguage: true,
      approvalWorkflows: true,
      customFields: true,
      voipIntegration: false, // Phase 3
      eSignature: false // Future enhancement
    },
    integrations: {
      stripe: {
        enabled: true,
        publicKey: 'pk_test_demo_key'
      },
      paymob: {
        enabled: true,
        merchantId: 'demo_merchant'
      },
      slack: {
        enabled: true,
        webhookUrl: 'https://hooks.slack.com/services/demo/webhook'
      },
      github: {
        enabled: true,
        organization: 'a7mdelbanna'
      }
    }
  }
];