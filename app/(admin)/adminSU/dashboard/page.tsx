// This is a Server Component
import { fetchDashboardCars } from '@/lib/supabase/queries/admin/fetchDashboardCars';
import { fetchUser } from '@/lib/supabase/queries/admin/fetchUser';
import { fetchOngoingBookings } from '@/lib/supabase/queries/admin/fetchOngoingBookings';
import { fetchPendingBookings } from '@/lib/supabase/queries/admin/fetchPendingBookings';
import { fetchAllReviews } from '@/lib/supabase/queries/admin/fetchReviews';
import WelcomeMessage from '@/components/admin/dashboard/WelcomeMessage';
import Bookings from '@/components/admin/dashboard/Bookings';
import CustomCalendar from '@/components/admin/dashboard/CustomCalendar';
import RecentFeedback from '@/components/admin/dashboard/RecentFeedback';
import Cars from '@/components/admin/dashboard/Cars';
import { RealtimeRefresher } from '@/components/admin/dashboard/RealtimeRefresher';

export default async function DashboardPage() {
  const cardBaseStyle = "bg-white p-6 rounded-4xl shadow-md";

  // Fetch all data in parallel
  const [cars, user, ongoingBookings, pendingBookings, allReviews] = await Promise.all([
    fetchDashboardCars(),
    fetchUser(),
    fetchOngoingBookings(),
    fetchPendingBookings(),
    fetchAllReviews()
  ]);

  // Filter reviews for the last 30 days and sort by recent
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentReviews = allReviews
    .filter(review => new Date(review.createdAt) > thirtyDaysAgo)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-2 md:p-4 min-h-screen">
      <RealtimeRefresher />
      <div className="grid grid-cols-1 xl:grid-cols-3 xl:gap-6 space-y-6 xl:space-y-0 xl:items-stretch">

        {/* Main content area (Left) */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">

            {/* Welcome & Bookings Column */}
            <div className="md:col-span-1 flex flex-col gap-6">
              <div className={`${cardBaseStyle} max-h-40 overflow-y-auto`}>
                <WelcomeMessage user={user} />
              </div>
              <div className={`${cardBaseStyle} flex-grow h-96 overflow-y-auto`}>
                <Bookings bookings={pendingBookings} />
              </div>
            </div>

            {/* Calendar */}
            <div className={`md:col-span-2 ${cardBaseStyle} max-h-136 overflow-y-hidden`}>
              <CustomCalendar bookings={ongoingBookings} />
            </div>
          </div>

          {/* Bottom row: Recent Feedback */}
          <div className={`${cardBaseStyle} flex-grow overflow-y-auto`}>
            <RecentFeedback reviews={recentReviews} />
          </div>
        </div>

        {/* Right column: Cars */}
        <div className={`xl:col-span-1 ${cardBaseStyle} max-h-[90vh] overflow-y-auto`}>
          <Cars cars={cars} />
        </div>

      </div>
    </div>
  );
}