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
    // 3. Loop and Send
    for (const booking of bookings) {
      // --- SAFE EXTRACTION START ---
      // Handle Supabase returning either an Array or an Object for relations
      const customerData = Array.isArray(booking.Customer) ? booking.Customer[0] : booking.Customer;
      const carModelData = Array.isArray(booking.Car_Models) ? booking.Car_Models[0] : booking.Car_Models;

      // Skip if data is missing
      if (!customerData || !carModelData) {
        console.warn(`Skipping Booking ${booking.Booking_ID}: Incomplete data.`);
        continue;
      }

      // Safe access to properties
      const customerName = customerData.First_Name;
      const rawContactNumber = customerData.Contact_Number; // <--- This fixes your current error
      
      // Handle nested Manufacturer
      const manufacturerData = Array.isArray(carModelData.Manufacturer) 
        ? carModelData.Manufacturer[0] 
        : carModelData.Manufacturer;
      
      const carBrand = manufacturerData?.Manufacturer_Name || "";
      const carModel = carModelData.Model_Name;
      // --- SAFE EXTRACTION END ---

      const fullCarName = `${carBrand} ${carModel}`.trim();

      // Format Date
      const dateObj = new Date(booking.Booking_Start_Date_Time);
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      // Create Message
      const message = `Hi ${customerName}, reminder for your rental of ${fullCarName} tomorrow (${dateStr} at ${timeStr}). Ref: ${booking.Booking_ID}. See you soon!`;

      // Format Number safely using the variable we created above
      let formattedNumber = rawContactNumber; 
      if (formattedNumber && formattedNumber.startsWith('0')) {
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