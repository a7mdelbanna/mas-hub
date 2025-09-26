import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import {
  authenticate,
  AuthenticatedRequest,
  authorize,
  requireAdmin
} from '../middleware/auth';

const router = Router();

// Get all users (with pagination and filters)
router.get('/',
  authenticate,
  authorize('users', 'read'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        role = '',
        department = '',
        active,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = admin.firestore().collection('users');

      // Apply filters
      if (role) {
        query = query.where('roles', 'array-contains', role as string) as any;
      }

      if (department) {
        query = query.where('department', '==', department) as any;
      }

      if (active !== undefined) {
        query = query.where('active', '==', active === 'true') as any;
      }

      // Get total count for pagination
      const countSnapshot = await query.get();
      const totalCount = countSnapshot.size;

      // Apply sorting and pagination
      query = query.orderBy(sortBy as string, sortOrder as 'asc' | 'desc') as any;
      query = query.limit(limitNum).offset(offset) as any;

      const snapshot = await query.get();
      const users: any[] = [];

      snapshot.forEach(doc => {
        const userData = doc.data();
        // Remove sensitive data
        delete userData.password;
        users.push({
          id: doc.id,
          ...userData
        });
      });

      // Filter by search term if provided (client-side filtering for now)
      let filteredUsers = users;
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredUsers = users.filter(user =>
          user.displayName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.department?.toLowerCase().includes(searchLower)
        );
      }

      res.status(200).json({
        success: true,
        data: {
          users: filteredUsers,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: search ? filteredUsers.length : totalCount,
            totalPages: Math.ceil((search ? filteredUsers.length : totalCount) / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch users'
        }
      });
    }
  }
);

// Get single user by ID
router.get('/:id',
  authenticate,
  authorize('users', 'read'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Check if user is requesting their own data or has permission
      const isOwnProfile = req.user?.uid === id;
      const isAdmin = req.user?.roles.includes('admin') || req.user?.roles.includes('super_admin');
      const isHR = req.user?.roles.includes('hr');

      if (!isOwnProfile && !isAdmin && !isHR) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You can only view your own profile or must have admin/HR role'
          }
        });
      }

      const userDoc = await admin.firestore().collection('users').doc(id).get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      const userData = userDoc.data()!;
      delete userData.password;

      res.status(200).json({
        success: true,
        data: {
          id: userDoc.id,
          ...userData
        }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user'
        }
      });
    }
  }
);

// Create new user (admin/HR only)
router.post('/',
  authenticate,
  authorize('users', 'create'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        email,
        password,
        displayName,
        roles = ['employee'],
        phoneNumber,
        department,
        position,
        managerId,
        startDate,
        salary,
        active = true
      } = req.body;

      // Validate required fields
      if (!email || !password || !displayName) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Email, password, and display name are required'
          }
        });
      }

      // Validate roles - only admin can assign admin roles
      const isAdmin = req.user?.roles.includes('admin') || req.user?.roles.includes('super_admin');
      const hasAdminRole = roles.includes('admin') || roles.includes('super_admin');

      if (hasAdminRole && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Only admins can assign admin roles'
          }
        });
      }

      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
        phoneNumber,
        emailVerified: false
      });

      // Determine portal access based on roles
      const portalAccess: any = {
        admin: false,
        employee: false,
        client: [],
        candidate: false
      };

      if (roles.includes('admin') || roles.includes('super_admin')) {
        portalAccess.admin = true;
        portalAccess.employee = true;
      } else if (roles.includes('hr') || roles.includes('manager')) {
        portalAccess.employee = true;
      } else if (roles.includes('employee')) {
        portalAccess.employee = true;
      }

      // Set custom claims
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        roles,
        portalAccess
      });

      // Create user profile in Firestore
      const userProfile = {
        email,
        displayName,
        phoneNumber: phoneNumber || null,
        roles,
        permissions: [],
        portalAccess,
        department: department || null,
        position: position || null,
        managerId: managerId || null,
        startDate: startDate ? admin.firestore.Timestamp.fromDate(new Date(startDate)) : null,
        salary: salary || null,
        active,
        language: 'en',
        onboardingCompleted: false,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: req.user!.uid,
        updatedBy: req.user!.uid
      };

      await admin.firestore().collection('users').doc(userRecord.uid).set(userProfile);

      // Send verification email
      try {
        const verificationLink = await admin.auth().generateEmailVerificationLink(email);
        console.log('Verification link generated:', verificationLink);
      } catch (err) {
        console.error('Error generating verification link:', err);
      }

      res.status(201).json({
        success: true,
        data: {
          id: userRecord.uid,
          ...userProfile,
          message: 'User created successfully'
        }
      });
    } catch (error: any) {
      console.error('Error creating user:', error);

      if (error.code === 'auth/email-already-exists') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'A user with this email already exists'
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create user'
        }
      });
    }
  }
);

