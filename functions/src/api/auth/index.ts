import express, { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { auth, db, COLLECTIONS, HTTP_STATUS, config } from '../../config/firebase';
import { validateBody, loginSchema, passwordResetSchema } from '../../middleware/validation';
import { AuthenticatedRequest, authenticate } from '../../middleware/auth';
import { nanoid } from 'nanoid';

const router = express.Router();

// Login endpoint
router.post('/login',
  validateBody(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password, twoFactorCode } = req.body;

      // Get user by email
      const usersSnapshot = await db
        .collection(COLLECTIONS.USERS)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
        return;
      }

      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();

      // Check if user is active
      if (!userData.active) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Your account is inactive. Please contact support.',
          },
        });
        return;
      }

      // Verify password
      const passwordHash = userData.passwordHash;
      if (!passwordHash || !await bcrypt.compare(password, passwordHash)) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
        return;
      }

      // Check 2FA if enabled
      if (userData.twoFactorEnabled && !twoFactorCode) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'TWO_FACTOR_REQUIRED',
            message: 'Two-factor authentication code required',
          },
        });
        return;
      }

      // Get user roles
      const userRoles = await getUserRoles(userDoc.id);
      const permissions = await getRolePermissions(userRoles);

      // Create custom token
      const customToken = await auth.createCustomToken(userDoc.id, {
        email: userData.email,
        name: userData.name,
        roles: userRoles,
        departmentId: userData.departmentId,
        portalAccess: userData.portalAccess,
      });

      // Generate JWT token
      const jwtToken = jwt.sign(
        {
          uid: userDoc.id,
          email: userData.email,
          name: userData.name,
          roles: userRoles,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        { uid: userDoc.id, type: 'refresh' },
        config.jwt.secret,
        { expiresIn: config.jwt.refreshExpiresIn }
      );

      // Store refresh token
      await db.collection('refreshTokens').add({
        userId: userDoc.id,
        token: refreshToken,
        createdAt: admin.firestore.Timestamp.now(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ),
      });

      // Update last login
      await db.collection(COLLECTIONS.USERS).doc(userDoc.id).update({
        lastLoginAt: admin.firestore.Timestamp.now(),
        lastLoginIp: req.ip,
      });

      // Log authentication
      await createAuditLog('user_login', userDoc.id, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          token: jwtToken,
          refreshToken,
          customToken,
          user: {
            id: userDoc.id,
            email: userData.email,
            name: userData.name,
            photoUrl: userData.photoUrl,
            roles: userRoles,
            permissions,
            department: userData.departmentId,
            portalAccess: userData.portalAccess,
          },
          expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: 'An error occurred during login',
        },
      });
    }
  }
);

// Refresh token endpoint
router.post('/refresh',
  validateBody(z.object({ refreshToken: z.string() })),
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      let decoded: any;
      try {
        decoded = jwt.verify(refreshToken, config.jwt.secret);
      } catch (error) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token',
          },
        });
        return;
      }

      // Check if refresh token exists in database
      const tokenSnapshot = await db
        .collection('refreshTokens')
        .where('userId', '==', decoded.uid)
        .where('token', '==', refreshToken)
        .limit(1)
        .get();

      if (tokenSnapshot.empty) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'REFRESH_TOKEN_NOT_FOUND',
            message: 'Refresh token not found or revoked',
          },
        });
        return;
      }

      const tokenDoc = tokenSnapshot.docs[0];
      const tokenData = tokenDoc.data();

      // Check if token is expired
      if (tokenData.expiresAt.toDate() < new Date()) {
        await tokenDoc.ref.delete();
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'REFRESH_TOKEN_EXPIRED',
            message: 'Refresh token has expired',
          },
        });
        return;
      }

      // Get user data
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();

      if (!userDoc.exists) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      const userData = userDoc.data()!;

      // Get updated roles and permissions
      const userRoles = await getUserRoles(decoded.uid);
      const permissions = await getRolePermissions(userRoles);

      // Generate new access token
      const newToken = jwt.sign(
        {
          uid: decoded.uid,
          email: userData.email,
          name: userData.name,
          roles: userRoles,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          token: newToken,
          user: {
            id: decoded.uid,
            email: userData.email,
            name: userData.name,
            roles: userRoles,
            permissions,
          },
          expiresIn: 7 * 24 * 60 * 60,
        },
      });
    } catch (error: any) {
      console.error('Token refresh error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          code: 'REFRESH_FAILED',
          message: 'Failed to refresh token',
        },
      });
    }
  }
);

// Logout endpoint
router.post('/logout',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Revoke refresh tokens
      const tokensSnapshot = await db
        .collection('refreshTokens')
        .where('userId', '==', req.user!.uid)
        .get();

      const batch = db.batch();
      tokensSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Log logout
      await createAuditLog('user_logout', req.user!.uid, {
        ip: req.ip,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message: 'Failed to logout',
        },
      });
    }
  }
);

// Password reset request endpoint
router.post('/reset-password',
  validateBody(passwordResetSchema),
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Get user by email
      const usersSnapshot = await db
        .collection(COLLECTIONS.USERS)
        .where('email', '==', email)
        .limit(1)
        .get();

      // Always return success to prevent email enumeration
      if (usersSnapshot.empty) {
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'If the email exists, a password reset link has been sent',
        });
        return;
      }

      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();

      // Generate reset token
      const resetToken = nanoid(32);
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await db.collection('passwordResets').add({
        userId: userDoc.id,
        token: resetToken,
        email: userData.email,
        createdAt: admin.firestore.Timestamp.now(),
        expiresAt: admin.firestore.Timestamp.fromDate(resetExpiry),
        used: false,
      });

      // Send reset email (implement email service)
      // await sendPasswordResetEmail(userData.email, resetToken);

      // Log password reset request
      await createAuditLog('password_reset_requested', userDoc.id, {
        email: userData.email,
        ip: req.ip,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          code: 'RESET_FAILED',
          message: 'Failed to process password reset request',
        },
      });
    }
  }
);

// Verify token endpoint
router.post('/verify',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        valid: true,
        user: req.user,
      },
    });
  }
);

// Helper functions

async function getUserRoles(userId: string): Promise<string[]> {
  const rolesSnapshot = await db
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection('roles')
    .get();

  const roles: string[] = [];
  rolesSnapshot.docs.forEach(doc => {
    const roleData = doc.data();
    if (!roleData.expiresAt || roleData.expiresAt.toDate() > new Date()) {
      roles.push(roleData.roleId);
    }
  });

  if (roles.length === 0) {
    roles.push('user'); // Default role
  }

  return roles;
}

async function getRolePermissions(roleIds: string[]): Promise<any[]> {
  const permissions: any[] = [];

  for (const roleId of roleIds) {
    const roleDoc = await db.collection(COLLECTIONS.ROLES).doc(roleId).get();
    if (roleDoc.exists) {
      const roleData = roleDoc.data()!;
      permissions.push(...(roleData.permissions || []));
    }
  }

  return permissions;
}

async function createAuditLog(action: string, userId: string, metadata: any): Promise<void> {
  await db.collection(COLLECTIONS.AUDIT_LOGS).add({
    timestamp: admin.firestore.Timestamp.now(),
    userId,
    action,
    entityType: 'auth',
    entityId: userId,
    metadata,
  });
}

export default router;