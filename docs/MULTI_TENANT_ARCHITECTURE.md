# Multi-Tenant Architecture Design

## Critical Security Issue Resolution

### Current Problem
The system is currently exposing data from ALL organizations to ALL users. This is a CRITICAL security breach that must be fixed immediately.

**Evidence of the breach:**
- User Management shows users from multiple organizations (Ahmed, brbrb, Adminoshka, Test, Ahmedoshka)
- Firestore rules allow ANY authenticated user to read ALL users
- No organizationId filtering in queries
- No tenant isolation at any level

## Architecture Overview

### 1. Tenant Isolation Strategy

#### 1.1 Database Level Isolation
```typescript
// Every collection must include organizationId
interface BaseEntity {
  id: string;
  organizationId: string; // REQUIRED for all entities
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}
```

#### 1.2 Query Level Isolation
```typescript
// All queries must filter by organizationId
const getOrganizationData = (collectionName: string, orgId: string) => {
  return query(
    collection(db, collectionName),
    where('organizationId', '==', orgId)
  );
};
```

### 2. Organization Model

```typescript
interface Organization {
  id: string;
  name: string;
  slug: string; // Unique identifier for URL
  settings: {
    timezone: string;
    currency: string;
    language: string;
    dateFormat: string;
  };
  subscription: {
    plan: 'free' | 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'suspended' | 'cancelled';
    validUntil: Timestamp;
  };
  limits: {
    maxUsers: number;
    maxProjects: number;
    maxStorage: number; // in GB
  };
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  active: boolean;
}
```

### 3. User-Organization Relationship

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  // Organization membership
  organizations: {
    [orgId: string]: {
      roles: string[];
      joinedAt: Timestamp;
      active: boolean;
    }
  };
  currentOrganizationId: string; // Active organization context
  // ... other user fields
}

interface UserOrganization {
  id: string;
  userId: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
  department?: string;
  position?: string;
  joinedAt: Timestamp;
  active: boolean;
}
```

### 4. Authentication Context

```typescript
// Custom claims in JWT token
interface CustomClaims {
  organizationId: string;
  organizationRoles: string[];
  organizationPermissions: string[];
  isSuperAdmin?: boolean; // Platform-level admin
}

// Auth context provider
interface AuthContext {
  user: User | null;
  organization: Organization | null;
  switchOrganization: (orgId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}
```

### 5. Security Rules Update

```javascript
// Firestore Security Rules with Organization Isolation
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper: Check organization membership
    function isOrgMember(orgId) {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/userOrganizations/$(request.auth.uid + '_' + orgId)) &&
        get(/databases/$(database)/documents/userOrganizations/$(request.auth.uid + '_' + orgId)).data.active == true;
    }

    // Helper: Check if resource belongs to user's organization
    function isSameOrg(resource) {
      return isAuthenticated() &&
        request.auth.token.organizationId == resource.data.organizationId;
    }

    // Users Collection - CRITICAL FIX
    match /users/{userId} {
      // Only allow reading users from same organization
      allow read: if isAuthenticated() && (
        isOwner(userId) ||
        (resource.data.organizations[request.auth.token.organizationId] != null &&
         request.auth.token.organizationId != null)
      );

      // ... update/create/delete rules with org checks
    }

    // All other collections must check organizationId
    match /projects/{projectId} {
      allow read: if isAuthenticated() && isSameOrg(resource);
      allow write: if isAuthenticated() &&
        request.resource.data.organizationId == request.auth.token.organizationId;
    }
  }
}
```

### 6. Service Layer Updates

```typescript
// Organization Service
export class OrganizationService {
  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    // Create organization
    const org = await addDoc(collection(db, 'organizations'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return org;
  }

  async addUserToOrganization(userId: string, orgId: string, roles: string[]) {
    // Add user-organization relationship
    const userOrgId = `${userId}_${orgId}`;
    await setDoc(doc(db, 'userOrganizations', userOrgId), {
      userId,
      organizationId: orgId,
      roles,
      joinedAt: serverTimestamp(),
      active: true,
    });

    // Update user's organizations
    await updateDoc(doc(db, 'users', userId), {
      [`organizations.${orgId}`]: {
        roles,
        joinedAt: serverTimestamp(),
        active: true,
      }
    });
  }

  async setCurrentOrganization(userId: string, orgId: string) {
    // Update user's current organization
    await updateDoc(doc(db, 'users', userId), {
      currentOrganizationId: orgId,
    });

    // Update custom claims
    await this.updateCustomClaims(userId, orgId);
  }

  private async updateCustomClaims(userId: string, orgId: string) {
    // Server-side function to update JWT claims
    const userOrg = await getDoc(doc(db, 'userOrganizations', `${userId}_${orgId}`));
    if (userOrg.exists()) {
      const claims = {
        organizationId: orgId,
        organizationRoles: userOrg.data().roles,
        organizationPermissions: userOrg.data().permissions,
      };
      // This would be a Firebase Admin SDK call
      // await admin.auth().setCustomUserClaims(userId, claims);
    }
  }
}
```

### 7. Query Updates

```typescript
// User Service - CRITICAL UPDATE
export class UserService {
  async getUsers(organizationId: string, filters?: UserFilters): Promise<User[]> {
    // CRITICAL: Always filter by organizationId
    const constraints = [
      where(`organizations.${organizationId}`, '!=', null),
      where(`organizations.${organizationId}.active`, '==', true),
    ];

    if (filters?.departmentId) {
      constraints.push(where('departmentId', '==', filters.departmentId));
    }

    const q = query(collection(db, 'users'), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  async getUsersInOrganization(orgId: string): Promise<User[]> {
    // Get all users in an organization via userOrganizations collection
    const q = query(
      collection(db, 'userOrganizations'),
      where('organizationId', '==', orgId),
      where('active', '==', true)
    );

    const snapshot = await getDocs(q);
    const userIds = snapshot.docs.map(doc => doc.data().userId);

    // Batch get user details
    const users = await Promise.all(
      userIds.map(id => getDoc(doc(db, 'users', id)))
    );

    return users
      .filter(doc => doc.exists())
      .map(doc => ({ id: doc.id, ...doc.data() } as User));
  }
}
```

### 8. UI Components Update

```typescript
// useOrganization hook
export function useOrganization() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.currentOrganizationId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'organizations', user.currentOrganizationId),
      (doc) => {
        if (doc.exists()) {
          setOrganization({ id: doc.id, ...doc.data() } as Organization);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.currentOrganizationId]);

