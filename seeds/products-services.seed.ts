import { Product, Service, Bundle, Pricebook, PricebookEntry, Inventory } from '../src/types/models';

// Products (Hardware and Software)
export const products: Partial<Product>[] = [
  // POS Hardware
  {
    id: 'product-pos-terminal-basic',
    sku: 'POS-TERM-BASIC-001',
    name: 'Basic POS Terminal',
    description: '15" touchscreen POS terminal with built-in thermal printer and cash drawer',
    category: 'POS Hardware',
    brand: 'MAS Systems',
    model: 'MT-15-BASIC',
    trackStock: true,
    minimumStock: 10,
    unit: 'piece',
    weight: 5.2,
    dimensions: {
      length: 40,
      width: 35,
      height: 45,
      unit: 'cm'
    },
    imageUrl: 'https://storage.googleapis.com/mashub-assets/products/pos-terminal-basic.jpg',
    warrantyPeriod: 24, // 2 years
    active: true,
    customFields: {
      screenSize: '15 inch',
      connectivity: ['WiFi', 'Ethernet', 'USB'],
      compatibility: ['Windows', 'Android']
    }
  },
  {
    id: 'product-pos-terminal-advanced',
    sku: 'POS-TERM-ADV-001',
    name: 'Advanced POS Terminal',
    description: '21" touchscreen POS terminal with dual display, thermal printer, and integrated payment processing',
    category: 'POS Hardware',
    brand: 'MAS Systems',
    model: 'MT-21-ADV',
    trackStock: true,
    minimumStock: 5,
    unit: 'piece',
    weight: 8.5,
    dimensions: {
      length: 50,
      width: 40,
      height: 50,
      unit: 'cm'
    },
    imageUrl: 'https://storage.googleapis.com/mashub-assets/products/pos-terminal-advanced.jpg',
    warrantyPeriod: 36, // 3 years
    active: true,
    customFields: {
      screenSize: '21 inch',
      dualDisplay: true,
      paymentIntegration: true,
      connectivity: ['WiFi', 'Ethernet', 'USB', 'Bluetooth']
    }
  },
  {
    id: 'product-tablet-pos',
    sku: 'POS-TAB-001',
    name: 'Mobile POS Tablet',
    description: '10" Android tablet optimized for mobile POS operations',
    category: 'POS Hardware',
    brand: 'MAS Mobile',
    model: 'MM-TAB-10',
    trackStock: true,
    minimumStock: 15,
    unit: 'piece',
    weight: 0.8,
    dimensions: {
      length: 25,
      width: 17,
      height: 1,
      unit: 'cm'
    },
    imageUrl: 'https://storage.googleapis.com/mashub-assets/products/tablet-pos.jpg',
    warrantyPeriod: 18,
    active: true,
    customFields: {
      os: 'Android 12',
      batteryLife: '8 hours',
      rugged: true
    }
  },
  {
    id: 'product-thermal-printer',
    sku: 'PRINT-THERM-001',
    name: 'Thermal Receipt Printer',
    description: 'High-speed 80mm thermal receipt printer with auto-cutter',
    category: 'POS Peripherals',
    brand: 'PrintMax',
    model: 'PM-80T',
    trackStock: true,
    minimumStock: 20,
    unit: 'piece',
    weight: 2.1,
    dimensions: {
      length: 20,
      width: 15,
      height: 12,
      unit: 'cm'
    },
    imageUrl: 'https://storage.googleapis.com/mashub-assets/products/thermal-printer.jpg',
    warrantyPeriod: 12,
    active: true,
    customFields: {
      printSpeed: '300mm/sec',
      connectivity: ['USB', 'Ethernet', 'Serial'],
      paperWidth: '80mm'
    }
  },
  {
    id: 'product-cash-drawer',
    sku: 'CASH-DRAW-001',
    name: 'Electronic Cash Drawer',
    description: '5-bill 8-coin electronic cash drawer with lock',
    category: 'POS Peripherals',
    brand: 'SecureCash',
    model: 'SC-4184',
    trackStock: true,
    minimumStock: 25,
    unit: 'piece',
    weight: 4.2,
    dimensions: {
      length: 42,
      width: 42,
      height: 10,
      unit: 'cm'
    },
    imageUrl: 'https://storage.googleapis.com/mashub-assets/products/cash-drawer.jpg',
    warrantyPeriod: 24,
    active: true,
    customFields: {
      billSlots: 5,
      coinSlots: 8,
      interface: 'RJ11',
      material: 'Heavy-duty steel'
    }
  },
  {
    id: 'product-barcode-scanner',
    sku: 'SCAN-BAR-001',
    name: 'Wireless Barcode Scanner',
    description: '2D wireless barcode scanner with charging base',
    category: 'POS Peripherals',
    brand: 'ScanTech',
    model: 'ST-2D-WIRELESS',
    trackStock: true,
    minimumStock: 30,
    unit: 'piece',
    weight: 0.4,
    dimensions: {
      length: 18,
      width: 7,
      height: 10,
      unit: 'cm'
    },
    imageUrl: 'https://storage.googleapis.com/mashub-assets/products/barcode-scanner.jpg',
    warrantyPeriod: 18,
    active: true,
    customFields: {
      scanType: '2D/QR Code',
      wireless: true,
      batteryLife: '12 hours',
      range: '100 meters'
    }
  }
];

