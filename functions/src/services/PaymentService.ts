import { db, COLLECTIONS, admin } from '../config/firebase';
import { BaseRepository } from '../repositories/BaseRepository';
import {
  Currency,
  PaymentMethod,
  PaymentStatus,
  InvoiceStatus
} from '../../src/types/models';

// Stripe integration imports
import {
  stripeClient,
  stripePaymentIntent,
  stripeCheckout,
  stripeCustomer,
  stripeSubscription,
  stripeRefund,
  CreatePaymentIntentData,
  CreateCheckoutSessionData,
  CreateStripeCustomerData
} from '../integrations/stripe';

// Paymob integration imports
import {
  paymobClient,
  paymobOrder,
  paymobToken,
  paymobTransaction,
  paymobRefund,
  CreateOrderData,
  CreateTokenData,
  BillingData
} from '../integrations/paymob';

export interface PaymentRequest {
  invoiceId: string;
  accountId: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  description?: string;
  metadata?: Record<string, any>;

  // Payment method specific data
  paymentMethodId?: string; // For Stripe
  customerId?: string; // For Stripe
  walletNumber?: string; // For Paymob mobile wallet
  billingData?: BillingData; // For Paymob

  // UI configuration
  successUrl?: string;
  cancelUrl?: string;
  returnUrl?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  currency: Currency;

  // Method-specific data
  stripeData?: {
    paymentIntentId?: string;
    clientSecret?: string;
    sessionId?: string;
    sessionUrl?: string;
  };

  paymobData?: {
    orderId?: number;
    token?: string;
    iframeUrl?: string;
    redirectUrl?: string;
  };

  manualData?: {
    instructions?: string;
    referenceNumber?: string;
    accountDetails?: any;
  };

  error?: string;
  message: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number; // For partial refunds
  reason?: string;
  metadata?: Record<string, any>;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: PaymentStatus;
  message: string;
  error?: string;
}

export interface PaymentStatusUpdate {
  paymentId: string;
  status: PaymentStatus;
  paidAt?: Date;
  failureReason?: string;
  metadata?: Record<string, any>;
}

/**
 * Unified Payment Service
 * Provides a unified interface for all payment operations across multiple providers
 */
export class PaymentService {
  private paymentRepo: BaseRepository<any>;
  private invoiceRepo: BaseRepository<any>;
  private accountRepo: BaseRepository<any>;

  constructor() {
    this.paymentRepo = new BaseRepository(COLLECTIONS.PAYMENTS);
    this.invoiceRepo = new BaseRepository(COLLECTIONS.INVOICES);
    this.accountRepo = new BaseRepository(COLLECTIONS.ACCOUNTS);
  }

  /**
   * Process payment based on selected method
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Validate request
      await this.validatePaymentRequest(request);

      // Route to appropriate payment provider
      switch (request.method) {
        case PaymentMethod.STRIPE:
          return await this.processStripePayment(request);

        case PaymentMethod.PAYMOB:
          return await this.processPaymobPayment(request);

        case PaymentMethod.INSTAPAY:
          return await this.processInstapayPayment(request);

        case PaymentMethod.VODAFONE_CASH:
          return await this.processVodafoneCashPayment(request);

        case PaymentMethod.BANK_TRANSFER:
          return await this.processBankTransferPayment(request);

        case PaymentMethod.CASH:
          return await this.processCashPayment(request);

        default:
          throw new Error(`Unsupported payment method: ${request.method}`);
      }
    } catch (error) {
      console.error('Payment processing failed:', error);

      // Create failed payment record
      await this.createFailedPaymentRecord(request, error.message);

      return {
        success: false,
        paymentId: '',
        status: PaymentStatus.FAILED,
        method: request.method,
        amount: request.amount,
        currency: request.currency,
        error: error.message,
        message: 'Payment processing failed',
      };
    }
  }

  /**
   * Process Stripe payment
   */
  private async processStripePayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Get or create Stripe customer
      const customer = await stripeCustomer.getOrCreateCustomerForAccount(request.accountId);

