import { paymobClient } from './paymob-client';
import { db, COLLECTIONS } from '../../config/firebase';
import { Currency, PaymentStatus } from '../../../src/types/models';

export interface CreateOrderData {
  amount: number;
  currency: Currency;
  invoiceId: string;
  accountId: string;
  description?: string;
  metadata?: Record<string, any>;
  items?: OrderItem[];
}

export interface OrderItem {
  name: string;
  description?: string;
  amount: number;
  quantity: number;
}

export interface BillingData {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  country?: string;
  state?: string;
  city?: string;
  postal_code?: string;
  street?: string;
  building?: string;
  floor?: string;
  apartment?: string;
}

export interface PaymobOrder {
  id: number;
  created_at: string;
  delivery_needed: boolean;
  merchant: any;
  collector: any;
  amount_cents: number;
  shipping_data: any;
  currency: string;
  is_payment_locked: boolean;
  is_return: boolean;
  is_cancel: boolean;
  is_returned: boolean;
  is_canceled: boolean;
  merchant_order_id: string;
  wallet_notification: any;
  paid_amount_cents: number;
  notify_user_with_email: boolean;
  items: any[];
  order_url: string;
  commission_fees: number;
  delivery_fees_cents: number;
  delivery_vat_cents: number;
  payment_method: string;
  merchant_staff_tag: string;
  api_source: string;
  data: any;
}

export interface OrderResult {
  order: PaymobOrder;
  orderId: number;
  status: PaymentStatus;
}

/**
 * Paymob Order management
 * Handles order creation and management for payment processing
 */
export class PaymobOrderService {
  /**
   * Create payment order
   */
  async createOrder(data: CreateOrderData): Promise<OrderResult> {
    try {
      // Validate configuration
      paymobClient.validateConfig();

      // Get invoice details
      const invoiceDoc = await db.collection(COLLECTIONS.INVOICES).doc(data.invoiceId).get();
      if (!invoiceDoc.exists) {
        throw new Error('Invoice not found');
      }

      const invoice = invoiceDoc.data()!;

      // Prepare order items
      const orderItems = this.prepareOrderItems(data, invoice);

      // Create order payload
      const orderPayload = {
        auth_token: await paymobClient.getAuthToken(),
        delivery_needed: false,
        amount_cents: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toUpperCase(),
        items: orderItems,
        merchant_order_id: data.invoiceId, // Use invoice ID as merchant order ID
        notify_user_with_email: true,
        data: {
          invoiceId: data.invoiceId,
          accountId: data.accountId,
          invoiceNumber: invoice.invoiceNumber,
          source: 'mas_business_os',
          ...data.metadata,
        },
      };

      // Make API request to create order
      const order = await paymobClient.makeRequest<PaymobOrder>(
        'POST',
        '/ecommerce/orders',
        orderPayload
      );

      // Store order reference in database
      await this.storeOrderReference(order, data);

      return {
        order,
        orderId: order.id,
        status: this.mapOrderStatus(order),
      };
    } catch (error) {
      console.error('Failed to create Paymob order:', error);
      throw error;
    }
  }

  /**
   * Retrieve order by ID
   */
  async getOrder(orderId: number): Promise<PaymobOrder> {
    try {
      const authToken = await paymobClient.getAuthToken();
      return await paymobClient.makeRequest<PaymobOrder>(
        'GET',
        `/ecommerce/orders/${orderId}?auth_token=${authToken}`
      );
    } catch (error) {
      console.error('Failed to retrieve Paymob order:', error);
      throw error;
    }
  }

