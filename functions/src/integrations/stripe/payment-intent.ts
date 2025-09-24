import Stripe from 'stripe';
import { stripeClient } from './stripe-client';
import { db, COLLECTIONS } from '../../config/firebase';
import { Currency, PaymentStatus } from '../../../src/types/models';

export interface CreatePaymentIntentData {
  amount: number;
  currency: Currency;
  invoiceId: string;
  accountId: string;
  customerId?: string;
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  paymentIntent: Stripe.PaymentIntent;
  clientSecret: string;
  status: PaymentStatus;
}

/**
 * Stripe Payment Intent management
 * Handles payment intent creation, confirmation, and status management
 */
export class StripePaymentIntentService {
  private client: Stripe;

  constructor() {
    this.client = stripeClient.getClient();
  }

  /**
   * Create payment intent for invoice payment
   */
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentIntentResult> {
    try {
      // Get invoice details
      const invoiceDoc = await db.collection(COLLECTIONS.INVOICES).doc(data.invoiceId).get();
      if (!invoiceDoc.exists) {
        throw new Error('Invoice not found');
      }

      const invoice = invoiceDoc.data()!;

      // Prepare payment intent parameters
      const createParams: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase() as Stripe.PaymentIntentCreateParams.Currency,
        description: data.description || `Payment for Invoice ${invoice.invoiceNumber}`,
        metadata: {
          invoiceId: data.invoiceId,
          accountId: data.accountId,
          invoiceNumber: invoice.invoiceNumber,
          source: 'mas_business_os',
          ...data.metadata,
        },
        receipt_email: invoice.client?.email,
        setup_future_usage: 'off_session', // Allow future payments
      };

      // Add customer if provided
      if (data.customerId) {
        createParams.customer = data.customerId;
      }

      // Add payment method if provided
      if (data.paymentMethodId) {
        createParams.payment_method = data.paymentMethodId;
        createParams.confirmation_method = 'manual';
        createParams.confirm = true;
      }

      // Create payment intent
      const paymentIntent = await this.client.paymentIntents.create(createParams);

      // Create payment record in database
      await this.createPaymentRecord(paymentIntent, data);

      return {
        paymentIntent,
        clientSecret: paymentIntent.client_secret!,
        status: this.mapStripeStatus(paymentIntent.status),
      };
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<PaymentIntentResult> {
    try {
      const confirmParams: Stripe.PaymentIntentConfirmParams = {};

      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }

      const paymentIntent = await this.client.paymentIntents.confirm(
        paymentIntentId,
        confirmParams
      );

      // Update payment record
      await this.updatePaymentRecord(paymentIntent);

      return {
        paymentIntent,
        clientSecret: paymentIntent.client_secret!,
        status: this.mapStripeStatus(paymentIntent.status),
      };
    } catch (error) {
      console.error('Failed to confirm payment intent:', error);
      throw error;
    }
  }

  /**
   * Retrieve payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.client.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Failed to retrieve payment intent:', error);
      throw error;
    }
  }

  /**
   * Cancel payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.client.paymentIntents.cancel(paymentIntentId);

      // Update payment record
      await this.updatePaymentRecord(paymentIntent);

      return paymentIntent;
    } catch (error) {
      console.error('Failed to cancel payment intent:', error);
      throw error;
    }
  }

  /**
   * Process successful payment
   */
  async processSuccessfulPayment(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const invoiceId = paymentIntent.metadata.invoiceId;
      if (!invoiceId) {
        console.warn('No invoice ID found in payment intent metadata');
        return;
      }

      // Update invoice status
      await this.updateInvoiceStatus(invoiceId, paymentIntent);

      // Create transaction record
      await this.createTransactionRecord(paymentIntent);

      // Send payment confirmation notification
      await this.sendPaymentConfirmation(paymentIntent);
    } catch (error) {
      console.error('Failed to process successful payment:', error);
      throw error;
    }
  }

  /**
   * Handle payment failure
   */
  async processFailedPayment(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const invoiceId = paymentIntent.metadata.invoiceId;
      if (!invoiceId) {
        console.warn('No invoice ID found in payment intent metadata');
        return;
      }

      // Update payment record with failure details
      await this.updatePaymentRecord(paymentIntent);

      // Send payment failure notification
      await this.sendPaymentFailureNotification(paymentIntent);
    } catch (error) {
      console.error('Failed to process failed payment:', error);
      throw error;
    }
  }

  /**
   * Create payment record in database
   */
  private async createPaymentRecord(
    paymentIntent: Stripe.PaymentIntent,
    data: CreatePaymentIntentData
  ): Promise<void> {
    await db.collection(COLLECTIONS.PAYMENTS).doc(paymentIntent.id).set({
      paymentNumber: `PAY-${Date.now()}`,
      invoiceId: data.invoiceId,
      accountId: data.accountId,
      amount: data.amount,
      currency: data.currency,
      status: this.mapStripeStatus(paymentIntent.status),
      method: 'stripe',
      gatewayTransactionId: paymentIntent.id,
      gatewayResponse: {
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        paymentMethod: paymentIntent.payment_method,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Update payment record
   */
  private async updatePaymentRecord(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const paymentRef = db.collection(COLLECTIONS.PAYMENTS).doc(paymentIntent.id);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      console.warn(`Payment record not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    await paymentRef.update({
      status: this.mapStripeStatus(paymentIntent.status),
      paidAt: paymentIntent.status === 'succeeded' ? new Date() : null,
      gatewayResponse: {
        status: paymentIntent.status,
        paymentMethod: paymentIntent.payment_method,
        lastError: paymentIntent.last_payment_error,
      },
      updatedAt: new Date(),
    });
  }

  /**
   * Update invoice status based on payment
   */
  private async updateInvoiceStatus(
    invoiceId: string,
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const invoiceRef = db.collection(COLLECTIONS.INVOICES).doc(invoiceId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      console.warn(`Invoice not found: ${invoiceId}`);
      return;
    }

    const invoice = invoiceDoc.data()!;
    const paymentAmount = paymentIntent.amount / 100; // Convert from cents

    const newPaidAmount = (invoice.paidAmount || 0) + paymentAmount;
    const newBalanceDue = invoice.total - newPaidAmount;

    let newStatus = invoice.status;
    if (newBalanceDue <= 0) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partially_paid';
    }

    await invoiceRef.update({
      status: newStatus,
      paidAmount: newPaidAmount,
      balanceDue: Math.max(0, newBalanceDue),
      updatedAt: new Date(),
    });
  }

  /**
   * Create transaction record
   */
  private async createTransactionRecord(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // This would integrate with the financial accounting system
    // For now, we'll create a basic transaction record
    await db.collection(COLLECTIONS.TRANSACTIONS).add({
      transactionNumber: `TXN-${Date.now()}`,
      type: 'income',
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      description: `Payment received via Stripe - ${paymentIntent.metadata.invoiceNumber}`,
      reference: paymentIntent.id,
      date: new Date(),
      reconciled: true,
      reconciledAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Send payment confirmation notification
   */
  private async sendPaymentConfirmation(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // This would integrate with notification service
    // For now, log the event
    console.log(`Payment confirmation sent for payment intent: ${paymentIntent.id}`);
  }

  /**
   * Send payment failure notification
   */
  private async sendPaymentFailureNotification(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // This would integrate with notification service
    // For now, log the event
    console.log(`Payment failure notification sent for payment intent: ${paymentIntent.id}`);
  }

  /**
   * Map Stripe status to internal payment status
   */
  private mapStripeStatus(stripeStatus: string): PaymentStatus {
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
}

// Export singleton instance
export const stripePaymentIntent = new StripePaymentIntentService();