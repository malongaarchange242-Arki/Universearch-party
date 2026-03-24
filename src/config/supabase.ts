import { createClient } from '@supabase/supabase-js';
import { config } from './env';

/**
 * Supabase Client
 * Initialized with SERVICE_ROLE_KEY for backend operations
 * This allows full access to the database including protected tables
 */
console.log('Initializing Supabase client with URL:', config.supabase.url);

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

/**
 * Test Supabase connection
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error code:', error.code);
      console.error('❌ Supabase connection error message:', error.message);
      console.error('❌ Full error:', JSON.stringify(error, null, 2));
      return false;
    }
    
    console.log('✅ Supabase connected successfully. Found records:', data?.length || 0);
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed - Exception caught:');
    if (error instanceof TypeError) {
      console.error('  Type: TypeError');
      console.error('  Message:', error.message);
      console.error('  Stack:', error.stack);
      
      // Check if it's a network error
      if (error.message.includes('fetch failed')) {
        console.error('\n  This is likely a network connectivity issue:');
        console.error('  - Check your internet connection');
        console.error('  - Check if Supabase is reachable');
        console.error('  - Check for firewall/proxy blocking');
        console.error('  - Check if you\'re in an offline environment');
      }
    } else if (error instanceof Error) {
      console.error('  Type: Error');
      console.error('  Message:', error.message);
      console.error('  Stack:', error.stack);
    } else {
      console.error('  Unknown error type:', error);
    }
    return false;
  }
};
