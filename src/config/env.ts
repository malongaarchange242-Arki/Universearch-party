import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment Configuration
 * Centralized configuration for the application
 */
export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Enable mock/offline mode (for testing without Supabase connectivity)
  useMockDatabase: process.env.USE_MOCK_DATABASE === 'true',

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },

  // MTN MoMo
  momo: {
    apiUser: process.env.MOMO_API_USER || '',
    apiKey: process.env.MOMO_API_KEY || '',
    subscriptionKey: process.env.MOMO_SUBSCRIPTION_KEY || '',
    environment: process.env.MOMO_ENVIRONMENT || 'sandbox',
    currency: process.env.MOMO_COLLECTION_CURRENCY || 'EUR',
    callbackUrl: process.env.MOMO_CALLBACK_URL || '',
  },

  // JWT (for future use)
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
};

// Log configuration status (sanitize sensitive keys)
console.log('Configuration loaded:');
console.log('- NODE_ENV:', config.nodeEnv);
console.log('- PORT:', config.port);
console.log('- USE_MOCK_DATABASE:', config.useMockDatabase ? '✓ MOCK MODE' : '✗ Real Supabase');
console.log('- SUPABASE_URL:', config.supabase.url ? '✓ Set' : '✗ Missing');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', config.supabase.serviceRoleKey ? '✓ Set' : '✗ Missing');
console.log('- MOMO_API_USER:', config.momo.apiUser ? '✓ Set' : '✗ Missing');

/**
 * Validation function to check required environment variables
 */
export const validateConfig = (): boolean => {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'MOMO_API_USER',
    'MOMO_API_KEY',
    'MOMO_SUBSCRIPTION_KEY',
  ];

  for (const variable of requiredVars) {
    if (!process.env[variable]) {
      console.warn(`⚠️  Missing environment variable: ${variable}`);
    }
  }

  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
};
