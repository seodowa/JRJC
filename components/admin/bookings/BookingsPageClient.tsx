'use client';

import { useState } from 'react';
import { TAdminBooking } from '@/types/adminBooking';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import SearchBar from '@/components/admin/SearchBar'; // Assuming a generic SearchBar component exists
import BookingsTableView from './BookingsTableView';
import AsyncButton from "@/components/AsyncButton"; // To be created

type BookingsPageClientProps = {
  bookings: TAdminBooking[];
};

const BookingsPageClient = ({ bookings }: BookingsPageClientProps) => {
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="max-h-screen p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Bookings</h1>
        {/* Add refresh button here */}
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <SearchBar
            placeholder="Search by name or booking ID..."
            onChange={(e) => handleSearch(e.target.value)}
          />
          <AsyncButton className="px-4 py-2 bg-gray-200 rounded-md">Select All</AsyncButton>
          <AsyncButton className="px-4 py-2 bg-gray-200 rounded-md">Manual Book</AsyncButton>
        </div>
        <div className="flex items-center space-x-2">
          <AsyncButton className="px-4 py-2 bg-red-500 text-white rounded-md">Decline</AsyncButton>
          <AsyncButton className="px-4 py-2 bg-green-500 text-white rounded-md">Approve</AsyncButton>
          <AsyncButton className="px-4 py-2 bg-yellow-500 text-white rounded-md">Cancel</AsyncButton>
          <AsyncButton className="px-4 py-2 bg-blue-500 text-white rounded-md">Start</AsyncButton>
        </div>
      </div>
      <div className="flex -mb-6">
        <AsyncButton className="px-15 border-1 border-black rounded-t-xl">All</AsyncButton>
        <AsyncButton className="px-15 border-1 border-black rounded-t-xl">To be Approved</AsyncButton>
        <AsyncButton className="px-15 border-1 border-black rounded-t-xl">Approved</AsyncButton>
        <AsyncButton className="px-15 border-1 border-black rounded-t-xl">Ongoing</AsyncButton>
      </div>
        <div>
            <BookingsTableView bookings={bookings} selectedBookings={selectedBookings} setSelectedBookings={setSelectedBookings} />
        </div>
    </div>
  );
};

export default BookingsPageClient;
