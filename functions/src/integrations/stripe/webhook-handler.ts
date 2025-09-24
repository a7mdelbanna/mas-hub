import Stripe from 'stripe';
import { stripeClient } from './stripe-client';
import { stripePaymentIntent } from './payment-intent';
import { stripeCheckout } from './checkout-session';
import { stripeSubscription } from './subscription';
import { stripeRefund } from './refund';

export interface WebhookHandlerResult {
  handled: boolean;
  message: string;
  eventType: string;
}

/**
 * Stripe Webhook Handler
 * Handles all Stripe webhook events and routes them to appropriate services
 */
export class StripeWebhookHandler {
  private client: Stripe;

  constructor() {
    this.client = stripeClient.getClient();
  }

  /**
   * Handle Stripe webhook event
   */
  async handleWebhook(
    payload: string | Buffer,
    signature: string,
    webhookSecret?: string
  ): Promise<WebhookHandlerResult> {
    try {
      // Verify webhook signature and construct event
      const event = stripeClient.constructWebhookEvent(payload, signature, webhookSecret);

      console.log(`Processing Stripe webhook: ${event.type} (${event.id})`);

      // Route event to appropriate handler
      const result = await this.routeWebhookEvent(event);

      console.log(`Stripe webhook processed: ${event.type} - ${result.message}`);

      return {
        handled: result.handled,
        message: result.message,
        eventType: event.type,
      };
    } catch (error) {
      console.error('Stripe webhook handling failed:', error);
      throw error;
    }
  }

  /**
   * Route webhook event to appropriate handler
   */
  private async routeWebhookEvent(event: Stripe.Event): Promise<WebhookHandlerResult> {
    try {
      switch (event.type) {
        // Payment Intent events
        case 'payment_intent.succeeded':
          return await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);

        case 'payment_intent.payment_failed':
          return await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);

        case 'payment_intent.canceled':
          return await this.handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);

        case 'payment_intent.requires_action':
          return await this.handlePaymentIntentRequiresAction(event.data.object as Stripe.PaymentIntent);

