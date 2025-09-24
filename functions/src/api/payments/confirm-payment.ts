import { Request, Response } from 'express';
import { z } from 'zod';
import { paymentService } from '../../services/PaymentService';
import { stripePaymentIntent } from '../../integrations/stripe';
import { PaymentStatus } from '../../../src/types/models';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../config/firebase';

// Validation schemas
const confirmPaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  paymentMethodId: z.string().optional(), // For Stripe payment confirmation
  savePaymentMethod: z.boolean().optional(), // For future payments
  returnUrl: z.string().url().optional(),
});

const manualConfirmSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  transactionReference: z.string().min(1, 'Transaction reference is required'),
  paidAmount: z.number().positive('Paid amount must be positive'),
  paidAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(), // File URLs
});

/**
 * Confirm Payment
 * Confirms payment intent (primarily for Stripe)
 */
export async function confirmPayment(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const validationResult = confirmPaymentSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: ERROR_MESSAGES.VALIDATION_FAILED,
          details: validationResult.error.errors,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const { paymentId, paymentMethodId, returnUrl } = validationResult.data;

    try {
      // Confirm Stripe payment intent
      const result = await stripePaymentIntent.confirmPaymentIntent(paymentId, paymentMethodId);

      // Update payment status in our system
      await paymentService.updatePaymentStatus({
        paymentId: paymentId,
        status: result.status,
        paidAt: result.status === PaymentStatus.COMPLETED ? new Date() : undefined,
        metadata: {
          stripePaymentIntentId: result.paymentIntent.id,
          clientSecret: result.clientSecret,
          confirmedBy: req.user?.uid,
          confirmedAt: new Date().toISOString(),
        },
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          paymentId: result.paymentIntent.id,
          status: result.status,
          clientSecret: result.clientSecret,
          requiresAction: result.paymentIntent.status === 'requires_action',
          nextAction: result.paymentIntent.next_action,
          returnUrl,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
          version: '1.0',
        },
      });
    } catch (stripeError: any) {
      console.error('Stripe payment confirmation failed:', stripeError);

      // Update payment status to failed
      await paymentService.updatePaymentStatus({
        paymentId: paymentId,
        status: PaymentStatus.FAILED,
        failureReason: stripeError.message,
        metadata: {
          errorCode: stripeError.code,
          errorType: stripeError.type,
          failedAt: new Date().toISOString(),
        },
      });

      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        error: {
          code: 'PAYMENT_CONFIRMATION_FAILED',
          message: stripeError.message || 'Payment confirmation failed',
          details: {
            paymentId,
            errorCode: stripeError.code,
            errorType: stripeError.type,
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }
  } catch (error) {
    console.error('Confirm payment API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error occurred while confirming payment',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

/**
 * Manual Payment Confirmation
 * Manually confirms payment (for bank transfer, cash, etc.)
 */
export async function confirmManualPayment(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const validationResult = manualConfirmSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: ERROR_MESSAGES.VALIDATION_FAILED,
          details: validationResult.error.errors,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const {
      paymentId,
      transactionReference,
      paidAmount,
      paidAt,
      notes,
      attachments
    } = validationResult.data;

    // Check if user has permission to confirm manual payments
    if (!req.user?.customClaims?.roles?.includes('finance') &&
        !req.user?.customClaims?.roles?.includes('admin')) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Only finance users can confirm manual payments',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // Update payment status
    await paymentService.updatePaymentStatus({
      paymentId: paymentId,
      status: PaymentStatus.COMPLETED,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
      metadata: {
        transactionReference,
        paidAmount,
        confirmedBy: req.user.uid,
        confirmedByEmail: req.user.email,
        confirmedAt: new Date().toISOString(),
        confirmationType: 'manual',
        notes,
        attachments,
      },
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        paymentId,
        status: PaymentStatus.COMPLETED,
        transactionReference,
        paidAmount,
        paidAt: paidAt || new Date().toISOString(),
        confirmedBy: req.user.email,
        message: 'Manual payment confirmed successfully',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0',
      },
    });
  } catch (error) {
    console.error('Confirm manual payment API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error occurred while confirming manual payment',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

/**
 * Cancel Payment
 * Cancels a pending payment
 */
export async function cancelPayment(req: Request, res: Response): Promise<void> {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment ID is required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    try {
      // Try to cancel Stripe payment intent if it's a Stripe payment
      try {
        await stripePaymentIntent.cancelPaymentIntent(paymentId);
      } catch (stripeError) {
        // If it's not a Stripe payment intent, continue with manual cancellation
        console.log('Not a Stripe payment or already processed:', stripeError.message);
      }

      // Update payment status to cancelled
      await paymentService.updatePaymentStatus({
        paymentId: paymentId,
        status: PaymentStatus.FAILED, // Using FAILED as we don't have CANCELLED status
        failureReason: 'Payment cancelled by user',
        metadata: {
          cancelledBy: req.user?.uid,
          cancelledByEmail: req.user?.email,
          cancelledAt: new Date().toISOString(),
          cancellationReason: 'user_request',
        },
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          paymentId,
          status: 'cancelled',
          message: 'Payment cancelled successfully',
          cancelledAt: new Date().toISOString(),
          cancelledBy: req.user?.email,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
          version: '1.0',
        },
      });
    } catch (cancellationError: any) {
      console.error('Payment cancellation failed:', cancellationError);

      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        error: {
          code: 'PAYMENT_CANCELLATION_FAILED',
          message: cancellationError.message || 'Failed to cancel payment',
          details: {
            paymentId,
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }
  } catch (error) {
    console.error('Cancel payment API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error occurred while cancelling payment',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

/**
 * Retry Failed Payment
 * Retries a failed payment with same parameters
 */
export async function retryPayment(req: Request, res: Response): Promise<void> {
  try {
    const { paymentId } = req.params;
    const { paymentMethodId } = req.body;

    if (!paymentId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment ID is required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // TODO: Implement payment retry logic
    // This would involve:
    // 1. Getting the original payment details
    // 2. Creating a new payment with the same parameters
    // 3. Optionally using a different payment method

    res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Payment retry functionality is not yet implemented',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  } catch (error) {
    console.error('Retry payment API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error occurred while retrying payment',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}