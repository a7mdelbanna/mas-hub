import { Account, ClientSite } from '../src/types/models';

export const accounts: Partial<Account>[] = [
  // Restaurant Clients
  {
    id: 'account-golden-spoon',
    name: 'Golden Spoon Restaurant',
    type: 'customer',
    tier: 'gold',
    industry: 'Food & Beverage',
    website: 'https://goldenspoon.restaurant',
    phoneNumber: '+20-2-2345-6789',
    email: 'info@goldenspoon.restaurant',
    taxId: 'EG987654321',
    registrationNumber: 'CR-2019-RST-001',
    assignedTo: 'user-sales-lead',
    address: {
      billing: {
        street: '15 Tahrir Square',
        city: 'Cairo',
        state: 'Cairo Governorate',
        country: 'Egypt',
        postalCode: '11511'
      },
      shipping: {
        street: '15 Tahrir Square',
        city: 'Cairo',
        state: 'Cairo Governorate',
        country: 'Egypt',
        postalCode: '11511'
      }
    },
    creditLimit: 100000,
    paymentTerms: 30,
    customFields: {
      numberOfLocations: 3,
      averageTransactions: 500,
      primaryCuisine: 'Middle Eastern'
    }
  },
  {
    id: 'account-pizza-palace',
    name: 'Pizza Palace Chain',
    type: 'customer',
    tier: 'platinum',
    industry: 'Food & Beverage',
    website: 'https://pizzapalace.eg',
    phoneNumber: '+20-2-3456-7890',
    email: 'franchise@pizzapalace.eg',
    taxId: 'EG876543210',
    registrationNumber: 'CR-2018-FRN-002',
    assignedTo: 'user-sales-lead',
    address: {
      billing: {
        street: '45 Zamalek Street',
        city: 'Cairo',
        state: 'Cairo Governorate',
        country: 'Egypt',
        postalCode: '11211'
      }
    },
    creditLimit: 250000,
    paymentTerms: 45,
    customFields: {
      numberOfLocations: 12,
      averageTransactions: 800,
      primaryCuisine: 'Italian'
    }
  },

  // Retail Clients
  {
    id: 'account-tech-store',
    name: 'TechStore Electronics',
    type: 'customer',
    tier: 'silver',
    industry: 'Electronics Retail',
    website: 'https://techstore.com',
    phoneNumber: '+20-2-4567-8901',
    email: 'orders@techstore.com',
    taxId: 'EG765432109',
    registrationNumber: 'CR-2020-RET-003',
    assignedTo: 'user-sales-rep1',
    address: {
      billing: {
        street: '123 Nasr City Mall',
        city: 'Cairo',
        state: 'Cairo Governorate',
        country: 'Egypt',
        postalCode: '11371'
      },
      shipping: {
        street: '123 Nasr City Mall',
        city: 'Cairo',
        state: 'Cairo Governorate',
        country: 'Egypt',
        postalCode: '11371'
      }
    },
    creditLimit: 75000,
    paymentTerms: 30,
    customFields: {
      numberOfLocations: 2,
      averageTransactions: 150,
      primaryProducts: 'Electronics, Accessories'
    }
  },
  {
    id: 'account-fashion-hub',
    name: 'Fashion Hub Boutique',
    type: 'customer',
    tier: 'bronze',
    industry: 'Fashion Retail',
    website: 'https://fashionhub.eg',
    phoneNumber: '+20-2-5678-9012',
    email: 'info@fashionhub.eg',
    taxId: 'EG654321098',
    registrationNumber: 'CR-2021-FAS-004',
    assignedTo: 'user-sales-rep1',
    address: {
      billing: {
        street: '78 City Stars Mall',
        city: 'Cairo',
        state: 'Cairo Governorate',
        country: 'Egypt',
        postalCode: '11835'
      }
    },
    creditLimit: 35000,
    paymentTerms: 15,
    customFields: {
      numberOfLocations: 1,
      averageTransactions: 75,
      primaryProducts: 'Clothing, Accessories'
    }
  },

  // Healthcare Clients
  {
    id: 'account-health-first',
    name: 'HealthFirst Pharmacy',
    type: 'customer',
    tier: 'gold',
    industry: 'Healthcare',
    website: 'https://healthfirst.pharmacy',
    phoneNumber: '+20-2-6789-0123',
    email: 'orders@healthfirst.pharmacy',
    taxId: 'EG543210987',
    registrationNumber: 'CR-2019-PHR-005',
    assignedTo: 'user-sales-lead',
    address: {
      billing: {
        street: '456 Medical District',
        city: 'Cairo',
        state: 'Cairo Governorate',
        country: 'Egypt',
        postalCode: '11431'
      },
      shipping: {
        street: '456 Medical District',
        city: 'Cairo',
        state: 'Cairo Governorate',
        country: 'Egypt',
        postalCode: '11431'
      }
    },
    creditLimit: 120000,
    paymentTerms: 30,
    customFields: {
      numberOfLocations: 4,
      averageTransactions: 300,
      specialization: 'General Pharmacy, Medical Equipment'
    }
  },
  {
    id: 'account-dental-clinic',
    name: 'Modern Dental Clinic',
    type: 'customer',
    tier: 'silver',
    industry: 'Healthcare',
    website: 'https://moderndentalclinic.com',
    phoneNumber: '+20-2-7890-1234',
    email: 'admin@moderndentalclinic.com',
    taxId: 'EG432109876',
    registrationNumber: 'CR-2020-DEN-006',
    assignedTo: 'user-sales-rep1',
    address: {
      billing: {
        street: '321 Dokki Medical Center',
        city: 'Giza',
        state: 'Giza Governorate',
        country: 'Egypt',
        postalCode: '12311'
      }
    },
    creditLimit: 60000,
    paymentTerms: 30,
    customFields: {
      numberOfLocations: 2,
      averageTransactions: 25,
      specialization: 'Dental Care, Orthodontics'
    }
  },

  // Service Industry Clients
  {
    id: 'account-beauty-salon',
    name: 'Elite Beauty Salon',
    type: 'customer',
    tier: 'bronze',
    industry: 'Beauty & Wellness',
    website: 'https://elitebeauty.salon',
    phoneNumber: '+20-2-8901-2345',
    email: 'bookings@elitebeauty.salon',
    taxId: 'EG321098765',
    registrationNumber: 'CR-2021-BEA-007',
    assignedTo: 'user-sales-rep1',
    address: {
      billing: {
        street: '567 New Cairo Plaza',
        city: 'New Cairo',
        state: 'Cairo Governorate',
        country: 'Egypt',
        postalCode: '11835'
      }
    },
    creditLimit: 25000,
    paymentTerms: 15,
    customFields: {
      numberOfLocations: 1,
      averageTransactions: 40,
      services: 'Hair, Nails, Spa Services'
    }
  },
  {
    id: 'account-fitness-center',
    name: 'PowerGym Fitness Center',
    type: 'customer',
    tier: 'gold',
    industry: 'Fitness & Sports',
    website: 'https://powergym.fitness',
    phoneNumber: '+20-2-9012-3456',
    email: 'membership@powergym.fitness',
    taxId: 'EG210987654',
    registrationNumber: 'CR-2020-FIT-008',
    assignedTo: 'user-sales-lead',
    address: {
      billing: {
        street: '890 Sports Complex',
        city: 'Alexandria',
        state: 'Alexandria Governorate',
        country: 'Egypt',
        postalCode: '21500'
      }
    },
    creditLimit: 80000,
    paymentTerms: 30,
    customFields: {
      numberOfLocations: 3,
      averageTransactions: 200,
      services: 'Gym, Classes, Personal Training'
    }
  },

  // Prospects & Partners
  {
    id: 'account-hotel-chain',
    name: 'Nile Grand Hotels',
    type: 'prospect',
    tier: 'platinum',
    industry: 'Hospitality',
    website: 'https://nilegrand.hotels',
    phoneNumber: '+20-2-0123-4567',
    email: 'procurement@nilegrand.hotels',
    assignedTo: 'user-sales-lead',
    address: {
      billing: {
        street: '100 Corniche El Nil',
        city: 'Cairo',
        state: 'Cairo Governorate',
        country: 'Egypt',
        postalCode: '11221'
      }
    },
    customFields: {
      numberOfLocations: 8,
      averageTransactions: 1500,
      services: 'Hotels, Restaurants, Events'
    }
  },
  {
    id: 'account-tech-partner',
    name: 'DevSolutions Partners',
    type: 'partner',
    tier: 'gold',
    industry: 'Technology',
    website: 'https://devsolutions.tech',
    phoneNumber: '+20-2-1234-5678',
    email: 'partnerships@devsolutions.tech',
    assignedTo: 'user-manager-tech',
    address: {
      billing: {
        street: '456 Smart Village',
        city: '6th of October',
        state: 'Giza Governorate',
        country: 'Egypt',
        postalCode: '12451'
      }
    },
    customFields: {
      partnerType: 'Technology Integration',
      specialization: 'Payment Gateway, API Development'
    }
  }
];

