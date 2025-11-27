import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getSession } from '@/lib'; // Assuming this handles session verification
import { sendSMS } from '@/lib/sms';

// Helper to send email via the existing API route
const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    // Construct the full URL. Ensure NEXT_PUBLIC_BASE_URL is set in your .env
    // Fallback to localhost for development if not set
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email via API route');
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    // We log but don't re-throw to avoid breaking the loop of other bookings
  }
};

export async function POST(req: Request) {
  // 1. Verify Admin Session
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingIds, action } = await req.json();

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return NextResponse.json({ error: 'Invalid booking IDs' }, { status: 400 });
    }

    const results = [];

    for (const bookingId of bookingIds) {
      let statusId = 0;
      let smsTemplate = '';
      let emailSubject = '';

      switch (action) {
        case 'approve':
          statusId = 2;
          smsTemplate = 'Hi {name}, Good news! Your booking (ID: {id}) has been APPROVED. See you soon!';
          emailSubject = 'Booking Approved';
          break;
        case 'decline':
          statusId = 6;
          smsTemplate = 'Hi {name}, we regret to inform you that your booking (ID: {id}) has been DECLINED. Please contact us for details.';
          emailSubject = 'Booking Declined';
          break;
        case 'start':
          statusId = 3;
          smsTemplate = 'Hi {name}, your rental (ID: {id}) has officially STARTED. Drive safely!';
          emailSubject = 'Rental Started';
          break;
        case 'finish':
          statusId = 4;
          smsTemplate = 'Hi {name}, your booking (ID: {id}) has been COMPLETED. Thank you for choosing us!';
          emailSubject = 'Booking Completed';
          break;
        case 'cancel':
          statusId = 5;
          smsTemplate = 'Hi {name}, your booking (ID: {id}) has been CANCELLED by the admin. Please contact us if this is a mistake.';
          emailSubject = 'Booking Cancelled';
          break;
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      // Update DB
      const { error: updateError } = await supabaseAdmin
        .from('Booking_Details')
        .update({ Booking_Status_ID: statusId })
        .eq('Booking_ID', bookingId);

      if (updateError) {
        results.push({ success: false, bookingId, error: updateError.message });
        continue;
      }

      // Fetch Customer & Preference for Notification
      const { data: bookingData, error: fetchError } = await supabaseAdmin
        .from('Booking_Details')
        .select(`
          Booking_ID,
          Notification_Preference,
          Customer (Contact_Number, First_Name, Email)
        `)
        .eq('Booking_ID', bookingId)
        .single();

      if (!fetchError && bookingData?.Customer) {
        const customer = bookingData.Customer as any;
        const firstName = customer.First_Name || 'Customer';
        const preference = bookingData.Notification_Preference || 'SMS'; // Default to SMS

        // Prepare Message
        const messageText = smsTemplate
          .replace('{name}', firstName)
          .replace('{id}', bookingId);

        try {
          if (preference === 'SMS' && customer.Contact_Number) {
            // Send SMS
            let formattedNumber = customer.Contact_Number;
            if (formattedNumber.startsWith('0')) {
              formattedNumber = '+63' + formattedNumber.substring(1);
            }
            await sendSMS(formattedNumber, messageText);

          } else if (preference === 'Email' && customer.Email) {
            // Send Email via Route
            const html = `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
                <h2 style="color: #333;">${emailSubject}</h2>
                <p>${messageText}</p>
                <br/>
                <p>Thank you,</p>
                <p>The Team</p>
              </div>
            `;
            await sendEmail(customer.Email, emailSubject, html);

          } else {
            // Fallback Logic
            if (customer.Contact_Number) {
               let formattedNumber = customer.Contact_Number;
               if (formattedNumber.startsWith('0')) formattedNumber = '+63' + formattedNumber.substring(1);
               await sendSMS(formattedNumber, messageText);
            } else if (customer.Email) {
               const html = `<p>${messageText}</p>`;
               await sendEmail(customer.Email, emailSubject, html);
            }
          }
        } catch (notifyError) {
          console.error(`Failed to send notification for booking ${bookingId}:`, notifyError);
          // We don't mark the whole operation as failed just because notification failed, but we log it.
        }
      }

      results.push({ success: true, bookingId });
    }

    return NextResponse.json({ results });

  } catch (error: any) {
    console.error('Admin Booking Status Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}