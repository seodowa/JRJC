'use client';

import { useState } from 'react';
import { TAdminBooking } from '@/types/adminBooking';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import SearchBar from '@/components/admin/SearchBar'; // Assuming a generic SearchBar component exists
import BookingsTableView from './BookingsTableView'; // To be created

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
    <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-md">
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
          <button className="px-4 py-2 bg-gray-200 rounded-md">Select All</button>
          <button className="px-4 py-2 bg-gray-200 rounded-md">Manual Book</button>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-red-500 text-white rounded-md">Decline</button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-md">Approve</button>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded-md">Cancel</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md">Start</button>
        </div>
      </div>
      <div className="flex border-b mb-4">
        <button className="px-4 py-2 border-b-2 border-blue-500">All</button>
        <button className="px-4 py-2">To be Approved</button>
        <button className="px-4 py-2">Approved</button>
        <button className="px-4 py-2">Ongoing</button>
      </div>
      <BookingsTableView bookings={bookings} selectedBookings={selectedBookings} setSelectedBookings={setSelectedBookings} />
    </div>
  );
};

export default BookingsPageClient;
