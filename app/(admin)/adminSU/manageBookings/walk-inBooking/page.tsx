import WalkInBookingClient from '@/components/admin/bookings/walk-in/WalkInBookingClient';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

const WalkInBookingPage = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full w-full"><LoadingSpinner /></div>}>
      <WalkInBookingClient />
    </Suspense>
  );
};

export default WalkInBookingPage;