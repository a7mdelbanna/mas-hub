import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
  DocumentReference,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { authService, type User } from './auth.service';

export interface Organization {
  id: string;
  name: string;
  slug: string; // Unique URL identifier
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  settings: {
    timezone: string;
    currency: string;
    language: string;
    dateFormat: string;
    fiscalYearStart?: number; // Month (1-12)
  };
  subscription: {
    plan: 'free' | 'starter' | 'professional' | 'enterprise';
    status: 'trial' | 'active' | 'suspended' | 'cancelled';
    trialEndsAt?: Timestamp;
    validUntil?: Timestamp;
    seats?: number;
    customLimits?: Record<string, any>;
  };
  limits: {
    maxUsers: number;
    maxProjects: number;
    maxStorage: number; // in GB
    maxInvoicesPerMonth?: number;
    maxApiCallsPerDay?: number;
  };
  branding?: {
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  features?: {
    [key: string]: boolean; // Feature flags
  };
  metadata?: {
    industry?: string;
    size?: 'small' | 'medium' | 'large' | 'enterprise';
    type?: 'business' | 'nonprofit' | 'government' | 'education';
  };
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  active: boolean;
}

export interface UserOrganization {
  id: string;
  userId: string;
  organizationId: string;
  roles: string[];
  permissions?: string[];
  department?: string;
  position?: string;
  joinedAt: Timestamp;
  invitedBy?: string;
  invitedAt?: Timestamp;
  acceptedAt?: Timestamp;
  active: boolean;
}

export interface OrganizationInvite {
  id: string;
  organizationId: string;
  email: string;
  roles: string[];
  invitedBy: string;
  invitedAt: Timestamp;
  expiresAt: Timestamp;
  acceptedAt?: Timestamp;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  token: string;
}

class OrganizationService {
  private readonly COLLECTION = 'organizations';
  private readonly USER_ORG_COLLECTION = 'userOrganizations';
  private readonly INVITE_COLLECTION = 'organizationInvites';

  /**
   * Create a new organization
   */
  async createOrganization(data: Partial<Organization>, ownerId: string): Promise<Organization> {
    try {
      // Generate unique slug
      const slug = await this.generateUniqueSlug(data.name || 'org');

      // Create organization document
      const orgData = {
        name: data.name || 'New Organization',
        slug,
        description: data.description || '',
        settings: data.settings || {
          timezone: 'UTC',
          currency: 'USD',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
        },
        subscription: data.subscription || {
          plan: 'free',
          status: 'trial',
          trialEndsAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days trial
        },
        limits: data.limits || this.getDefaultLimits('free'),
        branding: data.branding || {},
        features: data.features || this.getDefaultFeatures('free'),
        metadata: data.metadata || {},
        createdBy: ownerId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: true,
      };

      const orgRef = await addDoc(collection(db, this.COLLECTION), orgData);
      const organization = { id: orgRef.id, ...orgData } as Organization;

      // Add owner as first member with admin role
      await this.addUserToOrganization(ownerId, orgRef.id, ['owner', 'admin'], {
        department: 'Management',
        position: 'Owner',
      });

      // Set as user's current organization if they don't have one
      const user = await authService.getCurrentUser();
      if (user && !user.currentOrganizationId) {
        await this.setCurrentOrganization(ownerId, orgRef.id);
      }

      return organization;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw new Error('Failed to create organization');
    }
  }

  /**
   * Get organization by ID
   */
  async getOrganization(orgId: string): Promise<Organization | null> {
    try {
      const orgDoc = await getDoc(doc(db, this.COLLECTION, orgId));
      if (!orgDoc.exists()) {
        return null;
      }
      return { id: orgDoc.id, ...orgDoc.data() } as Organization;
    } catch (error) {
      console.error('Error getting organization:', error);
      throw new Error('Failed to get organization');
    }
  }

