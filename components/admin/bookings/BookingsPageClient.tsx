'use client';

import { useState, useMemo, useEffect } from 'react';
import { TAdminBooking } from '@/types/adminBooking';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import SearchBar from '@/components/SearchBar';
import BookingsTableView from './BookingsTableView';
import AsyncButton from "@/components/AsyncButton";
import BookingTabs from './BookingTabs';
import HistoryIcon from '@/components/icons/HistoryIcon';
import Link from 'next/link';

type BookingsPageClientProps = {
  bookings: TAdminBooking[];
  view: string;
  bookingStatuses: string[];
};

const BookingsPageClient = ({ bookings, view, bookingStatuses: initialStatuses }: BookingsPageClientProps) => {
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [bookingStatuses, setBookingStatuses] = useState<string[]>(['All']);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const router = useRouter();

  useEffect(() => {
    let statuses = initialStatuses;
    if (view !== 'history') {
      statuses = statuses.filter((s: string) => s !== 'Completed');
    } else {
      statuses = ['All', 'Completed'];
    }
    setBookingStatuses(['All', ...statuses.filter(s => s !== 'All')]);
  }, [initialStatuses, view]);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const filteredBookings = useMemo(() => {
    if (activeTab === 'All') {
      return bookings;
    }
    return bookings.filter((booking) => booking.status === activeTab);
  }, [bookings, activeTab]);

  const isAllSelected = useMemo(() => {
    const allFilteredBookingIds = filteredBookings.map((booking) => booking.bookingId);
    if (allFilteredBookingIds.length === 0) return false;
    return selectedBookings.length === allFilteredBookingIds.length && selectedBookings.every(id => allFilteredBookingIds.includes(id));
  }, [selectedBookings, filteredBookings]);

  const handleSelectAll = () => {
    const allFilteredBookingIds = filteredBookings.map((booking) => booking.bookingId);
    if (isAllSelected) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(allFilteredBookingIds);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white rounded-3xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{view === 'history' ? 'Bookings History' : 'Manage Bookings'}</h1>
        {view === 'history' ? (
          <AsyncButton onClick={() => router.push(pathname)} className="px-4 py-2 bg-gray-200 rounded-md">
            Back
          </AsyncButton>
        ) : (
          <Link href={`${pathname}?view=history`} passHref>
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
            onChange={(e) => handleSearch(e.target.value)}
            className="w-80"
          />
          {view !== 'history' && (
            <>
                <AsyncButton onClick={handleSelectAll} className="border-1 border-gray-300 p-2 bg-[#A1E3F9] rounded-lg text-white
                                                            hover:bg-blue-400">
                    {isAllSelected ? 'Deselect' : 'Select All'}
                </AsyncButton>
                <AsyncButton className="border border-gray-300 p-2 bg-[#A1E3F9] rounded-lg text-white hover:bg-blue-400">Walk-in Book</AsyncButton>
            </>
          )}
        </div>
        {view !== 'history' && (
          <div className="flex items-center space-x-2">
              <AsyncButton className="px-4 py-2 border border-gray-400 text-red-500 rounded-lg
                                    hover:bg-red-400 hover:text-white">
                  Decline
              </AsyncButton>
              <AsyncButton className="px-4 py-2 border border-gray-400 bg-[#A1E3F9] text-white rounded-lg
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
      <div className="relative">
        {view !== 'history' && (
          <div className="mt-4">
            <BookingTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              tabs={bookingStatuses}
            />
          </div>
        )}
        <div className={`relative z-10 bg-white ${view !== 'history'}`}>
          <BookingsTableView
            bookings={filteredBookings}
            selectedBookings={selectedBookings}
            setSelectedBookings={setSelectedBookings}
            showCheckboxes={view !== 'history'}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingsPageClient;
