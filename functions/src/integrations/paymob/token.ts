import { paymobClient } from './paymob-client';
import { paymobOrder, BillingData } from './payment-order';

export interface CreateTokenData {
  orderId: number;
  billingData: BillingData;
  integrationId?: number;
  expiration?: number; // seconds
}

export interface PaymentKey {
  token: string;
}

export interface TokenResult {
  token: string;
  orderId: number;
  billingData: BillingData;
  integrationId: number;
  expiresAt: Date;
}

/**
 * Paymob Payment Token management
 * Handles payment token generation for payment processing
 */
export class PaymobTokenService {
  /**
   * Generate payment token (payment key)
   */
  async generatePaymentToken(data: CreateTokenData): Promise<TokenResult> {
    try {
      // Validate configuration
      paymobClient.validateConfig();

      // Get configuration
      const config = paymobClient.getConfig();
      const integrationId = data.integrationId || parseInt(config.integrationId!);

      // Verify order exists
      await paymobOrder.getOrder(data.orderId);

      // Generate payment key payload
      const paymentKeyPayload = {
        auth_token: await paymobClient.getAuthToken(),
        amount_cents: await this.getOrderAmount(data.orderId),
        expiration: data.expiration || 3600, // 1 hour default
        order_id: data.orderId,
        billing_data: this.formatBillingData(data.billingData),
        currency: await this.getOrderCurrency(data.orderId),
        integration_id: integrationId,
        lock_order_when_paid: true,
      };

      // Make API request to generate payment key
      const paymentKeyResponse = await paymobClient.makeRequest<PaymentKey>(
        'POST',
        '/acceptance/payment_keys',
        paymentKeyPayload
      );

      const token = paymentKeyResponse.token;
      const expiresAt = new Date(Date.now() + (data.expiration || 3600) * 1000);

      // Store token reference
      await this.storeTokenReference(token, data, integrationId, expiresAt);

      return {
        token,
        orderId: data.orderId,
        billingData: data.billingData,
        integrationId,
        expiresAt,
      };
    } catch (error) {
      console.error('Failed to generate Paymob payment token:', error);
      throw error;
    }
  }

  /**
   * Generate iframe URL for payment
   */
  async generateIframeUrl(data: CreateTokenData, iframeId?: string): Promise<string> {
    try {
      const tokenResult = await this.generatePaymentToken(data);
      const config = paymobClient.getConfig();

      // Use integration ID as iframe ID if not provided
      const finalIframeId = iframeId || config.integrationId;

      return `https://accept.paymob.com/api/acceptance/iframes/${finalIframeId}?payment_token=${tokenResult.token}`;
    } catch (error) {
      console.error('Failed to generate Paymob iframe URL:', error);
      throw error;
    }
  }

  /**
   * Generate mobile wallet payment URL (Vodafone Cash, etc.)
   */
  async generateMobileWalletUrl(
    data: CreateTokenData,
    walletMobileNumber: string
  ): Promise<string> {
    try {
      const tokenResult = await this.generatePaymentToken(data);

      // For mobile wallet payments, make additional API call
      const walletPayload = {
        source: {
          identifier: walletMobileNumber,
          subtype: 'WALLET',
        },
        payment_token: tokenResult.token,
      };

      const walletResponse = await paymobClient.makeRequest<{ redirect_url: string }>(
        'POST',
        '/acceptance/payments/pay',
        walletPayload
      );

      return walletResponse.redirect_url;
    } catch (error) {
      console.error('Failed to generate mobile wallet payment URL:', error);
      throw error;
    }
  }

  /**
   * Generate Instapay QR code payment URL
   */
  async generateInstapayUrl(data: CreateTokenData): Promise<string> {
    try {
      const tokenResult = await this.generatePaymentToken(data);

      // For Instapay, use specific integration flow
      const instapayPayload = {
        source: {
          subtype: 'INSTAPAY',
        },
        payment_token: tokenResult.token,
      };

      const instapayResponse = await paymobClient.makeRequest<{ redirect_url: string }>(
        'POST',
        '/acceptance/payments/pay',
        instapayPayload
      );

      return instapayResponse.redirect_url;
    } catch (error) {
      console.error('Failed to generate Instapay payment URL:', error);
      throw error;
    }
  }

  /**
   * Validate payment token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // Try to make a request with the token to validate it
      const response = await paymobClient.makeRequest<any>(
        'GET',
        `/acceptance/payment_keys/${token}/validate`
      );

      return response && !response.expired;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  /**
   * Refresh expired token
   */
  async refreshToken(originalData: CreateTokenData): Promise<TokenResult> {
    try {
      // Generate new token with same data
      return await this.generatePaymentToken(originalData);
    } catch (error) {
      console.error('Failed to refresh payment token:', error);
      throw error;
    }
  }

  /**
   * Get order amount
   */
  private async getOrderAmount(orderId: number): Promise<number> {
    try {
      const order = await paymobOrder.getOrder(orderId);
      return order.amount_cents;
    } catch (error) {
      console.error('Failed to get order amount:', error);
      throw error;
    }
  }

  /**
   * Get order currency
   */
  private async getOrderCurrency(orderId: number): Promise<string> {
    try {
      const order = await paymobOrder.getOrder(orderId);
      return order.currency;
    } catch (error) {
      console.error('Failed to get order currency:', error);
      throw error;
    }
  }

  /**
   * Format billing data for Paymob API
   */
  private formatBillingData(billingData: BillingData): BillingData {
    return {
      email: billingData.email,
      first_name: billingData.first_name,
      last_name: billingData.last_name,
      phone_number: billingData.phone_number,
      country: billingData.country || 'EG',
      state: billingData.state || 'N/A',
      city: billingData.city || 'N/A',
      postal_code: billingData.postal_code || '00000',
      street: billingData.street || 'N/A',
      building: billingData.building || 'N/A',
      floor: billingData.floor || 'N/A',
      apartment: billingData.apartment || 'N/A',
    };
  }

  /**
   * Store token reference in database
   */
  private async storeTokenReference(
    token: string,
    data: CreateTokenData,
    integrationId: number,
    expiresAt: Date
  ): Promise<void> {
    try {
      await paymobClient.makeRequest(
        'POST',
        '/internal/payment-tokens', // Internal endpoint for token storage
        {
          token,
          orderId: data.orderId,
          integrationId,
          billingData: data.billingData,
          expiresAt: expiresAt.toISOString(),
          createdAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Failed to store token reference:', error);
      // Don't throw error as this is not critical for payment flow
    }
  }

  /**
   * Get available payment methods for integration
   */
  async getAvailablePaymentMethods(integrationId?: number): Promise<any[]> {
    try {
      const config = paymobClient.getConfig();
      const finalIntegrationId = integrationId || parseInt(config.integrationId!);

      const response = await paymobClient.makeRequest<{ payment_methods: any[] }>(
        'GET',
        `/acceptance/payment_methods?integration_id=${finalIntegrationId}`
      );

      return response.payment_methods || [];
    } catch (error) {
      console.error('Failed to get available payment methods:', error);
      return [];
    }
  }

  /**
   * Get integration details
   */
  async getIntegrationDetails(integrationId?: number): Promise<any> {
    try {
      const config = paymobClient.getConfig();
      const finalIntegrationId = integrationId || parseInt(config.integrationId!);

      return await paymobClient.makeRequest<any>(
        'GET',
        `/ecommerce/integrations/${finalIntegrationId}`
      );
    } catch (error) {
      console.error('Failed to get integration details:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const paymobToken = new PaymobTokenService();