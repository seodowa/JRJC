import { fetchAdminBookings, fetchBookingStatuses } from '@/lib/supabase/queries/admin/fetchBookings';
import BookingsPageClient from '@/components/admin/bookings/BookingsPageClient';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { RealtimeBookingsRefresher } from '@/components/admin/bookings/RealtimeBookingsRefresher';

export const dynamic = 'force-dynamic';

const ManageBookingsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const resolvedSearchParams = await searchParams;
  const view = resolvedSearchParams?.view || 'default';
  const query = (resolvedSearchParams?.query as string) || '';

  const allBookings = await fetchAdminBookings(query);
  
  const bookings = view === 'history'
    ? allBookings.filter(booking => booking.status === 'Completed')
    : allBookings.filter(booking => booking.status !== 'Completed');

  const bookingStatuses = await fetchBookingStatuses();

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full w-full"><LoadingSpinner /></div>}>
      <RealtimeBookingsRefresher />
      <BookingsPageClient 
        bookings={bookings} 
        view={view as string}
        bookingStatuses={bookingStatuses} 
      />
    </Suspense>
  );
};

export default ManageBookingsPage;