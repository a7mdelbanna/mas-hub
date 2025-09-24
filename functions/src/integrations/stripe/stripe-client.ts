import Stripe from 'stripe';
import { config } from '../../config/firebase';

/**
 * Stripe SDK initialization and client configuration
 * Provides centralized access to Stripe API with proper error handling
 */
class StripeClientService {
  private client: Stripe | null = null;

  /**
   * Get initialized Stripe client
   */
  public getClient(): Stripe {
    if (!this.client) {
      const secretKey = config.payment.stripe.secretKey;

      if (!secretKey) {
        throw new Error('Stripe secret key not configured');
      }

      this.client = new Stripe(secretKey, {
        apiVersion: '2024-06-20',
        typescript: true,
        timeout: 30000, // 30 seconds
        maxNetworkRetries: 3,
      });
    }

    return this.client;
  }

  /**
   * Test Stripe connection and credentials
   */
  public async testConnection(): Promise<boolean> {
    try {
      const client = this.getClient();
      await client.accounts.retrieve();
      return true;
    } catch (error) {
      console.error('Stripe connection test failed:', error);
      return false;
    }
  }

  /**
   * Get Stripe account information
   */
  public async getAccountInfo(): Promise<Stripe.Account | null> {
    try {
      const client = this.getClient();
      return await client.accounts.retrieve();
    } catch (error) {
      console.error('Failed to retrieve Stripe account info:', error);
      return null;
    }
  }

  /**
   * Handle Stripe webhook signature verification
   */
  public constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret?: string
  ): Stripe.Event {
    const client = this.getClient();
    const secret = webhookSecret || config.payment.stripe.webhookSecret;

    if (!secret) {
      throw new Error('Stripe webhook secret not configured');
    }

    try {
      return client.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }
}

// Export singleton instance
export const stripeClient = new StripeClientService();
export default stripeClient;