// Client Sites for multi-location accounts
export const clientSites: Partial<ClientSite>[] = [
  // Golden Spoon Restaurant sites
  {
    id: 'site-golden-spoon-main',
    accountId: 'account-golden-spoon',
    name: 'Golden Spoon - Main Branch',
    address: {
      street: '15 Tahrir Square',
      city: 'Cairo',
      state: 'Cairo Governorate',
      country: 'Egypt',
      postalCode: '11511'
    },
    contactPerson: 'Hassan Al-Rashid',
    contactPhone: '+20-10-2345-6789',
    contactEmail: 'owner@goldenspoon.restaurant',
    timezone: 'Africa/Cairo',
    active: true
  },
  {
    id: 'site-golden-spoon-branch1',
    accountId: 'account-golden-spoon',
    name: 'Golden Spoon - Zamalek Branch',
    address: {
      street: '78 Zamalek Street',
      city: 'Cairo',
      state: 'Cairo Governorate',
      country: 'Egypt',
      postalCode: '11211'
    },
    contactPerson: 'Mariam Hassan',
    contactPhone: '+20-10-3456-7890',
    contactEmail: 'zamalek@goldenspoon.restaurant',
    timezone: 'Africa/Cairo',
    active: true
  },
  {
    id: 'site-golden-spoon-branch2',
    accountId: 'account-golden-spoon',
    name: 'Golden Spoon - Maadi Branch',
    address: {
      street: '234 Maadi Corniche',
      city: 'Cairo',
      state: 'Cairo Governorate',
      country: 'Egypt',
      postalCode: '11431'
    },
    contactPerson: 'Ahmed Salim',
    contactPhone: '+20-10-4567-8901',
    contactEmail: 'maadi@goldenspoon.restaurant',
    timezone: 'Africa/Cairo',
    active: true
  },

  // Pizza Palace Chain sites (sample of 12)
  {
    id: 'site-pizza-palace-hq',
    accountId: 'account-pizza-palace',
    name: 'Pizza Palace - Headquarters',
    address: {
      street: '45 Zamalek Street',
      city: 'Cairo',
      state: 'Cairo Governorate',
      country: 'Egypt',
      postalCode: '11211'
    },
    contactPerson: 'Omar Franchise',
    contactPhone: '+20-10-5678-9012',
    contactEmail: 'hq@pizzapalace.eg',
    timezone: 'Africa/Cairo',
    active: true
  },
  {
    id: 'site-pizza-palace-nasr',
    accountId: 'account-pizza-palace',
    name: 'Pizza Palace - Nasr City',
    address: {
      street: '567 Nasr City',
      city: 'Cairo',
      state: 'Cairo Governorate',
      country: 'Egypt',
      postalCode: '11371'
    },
    contactPerson: 'Laila Manager',
    contactPhone: '+20-10-6789-0123',
    contactEmail: 'nasr@pizzapalace.eg',
    timezone: 'Africa/Cairo',
    active: true
  },

  // HealthFirst Pharmacy sites
  {
    id: 'site-health-first-main',
    accountId: 'account-health-first',
    name: 'HealthFirst - Main Pharmacy',
    address: {
      street: '456 Medical District',
      city: 'Cairo',
      state: 'Cairo Governorate',
      country: 'Egypt',
      postalCode: '11431'
    },
    contactPerson: 'Dr. Amr Khalil',
    contactPhone: '+20-10-4567-8901',
    contactEmail: 'owner@healthfirst.pharmacy',
    timezone: 'Africa/Cairo',
    active: true
  },
  {
    id: 'site-health-first-branch1',
    accountId: 'account-health-first',
    name: 'HealthFirst - Heliopolis Branch',
    address: {
      street: '789 Heliopolis Square',
      city: 'Cairo',
      state: 'Cairo Governorate',
      country: 'Egypt',
      postalCode: '11757'
    },
    contactPerson: 'Dr. Mona Farid',
    contactPhone: '+20-10-7890-1234',
    contactEmail: 'heliopolis@healthfirst.pharmacy',
    timezone: 'Africa/Cairo',
    active: true
  },

  // PowerGym Fitness Center sites
  {
    id: 'site-powergym-main',
    accountId: 'account-fitness-center',
    name: 'PowerGym - Main Center',
    address: {
      street: '890 Sports Complex',
      city: 'Alexandria',
      state: 'Alexandria Governorate',
      country: 'Egypt',
      postalCode: '21500'
    },
    contactPerson: 'Coach Mahmoud',
    contactPhone: '+20-10-8901-2345',
    contactEmail: 'main@powergym.fitness',
    timezone: 'Africa/Cairo',
    active: true
  },
  {
    id: 'site-powergym-branch1',
    accountId: 'account-fitness-center',
    name: 'PowerGym - Women\'s Branch',
    address: {
      street: '345 Alexandria Downtown',
      city: 'Alexandria',
      state: 'Alexandria Governorate',
      country: 'Egypt',
      postalCode: '21500'
    },
    contactPerson: 'Coach Fatma',
    contactPhone: '+20-10-9012-3456',
    contactEmail: 'women@powergym.fitness',
    timezone: 'Africa/Cairo',
    active: true
  }
];