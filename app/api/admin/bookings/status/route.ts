import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getSession } from '@/lib';
import { sendSMS } from '@/lib/sms';

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

      switch (action) {
        case 'approve':
          statusId = 2;
          smsTemplate = 'Hi {name}, Good news! Your booking (ID: {id}) has been APPROVED. See you soon!';
          break;
        case 'decline':
          statusId = 6;
          smsTemplate = 'Hi {name}, we regret to inform you that your booking (ID: {id}) has been DECLINED. Please contact us for details.';
          break;
        case 'start':
          statusId = 3;
          smsTemplate = 'Hi {name}, your rental (ID: {id}) has officially STARTED. Drive safely!';
          break;
        case 'finish':
          statusId = 4;
          smsTemplate = 'Hi {name}, your booking (ID: {id}) has been COMPLETED. Thank you for choosing us!';
          break;
        case 'cancel':
          statusId = 5;
          smsTemplate = 'Hi {name}, your booking (ID: {id}) has been CANCELLED by the admin. Please contact us if this is a mistake.';
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

      // Fetch Customer for SMS
      const { data: bookingData, error: fetchError } = await supabaseAdmin
        .from('Booking_Details')
        .select(`
          Booking_ID,
          Customer (Contact_Number, First_Name)
        `)
        .eq('Booking_ID', bookingId)
        .single();

      if (!fetchError && bookingData?.Customer) {
        const customer = bookingData.Customer as any;
        if (customer.Contact_Number) {
          const message = smsTemplate
            .replace('{name}', customer.First_Name || 'Customer')
            .replace('{id}', bookingId);
          
          try {
            let formattedNumber = customer.Contact_Number;
            if (formattedNumber.startsWith('0')) {
              formattedNumber = '+63' + formattedNumber.substring(1);
            }
            await sendSMS(formattedNumber, message);
          } catch (smsError) {
            console.error(`Failed to send SMS for booking ${bookingId}:`, smsError);
          }
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
