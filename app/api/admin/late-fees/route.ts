import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getSession } from '@/lib';

export async function GET(req: Request) {
  // 1. Verify Admin Session
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: lateFees, error } = await supabaseAdmin
      .from('Late_Fees')
      .select(`
        ID,
        value,
        Car_Class_FK,
        Car_Class (
          Class
        )
      `);

    if (error) {
      console.error("Error fetching late fees:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(lateFees);

  } catch (error: any) {
    console.error('API Error fetching late fees:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
