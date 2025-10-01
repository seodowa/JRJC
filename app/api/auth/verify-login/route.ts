
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  const { token } = await req.json();
  console.log("Verify route: Received token for lookup:", token);
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from('Accounts')
    .select('"ID", "Username", "Account_Type"')
    .eq('verification_token', token)
    .gt('verification_token_expires_at', new Date().toISOString())
    .maybeSingle();

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Create session
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({
    user: {
      id: user.ID,
      username: user.Username,
      account_type: user.Account_Type,
    },
    expires,
  });

  (await cookies()).set('session', session, { expires, httpOnly: true });

  // Clear the verification token
  const { error: updateError } = await supabaseAdmin
    .from('Accounts')
    .update({ verification_token: null, verification_token_expires_at: null })
    .eq('"Username"', user.Username);

  if (updateError) {
    console.error('Error clearing verification token:', updateError);
  }

  return NextResponse.json({ message: 'Login successful' });
}
