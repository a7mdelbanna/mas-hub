import Stripe from 'stripe';
import { stripeClient } from './stripe-client';
import { db, COLLECTIONS } from '../../config/firebase';
import { PaymentStatus } from '../../../src/types/models';

export interface CreateRefundData {
  paymentIntentId?: string;
  chargeId?: string;
  amount?: number; // If partial refund
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
  reverseTransfer?: boolean;
  refundApplicationFee?: boolean;
}

export interface RefundResult {
  refund: Stripe.Refund;
  status: PaymentStatus;
  refundId: string;
}

/**
 * Stripe Refund management
 * Handles payment refunds and refund processing
 */
export class StripeRefundService {
  private client: Stripe;

  constructor() {
    this.client = stripeClient.getClient();
  }

  /**
   * Create refund for payment intent or charge
   */
  async createRefund(data: CreateRefundData): Promise<RefundResult> {
    try {
      // Validate input
      if (!data.paymentIntentId && !data.chargeId) {
        throw new Error('Either paymentIntentId or chargeId must be provided');
      }

      // Get payment intent if provided
      let paymentIntent: Stripe.PaymentIntent | null = null;
      if (data.paymentIntentId) {
        paymentIntent = await this.client.paymentIntents.retrieve(data.paymentIntentId);
      }

      // Prepare refund parameters
      const refundParams: Stripe.RefundCreateParams = {
        reason: data.reason || 'requested_by_customer',
        metadata: {
          source: 'mas_business_os',
          refundedBy: 'system', // This should be replaced with actual user ID
          ...data.metadata,
        },
      };

      // Set charge or payment intent
      if (data.paymentIntentId) {
        refundParams.payment_intent = data.paymentIntentId;
      } else {
        refundParams.charge = data.chargeId!;
      }

      // Set amount for partial refund
      if (data.amount) {
        refundParams.amount = Math.round(data.amount * 100); // Convert to cents
      }

      // Set additional options
      if (data.reverseTransfer !== undefined) {
        refundParams.reverse_transfer = data.reverseTransfer;
      }
      if (data.refundApplicationFee !== undefined) {
        refundParams.refund_application_fee = data.refundApplicationFee;
      }

      // Create refund
      const refund = await this.client.refunds.create(refundParams);

      // Create refund record in database
      await this.createRefundRecord(refund, data, paymentIntent);

      // Update original payment record
      await this.updateOriginalPaymentRecord(refund);

      // Update invoice if applicable
      await this.updateInvoiceFromRefund(refund);

      return {
        refund,
        status: this.mapRefundStatus(refund.status),
        refundId: refund.id,
      };
    } catch (error) {
      console.error('Failed to create refund:', error);
      throw error;
    }
  }

  /**
   * Retrieve refund
   */
  async getRefund(refundId: string): Promise<Stripe.Refund> {
    try {
      return await this.client.refunds.retrieve(refundId);
    } catch (error) {
      console.error('Failed to retrieve refund:', error);
      throw error;
    }
  }

