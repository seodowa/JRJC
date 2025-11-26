import { createClient } from '@supabase/supabase-js';

// IMPORTANT: This client uses the service role key and should only be used on the server.
// It bypasses all RLS policies.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('DEBUG: SUPABASE_SERVICE_ROLE_KEY =', serviceRoleKey ? '***** (set)' : 'NOT SET');

if (!serviceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.');
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
