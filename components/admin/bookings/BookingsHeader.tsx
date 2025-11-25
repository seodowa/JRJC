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
  onApprove: () => void;
  onDecline: () => void;
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
}: BookingsHeaderProps) => {
  const router = useRouter();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{view === 'history' ? 'Bookings History' : 'Manage Bookings'}</h1>
        {view === 'history' ? (
          <AsyncButton onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded-md
                                                                     hover:bg-[#A1E3F9]">
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
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <SearchBar
            placeholder="Search by name or booking ID..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-80"
          />
          {view !== 'history' && (
            <>
                <AsyncButton onClick={onSelectAll} className="border-1 border-gray-300 p-2 bg-[#A1E3F9] rounded-lg text-white
                                                            hover:bg-blue-400">
                    {isAllSelected ? 'Deselect' : 'Select All'}
                </AsyncButton>
                <AsyncButton onClick={() => router.push('/adminSU/manageBookings/walk-inBooking')} className="border border-gray-300 p-2 bg-[#A1E3F9] rounded-lg text-white hover:bg-blue-400">
                    Walk-in Book
                </AsyncButton>
            </>
          )}
        </div>
        {view !== 'history' && (
          <div className="flex items-center space-x-2">
              <AsyncButton onClick={onDecline} className="px-4 py-2 border border-gray-400 text-red-500 rounded-lg
                                    hover:bg-red-400 hover:text-white">
                  Decline
              </AsyncButton>
              <AsyncButton onClick={onApprove} className="px-4 py-2 border border-gray-400 bg-[#A1E3F9] text-white rounded-lg
                                hover:bg-blue-300">
                  Approve
              </AsyncButton>
              <AsyncButton className="px-4 py-2 border border-gray-400 text-red-500 rounded-lg
                                  hover:bg-red-400 hover:text-white">
                  Cancel
              </AsyncButton>
              <AsyncButton className="px-4 py-2 border border-gray-400 bg-[#A1E3F9] text-white rounded-lg
                                hover:bg-blue-400">
                  Start
              </AsyncButton>
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
