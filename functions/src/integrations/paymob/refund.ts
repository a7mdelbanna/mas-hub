import { paymobClient } from './paymob-client';
import { paymobTransaction, PaymobTransaction } from './transaction';
import { db, COLLECTIONS } from '../../config/firebase';
import { PaymentStatus } from '../../../src/types/models';

export interface CreateRefundData {
  transactionId: number;
  amount?: number; // If partial refund
  reason?: string;
}

export interface PaymobRefund {
  id: number;
  amount_cents: number;
  created_at: string;
  transaction_id: number;
  order_id: number;
  refund_id: string;
  success: boolean;
  error_message?: string;
  error_code?: string;
}

export interface RefundResult {
  refund: PaymobRefund;
  status: PaymentStatus;
  refundId: string;
}

/**
 * Paymob Refund management
 * Handles refund processing for Paymob transactions
 */
export class PaymobRefundService {
  /**
   * Create refund for transaction
   */
  async createRefund(data: CreateRefundData): Promise<RefundResult> {
    try {
      // Get original transaction
      const originalTransaction = await paymobTransaction.getTransaction(data.transactionId);

      // Validate transaction can be refunded
      this.validateRefundEligibility(originalTransaction);

      // Calculate refund amount
      const refundAmount = data.amount || (originalTransaction.amount_cents / 100);
      const refundAmountCents = Math.round(refundAmount * 100);

      // Validate refund amount
      this.validateRefundAmount(originalTransaction, refundAmountCents);

      // Create refund payload
      const refundPayload = {
        auth_token: await paymobClient.getAuthToken(),
        transaction_id: data.transactionId,
        amount_cents: refundAmountCents,
        reason: data.reason || 'Customer request',
      };

      // Make refund request
      const refund = await paymobClient.makeRequest<PaymobRefund>(
        'POST',
        '/acceptance/refund',
        refundPayload
      );

      // Create refund record
      await this.createRefundRecord(refund, data, originalTransaction);

      // Update original transaction record
      await this.updateOriginalTransactionRecord(originalTransaction.id, refund);

      return {
        refund,
        status: refund.success ? PaymentStatus.REFUNDED : PaymentStatus.FAILED,
        refundId: refund.refund_id,
      };
    } catch (error) {
      console.error('Failed to create Paymob refund:', error);
      throw error;
    }
  }

  /**
   * Get refund status
   */
  async getRefundStatus(refundId: string): Promise<PaymobRefund | null> {
    try {
      const authToken = await paymobClient.getAuthToken();
      return await paymobClient.makeRequest<PaymobRefund>(
        'GET',
        `/acceptance/refunds/${refundId}?auth_token=${authToken}`
      );
    } catch (error) {
      console.error('Failed to get refund status:', error);
      return null;
    }
  }

  /**
   * List refunds for transaction
   */
  async listTransactionRefunds(transactionId: number): Promise<PaymobRefund[]> {
    try {
      const authToken = await paymobClient.getAuthToken();
      const response = await paymobClient.makeRequest<{ results: PaymobRefund[] }>(
        'GET',
        `/acceptance/refunds?transaction_id=${transactionId}&auth_token=${authToken}`
      );

      return response.results || [];
    } catch (error) {
      console.error('Failed to list transaction refunds:', error);
      return [];
    }
  }

  /**
   * Process refund callback/webhook
   */
  async processRefundCallback(refund: PaymobRefund): Promise<void> {
    try {
      // Update refund record
      await this.updateRefundRecord(refund);

      // Process based on refund status
      if (refund.success) {
        await this.processSuccessfulRefund(refund);
      } else {
        await this.processFailedRefund(refund);
      }

      // Send refund notification
      await this.sendRefundNotification(refund);
    } catch (error) {
      console.error('Failed to process refund callback:', error);
      throw error;
    }
  }

  /**
   * Calculate refundable amount for transaction
   */
  async getRefundableAmount(transactionId: number): Promise<number> {
    try {
      const transaction = await paymobTransaction.getTransaction(transactionId);
      const refunds = await this.listTransactionRefunds(transactionId);

      const totalRefunded = refunds.reduce((sum, refund) => {
        return sum + (refund.success ? refund.amount_cents : 0);
      }, 0);

      const refundableAmount = transaction.amount_cents - totalRefunded;
      return refundableAmount / 100; // Convert from cents
    } catch (error) {
      console.error('Failed to calculate refundable amount:', error);
      throw error;
    }
  }

