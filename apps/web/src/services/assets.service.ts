import {
  Asset,
  MaintenanceRecord,
  SoftwareLicense,
  AssetCheckout,
  AssetCategory,
  Vendor,
  AssetAudit,
  AssetStats
} from '../types/assets.types';

class AssetsService {
  // Assets
  async getAssets(): Promise<Asset[]> {
    return [
      {
        id: '1',
        name: 'MacBook Pro 16"',
        category: 'hardware',
        type: 'Laptop',
        serialNumber: 'C02XJ0ASJGH5',
        model: 'MacBook Pro 16-inch',
        manufacturer: 'Apple',
        purchaseDate: new Date('2023-06-15'),
        purchasePrice: 2999,
        currentValue: 2100,
        depreciationRate: 20,
        status: 'in-use',
        condition: 'excellent',
        location: 'Office - Floor 3',
        assignedTo: {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@company.com'
        },
        assignedDate: new Date('2023-06-20'),
        warranty: {
          provider: 'Apple',
          startDate: new Date('2023-06-15'),
          endDate: new Date('2026-06-15'),
          terms: '3-year limited warranty'
        },
        maintenance: [],
        qrCode: 'QR_MBPRO_001',
        tags: ['laptop', 'development', 'apple'],
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300'],
        specifications: [
          { id: '1', name: 'CPU', value: 'M2 Pro', unit: '' },
          { id: '2', name: 'RAM', value: '32', unit: 'GB' },
          { id: '3', name: 'Storage', value: '1', unit: 'TB' }
        ],
        notes: 'Primary development machine for senior engineer',
        createdAt: new Date('2023-06-15'),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Dell Monitor U2720Q',
        category: 'hardware',
        type: 'Monitor',
        serialNumber: 'CN-0H8R7T-64180',
        model: 'UltraSharp U2720Q',
        manufacturer: 'Dell',
        purchaseDate: new Date('2023-05-10'),
        purchasePrice: 599,
        currentValue: 450,
        depreciationRate: 15,
        status: 'in-use',
        condition: 'good',
        location: 'Office - Floor 3 - Desk 15',
        assignedTo: {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@company.com'
        },
        assignedDate: new Date('2023-05-15'),
        warranty: {
          provider: 'Dell',
          startDate: new Date('2023-05-10'),
          endDate: new Date('2026-05-10'),
          terms: '3-year premium support'
        },
        maintenance: [],
        qrCode: 'QR_MONITOR_001',
        tags: ['monitor', '4k', 'workstation'],
        images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300'],
        specifications: [
          { id: '1', name: 'Size', value: '27', unit: 'inch' },
          { id: '2', name: 'Resolution', value: '3840x2160', unit: '' },
          { id: '3', name: 'Panel Type', value: 'IPS', unit: '' }
        ],
        createdAt: new Date('2023-05-10'),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Office Chair - Steelcase Leap',
        category: 'furniture',
        type: 'Chair',
        model: 'Leap V2',
        manufacturer: 'Steelcase',
        purchaseDate: new Date('2022-12-01'),
        purchasePrice: 850,
        currentValue: 680,
        depreciationRate: 10,
        status: 'in-use',
        condition: 'good',
        location: 'Office - Floor 3 - Desk 15',
        assignedTo: {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@company.com'
        },
        assignedDate: new Date('2022-12-05'),
        warranty: {
          provider: 'Steelcase',
          startDate: new Date('2022-12-01'),
          endDate: new Date('2034-12-01'),
          terms: '12-year warranty'
        },
        maintenance: [],
        qrCode: 'QR_CHAIR_001',
        tags: ['furniture', 'ergonomic', 'office'],
        images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300'],
        specifications: [
          { id: '1', name: 'Material', value: 'Fabric', unit: '' },
          { id: '2', name: 'Weight Capacity', value: '300', unit: 'lbs' },
          { id: '3', name: 'Adjustability', value: 'Full', unit: '' }
        ],
        createdAt: new Date('2022-12-01'),
        updatedAt: new Date()
      }
    ];
  }

  async getAsset(id: string): Promise<Asset | null> {
    const assets = await this.getAssets();
    return assets.find(asset => asset.id === id) || null;
  }

