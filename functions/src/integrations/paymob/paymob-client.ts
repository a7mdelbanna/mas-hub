import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from '../../config/firebase';

export interface PaymobAuthResponse {
  token: string;
  profile: {
    id: number;
    user: any;
    created_at: string;
    active: boolean;
    profile: any;
  };
}

export interface PaymobApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Paymob API client configuration and initialization
 * Provides centralized access to Paymob APIs with authentication
 */
class PaymobClientService {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private readonly baseURL = 'https://accept.paymob.com/api';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor to add authentication token
    this.client.interceptors.request.use(
      async (config) => {
        // Add auth token if available and not already present
        if (this.authToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle common errors
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        // Handle authentication errors
        if (error.response?.status === 401) {
          this.authToken = null;
          this.tokenExpiresAt = null;

          // Try to re-authenticate once
          if (!error.config._retry) {
            error.config._retry = true;
            try {
              await this.authenticate();
              error.config.headers.Authorization = `Bearer ${this.authToken}`;
              return this.client.request(error.config);
            } catch (authError) {
              console.error('Re-authentication failed:', authError);
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Authenticate with Paymob and get access token
   */
  async authenticate(): Promise<string> {
    try {
      const apiKey = config.payment.paymob.apiKey;
      if (!apiKey) {
        throw new Error('Paymob API key not configured');
      }

      const response = await this.client.post<PaymobAuthResponse>('/auth/tokens', {
        api_key: apiKey,
      });

      this.authToken = response.data.token;
      this.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      return this.authToken;
    } catch (error) {
      console.error('Paymob authentication failed:', error);
      throw new Error('Failed to authenticate with Paymob');
    }
  }

  /**
   * Get authenticated API client
   */
  async getClient(): Promise<AxiosInstance> {
    // Check if token is expired or not available
    if (!this.authToken || (this.tokenExpiresAt && new Date() >= this.tokenExpiresAt)) {
      await this.authenticate();
    }

    return this.client;
  }

  /**
   * Make authenticated API request
   */
  async makeRequest<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    options?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const client = await this.getClient();

      const requestConfig: AxiosRequestConfig = {
        method,
        url: endpoint,
        ...options,
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        requestConfig.data = data;
      } else if (data && method === 'GET') {
        requestConfig.params = data;
      }

      const response = await client.request<T>(requestConfig);
      return response.data;
    } catch (error) {
      console.error(`Paymob API request failed (${method} ${endpoint}):`, error);
      this.handleApiError(error);
      throw error;
    }
  }

  /**
   * Handle API errors and format them consistently
   */
  private handleApiError(error: any): void {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      console.error(`Paymob API Error ${status}:`, data);

      if (status === 401) {
        throw new Error('Paymob authentication failed');
      } else if (status === 403) {
        throw new Error('Paymob access forbidden');
      } else if (status === 422) {
        throw new Error(`Paymob validation error: ${JSON.stringify(data)}`);
      } else if (status >= 500) {
        throw new Error('Paymob server error');
      }
    } else if (error.request) {
      // Network error
      console.error('Paymob network error:', error.request);
      throw new Error('Paymob network error');
    } else {
      // Other error
      console.error('Paymob client error:', error.message);
      throw new Error(`Paymob client error: ${error.message}`);
    }
  }

  /**
   * Test API connection and credentials
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.authenticate();
      return true;
    } catch (error) {
      console.error('Paymob connection test failed:', error);
      return false;
    }
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Check if token is valid and not expired
   */
  isTokenValid(): boolean {
    return !!(
      this.authToken &&
      this.tokenExpiresAt &&
      new Date() < this.tokenExpiresAt
    );
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.authToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Get Paymob configuration
   */
  getConfig() {
    return {
      apiKey: config.payment.paymob.apiKey,
      integrationId: config.payment.paymob.integrationId,
      merchantId: config.payment.paymob.merchantId,
      webhookSecret: config.payment.paymob.webhookSecret,
    };
  }

  /**
   * Validate required configuration
   */
  validateConfig(): void {
    const paymobConfig = this.getConfig();

    if (!paymobConfig.apiKey) {
      throw new Error('Paymob API key not configured');
    }

    if (!paymobConfig.integrationId) {
      throw new Error('Paymob integration ID not configured');
    }

    if (!paymobConfig.merchantId) {
      throw new Error('Paymob merchant ID not configured');
    }
  }
}

// Export singleton instance
export const paymobClient = new PaymobClientService();
export default paymobClient;