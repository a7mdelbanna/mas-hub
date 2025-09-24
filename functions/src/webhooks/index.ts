import { Router } from 'express';
import express from 'express';
import {
  handleStripeWebhook,
  testStripeWebhook,
} from './stripe-webhook';
import {
  handlePaymobWebhook,
  testPaymobWebhook,
  handlePaymobCallback,
} from './paymob-webhook';
import {
  webhookRateLimit,
  validateWebhookRequest,
  logWebhookRequest,
  handleIdempotency,
  getStripeIPRanges,
  ipWhitelist,
} from './webhook-security';

const router = Router();

// ============================================
// Webhook Security Middleware
// ============================================

// Rate limiting for all webhook endpoints
router.use(webhookRateLimit(1000, 60000)); // 1000 requests per minute

// Basic webhook validation
router.use(validateWebhookRequest);

// Idempotency handling
router.use(handleIdempotency(24 * 60 * 60 * 1000)); // 24 hour TTL

// ============================================
// Stripe Webhooks
// ============================================

/**
 * @route POST /webhooks/stripe
 * @desc Handle Stripe webhook events
 * @access Public (with signature verification)
 */
router.post(
  '/stripe',
  logWebhookRequest('Stripe'),
  // Optional IP whitelist (uncomment if needed)
  // ipWhitelist(getStripeIPRanges()),
  express.raw({ type: 'application/json', limit: '1mb' }),
  handleStripeWebhook
);

/**
 * @route GET /webhooks/stripe/test
 * @desc Test Stripe webhook endpoint
 * @access Public
 */
router.get('/stripe/test', testStripeWebhook);

/**
 * @route POST /webhooks/stripe/test
 * @desc Test Stripe webhook endpoint with POST
 * @access Public
 */
router.post('/stripe/test', testStripeWebhook);

// ============================================
// Paymob Webhooks
// ============================================

/**
 * @route POST /webhooks/paymob
 * @desc Handle Paymob webhook events
 * @access Public (with optional signature verification)
 */
router.post(
  '/paymob',
  logWebhookRequest('Paymob'),
  express.json({ limit: '1mb' }),
  handlePaymobWebhook
);

/**
 * @route GET /webhooks/paymob/test
 * @desc Test Paymob webhook endpoint
 * @access Public
 */
router.get('/paymob/test', testPaymobWebhook);

/**
 * @route POST /webhooks/paymob/test
 * @desc Test Paymob webhook endpoint with POST
 * @access Public
 */
router.post('/paymob/test', testPaymobWebhook);

/**
 * @route GET /webhooks/paymob/callback
 * @desc Handle Paymob payment callback (user redirect)
 * @access Public
 */
router.get(
  '/paymob/callback',
  logWebhookRequest('Paymob Callback'),
  handlePaymobCallback
);

/**
 * @route POST /webhooks/paymob/callback
 * @desc Handle Paymob payment callback (POST)
 * @access Public
 */
router.post(
  '/paymob/callback',
  logWebhookRequest('Paymob Callback'),
  express.json({ limit: '1mb' }),
  handlePaymobCallback
);

// ============================================
// Generic Webhook Endpoints
// ============================================

/**
 * @route GET /webhooks/health
 * @desc Webhook system health check
 * @access Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Webhook system is healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      stripe: '/webhooks/stripe',
      paymob: '/webhooks/paymob',
      paymobCallback: '/webhooks/paymob/callback',
    },
    security: {
      rateLimiting: 'enabled',
      requestValidation: 'enabled',
      idempotencyHandling: 'enabled',
      signatureVerification: 'enabled',
    },
  });
});

/**
 * @route GET /webhooks/info
 * @desc Get webhook configuration information
 * @access Public
 */
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Webhook system information',
    timestamp: new Date().toISOString(),
    webhooks: {
      stripe: {
        endpoint: '/webhooks/stripe',
        methods: ['POST'],
        contentType: 'application/json',
        signatureHeader: 'stripe-signature',
        signatureVerification: true,
        events: [
          'payment_intent.succeeded',
          'payment_intent.payment_failed',
          'checkout.session.completed',
          'invoice.paid',
          'customer.subscription.created',
          'charge.refund.updated',
        ],
      },
      paymob: {
        endpoint: '/webhooks/paymob',
        methods: ['POST'],
        contentType: 'application/json',
        signatureHeader: 'x-paymob-signature',
        signatureVerification: false, // Optional
        events: [
          'transaction.processed',
          'transaction.failed',
          'refund.processed',
        ],
      },
      paymobCallback: {
        endpoint: '/webhooks/paymob/callback',
        methods: ['GET', 'POST'],
        description: 'User redirect endpoint after payment completion',
        parameters: ['success', 'transaction_id', 'return_url'],
      },
    },
    security: {
      rateLimiting: {
        enabled: true,
        limit: '1000 requests per minute',
      },
      idempotency: {
        enabled: true,
        ttl: '24 hours',
      },
      validation: {
        enabled: true,
        contentTypeCheck: true,
        bodyValidation: true,
      },
    },
    testing: {
      stripeTest: '/webhooks/stripe/test',
      paymobTest: '/webhooks/paymob/test',
      healthCheck: '/webhooks/health',
    },
  });
});

// ============================================
// Error Handling
// ============================================

// Global error handler for webhook routes
router.use((error: any, req: any, res: any, next: any) => {
  console.error('Webhook Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString(),
  });

  // Don't expose internal errors to webhook callers
  res.status(500).json({
    success: false,
    error: {
      code: 'WEBHOOK_PROCESSING_ERROR',
      message: 'Webhook processing failed',
      timestamp: new Date().toISOString(),
    },
  });
});

// Handle 404 for unknown webhook endpoints
router.use('*', (req, res) => {
  console.warn('Unknown webhook endpoint accessed:', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString(),
  });

  res.status(404).json({
    success: false,
    error: {
      code: 'WEBHOOK_ENDPOINT_NOT_FOUND',
      message: 'Webhook endpoint not found',
      availableEndpoints: [
        '/webhooks/stripe',
        '/webhooks/paymob',
        '/webhooks/paymob/callback',
        '/webhooks/health',
        '/webhooks/info',
      ],
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;

// Export individual handlers for testing
export {
  handleStripeWebhook,
  testStripeWebhook,
  handlePaymobWebhook,
  testPaymobWebhook,
  handlePaymobCallback,
};