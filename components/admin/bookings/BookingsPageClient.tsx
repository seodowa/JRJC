'use client';

import { useState, useMemo, useEffect } from 'react';
import { TAdminBooking } from '@/types/adminBooking';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
// Import all 4 service functions
import { 
  approveBookingsService, 
  declineBookingsService, 
  cancelBookingsService, 
  startBookingsService,
  finishBookingsService
} from '@/app/services/bookingService'; 
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

  // Initialize Statuses
  useEffect(() => {
    let statuses = initialStatuses;
    if (view !== 'history') {
      statuses = statuses.filter((s: string) => s !== 'Completed');
    } else {
      statuses = ['All', 'Completed'];
    }
    setBookingStatuses(['All', ...statuses.filter(s => s !== 'All')]);
  }, [initialStatuses, view]);

  // Search Handler
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

  // Filter Logic
  const filteredBookings = useMemo(() => {
    if (activeTab === 'All') {
      return bookings;
    }
    return bookings.filter((booking) => booking.status === activeTab);
  }, [bookings, activeTab]);

  // Selection Logic
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

  // --- GENERIC ACTION PROCESSOR ---
  // This helper function handles the loading state, confirmation, service call, and alerting for all actions.
  const processAction = async (
    actionName: string, 
    serviceFn: (ids: string[]) => Promise<any[]>
  ) => {
    if (selectedBookings.length === 0) {
      alert(`Please select at least one booking to ${actionName}.`);
      return;
    }

    // Confirmation Dialog
    const confirmMessage = `Are you sure you want to ${actionName.toUpperCase()} ${selectedBookings.length} booking(s)? This will update the status and notify the customer via SMS.`;
    if (!confirm(confirmMessage)) return;

    setIsProcessing(true);

    try {
      // Call the specific service function passed in
      const results = await serviceFn(selectedBookings);
      
      // Calculate results
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        alert(`Selected bookings have been successfully ${actionName}ed.`);
      } else {
        alert(`Action completed with issues: ${successCount} successful, ${failCount} failed.`);
      }
      
      setSelectedBookings([]); 
      refresh(); // Refresh server data

    } catch (error) {
      console.error(`Critical error during ${actionName}:`, error);
      alert("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- ACTION HANDLERS ---
  const handleApprove = () => processAction("approve", approveBookingsService);
  const handleDecline = () => processAction("decline", declineBookingsService);
  const handleCancel = () => processAction("cancel", cancelBookingsService);
  const handleStart = () => processAction("start", startBookingsService);
  const handleFinish = () => processAction("finish", finishBookingsService);
  const handleExtend = () => { alert("Extend functionality coming soon!"); };

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
        onCancel={handleCancel} // Pass Cancel handler
        onStart={handleStart}   // Pass Start handler
        onFinish={handleFinish}
        onExtend={handleExtend}
      />
      
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center rounded-3xl backdrop-blur-sm">
           <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-500 mb-4"></div>
              <p className="text-gray-700 font-semibold text-lg">Processing...</p>
              <p className="text-gray-400 text-sm mt-1">Sending notifications...</p>
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