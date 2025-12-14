
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendOtpEmail } from '@/lib/nodemailer(smtp)/email';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createHash } from 'crypto';

import bcrypt from 'bcryptjs';

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

  // Securely verify password using bcrypt
  const isValidPassword = user && user.Password ? await bcrypt.compare(password, user.Password) : false;

  if (!user || !isValidPassword) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 3 * 60 * 1000); // OTP expires in 3 minutes

  // Hash the OTP
  const hashedOtp = createHash('sha256').update(otp).digest('hex');

  // Store the hashed OTP in the database
  const { error: updateError } = await supabaseAdmin
    .from('Accounts')
    .update({
      verification_token: hashedOtp,
      verification_token_expires_at: expires.toISOString(),
    })
    .eq("Username", user.Username);

  if (updateError) {
    console.error("Supabase update error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Send the plaintext OTP to the user's email
  try {
    await sendOtpEmail(user.Email, otp, expires);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
    return NextResponse.json({ error: 'Failed to send verification email. Please try again later.' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Verification email sent' });
}