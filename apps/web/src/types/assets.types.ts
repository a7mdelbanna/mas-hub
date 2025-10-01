export interface Asset {
  id: string;
  name: string;
  category: 'hardware' | 'software' | 'equipment' | 'furniture' | 'vehicle' | 'other';
  type: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  depreciationRate: number;
  status: 'available' | 'in-use' | 'maintenance' | 'disposed' | 'lost' | 'stolen';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  location: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  assignedDate?: Date;
  warranty: {
    provider: string;
    startDate: Date;
    endDate: Date;
    terms?: string;
  };
  maintenance: MaintenanceRecord[];
  qrCode?: string;
  tags: string[];
  notes?: string;
  images: string[];
  specifications: AssetSpecification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetSpecification {
  id: string;
  name: string;
  value: string;
  unit?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: 'scheduled' | 'repair' | 'upgrade' | 'inspection' | 'calibration';
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  technician?: {
    id: string;
    name: string;
    company?: string;
  };
  cost?: number;
  parts: MaintenancePart[];
  notes?: string;
  nextMaintenanceDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenancePart {
  id: string;
  name: string;
  quantity: number;
  cost: number;
  supplier?: string;
}

export interface SoftwareLicense {
  id: string;
  name: string;
  vendor: string;
  version?: string;
  licenseType: 'perpetual' | 'subscription' | 'volume' | 'oem' | 'open-source';
  licenseKey: string;
  purchaseDate: Date;
  expiryDate?: Date;
  cost: number;
  maxUsers: number;
  currentUsers: number;
  assignedUsers: LicenseAssignment[];
  renewalDate?: Date;
  renewalCost?: number;
  isAutoRenewal: boolean;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  supportLevel?: string;
  supportExpiry?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LicenseAssignment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  assignedDate: Date;
  activatedDate?: Date;
  lastUsedDate?: Date;
  status: 'assigned' | 'activated' | 'suspended' | 'revoked';
}

export interface AssetCheckout {
  id: string;
  assetId: string;
  assetName: string;
  employeeId: string;
  employeeName: string;
  checkoutDate: Date;
  expectedReturnDate?: Date;
  actualReturnDate?: Date;
  purpose: string;
  status: 'checked-out' | 'returned' | 'overdue' | 'lost';
  condition: {
    checkout: 'excellent' | 'good' | 'fair' | 'poor';
    return?: 'excellent' | 'good' | 'fair' | 'poor';
  };
  checkoutNotes?: string;
  returnNotes?: string;
  approver?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  icon: string;
  color: string;
  depreciationRate: number;
  requiredFields: string[];
  customFields: CategoryCustomField[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryCustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  rating: number;
  notes?: string;
  isPreferred: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetAudit {
  id: string;
  name: string;
  description?: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  auditor: {
    id: string;
    name: string;
  };
  scope: string[];
  results: AuditResult[];
  discrepancies: AuditDiscrepancy[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditResult {
  assetId: string;
  assetName: string;
  expectedLocation: string;
  actualLocation?: string;
  expectedCondition: string;
  actualCondition?: string;
  expectedAssignee?: string;
  actualAssignee?: string;
  status: 'found' | 'not-found' | 'discrepancy' | 'damaged';
  notes?: string;
}

export interface AuditDiscrepancy {
  id: string;
  assetId: string;
  assetName: string;
  type: 'location' | 'condition' | 'assignment' | 'missing' | 'unauthorized';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution?: string;
  resolvedBy?: string;
  resolvedDate?: Date;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
}

export interface AssetStats {
  totalAssets: number;
  totalValue: number;
  averageAge: number;
  assetsByCategory: {
    category: string;
    count: number;
    value: number;
  }[];
  assetsByStatus: {
    status: string;
    count: number;
  }[];
  assetsByCondition: {
    condition: string;
    count: number;
  }[];
  maintenanceOverdue: number;
  warrantyExpiring: number;
  depreciationThisYear: number;
  utilizationRate: number;
  upcomingMaintenance: MaintenanceRecord[];
  recentCheckouts: AssetCheckout[];
  topCategories: {
    category: string;
    count: number;
    growth: number;
  }[];
}