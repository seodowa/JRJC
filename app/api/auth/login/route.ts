
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendVerificationEmail } from '@/lib/nodemailer(smtp)/email';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from('Accounts')
    .select('"ID", "Username", "Password", "Email"')
    .eq('"Username"', username)
    .maybeSingle();


  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!user || user.Password !== password) {  // Capital 'P'
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  // Generate a verification token
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const token = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const expires = new Date(Date.now() + 10 * 60 * 1000); // Token expires in 10 minutes

  // Store the token in the database
  const { error: updateError } = await supabaseAdmin
    .from('Accounts')
    .update({
      verification_token: token,
      verification_token_expires_at: expires.toISOString(),
    })
    .eq("Username", user.Username);

  if (updateError) {
    console.error("Supabase update error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Send the verification email
  try {
    await sendVerificationEmail(user.Email, token);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
    return NextResponse.json({ error: 'Failed to send verification email. Please try again later.' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Verification email sent' });
}