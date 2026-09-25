'use client';

import React from 'react';
import SearchBar from '@/components/SearchBar';
import AsyncButton from "@/components/AsyncButton";
import { buttonClass } from "@/components/ui/button";
import BookingTabs from './BookingTabs';
import HistoryIcon from '@/components/icons/HistoryIcon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type BookingsHeaderProps = {
  view: string;
  onSearch: (term: string) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  bookingStatuses: string[];
  showCheckboxes: boolean;
  onApprove: () => Promise<void> | void;
  onDecline: () => Promise<void> | void;
  onStart: () => Promise<void> | void;
  onCancel: () => Promise<void> | void;
  onExtend: () => Promise<void> | void;
  isExtendDisabled?: boolean;
};

const BookingsHeader = ({
  view,
  onSearch,
  onSelectAll,
  isAllSelected,
  activeTab,
  onTabChange,
  bookingStatuses,
  showCheckboxes,
  onApprove,
  onDecline,
  onStart,
  onCancel,
  onExtend,
  isExtendDisabled = false,
}: BookingsHeaderProps) => {
  const router = useRouter();

  return (
    <div>
      {/* Changed to flex-row and justify-between for all screen sizes */}
      <div className="flex flex-row justify-between items-end gap-4 mb-6">
        <h1 className="text-4xl leading-none font-normal tracking-[-0.03em] md:text-5xl">{view === 'history' ? 'Booking history' : 'Bookings'}</h1>
        {view === 'history' ? (
          <AsyncButton onClick={() => router.back()} className={buttonClass("secondary", "sm")}>
            Back
          </AsyncButton>
        ) : (
          <Link href="?view=history" passHref>
            <AsyncButton className={buttonClass("ghost", "sm")} aria-label="Booking history">
              <HistoryIcon className="w-5 h-5" /> <span className="hidden sm:inline">History</span>
            </AsyncButton>
          </Link>
        )}
      </div>
      
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full xl:w-auto">
          <SearchBar
            placeholder="Search by name or booking ID..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full md:w-80"
          />
          {view !== 'history' && (
            <div className="flex gap-2 w-full md:w-auto">
              {activeTab !== 'All' && (
                <AsyncButton onClick={onSelectAll} className={buttonClass("secondary", "md", "flex-1 md:flex-none")}>
                  {isAllSelected ? 'Deselect' : 'Select All'}
                </AsyncButton>
              )}
              <AsyncButton onClick={() => router.push('/adminSU/manageBookings/walk-inBooking')}
                className={buttonClass("primary", "md", "flex-1 md:flex-none")}>
                + Walk-in booking
              </AsyncButton>
            </div>
          )}
        </div>
        {view !== 'history' && (
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            {activeTab === 'Pending' && (
              <>
                <AsyncButton 
                  onClick={onDecline} 
                  className={buttonClass("secondary", "md", "border-red-600 text-red-700 hover:bg-red-600 hover:text-paper")}
                >
                  Decline
                </AsyncButton>
                <AsyncButton 
                  onClick={onApprove} 
                  className={buttonClass("primary", "md")}
                >
                  Approve
                </AsyncButton>
              </>
            )}
            {activeTab === 'Confirmed' && (
              <>
                <AsyncButton 
                  onClick={onCancel} 
                  className={buttonClass("secondary", "md", "border-red-600 text-red-700 hover:bg-red-600 hover:text-paper")}
                >
                  Cancel
                </AsyncButton>
                <AsyncButton 
                  onClick={onStart} 
                  className={buttonClass("primary", "md")}
                >
                  Start
                </AsyncButton>
              </>
            )}
            {activeTab === 'Ongoing' && (
              <>
                <AsyncButton 
                  onClick={onExtend} 
                  disabled={isExtendDisabled}
                  className={buttonClass("secondary", "md")}
                >
                  Extend
                </AsyncButton>
              </>
            )}
          </div>
        )}
      </div>
      {view !== 'history' && (
        <div className="mt-4">
          <BookingTabs
            activeTab={activeTab}
            onTabChange={onTabChange}
            tabs={bookingStatuses}
          />
        </div>
      )}

    </div>
  );
};

export default BookingsHeader;