  /**
   * Update order
   */
  async updateOrder(orderId: number, updates: Partial<PaymobOrder>): Promise<PaymobOrder> {
    try {
      const updatePayload = {
        auth_token: await paymobClient.getAuthToken(),
        ...updates,
      };

      return await paymobClient.makeRequest<PaymobOrder>(
        'PUT',
        `/ecommerce/orders/${orderId}`,
        updatePayload
      );
    } catch (error) {
      console.error('Failed to update Paymob order:', error);
      throw error;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: number): Promise<PaymobOrder> {
    try {
      const authToken = await paymobClient.getAuthToken();

      const cancelPayload = {
        auth_token: authToken,
      };

      const canceledOrder = await paymobClient.makeRequest<PaymobOrder>(
        'PUT',
        `/ecommerce/orders/${orderId}/cancel`,
        cancelPayload
      );

      // Update order reference
      await this.updateOrderReference(canceledOrder);

      return canceledOrder;
    } catch (error) {
      console.error('Failed to cancel Paymob order:', error);
      throw error;
    }
  }

  /**
   * Process completed order
   */
  async processCompletedOrder(order: PaymobOrder): Promise<void> {
    try {
      const invoiceId = order.data?.invoiceId || order.merchant_order_id;
      if (!invoiceId) {
        console.warn('No invoice ID found in order data');
        return;
      }

      // Update invoice status
      await this.updateInvoiceFromOrder(invoiceId, order);

      // Create payment record
      await this.createPaymentRecord(order);

      // Create transaction record
      await this.createTransactionRecord(order);

      // Update order reference
      await this.updateOrderReference(order);

      // Send confirmation notification
      await this.sendOrderConfirmation(order);
    } catch (error) {
      console.error('Failed to process completed order:', error);
      throw error;
    }
  }

  /**
   * Handle order status change
   */
  async handleOrderStatusChange(order: PaymobOrder): Promise<void> {
    try {
      // Update order reference
      await this.updateOrderReference(order);

      // Process based on status
      if (this.isOrderCompleted(order)) {
        await this.processCompletedOrder(order);
      }

      // Send status change notification
      await this.sendOrderStatusNotification(order);
    } catch (error) {
      console.error('Failed to handle order status change:', error);
      throw error;
    }
  }

  /**
   * Prepare order items from invoice data
   */
  private prepareOrderItems(data: CreateOrderData, invoice: any): any[] {
    // If custom items provided, use them
    if (data.items && data.items.length > 0) {
      return data.items.map(item => ({
        name: item.name,
        description: item.description || '',
        amount_cents: Math.round(item.amount * 100),
        quantity: item.quantity,
      }));
    }

    // Otherwise, use invoice line items
    if (invoice.lineItems && invoice.lineItems.length > 0) {
      return invoice.lineItems.map((item: any) => ({
        name: item.name,
        description: item.description || '',
        amount_cents: Math.round(item.unitPrice * 100),
        quantity: item.quantity,
      }));
    }

    // Fallback to single item
    return [
      {
        name: `Invoice ${invoice.invoiceNumber}`,
        description: data.description || `Payment for Invoice ${invoice.invoiceNumber}`,
        amount_cents: Math.round(data.amount * 100),
        quantity: 1,
      },
    ];
  }

  /**
   * Store order reference in database
   */
  private async storeOrderReference(order: PaymobOrder, data: CreateOrderData): Promise<void> {
    try {
      await db.collection('paymobOrders').doc(order.id.toString()).set({
        orderId: order.id,
        invoiceId: data.invoiceId,
        accountId: data.accountId,
        merchantOrderId: order.merchant_order_id,
        amount: data.amount,
        currency: data.currency,
        amountCents: order.amount_cents,
        status: this.mapOrderStatus(order),
        isPaymentLocked: order.is_payment_locked,
        isReturn: order.is_return,
        isCancel: order.is_cancel,
        isReturned: order.is_returned,
        isCanceled: order.is_canceled,
        paidAmountCents: order.paid_amount_cents,
        orderUrl: order.order_url,
        paymentMethod: order.payment_method,
        data: order.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to store order reference:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Update order reference in database
   */
  private async updateOrderReference(order: PaymobOrder): Promise<void> {
    try {
      const orderRef = db.collection('paymobOrders').doc(order.id.toString());
      await orderRef.update({
        status: this.mapOrderStatus(order),
        isPaymentLocked: order.is_payment_locked,
        isReturn: order.is_return,
        isCancel: order.is_cancel,
        isReturned: order.is_returned,
        isCanceled: order.is_canceled,
        paidAmountCents: order.paid_amount_cents,
        paymentMethod: order.payment_method,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to update order reference:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Update invoice from completed order
   */
  private async updateInvoiceFromOrder(invoiceId: string, order: PaymobOrder): Promise<void> {
    const invoiceRef = db.collection(COLLECTIONS.INVOICES).doc(invoiceId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      console.warn(`Invoice not found: ${invoiceId}`);
      return;
    }

    const invoice = invoiceDoc.data()!;
    const paymentAmount = order.paid_amount_cents / 100; // Convert from cents

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
  private async createPaymentRecord(order: PaymobOrder): Promise<void> {
    await db.collection(COLLECTIONS.PAYMENTS).add({
      paymentNumber: `PAY-PMB-${Date.now()}`,
      invoiceId: order.data?.invoiceId || order.merchant_order_id,
      accountId: order.data?.accountId,
      amount: order.paid_amount_cents / 100,
      currency: order.currency,
      status: 'completed',
      method: 'paymob',
      paidAt: new Date(),
      reference: order.id.toString(),
      gatewayTransactionId: order.id.toString(),
      receiptUrl: order.order_url,
      gatewayResponse: {
        orderId: order.id,
        merchantOrderId: order.merchant_order_id,
        paymentMethod: order.payment_method,
        commissionFees: order.commission_fees,
      },
      notes: `Paymob payment for order #${order.id}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Create transaction record
   */
  private async createTransactionRecord(order: PaymobOrder): Promise<void> {
    await db.collection(COLLECTIONS.TRANSACTIONS).add({
      transactionNumber: `TXN-PMB-${Date.now()}`,
      type: 'income',
      amount: order.paid_amount_cents / 100,
      currency: order.currency,
      description: `Payment received via Paymob - Order #${order.id}`,
      reference: order.id.toString(),
      date: new Date(),
      reconciled: true,
      reconciledAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Send order confirmation notification
   */
  private async sendOrderConfirmation(order: PaymobOrder): Promise<void> {
    // This would integrate with notification service
    console.log(`Order confirmation sent for Paymob order: ${order.id}`);
  }

  /**
   * Send order status notification
   */
  private async sendOrderStatusNotification(order: PaymobOrder): Promise<void> {
    // This would integrate with notification service
    console.log(`Order status notification sent for Paymob order: ${order.id}`);
  }

  /**
   * Check if order is completed
   */
  private isOrderCompleted(order: PaymobOrder): boolean {
    return order.paid_amount_cents > 0 && !order.is_canceled && !order.is_returned;
  }

  /**
   * Map Paymob order status to internal payment status
   */
  private mapOrderStatus(order: PaymobOrder): PaymentStatus {
    if (order.is_canceled) {
      return PaymentStatus.FAILED;
    }

    if (order.is_returned) {
      return PaymentStatus.REFUNDED;
    }

    if (order.paid_amount_cents > 0) {
      if (order.paid_amount_cents >= order.amount_cents) {
        return PaymentStatus.COMPLETED;
      } else {
        return PaymentStatus.PROCESSING; // Partial payment
      }
    }

    return PaymentStatus.PENDING;
  }
}

// Export singleton instance
export const paymobOrder = new PaymobOrderService();