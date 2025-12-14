import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { verifyOwner, forbiddenResponse } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  try {
    const session = await verifyOwner();
    if (!session) {
      return forbiddenResponse();
    }

    const { data: employees, error } = await supabaseAdmin
      .from('Accounts')
      .select('ID, Username, Email, profile_image, Account_Type!fk_accounts_account_type(id, type)');

    if (error) {
      console.error('Error fetching employees:', error);
      return NextResponse.json({ error: 'Failed to fetch employees.' }, { status: 500 });
    }

    const formattedEmployees = employees.map((employee: any) => ({
      ID: employee.ID,
      Username: employee.Username,
      Email: employee.Email,
      profile_image: employee.profile_image,
      account_type: employee.Account_Type?.type || 'unknown',
      account_type_id: employee.Account_Type?.id,
    }));

    return NextResponse.json(formattedEmployees, { status: 200 });

  } catch (e) {
    console.error('Exception in GET /api/admin/employees:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await verifyOwner();
    if (!session) {
      return forbiddenResponse();
    }

    const { username, password, email, account_type_id, image } = await req.json();

    if (!username || !password || !email || !account_type_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if username exists
    const { data: existing } = await supabaseAdmin
      .from('Accounts')
      .select('ID')
      .eq('Username', username)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseAdmin
      .from('Accounts')
      .insert([{
        Username: username,
        Password: hashedPassword,
        Email: email,
        Account_Type: account_type_id,
        profile_image: image || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating employee:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (e) {
    console.error('Exception in POST /api/admin/employees:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await verifyOwner();
    if (!session) {
      return forbiddenResponse();
    }

    const { id, username, password, email, account_type_id, image } = await req.json();

    if (!id || !username || !email || !account_type_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updates: any = {
      Username: username,
      Email: email,
      Account_Type: account_type_id,
      profile_image: image
    };

    if (password && password.trim() !== '') {
      updates.Password = await bcrypt.hash(password, 10);
    }

    const { error } = await supabaseAdmin
      .from('Accounts')
      .update(updates)
      .eq('ID', id);

    if (error) {
      console.error('Error updating employee:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (e) {
    console.error('Exception in PUT /api/admin/employees:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await verifyOwner();
    if (!session) {
      return forbiddenResponse();
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('Accounts')
      .delete()
      .eq('ID', id);

    if (error) {
      console.error('Error deleting employee:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (e) {
    console.error('Exception in DELETE /api/admin/employees:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
