import axios from 'axios';
import { MoMoClient } from './momo.client';
import { MoMoToken } from './momo.token';
import { config } from '../../config/env';

/**
 * Payment Status Response
 */
export interface PaymentStatusResponse {
  referenceId: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'EXPIRED';
  amount?: number;
  currency?: string;
  externalId?: string;
}

/**
 * MoMo Status Handler
 * Handles payment status checks
 */
export class MoMoStatus extends MoMoClient {
  private tokenHandler: MoMoToken;

  constructor() {
    super();
    this.tokenHandler = new MoMoToken();
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(referenceId: string): Promise<PaymentStatusResponse> {
    try {
      // Get access token
      const accessToken = await this.tokenHandler.getAccessToken();

      // Make API request
      const response = await axios.get(
        `${config.momo.environment === 'sandbox' ? 'https://sandbox.momodeveloper.mtn.com' : 'https://api.mtn.com'}/collection/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Reference-Id': referenceId,
            'X-Target-Environment': config.momo.environment === 'sandbox' ? 'sandbox' : 'production',
            'Ocp-Apim-Subscription-Key': config.momo.subscriptionKey,
          },
        }
      );

      const data = response.data;

      // Map MoMo status to our status
      let status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'EXPIRED' = 'PENDING';
      if (data.status === 'SUCCESSFUL') {
        status = 'SUCCESSFUL';
      } else if (data.status === 'FAILED') {
        status = 'FAILED';
      } else if (data.status === 'EXPIRED') {
        status = 'EXPIRED';
      }

      console.log('📊 MoMo Status Check:', {
        referenceId,
        status,
        momoStatus: data.status,
      });

      return {
        referenceId,
        status,
        amount: data.amount,
        currency: data.currency,
        externalId: data.externalId,
      };
    } catch (error) {
      // Enhanced error logging
      if (axios.isAxiosError(error)) {
        console.error('❌ MoMo Status Check Error:');
        console.error('  Status:', error.response?.status);
        console.error('  Data:', error.response?.data);
      } else {
        console.error('Error getting payment status from MoMo:', error);
      }
      // If error, assume payment is still pending
      return {
        referenceId,
        status: 'PENDING',
      };
    }
  }
}