  /**
   * Get organizations for a user
   */
  async getUserOrganizations(userId: string): Promise<Organization[]> {
    try {
      // Get user's organization memberships
      const q = query(
        collection(db, this.USER_ORG_COLLECTION),
        where('userId', '==', userId),
        where('active', '==', true),
        orderBy('joinedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const orgIds = snapshot.docs.map(doc => doc.data().organizationId);

      if (orgIds.length === 0) {
        return [];
      }

      // Get organization details
      const organizations = await Promise.all(
        orgIds.map(id => this.getOrganization(id))
      );

      return organizations.filter(org => org !== null) as Organization[];
    } catch (error) {
      console.error('Error getting user organizations:', error);
      throw new Error('Failed to get user organizations');
    }
  }

  /**
   * Add user to organization
   */
  async addUserToOrganization(
    userId: string,
    orgId: string,
    roles: string[],
    additionalData?: Partial<UserOrganization>
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Create user-organization relationship
      const userOrgId = `${userId}_${orgId}`;
      const userOrgRef = doc(db, this.USER_ORG_COLLECTION, userOrgId);
      batch.set(userOrgRef, {
        userId,
        organizationId: orgId,
        roles,
        permissions: additionalData?.permissions || [],
        department: additionalData?.department || '',
        position: additionalData?.position || '',
        joinedAt: serverTimestamp(),
        invitedBy: additionalData?.invitedBy || userId,
        acceptedAt: serverTimestamp(),
        active: true,
      });

      // Update user document with organization membership
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        [`organizations.${orgId}`]: {
          roles,
          joinedAt: serverTimestamp(),
          active: true,
        },
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error('Error adding user to organization:', error);
      throw new Error('Failed to add user to organization');
    }
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(userId: string, orgId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Deactivate user-organization relationship
      const userOrgId = `${userId}_${orgId}`;
      const userOrgRef = doc(db, this.USER_ORG_COLLECTION, userOrgId);
      batch.update(userOrgRef, {
        active: false,
        updatedAt: serverTimestamp(),
      });

      // Update user document
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        [`organizations.${orgId}.active`]: false,
        updatedAt: serverTimestamp(),
      });

      // If this was user's current organization, clear it
      const user = await authService.getCurrentUser();
      if (user?.currentOrganizationId === orgId) {
        batch.update(userRef, {
          currentOrganizationId: null,
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error removing user from organization:', error);
      throw new Error('Failed to remove user from organization');
    }
  }

  /**
   * Set user's current organization
   */
  async setCurrentOrganization(userId: string, orgId: string): Promise<void> {
    try {
      // Verify user is member of organization
      const userOrgId = `${userId}_${orgId}`;
      const userOrgDoc = await getDoc(doc(db, this.USER_ORG_COLLECTION, userOrgId));

      if (!userOrgDoc.exists() || !userOrgDoc.data().active) {
        throw new Error('User is not a member of this organization');
      }

      // Update user's current organization
      await updateDoc(doc(db, 'users', userId), {
        currentOrganizationId: orgId,
        updatedAt: serverTimestamp(),
      });

      // Update auth custom claims (would need server-side function)
      // This is a placeholder - actual implementation would use Firebase Admin SDK
      await this.updateUserClaims(userId, orgId);
    } catch (error) {
      console.error('Error setting current organization:', error);
      throw new Error('Failed to set current organization');
    }
  }

  /**
   * Get users in organization
   */
  async getOrganizationUsers(orgId: string): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.USER_ORG_COLLECTION),
        where('organizationId', '==', orgId),
        where('active', '==', true),
        orderBy('joinedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const userIds = snapshot.docs.map(doc => doc.data().userId);

      if (userIds.length === 0) {
        return [];
      }

      // Get user details
      const users = await Promise.all(
        userIds.map(async (id) => {
          const userDoc = await getDoc(doc(db, 'users', id));
          if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() } as User;
          }
          return null;
        })
      );

