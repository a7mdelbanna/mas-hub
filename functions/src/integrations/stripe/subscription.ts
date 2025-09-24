import Stripe from 'stripe';
import { stripeClient } from './stripe-client';
import { db, COLLECTIONS } from '../../config/firebase';
import { Currency } from '../../../src/types/models';

export interface CreateSubscriptionData {
  customerId: string;
  priceId: string;
  contractId: string;
  accountId: string;
  trialPeriodDays?: number;
  prorationBehavior?: 'create_prorations' | 'none';
  paymentBehavior?: 'allow_incomplete' | 'default_incomplete' | 'error_if_incomplete';
  metadata?: Record<string, string>;
}

export interface SubscriptionPlan {
  name: string;
  amount: number;
  currency: Currency;
  interval: 'month' | 'year';
  intervalCount?: number;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

/**
 * Stripe Subscription management
 * Handles recurring payment subscriptions for contracts
 */
export class StripeSubscriptionService {
  private client: Stripe;

  constructor() {
    this.client = stripeClient.getClient();
  }

  /**
   * Create product for subscription plans
   */
  async createProduct(name: string, description?: string): Promise<Stripe.Product> {
    try {
      return await this.client.products.create({
        name,
        description,
        metadata: {
          source: 'mas_business_os',
        },
      });
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }

  /**
   * Create price for product
   */
  async createPrice(plan: SubscriptionPlan, productId: string): Promise<Stripe.Price> {
    try {
      return await this.client.prices.create({
        product: productId,
        unit_amount: Math.round(plan.amount * 100), // Convert to cents
        currency: plan.currency.toLowerCase() as Stripe.PriceCreateParams.Currency,
        recurring: {
          interval: plan.interval,
          interval_count: plan.intervalCount || 1,
          trial_period_days: plan.trialPeriodDays,
        },
        metadata: {
          source: 'mas_business_os',
          ...plan.metadata,
        },
      });
    } catch (error) {
      console.error('Failed to create price:', error);
      throw error;
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(data: CreateSubscriptionData): Promise<Stripe.Subscription> {
    try {
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: data.customerId,
        items: [{ price: data.priceId }],
        payment_behavior: data.paymentBehavior || 'default_incomplete',
        proration_behavior: data.prorationBehavior || 'create_prorations',
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          contractId: data.contractId,
          accountId: data.accountId,
          source: 'mas_business_os',
          ...data.metadata,
        },
      };

      if (data.trialPeriodDays) {
        subscriptionParams.trial_period_days = data.trialPeriodDays;
      }

      const subscription = await this.client.subscriptions.create(subscriptionParams);

      // Store subscription reference
      await this.storeSubscriptionReference(subscription, data);

      return subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  /**
   * Retrieve subscription
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.client.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price.product', 'latest_invoice', 'customer'],
      });
    } catch (error) {
      console.error('Failed to retrieve subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    updates: Stripe.SubscriptionUpdateParams
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.client.subscriptions.update(subscriptionId, {
        ...updates,
        proration_behavior: 'create_prorations',
      });

      // Update subscription reference
      await this.updateSubscriptionReference(subscription);

      return subscription;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    immediate: boolean = false
  ): Promise<Stripe.Subscription> {
    try {
      let subscription: Stripe.Subscription;

      if (immediate) {
        subscription = await this.client.subscriptions.cancel(subscriptionId);
      } else {
        subscription = await this.client.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }

      // Update subscription reference
      await this.updateSubscriptionReference(subscription);

      // Update contract status
      await this.updateContractFromSubscription(subscription);

      return subscription;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  /**
   * Resume cancelled subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.client.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      // Update subscription reference
      await this.updateSubscriptionReference(subscription);

      return subscription;
    } catch (error) {
      console.error('Failed to resume subscription:', error);
      throw error;
    }
  }

  /**
   * Change subscription plan
   */
  async changeSubscriptionPlan(
    subscriptionId: string,
    newPriceId: string,
    prorationBehavior: 'create_prorations' | 'none' = 'create_prorations'
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      const currentItem = subscription.items.data[0];

      const updatedSubscription = await this.client.subscriptions.update(subscriptionId, {
        items: [{
          id: currentItem.id,
          price: newPriceId,
        }],
        proration_behavior: prorationBehavior,
      });

      // Update subscription reference
      await this.updateSubscriptionReference(updatedSubscription);

      return updatedSubscription;
    } catch (error) {
      console.error('Failed to change subscription plan:', error);
      throw error;
    }
  }

  /**
   * Get subscription usage
   */
  async getSubscriptionUsage(subscriptionId: string): Promise<any> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      const usageRecords = await this.client.subscriptionItems.listUsageRecordSummaries(
        subscription.items.data[0].id
      );

      return {
        subscription,
        usage: usageRecords.data,
      };
    } catch (error) {
      console.error('Failed to get subscription usage:', error);
      throw error;
    }
  }

