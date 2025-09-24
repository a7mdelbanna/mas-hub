import crypto from 'crypto';
import { paymobClient } from './paymob-client';
import { paymobOrder } from './payment-order';
import { paymobTransaction, PaymobTransaction } from './transaction';
import { paymobRefund } from './refund';
import { config } from '../../config/firebase';

export interface PaymobWebhookPayload {
  type: string;
  obj: any;
  created_at: string;
  pending: boolean;
  amount_cents: number;
  success: boolean;
  is_refunded: boolean;
  is_auth: boolean;
  is_capture: boolean;
  is_voided: boolean;
  is_3d_secure: boolean;
  integration_id: number;
  profile_id: number;
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
  error_occured: boolean;
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
  currency: string;
  id: number;
}

export interface WebhookHandlerResult {
  handled: boolean;
  message: string;
  eventType: string;
}

/**
 * Paymob Webhook Handler
 * Handles all Paymob webhook events and routes them to appropriate services
 */
export class PaymobWebhookHandler {
  /**
   * Handle Paymob webhook event
   */
  async handleWebhook(
    payload: any,
    signature?: string
  ): Promise<WebhookHandlerResult> {
    try {
      // Verify webhook signature if provided
      if (signature && !this.verifyWebhookSignature(payload, signature)) {
        throw new Error('Invalid webhook signature');
      }

      const webhookData = typeof payload === 'string' ? JSON.parse(payload) : payload;

      console.log(`Processing Paymob webhook: ${webhookData.type || 'transaction'} (${webhookData.id})`);

      // Route event to appropriate handler
      const result = await this.routeWebhookEvent(webhookData);

      console.log(`Paymob webhook processed: ${webhookData.type || 'transaction'} - ${result.message}`);

      return {
        handled: result.handled,
        message: result.message,
        eventType: webhookData.type || 'transaction',
      };
    } catch (error) {
      console.error('Paymob webhook handling failed:', error);
      throw error;
    }
  }

  /**
   * Route webhook event to appropriate handler
   */
  private async routeWebhookEvent(data: PaymobWebhookPayload): Promise<WebhookHandlerResult> {
    try {
      // Paymob typically sends transaction callbacks
      // The event type is usually implied by the transaction state
      if (this.isTransactionEvent(data)) {
        return await this.handleTransactionEvent(data);
      }

      // Handle refund events
      if (this.isRefundEvent(data)) {
        return await this.handleRefundEvent(data);
      }

      // Handle order events
      if (this.isOrderEvent(data)) {
        return await this.handleOrderEvent(data);
      }

      return {
        handled: false,
        message: `Unhandled webhook event type: ${data.type || 'unknown'}`,
      };
    } catch (error) {
      console.error(`Error handling webhook event:`, error);
      throw error;
    }
  }

  /**
   * Handle transaction events
   */
  private async handleTransactionEvent(data: PaymobWebhookPayload): Promise<WebhookHandlerResult> {
    try {
      // Convert webhook payload to transaction format
      const transaction: PaymobTransaction = {
        id: data.id,
        pending: data.pending,
        amount_cents: data.amount_cents,
        success: data.success,
        is_auth: data.is_auth,
        is_capture: data.is_capture,
        is_refunded: data.is_refunded,
        is_standalone_payment: false, // Not available in webhook
        is_voided: data.is_voided,
        error_occured: data.error_occured,
        has_parent_transaction: data.has_parent_transaction,
        order: data.order,
        created_at: data.created_at,
        transaction_processed_callback_at: new Date().toISOString(),
        currency: data.currency,
        source_data: data.source_data,
        api_source: data.api_source,
        terminal_id: data.terminal_id,
        merchant_commission: data.merchant_commission,
        installment: data.installment,
        discount: data.discount,
        is_void: data.is_void,
        is_refund: data.is_refund,
        data: data.data,
        is_hidden: data.is_hidden,
        payment_key_claims: null,
        error_code: data.error_code,
        error_message: data.error_message,
        is_live: data.is_live,
        other_endpoint_reference: data.other_endpoint_reference,
        refunded_amount_cents: data.refunded_amount_cents,
        source_id: data.source_id,
        is_captured: data.is_captured,
        captured_amount: data.captured_amount,
        merchant_staff_tag: data.merchant_staff_tag,
        updated_at: data.updated_at,
        is_settled: data.is_settled,
        bill_balanced: data.bill_balanced,
        is_bill: data.is_bill,
        owner: data.owner,
        parent_transaction: data.parent_transaction,
      };

      // Process transaction callback
      await paymobTransaction.processTransactionCallback(transaction);

      let message = `Transaction ${transaction.id} processed`;
      if (transaction.success) {
        message = `Transaction ${transaction.id} succeeded`;
      } else if (transaction.error_occured) {
        message = `Transaction ${transaction.id} failed: ${transaction.error_message}`;
      } else if (transaction.pending) {
        message = `Transaction ${transaction.id} is pending`;
      }

      return {
        handled: true,
        message,
      };
    } catch (error) {
      console.error('Failed to handle transaction event:', error);
      throw error;
    }
  }

