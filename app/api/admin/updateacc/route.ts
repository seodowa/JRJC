import { supabaseAdmin } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  // 1. Verify Admin Session & Role
  const session = await verifyAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { currentUsername, formData } = body;

    if (!currentUsername || !formData) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {
      Username: formData.username,
      Email: formData.email,
      profile_image: formData.image,
    };

    // If accountType is provided, add it to the updates.
    if (formData.accountType) {
        updates.Account_Type = formData.accountType;
    }

    if (formData.password && formData.password.trim() !== '') {
      updates.Password = await bcrypt.hash(formData.password, 10);
    }

    const { data, error } = await supabaseAdmin
      .from('Accounts')
      .update(updates)
      .eq('Username', currentUsername)
      .select(`ID, Username, Email, profile_image, Account_Type!fk_accounts_account_type(type)`)
      .single();

    if (error) {
      console.error('Database Update Error:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    if (!data) {
        console.error(`Update failed: No row found for username "${currentUsername}"`);
        return NextResponse.json(
            { success: false, message: 'Account not found.' },
            { status: 404 }
        );
    }

    // Refresh Session
    const userAny = data as any;
    const accountType = userAny.Account_Type?.type || 'unknown';

    // Extend session expiration (e.g., reset to original duration or default 24h)
    // Here we default to 24h for the refreshed session for simplicity, 
    // or we could try to read the old exp claim if we wanted to preserve it exactly.
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    const newSession = await encrypt({
      user: {
        id: data.ID,
        username: data.Username,
        email: data.Email,
        profileImage: data.profile_image,
        account_type: accountType,
      },
      expires,
    });

    (await cookies()).set('session', newSession, { expires, httpOnly: true });

    revalidatePath('/adminSU/settings');

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}