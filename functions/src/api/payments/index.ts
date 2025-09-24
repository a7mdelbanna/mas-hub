import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validationMiddleware } from '../../middleware/validation';
import {
  createPayment,
  getPaymentMethods,
  estimatePaymentFees,
} from './create-payment';
import {
  confirmPayment,
  confirmManualPayment,
  cancelPayment,
  retryPayment,
} from './confirm-payment';
import {
  getPaymentStatus,
  getBulkPaymentStatus,
  getPaymentTimeline,
} from './payment-status';
import {
  getPaymentHistory,
  getPaymentAnalytics,
  exportPaymentHistory,
} from './payment-history';
import {
  createRefund,
  getRefundStatus,
  getPaymentRefunds,
  getRefundHistory,
} from './refund';

const router = Router();

// Apply authentication middleware to all payment routes
router.use(authMiddleware);

// ============================================
// Payment Creation & Processing
// ============================================

/**
 * @route POST /api/payments
 * @desc Create a new payment
 * @access Private
 */
router.post('/', createPayment);

/**
 * @route GET /api/payments/methods
 * @desc Get available payment methods
 * @access Private
 */
router.get('/methods', getPaymentMethods);

/**
 * @route GET /api/payments/fees/estimate
 * @desc Estimate payment fees for different methods
 * @access Private
 */
router.get('/fees/estimate', estimatePaymentFees);

// ============================================
// Payment Confirmation & Management
// ============================================

/**
 * @route POST /api/payments/:paymentId/confirm
 * @desc Confirm a payment intent (Stripe)
 * @access Private
 */
router.post('/:paymentId/confirm', confirmPayment);

/**
 * @route POST /api/payments/:paymentId/confirm-manual
 * @desc Manually confirm a payment (bank transfer, cash, etc.)
 * @access Private (Finance users only)
 */
router.post('/:paymentId/confirm-manual', confirmManualPayment);

/**
 * @route POST /api/payments/:paymentId/cancel
 * @desc Cancel a pending payment
 * @access Private
 */
router.post('/:paymentId/cancel', cancelPayment);

/**
 * @route POST /api/payments/:paymentId/retry
 * @desc Retry a failed payment
 * @access Private
 */
router.post('/:paymentId/retry', retryPayment);

// ============================================
// Payment Status & Information
// ============================================

/**
 * @route GET /api/payments/:paymentId
 * @desc Get payment status
 * @access Private
 */
router.get('/:paymentId', getPaymentStatus);

/**
 * @route GET /api/payments/status/bulk
 * @desc Get status for multiple payments
 * @access Private
 */
router.get('/status/bulk', getBulkPaymentStatus);

/**
 * @route GET /api/payments/:paymentId/timeline
 * @desc Get payment timeline/history
 * @access Private
 */
router.get('/:paymentId/timeline', getPaymentTimeline);

// ============================================
// Payment History & Analytics
// ============================================

/**
 * @route GET /api/payments
 * @desc Get payment history with filtering and pagination
 * @access Private
 */
router.get('/', getPaymentHistory);

/**
 * @route GET /api/payments/analytics
 * @desc Get payment analytics and metrics
 * @access Private (Finance users only)
 */
router.get('/analytics/summary', getPaymentAnalytics);

/**
 * @route GET /api/payments/export
 * @desc Export payment history to CSV/Excel
 * @access Private (Finance users only)
 */
router.get('/export', exportPaymentHistory);

// ============================================
// Refund Management
// ============================================

/**
 * @route POST /api/payments/refunds
 * @desc Create a refund for a payment
 * @access Private (Finance users only)
 */
router.post('/refunds', createRefund);

/**
 * @route GET /api/payments/refunds/:refundId
 * @desc Get refund status
 * @access Private
 */
router.get('/refunds/:refundId', getRefundStatus);

/**
 * @route GET /api/payments/:paymentId/refunds
 * @desc Get all refunds for a payment
 * @access Private
 */
router.get('/:paymentId/refunds', getPaymentRefunds);

/**
 * @route GET /api/payments/refunds
 * @desc Get refund history with filtering and pagination
 * @access Private (Finance users only)
 */
router.get('/refunds', getRefundHistory);

// Error handling middleware for payment routes
router.use((error: any, req: any, res: any, next: any) => {
  console.error('Payment API Error:', error);

  // Handle specific payment-related errors
  if (error.type === 'StripeCardError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'PAYMENT_CARD_ERROR',
        message: error.message,
        details: {
          decline_code: error.decline_code,
          payment_method: error.payment_method,
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  if (error.type === 'StripeInvalidRequestError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'PAYMENT_INVALID_REQUEST',
        message: error.message,
        details: {
          param: error.param,
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  // Handle Paymob errors
  if (error.message?.includes('Paymob')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'PAYMENT_GATEWAY_ERROR',
        message: 'Payment gateway error occurred',
        details: {
          gateway: 'paymob',
          originalError: error.message,
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  // Default error handling
  res.status(500).json({
    success: false,
    error: {
      code: 'PAYMENT_SERVER_ERROR',
      message: 'Internal server error in payment processing',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
});

export default router;

// Export individual route handlers for testing
export {
  // Payment creation
  createPayment,
  getPaymentMethods,
  estimatePaymentFees,

  // Payment confirmation
  confirmPayment,
  confirmManualPayment,
  cancelPayment,
  retryPayment,

  // Payment status
  getPaymentStatus,
  getBulkPaymentStatus,
  getPaymentTimeline,

  // Payment history
  getPaymentHistory,
  getPaymentAnalytics,
  exportPaymentHistory,

  // Refunds
  createRefund,
  getRefundStatus,
  getPaymentRefunds,
  getRefundHistory,
};