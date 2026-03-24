import { createApp } from './app';
import { config, validateConfig } from './config/env';
import { testSupabaseConnection } from './config/supabase';

/**
 * Start PassEvent API Server
 */
const startServer = async () => {
  try {
    // Validate configuration
    if (!validateConfig()) {
      console.warn('⚠️ Some environment variables are missing, but server will start');
    }

    // Test Supabase connection
    console.log('Testing Supabase connection...');
    const supabaseConnected = await testSupabaseConnection();
    if (!supabaseConnected) {
      console.warn('⚠️ Supabase connection failed, but server will continue to start');
    }

    // Create Fastify app
    const app = await createApp();

    // Start listening
    const address = await app.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    console.log(`⚡ PassEvent API Server running at: ${address}`);
    console.log(`📝 Node Environment: ${config.nodeEnv}`);
    console.log(`🔐 Supabase: ${config.supabase.url ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`💳 MTN MoMo: ${config.momo.apiUser ? '✅ Configured' : '❌ Not configured'}`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start server
startServer();
