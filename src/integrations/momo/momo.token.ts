import axios from 'axios';
import { config } from '../../config/env';

/**
 * MoMo Token Handler
 * Handles token generation and management
 */
export class MoMoToken {
  /**
   * Get access token from MoMo API
   * Headers MUST be in the Axios config (3rd parameter), not in the body!
   */
  async getAccessToken(): Promise<string> {
    try {
      // Create Basic Auth header
      const credentials = Buffer.from(
        `${config.momo.apiUser}:${config.momo.apiKey}`
      ).toString('base64');

      console.log('🔑 Requesting MoMo token with:');
      console.log('  API User:', config.momo.apiUser ? '✓ Set' : '✗ Missing');
      console.log('  API Key:', config.momo.apiKey ? '✓ Set' : '✗ Missing');
      console.log('  Subscription Key:', config.momo.subscriptionKey ? '✓ Set' : '✗ Missing');

      // 🔥 CRITICAL: Pass config as 3rd parameter, not inside body!
      const response = await axios.post(
        'https://sandbox.momodeveloper.mtn.com/collection/token/',
        {}, // Empty body - MoMo doesn't expect body content
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Ocp-Apim-Subscription-Key': config.momo.subscriptionKey,
          },
        }
      );

      console.log('✅ MoMo Token obtained successfully');
      return response.data.access_token;
    } catch (error: any) {
      // Enhanced error logging
      console.error('❌ MoMo Token Error:');
      if (error.response) {
        console.error('  Status:', error.response.status);
        console.error('  Data:', error.response.data);
        console.error('  Headers sent:', error.config?.headers);
      } else {
        console.error('  Message:', error.message);
      }
      throw new Error('Failed to get MoMo access token');
    }
  }
}