  /**
   * Check if transaction is refundable
   */
  async isTransactionRefundable(transactionId: number): Promise<boolean> {
    try {
      const transaction = await paymobTransaction.getTransaction(transactionId);

      // Basic eligibility checks
      if (!transaction.success) return false;
      if (transaction.is_refunded) return false;
      if (transaction.is_voided) return false;
      if (transaction.error_occured) return false;

      // Check refundable amount
      const refundableAmount = await this.getRefundableAmount(transactionId);
      return refundableAmount > 0;
    } catch (error) {
      console.error('Failed to check refund eligibility:', error);
      return false;
    }
  }

  /**
   * Get refund summary for period
   */
  async getRefundSummary(fromDate: string, toDate: string): Promise<any> {
    try {
      const authToken = await paymobClient.getAuthToken();
      const response = await paymobClient.makeRequest<{ results: PaymobRefund[] }>(
        'GET',
        `/acceptance/refunds?from_date=${fromDate}&to_date=${toDate}&auth_token=${authToken}`
      );

      const refunds = response.results || [];
      return this.calculateRefundSummary(refunds);
    } catch (error) {
      console.error('Failed to get refund summary:', error);
      throw error;
    }
  }

  /**
   * Validate refund eligibility
   */
  private validateRefundEligibility(transaction: PaymobTransaction): void {
    if (!transaction.success) {
      throw new Error('Cannot refund unsuccessful transaction');
    }

    if (transaction.is_refunded) {
      throw new Error('Transaction is already fully refunded');
    }

    if (transaction.is_voided) {
      throw new Error('Cannot refund voided transaction');
    }

    if (transaction.error_occured) {
      throw new Error('Cannot refund transaction with errors');
    }

    // Check if transaction is too old (Paymob may have limits)
    const transactionDate = new Date(transaction.created_at);
    const daysDiff = (Date.now() - transactionDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 180) { // 6 months limit (adjust based on Paymob policy)
      throw new Error('Transaction is too old to refund');
    }
  }

  /**
   * Validate refund amount
   */
  private validateRefundAmount(
    transaction: PaymobTransaction,
    refundAmountCents: number
  ): void {
    if (refundAmountCents <= 0) {
      throw new Error('Refund amount must be greater than zero');
    }

    if (refundAmountCents > transaction.amount_cents) {
      throw new Error('Refund amount cannot exceed original transaction amount');
    }

    // Check if partial refund exceeds available amount
    const alreadyRefunded = transaction.refunded_amount_cents || 0;
    if (refundAmountCents > (transaction.amount_cents - alreadyRefunded)) {
      throw new Error('Refund amount exceeds refundable balance');
    }
  }