// Software and Digital Products
export const digitalProducts: Partial<Product>[] = [
  {
    id: 'product-restaurant-pos-software',
    sku: 'SW-REST-POS-001',
    name: 'Restaurant POS Software License',
    description: 'Comprehensive restaurant management software with inventory, kitchen display, and reporting',
    category: 'Software',
    brand: 'MAS Software',
    trackStock: false,
    unit: 'license',
    imageUrl: 'https://storage.googleapis.com/mashub-assets/products/restaurant-pos-software.jpg',
    warrantyPeriod: 12,
    active: true,
    customFields: {
      licenseType: 'Annual',
      maxTerminals: 'Unlimited',
      features: ['Kitchen Display', 'Inventory Management', 'Online Ordering', 'Reporting']
    }
  },
  {
    id: 'product-retail-pos-software',
    sku: 'SW-RETAIL-POS-001',
    name: 'Retail POS Software License',
    description: 'Advanced retail POS software with inventory tracking, customer management, and analytics',
    category: 'Software',
    brand: 'MAS Software',
    trackStock: false,
    unit: 'license',
    imageUrl: 'https://storage.googleapis.com/mashub-assets/products/retail-pos-software.jpg',
    warrantyPeriod: 12,
    active: true,
    customFields: {
      licenseType: 'Annual',
      features: ['Inventory Management', 'Customer Loyalty', 'Multi-location', 'E-commerce Integration']
    }
  },
  {
    id: 'product-pharmacy-pos-software',
    sku: 'SW-PHARM-POS-001',
    name: 'Pharmacy POS Software License',
    description: 'Specialized pharmacy management software with prescription handling and insurance processing',
    category: 'Software',
    brand: 'MAS Healthcare',
    trackStock: false,
    unit: 'license',
    imageUrl: 'https://storage.googleapis.com/mashub-assets/products/pharmacy-pos-software.jpg',
    warrantyPeriod: 12,
    active: true,
    customFields: {
      licenseType: 'Annual',
      specialization: 'Healthcare',
      features: ['Prescription Management', 'Insurance Processing', 'Drug Interaction Alerts', 'Inventory Tracking']
    }
  }
];

