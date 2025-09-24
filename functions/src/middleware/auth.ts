import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { auth, db, COLLECTIONS, ERROR_MESSAGES, HTTP_STATUS } from '../config/firebase';

// Extended Request interface with user data
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    name: string;
    roles: string[];
    permissions: Permission[];
    departmentId?: string;
    portalType?: 'employee' | 'client' | 'candidate';
    accountIds?: string[]; // For client portal access
    customClaims?: any;
  };
  token?: admin.auth.DecodedIdToken;
}

export interface Permission {
  resource: string;
  actions: string[];
  scope?: 'own' | 'department' | 'all';
}

/**
 * Middleware to authenticate Firebase ID token
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: ERROR_MESSAGES.UNAUTHORIZED,
        },
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Get user details from Firestore
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found in database',
        },
      });
      return;
    }

    const userData = userDoc.data()!;

    // Check if user is active
    if (!userData.active) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'User account is inactive',
        },
      });
      return;
    }

    // Get user roles and permissions
    const roles = await getUserRoles(decodedToken.uid);
    const permissions = await getUserPermissions(roles);

    // Set user data in request
    req.user = {
      uid: decodedToken.uid,
      email: userData.email,
      name: userData.name,
      roles,
      permissions,
      departmentId: userData.departmentId,
      portalType: decodedToken.portalType,
      accountIds: decodedToken.accountIds || userData.portalAccess?.client,
      customClaims: decodedToken,
    };
    req.token = decodedToken;

    next();
  } catch (error: any) {
    console.error('Authentication error:', error);

    if (error.code === 'auth/id-token-expired') {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: ERROR_MESSAGES.TOKEN_EXPIRED,
        },
      });
    } else {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: ERROR_MESSAGES.INVALID_TOKEN,
        },
      });
    }
  }
};

/**
 * Middleware to check if user has specific permission
 */
export const authorize = (resource: string, action: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: ERROR_MESSAGES.UNAUTHORIZED,
        },
      });
      return;
    }

    const hasPermission = checkPermission(req.user.permissions, resource, action, req);

    if (!hasPermission) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: ERROR_MESSAGES.FORBIDDEN,
          details: {
            resource,
            action,
            required: `${resource}:${action}`,
          },
        },
      });
      return;
    }

    next();
  };
};

/**
 * Middleware for portal-specific authentication
 */
export const authenticatePortal = (portalType: 'client' | 'employee' | 'candidate') => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await authenticate(req, res, () => {
      if (req.user?.portalType !== portalType) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: {
            code: 'INVALID_PORTAL_ACCESS',
            message: `This endpoint requires ${portalType} portal access`,
          },
        });
        return;
      }
      next();
    });
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: ERROR_MESSAGES.UNAUTHORIZED,
      },
    });
    return;
  }

  const isAdmin = req.user.roles.includes('admin') || req.user.roles.includes('super_admin');

  if (!isAdmin) {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: {
        code: 'ADMIN_REQUIRED',
        message: 'Administrator privileges required',
      },
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user owns the resource
 */
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: ERROR_MESSAGES.UNAUTHORIZED,
        },
      });
      return;
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.user.uid;

    // Check ownership based on resource type
    // This is a simplified version - actual implementation would check specific resources
    const isOwner = await checkResourceOwnership(resourceId, userId, req.path);

    if (!isOwner && !req.user.roles.includes('admin')) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource',
        },
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication - continues even if not authenticated
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    const userDoc = await db.collection(COLLECTIONS.USERS).doc(decodedToken.uid).get();

    if (userDoc.exists && userDoc.data()!.active) {
      const userData = userDoc.data()!;
      const roles = await getUserRoles(decodedToken.uid);
      const permissions = await getUserPermissions(roles);

      req.user = {
        uid: decodedToken.uid,
        email: userData.email,
        name: userData.name,
        roles,
        permissions,
        departmentId: userData.departmentId,
        customClaims: decodedToken,
      };
      req.token = decodedToken;
    }
  } catch (error) {
    // Ignore authentication errors for optional auth
    console.debug('Optional auth failed:', error);
  }

  next();
};

// Helper functions

/**
 * Get user roles from database
 */
async function getUserRoles(userId: string): Promise<string[]> {
  const userRolesSnapshot = await db
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection('roles')
    .get();

  const roles: string[] = [];

  for (const doc of userRolesSnapshot.docs) {
    const roleData = doc.data();
    if (!roleData.expiresAt || roleData.expiresAt.toDate() > new Date()) {
      roles.push(roleData.roleId);
    }
  }

  // Default role if no roles assigned
  if (roles.length === 0) {
    roles.push('user');
  }

  return roles;
}

/**
 * Get permissions for given roles
 */
async function getUserPermissions(roleIds: string[]): Promise<Permission[]> {
  const permissions: Permission[] = [];
  const processedPermissions = new Set<string>();

  for (const roleId of roleIds) {
    const roleDoc = await db.collection(COLLECTIONS.ROLES).doc(roleId).get();

    if (roleDoc.exists) {
      const roleData = roleDoc.data()!;
      for (const permission of roleData.permissions || []) {
        const permissionKey = `${permission.resource}:${permission.actions.join(',')}:${permission.scope || 'own'}`;

        if (!processedPermissions.has(permissionKey)) {
          permissions.push(permission);
          processedPermissions.add(permissionKey);
        }
      }
    }
  }

  return permissions;
}

/**
 * Check if user has required permission
 */
function checkPermission(
  permissions: Permission[],
  resource: string,
  action: string,
  req: AuthenticatedRequest
): boolean {
  for (const permission of permissions) {
    if (permission.resource === resource && permission.actions.includes(action)) {
      // Check scope-based access
      if (permission.scope === 'all') {
        return true;
      }

      if (permission.scope === 'department') {
        // Check if resource belongs to user's department
        // This would need to be implemented based on resource type
        return true;
      }

      if (permission.scope === 'own') {
        // Check if user owns the resource
        // This would need to be implemented based on resource type
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if user owns a resource
 */
async function checkResourceOwnership(
  resourceId: string,
  userId: string,
  path: string
): Promise<boolean> {
  // Determine resource type from path
  if (path.includes('/projects')) {
    const projectDoc = await db.collection(COLLECTIONS.PROJECTS).doc(resourceId).get();
    if (!projectDoc.exists) return false;
    const project = projectDoc.data()!;
    return project.managerId === userId || project.members?.includes(userId);
  }

  if (path.includes('/tasks')) {
    const taskDoc = await db.collection(COLLECTIONS.TASKS).doc(resourceId).get();
    if (!taskDoc.exists) return false;
    const task = taskDoc.data()!;
    return task.assigneeId === userId || task.createdBy === userId;
  }

  if (path.includes('/invoices')) {
    const invoiceDoc = await db.collection(COLLECTIONS.INVOICES).doc(resourceId).get();
    if (!invoiceDoc.exists) return false;
    const invoice = invoiceDoc.data()!;
    return invoice.createdBy === userId;
  }

  // Default to false for unknown resource types
  return false;
}

/**
 * Rate limiting middleware factory
 */
export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const identifier = req.user?.uid || req.ip;
    const now = Date.now();

    const userRequests = requests.get(identifier);

    if (!userRequests || userRequests.resetTime < now) {
      requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }

    if (userRequests.count >= maxRequests) {
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
          retryAfter: Math.ceil((userRequests.resetTime - now) / 1000),
        },
      });
      return;
    }

    userRequests.count++;
    next();
  };
};