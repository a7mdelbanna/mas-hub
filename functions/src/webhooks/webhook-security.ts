import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../config/firebase';

/**
 * Webhook Security Utilities
 * Provides security functions for webhook signature verification and rate limiting
 */

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * HMAC Signature Verification
 * Generic HMAC signature verification for webhooks
 */
export function verifyHmacSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  try {
    const payloadString = typeof payload === 'string' ? payload : payload.toString();
    const expectedSignature = crypto
      .createHmac(algorithm, secret)
      .update(payloadString)
      .digest('hex');

    // Handle different signature formats
    let receivedSignature = signature;

    // Remove algorithm prefix if present (e.g., "sha256=...")
    if (signature.includes('=')) {
      receivedSignature = signature.split('=')[1];
    }

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Stripe Signature Verification
 * Specifically for Stripe webhook signatures
 */
export function verifyStripeSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
  tolerance: number = 300 // 5 minutes
): boolean {
  try {
    const elements = signature.split(',');
    let timestamp = '';
    let signatureHash = '';

    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'v1') {
        signatureHash = value;
      }
    }

    if (!timestamp || !signatureHash) {
      console.error('Invalid Stripe signature format');
      return false;
    }

    // Check timestamp tolerance
    const timestampSeconds = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);

    if (Math.abs(now - timestampSeconds) > tolerance) {
      console.error('Stripe webhook timestamp outside tolerance');
      return false;
    }

    // Verify signature
    const payloadString = typeof payload === 'string' ? payload : payload.toString();
    const signedPayload = `${timestamp}.${payloadString}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signatureHash, 'hex')
    );
  } catch (error) {
    console.error('Stripe signature verification error:', error);
    return false;
  }
}

/**
 * Rate Limiting Middleware for Webhooks
 * Prevents abuse of webhook endpoints
 */
export function webhookRateLimit(
  maxRequests: number = 1000,
  windowMs: number = 60000 // 1 minute
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean expired entries
    for (const [ip, data] of rateLimitStore.entries()) {
      if (data.resetTime < now) {
        rateLimitStore.delete(ip);
      }
    }

    // Get or create rate limit data for this IP
    let limitData = rateLimitStore.get(clientIP);
    if (!limitData || limitData.resetTime < now) {
      limitData = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(clientIP, limitData);
    }

    limitData.count++;

    // Check if rate limit exceeded
    if (limitData.count > maxRequests) {
      console.warn('Webhook rate limit exceeded:', {
        ip: clientIP,
        count: limitData.count,
        maxRequests,
        resetTime: new Date(limitData.resetTime).toISOString(),
      });

      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many webhook requests',
          retryAfter: Math.ceil((limitData.resetTime - now) / 1000),
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - limitData.count).toString(),
      'X-RateLimit-Reset': Math.ceil(limitData.resetTime / 1000).toString(),
    });

    next();
  };
}

/**
 * Webhook Request Validation Middleware
 * Validates common webhook request properties
 */
export function validateWebhookRequest(req: Request, res: Response, next: NextFunction) {
  try {
    // Check Content-Type header
    const contentType = req.headers['content-type'];
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('text/plain'))) {
      console.warn('Invalid webhook content type:', contentType);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Webhook must use application/json or text/plain content type',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Check User-Agent header for known webhook sources
    const userAgent = req.headers['user-agent'] || '';
    const knownWebhookAgents = ['Stripe', 'Paymob', 'GitHub', 'PayPal'];
    const isKnownAgent = knownWebhookAgents.some(agent =>
      userAgent.toLowerCase().includes(agent.toLowerCase())
    );

    if (!isKnownAgent) {
      console.warn('Unknown webhook user agent:', userAgent);
      // Log but don't reject - some legitimate webhooks might have custom user agents
    }

    // Check for required headers
    if (req.method === 'POST' && (!req.body || (typeof req.body === 'object' && Object.keys(req.body).length === 0))) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'EMPTY_WEBHOOK_BODY',
          message: 'Webhook body cannot be empty',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Webhook request validation error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'WEBHOOK_VALIDATION_ERROR',
        message: 'Webhook validation failed',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

/**
 * Webhook Logging Middleware
 * Logs webhook requests for debugging and monitoring
 */
export function logWebhookRequest(source: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Log incoming webhook
    console.log(`${source} webhook received:`, {
      source,
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      hasSignature: !!(req.headers['stripe-signature'] || req.headers['x-paymob-signature']),
      timestamp: new Date().toISOString(),
    });

    // Override res.json to log response
    const originalJson = res.json.bind(res);
    res.json = function(body: any) {
      const duration = Date.now() - startTime;

      console.log(`${source} webhook response:`, {
        source,
        statusCode: res.statusCode,
        success: body?.success,
        eventType: body?.eventType,
        message: body?.message,
        duration,
        timestamp: new Date().toISOString(),
      });

      return originalJson(body);
    };

    next();
  };
}

/**
 * IP Whitelist Middleware
 * Restricts webhook access to known IP ranges
 */
export function ipWhitelist(allowedIPs: string[] | ((ip: string) => boolean)) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    let isAllowed = false;

    if (typeof allowedIPs === 'function') {
      isAllowed = allowedIPs(clientIP);
    } else {
      // Check against IP list (supports CIDR notation)
      isAllowed = allowedIPs.some(allowedIP => {
        if (allowedIP === clientIP) return true;

        // Simple CIDR check (for basic subnet matching)
        if (allowedIP.includes('/')) {
          const [network, prefixLength] = allowedIP.split('/');
          const prefix = parseInt(prefixLength, 10);

          // Simple IPv4 CIDR check
          if (network.includes('.') && clientIP.includes('.')) {
            const networkParts = network.split('.').map(Number);
            const ipParts = clientIP.split('.').map(Number);

            // Calculate network mask
            const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
            const networkInt = (networkParts[0] << 24) | (networkParts[1] << 16) | (networkParts[2] << 8) | networkParts[3];
            const ipInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];

            return (networkInt & mask) === (ipInt & mask);
          }
        }

        return false;
      });
    }

    if (!isAllowed) {
      console.warn('Webhook request from unauthorized IP:', {
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
      });

      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'IP_NOT_ALLOWED',
          message: 'Webhook requests not allowed from this IP address',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    next();
  };
}

/**
 * Get Stripe IP Ranges
 * Returns known Stripe webhook IP ranges
 */
export function getStripeIPRanges(): string[] {
  // These are examples - check Stripe's documentation for current IP ranges
  return [
    '54.187.174.169',
    '54.187.205.235',
    '54.187.216.72',
    '54.241.31.99',
    '54.241.31.102',
    '54.241.34.107',
    // Add more Stripe IPs as needed
  ];
}

/**
 * Idempotency Key Handler
 * Prevents duplicate webhook processing
 */
const processedWebhooks = new Map<string, { timestamp: number; response: any }>();

export function handleIdempotency(ttlMs: number = 24 * 60 * 60 * 1000) { // 24 hours
  return (req: Request, res: Response, next: NextFunction) => {
    // Generate idempotency key from webhook content
    const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const idempotencyKey = crypto.createHash('sha256').update(payload).digest('hex');

    // Clean expired entries
    const now = Date.now();
    for (const [key, data] of processedWebhooks.entries()) {
      if (now - data.timestamp > ttlMs) {
        processedWebhooks.delete(key);
      }
    }

    // Check if webhook already processed
    const existing = processedWebhooks.get(idempotencyKey);
    if (existing) {
      console.log('Duplicate webhook detected, returning cached response:', {
        idempotencyKey: idempotencyKey.substring(0, 16) + '...',
        originalTimestamp: new Date(existing.timestamp).toISOString(),
        timestamp: new Date().toISOString(),
      });

      res.status(HTTP_STATUS.OK).json(existing.response);
      return;
    }

    // Store processing flag
    req.webhookIdempotencyKey = idempotencyKey;

    // Override res.json to cache successful responses
    const originalJson = res.json.bind(res);
    res.json = function(body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        processedWebhooks.set(idempotencyKey, {
          timestamp: now,
          response: body,
        });
      }
      return originalJson(body);
    };

    next();
  };
}

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      webhookIdempotencyKey?: string;
    }
  }
}