// Services
export const services: Partial<Service>[] = [
  // Implementation Services
  {
    id: 'service-pos-implementation',
    code: 'SRV-IMPL-POS',
    name: 'POS System Implementation',
    description: 'Complete POS system implementation including installation, configuration, and training',
    category: 'Implementation',
    fixedFee: false,
    unit: 'hour',
    active: true,
    customFields: {
      estimatedHours: '40-80',
      includedServices: ['Installation', 'Configuration', 'Basic Training', '30-day Support']
    }
  },
  {
    id: 'service-data-migration',
    code: 'SRV-DATA-MIG',
    name: 'Data Migration Service',
    description: 'Professional data migration from legacy systems to new POS platform',
    category: 'Implementation',
    fixedFee: true,
    defaultFee: 2500,
    unit: 'project',
    active: true,
    customFields: {
      dataTypes: ['Products', 'Customers', 'Transactions', 'Inventory'],
      guaranteedAccuracy: '99.9%'
    }
  },
  {
    id: 'service-staff-training',
    code: 'SRV-TRAIN-STAFF',
    name: 'Staff Training Program',
    description: 'Comprehensive training program for restaurant/retail staff',
    category: 'Training',
    fixedFee: false,
    defaultFee: 150,
    unit: 'hour',
    active: true,
    customFields: {
      maxTrainees: 15,
      languages: ['English', 'Arabic'],
      certificateProvided: true
    }
  },

  // Support Services
  {
    id: 'service-technical-support',
    code: 'SRV-SUPPORT-TECH',
    name: 'Technical Support',
    description: 'Remote and on-site technical support for POS systems',
    category: 'Support',
    fixedFee: false,
    defaultFee: 120,
    unit: 'hour',
    slaPolicyId: 'sla-standard-support',
    active: true,
    customFields: {
      responseTime: '4 hours',
      supportTypes: ['Phone', 'Remote', 'On-site'],
      businessHours: '9 AM - 6 PM'
    }
  },
  {
    id: 'service-system-maintenance',
    code: 'SRV-MAINT-SYS',
    name: 'System Maintenance',
    description: 'Regular system maintenance, updates, and optimization',
    category: 'Maintenance',
    fixedFee: true,
    defaultFee: 300,
    unit: 'month',
    active: true,
    customFields: {
      frequency: 'Monthly',
      includedServices: ['Software Updates', 'Performance Optimization', 'Security Patches', 'Backup Verification']
    }
  },
  {
    id: 'service-emergency-support',
    code: 'SRV-EMERG-SUP',
    name: '24/7 Emergency Support',
    description: 'Round-the-clock emergency support for critical issues',
    category: 'Support',
    fixedFee: false,
    defaultFee: 200,
    unit: 'hour',
    slaPolicyId: 'sla-premium-support',
    active: true,
    customFields: {
      availability: '24/7',
      responseTime: '15 minutes',
      criticalOnly: true
    }
  },

  // Consulting Services
  {
    id: 'service-business-analysis',
    code: 'SRV-BIZ-ANAL',
    name: 'Business Process Analysis',
    description: 'Comprehensive analysis of business processes and optimization recommendations',
    category: 'Consulting',
    fixedFee: true,
    defaultFee: 5000,
    unit: 'project',
    active: true,
    customFields: {
      deliverables: ['Process Documentation', 'Gap Analysis', 'Optimization Recommendations', 'Implementation Roadmap'],
      duration: '2-4 weeks'
    }
  },
  {
    id: 'service-system-integration',
    code: 'SRV-SYS-INTEG',
    name: 'System Integration',
    description: 'Integration with third-party systems (accounting, e-commerce, inventory)',
    category: 'Integration',
    fixedFee: false,
    defaultFee: 180,
    unit: 'hour',
    active: true,
    customFields: {
      commonIntegrations: ['QuickBooks', 'WooCommerce', 'Shopify', 'Payment Gateways'],
      apiSupport: true
    }
  },

  // Mobile App Services
  {
    id: 'service-mobile-app-dev',
    code: 'SRV-MOBILE-DEV',
    name: 'Mobile App Development',
    description: 'Custom mobile application development for iOS and Android',
    category: 'Development',
    fixedFee: false,
    defaultFee: 200,
    unit: 'hour',
    active: true,
    customFields: {
      platforms: ['iOS', 'Android', 'Cross-platform'],
      includedFeatures: ['UI/UX Design', 'Backend Integration', 'Testing', 'Deployment']
    }
  }
];

// Service Bundles
export const bundles: Partial<Bundle>[] = [
  {
    id: 'bundle-restaurant-starter',
    name: 'Restaurant Starter Package',
    description: 'Complete restaurant POS solution including hardware, software, and implementation',
    bundlePrice: 8500,
    active: true,
    components: [
      {
        itemId: 'product-pos-terminal-basic',
        itemType: 'product',
        quantity: 1
      },
      {
        itemId: 'product-thermal-printer',
        itemType: 'product',
        quantity: 1
      },
      {
        itemId: 'product-cash-drawer',
        itemType: 'product',
        quantity: 1
      },
      {
        itemId: 'product-restaurant-pos-software',
        itemType: 'product',
        quantity: 1
      },
      {
        itemId: 'service-pos-implementation',
        itemType: 'service',
        quantity: 40 // hours
      },
      {
        itemId: 'service-staff-training',
        itemType: 'service',
        quantity: 8 // hours
      }
    ]
  },
  {
    id: 'bundle-retail-professional',
    name: 'Retail Professional Package',
    description: 'Advanced retail POS solution with inventory management and analytics',
    bundlePrice: 12500,
    active: true,
    components: [
      {
        itemId: 'product-pos-terminal-advanced',
        itemType: 'product',
        quantity: 1
      },
      {
        itemId: 'product-thermal-printer',
        itemType: 'product',
        quantity: 1
      },
      {
        itemId: 'product-cash-drawer',
        itemType: 'product',
        quantity: 1
      },
      {
        itemId: 'product-barcode-scanner',
        itemType: 'product',
        quantity: 2
      },
      {
        itemId: 'product-retail-pos-software',
        itemType: 'product',
        quantity: 1
      },
      {
        itemId: 'service-pos-implementation',
        itemType: 'service',
        quantity: 60
      },
      {
        itemId: 'service-data-migration',
        itemType: 'service',
        quantity: 1
      },
      {
        itemId: 'service-staff-training',
        itemType: 'service',
        quantity: 12
      }
    ]
  },
  {
    id: 'bundle-pharmacy-complete',
    name: 'Pharmacy Complete Solution',
    description: 'Specialized pharmacy management system with compliance features',
    bundlePrice: 18500,
    active: true,
    components: [
      {
        itemId: 'product-pos-terminal-advanced',
        itemType: 'product',
        quantity: 2
      },
      {
        itemId: 'product-thermal-printer',
        itemType: 'product',
        quantity: 2
      },
      {
        itemId: 'product-barcode-scanner',
        itemType: 'product',
        quantity: 3
      },
      {
        itemId: 'product-pharmacy-pos-software',
        itemType: 'product',
        quantity: 1
      },
      {
        itemId: 'service-pos-implementation',
        itemType: 'service',
        quantity: 80
      },
      {
        itemId: 'service-data-migration',
        itemType: 'service',
        quantity: 1
      },
      {
        itemId: 'service-staff-training',
        itemType: 'service',
        quantity: 20
      }
    ]
  }
];

