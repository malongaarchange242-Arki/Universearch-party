import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { MoMoClient } from './momo.client';
import { MoMoToken } from './momo.token';
import { config } from '../../config/env';

/**
 * Request to Pay DTO
 */
export interface RequestToPayDto {
  amount: number;
  currency: string;
  externalId: string;
  payer: {
    partyIdType: 'MSISDN' | 'EMAIL';
    partyId: string;
  };
  payerMessage?: string;
  payeeNote?: string;
}

/**
 * MoMo Payment Handler
 * Handles payment requests to MTN MoMo API
 */
export class MoMoPayment extends MoMoClient {
  private tokenHandler: MoMoToken;

  constructor() {
    super();
    this.tokenHandler = new MoMoToken();
  }

  /**
   * Request payment from customer
   */
  async requestToPay(data: RequestToPayDto): Promise<{
    referenceId: string;
    externalId: string;
  }> {
    try {
      const referenceId = uuidv4();

      // Get access token
      const accessToken = await this.tokenHandler.getAccessToken();

      // Determine base URL based on environment
      const baseURL =
        config.momo.environment === 'sandbox'
          ? 'https://sandbox.momodeveloper.mtn.com'
          : 'https://api.mtn.com';

      // Prepare payload
      const payload = {
        amount: data.amount.toString(), // Always string
        currency: 'XAF',
        externalId: data.externalId || Date.now().toString(), // Use timestamp if not provided
        payer: {
          partyIdType: 'MSISDN',
          partyId: data.payer.partyId,
        },
        payerMessage: data.payerMessage || 'PassEvent Payment',
        payeeNote: data.payeeNote || 'Event Ticket',
      };

      // 🔥 DEBUG LOG: Phone number validation
      console.log('📱 MTN MoMo Payment Details:');
      console.log('  Phone Number:', data.payer.partyId);
      console.log('  Amount:', `${payload.amount} ${payload.currency}`);
      console.log('  External ID:', payload.externalId);

      // Make API request
      const response = await axios.post(
        `${baseURL}/collection/v1_0/requesttopay`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Reference-Id': referenceId,
            'X-Target-Environment': config.momo.environment === 'sandbox' ? 'sandbox' : 'production', // Dynamic
            'Ocp-Apim-Subscription-Key': config.momo.subscriptionKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Payment request sent to MoMo:', {
        referenceId,
        externalId: payload.externalId,
        status: response.status,
      });

      return {
        referenceId,
        externalId: payload.externalId,
      };
    } catch (error) {
      // Enhanced error logging for debugging
      if (axios.isAxiosError(error)) {
        console.error('❌ MoMo API Error:');
        console.error('  Status:', error.response?.status);
        console.error('  Data:', error.response?.data);
        console.error('  Request Headers:', error.config?.headers);
        console.error('  Request Body:', error.config?.data);
      } else {
        console.error('❌ Error requesting payment from MoMo:', error);
      }
      throw new Error('Failed to request payment from MoMo');
    }
  }
}
