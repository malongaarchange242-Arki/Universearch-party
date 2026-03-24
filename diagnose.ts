import { config } from './src/config/env';
import { testSupabaseConnection } from './src/config/supabase';

/**
 * Quick diagnostic script to test Supabase connection
 */
const diagnose = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('PassEvent - Supabase Connection Diagnostic');
  console.log('='.repeat(60));

  console.log('\n📋 Environment Variables:');
  console.log('SUPABASE_URL:', config.supabase.url || '❌ NOT SET');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', config.supabase.serviceRoleKey ? '✓ Set (' + config.supabase.serviceRoleKey.substring(0, 20) + '...)' : '❌ NOT SET');
  console.log('NODE_ENV:', config.nodeEnv);
  console.log('PORT:', config.port);

  console.log('\n🔌 Testing Supabase Connection:');
  const connected = await testSupabaseConnection();
  
  if (!connected) {
    console.log('\n⚠️  Supabase connection failed. Possible causes:');
    console.log('  1. Network connectivity issue (no internet)');
    console.log('  2. Invalid SUPABASE_URL');
    console.log('  3. Invalid SUPABASE_SERVICE_ROLE_KEY');
    console.log('  4. Supabase server is down');
    console.log('  5. Firewall/Proxy blocking the connection');
    console.log('\n  Please check:');
    console.log('  - .env file contains correct SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    console.log('  - You have internet connectivity');
    console.log('  - Supabase URL is correct: ' + config.supabase.url);
  }

  console.log('\n' + '='.repeat(60));
  process.exit(connected ? 0 : 1);
};

diagnose();
