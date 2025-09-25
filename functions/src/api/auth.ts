import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';

const router = Router();

interface SignupRequest {
  email: string;
  password: string;
  displayName: string;
  role: string;
  phoneNumber?: string;
  companyName?: string;
  department?: string;
  position?: string;
}

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      displayName,
      role,
      phoneNumber,
      companyName,
      department,
      position
    } = req.body as SignupRequest;

    if (!email || !password || !displayName || !role) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Email, password, display name, and role are required'
        }
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters long'
        }
      });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      phoneNumber,
      emailVerified: false
    });

    const roles = [role];
    const portalAccess: any = {
      admin: false,
      employee: false,
      client: [],
      candidate: false
    };

    if (role === 'admin' || role === 'super_admin') {
      roles.push('admin');
      portalAccess.admin = true;
      portalAccess.employee = true;
    } else if (role === 'manager') {
      roles.push('employee');
      portalAccess.employee = true;
    } else if (role === 'employee') {
      portalAccess.employee = true;
    } else if (role === 'client') {
      portalAccess.client = [userRecord.uid];
    } else if (role === 'candidate') {
      portalAccess.candidate = true;
    }

    await admin.auth().setCustomUserClaims(userRecord.uid, {
      roles,
      permissions: [],
      portalAccess
    });

    const userProfile = {
      id: userRecord.uid,
      email: userRecord.email!,
      displayName,
      phoneNumber: phoneNumber || null,
      roles,
      permissions: [],
      portalAccess,
      active: true,
      language: 'en',
      companyName: companyName || null,
      department: department || null,
      position: position || null,
      onboardingCompleted: false,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: userRecord.uid,
      updatedBy: userRecord.uid
    };

    await admin.firestore().collection('users').doc(userRecord.uid).set(userProfile);

    await admin.auth().generateEmailVerificationLink(email, {
      url: `${process.env.APP_URL || 'http://localhost:3000'}/verify-email`
    }).then(async (link) => {
      console.log('Email verification link:', link);
    }).catch(err => {
      console.error('Error generating verification link:', err);
    });

    return res.status(201).json({
      success: true,
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        roles,
        message: 'User created successfully. Please check your email to verify your account.'
      }
    });

  } catch (error: any) {
    console.error('Signup error:', error);

    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'An account with this email already exists'
        }
      });
    }

    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Invalid email address'
        }
      });
    }

    if (error.code === 'auth/invalid-password') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Password must be at least 6 characters'
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create user account'
      }
    });
  }
});

router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'ID token is required'
        }
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    await admin.firestore().collection('users').doc(uid).update({
      emailVerified: true,
      updatedAt: admin.firestore.Timestamp.now()
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Email verified successfully'
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify email'
      }
    });
  }
});

router.post('/complete-onboarding', async (req: Request, res: Response) => {
  try {
    const { idToken, profileData } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'ID token is required'
        }
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    await admin.firestore().collection('users').doc(uid).update({
      ...profileData,
      onboardingCompleted: true,
      updatedAt: admin.firestore.Timestamp.now()
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Onboarding completed successfully'
      }
    });

  } catch (error) {
    console.error('Onboarding completion error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to complete onboarding'
      }
    });
  }
});

export default router;