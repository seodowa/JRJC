'use client';

import WelcomeMessage from '@/components/admin/dashboard/WelcomeMessage';
import Bookings from '@/components/admin/dashboard/Bookings';
import Calendar from '@/components/admin/dashboard/Calendar';
import RecentFeedback from '@/components/admin/dashboard/RecentFeedback';
import Cars from '@/components/admin/dashboard/Cars';

export default function DashboardPage() {
  const cardBaseStyle = "bg-white p-6 rounded-[30px] shadow-md";

  return (
    <div className="p-2 md:p-4 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 xl:grid-cols-3 xl:gap-6 space-y-6 xl:space-y-0">

        {/* Main content area (Left) */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Welcome & Bookings Column */}
            <div className="md:col-span-1 flex flex-col gap-6">
              <div className={`${cardBaseStyle} max-h-40 overflow-y-auto`}>
                <WelcomeMessage />
              </div>
              <div className={`${cardBaseStyle} flex-grow h-96 overflow-y-auto`}>
                <Bookings />
              </div>
            </div>

            {/* Calendar */}
            <div className={`md:col-span-2 ${cardBaseStyle} max-h-[500px] overflow-y-auto`}>
              <Calendar />
            </div>
          </div>

          {/* Bottom row: Recent Feedback */}
          <div className={`${cardBaseStyle} max-h-96 overflow-y-auto`}>
            <RecentFeedback />
          </div>
        </div>

        {/* Right column: Cars */}
        <div className={`xl:col-span-1 ${cardBaseStyle} max-h-[90vh] overflow-y-auto`}>
          <Cars />
        </div>

      </div>
    </div>
  );
}