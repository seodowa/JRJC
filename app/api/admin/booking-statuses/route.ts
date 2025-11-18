import { fetchBookingStatuses } from '@/lib/supabase/queries/fetchAdminBookings';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const statuses = await fetchBookingStatuses();
    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error fetching booking statuses:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
