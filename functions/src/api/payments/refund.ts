import { Request, Response } from 'express';
import { z } from 'zod';
import { paymentService, RefundRequest } from '../../services/PaymentService';
import { db, COLLECTIONS, HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../config/firebase';

// Validation schemas
const createRefundSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  amount: z.number().positive('Refund amount must be positive').optional(),
  reason: z.string().min(1, 'Refund reason is required'),
  metadata: z.record(z.any()).optional(),
  notifyCustomer: z.boolean().optional().default(true),
});

const refundParamsSchema = z.object({
  refundId: z.string().min(1, 'Refund ID is required'),
});

/**
 * Create Refund
 * Processes a refund for a completed payment
 */
export async function createRefund(req: Request, res: Response): Promise<void> {
  try {
    // Check if user has permission to create refunds
    if (!req.user?.customClaims?.roles?.includes('finance') &&
        !req.user?.customClaims?.roles?.includes('admin')) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Only finance users can create refunds',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // Validate request body
    const validationResult = createRefundSchema.safeParse(req.body);
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

    const { paymentId, amount, reason, metadata, notifyCustomer } = validationResult.data;

    // Validate payment exists and is refundable
    const payment = await db.collection(COLLECTIONS.PAYMENTS).doc(paymentId).get();
    if (!payment.exists) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const paymentData = payment.data()!;

    // Check if payment is refundable
    const refundValidation = validateRefundEligibility(paymentData, amount);
    if (!refundValidation.valid) {
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        error: {
          code: 'REFUND_NOT_ALLOWED',
          message: refundValidation.reason,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // Create refund request
    const refundRequest: RefundRequest = {
      paymentId,
      amount,
      reason,
      metadata: {
        ...metadata,
        createdBy: req.user.uid,
        createdByEmail: req.user.email,
        notifyCustomer,
        source: 'api',
      },
    };

    // Process refund
    const result = await paymentService.processRefund(refundRequest);

    if (result.success) {
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          refundId: result.refundId,
          amount: result.amount,
          status: result.status,
          message: result.message,
          paymentId,
          reason,
          createdAt: new Date().toISOString(),
          createdBy: req.user.email,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
          version: '1.0',
        },
      });
    } else {
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        error: {
          code: 'REFUND_FAILED',
          message: result.error || 'Refund processing failed',
          details: {
            paymentId,
            amount: result.amount,
            reason,
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }
  } catch (error) {
    console.error('Create refund API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error occurred while processing refund',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

/**
 * Get Refund Status
 * Retrieves the status of a specific refund
 */
export async function getRefundStatus(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = refundParamsSchema.safeParse(req.params);
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

    const { refundId } = validationResult.data;

    // Check refunds collection (for Paymob refunds)
    let refund = await db.collection('paymobRefunds').doc(refundId).get();

    if (!refund.exists) {
      // Check refunds collection for Stripe refunds
      refund = await db.collection('refunds').doc(refundId).get();
    }

    if (!refund.exists) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'REFUND_NOT_FOUND',
          message: 'Refund not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const refundData = refund.data()!;

    // Format response
    const response = {
      refundId: refund.id,
      amount: refundData.amount,
      currency: refundData.currency,
      status: refundData.status,
      paymentId: refundData.paymentId || refundData.originalTransactionId,
      invoiceId: refundData.invoiceId,
      accountId: refundData.accountId,
      reason: refundData.reason,
      createdAt: refundData.createdAt?.toDate?.()?.toISOString() || refundData.createdAt,
      updatedAt: refundData.updatedAt?.toDate?.()?.toISOString() || refundData.updatedAt,

      // Include error information if refund failed
      ...(refundData.status === 'failed' && {
        errorCode: refundData.errorCode,
        errorMessage: refundData.errorMessage,
      }),

      // Include gateway-specific data if user has permissions
      ...(req.user?.customClaims?.roles?.includes('finance') && {
        gatewayRefundId: refundData.paymobRefundId || refundData.stripeRefundId,
        gatewayResponse: refundData.gatewayResponse,
        metadata: refundData.metadata,
      }),
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: response,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0',
      },
    });
  } catch (error) {
    console.error('Get refund status API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error occurred while retrieving refund status',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

/**
 * List Refunds for Payment
 * Retrieves all refunds for a specific payment
 */
export async function getPaymentRefunds(req: Request, res: Response): Promise<void> {
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

    // Get refunds from multiple collections
    const [paymobRefunds, stripeRefunds] = await Promise.all([
      db.collection('paymobRefunds')
        .where('originalTransactionId', '==', parseInt(paymentId))
        .get(),
      db.collection('refunds')
        .where('paymentIntentId', '==', paymentId)
        .get(),
    ]);

    const refunds = [
      ...paymobRefunds.docs.map(doc => ({
        id: doc.id,
        type: 'paymob',
        ...doc.data(),
      })),
      ...stripeRefunds.docs.map(doc => ({
        id: doc.id,
        type: 'stripe',
        ...doc.data(),
      })),
    ];

    // Sort by creation date
    refunds.sort((a, b) => {
      const aDate = new Date(a.createdAt?.toDate?.() || a.createdAt);
      const bDate = new Date(b.createdAt?.toDate?.() || b.createdAt);
      return bDate.getTime() - aDate.getTime();
    });

    // Format refunds
    const formattedRefunds = refunds.map(refund => ({
      refundId: refund.id,
      type: refund.type,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      reason: refund.reason,
      createdAt: refund.createdAt?.toDate?.()?.toISOString() || refund.createdAt,
      success: refund.success,
      ...(refund.errorMessage && { errorMessage: refund.errorMessage }),
    }));

    // Calculate total refunded amount
    const totalRefunded = formattedRefunds
      .filter(r => r.success !== false)
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        paymentId,
        refunds: formattedRefunds,
        summary: {
          totalRefunds: formattedRefunds.length,
          totalRefunded,
          successfulRefunds: formattedRefunds.filter(r => r.success !== false).length,
          failedRefunds: formattedRefunds.filter(r => r.success === false).length,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0',
      },
    });
  } catch (error) {
    console.error('Get payment refunds API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error occurred while retrieving payment refunds',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

/**
 * Get Refund History
 * Retrieves paginated refund history with filtering
 */
export async function getRefundHistory(req: Request, res: Response): Promise<void> {
  try {
    const {
      accountId,
      startDate,
      endDate,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);

    // Build queries for both refund collections
    const queries = [];

    // Paymob refunds query
    let paymobQuery = db.collection('paymobRefunds');
    if (accountId) paymobQuery = paymobQuery.where('accountId', '==', accountId);
    if (status) paymobQuery = paymobQuery.where('status', '==', status);
    if (startDate) paymobQuery = paymobQuery.where('createdAt', '>=', new Date(startDate as string));
    if (endDate) paymobQuery = paymobQuery.where('createdAt', '<=', new Date(endDate as string));
    queries.push(paymobQuery.orderBy('createdAt', 'desc'));

    // Stripe refunds query
    let stripeQuery = db.collection('refunds');
    if (accountId) stripeQuery = stripeQuery.where('accountId', '==', accountId);
    if (status) stripeQuery = stripeQuery.where('status', '==', status);
    if (startDate) stripeQuery = stripeQuery.where('createdAt', '>=', new Date(startDate as string));
    if (endDate) stripeQuery = stripeQuery.where('createdAt', '<=', new Date(endDate as string));
    queries.push(stripeQuery.orderBy('createdAt', 'desc'));

    // Execute queries
    const [paymobSnapshot, stripeSnapshot] = await Promise.all(
      queries.map(query => query.get())
    );

    // Combine and sort results
    const allRefunds = [
      ...paymobSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'paymob',
        ...doc.data(),
      })),
      ...stripeSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'stripe',
        ...doc.data(),
      })),
    ];

    // Sort by creation date
    allRefunds.sort((a, b) => {
      const aDate = new Date(a.createdAt?.toDate?.() || a.createdAt);
      const bDate = new Date(b.createdAt?.toDate?.() || b.createdAt);
      return bDate.getTime() - aDate.getTime();
    });

    // Apply pagination
    const offset = (pageNum - 1) * limitNum;
    const paginatedRefunds = allRefunds.slice(offset, offset + limitNum);

    // Format refunds
    const formattedRefunds = paginatedRefunds.map(refund => ({
      refundId: refund.id,
      type: refund.type,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      paymentId: refund.paymentId || refund.originalTransactionId?.toString(),
      invoiceId: refund.invoiceId,
      accountId: refund.accountId,
      reason: refund.reason,
      createdAt: refund.createdAt?.toDate?.()?.toISOString() || refund.createdAt,
      success: refund.success,
      ...(refund.errorMessage && { errorMessage: refund.errorMessage }),
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        refunds: formattedRefunds,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: allRefunds.length,
          pages: Math.ceil(allRefunds.length / limitNum),
          hasNext: offset + limitNum < allRefunds.length,
          hasPrev: pageNum > 1,
        },
        filters: {
          accountId,
          startDate,
          endDate,
          status,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0',
      },
    });
  } catch (error) {
    console.error('Get refund history API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error occurred while retrieving refund history',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

// Helper functions

function validateRefundEligibility(payment: any, refundAmount?: number): { valid: boolean; reason?: string } {
  // Check payment status
  if (payment.status !== 'completed') {
    return {
      valid: false,
      reason: 'Payment must be completed to be eligible for refund',
    };
  }

  // Check if already fully refunded
  if (payment.status === 'refunded') {
    return {
      valid: false,
      reason: 'Payment has already been fully refunded',
    };
  }

  // Check refund amount
  if (refundAmount) {
    const availableForRefund = payment.amount - (payment.refundedAmount || 0);

    if (refundAmount > availableForRefund) {
      return {
        valid: false,
        reason: `Refund amount (${refundAmount}) exceeds available refundable amount (${availableForRefund})`,
      };
    }

    if (refundAmount <= 0) {
      return {
        valid: false,
        reason: 'Refund amount must be greater than zero',
      };
    }
  }

  // Check if payment method supports refunds
  const refundSupportedMethods = ['stripe', 'paymob', 'instapay', 'vodafone_cash'];
  if (!refundSupportedMethods.includes(payment.method)) {
    return {
      valid: false,
      reason: `Refunds are not supported for payment method: ${payment.method}`,
    };
  }

  // Check if payment is too old (implementation-specific rules)
  const paymentDate = new Date(payment.createdAt?.toDate?.() || payment.createdAt);
  const daysSincePayment = (Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSincePayment > 180) { // 6 months
    return {
      valid: false,
      reason: 'Payment is too old to be refunded (over 6 months)',
    };
  }

  return { valid: true };
}