// Update user
router.put('/:id',
  authenticate,
  authorize('users', 'update'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.email; // Email should be updated via separate endpoint
      delete updateData.password;
      delete updateData.createdAt;
      delete updateData.createdBy;

      // Check if user is updating their own profile or has permission
      const isOwnProfile = req.user?.uid === id;
      const isAdmin = req.user?.roles.includes('admin') || req.user?.roles.includes('super_admin');
      const isHR = req.user?.roles.includes('hr');

      if (!isAdmin && !isHR) {
        // Regular users can only update certain fields of their own profile
        if (!isOwnProfile) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'You can only update your own profile'
            }
          });
        }

        // Restrict fields regular users can update
        const allowedFields = ['displayName', 'phoneNumber', 'language'];
        Object.keys(updateData).forEach(key => {
          if (!allowedFields.includes(key)) {
            delete updateData[key];
          }
        });
      }

      // Validate role updates - only admin can assign admin roles
      if (updateData.roles) {
        const hasAdminRole = updateData.roles.includes('admin') || updateData.roles.includes('super_admin');
        if (hasAdminRole && !isAdmin) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'Only admins can assign admin roles'
            }
          });
        }

        // Update custom claims if roles changed
        await admin.auth().setCustomUserClaims(id, {
          roles: updateData.roles,
          portalAccess: updateData.portalAccess
        });
      }

      // Update Firestore document
      updateData.updatedAt = admin.firestore.Timestamp.now();
      updateData.updatedBy = req.user!.uid;

      await admin.firestore().collection('users').doc(id).update(updateData);

      // Update Auth profile if displayName or phoneNumber changed
      const authUpdate: any = {};
      if (updateData.displayName) authUpdate.displayName = updateData.displayName;
      if (updateData.phoneNumber !== undefined) authUpdate.phoneNumber = updateData.phoneNumber || null;

      if (Object.keys(authUpdate).length > 0) {
        await admin.auth().updateUser(id, authUpdate);
      }

      // Fetch updated user data
      const userDoc = await admin.firestore().collection('users').doc(id).get();
      const userData = userDoc.data()!;
      delete userData.password;

      res.status(200).json({
        success: true,
        data: {
          id: userDoc.id,
          ...userData,
          message: 'User updated successfully'
        }
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update user'
        }
      });
    }
  }
);

// Delete user (soft delete)
router.delete('/:id',
  authenticate,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (req.user?.uid === id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'You cannot delete your own account'
          }
        });
      }

      // Soft delete - deactivate user
      await admin.firestore().collection('users').doc(id).update({
        active: false,
        deletedAt: admin.firestore.Timestamp.now(),
        deletedBy: req.user!.uid,
        updatedAt: admin.firestore.Timestamp.now(),
        updatedBy: req.user!.uid
      });

      // Disable Auth account
      await admin.auth().updateUser(id, {
        disabled: true
      });

      res.status(200).json({
        success: true,
        data: {
          message: 'User deleted successfully'
        }
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete user'
        }
      });
    }
  }
);

// Get available roles
router.get('/meta/roles',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const roles = [
        { id: 'super_admin', name: 'Super Admin', description: 'Full system access' },
        { id: 'admin', name: 'Admin', description: 'Administrative access' },
        { id: 'hr', name: 'HR', description: 'Human Resources access' },
        { id: 'manager', name: 'Manager', description: 'Team management access' },
        { id: 'employee', name: 'Employee', description: 'Standard employee access' },
        { id: 'client', name: 'Client', description: 'Client portal access' },
        { id: 'candidate', name: 'Candidate', description: 'Candidate portal access' }
      ];

      res.status(200).json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch roles'
        }
      });
    }
  }
);

// Get departments
router.get('/meta/departments',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const departments = [
        { id: 'engineering', name: 'Engineering' },
        { id: 'sales', name: 'Sales' },
        { id: 'marketing', name: 'Marketing' },
        { id: 'hr', name: 'Human Resources' },
        { id: 'finance', name: 'Finance' },
        { id: 'operations', name: 'Operations' },
        { id: 'support', name: 'Customer Support' },
        { id: 'product', name: 'Product' }
      ];

      res.status(200).json({
        success: true,
        data: departments
      });
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch departments'
        }
      });
    }
  }
);

// Get managers (for assigning to users)
router.get('/meta/managers',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const managersSnapshot = await admin.firestore()
        .collection('users')
        .where('roles', 'array-contains-any', ['manager', 'admin', 'super_admin'])
        .where('active', '==', true)
        .get();

      const managers: any[] = [];
      managersSnapshot.forEach(doc => {
        const userData = doc.data();
        managers.push({
          id: doc.id,
          displayName: userData.displayName,
          email: userData.email,
          department: userData.department
        });
      });

      res.status(200).json({
        success: true,
        data: managers
      });
    } catch (error) {
      console.error('Error fetching managers:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch managers'
        }
      });
    }
  }
);

export default router;