  /**
   * Handle refund events
   */
  private async handleRefundEvent(data: PaymobWebhookPayload): Promise<WebhookHandlerResult> {
    try {
      // Convert webhook payload to refund format
      const refund = {
        id: data.id,
        amount_cents: data.refunded_amount_cents || data.amount_cents,
        created_at: data.created_at,
        transaction_id: data.parent_transaction?.id || data.id,
        order_id: data.order.id,
        refund_id: `ref_${data.id}`,
        success: data.success && data.is_refunded,
        error_message: data.error_message,
        error_code: data.error_code,
      };

      // Process refund callback
      await paymobRefund.processRefundCallback(refund);

      return {
        handled: true,
        message: `Refund ${refund.id} processed`,
      };
    } catch (error) {
      console.error('Failed to handle refund event:', error);
      throw error;
    }
  }

  /**
   * Handle order events
   */
  private async handleOrderEvent(data: PaymobWebhookPayload): Promise<WebhookHandlerResult> {
    try {
      // Process order status change
      await paymobOrder.handleOrderStatusChange(data.order);

      return {
        handled: true,
        message: `Order ${data.order.id} processed`,
      };
    } catch (error) {
      console.error('Failed to handle order event:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      const webhookSecret = config.payment.paymob.webhookSecret;
      if (!webhookSecret) {
        console.warn('Paymob webhook secret not configured, skipping signature verification');
        return true; // Allow webhook if no secret configured
      }

      // Paymob uses HMAC SHA512 for signature verification
      const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha512', webhookSecret)
        .update(payloadString)
        .digest('hex');

      // Compare signatures using constant-time comparison
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Alternative signature verification method used by Paymob
   */
  private verifyPaymobSignature(data: PaymobWebhookPayload, receivedSignature: string): boolean {
    try {
      const webhookSecret = config.payment.paymob.webhookSecret;
      if (!webhookSecret) {
        return true;
      }

      // Paymob may use specific fields for signature calculation
      const signatureData = [
        data.amount_cents,
        data.created_at,
        data.currency,
        data.error_occured,
        data.has_parent_transaction,
        data.id,
        data.integration_id,
        data.is_3d_secure,
        data.is_auth,
        data.is_capture,
        data.is_refunded,
        data.is_standalone_payment,
        data.is_voided,
        data.order.id,
        data.owner,
        data.pending,
        data.source_data.pan,
        data.source_data.sub_type,
        data.source_data.type,
        data.success,
      ].join('');

      const expectedSignature = crypto
        .createHmac('sha512', webhookSecret)
        .update(signatureData)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(receivedSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Paymob signature verification failed:', error);
      return false;
    }
  }

  /**
   * Check if event is a transaction event
   */
  private isTransactionEvent(data: PaymobWebhookPayload): boolean {
    // Most Paymob webhooks are transaction events
    return !!(data.id && (data.success !== undefined || data.pending !== undefined));
  }

  /**
   * Check if event is a refund event
   */
  private isRefundEvent(data: PaymobWebhookPayload): boolean {
    return !!(data.is_refunded && data.refunded_amount_cents > 0);
  }

  /**
   * Check if event is an order event
   */
  private isOrderEvent(data: PaymobWebhookPayload): boolean {
    return !!(data.order && !this.isTransactionEvent(data));
  }

  /**
   * Extract webhook metadata for logging
   */
  getWebhookMetadata(data: PaymobWebhookPayload): any {
    return {
      id: data.id,
      type: data.type || 'transaction',
      orderId: data.order?.id,
      merchantOrderId: data.order?.merchant_order_id,
      amount: data.amount_cents / 100,
      currency: data.currency,
      success: data.success,
      pending: data.pending,
      isRefunded: data.is_refunded,
      errorOccurred: data.error_occured,
      errorCode: data.error_code,
      errorMessage: data.error_message,
      integrationId: data.integration_id,
      isLive: data.is_live,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Validate webhook payload structure
   */
  validateWebhookPayload(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check required fields
    const requiredFields = ['id', 'amount_cents', 'currency'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        console.warn(`Missing required webhook field: ${field}`);
        return false;
      }
    }

    return true;
  }
}

// Export singleton instance
export const paymobWebhookHandler = new PaymobWebhookHandler();