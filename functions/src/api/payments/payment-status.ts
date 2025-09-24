import { Request, Response } from 'express';
import { z } from 'zod';
import { db, COLLECTIONS, HTTP_STATUS, ERROR_MESSAGES } from '../../config/firebase';
import { paymentService } from '../../services/PaymentService';
import { stripePaymentIntent } from '../../integrations/stripe';
import { paymobTransaction } from '../../integrations/paymob';
import { PaymentMethod, PaymentStatus } from '../../../src/types/models';

// Validation schemas
const paymentStatusParamsSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
});

const bulkStatusQuerySchema = z.object({
  paymentIds: z.string().min(1, 'Payment IDs are required'),
});

/**
 * Get Payment Status
 * Retrieves current status of a payment
 */
export async function getPaymentStatus(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = paymentStatusParamsSchema.safeParse(req.params);
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

    const { paymentId } = validationResult.data;

    // Get payment from database
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

    // Check if we should sync status from gateway
    const shouldSync = req.query.sync === 'true';
    let updatedStatus = paymentData.status;
    let gatewayData: any = {};

    if (shouldSync && paymentData.gatewayTransactionId) {
      try {
        const syncResult = await syncPaymentStatusFromGateway(paymentData);
        if (syncResult.updated) {
          updatedStatus = syncResult.status;
          gatewayData = syncResult.gatewayData;

          // Update database if status changed
          if (syncResult.status !== paymentData.status) {
            await paymentService.updatePaymentStatus({
              paymentId: paymentId,
              status: syncResult.status,
              paidAt: syncResult.status === PaymentStatus.COMPLETED ? new Date() : undefined,
              metadata: {
                ...paymentData.metadata,
                lastSyncAt: new Date().toISOString(),
                gatewayData: syncResult.gatewayData,
              },
            });
          }
        }
      } catch (syncError) {
        console.error('Failed to sync payment status from gateway:', syncError);
        // Continue with database status if sync fails
      }
    }

    // Format response
    const response = {
      paymentId: paymentId,
      status: updatedStatus,
      amount: paymentData.amount,
      currency: paymentData.currency,
      method: paymentData.method,
      paidAt: paymentData.paidAt?.toDate?.()?.toISOString() || paymentData.paidAt,
      createdAt: paymentData.createdAt?.toDate?.()?.toISOString() || paymentData.createdAt,
      updatedAt: paymentData.updatedAt?.toDate?.()?.toISOString() || paymentData.updatedAt,
      reference: paymentData.reference,
      invoiceId: paymentData.invoiceId,
      accountId: paymentData.accountId,
      receiptUrl: paymentData.receiptUrl,
      notes: paymentData.notes,
      failureReason: paymentData.failureReason,

      // Include gateway-specific data
      ...(gatewayData && Object.keys(gatewayData).length > 0 && { gateway: gatewayData }),

      // Include metadata if user has appropriate permissions
      ...(req.user?.customClaims?.roles?.includes('finance') && {
        metadata: paymentData.metadata,
        gatewayResponse: paymentData.gatewayResponse,
      }),
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: response,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0',
        synced: shouldSync,
      },
    });
  } catch (error) {
    console.error('Get payment status API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error occurred while retrieving payment status',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

/**
 * Get Bulk Payment Status
 * Retrieves status for multiple payments
 */
export async function getBulkPaymentStatus(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = bulkStatusQuerySchema.safeParse(req.query);
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

    const { paymentIds } = validationResult.data;
    const paymentIdList = paymentIds.split(',').map(id => id.trim()).filter(Boolean);

    if (paymentIdList.length === 0 || paymentIdList.length > 50) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide 1-50 payment IDs',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // Get payments from database
    const payments: any[] = [];
    const notFound: string[] = [];

    // Batch get payments (Firestore limit is 10 per batch)
    const batches = [];
    for (let i = 0; i < paymentIdList.length; i += 10) {
      const batch = paymentIdList.slice(i, i + 10);
      batches.push(batch);
    }

    for (const batch of batches) {
      const promises = batch.map(id => db.collection(COLLECTIONS.PAYMENTS).doc(id).get());
      const docs = await Promise.all(promises);

      docs.forEach((doc, index) => {
        if (doc.exists) {
          payments.push({
            paymentId: doc.id,
            ...doc.data(),
          });
        } else {
          notFound.push(batch[index]);
        }
      });
    }

    // Format response data
    const responseData = payments.map(payment => ({
      paymentId: payment.paymentId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      paidAt: payment.paidAt?.toDate?.()?.toISOString() || payment.paidAt,
      createdAt: payment.createdAt?.toDate?.()?.toISOString() || payment.createdAt,
      reference: payment.reference,
      invoiceId: payment.invoiceId,
      accountId: payment.accountId,
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        payments: responseData,
        summary: {
          total: paymentIdList.length,
          found: payments.length,
          notFound: notFound.length,
          notFoundIds: notFound,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0',
      },
    });
  } catch (error) {
    console.error('Get bulk payment status API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error occurred while retrieving bulk payment status',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

/**
 * Get Payment Timeline
 * Retrieves timeline/history of payment events
 */
export async function getPaymentTimeline(req: Request, res: Response): Promise<void> {
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

    // Get payment
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

    // Get audit logs for payment
    const auditLogs = await db.collection(COLLECTIONS.AUDIT_LOGS)
      .where('entityType', '==', 'payment')
      .where('entityId', '==', paymentId)
      .orderBy('timestamp', 'desc')
      .get();

    const timeline = auditLogs.docs.map(doc => {
      const log = doc.data();
      return {
        timestamp: log.timestamp.toDate().toISOString(),
        action: log.action,
        userId: log.userId,
        userEmail: log.userEmail,
        changes: log.changes,
        metadata: log.metadata,
      };
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        paymentId,
        timeline,
        count: timeline.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0',
      },
    });
  } catch (error) {
    console.error('Get payment timeline API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error occurred while retrieving payment timeline',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

// Helper functions

async function syncPaymentStatusFromGateway(payment: any): Promise<{
  updated: boolean;
  status: PaymentStatus;
  gatewayData: any;
}> {
  try {
    switch (payment.method) {
      case PaymentMethod.STRIPE:
        const stripeResult = await stripePaymentIntent.getPaymentIntent(payment.gatewayTransactionId);
        return {
          updated: true,
          status: mapStripeStatus(stripeResult.status),
          gatewayData: {
            status: stripeResult.status,
            amount: stripeResult.amount / 100,
            currency: stripeResult.currency,
            paymentMethod: stripeResult.payment_method,
            clientSecret: stripeResult.client_secret,
          },
        };

      case PaymentMethod.PAYMOB:
      case PaymentMethod.INSTAPAY:
      case PaymentMethod.VODAFONE_CASH:
        const transactionId = parseInt(payment.gatewayTransactionId);
        const paymobResult = await paymobTransaction.getTransaction(transactionId);
        return {
          updated: true,
          status: mapPaymobStatus(paymobResult),
          gatewayData: {
            id: paymobResult.id,
            success: paymobResult.success,
            pending: paymobResult.pending,
            amount: paymobResult.amount_cents / 100,
            currency: paymobResult.currency,
            errorCode: paymobResult.error_code,
            errorMessage: paymobResult.error_message,
          },
        };

      default:
        return {
          updated: false,
          status: payment.status,
          gatewayData: {},
        };
    }
  } catch (error) {
    console.error('Gateway sync error:', error);
    throw error;
  }
}

function mapStripeStatus(stripeStatus: string): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    requires_payment_method: PaymentStatus.PENDING,
    requires_confirmation: PaymentStatus.PENDING,
    requires_action: PaymentStatus.PENDING,
    processing: PaymentStatus.PROCESSING,
    succeeded: PaymentStatus.COMPLETED,
    canceled: PaymentStatus.FAILED,
  };

  return statusMap[stripeStatus] || PaymentStatus.FAILED;
}

function mapPaymobStatus(transaction: any): PaymentStatus {
  if (transaction.is_refunded) {
    return PaymentStatus.REFUNDED;
  }

  if (transaction.error_occured || (!transaction.success && !transaction.pending)) {
    return PaymentStatus.FAILED;
  }

  if (transaction.pending) {
    return PaymentStatus.PROCESSING;
  }

  if (transaction.success) {
    return PaymentStatus.COMPLETED;
  }

  return PaymentStatus.PENDING;
}