  /**
   * Create refund record in database
   */
  private async createRefundRecord(
    refund: PaymobRefund,
    data: CreateRefundData,
    originalTransaction: PaymobTransaction
  ): Promise<void> {
    try {
      await db.collection('paymobRefunds').doc(refund.id.toString()).set({
        refundId: refund.id,
        paymobRefundId: refund.refund_id,
        transactionId: refund.transaction_id,
        orderId: refund.order_id,
        originalTransactionId: data.transactionId,
        invoiceId: originalTransaction.order.merchant_order_id,
        amount: refund.amount_cents / 100,
        currency: originalTransaction.currency,
        amountCents: refund.amount_cents,
        success: refund.success,
        errorCode: refund.error_code,
        errorMessage: refund.error_message,
        reason: data.reason,
        status: refund.success ? 'completed' : 'failed',
        createdAt: new Date(refund.created_at),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to create refund record:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Update refund record
   */
  private async updateRefundRecord(refund: PaymobRefund): Promise<void> {
    try {
      const refundRef = db.collection('paymobRefunds').doc(refund.id.toString());
      await refundRef.update({
        success: refund.success,
        errorCode: refund.error_code,
        errorMessage: refund.error_message,
        status: refund.success ? 'completed' : 'failed',
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to update refund record:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Update original transaction record for refund
   */
  private async updateOriginalTransactionRecord(
    transactionId: number,
    refund: PaymobRefund
  ): Promise<void> {
    try {
      const transactionRef = db.collection('paymobTransactions').doc(transactionId.toString());
      const transactionDoc = await transactionRef.get();

      if (!transactionDoc.exists) return;

      const currentData = transactionDoc.data()!;
      const newRefundedAmount = (currentData.refundedAmountCents || 0) + refund.amount_cents;

      await transactionRef.update({
        isRefunded: refund.success,
        refundedAmountCents: newRefundedAmount,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to update original transaction record:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Process successful refund
   */
  private async processSuccessfulRefund(refund: PaymobRefund): Promise<void> {
    // Update payment record
    await this.updatePaymentRecordForRefund(refund);

    // Update invoice if applicable
    await this.updateInvoiceForRefund(refund);

    // Create refund transaction for accounting
    await this.createRefundTransaction(refund);
  }

  /**
   * Process failed refund
   */
  private async processFailedRefund(refund: PaymobRefund): Promise<void> {
    console.log(`Refund failed: ${refund.id} - ${refund.error_message}`);
    // Send failure notification
    await this.sendRefundFailureNotification(refund);
  }

  /**
   * Update payment record for refund
   */
  private async updatePaymentRecordForRefund(refund: PaymobRefund): Promise<void> {
    try {
      const paymentQuery = await db.collection(COLLECTIONS.PAYMENTS)
        .where('gatewayTransactionId', '==', refund.transaction_id.toString())
        .get();

      for (const paymentDoc of paymentQuery.docs) {
        const payment = paymentDoc.data();
        const refundAmount = refund.amount_cents / 100;
        const newRefundedAmount = (payment.refundedAmount || 0) + refundAmount;

        let newStatus = payment.status;
        if (newRefundedAmount >= payment.amount) {
          newStatus = 'refunded';
        } else if (newRefundedAmount > 0) {
          newStatus = 'partially_refunded';
        }

        await paymentDoc.ref.update({
          status: newStatus,
          refundedAmount: newRefundedAmount,
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to update payment record for refund:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Update invoice for refund
   */
  private async updateInvoiceForRefund(refund: PaymobRefund): Promise<void> {
    try {
      // Get original transaction to find invoice ID
      const transaction = await paymobTransaction.getTransaction(refund.transaction_id);
      const invoiceId = transaction.order.merchant_order_id;

      if (!invoiceId) return;

      const invoiceRef = db.collection(COLLECTIONS.INVOICES).doc(invoiceId);
      const invoiceDoc = await invoiceRef.get();

      if (!invoiceDoc.exists) return;

      const invoice = invoiceDoc.data()!;
      const refundAmount = refund.amount_cents / 100;

      const newPaidAmount = Math.max(0, (invoice.paidAmount || 0) - refundAmount);
      const newBalanceDue = invoice.total - newPaidAmount;

      let newStatus = invoice.status;
      if (newPaidAmount === 0) {
        newStatus = 'sent';
      } else if (newPaidAmount < invoice.total) {
        newStatus = 'partially_paid';
      }

      await invoiceRef.update({
        status: newStatus,
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to update invoice for refund:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Create refund transaction for accounting
   */
  private async createRefundTransaction(refund: PaymobRefund): Promise<void> {
    try {
      const transaction = await paymobTransaction.getTransaction(refund.transaction_id);

      await db.collection(COLLECTIONS.TRANSACTIONS).add({
        transactionNumber: `TXN-PMB-REF-${refund.id}`,
        type: 'expense',
        amount: refund.amount_cents / 100,
        currency: transaction.currency,
        description: `Refund processed via Paymob - Refund #${refund.id}`,
        reference: refund.refund_id,
        date: new Date(),
        reconciled: true,
        reconciledAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to create refund transaction:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Send refund notification
   */
  private async sendRefundNotification(refund: PaymobRefund): Promise<void> {
    console.log(`Refund notification sent for Paymob refund: ${refund.id}`);
  }

  /**
   * Send refund failure notification
   */
  private async sendRefundFailureNotification(refund: PaymobRefund): Promise<void> {
    console.log(`Refund failure notification sent for Paymob refund: ${refund.id}`);
  }

  /**
   * Calculate refund summary
   */
  private calculateRefundSummary(refunds: PaymobRefund[]): any {
    const summary = {
      totalRefunds: refunds.length,
      successfulRefunds: 0,
      failedRefunds: 0,
      totalAmount: 0,
      currencies: {} as Record<string, number>,
      refundsByMonth: {} as Record<string, number>,
    };

    for (const refund of refunds) {
      if (refund.success) {
        summary.successfulRefunds++;
        summary.totalAmount += refund.amount_cents / 100;
      } else {
        summary.failedRefunds++;
      }

      // Track refunds by month
      const month = new Date(refund.created_at).toISOString().substring(0, 7);
      if (!summary.refundsByMonth[month]) {
        summary.refundsByMonth[month] = 0;
      }
      summary.refundsByMonth[month] += refund.amount_cents / 100;
    }

    return summary;
  }
}

// Export singleton instance
export const paymobRefund = new PaymobRefundService();