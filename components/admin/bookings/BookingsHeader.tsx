'use client';

import React from 'react';
import SearchBar from '@/components/SearchBar';
import AsyncButton from "@/components/AsyncButton";
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
      <div className="flex flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">{view === 'history' ? 'Bookings History' : 'Manage Bookings'}</h1>
        {view === 'history' ? (
          <AsyncButton onClick={() => router.back()} className="px-4 py-2 shadow-sm bg-gray-200 rounded-md hover:bg-[#A1E3F9]">
            Back
          </AsyncButton>
        ) : (
          <Link href="?view=history" passHref>
            <AsyncButton className="p-2 rounded-full hover:bg-gray-200">
              <HistoryIcon className="w-6 h-6" />
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
                <AsyncButton onClick={onSelectAll} className="shadow-sm p-2 bg-[#A1E3F9] rounded-lg text-white hover:bg-blue-400 flex-1 md:flex-none text-center justify-center">
                  {isAllSelected ? 'Deselect' : 'Select All'}
                </AsyncButton>
              )}
              <AsyncButton onClick={() => router.push('/adminSU/manageBookings/walk-inBooking')}
                className="shadow-sm p-2 bg-[#A1E3F9] rounded-lg text-white hover:bg-blue-400 flex-1 md:flex-none text-center justify-center">
                Walk-in Book
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
                  className="px-4 py-2 shadow-sm text-red-500 rounded-lg hover:bg-red-400 hover:text-white"
                >
                  Decline
                </AsyncButton>
                <AsyncButton 
                  onClick={onApprove} 
                  className="px-4 py-2 shadow-sm bg-[#A1E3F9] text-white rounded-lg hover:bg-blue-300"
                >
                  Approve
                </AsyncButton>
              </>
            )}
            {activeTab === 'Confirmed' && (
              <>
                <AsyncButton 
                  onClick={onCancel} 
                  className="px-4 py-2 shadow-sm text-red-500 rounded-lg hover:bg-red-400 hover:text-white"
                >
                  Cancel
                </AsyncButton>
                <AsyncButton 
                  onClick={onStart} 
                  className="px-4 py-2 shadow-sm bg-[#A1E3F9] text-white rounded-lg hover:bg-blue-400"
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
                  className={`px-4 py-2 shadow-sm text-gray-700 rounded-lg hover:bg-green-400 ${isExtendDisabled ? 'opacity-50 cursor-not-allowed hover:bg-gray-100' : ''}`}
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