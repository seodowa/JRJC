import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: Request) {
    // 1. Verify Admin Session & Role
    const session = await verifyAdmin();
    if (!session) {
        return unauthorizedResponse();
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
