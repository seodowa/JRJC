import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getSession } from '@/lib';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingId } = await req.json();
    
    if (!bookingId) return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });

    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('Booking_Details')
      .update({ date_returned: now })
      .eq('Booking_ID', bookingId)
      .select(`
        *,
        Customer (
          First_Name,
          Last_Name,
          Suffix,
          Email,
          Contact_Number
        ),
        Car_Models (
          Model_Name,
          Year_Model,
          image,
          Number_Of_Seats,
          Car_Class_FK,
          Manufacturer (
            Manufacturer_Name
          )
        ),
        Payment_Details (*)
      `) // Select updated data to return
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
