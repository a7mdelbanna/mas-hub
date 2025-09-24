import { Request, Response } from 'express';
import { paymobWebhookHandler } from '../integrations/paymob';
import { HTTP_STATUS } from '../config/firebase';

/**
 * Paymob Webhook Endpoint
 * Handles all Paymob webhook events with optional signature verification
 */
export async function handlePaymobWebhook(req: Request, res: Response): Promise<void> {
  try {
    // Get payload and signature
    const payload = req.body;
    const signature = req.headers['x-paymob-signature'] as string;

    // Log webhook receipt
    console.log('Received Paymob webhook:', {
      hasSignature: !!signature,
      bodySize: typeof payload === 'string' ? payload.length : JSON.stringify(payload).length,
      payloadType: typeof payload,
      timestamp: new Date().toISOString(),
    });

    // Validate payload structure
    if (!payload || (typeof payload !== 'object' && typeof payload !== 'string')) {
      console.error('Invalid Paymob webhook payload');
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Invalid webhook payload format',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Parse payload if it's a string
    let webhookData;
    try {
      webhookData = typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch (parseError) {
      console.error('Failed to parse Paymob webhook payload:', parseError);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'PAYLOAD_PARSE_ERROR',
          message: 'Failed to parse webhook payload',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Validate webhook payload structure
    if (!paymobWebhookHandler.validateWebhookPayload(webhookData)) {
      console.error('Invalid Paymob webhook payload structure:', webhookData);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_PAYLOAD_STRUCTURE',
          message: 'Webhook payload is missing required fields',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Extract metadata for logging
    const metadata = paymobWebhookHandler.getWebhookMetadata(webhookData);
    console.log('Processing Paymob webhook:', metadata);

    // Process webhook
    const result = await paymobWebhookHandler.handleWebhook(webhookData, signature);

    if (result.handled) {
      console.log('Paymob webhook processed successfully:', {
        eventType: result.eventType,
        message: result.message,
        metadata,
        timestamp: new Date().toISOString(),
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        eventType: result.eventType,
        transactionId: metadata.id,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.warn('Paymob webhook not handled:', {
        eventType: result.eventType,
        message: result.message,
        metadata,
        timestamp: new Date().toISOString(),
      });

      // Return 200 even for unhandled events to prevent retries
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Event received but not handled',
        eventType: result.eventType,
        transactionId: metadata.id,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error('Paymob webhook error:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
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

    // For other errors, return 500 to trigger Paymob retries
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
 * Test Paymob Webhook Endpoint
 * For testing webhook endpoint connectivity
 */
export async function testPaymobWebhook(req: Request, res: Response): Promise<void> {
  try {
    console.log('Paymob webhook test endpoint called:', {
      method: req.method,
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString(),
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Paymob webhook endpoint is reachable',
      timestamp: new Date().toISOString(),
      method: req.method,
      received: {
        headers: {
          'x-paymob-signature': req.headers['x-paymob-signature'] ? 'present' : 'missing',
          'content-type': req.headers['content-type'],
          'user-agent': req.headers['user-agent'],
        },
        bodyType: typeof req.body,
        bodySize: typeof req.body === 'string' ? req.body.length :
                  typeof req.body === 'object' ? JSON.stringify(req.body).length : 0,
      },
    });
  } catch (error) {
    console.error('Paymob webhook test error:', error);

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

/**
 * Paymob Transaction Callback
 * Alternative endpoint for Paymob transaction callbacks (different from webhooks)
 */
export async function handlePaymobCallback(req: Request, res: Response): Promise<void> {
  try {
    const callbackData = req.body;

    console.log('Received Paymob callback:', {
      method: req.method,
      query: req.query,
      body: callbackData,
      timestamp: new Date().toISOString(),
    });

    // Paymob callbacks might use GET parameters or POST body
    const transactionData = req.method === 'GET' ? req.query : callbackData;

    if (!transactionData) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'MISSING_CALLBACK_DATA',
          message: 'Missing transaction callback data',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // For callback endpoints, we typically redirect the user
    const success = transactionData.success === 'true' || transactionData.success === true;
    const transactionId = transactionData.id || transactionData.transaction_id;

    if (success) {
      console.log(`Paymob callback success for transaction: ${transactionId}`);

      // Redirect to success page or return success response
      if (req.query.return_url || req.body.return_url) {
        const returnUrl = (req.query.return_url || req.body.return_url) as string;
        res.redirect(`${returnUrl}?status=success&transaction_id=${transactionId}`);
      } else {
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'Payment completed successfully',
          transactionId,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      console.log(`Paymob callback failure for transaction: ${transactionId}`);

      // Redirect to failure page or return error response
      if (req.query.return_url || req.body.return_url) {
        const returnUrl = (req.query.return_url || req.body.return_url) as string;
        res.redirect(`${returnUrl}?status=failed&transaction_id=${transactionId}`);
      } else {
        res.status(HTTP_STATUS.OK).json({
          success: false,
          message: 'Payment failed',
          transactionId,
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (error: any) {
    console.error('Paymob callback error:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString(),
    });

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'CALLBACK_PROCESSING_ERROR',
        message: 'Callback processing failed',
        timestamp: new Date().toISOString(),
      },
    });
  }
}