        // Checkout Session events
        case 'checkout.session.completed':
          return await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);

        case 'checkout.session.expired':
          return await this.handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);

        // Invoice events
        case 'invoice.paid':
          return await this.handleInvoicePaid(event.data.object as Stripe.Invoice);

        case 'invoice.payment_failed':
          return await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);

        case 'invoice.finalized':
          return await this.handleInvoiceFinalized(event.data.object as Stripe.Invoice);

        // Subscription events
        case 'customer.subscription.created':
          return await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);

        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);

        case 'customer.subscription.deleted':
          return await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);

        case 'customer.subscription.trial_will_end':
          return await this.handleSubscriptionTrialWillEnd(event.data.object as Stripe.Subscription);

        // Charge events
        case 'charge.succeeded':
          return await this.handleChargeSucceeded(event.data.object as Stripe.Charge);

        case 'charge.failed':
          return await this.handleChargeFailed(event.data.object as Stripe.Charge);

        case 'charge.dispute.created':
          return await this.handleChargeDisputeCreated(event.data.object as Stripe.Dispute);

        // Refund events
        case 'charge.refund.updated':
          return await this.handleRefundUpdated(event.data.object as Stripe.Refund);

        // Customer events
        case 'customer.created':
          return await this.handleCustomerCreated(event.data.object as Stripe.Customer);

        case 'customer.updated':
          return await this.handleCustomerUpdated(event.data.object as Stripe.Customer);

        case 'customer.deleted':
          return await this.handleCustomerDeleted(event.data.object as Stripe.DeletedCustomer);

        // Payment Method events
        case 'payment_method.attached':
          return await this.handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);

        case 'payment_method.detached':
          return await this.handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod);

        // Review events
        case 'review.opened':
          return await this.handleReviewOpened(event.data.object as Stripe.Review);

        case 'review.closed':
          return await this.handleReviewClosed(event.data.object as Stripe.Review);

        default:
          return {
            handled: false,
            message: `Unhandled webhook event type: ${event.type}`,
          };
      }
    } catch (error) {
      console.error(`Error handling webhook event ${event.type}:`, error);
      throw error;
    }
  }

  // Payment Intent Handlers

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<WebhookHandlerResult> {
    await stripePaymentIntent.processSuccessfulPayment(paymentIntent);
    return {
      handled: true,
      message: `Payment intent ${paymentIntent.id} succeeded`,
    };
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<WebhookHandlerResult> {
    await stripePaymentIntent.processFailedPayment(paymentIntent);
    return {
      handled: true,
      message: `Payment intent ${paymentIntent.id} failed`,
    };
  }

  private async handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<WebhookHandlerResult> {
    // Handle payment intent cancellation
    console.log(`Payment intent canceled: ${paymentIntent.id}`);
    return {
      handled: true,
      message: `Payment intent ${paymentIntent.id} canceled`,
    };
  }

  private async handlePaymentIntentRequiresAction(paymentIntent: Stripe.PaymentIntent): Promise<WebhookHandlerResult> {
    // Handle payment intent requiring action (3D Secure, etc.)
    console.log(`Payment intent requires action: ${paymentIntent.id}`);
    return {
      handled: true,
      message: `Payment intent ${paymentIntent.id} requires action`,
    };
  }

  // Checkout Session Handlers

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<WebhookHandlerResult> {
    await stripeCheckout.processCompletedSession(session);
    return {
      handled: true,
      message: `Checkout session ${session.id} completed`,
    };
  }

  private async handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<WebhookHandlerResult> {
    console.log(`Checkout session expired: ${session.id}`);
    return {
      handled: true,
      message: `Checkout session ${session.id} expired`,
    };
  }

  // Invoice Handlers

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<WebhookHandlerResult> {
    if (invoice.subscription) {
      await stripeSubscription.processSubscriptionInvoice(invoice);
    }
    return {
      handled: true,
      message: `Invoice ${invoice.id} paid`,
    };
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<WebhookHandlerResult> {
    console.log(`Invoice payment failed: ${invoice.id}`);
    // Handle failed invoice payment (send notifications, retry logic, etc.)
    return {
      handled: true,
      message: `Invoice ${invoice.id} payment failed`,
    };
  }

  private async handleInvoiceFinalized(invoice: Stripe.Invoice): Promise<WebhookHandlerResult> {
    console.log(`Invoice finalized: ${invoice.id}`);
    return {
      handled: true,
      message: `Invoice ${invoice.id} finalized`,
    };
  }

  // Subscription Handlers

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<WebhookHandlerResult> {
    await stripeSubscription.handleSubscriptionStatusChange(subscription);
    return {
      handled: true,
      message: `Subscription ${subscription.id} created`,
    };
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<WebhookHandlerResult> {
    await stripeSubscription.handleSubscriptionStatusChange(subscription);
    return {
      handled: true,
      message: `Subscription ${subscription.id} updated`,
    };
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<WebhookHandlerResult> {
    await stripeSubscription.handleSubscriptionStatusChange(subscription);
    return {
      handled: true,
      message: `Subscription ${subscription.id} deleted`,
    };
  }

  private async handleSubscriptionTrialWillEnd(subscription: Stripe.Subscription): Promise<WebhookHandlerResult> {
    console.log(`Subscription trial will end: ${subscription.id}`);
    // Send trial ending notification
    return {
      handled: true,
      message: `Subscription ${subscription.id} trial will end`,
    };
  }

  // Charge Handlers

  private async handleChargeSucceeded(charge: Stripe.Charge): Promise<WebhookHandlerResult> {
    console.log(`Charge succeeded: ${charge.id}`);
    return {
      handled: true,
      message: `Charge ${charge.id} succeeded`,
    };
  }

  private async handleChargeFailed(charge: Stripe.Charge): Promise<WebhookHandlerResult> {
    console.log(`Charge failed: ${charge.id}`);
    return {
      handled: true,
      message: `Charge ${charge.id} failed`,
    };
  }

  private async handleChargeDisputeCreated(dispute: Stripe.Dispute): Promise<WebhookHandlerResult> {
    console.log(`Charge dispute created: ${dispute.id} for charge ${dispute.charge}`);
    // Handle dispute creation (notifications, evidence collection, etc.)
    return {
      handled: true,
      message: `Dispute ${dispute.id} created`,
    };
  }

  // Refund Handlers

  private async handleRefundUpdated(refund: Stripe.Refund): Promise<WebhookHandlerResult> {
    await stripeRefund.handleRefundWebhook(refund);
    return {
      handled: true,
      message: `Refund ${refund.id} updated`,
    };
  }

  // Customer Handlers

  private async handleCustomerCreated(customer: Stripe.Customer): Promise<WebhookHandlerResult> {
    console.log(`Customer created: ${customer.id}`);
    return {
      handled: true,
      message: `Customer ${customer.id} created`,
    };
  }

  private async handleCustomerUpdated(customer: Stripe.Customer): Promise<WebhookHandlerResult> {
    console.log(`Customer updated: ${customer.id}`);
    return {
      handled: true,
      message: `Customer ${customer.id} updated`,
    };
  }

  private async handleCustomerDeleted(customer: Stripe.DeletedCustomer): Promise<WebhookHandlerResult> {
    console.log(`Customer deleted: ${customer.id}`);
    return {
      handled: true,
      message: `Customer ${customer.id} deleted`,
    };
  }

  // Payment Method Handlers

  private async handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<WebhookHandlerResult> {
    console.log(`Payment method attached: ${paymentMethod.id} to customer ${paymentMethod.customer}`);
    return {
      handled: true,
      message: `Payment method ${paymentMethod.id} attached`,
    };
  }

  private async handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod): Promise<WebhookHandlerResult> {
    console.log(`Payment method detached: ${paymentMethod.id}`);
    return {
      handled: true,
      message: `Payment method ${paymentMethod.id} detached`,
    };
  }

  // Review Handlers

  private async handleReviewOpened(review: Stripe.Review): Promise<WebhookHandlerResult> {
    console.log(`Review opened: ${review.id} for charge ${review.charge}`);
    // Handle review opened (fraud detection, manual review, etc.)
    return {
      handled: true,
      message: `Review ${review.id} opened`,
    };
  }

  private async handleReviewClosed(review: Stripe.Review): Promise<WebhookHandlerResult> {
    console.log(`Review closed: ${review.id} with reason ${review.reason}`);
    return {
      handled: true,
      message: `Review ${review.id} closed`,
    };
  }
}

// Export singleton instance
export const stripeWebhookHandler = new StripeWebhookHandler();