// Pricebooks
export const pricebooks: Partial<Pricebook>[] = [
  {
    id: 'pricebook-standard-usd',
    name: 'Standard USD Pricing',
    description: 'Standard pricing in USD for all products and services',
    currency: 'USD',
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    region: 'MENA',
    isDefault: true,
    active: true
  },
  {
    id: 'pricebook-partner-discount',
    name: 'Partner Discount Pricing',
    description: 'Special pricing for certified partners with 15% discount',
    currency: 'USD',
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    region: 'MENA',
    isDefault: false,
    active: true
  },
  {
    id: 'pricebook-volume-discount',
    name: 'Volume Discount Pricing',
    description: 'Volume-based pricing for orders over $50,000',
    currency: 'USD',
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    region: 'MENA',
    isDefault: false,
    active: true
  }
];

// Pricebook Entries
export const pricebookEntries: Partial<PricebookEntry>[] = [
  // Standard USD Pricing
  {
    id: 'price-pos-basic-std',
    pricebookId: 'pricebook-standard-usd',
    itemId: 'product-pos-terminal-basic',
    itemType: 'product',
    unitPrice: 1200,
    minQuantity: 1,
    taxClass: 'standard'
  },
  {
    id: 'price-pos-advanced-std',
    pricebookId: 'pricebook-standard-usd',
    itemId: 'product-pos-terminal-advanced',
    itemType: 'product',
    unitPrice: 2500,
    minQuantity: 1,
    taxClass: 'standard'
  },
  {
    id: 'price-tablet-pos-std',
    pricebookId: 'pricebook-standard-usd',
    itemId: 'product-tablet-pos',
    itemType: 'product',
    unitPrice: 800,
    minQuantity: 1,
    taxClass: 'standard'
  },
  {
    id: 'price-printer-std',
    pricebookId: 'pricebook-standard-usd',
    itemId: 'product-thermal-printer',
    itemType: 'product',
    unitPrice: 350,
    minQuantity: 1,
    taxClass: 'standard'
  },
  {
    id: 'price-cash-drawer-std',
    pricebookId: 'pricebook-standard-usd',
    itemId: 'product-cash-drawer',
    itemType: 'product',
    unitPrice: 280,
    minQuantity: 1,
    taxClass: 'standard'
  },
  {
    id: 'price-scanner-std',
    pricebookId: 'pricebook-standard-usd',
    itemId: 'product-barcode-scanner',
    itemType: 'product',
    unitPrice: 450,
    minQuantity: 1,
    taxClass: 'standard'
  },

  // Software Pricing
  {
    id: 'price-restaurant-software-std',
    pricebookId: 'pricebook-standard-usd',
    itemId: 'product-restaurant-pos-software',
    itemType: 'product',
    unitPrice: 1200,
    minQuantity: 1,
    taxClass: 'software'
  },
  {
    id: 'price-retail-software-std',
    pricebookId: 'pricebook-standard-usd',
    itemId: 'product-retail-pos-software',
    itemType: 'product',
    unitPrice: 1500,
    minQuantity: 1,
    taxClass: 'software'
  },
  {
    id: 'price-pharmacy-software-std',
    pricebookId: 'pricebook-standard-usd',
    itemId: 'product-pharmacy-pos-software',
    itemType: 'product',
    unitPrice: 2500,
    minQuantity: 1,
    taxClass: 'software'
  },

  // Service Pricing
  {
    id: 'price-implementation-std',
    pricebookId: 'pricebook-standard-usd',
    itemId: 'service-pos-implementation',
    itemType: 'service',
    unitPrice: 120,
    minQuantity: 1,
    taxClass: 'services'
  },
  {
    id: 'price-data-migration-std',
    pricebookId: 'pricebook-standard-usd',
    itemId: 'service-data-migration',
    itemType: 'service',
    unitPrice: 2500,
    minQuantity: 1,
    taxClass: 'services'
  },
  {
    id: 'price-training-std',
    pricebookId: 'pricebook-standard-usd',
    itemId: 'service-staff-training',
    itemType: 'service',
    unitPrice: 150,
    minQuantity: 1,
    taxClass: 'services'
  },
  {
    id: 'price-support-std',
    pricebookId: 'pricebook-standard-usd',
    itemId: 'service-technical-support',
    itemType: 'service',
    unitPrice: 120,
    minQuantity: 1,
    taxClass: 'services'
  },

  // Partner Discount Pricing (15% off)
  {
    id: 'price-pos-basic-partner',
    pricebookId: 'pricebook-partner-discount',
    itemId: 'product-pos-terminal-basic',
    itemType: 'product',
    unitPrice: 1020, // 15% discount
    minQuantity: 1,
    discount: 15,
    discountType: 'percentage',
    taxClass: 'standard'
  },
  {
    id: 'price-pos-advanced-partner',
    pricebookId: 'pricebook-partner-discount',
    itemId: 'product-pos-terminal-advanced',
    itemType: 'product',
    unitPrice: 2125, // 15% discount
    minQuantity: 1,
    discount: 15,
    discountType: 'percentage',
    taxClass: 'standard'
  }
];

