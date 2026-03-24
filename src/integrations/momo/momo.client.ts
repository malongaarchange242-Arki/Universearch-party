import axios, { AxiosInstance } from 'axios';
import { config } from '../../config/env';

/**
 * MTN MoMo API Client
 * Base class for MoMo API interactions
 */
export class MoMoClient {
  private apiUrl: string;
  private apiUser: string;
  private apiKey: string;
  private subscriptionKey: string;
  protected client: AxiosInstance;

  constructor() {
    this.apiUser = config.momo.apiUser;
    this.apiKey = config.momo.apiKey;
    this.subscriptionKey = config.momo.subscriptionKey;

    // Use sandbox or production URL based on environment
    this.apiUrl =
      config.momo.environment === 'sandbox'
        ? 'https://sandbox.momodeveloper.mtn.com'
        : 'https://api.mtn.com';

    // Initialize axios client with default headers
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
    });

    // Add request interceptor to include authentication headers
    this.client.interceptors.request.use((config) => {
      config.headers['Ocp-Apim-Subscription-Key'] = this.subscriptionKey;
      config.headers['X-Reference-Id'] = this.generateReferenceId();
      return config;
    });
  }

  /**
   * Generate a reference ID for the request
   */
  protected generateReferenceId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get API base URL
   */
  protected getApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Get API credentials
   */
  protected getCredentials() {
    return {
      apiUser: this.apiUser,
      apiKey: this.apiKey,
    };
  }
}
