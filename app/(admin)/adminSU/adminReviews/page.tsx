import { fetchAllReviews } from '@/lib/supabase/queries/fetchReviews';
import ReviewsPageClient from '@/components/admin/reviews/ReviewsPageClient';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { fetchCars } from '@/lib/supabase/queries/fetchCars';

export const dynamic = 'force-dynamic';

const AdminReviewsPage = async () => {
  const reviews = await fetchAllReviews();
  const cars = await fetchCars();

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full w-full"><LoadingSpinner /></div>}>
      <ReviewsPageClient reviews={reviews} cars={cars} />
    </Suspense>
  );
};

export default AdminReviewsPage;