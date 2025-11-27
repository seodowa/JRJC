'use client';

import React from 'react';
import SearchBar from '@/components/SearchBar';
import AsyncButton from "@/components/AsyncButton";
import BookingTabs from './BookingTabs';
import HistoryIcon from '@/components/icons/HistoryIcon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/toast/use-toast"; 
// REMOVED: import { Toaster } from "sonner"; <--- No longer needed here

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
  onFinish: () => Promise<void> | void;
  onExtend: () => Promise<void> | void;
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
  onFinish,
  onExtend,
}: BookingsHeaderProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleAction = async (
    actionFn: () => Promise<void> | void,
    successTitle: string,
    successDescription: string
  ) => {
    try {
      await actionFn();
      
      toast({
        title: successTitle,
        description: successDescription,
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      
      toast({
        title: "Error",
        description: "An unexpected error occurred while processing.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {/* REMOVED: <Toaster /> <--- This was causing the error because it exists in Layout */}

      <div className="flex justify-between items-center mb-6">
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
      
      {/* ... Rest of the component remains exactly the same ... */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <SearchBar
            placeholder="Search by name or booking ID..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-80"
          />
          {view !== 'history' && (
            <>
              {activeTab !== 'All' && (
                <AsyncButton onClick={onSelectAll} className="shadow-sm p-2 bg-[#A1E3F9] rounded-lg text-white hover:bg-blue-400">
                  {isAllSelected ? 'Deselect' : 'Select All'}
                </AsyncButton>
              )}
              <AsyncButton onClick={() => router.push('/adminSU/manageBookings/walk-inBooking')}
                className="shadow-sm p-2 bg-[#A1E3F9] rounded-lg text-white hover:bg-blue-400">
                Walk-in Book
              </AsyncButton>
            </>
          )}
        </div>
        {view !== 'history' && (
          <div className="flex items-center space-x-2">
            {activeTab === 'Pending' && (
              <>
                <AsyncButton 
                  onClick={() => handleAction(onDecline, 'Declined', 'The booking has been successfully declined.')} 
                  className="px-4 py-2 shadow-sm text-red-500 rounded-lg hover:bg-red-400 hover:text-white"
                >
                  Decline
                </AsyncButton>
                <AsyncButton 
                  onClick={() => handleAction(onApprove, 'Approved', 'The booking has been successfully approved.')} 
                  className="px-4 py-2 shadow-sm bg-[#A1E3F9] text-white rounded-lg hover:bg-blue-300"
                >
                  Approve
                </AsyncButton>
              </>
            )}
            {activeTab === 'Confirmed' && (
              <>
                <AsyncButton 
                  onClick={() => handleAction(onCancel, 'Cancelled', 'The booking has been successfully cancelled.')} 
                  className="px-4 py-2 shadow-sm text-red-500 rounded-lg hover:bg-red-400 hover:text-white"
                >
                  Cancel
                </AsyncButton>
                <AsyncButton 
                  onClick={() => handleAction(onStart, 'Started', 'The booking has officially started.')} 
                  className="px-4 py-2 shadow-sm bg-[#A1E3F9] text-white rounded-lg hover:bg-blue-400"
                >
                  Start
                </AsyncButton>
              </>
            )}
            {activeTab === 'Ongoing' && (
              <>
                <AsyncButton 
                  onClick={() => handleAction(onExtend, 'Extended', 'The booking duration has been extended.')} 
                  className="px-4 py-2 shadow-sm text-gray-700 rounded-lg hover:bg-green-400"
                >
                  Extend
                </AsyncButton>
                <AsyncButton 
                  onClick={() => handleAction(onFinish, 'Finished', 'The booking has been marked as completed.')} 
                  className="px-4 py-2 shadow-sm bg-[#A1E3F9] text-white rounded-lg hover:bg-blue-400"
                >
                  Finish
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