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
  const cardBaseStyle = "rounded-md border border-line bg-surface p-6";

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

  const availableCars = cars.filter(car => car.status_id === 1).length;
  const kpis = [
    { label: 'Pending', value: pendingBookings.length, note: 'Need approval' },
    { label: 'On trip', value: ongoingBookings.length, note: 'Ongoing bookings' },
    { label: 'Available', value: availableCars, note: `of ${cars.length} cars` },
    { label: 'Reviews', value: recentReviews.length, note: 'Last 30 days' },
  ];

  return (
    <div className="flex min-h-full flex-col gap-8 pb-8 md:h-full md:overflow-y-auto md:pr-2 custom-scrollbar">
      <RealtimeRefresher />
      <WelcomeMessage user={user} />

      <dl className="grid grid-cols-2 border-t border-b border-t-ink border-b-line md:grid-cols-4">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`flex flex-col gap-2 border-line py-5 ${i % 2 === 0 ? 'border-r pr-4' : 'pl-4'} ${i >= 2 ? 'border-t md:border-t-0' : ''} ${i < 3 ? 'md:border-r md:pr-6' : 'md:border-r-0'} ${i > 0 ? 'md:pl-6' : 'md:pl-0'}`}
          >
            <dt className="eyebrow">{kpi.label}</dt>
            <dd className="font-display text-5xl leading-[0.9] tracking-[-0.04em] md:text-6xl">{kpi.value}</dd>
            <dd className="text-sm text-ink-2">{kpi.note}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start">
        {/* Main content area (Left) */}
        <div className="flex flex-col gap-6 xl:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className={`${cardBaseStyle} h-96 overflow-y-auto md:h-auto md:max-h-136 custom-scrollbar`}>
              <Bookings bookings={pendingBookings} />
            </div>
            <div className={`md:col-span-2 ${cardBaseStyle} max-h-136 overflow-y-hidden`}>
              <CustomCalendar bookings={ongoingBookings} />
            </div>
          </div>

          <div className={`${cardBaseStyle} overflow-y-auto`}>
            <RecentFeedback reviews={recentReviews} />
          </div>
        </div>

        {/* Right column: Cars */}
        <div className={`xl:col-span-1 ${cardBaseStyle} max-h-[90vh] overflow-y-auto custom-scrollbar`}>
          <Cars cars={cars} />
        </div>
      </div>
    </div>
  );
}
