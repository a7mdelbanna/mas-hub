import Stripe from 'stripe';
import { stripeClient } from './stripe-client';
import { db, COLLECTIONS, config } from '../../config/firebase';
import { Currency } from '../../../src/types/models';

export interface CreateCheckoutSessionData {
  invoiceId: string;
  accountId: string;
  amount: number;
  currency: Currency;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  paymentMethods?: string[];
  collectBillingAddress?: boolean;
  allowPromotionCodes?: boolean;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
  paymentLink: string;
}

/**
 * Stripe Checkout Session management
 * Handles hosted checkout page creation and management
 */
export class StripeCheckoutService {
  private client: Stripe;

  constructor() {
    this.client = stripeClient.getClient();
  }

  /**
   * Create checkout session for invoice payment
   */
  async createCheckoutSession(data: CreateCheckoutSessionData): Promise<CheckoutSessionResult> {
    try {
      // Get invoice details
      const invoiceDoc = await db.collection(COLLECTIONS.INVOICES).doc(data.invoiceId).get();
      if (!invoiceDoc.exists) {
        throw new Error('Invoice not found');
      }

      const invoice = invoiceDoc.data()!;

      // Prepare checkout session parameters
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'payment',
        payment_method_types: data.paymentMethods || ['card'],
        success_url: `${data.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: data.cancelUrl,
        client_reference_id: data.invoiceId,
        metadata: {
          invoiceId: data.invoiceId,
          accountId: data.accountId,
          invoiceNumber: invoice.invoiceNumber,
          source: 'mas_business_os',
        },
        line_items: [
          {
            price_data: {
              currency: data.currency.toLowerCase() as Stripe.Checkout.SessionCreateParams.LineItem.PriceData.Currency,
              product_data: {
                name: `Invoice ${invoice.invoiceNumber}`,
                description: `Payment for Invoice ${invoice.invoiceNumber}`,
                metadata: {
                  invoiceId: data.invoiceId,
                  invoiceNumber: invoice.invoiceNumber,
                },
              },
              unit_amount: Math.round(data.amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
        allow_promotion_codes: data.allowPromotionCodes || false,
      };

      // Add customer if provided
      if (data.customerId) {
        sessionParams.customer = data.customerId;
      } else if (invoice.client?.email) {
        sessionParams.customer_email = invoice.client.email;
      }

      // Configure billing address collection
      if (data.collectBillingAddress) {
        sessionParams.billing_address_collection = 'required';
      }

      // Add invoice details to line items
      if (invoice.lineItems && invoice.lineItems.length > 0) {
        sessionParams.line_items = invoice.lineItems.map((item: any) => ({
          price_data: {
            currency: data.currency.toLowerCase() as Stripe.Checkout.SessionCreateParams.LineItem.PriceData.Currency,
            product_data: {
              name: item.name,
              description: item.description,
            },
            unit_amount: Math.round(item.unitPrice * 100),
          },
          quantity: item.quantity,
        }));

        // Add tax if present
        if (invoice.tax > 0) {
          sessionParams.line_items.push({
            price_data: {
              currency: data.currency.toLowerCase() as Stripe.Checkout.SessionCreateParams.LineItem.PriceData.Currency,
              product_data: {
                name: 'Tax',
                description: 'Applicable taxes',
              },
              unit_amount: Math.round(invoice.tax * 100),
            },
            quantity: 1,
          });
        }

        // Add discount if present
        if (invoice.discount && invoice.discount > 0) {
          const discountAmount = invoice.discountType === 'percentage'
            ? (invoice.subtotal * invoice.discount / 100)
            : invoice.discount;

          sessionParams.discounts = [{
            coupon: await this.createDiscountCoupon(discountAmount, data.currency),
          }];
        }
      }

      // Create checkout session
      const session = await this.client.checkout.sessions.create(sessionParams);

      // Store checkout session reference
      await this.createCheckoutSessionRecord(session, data);

      return {
        sessionId: session.id,
        url: session.url!,
        paymentLink: session.url!,
      };
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  }

  /**
   * Retrieve checkout session
   */
  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
      return await this.client.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent', 'customer'],
      });
    } catch (error) {
      console.error('Failed to retrieve checkout session:', error);
      throw error;
    }
  }

  /**
   * List line items for checkout session
   */
  async getSessionLineItems(sessionId: string): Promise<Stripe.ApiList<Stripe.LineItem>> {
    try {
      return await this.client.checkout.sessions.listLineItems(sessionId);
    } catch (error) {
      console.error('Failed to retrieve session line items:', error);
      throw error;
    }
  }

  /**
   * Process completed checkout session
   */
  async processCompletedSession(session: Stripe.Checkout.Session): Promise<void> {
    try {
      const invoiceId = session.metadata?.invoiceId;
      if (!invoiceId) {
        console.warn('No invoice ID found in checkout session metadata');
        return;
      }

      // Update invoice status
      await this.updateInvoiceFromSession(invoiceId, session);

      // Create transaction record
      await this.createTransactionFromSession(session);

      // Update checkout session record
      await this.updateCheckoutSessionRecord(session);

      // Send confirmation notification
      await this.sendCheckoutConfirmation(session);
    } catch (error) {
      console.error('Failed to process completed checkout session:', error);
      throw error;
    }
  }

  /**
   * Create discount coupon for checkout
   */
  private async createDiscountCoupon(
    discountAmount: number,
    currency: Currency
  ): Promise<string> {
    const coupon = await this.client.coupons.create({
      amount_off: Math.round(discountAmount * 100), // Convert to cents
      currency: currency.toLowerCase() as Stripe.CouponCreateParams.Currency,
      duration: 'once',
      name: 'Invoice Discount',
    });

    return coupon.id;
  }

  /**
   * Create checkout session record in database
   */
  private async createCheckoutSessionRecord(
    session: Stripe.Checkout.Session,
    data: CreateCheckoutSessionData
  ): Promise<void> {
    await db.collection('checkoutSessions').doc(session.id).set({
      invoiceId: data.invoiceId,
      accountId: data.accountId,
      sessionId: session.id,
      amount: data.amount,
      currency: data.currency,
      status: session.status,
      url: session.url,
      paymentStatus: session.payment_status,
      customerId: data.customerId,
      expiresAt: new Date(session.expires_at * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Update checkout session record
   */
  private async updateCheckoutSessionRecord(session: Stripe.Checkout.Session): Promise<void> {
    const sessionRef = db.collection('checkoutSessions').doc(session.id);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      console.warn(`Checkout session record not found: ${session.id}`);
      return;
    }

    await sessionRef.update({
      status: session.status,
      paymentStatus: session.payment_status,
      paymentIntentId: session.payment_intent,
      updatedAt: new Date(),
    });
  }

  /**
   * Update invoice from completed session
   */
  private async updateInvoiceFromSession(
    invoiceId: string,
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const invoiceRef = db.collection(COLLECTIONS.INVOICES).doc(invoiceId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      console.warn(`Invoice not found: ${invoiceId}`);
      return;
    }

    const invoice = invoiceDoc.data()!;
    const paymentAmount = (session.amount_total || 0) / 100; // Convert from cents

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

    // Create payment record
    if (session.payment_intent) {
      await db.collection(COLLECTIONS.PAYMENTS).add({
        paymentNumber: `PAY-${Date.now()}`,
        invoiceId: invoiceId,
        accountId: session.metadata?.accountId,
        amount: paymentAmount,
        currency: invoice.currency,
        status: 'completed',
        method: 'stripe',
        paidAt: new Date(),
        reference: session.id,
        gatewayTransactionId: session.payment_intent,
        receiptUrl: session.success_url,
        gatewayResponse: {
          sessionId: session.id,
          status: session.status,
          paymentStatus: session.payment_status,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  /**
   * Create transaction record from session
   */
  private async createTransactionFromSession(session: Stripe.Checkout.Session): Promise<void> {
    await db.collection(COLLECTIONS.TRANSACTIONS).add({
      transactionNumber: `TXN-${Date.now()}`,
      type: 'income',
      amount: (session.amount_total || 0) / 100,
      currency: session.currency?.toUpperCase(),
      description: `Payment received via Stripe Checkout - ${session.metadata?.invoiceNumber}`,
      reference: session.id,
      date: new Date(),
      reconciled: true,
      reconciledAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Send checkout confirmation notification
   */
  private async sendCheckoutConfirmation(session: Stripe.Checkout.Session): Promise<void> {
    // This would integrate with notification service
    console.log(`Checkout confirmation sent for session: ${session.id}`);
  }
}

// Export singleton instance
export const stripeCheckout = new StripeCheckoutService();