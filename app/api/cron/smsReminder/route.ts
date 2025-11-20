// app/api/cron/send-reminders/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';

// Force dynamic to ensure it checks the time accurately every run
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();

  try {
    console.log("Starting reminder check...");

    // 1. Calculate "Tomorrow"
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // 2. Query with the CORRECT table structure
    const { data: bookings, error } = await supabase
      .from('Booking_Details')
      .select(`
        Booking_ID,
        Booking_Start_Date_Time,
        reminder_sent,
        Booking_Status_ID,
        Customer (
          First_Name,
          Contact_Number
        ),
        Car_Models (
          Model_Name,
          Manufacturer (
            Manufacturer_Name
          )
        )
      `)
      .gte('Booking_Start_Date_Time', tomorrowStart.toISOString())
      .lte('Booking_Start_Date_Time', tomorrowEnd.toISOString())
      .eq('reminder_sent', false) 
      .neq('Booking_Status_ID', 3); // Assuming 3 is Cancelled

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ message: 'No bookings require reminders today.' });
    }

    const results = [];

    // 3. Loop and Send
    for (const booking of bookings) {
      // Safety checks in case data is missing
      if (!booking.Customer || !booking.Car_Models) continue;

      // Extract Data based on your Schema
      const customerName = booking.Customer.First_Name;
      
      // Access nested data: Car_Models -> Manufacturer -> Name
      // We use optional chaining (?.) just in case a car has no manufacturer assigned
      const carBrand = booking.Car_Models.Manufacturer?.Manufacturer_Name || "";
      const carModel = booking.Car_Models.Model_Name;
      const fullCarName = `${carBrand} ${carModel}`.trim();

      // Format Date
      const dateObj = new Date(booking.Booking_Start_Date_Time);
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      // Create Message
      const message = `Hi ${customerName}, reminder for your rental of ${fullCarName} tomorrow (${dateStr} at ${timeStr}). Ref: ${booking.Booking_ID}. See you soon!`;

      let formattedNumber = booking.Customer.Contact_Number;
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '+63' + formattedNumber.substring(1);
      }

      // Send SMS
      const smsRes = await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formattedNumber,
          text: message
        })
      });

      const smsData = await smsRes.json();

      if (smsData.success) {
        // Mark as sent
        await supabase
          .from('Booking_Details')
          .update({ reminder_sent: true })
          .eq('Booking_ID', booking.Booking_ID);

        results.push({ id: booking.Booking_ID, status: 'Sent', car: fullCarName });
      } else {
        results.push({ id: booking.Booking_ID, status: 'Failed', error: smsData.error });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: results.length, 
      details: results 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}