// Current Inventory Levels
export const inventory: Partial<Inventory>[] = [
  {
    id: 'inv-pos-basic-main',
    productId: 'product-pos-terminal-basic',
    location: 'Main Warehouse',
    quantity: 25,
    reservedQuantity: 8,
    availableQuantity: 17,
    unitCost: 950,
    lastRestockedAt: new Date('2024-03-15'),
    serialNumbers: [
      'POS-B001', 'POS-B002', 'POS-B003', 'POS-B004', 'POS-B005',
      'POS-B006', 'POS-B007', 'POS-B008', 'POS-B009', 'POS-B010',
      'POS-B011', 'POS-B012', 'POS-B013', 'POS-B014', 'POS-B015',
      'POS-B016', 'POS-B017', 'POS-B018', 'POS-B019', 'POS-B020',
      'POS-B021', 'POS-B022', 'POS-B023', 'POS-B024', 'POS-B025'
    ]
  },
  {
    id: 'inv-pos-advanced-main',
    productId: 'product-pos-terminal-advanced',
    location: 'Main Warehouse',
    quantity: 12,
    reservedQuantity: 4,
    availableQuantity: 8,
    unitCost: 2100,
    lastRestockedAt: new Date('2024-03-10'),
    serialNumbers: [
      'POS-A001', 'POS-A002', 'POS-A003', 'POS-A004',
      'POS-A005', 'POS-A006', 'POS-A007', 'POS-A008',
      'POS-A009', 'POS-A010', 'POS-A011', 'POS-A012'
    ]
  },
  {
    id: 'inv-tablet-main',
    productId: 'product-tablet-pos',
    location: 'Main Warehouse',
    quantity: 35,
    reservedQuantity: 10,
    availableQuantity: 25,
    unitCost: 650,
    lastRestockedAt: new Date('2024-03-20')
  },
  {
    id: 'inv-printer-main',
    productId: 'product-thermal-printer',
    location: 'Main Warehouse',
    quantity: 50,
    reservedQuantity: 15,
    availableQuantity: 35,
    unitCost: 280,
    lastRestockedAt: new Date('2024-03-18')
  },
  {
    id: 'inv-cash-drawer-main',
    productId: 'product-cash-drawer',
    location: 'Main Warehouse',
    quantity: 40,
    reservedQuantity: 12,
    availableQuantity: 28,
    unitCost: 220,
    lastRestockedAt: new Date('2024-03-12')
  },
  {
    id: 'inv-scanner-main',
    productId: 'product-barcode-scanner',
    location: 'Main Warehouse',
    quantity: 65,
    reservedQuantity: 20,
    availableQuantity: 45,
    unitCost: 380,
    lastRestockedAt: new Date('2024-03-22')
  }
];