      if (request.successUrl && request.cancelUrl) {
        // Use Checkout Session for hosted payment
        const checkoutData: CreateCheckoutSessionData = {
          invoiceId: request.invoiceId,
          accountId: request.accountId,
          amount: request.amount,
          currency: request.currency,
          customerId: customer.id,
          successUrl: request.successUrl,
          cancelUrl: request.cancelUrl,
          paymentMethods: ['card'],
        };

        const session = await stripeCheckout.createCheckoutSession(checkoutData);

        return {
          success: true,
          paymentId: session.sessionId,
          status: PaymentStatus.PENDING,
          method: PaymentMethod.STRIPE,
          amount: request.amount,
          currency: request.currency,
          stripeData: {
            sessionId: session.sessionId,
            sessionUrl: session.url,
          },
          message: 'Stripe checkout session created',
        };
      } else {
        // Use Payment Intent for programmatic payment
        const intentData: CreatePaymentIntentData = {
          amount: request.amount,
          currency: request.currency,
          invoiceId: request.invoiceId,
          accountId: request.accountId,
          customerId: customer.id,
          paymentMethodId: request.paymentMethodId,
          description: request.description,
          metadata: request.metadata,
        };

        const result = await stripePaymentIntent.createPaymentIntent(intentData);

        return {
          success: true,
          paymentId: result.paymentIntent.id,
          status: result.status,
          method: PaymentMethod.STRIPE,
          amount: request.amount,
          currency: request.currency,
          stripeData: {
            paymentIntentId: result.paymentIntent.id,
            clientSecret: result.clientSecret,
          },
          message: 'Stripe payment intent created',
        };
      }
    } catch (error) {
      console.error('Stripe payment failed:', error);
      throw error;
    }
  }

  /**
   * Process Paymob payment
   */
  private async processPaymobPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Create Paymob order
      const orderData: CreateOrderData = {
        amount: request.amount,
        currency: request.currency,
        invoiceId: request.invoiceId,
        accountId: request.accountId,
        description: request.description,
        metadata: request.metadata,
      };

      const orderResult = await paymobOrder.createOrder(orderData);

      // Generate payment token
      if (!request.billingData) {
        throw new Error('Billing data is required for Paymob payments');
      }

      const tokenData: CreateTokenData = {
        orderId: orderResult.orderId,
        billingData: request.billingData,
      };

      const tokenResult = await paymobToken.generatePaymentToken(tokenData);

      // Generate iframe URL
      const iframeUrl = await paymobToken.generateIframeUrl(tokenData);

      return {
        success: true,
        paymentId: orderResult.orderId.toString(),
        status: orderResult.status,
        method: PaymentMethod.PAYMOB,
        amount: request.amount,
        currency: request.currency,
        paymobData: {
          orderId: orderResult.orderId,
          token: tokenResult.token,
          iframeUrl: iframeUrl,
        },
        message: 'Paymob payment order created',
      };
    } catch (error) {
      console.error('Paymob payment failed:', error);
      throw error;
    }
  }

  /**
   * Process Instapay payment
   */
  private async processInstapayPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Create Paymob order first
      const orderData: CreateOrderData = {
        amount: request.amount,
        currency: request.currency,
        invoiceId: request.invoiceId,
        accountId: request.accountId,
        description: request.description,
        metadata: request.metadata,
      };

      const orderResult = await paymobOrder.createOrder(orderData);

      // Generate Instapay payment URL
      if (!request.billingData) {
        throw new Error('Billing data is required for Instapay payments');
      }

      const tokenData: CreateTokenData = {
        orderId: orderResult.orderId,
        billingData: request.billingData,
      };

      const instapayUrl = await paymobToken.generateInstapayUrl(tokenData);

      return {
        success: true,
        paymentId: orderResult.orderId.toString(),
        status: orderResult.status,
        method: PaymentMethod.INSTAPAY,
        amount: request.amount,
        currency: request.currency,
        paymobData: {
          orderId: orderResult.orderId,
          redirectUrl: instapayUrl,
        },
        message: 'Instapay payment URL generated',
      };
    } catch (error) {
      console.error('Instapay payment failed:', error);
      throw error;
    }
  }

  /**
   * Process Vodafone Cash payment
   */
  private async processVodafoneCashPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      if (!request.walletNumber) {
        throw new Error('Wallet number is required for Vodafone Cash payments');
      }

      // Create Paymob order
      const orderData: CreateOrderData = {
        amount: request.amount,
        currency: request.currency,
        invoiceId: request.invoiceId,
        accountId: request.accountId,
        description: request.description,
        metadata: request.metadata,
      };

      const orderResult = await paymobOrder.createOrder(orderData);

      // Generate mobile wallet payment URL
      if (!request.billingData) {
        throw new Error('Billing data is required for Vodafone Cash payments');
      }

      const tokenData: CreateTokenData = {
        orderId: orderResult.orderId,
        billingData: request.billingData,
      };

      const walletUrl = await paymobToken.generateMobileWalletUrl(tokenData, request.walletNumber);

      return {
        success: true,
        paymentId: orderResult.orderId.toString(),
        status: orderResult.status,
        method: PaymentMethod.VODAFONE_CASH,
        amount: request.amount,
        currency: request.currency,
        paymobData: {
          orderId: orderResult.orderId,
          redirectUrl: walletUrl,
        },
        message: 'Vodafone Cash payment URL generated',
      };
    } catch (error) {
      console.error('Vodafone Cash payment failed:', error);
      throw error;
    }
  }

  /**
   * Process bank transfer payment
   */
  private async processBankTransferPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Generate bank transfer instructions
      const referenceNumber = `BT-${Date.now()}-${request.invoiceId.substring(0, 8)}`;

      // Get bank account details (this should be configurable)
      const bankDetails = await this.getBankAccountDetails(request.currency);

      // Create payment record with pending status
      const paymentRecord = await this.createManualPaymentRecord(
        request,
        PaymentStatus.PENDING,
        referenceNumber
      );

      return {
        success: true,
        paymentId: paymentRecord.id!,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.BANK_TRANSFER,
        amount: request.amount,
        currency: request.currency,
        manualData: {
          instructions: this.generateBankTransferInstructions(request, referenceNumber, bankDetails),
          referenceNumber: referenceNumber,
          accountDetails: bankDetails,
        },
        message: 'Bank transfer instructions generated',
      };
    } catch (error) {
      console.error('Bank transfer payment failed:', error);
      throw error;
    }
  }

  /**
   * Process cash payment
   */
  private async processCashPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const referenceNumber = `CASH-${Date.now()}-${request.invoiceId.substring(0, 8)}`;

      // Create payment record with pending status
      const paymentRecord = await this.createManualPaymentRecord(
        request,
        PaymentStatus.PENDING,
        referenceNumber
      );

      return {
        success: true,
        paymentId: paymentRecord.id!,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.CASH,
        amount: request.amount,
        currency: request.currency,
        manualData: {
          instructions: this.generateCashPaymentInstructions(request, referenceNumber),
          referenceNumber: referenceNumber,
        },
        message: 'Cash payment reference generated',
      };
    } catch (error) {
      console.error('Cash payment failed:', error);
      throw error;
    }
  }

  /**
   * Process refund request
   */
  async processRefund(request: RefundRequest): Promise<RefundResult> {
    try {
      // Get payment record
      const payment = await this.paymentRepo.findById(request.paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Route to appropriate refund handler
      switch (payment.method) {
        case PaymentMethod.STRIPE:
          return await this.processStripeRefund(payment, request);

        case PaymentMethod.PAYMOB:
        case PaymentMethod.INSTAPAY:
        case PaymentMethod.VODAFONE_CASH:
          return await this.processPaymobRefund(payment, request);

        default:
          throw new Error(`Refunds not supported for payment method: ${payment.method}`);
      }
    } catch (error) {
      console.error('Refund processing failed:', error);
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: PaymentStatus.FAILED,
        error: error.message,
        message: 'Refund processing failed',
      };
    }
  }

  /**
   * Update payment status (from webhooks or manual updates)
   */
  async updatePaymentStatus(update: PaymentStatusUpdate): Promise<void> {
    try {
      // Update payment record
      await this.paymentRepo.update(update.paymentId, {
        status: update.status,
        paidAt: update.paidAt,
        failureReason: update.failureReason,
        metadata: { ...update.metadata },
        updatedAt: admin.firestore.Timestamp.now(),
      }, 'system');

      // Update related invoice if payment successful
      if (update.status === PaymentStatus.COMPLETED) {
        const payment = await this.paymentRepo.findById(update.paymentId);
        if (payment && payment.invoiceId) {
          await this.updateInvoiceFromPayment(payment);
        }
      }

      // Send notifications
      await this.sendPaymentStatusNotification(update);
    } catch (error) {
      console.error('Failed to update payment status:', error);
      throw error;
    }
  }

  /**
   * Get payment history for account
   */
  async getPaymentHistory(accountId: string, limit: number = 20): Promise<any[]> {
    try {
      const payments = await this.paymentRepo.find({
        where: [{ field: 'accountId', operator: '==', value: accountId }],
        orderBy: 'createdAt',
        orderDirection: 'desc',
        limit,
      });

      return payments;
    } catch (error) {
      console.error('Failed to get payment history:', error);
      throw error;
    }
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(
    startDate: Date,
    endDate: Date,
    accountId?: string
  ): Promise<any> {
    try {
      let query = [
        { field: 'createdAt', operator: '>=', value: admin.firestore.Timestamp.fromDate(startDate) },
        { field: 'createdAt', operator: '<=', value: admin.firestore.Timestamp.fromDate(endDate) },
      ];

      if (accountId) {
        query.push({ field: 'accountId', operator: '==', value: accountId });
      }

      const payments = await this.paymentRepo.find({
        where: query,
      });

      return this.calculatePaymentAnalytics(payments);
    } catch (error) {
      console.error('Failed to get payment analytics:', error);
      throw error;
    }
  }

  // Private helper methods

  private async validatePaymentRequest(request: PaymentRequest): Promise<void> {
    // Validate invoice exists and is payable
    const invoice = await this.invoiceRepo.findById(request.invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('Invoice is already paid');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error('Cannot pay cancelled invoice');
    }

    // Validate account exists
    const account = await this.accountRepo.findById(request.accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Validate amount
    if (request.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    if (request.amount > invoice.balanceDue) {
      throw new Error('Payment amount exceeds balance due');
    }

    // Method-specific validations
    if (request.method === PaymentMethod.PAYMOB ||
        request.method === PaymentMethod.INSTAPAY ||
        request.method === PaymentMethod.VODAFONE_CASH) {
      if (!request.billingData) {
        throw new Error('Billing data is required for this payment method');
      }
    }

    if (request.method === PaymentMethod.VODAFONE_CASH && !request.walletNumber) {
      throw new Error('Wallet number is required for Vodafone Cash');
    }
  }

  private async processStripeRefund(payment: any, request: RefundRequest): Promise<RefundResult> {
    const refundData = {
      paymentIntentId: payment.gatewayTransactionId,
      amount: request.amount,
      reason: request.reason,
      metadata: request.metadata,
    };

    const result = await stripeRefund.createRefund(refundData);

    return {
      success: true,
      refundId: result.refundId,
      amount: result.refund.amount / 100,
      status: result.status,
      message: 'Stripe refund processed',
    };
  }

  private async processPaymobRefund(payment: any, request: RefundRequest): Promise<RefundResult> {
    const transactionId = parseInt(payment.gatewayTransactionId);
    const refundData = {
      transactionId,
      amount: request.amount,
      reason: request.reason,
    };

    const result = await paymobRefund.createRefund(refundData);

    return {
      success: result.refund.success,
      refundId: result.refundId,
      amount: result.refund.amount_cents / 100,
      status: result.status,
      message: 'Paymob refund processed',
    };
  }

  private async createFailedPaymentRecord(request: PaymentRequest, error: string): Promise<void> {
    await this.paymentRepo.create({
      paymentNumber: `PAY-FAIL-${Date.now()}`,
      invoiceId: request.invoiceId,
      accountId: request.accountId,
      amount: request.amount,
      currency: request.currency,
      status: PaymentStatus.FAILED,
      method: request.method,
      failureReason: error,
      metadata: request.metadata,
    }, 'system');
  }

  private async createManualPaymentRecord(
    request: PaymentRequest,
    status: PaymentStatus,
    reference: string
  ): Promise<any> {
    return await this.paymentRepo.create({
      paymentNumber: `PAY-${Date.now()}`,
      invoiceId: request.invoiceId,
      accountId: request.accountId,
      amount: request.amount,
      currency: request.currency,
      status,
      method: request.method,
      reference,
      metadata: request.metadata,
    }, 'system');
  }

  private async updateInvoiceFromPayment(payment: any): Promise<void> {
    const invoice = await this.invoiceRepo.findById(payment.invoiceId);
    if (!invoice) return;

    const newPaidAmount = (invoice.paidAmount || 0) + payment.amount;
    const newBalanceDue = invoice.total - newPaidAmount;

    let newStatus = invoice.status;
    if (newBalanceDue <= 0) {
      newStatus = InvoiceStatus.PAID;
    } else if (newPaidAmount > 0) {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    }

    await this.invoiceRepo.update(payment.invoiceId, {
      status: newStatus,
      paidAmount: newPaidAmount,
      balanceDue: Math.max(0, newBalanceDue),
    }, 'system');
  }

  private async getBankAccountDetails(currency: Currency): Promise<any> {
    // This should be configurable per organization
    const bankAccounts = {
      USD: {
        bankName: 'Example Bank',
        accountName: 'MAS Business OS',
        accountNumber: '1234567890',
        routingNumber: '123456789',
        swift: 'EXAMPLEXX',
      },
      EGP: {
        bankName: 'National Bank of Egypt',
        accountName: 'MAS Business OS',
        accountNumber: '0987654321',
        branchCode: '123',
      },
    };

    return bankAccounts[currency] || bankAccounts.USD;
  }

  private generateBankTransferInstructions(
    request: PaymentRequest,
    reference: string,
    bankDetails: any
  ): string {
    return `Please transfer ${request.amount} ${request.currency} to the following account:

Bank: ${bankDetails.bankName}
Account Name: ${bankDetails.accountName}
Account Number: ${bankDetails.accountNumber}
${bankDetails.routingNumber ? `Routing Number: ${bankDetails.routingNumber}` : ''}
${bankDetails.swift ? `SWIFT Code: ${bankDetails.swift}` : ''}

Reference: ${reference}

Please include the reference number in your transfer description.`;
  }

  private generateCashPaymentInstructions(request: PaymentRequest, reference: string): string {
    return `Please bring ${request.amount} ${request.currency} in cash to our office.

Reference Number: ${reference}

Please provide this reference number when making payment.

Office Address: [Configure office address]
Office Hours: [Configure office hours]`;
  }

  private async sendPaymentStatusNotification(update: PaymentStatusUpdate): Promise<void> {
    // This would integrate with notification service
    console.log(`Payment status notification sent for payment: ${update.paymentId}`);
  }

  private calculatePaymentAnalytics(payments: any[]): any {
    const analytics = {
      totalPayments: payments.length,
      totalAmount: 0,
      successfulPayments: 0,
      failedPayments: 0,
      pendingPayments: 0,
      refundedPayments: 0,
      methodBreakdown: {} as Record<string, number>,
      currencyBreakdown: {} as Record<string, number>,
      statusBreakdown: {} as Record<string, number>,
    };

    for (const payment of payments) {
      analytics.totalAmount += payment.amount;

      // Status breakdown
      if (payment.status === PaymentStatus.COMPLETED) {
        analytics.successfulPayments++;
      } else if (payment.status === PaymentStatus.FAILED) {
        analytics.failedPayments++;
      } else if (payment.status === PaymentStatus.PENDING) {
        analytics.pendingPayments++;
      } else if (payment.status === PaymentStatus.REFUNDED) {
        analytics.refundedPayments++;
      }

      // Method breakdown
      analytics.methodBreakdown[payment.method] =
        (analytics.methodBreakdown[payment.method] || 0) + payment.amount;

      // Currency breakdown
      analytics.currencyBreakdown[payment.currency] =
        (analytics.currencyBreakdown[payment.currency] || 0) + payment.amount;

      // Status breakdown
      analytics.statusBreakdown[payment.status] =
        (analytics.statusBreakdown[payment.status] || 0) + 1;
    }

    return analytics;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default PaymentService;