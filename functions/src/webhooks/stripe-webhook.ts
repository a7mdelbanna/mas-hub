import { Request, Response } from 'express';
import { stripeWebhookHandler } from '../integrations/stripe';
import { HTTP_STATUS } from '../config/firebase';

/**
 * Stripe Webhook Endpoint
 * Handles all Stripe webhook events with signature verification
 */
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  try {
    // Get raw body and signature
    const payload = req.body;
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      console.error('Missing Stripe signature header');
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'Stripe signature header is required',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Log webhook receipt
    console.log('Received Stripe webhook:', {
      signature: signature.substring(0, 20) + '...',
      bodySize: typeof payload === 'string' ? payload.length : JSON.stringify(payload).length,
      timestamp: new Date().toISOString(),
    });

    // Process webhook
    const result = await stripeWebhookHandler.handleWebhook(payload, signature);

    if (result.handled) {
      console.log('Stripe webhook processed successfully:', {
        eventType: result.eventType,
        message: result.message,
        timestamp: new Date().toISOString(),
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        eventType: result.eventType,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.warn('Stripe webhook not handled:', {
        eventType: result.eventType,
        message: result.message,
        timestamp: new Date().toISOString(),
      });

      // Return 200 even for unhandled events to prevent retries
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Event received but not handled',
        eventType: result.eventType,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error('Stripe webhook error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // For webhook signature verification errors, return 400
    if (error.message.includes('signature') || error.message.includes('Invalid')) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'WEBHOOK_SIGNATURE_VERIFICATION_FAILED',
          message: 'Webhook signature verification failed',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // For other errors, return 500 to trigger Stripe retries
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'WEBHOOK_PROCESSING_ERROR',
        message: 'Webhook processing failed',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

/**
 * Test Stripe Webhook Endpoint
 * For testing webhook endpoint connectivity
 */
export async function testStripeWebhook(req: Request, res: Response): Promise<void> {
  try {
    console.log('Stripe webhook test endpoint called:', {
      method: req.method,
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString(),
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Stripe webhook endpoint is reachable',
      timestamp: new Date().toISOString(),
      method: req.method,
      received: {
        headers: {
          'stripe-signature': req.headers['stripe-signature'] ? 'present' : 'missing',
          'content-type': req.headers['content-type'],
          'user-agent': req.headers['user-agent'],
        },
        bodyType: typeof req.body,
        bodySize: typeof req.body === 'string' ? req.body.length :
                  typeof req.body === 'object' ? JSON.stringify(req.body).length : 0,
      },
    });
  } catch (error) {
    console.error('Stripe webhook test error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'TEST_ENDPOINT_ERROR',
        message: 'Test endpoint error',
        timestamp: new Date().toISOString(),
      },
    });
  }
}