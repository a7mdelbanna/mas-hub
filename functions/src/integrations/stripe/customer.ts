import Stripe from 'stripe';
import { stripeClient } from './stripe-client';
import { db, COLLECTIONS } from '../../config/firebase';

export interface CreateStripeCustomerData {
  email: string;
  name?: string;
  phone?: string;
  description?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  metadata?: Record<string, string>;
}

export interface UpdateStripeCustomerData extends Partial<CreateStripeCustomerData> {
  customerId: string;
}

/**
 * Stripe Customer management
 * Handles customer creation, updates, and payment method management
 */
export class StripeCustomerService {
  private client: Stripe;

  constructor() {
    this.client = stripeClient.getClient();
  }

  /**
   * Create Stripe customer
   */
  async createCustomer(data: CreateStripeCustomerData): Promise<Stripe.Customer> {
    try {
      // Check if customer already exists
      const existingCustomer = await this.findCustomerByEmail(data.email);
      if (existingCustomer) {
        return existingCustomer;
      }

      const customerParams: Stripe.CustomerCreateParams = {
        email: data.email,
        name: data.name,
        phone: data.phone,
        description: data.description,
        metadata: {
          source: 'mas_business_os',
          ...data.metadata,
        },
      };

      if (data.address) {
        customerParams.address = data.address;
      }

      const customer = await this.client.customers.create(customerParams);

      // Store customer reference in our database
      await this.storeCustomerReference(customer);

      return customer;
    } catch (error) {
      console.error('Failed to create Stripe customer:', error);
      throw error;
    }
  }

  /**
   * Update Stripe customer
   */
  async updateCustomer(data: UpdateStripeCustomerData): Promise<Stripe.Customer> {
    try {
      const updateParams: Stripe.CustomerUpdateParams = {};

      if (data.email) updateParams.email = data.email;
      if (data.name) updateParams.name = data.name;
      if (data.phone) updateParams.phone = data.phone;
      if (data.description) updateParams.description = data.description;
      if (data.address) updateParams.address = data.address;
      if (data.metadata) updateParams.metadata = data.metadata;

      const customer = await this.client.customers.update(data.customerId, updateParams);

      // Update customer reference in our database
      await this.updateCustomerReference(customer);

      return customer;
    } catch (error) {
      console.error('Failed to update Stripe customer:', error);
      throw error;
    }
  }

  /**
   * Retrieve Stripe customer
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await this.client.customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      console.error('Failed to retrieve Stripe customer:', error);
      return null;
    }
  }

  /**
   * Find customer by email
   */
  async findCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
    try {
      const customers = await this.client.customers.list({
        email: email,
        limit: 1,
      });

      return customers.data.length > 0 ? customers.data[0] : null;
    } catch (error) {
      console.error('Failed to find customer by email:', error);
      return null;
    }
  }

  /**
   * Delete Stripe customer
   */
  async deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
    try {
      const deletedCustomer = await this.client.customers.del(customerId);

      // Remove customer reference from our database
      await this.removeCustomerReference(customerId);

      return deletedCustomer;
    } catch (error) {
      console.error('Failed to delete Stripe customer:', error);
      throw error;
    }
  }

  /**
   * List customer payment methods
   */
  async listPaymentMethods(
    customerId: string,
    type?: Stripe.PaymentMethodListParams.Type
  ): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
    try {
      return await this.client.paymentMethods.list({
        customer: customerId,
        type: type || 'card',
      });
    } catch (error) {
      console.error('Failed to list payment methods:', error);
      throw error;
    }
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    try {
      return await this.client.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      console.error('Failed to attach payment method:', error);
      throw error;
    }
  }

  /**
   * Detach payment method from customer
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.client.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      console.error('Failed to detach payment method:', error);
      throw error;
    }
  }

  /**
   * Create setup intent for saving payment method
   */
  async createSetupIntent(
    customerId: string,
    paymentMethodTypes: string[] = ['card']
  ): Promise<Stripe.SetupIntent> {
    try {
      return await this.client.setupIntents.create({
        customer: customerId,
        payment_method_types: paymentMethodTypes,
        usage: 'off_session',
      });
    } catch (error) {
      console.error('Failed to create setup intent:', error);
      throw error;
    }
  }

  /**
   * Get customer's default payment method
   */
  async getDefaultPaymentMethod(customerId: string): Promise<Stripe.PaymentMethod | null> {
    try {
      const customer = await this.getCustomer(customerId);
      if (!customer || !customer.invoice_settings?.default_payment_method) {
        return null;
      }

      const paymentMethod = await this.client.paymentMethods.retrieve(
        customer.invoice_settings.default_payment_method as string
      );

      return paymentMethod;
    } catch (error) {
      console.error('Failed to get default payment method:', error);
      return null;
    }
  }

  /**
   * Set default payment method for customer
   */
  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.Customer> {
    try {
      return await this.client.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      throw error;
    }
  }

  /**
   * Store customer reference in database
   */
  private async storeCustomerReference(customer: Stripe.Customer): Promise<void> {
    try {
      await db.collection('stripeCustomers').doc(customer.id).set({
        customerId: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        created: new Date(customer.created * 1000),
        livemode: customer.livemode,
        metadata: customer.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to store customer reference:', error);
      // Don't throw error as this is not critical for customer creation
    }
  }

  /**
   * Update customer reference in database
   */
  private async updateCustomerReference(customer: Stripe.Customer): Promise<void> {
    try {
      const customerRef = db.collection('stripeCustomers').doc(customer.id);
      await customerRef.update({
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        metadata: customer.metadata,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to update customer reference:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Remove customer reference from database
   */
  private async removeCustomerReference(customerId: string): Promise<void> {
    try {
      await db.collection('stripeCustomers').doc(customerId).delete();
    } catch (error) {
      console.error('Failed to remove customer reference:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Get or create customer for account
   */
  async getOrCreateCustomerForAccount(accountId: string): Promise<Stripe.Customer> {
    try {
      // Check if we already have a Stripe customer for this account
      const accountDoc = await db.collection(COLLECTIONS.ACCOUNTS).doc(accountId).get();
      if (!accountDoc.exists) {
        throw new Error('Account not found');
      }

      const account = accountDoc.data()!;

      // Look for existing Stripe customer ID in account
      if (account.stripeCustomerId) {
        const customer = await this.getCustomer(account.stripeCustomerId);
        if (customer) {
          return customer;
        }
      }

      // Create new Stripe customer
      const customer = await this.createCustomer({
        email: account.email,
        name: account.name,
        phone: account.phoneNumber,
        description: `Customer for account: ${account.name}`,
        address: account.address?.billing ? {
          line1: account.address.billing.street,
          city: account.address.billing.city,
          state: account.address.billing.state,
          postal_code: account.address.billing.postalCode,
          country: account.address.billing.country,
        } : undefined,
        metadata: {
          accountId: accountId,
          accountName: account.name,
          source: 'mas_business_os',
        },
      });

      // Store Stripe customer ID in account
      await db.collection(COLLECTIONS.ACCOUNTS).doc(accountId).update({
        stripeCustomerId: customer.id,
        updatedAt: new Date(),
      });

      return customer;
    } catch (error) {
      console.error('Failed to get or create customer for account:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const stripeCustomer = new StripeCustomerService();