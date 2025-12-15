import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { sendSMS } from '@/lib/sms';
import { createHash, randomInt } from 'crypto';

// Helper for email
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

    // 1. Fetch Booking and Customer
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

    // Check if cancellable
    const validStatuses = [1, 2]; // Pending, Confirmed
    if (!validStatuses.includes(booking.Booking_Status_ID)) {
       return NextResponse.json({ error: 'Booking cannot be cancelled in its current status' }, { status: 400 });
    }

    // 2. Generate OTP
    const otp = randomInt(100000, 999999).toString();
    const hashedOtp = createHash('sha256').update(otp).digest('hex');
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 3. Save to DB
    const { error: updateError } = await supabaseAdmin
      .from('Booking_Details')
      .update({ 
        cancellation_otp: hashedOtp, 
        cancellation_otp_expiry: expiry.toISOString() 
      })
      .eq('Booking_ID', bookingId);

    if (updateError) {
      throw new Error('Failed to generate OTP');
    }

    // 4. Send OTP
    if (booking.Customer) {
      const customer = booking.Customer as any;
      const firstName = customer.First_Name || 'Customer';
      const message = `Your cancellation OTP for booking ${bookingId} is ${otp}. This code expires in 10 minutes.`;
      const subject = "Cancellation Verification Code";
      const preference = booking.Notification_Preference || 'SMS';

      let sent = false;

      // Try SMS
      if ((preference.includes('SMS') || !preference) && customer.Contact_Number) {
        let formattedNumber = customer.Contact_Number;
        if (formattedNumber.startsWith('0')) formattedNumber = '+63' + formattedNumber.substring(1);
        await sendSMS(formattedNumber, message);
        sent = true;
      }
      
      // Try Email if SMS not sent or preference includes Email
      if ((preference.includes('Email') || !sent) && customer.Email) {
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Cancellation Verification</h2>
            <p>Hi ${firstName},</p>
            <p>You requested to cancel your booking (ID: ${bookingId}).</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">${otp}</p>
            <p>This code expires in 10 minutes.</p>
            <p>If you did not request this, please ignore this message.</p>
          </div>
        `;
        await sendEmail(customer.Email, subject, html);
        sent = true;
      }

      if (!sent) {
          return NextResponse.json({ error: 'No contact method found for this customer' }, { status: 400 });
      }
    } else {
        return NextResponse.json({ error: 'Customer details not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });

  } catch (error: any) {
    console.error("OTP Request Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
