import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { verifyOwner, forbiddenResponse } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await verifyOwner();
    if (!session) {
      return forbiddenResponse();
    }

    const { data, error } = await supabaseAdmin
      .from('Account_Type')
      .select('id, type');

    if (error) {
      console.error('Error fetching account types:', error);
      return NextResponse.json({ error: 'Failed to fetch account types.' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (e) {
    console.error('Exception in GET /api/admin/account-types:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
