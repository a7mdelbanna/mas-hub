import { Request, Response } from 'express';
import { z } from 'zod';
import { paymentService, PaymentRequest } from '../../services/PaymentService';
import { PaymentMethod, Currency } from '../../../src/types/models';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../config/firebase';

// Validation schemas
const billingDataSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone_number: z.string().min(10),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  street: z.string().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
});

const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  accountId: z.string().min(1, 'Account ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.nativeEnum(Currency),
  method: z.nativeEnum(PaymentMethod),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),

  // Payment method specific fields
  paymentMethodId: z.string().optional(), // For Stripe
  customerId: z.string().optional(), // For Stripe
  walletNumber: z.string().optional(), // For Vodafone Cash
  billingData: billingDataSchema.optional(), // For Paymob

  // UI configuration
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  returnUrl: z.string().url().optional(),
});

/**
 * Create Payment
 * Initiates payment processing based on selected method
 */
export async function createPayment(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const validationResult = createPaymentSchema.safeParse(req.body);
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

    const paymentRequest: PaymentRequest = validationResult.data;

    // Add user context
    paymentRequest.metadata = {
      ...paymentRequest.metadata,
      userId: req.user?.uid,
      userEmail: req.user?.email,
      createdBy: 'api',
      source: 'web_portal',
    };

    // Process payment
    const result = await paymentService.processPayment(paymentRequest);

    if (result.success) {
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          paymentId: result.paymentId,
          status: result.status,
          method: result.method,
          amount: result.amount,
          currency: result.currency,
          message: result.message,

          // Include method-specific data
          ...(result.stripeData && { stripe: result.stripeData }),
          ...(result.paymobData && { paymob: result.paymobData }),
          ...(result.manualData && { manual: result.manualData }),
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
          code: 'PAYMENT_FAILED',
          message: result.error || ERROR_MESSAGES.PAYMENT_FAILED,
          details: {
            method: result.method,
            amount: result.amount,
            currency: result.currency,
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }
  } catch (error) {
    console.error('Create payment API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Internal server error occurred while processing payment',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

/**
 * Get Payment Methods
 * Returns available payment methods for an account/invoice
 */
export async function getPaymentMethods(req: Request, res: Response): Promise<void> {
  try {
    const { invoiceId, accountId, currency } = req.query;

    if (!invoiceId || !accountId || !currency) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invoice ID, Account ID, and Currency are required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // Get available payment methods based on currency and configuration
    const paymentMethods = getAvailablePaymentMethods(currency as Currency);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        paymentMethods,
        currency,
        accountId,
        invoiceId,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0',
      },
    });
  } catch (error) {
    console.error('Get payment methods API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to retrieve payment methods',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

/**
 * Estimate Payment Fees
 * Calculates estimated fees for different payment methods
 */
export async function estimatePaymentFees(req: Request, res: Response): Promise<void> {
  try {
    const { amount, currency, methods } = req.query;

    if (!amount || !currency) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount and currency are required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const paymentAmount = parseFloat(amount as string);
    const paymentCurrency = currency as Currency;
    const requestedMethods = methods ? (methods as string).split(',') as PaymentMethod[] :
                            Object.values(PaymentMethod);

    const feeEstimates = calculatePaymentFees(paymentAmount, paymentCurrency, requestedMethods);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        amount: paymentAmount,
        currency: paymentCurrency,
        fees: feeEstimates,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0',
      },
    });
  } catch (error) {
    console.error('Estimate payment fees API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to estimate payment fees',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

// Helper functions

function getAvailablePaymentMethods(currency: Currency): any[] {
  const methods = [];

  // Stripe (available for most currencies)
  if (['USD', 'EUR', 'GBP'].includes(currency)) {
    methods.push({
      method: PaymentMethod.STRIPE,
      name: 'Credit/Debit Card',
      description: 'Pay with credit or debit card',
      logo: 'stripe-logo-url',
      fee: 'Processing fee applies',
      supported: true,
    });
  }

  // Paymob (primarily for EGP)
  if (currency === 'EGP') {
    methods.push(
      {
        method: PaymentMethod.PAYMOB,
        name: 'Credit/Debit Card',
        description: 'Pay with credit or debit card (Egypt)',
        logo: 'paymob-logo-url',
        fee: 'Processing fee applies',
        supported: true,
      },
      {
        method: PaymentMethod.VODAFONE_CASH,
        name: 'Vodafone Cash',
        description: 'Pay with Vodafone Cash wallet',
        logo: 'vodafone-cash-logo-url',
        fee: 'Processing fee applies',
        supported: true,
      },
      {
        method: PaymentMethod.INSTAPAY,
        name: 'InstaPay',
        description: 'Pay with InstaPay',
        logo: 'instapay-logo-url',
        fee: 'Processing fee applies',
        supported: true,
      }
    );
  }

  // Manual methods (available for all currencies)
  methods.push(
    {
      method: PaymentMethod.BANK_TRANSFER,
      name: 'Bank Transfer',
      description: 'Transfer funds to our bank account',
      logo: 'bank-transfer-icon',
      fee: 'No processing fee',
      supported: true,
    },
    {
      method: PaymentMethod.CASH,
      name: 'Cash Payment',
      description: 'Pay in cash at our office',
      logo: 'cash-icon',
      fee: 'No processing fee',
      supported: true,
    }
  );

  return methods;
}

function calculatePaymentFees(
  amount: number,
  currency: Currency,
  methods: PaymentMethod[]
): Record<string, any> {
  const fees: Record<string, any> = {};

  for (const method of methods) {
    switch (method) {
      case PaymentMethod.STRIPE:
        if (['USD', 'EUR', 'GBP'].includes(currency)) {
          fees[method] = {
            percentage: 2.9,
            fixed: currency === 'USD' ? 0.30 : 0.25,
            total: Math.round((amount * 0.029 + (currency === 'USD' ? 0.30 : 0.25)) * 100) / 100,
            currency: currency,
          };
        }
        break;

      case PaymentMethod.PAYMOB:
      case PaymentMethod.VODAFONE_CASH:
      case PaymentMethod.INSTAPAY:
        if (currency === 'EGP') {
          fees[method] = {
            percentage: 2.5,
            fixed: 2.0, // EGP
            total: Math.round((amount * 0.025 + 2.0) * 100) / 100,
            currency: 'EGP',
          };
        }
        break;

      case PaymentMethod.BANK_TRANSFER:
      case PaymentMethod.CASH:
        fees[method] = {
          percentage: 0,
          fixed: 0,
          total: 0,
          currency: currency,
        };
        break;
    }
  }

  return fees;
}