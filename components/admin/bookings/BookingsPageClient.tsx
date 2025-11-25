'use client';

import { useState, useMemo, useEffect } from 'react';
import { TAdminBooking } from '@/types/adminBooking';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { approveBookingsService } from '@/app/services/bookingService'; // Import the service
import BookingsTableView from './BookingsTableView';
import BookingsHeader from './BookingsHeader';

type BookingsPageClientProps = {
  bookings: TAdminBooking[];
  view: string;
  bookingStatuses: string[];
};

const BookingsPageClient = ({ bookings, view, bookingStatuses: initialStatuses }: BookingsPageClientProps) => {
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [bookingStatuses, setBookingStatuses] = useState<string[]>(['All']);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace, refresh } = useRouter();

  // ... (Existing useEffect for statuses - No changes)
  useEffect(() => {
    let statuses = initialStatuses;
    if (view !== 'history') {
      statuses = statuses.filter((s: string) => s !== 'Completed');
    } else {
      statuses = ['All', 'Completed'];
    }
    setBookingStatuses(['All', ...statuses.filter(s => s !== 'All')]);
  }, [initialStatuses, view]);

  // ... (Existing handleSearch - No changes)
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

  // ... (Existing useMemos - No changes)
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

  // --- UPDATED: Handle Approve using Service ---
  const handleApprove = async () => {
    if (selectedBookings.length === 0) {
      alert("Please select at least one booking to approve.");
      return;
    }

    if (!confirm(`Are you sure you want to approve ${selectedBookings.length} booking(s)?`)) return;

    setIsProcessing(true);

    try {
      // Call the service
      const results = await approveBookingsService(selectedBookings);
      
      // Check results
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        alert("All selected bookings approved successfully!");
      } else {
        alert(`${successCount} approved, but ${failCount} failed to update.`);
      }
      
      setSelectedBookings([]); 
      refresh(); // Reload page data

    } catch (error) {
      console.error("Critical error during approval:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 bg-white rounded-3xl shadow-md relative">
      <BookingsHeader
        view={view}
        onSearch={handleSearch}
        onSelectAll={handleSelectAll}
        isAllSelected={isAllSelected}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        bookingStatuses={bookingStatuses}
        showCheckboxes={view !== 'history'}
        onApprove={handleApprove} 
      />
      
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center rounded-3xl">
           <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-gray-700 font-medium">Processing Approvals...</p>
           </div>
        </div>
      )}

      <div className="flex-grow overflow-y-auto">
        <BookingsTableView
          bookings={filteredBookings}
          selectedBookings={selectedBookings}
          setSelectedBookings={setSelectedBookings}
          showCheckboxes={view !== 'history'}
        />
      </div>
    </div>
  );
};

export default BookingsPageClient;