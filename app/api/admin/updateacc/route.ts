import { supabaseAdmin } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';
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
    // The database trigger will handle the role_last_changed_at timestamp automatically.
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
      .select('Username'); // Only select what's needed for revalidation

    if (error) {
      console.error('Database Update Error:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }


    // If data is empty, it means no user was found with that username
    if (!data || data.length === 0) {
        console.error(`Update failed: No row found for username "${currentUsername}"`);
        return NextResponse.json(
            { success: false, message: 'Account not found.' },
            { status: 404 }
        );
    }

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