  return { organization, loading };
}

// Updated useUsers hook
export function useUsers(filters?: UserFilters) {
  const { organization } = useOrganization();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        // CRITICAL: Pass organizationId to service
        const data = await userService.getUsersInOrganization(organization.id);
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [organization?.id, filters]);

  return { users, loading };
}
```

### 9. Migration Strategy

#### Phase 1: Immediate Security Fix (Day 1)
1. Update Firestore security rules to block cross-tenant access
2. Add organizationId filtering to all queries
3. Create default organization for existing data
4. Update User Management component

#### Phase 2: Full Implementation (Week 1)
1. Implement Organization service
2. Add organization switching UI
3. Update all components to use organization context
4. Migrate all existing data to include organizationId

#### Phase 3: Testing & Validation (Week 2)
1. Test complete tenant isolation
2. Verify no data leakage
3. Performance testing with organization filters
4. Security audit

### 10. Testing Strategy

```typescript
// Test cases for multi-tenancy
describe('Multi-Tenant Isolation', () => {
  test('User from Org A cannot see users from Org B', async () => {
    const userA = await loginAs('orgA.user@test.com');
    const users = await userService.getUsers();

    // Should only see users from Org A
    expect(users.every(u => u.organizations['orgA'])).toBe(true);
    expect(users.some(u => u.organizations['orgB'])).toBe(false);
  });

  test('Security rules block cross-tenant access', async () => {
    const userA = await loginAs('orgA.user@test.com');

    // Try to read Org B data directly
    await expect(
      getDoc(doc(db, 'projects', 'orgB-project-id'))
    ).rejects.toThrow('Insufficient permissions');
  });

  test('Organization switching updates context', async () => {
    const user = await loginAs('multi.org.user@test.com');

    // Switch from Org A to Org B
    await organizationService.switchOrganization('orgB');

    // Verify context updated
    expect(user.currentOrganizationId).toBe('orgB');
    expect(auth.currentUser.customClaims.organizationId).toBe('orgB');
  });
});
```

## Implementation Checklist

### Immediate Actions (CRITICAL)
- [ ] Update Firestore security rules
- [ ] Add organizationId to User service queries
- [ ] Fix User Management component
- [ ] Create migration script for existing data
- [ ] Deploy emergency patch

### Short-term Actions (This Week)
- [ ] Implement Organization service
- [ ] Add organization context to auth
- [ ] Update all Firestore queries
- [ ] Add organization switcher UI
- [ ] Update all components

### Long-term Actions (This Month)
- [ ] Complete data migration
- [ ] Security audit
- [ ] Performance optimization
- [ ] Documentation update
- [ ] Training for team

## Security Considerations

1. **Never trust client-side filtering** - Always enforce at security rules level
2. **Validate organization context** on every request
3. **Audit log** all cross-organization attempts
4. **Regular security audits** to ensure no regression
5. **Automated tests** for tenant isolation

## Performance Considerations

1. **Index organizationId** in all collections
2. **Composite indexes** for common query patterns
3. **Cache organization context** to reduce lookups
4. **Partition data** by organization for large datasets
5. **Monitor query performance** after adding filters