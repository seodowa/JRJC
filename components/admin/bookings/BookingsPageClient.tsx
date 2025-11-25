'use client';

import { useState, useMemo, useEffect } from 'react';
import { TAdminBooking } from '@/types/adminBooking';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { approveBookingsService, declineBookingsService } from '@/app/services/bookingService'; 
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

  // Handle Initial Statuses based on view (history vs active)
  useEffect(() => {
    let statuses = initialStatuses;
    if (view !== 'history') {
      statuses = statuses.filter((s: string) => s !== 'Completed');
    } else {
      statuses = ['All', 'Completed'];
    }
    setBookingStatuses(['All', ...statuses.filter(s => s !== 'All')]);
  }, [initialStatuses, view]);

  // Handle Search Input with Debounce
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

  // Filter Bookings based on Active Tab
  const filteredBookings = useMemo(() => {
    if (activeTab === 'All') {
      return bookings;
    }
    return bookings.filter((booking) => booking.status === activeTab);
  }, [bookings, activeTab]);

  // Handle Selection Logic
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

  // --- APPROVE HANDLER ---
  const handleApprove = async () => {
    if (selectedBookings.length === 0) {
      alert("Please select at least one booking to approve.");
      return;
    }

    if (!confirm(`Are you sure you want to approve ${selectedBookings.length} booking(s)?`)) return;

    setIsProcessing(true);

    try {
      const results = await approveBookingsService(selectedBookings);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        alert("Selected bookings have been APPROVED.");
      } else {
        alert(`${successCount} approved, but ${failCount} failed.`);
      }
      
      setSelectedBookings([]); 
      refresh(); // Refresh data to reflect new status

    } catch (error) {
      console.error("Critical error during approval:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- DECLINE HANDLER ---
  const handleDecline = async () => {
    if (selectedBookings.length === 0) {
      alert("Please select at least one booking to decline.");
      return;
    }

    if (!confirm(`Are you sure you want to DECLINE ${selectedBookings.length} booking(s)? This will send a notification to the customer.`)) return;

    setIsProcessing(true);

    try {
      const results = await declineBookingsService(selectedBookings);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        alert("Selected bookings have been DECLINED.");
      } else {
        alert(`${successCount} declined, but ${failCount} failed.`);
      }
      
      setSelectedBookings([]); 
      refresh(); // Refresh data to reflect new status

    } catch (error) {
      console.error("Critical error during decline:", error);
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
        onDecline={handleDecline}
      />
      
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center rounded-3xl backdrop-blur-sm">
           <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-500 mb-4"></div>
              <p className="text-gray-700 font-semibold text-lg">Processing...</p>
              <p className="text-gray-400 text-sm mt-1">Please wait while we update the bookings.</p>
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