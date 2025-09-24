import { paymobClient } from './paymob-client';
import { db, COLLECTIONS } from '../../config/firebase';
import { PaymentStatus } from '../../../src/types/models';

export interface PaymobTransaction {
  id: number;
  pending: boolean;
  amount_cents: number;
  success: boolean;
  is_auth: boolean;
  is_capture: boolean;
  is_refunded: boolean;
  is_standalone_payment: boolean;
  is_voided: boolean;
  error_occured: boolean;
  has_parent_transaction: boolean;
  order: {
    id: number;
    created_at: string;
    delivery_needed: boolean;
    merchant: any;
    amount_cents: number;
    currency: string;
    is_payment_locked: boolean;
    merchant_order_id: string;
    wallet_notification: any;
    paid_amount_cents: number;
    items: any[];
  };
  created_at: string;
  transaction_processed_callback_at: string;
  currency: string;
  source_data: {
    pan: string;
    type: string;
    tenure: string;
    sub_type: string;
  };
  api_source: string;
  terminal_id: any;
  merchant_commission: number;
  installment: any;
  discount: any;
  is_void: boolean;
  is_refund: boolean;
  data: any;
  is_hidden: boolean;
  payment_key_claims: any;
  error_code: string;
  error_message: string;
  is_live: boolean;
  other_endpoint_reference: any;
  refunded_amount_cents: number;
  source_id: number;
  is_captured: boolean;
  captured_amount: number;
  merchant_staff_tag: string;
  updated_at: string;
  is_settled: boolean;
  bill_balanced: boolean;
  is_bill: boolean;
  owner: number;
  parent_transaction: any;
}

export interface TransactionQuery {
  orderId?: number;
  transactionId?: number;
  merchantOrderId?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

export interface TransactionListResponse {
  results: PaymobTransaction[];
  count: number;
  next: string | null;
  previous: string | null;
}

/**
 * Paymob Transaction management
 * Handles transaction queries, status checks, and processing
 */
export class PaymobTransactionService {
  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: number): Promise<PaymobTransaction> {
    try {
      const authToken = await paymobClient.getAuthToken();
      return await paymobClient.makeRequest<PaymobTransaction>(
        'GET',
        `/acceptance/transactions/${transactionId}?auth_token=${authToken}`
      );
    } catch (error) {
      console.error('Failed to get Paymob transaction:', error);
      throw error;
    }
  }

  /**
   * Query transactions with filters
   */
  async queryTransactions(query: TransactionQuery = {}): Promise<TransactionListResponse> {
    try {
      const authToken = await paymobClient.getAuthToken();

      // Build query parameters
      const params = new URLSearchParams();
      params.append('auth_token', authToken);

      if (query.orderId) params.append('order', query.orderId.toString());
      if (query.transactionId) params.append('id', query.transactionId.toString());
      if (query.merchantOrderId) params.append('order_id', query.merchantOrderId);
      if (query.from_date) params.append('from_date', query.from_date);
      if (query.to_date) params.append('to_date', query.to_date);
      if (query.page) params.append('page', query.page.toString());
      if (query.per_page) params.append('per_page', query.per_page.toString());

      return await paymobClient.makeRequest<TransactionListResponse>(
        'GET',
        `/acceptance/transactions?${params.toString()}`
      );
    } catch (error) {
      console.error('Failed to query Paymob transactions:', error);
      throw error;
    }
  }

