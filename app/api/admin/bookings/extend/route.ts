// app/api/admin/bookings/extend/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await verifyAdmin();
  if (!session) {
    return unauthorizedResponse();
  }
  try {
    const { bookingId, newEndDate } = await req.json();

    if (!bookingId || !newEndDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Update the booking end date
    // Note: In a real app, you might also want to recalculate the 'Total_Price' here based on the new duration.
    const { error } = await supabaseAdmin
      .from('Booking_Details')
      .update({ 
        Booking_End_Date_Time: newEndDate,
        // Optionally update status back to 'Ongoing' if it was something else
        Booking_Status_ID: 3 // Assuming 3 is 'Ongoing'
      })
      .eq('Booking_ID', bookingId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Extend Booking Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}