      return users.filter(user => user !== null) as User[];
    } catch (error) {
      console.error('Error getting organization users:', error);
      throw new Error('Failed to get organization users');
    }
  }

  /**
   * Update organization
   */
  async updateOrganization(orgId: string, data: Partial<Organization>): Promise<void> {
    try {
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.createdBy;
      delete updateData.createdAt;

      await updateDoc(doc(db, this.COLLECTION, orgId), updateData);
    } catch (error) {
      console.error('Error updating organization:', error);
      throw new Error('Failed to update organization');
    }
  }

  /**
   * Update user roles in organization
   */
  async updateUserRoles(userId: string, orgId: string, roles: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Update user-organization relationship
      const userOrgId = `${userId}_${orgId}`;
      const userOrgRef = doc(db, this.USER_ORG_COLLECTION, userOrgId);
      batch.update(userOrgRef, {
        roles,
        updatedAt: serverTimestamp(),
      });

      // Update user document
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        [`organizations.${orgId}.roles`]: roles,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      // Update auth claims if this is user's current organization
      const user = await authService.getCurrentUser();
      if (user?.currentOrganizationId === orgId) {
        await this.updateUserClaims(userId, orgId);
      }
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw new Error('Failed to update user roles');
    }
  }

  /**
   * Invite user to organization
   */
  async inviteUserToOrganization(
    email: string,
    orgId: string,
    roles: string[],
    invitedBy: string
  ): Promise<OrganizationInvite> {
    try {
      // Check if user already exists and is member
      const existingUser = await authService.getUserByEmail(email);
      if (existingUser) {
        const userOrgId = `${existingUser.id}_${orgId}`;
        const userOrgDoc = await getDoc(doc(db, this.USER_ORG_COLLECTION, userOrgId));
        if (userOrgDoc.exists() && userOrgDoc.data().active) {
          throw new Error('User is already a member of this organization');
        }
      }

      // Generate invite token
      const token = this.generateInviteToken();
      const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days

      // Create invite
      const inviteData = {
        organizationId: orgId,
        email,
        roles,
        invitedBy,
        invitedAt: serverTimestamp(),
        expiresAt,
        status: 'pending' as const,
        token,
      };

      const inviteRef = await addDoc(collection(db, this.INVITE_COLLECTION), inviteData);

      // Send invite email (placeholder - would integrate with email service)
      // await emailService.sendOrganizationInvite(email, orgId, token);

      return { id: inviteRef.id, ...inviteData } as OrganizationInvite;
    } catch (error) {
      console.error('Error inviting user:', error);
      throw new Error('Failed to invite user');
    }
  }

  /**
   * Accept organization invite
   */
  async acceptInvite(token: string, userId: string): Promise<void> {
    try {
      // Find invite by token
      const q = query(
        collection(db, this.INVITE_COLLECTION),
        where('token', '==', token),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        throw new Error('Invalid or expired invite');
      }

      const inviteDoc = snapshot.docs[0];
      const invite = { id: inviteDoc.id, ...inviteDoc.data() } as OrganizationInvite;

      // Check if invite is expired
      if (invite.expiresAt.toDate() < new Date()) {
        await updateDoc(doc(db, this.INVITE_COLLECTION, invite.id), {
          status: 'expired',
          updatedAt: serverTimestamp(),
        });
        throw new Error('Invite has expired');
      }

      // Add user to organization
      await this.addUserToOrganization(userId, invite.organizationId, invite.roles, {
        invitedBy: invite.invitedBy,
        invitedAt: invite.invitedAt,
      });

      // Mark invite as accepted
      await updateDoc(doc(db, this.INVITE_COLLECTION, invite.id), {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error accepting invite:', error);
      throw new Error('Failed to accept invite');
    }
  }

  /**
   * Helper: Generate unique slug
   */
  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await this.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Helper: Check if slug exists
   */
  private async slugExists(slug: string): Promise<boolean> {
    const q = query(collection(db, this.COLLECTION), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  /**
   * Helper: Generate invite token
   */
  private generateInviteToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Helper: Get default limits for plan
   */
  private getDefaultLimits(plan: string): Organization['limits'] {
    const limits: Record<string, Organization['limits']> = {
      free: {
        maxUsers: 5,
        maxProjects: 3,
        maxStorage: 1,
        maxInvoicesPerMonth: 10,
        maxApiCallsPerDay: 1000,
      },
      starter: {
        maxUsers: 15,
        maxProjects: 10,
        maxStorage: 10,
        maxInvoicesPerMonth: 50,
        maxApiCallsPerDay: 10000,
      },
      professional: {
        maxUsers: 50,
        maxProjects: 50,
        maxStorage: 100,
        maxInvoicesPerMonth: 500,
        maxApiCallsPerDay: 100000,
      },
      enterprise: {
        maxUsers: -1, // Unlimited
        maxProjects: -1,
        maxStorage: -1,
        maxInvoicesPerMonth: -1,
        maxApiCallsPerDay: -1,
      },
    };

    return limits[plan] || limits.free;
  }

  /**
   * Helper: Get default features for plan
   */
  private getDefaultFeatures(plan: string): Record<string, boolean> {
    const features: Record<string, Record<string, boolean>> = {
      free: {
        projects: true,
        tasks: true,
        invoices: true,
        basicReports: true,
        apiAccess: false,
        customBranding: false,
        advancedReports: false,
        automations: false,
        multiLanguage: false,
        sso: false,
      },
      starter: {
        projects: true,
        tasks: true,
        invoices: true,
        basicReports: true,
        apiAccess: true,
        customBranding: true,
        advancedReports: false,
        automations: true,
        multiLanguage: false,
        sso: false,
      },
      professional: {
        projects: true,
        tasks: true,
        invoices: true,
        basicReports: true,
        apiAccess: true,
        customBranding: true,
        advancedReports: true,
        automations: true,
        multiLanguage: true,
        sso: false,
      },
      enterprise: {
        projects: true,
        tasks: true,
        invoices: true,
        basicReports: true,
        apiAccess: true,
        customBranding: true,
        advancedReports: true,
        automations: true,
        multiLanguage: true,
        sso: true,
      },
    };

    return features[plan] || features.free;
  }

  /**
   * Helper: Update user claims (placeholder - needs server-side implementation)
   */
  private async updateUserClaims(userId: string, orgId: string): Promise<void> {
    // This would be implemented as a callable Firebase Function
    // that uses Admin SDK to set custom claims
    console.log('Updating user claims:', { userId, orgId });
    // await functions.httpsCallable('updateUserClaims')({ userId, orgId });
  }

  /**
   * Check if user has permission in organization
   */
  async userHasPermission(
    userId: string,
    orgId: string,
    permission: string
  ): Promise<boolean> {
    try {
      const userOrgId = `${userId}_${orgId}`;
      const userOrgDoc = await getDoc(doc(db, this.USER_ORG_COLLECTION, userOrgId));

      if (!userOrgDoc.exists() || !userOrgDoc.data().active) {
        return false;
      }

      const data = userOrgDoc.data();

      // Check if user has owner or admin role (full permissions)
      if (data.roles?.includes('owner') || data.roles?.includes('admin')) {
        return true;
      }

      // Check specific permissions
      return data.permissions?.includes(permission) || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user has role in organization
   */
  async userHasRole(userId: string, orgId: string, role: string): Promise<boolean> {
    try {
      const userOrgId = `${userId}_${orgId}`;
      const userOrgDoc = await getDoc(doc(db, this.USER_ORG_COLLECTION, userOrgId));

      if (!userOrgDoc.exists() || !userOrgDoc.data().active) {
        return false;
      }

      return userOrgDoc.data().roles?.includes(role) || false;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }
}

export const organizationService = new OrganizationService();