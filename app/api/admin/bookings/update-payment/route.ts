import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getSession } from '@/lib';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { paymentId, status, additionalFees, totalPayment } = await req.json();
    
    if (!paymentId) return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('Payment_Details')
      .update({ 
        payment_status: status,
        additional_fees: additionalFees,
        total_payment: totalPayment
      })
      .eq('Payment_ID', paymentId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