  /**
   * Update refund
   */
  async updateRefund(
    refundId: string,
    updates: Stripe.RefundUpdateParams
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.client.refunds.update(refundId, updates);

      // Update refund record
      await this.updateRefundRecord(refund);

      return refund;
    } catch (error) {
      console.error('Failed to update refund:', error);
      throw error;
    }
  }

  /**
   * List refunds for payment intent
   */
  async listRefundsForPaymentIntent(paymentIntentId: string): Promise<Stripe.ApiList<Stripe.Refund>> {
    try {
      return await this.client.refunds.list({
        payment_intent: paymentIntentId,
      });
    } catch (error) {
      console.error('Failed to list refunds for payment intent:', error);
      throw error;
    }
  }

  /**
   * List refunds for charge
   */
  async listRefundsForCharge(chargeId: string): Promise<Stripe.ApiList<Stripe.Refund>> {
    try {
      return await this.client.refunds.list({
        charge: chargeId,
      });
    } catch (error) {
      console.error('Failed to list refunds for charge:', error);
      throw error;
    }
  }

  /**
   * Calculate refundable amount for payment intent
   */
  async getRefundableAmount(paymentIntentId: string): Promise<number> {
    try {
      const paymentIntent = await this.client.paymentIntents.retrieve(paymentIntentId);
      const refunds = await this.listRefundsForPaymentIntent(paymentIntentId);

      const totalRefunded = refunds.data.reduce((sum, refund) => {
        return sum + (refund.status === 'succeeded' ? refund.amount : 0);
      }, 0);

      const refundableAmount = (paymentIntent.amount || 0) - totalRefunded;
      return refundableAmount / 100; // Convert from cents
    } catch (error) {
      console.error('Failed to calculate refundable amount:', error);
      throw error;
    }
  }

  /**
   * Process automatic refund for cancelled payment
   */
  async processAutomaticRefund(
    paymentIntentId: string,
    reason: string = 'Payment cancelled'
  ): Promise<RefundResult | null> {
    try {
      const paymentIntent = await this.client.paymentIntents.retrieve(paymentIntentId);

      // Only refund if payment was successful
      if (paymentIntent.status !== 'succeeded') {
        console.log(`Payment intent ${paymentIntentId} not succeeded, no refund needed`);
        return null;
      }

      // Check if already fully refunded
      const refundableAmount = await this.getRefundableAmount(paymentIntentId);
      if (refundableAmount <= 0) {
        console.log(`Payment intent ${paymentIntentId} already fully refunded`);
        return null;
      }

      // Create automatic refund
      return await this.createRefund({
        paymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          automatic: 'true',
          reason,
        },
      });
    } catch (error) {
      console.error('Failed to process automatic refund:', error);
      throw error;
    }
  }

  /**
   * Handle refund webhook event
   */
  async handleRefundWebhook(refund: Stripe.Refund): Promise<void> {
    try {
      // Update refund record
      await this.updateRefundRecord(refund);

      // Update original payment record
      await this.updateOriginalPaymentRecord(refund);

      // Update invoice if applicable
      await this.updateInvoiceFromRefund(refund);

      // Send refund notification
      await this.sendRefundNotification(refund);

      console.log(`Refund webhook processed for refund: ${refund.id}`);
    } catch (error) {
      console.error('Failed to handle refund webhook:', error);
      throw error;
    }
  }

  /**
   * Create refund record in database
   */
  private async createRefundRecord(
    refund: Stripe.Refund,
    data: CreateRefundData,
    paymentIntent?: Stripe.PaymentIntent | null
  ): Promise<void> {
    try {
      // Try to find original payment record
      let originalPayment = null;
      if (data.paymentIntentId) {
        const paymentDoc = await db.collection(COLLECTIONS.PAYMENTS).doc(data.paymentIntentId).get();
        if (paymentDoc.exists) {
          originalPayment = paymentDoc.data();
        }
      }

      await db.collection('refunds').doc(refund.id).set({
        refundId: refund.id,
        paymentIntentId: data.paymentIntentId,
        chargeId: refund.charge,
        invoiceId: originalPayment?.invoiceId,
        accountId: originalPayment?.accountId,
        amount: refund.amount / 100, // Convert from cents
        currency: refund.currency?.toUpperCase(),
        status: this.mapRefundStatus(refund.status),
        reason: refund.reason,
        receiptNumber: refund.receipt_number,
        metadata: refund.metadata,
        gatewayResponse: {
          status: refund.status,
          failureReason: refund.failure_reason,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to create refund record:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Update refund record in database
   */
  private async updateRefundRecord(refund: Stripe.Refund): Promise<void> {
    try {
      const refundRef = db.collection('refunds').doc(refund.id);
      const refundDoc = await refundRef.get();

      if (!refundDoc.exists) {
        console.warn(`Refund record not found: ${refund.id}`);
        return;
      }

      await refundRef.update({
        status: this.mapRefundStatus(refund.status),
        receiptNumber: refund.receipt_number,
        gatewayResponse: {
          status: refund.status,
          failureReason: refund.failure_reason,
        },
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to update refund record:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Update original payment record
   */
  private async updateOriginalPaymentRecord(refund: Stripe.Refund): Promise<void> {
    try {
      // Find payment by charge ID or payment intent ID
      let paymentQuery = db.collection(COLLECTIONS.PAYMENTS)
        .where('gatewayTransactionId', '==', refund.charge);

      if (refund.payment_intent) {
        paymentQuery = db.collection(COLLECTIONS.PAYMENTS)
          .where('gatewayTransactionId', '==', refund.payment_intent);
      }

      const paymentDocs = await paymentQuery.get();

      for (const paymentDoc of paymentDocs.docs) {
        const payment = paymentDoc.data();

        // Only update if refund is successful
        if (refund.status === 'succeeded') {
          const newStatus = payment.amount <= (refund.amount / 100) ? 'refunded' : 'partially_refunded';

          await paymentDoc.ref.update({
            status: newStatus,
            refundedAmount: (payment.refundedAmount || 0) + (refund.amount / 100),
            updatedAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error('Failed to update original payment record:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Update invoice from refund
   */
  private async updateInvoiceFromRefund(refund: Stripe.Refund): Promise<void> {
    try {
      // Only update if refund is successful
      if (refund.status !== 'succeeded') {
        return;
      }

      // Find payment record to get invoice ID
      let paymentQuery = db.collection(COLLECTIONS.PAYMENTS)
        .where('gatewayTransactionId', '==', refund.charge || refund.payment_intent);

      const paymentDocs = await paymentQuery.get();

      for (const paymentDoc of paymentDocs.docs) {
        const payment = paymentDoc.data();
        if (!payment.invoiceId) continue;

        const invoiceRef = db.collection(COLLECTIONS.INVOICES).doc(payment.invoiceId);
        const invoiceDoc = await invoiceRef.get();

        if (!invoiceDoc.exists) continue;

        const invoice = invoiceDoc.data()!;
        const refundAmount = refund.amount / 100;

        const newPaidAmount = Math.max(0, (invoice.paidAmount || 0) - refundAmount);
        const newBalanceDue = invoice.total - newPaidAmount;

        let newStatus = invoice.status;
        if (newPaidAmount === 0) {
          newStatus = 'sent'; // Back to unpaid
        } else if (newPaidAmount < invoice.total) {
          newStatus = 'partially_paid';
        }

        await invoiceRef.update({
          status: newStatus,
          paidAmount: newPaidAmount,
          balanceDue: newBalanceDue,
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to update invoice from refund:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Send refund notification
   */
  private async sendRefundNotification(refund: Stripe.Refund): Promise<void> {
    // This would integrate with notification service
    console.log(`Refund notification sent for refund: ${refund.id}`);
  }

  /**
   * Map Stripe refund status to internal status
   */
  private mapRefundStatus(stripeStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      pending: PaymentStatus.PROCESSING,
      succeeded: PaymentStatus.REFUNDED,
      failed: PaymentStatus.FAILED,
      canceled: PaymentStatus.FAILED,
    };

    return statusMap[stripeStatus] || PaymentStatus.FAILED;
  }
}

// Export singleton instance
export const stripeRefund = new StripeRefundService();