  /**
   * Get transactions for specific order
   */
  async getOrderTransactions(orderId: number): Promise<PaymobTransaction[]> {
    try {
      const response = await this.queryTransactions({ orderId });
      return response.results;
    } catch (error) {
      console.error('Failed to get order transactions:', error);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId: number): Promise<PaymentStatus> {
    try {
      const transaction = await this.getTransaction(transactionId);
      return this.mapTransactionStatus(transaction);
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      throw error;
    }
  }

  /**
   * Process transaction callback/webhook
   */
  async processTransactionCallback(transaction: PaymobTransaction): Promise<void> {
    try {
      // Update transaction record
      await this.updateTransactionRecord(transaction);

      // Process based on transaction status
      if (transaction.success && !transaction.pending) {
        await this.processSuccessfulTransaction(transaction);
      } else if (transaction.error_occured) {
        await this.processFailedTransaction(transaction);
      } else if (transaction.is_refunded) {
        await this.processRefundedTransaction(transaction);
      }

      // Send transaction notification
      await this.sendTransactionNotification(transaction);
    } catch (error) {
      console.error('Failed to process transaction callback:', error);
      throw error;
    }
  }

  /**
   * Void transaction (if supported)
   */
  async voidTransaction(transactionId: number): Promise<PaymobTransaction> {
    try {
      const voidPayload = {
        auth_token: await paymobClient.getAuthToken(),
        transaction_id: transactionId,
      };

      const voidedTransaction = await paymobClient.makeRequest<PaymobTransaction>(
        'POST',
        '/acceptance/void',
        voidPayload
      );

      // Update transaction record
      await this.updateTransactionRecord(voidedTransaction);

      return voidedTransaction;
    } catch (error) {
      console.error('Failed to void Paymob transaction:', error);
      throw error;
    }
  }

  /**
   * Capture authorized transaction
   */
  async captureTransaction(transactionId: number, amount?: number): Promise<PaymobTransaction> {
    try {
      const capturePayload = {
        auth_token: await paymobClient.getAuthToken(),
        transaction_id: transactionId,
      };

      if (amount) {
        capturePayload.amount_cents = Math.round(amount * 100);
      }

      const capturedTransaction = await paymobClient.makeRequest<PaymobTransaction>(
        'POST',
        '/acceptance/capture',
        capturePayload
      );

      // Update transaction record
      await this.updateTransactionRecord(capturedTransaction);

      return capturedTransaction;
    } catch (error) {
      console.error('Failed to capture Paymob transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction analytics/summary
   */
  async getTransactionSummary(
    fromDate: string,
    toDate: string
  ): Promise<any> {
    try {
      const transactions = await this.queryTransactions({
        from_date: fromDate,
        to_date: toDate,
        per_page: 100, // Get more transactions for analysis
      });

      return this.calculateTransactionSummary(transactions.results);
    } catch (error) {
      console.error('Failed to get transaction summary:', error);
      throw error;
    }
  }

  /**
   * Store/update transaction record in database
   */
  private async updateTransactionRecord(transaction: PaymobTransaction): Promise<void> {
    try {
      await db.collection('paymobTransactions').doc(transaction.id.toString()).set({
        transactionId: transaction.id,
        orderId: transaction.order.id,
        merchantOrderId: transaction.order.merchant_order_id,
        amount: transaction.amount_cents / 100,
        currency: transaction.currency,
        amountCents: transaction.amount_cents,
        success: transaction.success,
        pending: transaction.pending,
        isAuth: transaction.is_auth,
        isCapture: transaction.is_capture,
        isRefunded: transaction.is_refunded,
        isVoid: transaction.is_void,
        errorOccurred: transaction.error_occured,
        errorCode: transaction.error_code,
        errorMessage: transaction.error_message,
        status: this.mapTransactionStatus(transaction),
        merchantCommission: transaction.merchant_commission,
        refundedAmountCents: transaction.refunded_amount_cents,
        isLive: transaction.is_live,
        isSettled: transaction.is_settled,
        sourceData: transaction.source_data,
        paymentKeyClaims: transaction.payment_key_claims,
        data: transaction.data,
        createdAt: new Date(transaction.created_at),
        updatedAt: new Date(transaction.updated_at),
        processedAt: transaction.transaction_processed_callback_at
          ? new Date(transaction.transaction_processed_callback_at)
          : null,
      }, { merge: true });
    } catch (error) {
      console.error('Failed to update transaction record:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Process successful transaction
   */
  private async processSuccessfulTransaction(transaction: PaymobTransaction): Promise<void> {
    const invoiceId = transaction.order.merchant_order_id;
    if (!invoiceId) {
      console.warn('No invoice ID found in transaction order');
      return;
    }

    // Update invoice status
    await this.updateInvoiceFromTransaction(invoiceId, transaction);

    // Create/update payment record
    await this.createPaymentRecord(transaction);

    // Create transaction record for accounting
    await this.createAccountingTransaction(transaction);
  }

  /**
   * Process failed transaction
   */
  private async processFailedTransaction(transaction: PaymobTransaction): Promise<void> {
    console.log(`Transaction failed: ${transaction.id} - ${transaction.error_message}`);

    // Create payment record with failed status
    await this.createPaymentRecord(transaction, 'failed');

    // Send failure notification
    await this.sendTransactionFailureNotification(transaction);
  }

  /**
   * Process refunded transaction
   */
  private async processRefundedTransaction(transaction: PaymobTransaction): Promise<void> {
    console.log(`Transaction refunded: ${transaction.id}`);

    // Update payment record
    await this.updatePaymentRecordForRefund(transaction);

    // Update invoice if needed
    const invoiceId = transaction.order.merchant_order_id;
    if (invoiceId) {
      await this.updateInvoiceForRefund(invoiceId, transaction);
    }
  }

  /**
   * Update invoice from successful transaction
   */
  private async updateInvoiceFromTransaction(
    invoiceId: string,
    transaction: PaymobTransaction
  ): Promise<void> {
    const invoiceRef = db.collection(COLLECTIONS.INVOICES).doc(invoiceId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      console.warn(`Invoice not found: ${invoiceId}`);
      return;
    }

    const invoice = invoiceDoc.data()!;
    const paymentAmount = transaction.amount_cents / 100;

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
   * Create payment record
   */
  private async createPaymentRecord(
    transaction: PaymobTransaction,
    status?: string
  ): Promise<void> {
    const paymentStatus = status || (transaction.success ? 'completed' : 'failed');

    await db.collection(COLLECTIONS.PAYMENTS).add({
      paymentNumber: `PAY-PMB-${transaction.id}`,
      invoiceId: transaction.order.merchant_order_id,
      amount: transaction.amount_cents / 100,
      currency: transaction.currency,
      status: paymentStatus,
      method: 'paymob',
      paidAt: transaction.success ? new Date() : null,
      reference: transaction.id.toString(),
      gatewayTransactionId: transaction.id.toString(),
      gatewayResponse: {
        transactionId: transaction.id,
        orderId: transaction.order.id,
        merchantOrderId: transaction.order.merchant_order_id,
        sourceData: transaction.source_data,
        errorCode: transaction.error_code,
        errorMessage: transaction.error_message,
        merchantCommission: transaction.merchant_commission,
      },
      notes: `Paymob transaction #${transaction.id}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Create accounting transaction
   */
  private async createAccountingTransaction(transaction: PaymobTransaction): Promise<void> {
    await db.collection(COLLECTIONS.TRANSACTIONS).add({
      transactionNumber: `TXN-PMB-${transaction.id}`,
      type: 'income',
      amount: transaction.amount_cents / 100,
      currency: transaction.currency,
      description: `Payment received via Paymob - Transaction #${transaction.id}`,
      reference: transaction.id.toString(),
      date: new Date(),
      reconciled: true,
      reconciledAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Update payment record for refund
   */
  private async updatePaymentRecordForRefund(transaction: PaymobTransaction): Promise<void> {
    // Find payment record by transaction ID
    const paymentQuery = await db.collection(COLLECTIONS.PAYMENTS)
      .where('gatewayTransactionId', '==', transaction.id.toString())
      .get();

    for (const paymentDoc of paymentQuery.docs) {
      await paymentDoc.ref.update({
        status: 'refunded',
        refundedAmount: transaction.refunded_amount_cents / 100,
        updatedAt: new Date(),
      });
    }
  }

  /**
   * Update invoice for refund
   */
  private async updateInvoiceForRefund(
    invoiceId: string,
    transaction: PaymobTransaction
  ): Promise<void> {
    const invoiceRef = db.collection(COLLECTIONS.INVOICES).doc(invoiceId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) return;

    const invoice = invoiceDoc.data()!;
    const refundAmount = transaction.refunded_amount_cents / 100;

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
  }

  /**
   * Send transaction notification
   */
  private async sendTransactionNotification(transaction: PaymobTransaction): Promise<void> {
    console.log(`Transaction notification sent for Paymob transaction: ${transaction.id}`);
  }

  /**
   * Send transaction failure notification
   */
  private async sendTransactionFailureNotification(transaction: PaymobTransaction): Promise<void> {
    console.log(`Transaction failure notification sent for Paymob transaction: ${transaction.id}`);
  }

  /**
   * Calculate transaction summary
   */
  private calculateTransactionSummary(transactions: PaymobTransaction[]): any {
    const summary = {
      totalTransactions: transactions.length,
      successfulTransactions: 0,
      failedTransactions: 0,
      pendingTransactions: 0,
      totalAmount: 0,
      totalCommission: 0,
      refundedTransactions: 0,
      totalRefunded: 0,
      currencies: {} as Record<string, number>,
    };

    for (const transaction of transactions) {
      if (transaction.success) {
        summary.successfulTransactions++;
        summary.totalAmount += transaction.amount_cents / 100;
      } else if (transaction.pending) {
        summary.pendingTransactions++;
      } else {
        summary.failedTransactions++;
      }

      if (transaction.is_refunded) {
        summary.refundedTransactions++;
        summary.totalRefunded += transaction.refunded_amount_cents / 100;
      }

      summary.totalCommission += transaction.merchant_commission || 0;

      // Track by currency
      if (!summary.currencies[transaction.currency]) {
        summary.currencies[transaction.currency] = 0;
      }
      summary.currencies[transaction.currency] += transaction.amount_cents / 100;
    }

    return summary;
  }

  /**
   * Map Paymob transaction status to internal payment status
   */
  private mapTransactionStatus(transaction: PaymobTransaction): PaymentStatus {
    if (transaction.is_refunded) {
      return PaymentStatus.REFUNDED;
    }

    if (transaction.error_occured || (!transaction.success && !transaction.pending)) {
      return PaymentStatus.FAILED;
    }

    if (transaction.pending) {
      return PaymentStatus.PROCESSING;
    }

    if (transaction.success) {
      return PaymentStatus.COMPLETED;
    }

    return PaymentStatus.PENDING;
  }
}

// Export singleton instance
export const paymobTransaction = new PaymobTransactionService();