  // Maintenance Records
  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return [
      {
        id: '1',
        assetId: '1',
        type: 'scheduled',
        description: 'Annual hardware inspection and cleaning',
        scheduledDate: new Date('2024-10-15'),
        status: 'scheduled',
        technician: {
          id: 'tech1',
          name: 'IT Support Team',
          company: 'Internal'
        },
        cost: 50,
        parts: [],
        nextMaintenanceDate: new Date('2025-10-15'),
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date()
      },
      {
        id: '2',
        assetId: '2',
        type: 'repair',
        description: 'Screen calibration and brightness adjustment',
        scheduledDate: new Date('2024-09-20'),
        completedDate: new Date('2024-09-21'),
        status: 'completed',
        technician: {
          id: 'tech2',
          name: 'Display Solutions Inc',
          company: 'External'
        },
        cost: 120,
        parts: [
          {
            id: '1',
            name: 'Calibration Tool Usage',
            quantity: 1,
            cost: 120,
            supplier: 'Display Solutions Inc'
          }
        ],
        notes: 'Monitor calibrated to company standards. Performance improved.',
        nextMaintenanceDate: new Date('2025-09-20'),
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date('2024-09-21')
      }
    ];
  }

  // Software Licenses
  async getSoftwareLicenses(): Promise<SoftwareLicense[]> {
    return [
      {
        id: '1',
        name: 'Microsoft Office 365',
        vendor: 'Microsoft',
        version: 'Business Premium',
        licenseType: 'subscription',
        licenseKey: 'XXXXX-XXXXX-XXXXX-XXXXX',
        purchaseDate: new Date('2023-01-01'),
        expiryDate: new Date('2024-12-31'),
        cost: 2400,
        maxUsers: 50,
        currentUsers: 28,
        assignedUsers: [
          {
            id: '1',
            userId: '1',
            userName: 'John Doe',
            userEmail: 'john.doe@company.com',
            assignedDate: new Date('2023-01-15'),
            activatedDate: new Date('2023-01-16'),
            lastUsedDate: new Date(),
            status: 'activated'
          }
        ],
        renewalDate: new Date('2024-12-31'),
        renewalCost: 2600,
        isAutoRenewal: true,
        status: 'active',
        supportLevel: 'Premium',
        supportExpiry: new Date('2024-12-31'),
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Adobe Creative Cloud',
        vendor: 'Adobe',
        version: 'All Apps',
        licenseType: 'subscription',
        licenseKey: 'YYYYY-YYYYY-YYYYY-YYYYY',
        purchaseDate: new Date('2023-03-01'),
        expiryDate: new Date('2024-02-29'),
        cost: 3600,
        maxUsers: 10,
        currentUsers: 5,
        assignedUsers: [],
        renewalDate: new Date('2024-02-29'),
        renewalCost: 3800,
        isAutoRenewal: false,
        status: 'active',
        supportLevel: 'Standard',
        createdAt: new Date('2023-03-01'),
        updatedAt: new Date()
      }
    ];
  }

  // Asset Checkouts
  async getAssetCheckouts(): Promise<AssetCheckout[]> {
    return [
      {
        id: '1',
        assetId: '1',
        assetName: 'MacBook Pro 16"',
        employeeId: '1',
        employeeName: 'John Doe',
        checkoutDate: new Date('2023-06-20'),
        purpose: 'Primary development work',
        status: 'checked-out',
        condition: {
          checkout: 'excellent'
        },
        checkoutNotes: 'Standard laptop assignment for senior developer',
        approver: {
          id: 'mgr1',
          name: 'IT Manager'
        },
        createdAt: new Date('2023-06-20'),
        updatedAt: new Date()
      },
      {
        id: '2',
        assetId: '4',
        assetName: 'iPad Pro 12.9"',
        employeeId: '2',
        employeeName: 'Sarah Johnson',
        checkoutDate: new Date('2024-09-15'),
        expectedReturnDate: new Date('2024-10-15'),
        purpose: 'Client presentation and field work',
        status: 'checked-out',
        condition: {
          checkout: 'good'
        },
        checkoutNotes: 'Temporary assignment for Q4 client presentations',
        approver: {
          id: 'mgr1',
          name: 'IT Manager'
        },
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date()
      }
    ];
  }

  // Categories
  async getAssetCategories(): Promise<AssetCategory[]> {
    return [
      {
        id: '1',
        name: 'Hardware',
        description: 'Physical computing equipment and devices',
        icon: 'Monitor',
        color: 'blue',
        depreciationRate: 20,
        requiredFields: ['serialNumber', 'manufacturer', 'model'],
        customFields: [
          {
            id: '1',
            name: 'CPU',
            type: 'text',
            required: false
          },
          {
            id: '2',
            name: 'RAM',
            type: 'text',
            required: false
          }
        ],
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Software',
        description: 'Software licenses and applications',
        icon: 'Code',
        color: 'purple',
        depreciationRate: 0,
        requiredFields: ['licenseKey', 'vendor'],
        customFields: [],
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      }
    ];
  }

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return [
      {
        id: '1',
        name: 'Apple Inc.',
        contactPerson: 'Business Sales Team',
        email: 'business@apple.com',
        phone: '1-800-APL-CARE',
        website: 'https://www.apple.com/business',
        rating: 5,
        isPreferred: true,
        notes: 'Primary vendor for Mac hardware and accessories',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Dell Technologies',
        contactPerson: 'Enterprise Sales',
        email: 'enterprise@dell.com',
        phone: '1-800-DELL-BIZ',
        website: 'https://www.dell.com/en-us/work',
        rating: 4,
        isPreferred: true,
        notes: 'Monitor and server hardware supplier',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      }
    ];
  }

  // Asset Statistics
  async getAssetStats(): Promise<AssetStats> {
    return {
      totalAssets: 156,
      totalValue: 425000,
      averageAge: 2.3,
      assetsByCategory: [
        { category: 'Hardware', count: 89, value: 285000 },
        { category: 'Software', count: 45, value: 95000 },
        { category: 'Furniture', count: 22, value: 45000 }
      ],
      assetsByStatus: [
        { status: 'In Use', count: 120 },
        { status: 'Available', count: 25 },
        { status: 'Maintenance', count: 8 },
        { status: 'Disposed', count: 3 }
      ],
      assetsByCondition: [
        { condition: 'Excellent', count: 45 },
        { condition: 'Good', count: 78 },
        { condition: 'Fair', count: 28 },
        { condition: 'Poor', count: 5 }
      ],
      maintenanceOverdue: 5,
      warrantyExpiring: 12,
      depreciationThisYear: 45000,
      utilizationRate: 85.5,
      upcomingMaintenance: [],
      recentCheckouts: [],
      topCategories: [
        { category: 'Laptops', count: 45, growth: 15 },
        { category: 'Monitors', count: 38, growth: 8 },
        { category: 'Software', count: 45, growth: 22 }
      ]
    };
  }

  // CRUD operations
  async createAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
    const newAsset: Asset = {
      ...asset,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return newAsset;
  }

  async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
    const asset = await this.getAsset(id);
    if (!asset) throw new Error('Asset not found');

    return {
      ...asset,
      ...updates,
      updatedAt: new Date()
    };
  }

  async deleteAsset(id: string): Promise<void> {
    console.log(`Asset ${id} deleted`);
  }

  async checkoutAsset(assetId: string, employeeId: string, purpose: string): Promise<AssetCheckout> {
    const checkout: AssetCheckout = {
      id: Math.random().toString(36).substr(2, 9),
      assetId,
      assetName: 'Asset Name',
      employeeId,
      employeeName: 'Employee Name',
      checkoutDate: new Date(),
      purpose,
      status: 'checked-out',
      condition: {
        checkout: 'good'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return checkout;
  }

  async returnAsset(checkoutId: string, condition: string, notes?: string): Promise<AssetCheckout> {
    const checkout = {
      id: checkoutId,
      assetId: '1',
      assetName: 'Asset Name',
      employeeId: '1',
      employeeName: 'Employee Name',
      checkoutDate: new Date(),
      actualReturnDate: new Date(),
      purpose: 'Purpose',
      status: 'returned' as const,
      condition: {
        checkout: 'good' as const,
        return: condition as 'excellent' | 'good' | 'fair' | 'poor'
      },
      returnNotes: notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return checkout;
  }

  async scheduleMaintenance(maintenance: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRecord> {
    const newMaintenance: MaintenanceRecord = {
      ...maintenance,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return newMaintenance;
  }
}

export const assetsService = new AssetsService();