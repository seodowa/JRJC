import { fetchAdminBookings } from '@/lib/supabase/queries/fetchAdminBookings';
import BookingsPageClient from '@/components/admin/bookings/BookingsPageClient';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

export const dynamic = 'force-dynamic';

const ManageBookingsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || '';
  const bookings = await fetchAdminBookings(query);

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full w-full"><LoadingSpinner /></div>}>
      <BookingsPageClient bookings={bookings} />
    </Suspense>
  );
};

export default ManageBookingsPage;