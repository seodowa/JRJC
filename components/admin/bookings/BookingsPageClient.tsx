'use client';

import { useState, useMemo, useEffect } from 'react';
import { TAdminBooking } from '@/types/adminBooking';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import SearchBar from '@/components/admin/SearchBar';
import BookingsTableView from './BookingsTableView';
import AsyncButton from "@/components/AsyncButton";
import BookingTabs from './BookingTabs'; // Import the new BookingTabs component

type BookingsPageClientProps = {
  bookings: TAdminBooking[];
};

const BookingsPageClient = ({ bookings }: BookingsPageClientProps) => {
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('All'); // State for active tab
  const [bookingStatuses, setBookingStatuses] = useState<string[]>(['All']);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch('/api/admin/booking-statuses');
        if (!response.ok) {
          throw new Error('Failed to fetch booking statuses');
        }
        const statuses = await response.json();
        setBookingStatuses(['All', ...statuses]);
      } catch (error) {
        console.error(error);
        // Keep default hardcoded tabs as a fallback
        setBookingStatuses(['All', 'Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled']);
      }
    };

    fetchStatuses();
  }, []);

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
    return selectedBookings.length === allFilteredBookingIds.length && selectedBookings.every(id => allFilteredBookingIds.includes(id));
  }, [selectedBookings, filteredBookings]);

  const handleSelectAll = () => {
    const allFilteredBookingIds = filteredBookings.map((booking) => booking.bookingId);
    if (isAllSelected) {
      // If all are currently selected, deselect all
      setSelectedBookings([]);
    } else {
      // Otherwise, select all filtered bookings
      setSelectedBookings(allFilteredBookingIds);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white rounded-3xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Bookings</h1>
        {/* Add refresh button here */}
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
            <SearchBar
            placeholder="Search by name or booking ID..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-80"
          />
          <AsyncButton onClick={handleSelectAll} className="border-1 border-gray-300 p-2 bg-[#A1E3F9] rounded-lg text-white
                                                            hover:bg-blue-400">
            {isAllSelected ? 'Deselect' : 'Select All'}
          </AsyncButton>
          <AsyncButton className="border border-gray-300 p-2 bg-[#A1E3F9] rounded-lg text-white hover:bg-blue-400">Walk-in Book</AsyncButton>
        </div>
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
      </div>
      <div className="relative">
        <div className="mt-2">
          <BookingTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            tabs={bookingStatuses}
          />
        </div>
        <div className="relative z-10 bg-white">
          <BookingsTableView
            bookings={filteredBookings}
            selectedBookings={selectedBookings}
            setSelectedBookings={setSelectedBookings}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingsPageClient;
