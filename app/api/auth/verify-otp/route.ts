import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createHash } from 'crypto';

export async function POST(req: Request) {
  const { username, otp, trustDevice } = await req.json();
  // We don't need the standard client for this privileged query anymore
  // const supabase = await createClient(); 

  // Use supabaseAdmin to bypass RLS for this privileged operation
  // This ensures we can join Account_Type even if RLS hides it from anon
  const { data: user, error } = await supabaseAdmin
    .from('Accounts')
    .select(`"ID", "Username", "Email", "profile_image", Account_Type!fk_accounts_account_type (type), "verification_token", "verification_token_expires_at"`)
    .eq('"Username"', username)
    .maybeSingle();

  if (error || !user) {
    // In production, you might want to log the error internally but return a generic message
    console.error("Login Error:", error);
    return NextResponse.json({ error: 'Invalid user.' }, { status: 401 });
  }

  const hashedOtp = createHash('sha256').update(otp).digest('hex');

  if (user.verification_token !== hashedOtp || new Date(user.verification_token_expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
  }

  // Safe access for Account_Type with fallback
  // Cast user to any because the generated types might not yet reflect the explicit join alias perfectly
  const userAny = user as any;
  const accountType = userAny.Account_Type?.type || 'unknown';

  if (accountType === 'unknown') {
      console.warn(`User ${user.Username} has no resolvable Account_Type. Defaulting to 'unknown'.`);
  }

  // Create session
  const sessionDuration = trustDevice ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day
  const expires = new Date(Date.now() + sessionDuration);
  const session = await encrypt({
    user: {
      id: user.ID,
      username: user.Username,
      email: user.Email,
      profileImage: user.profile_image,
      account_type: accountType,
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