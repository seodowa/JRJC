import { createClient } from '@supabase/supabase-js'; // Use direct client for Admin access
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentUsername, formData } = body;

    if (!currentUsername || !formData) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // CHANGE 1: Create a Supabase Admin client using the Service Role Key.
    // This client BYPASSES all Row Level Security (RLS) policies.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const updates: Record<string, any> = {
      Username: formData.username,
      Email: formData.email,
      profile_image: formData.image,
    };

    if (formData.password && formData.password.trim() !== '') {
      updates.Password = await bcrypt.hash(formData.password, 10);
    }

    // CHANGE 2: Use supabaseAdmin to perform the update
    const { data, error } = await supabaseAdmin
      .from('Accounts')
      .update(updates)
      .eq('Username', currentUsername)
      .select();

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