  /**
   * Process subscription invoice payment
   */
  async processSubscriptionInvoice(invoice: Stripe.Invoice): Promise<void> {
    try {
      const subscriptionId = invoice.subscription as string;
      if (!subscriptionId) {
        console.warn('No subscription ID found in invoice');
        return;
      }

      const subscription = await this.getSubscription(subscriptionId);
      const contractId = subscription.metadata.contractId;

      if (!contractId) {
        console.warn('No contract ID found in subscription metadata');
        return;
      }

      // Create payment record
      await this.createSubscriptionPaymentRecord(invoice, subscription);

      // Update contract status if needed
      await this.updateContractFromInvoice(contractId, invoice);

      // Send payment notification
      await this.sendSubscriptionPaymentNotification(invoice, subscription);
    } catch (error) {
      console.error('Failed to process subscription invoice:', error);
      throw error;
    }
  }

  /**
   * Handle subscription status change
   */
  async handleSubscriptionStatusChange(subscription: Stripe.Subscription): Promise<void> {
    try {
      const contractId = subscription.metadata.contractId;
      if (!contractId) {
        console.warn('No contract ID found in subscription metadata');
        return;
      }

      // Update contract status based on subscription status
      await this.updateContractFromSubscription(subscription);

      // Update subscription reference
      await this.updateSubscriptionReference(subscription);

      // Send status change notification
      await this.sendSubscriptionStatusNotification(subscription);
    } catch (error) {
      console.error('Failed to handle subscription status change:', error);
      throw error;
    }
  }

  /**
   * Store subscription reference in database
   */
  private async storeSubscriptionReference(
    subscription: Stripe.Subscription,
    data: CreateSubscriptionData
  ): Promise<void> {
    try {
      await db.collection('subscriptions').doc(subscription.id).set({
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        contractId: data.contractId,
        accountId: data.accountId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        metadata: subscription.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to store subscription reference:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Update subscription reference in database
   */
  private async updateSubscriptionReference(subscription: Stripe.Subscription): Promise<void> {
    try {
      const subscriptionRef = db.collection('subscriptions').doc(subscription.id);
      await subscriptionRef.update({
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to update subscription reference:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Create payment record for subscription invoice
   */
  private async createSubscriptionPaymentRecord(
    invoice: Stripe.Invoice,
    subscription: Stripe.Subscription
  ): Promise<void> {
    if (invoice.status !== 'paid') return;

    await db.collection(COLLECTIONS.PAYMENTS).add({
      paymentNumber: `PAY-SUB-${Date.now()}`,
      accountId: subscription.metadata.accountId,
      contractId: subscription.metadata.contractId,
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency?.toUpperCase(),
      status: 'completed',
      method: 'stripe',
      paidAt: new Date(),
      reference: invoice.id,
      gatewayTransactionId: invoice.payment_intent as string,
      gatewayResponse: {
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        status: invoice.status,
      },
      notes: `Subscription payment for period ${new Date(subscription.current_period_start * 1000).toDateString()} - ${new Date(subscription.current_period_end * 1000).toDateString()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Update contract based on subscription
   */
  private async updateContractFromSubscription(subscription: Stripe.Subscription): Promise<void> {
    const contractId = subscription.metadata.contractId;
    if (!contractId) return;

    const statusMap: Record<string, string> = {
      active: 'active',
      past_due: 'active',
      unpaid: 'active',
      canceled: 'terminated',
      incomplete: 'draft',
      incomplete_expired: 'expired',
      trialing: 'active',
    };

    const contractRef = db.collection(COLLECTIONS.CONTRACTS).doc(contractId);
    await contractRef.update({
      status: statusMap[subscription.status] || 'active',
      updatedAt: new Date(),
    });
  }

  /**
   * Update contract based on invoice
   */
  private async updateContractFromInvoice(contractId: string, invoice: Stripe.Invoice): Promise<void> {
    if (invoice.status === 'paid') {
      // Contract remains active on successful payment
      const contractRef = db.collection(COLLECTIONS.CONTRACTS).doc(contractId);
      await contractRef.update({
        status: 'active',
        updatedAt: new Date(),
      });
    }
  }

  /**
   * Send subscription payment notification
   */
  private async sendSubscriptionPaymentNotification(
    invoice: Stripe.Invoice,
    subscription: Stripe.Subscription
  ): Promise<void> {
    // This would integrate with notification service
    console.log(`Subscription payment notification sent for invoice: ${invoice.id}`);
  }

  /**
   * Send subscription status notification
   */
  private async sendSubscriptionStatusNotification(subscription: Stripe.Subscription): Promise<void> {
    // This would integrate with notification service
    console.log(`Subscription status notification sent for subscription: ${subscription.id}`);
  }
}

// Export singleton instance
export const stripeSubscription = new StripeSubscriptionService();