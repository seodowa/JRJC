import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { sendSMS } from '@/lib/sms'; // Assuming this utility exists and works server-side

// Helper for email (reusing the pattern from admin route)
const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    console.log(`Attempting to cancel booking: ${bookingId}`);

    // 1. Fetch the booking to check validity and get customer details
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('Booking_Details')
      .select(`
        Booking_Status_ID,
        Notification_Preference,
        Customer (Contact_Number, First_Name, Email)
      `)
      .eq('Booking_ID', bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if cancellable (1=Pending, 2=Confirmed)
    // Prevent cancelling if already started (3), completed (4), or declined (6)
    const validStatuses = [1, 2]; 
    if (!validStatuses.includes(booking.Booking_Status_ID)) {
       return NextResponse.json({ error: 'Booking cannot be cancelled in its current status' }, { status: 400 });
    }

    // 2. Update Status to 5 (Cancelled)
    const { error: updateError } = await supabaseAdmin
      .from('Booking_Details')
      .update({ Booking_Status_ID: 5 })
      .eq('Booking_ID', bookingId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
    }

    // 3. Send Notification
    if (booking.Customer) {
      const customer = booking.Customer as any;
      const firstName = customer.First_Name || 'Customer';
      const message = `Hi ${firstName}, your booking (ID: ${bookingId}) has been successfully CANCELLED. We hope to see you again next time.`;
      const subject = "Booking Cancelled";
      const preference = booking.Notification_Preference || 'SMS';

      if (preference === 'SMS' && customer.Contact_Number) {
        let formattedNumber = customer.Contact_Number;
        if (formattedNumber.startsWith('0')) formattedNumber = '+63' + formattedNumber.substring(1);
        await sendSMS(formattedNumber, message);
      } else if (preference === 'Email' && customer.Email) {
        const html = `<p>${message}</p>`;
        await sendEmail(customer.Email, subject, html);
      } else {
         // Fallback
         if (customer.Contact_Number) {
            let formattedNumber = customer.Contact_Number;
            if (formattedNumber.startsWith('0')) formattedNumber = '+63' + formattedNumber.substring(1);
            await sendSMS(formattedNumber, message);
         } else if (customer.Email) {
            const html = `<p>${message}</p>`;
            await sendEmail(customer.Email, subject, html);
         }
      }
    }

    return NextResponse.json({ success: true, message: 'Booking cancelled successfully' });

  } catch (error: any) {
    console.error("Cancellation Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
