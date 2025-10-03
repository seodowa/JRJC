
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createHash } from 'crypto';

export async function POST(req: Request) {
  const { username, otp, trustDevice } = await req.json();
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from('Accounts')
    .select('"ID", "Username", "Account_Type", "verification_token", "verification_token_expires_at"')
    .eq('"Username"', username)
    .maybeSingle();

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid user.' }, { status: 401 });
  }

  const hashedOtp = createHash('sha256').update(otp).digest('hex');

  if (user.verification_token !== hashedOtp || new Date(user.verification_token_expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
  }

  // Create session
  const sessionDuration = trustDevice ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day
  const expires = new Date(Date.now() + sessionDuration);
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
