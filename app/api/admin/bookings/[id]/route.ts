import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
  }

  // Using the same relationship structure as fetchBookings.ts which is confirmed working
  const { data, error } = await supabaseAdmin
    .from('Booking_Details')
    .select(`
      Booking_ID,
      Booking_Start_Date_Time,
      Booking_End_Date_Time,
      Duration,
      Location,
      date_created,
      additional_hours,
      date_returned,
      Payment_Details_ID,
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
      Booking_Status (
        Name
      ),
      Payment_Details (
        Payment_ID,
        booking_fee,
        initial_total_payment,
        additional_fees,
        total_payment,
        payment_status,
        bf_reference_number
      )
    `)
    .eq('Booking_ID', id)
    .single();

  if (error) {
    console.error('Error fetching specific booking details:', error);
    return NextResponse.json({ error: 'Failed to fetch booking details' }, { status: 500 });
  }

  return NextResponse.json(data);
}
