import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth"; 
import { sendSMS } from '@/lib/sms';

// Helper to send email via the existing API route
const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email via API route');
    }
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

export async function POST(req: Request) {
  // 1. Verify Admin Session & Role
  const session = await verifyAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const { bookingIds, action, payload } = await req.json(); // Destructure payload

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return NextResponse.json({ error: 'Invalid booking IDs' }, { status: 400 });
    }

    const results = [];

    for (const bookingId of bookingIds) {
      let statusId = 0;
      let smsTemplate = '';
      let emailSubject = '';
      let emailBodyTemplate = ''; // New variable to hold rich HTML content specific to the action

      // Prepare updates for Booking_Details table
      let bookingDetailsUpdate: { [key: string]: any } = {};

      // Set Status ID and Templates
      switch (action) {
        case 'approve':
          statusId = 2;
          // Updated SMS with Reminders
          smsTemplate = 'Hi {name}, Good news! Your booking (ID: {id}) has been APPROVED. Reminders:\n- Fuel must be returned to the same level when received\n- No pets are allowed inside the car\n- Strictly no smoking\nSee you soon!';
          
          emailSubject = 'Booking Approved';
          // Rich HTML for Email
          emailBodyTemplate = `
            <p>Good news! Your booking (ID: {id}) has been <strong>APPROVED</strong>.</p>
            <div style="background-color: #ffffcc; padding: 15px; border-radius: 5px; border: 1px solid #e6e600; margin: 15px 0;">
                <strong>Important Reminders:</strong>
                <ul style="margin-bottom: 0;">
                    <li>Fuel level must be returned to the same level when received.</li>
                    <li>No pets are allowed inside the car.</li>
                    <li>Strictly no smoking.</li>
                </ul>
            </div>
            <p>See you soon!</p>
          `;
          
          bookingDetailsUpdate = { Booking_Status_ID: statusId };
          break;

        case 'decline':
          statusId = 6;
          smsTemplate = 'Hi {name}, we regret to inform you that your booking (ID: {id}) has been DECLINED. Please contact us for details.';
          emailSubject = 'Booking Declined';
          emailBodyTemplate = `<p>We regret to inform you that your booking (ID: {id}) has been <strong>DECLINED</strong>. Please contact us for details.</p>`;
          bookingDetailsUpdate = { Booking_Status_ID: statusId };
          break;

        case 'start':
          statusId = 3;
          smsTemplate = 'Hi {name}, your rental (ID: {id}) has officially STARTED. Drive safely!';
          emailSubject = 'Rental Started';
          emailBodyTemplate = `<p>Your rental (ID: {id}) has officially <strong>STARTED</strong>. Drive safely!</p>`;
          bookingDetailsUpdate = { Booking_Status_ID: statusId };
          break;

        case 'finish':
          statusId = 4;
          // Updated SMS with Review Link
          smsTemplate = 'Hi {name}, your booking (ID: {id}) has been COMPLETED. Thank you for choosing us! Please rate your experience here: https://jrjc.vercel.app/compose-review';
          
          emailSubject = 'Booking Completed';
          // Rich HTML with Button/Link
          emailBodyTemplate = `
            <p>Your booking (ID: {id}) has been <strong>COMPLETED</strong>.</p>
            <p>Thank you for choosing us!</p>
            <p>We would love to hear your feedback:</p>
            <p>
                <a href="https://jrjc.vercel.app/compose-review" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Rate your experience</a>
            </p>
            <p style="font-size: 12px; color: #888;">Or click here: https://jrjc.vercel.app/compose-review</p>
          `;

          // Extract finish-specific data from payload
          const { dateReturned, additionalFees, totalPayment, paymentStatus, additionalHours } = payload;
          
          if (!dateReturned || additionalFees === undefined || totalPayment === undefined || !paymentStatus || additionalHours === undefined) {
            results.push({ success: false, bookingId, error: 'Missing finish booking details in payload' });
            continue;
          }

          // Update Booking_Details with date_returned, additional_hours and new status
          bookingDetailsUpdate = { 
            Booking_Status_ID: statusId,
            date_returned: dateReturned,
            additional_hours: additionalHours, 
          };
          break; 

        case 'cancel':
          statusId = 5;
          smsTemplate = 'Hi {name}, your booking (ID: {id}) has been CANCELLED by the admin. Please contact us if this is a mistake.';
          emailSubject = 'Booking Cancelled';
          emailBodyTemplate = `<p>Your booking (ID: {id}) has been <strong>CANCELLED</strong> by the admin. Please contact us if this is a mistake.</p>`;
          bookingDetailsUpdate = { Booking_Status_ID: statusId };
          break;

        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      // Update DB - Booking_Details
      const { error: updateError } = await supabaseAdmin
        .from('Booking_Details')
        .update(bookingDetailsUpdate)
        .eq('Booking_ID', bookingId);

      if (updateError) {
        results.push({ success: false, bookingId, error: updateError.message });
        continue;
      }

      // Handle Payment_Details update only for 'finish' action
      if (action === 'finish') {
        const { additionalFees, totalPayment, paymentStatus } = payload;
        // First, fetch the Payment_Details_ID from the Booking_Details
        const { data: bookingPaymentData, error: fetchPaymentIdError } = await supabaseAdmin
          .from('Booking_Details')
          .select('Payment_Details_ID')
          .eq('Booking_ID', bookingId)
          .single();

        if (fetchPaymentIdError || !bookingPaymentData?.Payment_Details_ID) {
          results.push({ success: false, bookingId, error: fetchPaymentIdError?.message || 'Payment_Details_ID not found for booking' });
          continue;
        }

        // Then, update the Payment_Details record
        const { error: updatePaymentError } = await supabaseAdmin
          .from('Payment_Details')
          .update({
            additional_fees: additionalFees,
            total_payment: totalPayment,
            payment_status: paymentStatus,
          })
          .eq('Payment_ID', bookingPaymentData.Payment_Details_ID);

        if (updatePaymentError) {
          results.push({ success: false, bookingId, error: updatePaymentError.message });
          continue;
        }
      }
      
      // Fetch Customer & Preference
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
        const preference = bookingData.Notification_Preference || 'SMS'; // Default string

        // Prepare SMS Content
        const messageText = smsTemplate
          .replace('{name}', firstName)
          .replace('{id}', bookingId);

        // Prepare Email Content (Using the Rich HTML template)
        const emailBody = emailBodyTemplate
          .replace('{name}', firstName)
          .replace('{id}', bookingId);

        try {
            const promises = [];
            let notificationSent = false;

            // --- 1. Check SMS Preference ---
            if (preference.includes('SMS') && customer.Contact_Number) {
                let formattedNumber = customer.Contact_Number;
                if (formattedNumber.startsWith('0')) {
                    formattedNumber = '+63' + formattedNumber.substring(1);
                }
                promises.push(sendSMS(formattedNumber, messageText));
                notificationSent = true;
            } 

            // --- 2. Check Email Preference (Independent check) ---
            if (preference.includes('Email') && customer.Email) {
                const html = `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">${emailSubject}</h2>
                        <p>Hi ${firstName},</p>
                        ${emailBody}
                        <br/>
                        <p>Thank you,</p>
                        <p>The Team</p>
                    </div>
                `;
                promises.push(sendEmail(customer.Email, emailSubject, html));
                notificationSent = true;
            }

            // --- 3. Fallback: If neither was selected or preference is empty ---
            if (!notificationSent) {
                 if (customer.Contact_Number) {
                     let formattedNumber = customer.Contact_Number;
                     if (formattedNumber.startsWith('0')) formattedNumber = '+63' + formattedNumber.substring(1);
                     promises.push(sendSMS(formattedNumber, messageText));
                 } else if (customer.Email) {
                     // Fallback email wrapper
                     const html = `
                        <div style="font-family: sans-serif; padding: 20px;">
                            <p>Hi ${firstName},</p>
                            ${emailBody}
                        </div>`;
                     promises.push(sendEmail(customer.Email, emailSubject, html));
                 }
            }

            // Wait for all notifications to send
            await Promise.all(promises);

        } catch (notifyError) {
          console.error(`Failed to send notification for booking ${bookingId}:`, notifyError);
        }
      }

      results.push({ success: true, bookingId });
    }

    return NextResponse.json({ results });

  } catch (error: any) {
    console.error('Admin Booking Status Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth"; 
import { sendSMS } from '@/lib/sms';

// Helper to send email via the existing API route
const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email via API route');
    }
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

export async function POST(req: Request) {
  // 1. Verify Admin Session & Role
  const session = await verifyAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const { bookingIds, action, payload } = await req.json(); // Destructure payload

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return NextResponse.json({ error: 'Invalid booking IDs' }, { status: 400 });
    }

    const results = [];

    for (const bookingId of bookingIds) {
      let statusId = 0;
      let smsTemplate = '';
      let emailSubject = '';
      let emailBodyTemplate = ''; // New variable to hold rich HTML content specific to the action

      // Prepare updates for Booking_Details table
      let bookingDetailsUpdate: { [key: string]: any } = {};

      // Set Status ID and Templates
      switch (action) {
        case 'approve':
          statusId = 2;
          // Updated SMS with Reminders
          smsTemplate = 'Hi {name}, Good news! Your booking (ID: {id}) has been APPROVED. Reminders:\n- Fuel must be returned to the same level when received\n- No pets are allowed inside the car\n- Strictly no smoking\nSee you soon!';
          
          emailSubject = 'Booking Approved';
          // Rich HTML for Email
          emailBodyTemplate = `
            <p>Good news! Your booking (ID: {id}) has been <strong>APPROVED</strong>.</p>
            <div style="background-color: #ffffcc; padding: 15px; border-radius: 5px; border: 1px solid #e6e600; margin: 15px 0;">
                <strong>Important Reminders:</strong>
                <ul style="margin-bottom: 0;">
                    <li>Fuel level must be returned to the same level when received.</li>
                    <li>No pets are allowed inside the car.</li>
                    <li>Strictly no smoking.</li>
                </ul>
            </div>
            <p>See you soon!</p>
          `;
          
          bookingDetailsUpdate = { Booking_Status_ID: statusId };
          break;

        case 'decline':
          statusId = 6;
          smsTemplate = 'Hi {name}, we regret to inform you that your booking (ID: {id}) has been DECLINED. Please contact us for details.';
          emailSubject = 'Booking Declined';
          emailBodyTemplate = `<p>We regret to inform you that your booking (ID: {id}) has been <strong>DECLINED</strong>. Please contact us for details.</p>`;
          bookingDetailsUpdate = { Booking_Status_ID: statusId };
          break;

        case 'start':
          statusId = 3;
          smsTemplate = 'Hi {name}, your rental (ID: {id}) has officially STARTED. Drive safely!';
          emailSubject = 'Rental Started';
          emailBodyTemplate = `<p>Your rental (ID: {id}) has officially <strong>STARTED</strong>. Drive safely!</p>`;
          bookingDetailsUpdate = { Booking_Status_ID: statusId };
          break;

        case 'finish':
          statusId = 4;
          // Updated SMS with Review Link
          smsTemplate = 'Hi {name}, your booking (ID: {id}) has been COMPLETED. Thank you for choosing us! Please rate your experience here: https://jrjc.vercel.app/compose-review';
          
          emailSubject = 'Booking Completed';
          // Rich HTML with Button/Link
          emailBodyTemplate = `
            <p>Your booking (ID: {id}) has been <strong>COMPLETED</strong>.</p>
            <p>Thank you for choosing us!</p>
            <p>We would love to hear your feedback:</p>
            <p>
                <a href="https://jrjc.vercel.app/compose-review" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Rate your experience</a>
            </p>
            <p style="font-size: 12px; color: #888;">Or click here: https://jrjc.vercel.app/compose-review</p>
          `;

          // Extract finish-specific data from payload
          const { dateReturned, additionalFees, totalPayment, paymentStatus, additionalHours } = payload;
          
          if (!dateReturned || additionalFees === undefined || totalPayment === undefined || !paymentStatus || additionalHours === undefined) {
            results.push({ success: false, bookingId, error: 'Missing finish booking details in payload' });
            continue;
          }

          // Update Booking_Details with date_returned, additional_hours and new status
          bookingDetailsUpdate = { 
            Booking_Status_ID: statusId,
            date_returned: dateReturned,
            additional_hours: additionalHours, 
          };
          break; 

        case 'cancel':
          statusId = 5;
          smsTemplate = 'Hi {name}, your booking (ID: {id}) has been CANCELLED by the admin. Please contact us if this is a mistake.';
          emailSubject = 'Booking Cancelled';
          emailBodyTemplate = `<p>Your booking (ID: {id}) has been <strong>CANCELLED</strong> by the admin. Please contact us if this is a mistake.</p>`;
          bookingDetailsUpdate = { Booking_Status_ID: statusId };
          break;

        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      // Update DB - Booking_Details
      const { error: updateError } = await supabaseAdmin
        .from('Booking_Details')
        .update(bookingDetailsUpdate)
        .eq('Booking_ID', bookingId);

      if (updateError) {
        results.push({ success: false, bookingId, error: updateError.message });
        continue;
      }

      // Handle Payment_Details update only for 'finish' action
      if (action === 'finish') {
        const { additionalFees, totalPayment, paymentStatus } = payload;
        // First, fetch the Payment_Details_ID from the Booking_Details
        const { data: bookingPaymentData, error: fetchPaymentIdError } = await supabaseAdmin
          .from('Booking_Details')
          .select('Payment_Details_ID')
          .eq('Booking_ID', bookingId)
          .single();

        if (fetchPaymentIdError || !bookingPaymentData?.Payment_Details_ID) {
          results.push({ success: false, bookingId, error: fetchPaymentIdError?.message || 'Payment_Details_ID not found for booking' });
          continue;
        }

        // Then, update the Payment_Details record
        const { error: updatePaymentError } = await supabaseAdmin
          .from('Payment_Details')
          .update({
            additional_fees: additionalFees,
            total_payment: totalPayment,
            payment_status: paymentStatus,
          })
          .eq('Payment_ID', bookingPaymentData.Payment_Details_ID);

        if (updatePaymentError) {
          results.push({ success: false, bookingId, error: updatePaymentError.message });
          continue;
        }
      }
      
      // Fetch Customer & Preference
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
        const preference = bookingData.Notification_Preference || 'SMS'; // Default string

        // Prepare SMS Content
        const messageText = smsTemplate
          .replace('{name}', firstName)
          .replace('{id}', bookingId);

        // Prepare Email Content (Using the Rich HTML template)
        const emailBody = emailBodyTemplate
          .replace('{name}', firstName)
          .replace('{id}', bookingId);

        try {
            const promises = [];
            let notificationSent = false;

            // --- 1. Check SMS Preference ---
            if (preference.includes('SMS') && customer.Contact_Number) {
                let formattedNumber = customer.Contact_Number;
                if (formattedNumber.startsWith('0')) {
                    formattedNumber = '+63' + formattedNumber.substring(1);
                }
                promises.push(sendSMS(formattedNumber, messageText));
                notificationSent = true;
            } 

            // --- 2. Check Email Preference (Independent check) ---
            if (preference.includes('Email') && customer.Email) {
                const html = `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">${emailSubject}</h2>
                        <p>Hi ${firstName},</p>
                        ${emailBody}
                        <br/>
                        <p>Thank you,</p>
                        <p>The Team</p>
                    </div>
                `;
                promises.push(sendEmail(customer.Email, emailSubject, html));
                notificationSent = true;
            }

            // --- 3. Fallback: If neither was selected or preference is empty ---
            if (!notificationSent) {
                 if (customer.Contact_Number) {
                     let formattedNumber = customer.Contact_Number;
                     if (formattedNumber.startsWith('0')) formattedNumber = '+63' + formattedNumber.substring(1);
                     promises.push(sendSMS(formattedNumber, messageText));
                 } else if (customer.Email) {
                     // Fallback email wrapper
                     const html = `
                        <div style="font-family: sans-serif; padding: 20px;">
                            <p>Hi ${firstName},</p>
                            ${emailBody}
                        </div>`;
                     promises.push(sendEmail(customer.Email, emailSubject, html));
                 }
            }

            // Wait for all notifications to send
            await Promise.all(promises);

        } catch (notifyError) {
          console.error(`Failed to send notification for booking ${bookingId}:`, notifyError);
        }
      }

      results.push({ success: true, bookingId });
    }

    return NextResponse.json({ results });

  } catch (error: any) {
    console.error('Admin Booking Status Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth"; 
import { sendSMS } from '@/lib/sms';

// Helper to send email via the existing API route
const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email via API route');
    }
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

export async function POST(req: Request) {
  // 1. Verify Admin Session & Role
  const session = await verifyAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const { bookingIds, action, payload } = await req.json(); // Destructure payload

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return NextResponse.json({ error: 'Invalid booking IDs' }, { status: 400 });
    }

    const results = [];

    for (const bookingId of bookingIds) {
      let statusId = 0;
      let smsTemplate = '';
      let emailSubject = '';
      let emailBodyTemplate = ''; // New variable to hold rich HTML content specific to the action

      // Prepare updates for Booking_Details table
      let bookingDetailsUpdate: { [key: string]: any } = {};

      // Set Status ID and Templates
      switch (action) {
        case 'approve':
          statusId = 2;
          // Updated SMS with Reminders
          smsTemplate = 'Hi {name}, Good news! Your booking (ID: {id}) has been APPROVED. Reminders:\n- Fuel must be returned to the same level when received\n- No pets are allowed inside the car\n- Strictly no smoking\nSee you soon!';
          
          emailSubject = 'Booking Approved';
          // Rich HTML for Email
          emailBodyTemplate = `
            <p>Good news! Your booking (ID: {id}) has been <strong>APPROVED</strong>.</p>
            <div style="background-color: #ffffcc; padding: 15px; border-radius: 5px; border: 1px solid #e6e600; margin: 15px 0;">
                <strong>Important Reminders:</strong>
                <ul style="margin-bottom: 0;">
                    <li>Fuel level must be returned to the same level when received.</li>
                    <li>No pets are allowed inside the car.</li>
                    <li>Strictly no smoking.</li>
                </ul>
            </div>
            <p>See you soon!</p>
          `;
          
          bookingDetailsUpdate = { Booking_Status_ID: statusId };
          break;

        case 'decline':
          statusId = 6;
          smsTemplate = 'Hi {name}, we regret to inform you that your booking (ID: {id}) has been DECLINED. Please contact us for details.';
          emailSubject = 'Booking Declined';
          emailBodyTemplate = `<p>We regret to inform you that your booking (ID: {id}) has been <strong>DECLINED</strong>. Please contact us for details.</p>`;
          bookingDetailsUpdate = { Booking_Status_ID: statusId };
          break;

        case 'start':
          statusId = 3;
          smsTemplate = 'Hi {name}, your rental (ID: {id}) has officially STARTED. Drive safely!';
          emailSubject = 'Rental Started';
          emailBodyTemplate = `<p>Your rental (ID: {id}) has officially <strong>STARTED</strong>. Drive safely!</p>`;
          bookingDetailsUpdate = { Booking_Status_ID: statusId };
          break;

        case 'finish':
          statusId = 4;
          // Updated SMS with Review Link
          smsTemplate = 'Hi {name}, your booking (ID: {id}) has been COMPLETED. Thank you for choosing us! Please rate your experience here: https://jrjc.vercel.app/compose-review';
          
          emailSubject = 'Booking Completed';
          // Rich HTML with Button/Link
          emailBodyTemplate = `
            <p>Your booking (ID: {id}) has been <strong>COMPLETED</strong>.</p>
            <p>Thank you for choosing us!</p>
            <p>We would love to hear your feedback:</p>
            <p>
                <a href="https://jrjc.vercel.app/compose-review" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Rate your experience</a>
            </p>
            <p style="font-size: 12px; color: #888;">Or click here: https://jrjc.vercel.app/compose-review</p>
          `;

          // Extract finish-specific data from payload
          const { dateReturned, additionalFees, totalPayment, paymentStatus, additionalHours } = payload;
          
          if (!dateReturned || additionalFees === undefined || totalPayment === undefined || !paymentStatus || additionalHours === undefined) {
            results.push({ success: false, bookingId, error: 'Missing finish booking details in payload' });
            continue;
          }

          // Update Booking_Details with date_returned, additional_hours and new status
          bookingDetailsUpdate = { 
            Booking_Status_ID: statusId,
            date_returned: dateReturned,
            additional_hours: additionalHours, 
          };
          break; 

        case 'cancel':
          statusId = 5;
          smsTemplate = 'Hi {name}, your booking (ID: {id}) has been CANCELLED by the admin. Please contact us if this is a mistake.';
          emailSubject = 'Booking Cancelled';
          emailBodyTemplate = `<p>Your booking (ID: {id}) has been <strong>CANCELLED</strong> by the admin. Please contact us if this is a mistake.</p>`;
          bookingDetailsUpdate = { Booking_Status_ID: statusId };
          break;

        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      // Update DB - Booking_Details
      const { error: updateError } = await supabaseAdmin
        .from('Booking_Details')
        .update(bookingDetailsUpdate)
        .eq('Booking_ID', bookingId);

      if (updateError) {
        results.push({ success: false, bookingId, error: updateError.message });
        continue;
      }

      // Handle Payment_Details update only for 'finish' action
      if (action === 'finish') {
        const { additionalFees, totalPayment, paymentStatus } = payload;
        // First, fetch the Payment_Details_ID from the Booking_Details
        const { data: bookingPaymentData, error: fetchPaymentIdError } = await supabaseAdmin
          .from('Booking_Details')
          .select('Payment_Details_ID')
          .eq('Booking_ID', bookingId)
          .single();

        if (fetchPaymentIdError || !bookingPaymentData?.Payment_Details_ID) {
          results.push({ success: false, bookingId, error: fetchPaymentIdError?.message || 'Payment_Details_ID not found for booking' });
          continue;
        }

        // Then, update the Payment_Details record
        const { error: updatePaymentError } = await supabaseAdmin
          .from('Payment_Details')
          .update({
            additional_fees: additionalFees,
            total_payment: totalPayment,
            payment_status: paymentStatus,
          })
          .eq('Payment_ID', bookingPaymentData.Payment_Details_ID);

        if (updatePaymentError) {
          results.push({ success: false, bookingId, error: updatePaymentError.message });
          continue;
        }
      }
      
      // Fetch Customer & Preference
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
        const preference = bookingData.Notification_Preference || 'SMS'; // Default string

        // Prepare SMS Content
        const messageText = smsTemplate
          .replace('{name}', firstName)
          .replace('{id}', bookingId);

        // Prepare Email Content (Using the Rich HTML template)
        const emailBody = emailBodyTemplate
          .replace('{name}', firstName)
          .replace('{id}', bookingId);

        try {
            const promises = [];
            let notificationSent = false;

            // --- 1. Check SMS Preference ---
            if (preference.includes('SMS') && customer.Contact_Number) {
                let formattedNumber = customer.Contact_Number;
                if (formattedNumber.startsWith('0')) {
                    formattedNumber = '+63' + formattedNumber.substring(1);
                }
                promises.push(sendSMS(formattedNumber, messageText));
                notificationSent = true;
            } 

            // --- 2. Check Email Preference (Independent check) ---
            if (preference.includes('Email') && customer.Email) {
                const html = `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">${emailSubject}</h2>
                        <p>Hi ${firstName},</p>
                        ${emailBody}
                        <br/>
                        <p>Thank you,</p>
                        <p>The Team</p>
                    </div>
                `;
                promises.push(sendEmail(customer.Email, emailSubject, html));
                notificationSent = true;
            }

            // --- 3. Fallback: If neither was selected or preference is empty ---
            if (!notificationSent) {
                 if (customer.Contact_Number) {
                     let formattedNumber = customer.Contact_Number;
                     if (formattedNumber.startsWith('0')) formattedNumber = '+63' + formattedNumber.substring(1);
                     promises.push(sendSMS(formattedNumber, messageText));
                 } else if (customer.Email) {
                     // Fallback email wrapper
                     const html = `
                        <div style="font-family: sans-serif; padding: 20px;">
                            <p>Hi ${firstName},</p>
                            ${emailBody}
                        </div>`;
                     promises.push(sendEmail(customer.Email, emailSubject, html));
                 }
            }

            // Wait for all notifications to send
            await Promise.all(promises);

        } catch (notifyError) {
          console.error(`Failed to send notification for booking ${bookingId}:`, notifyError);
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