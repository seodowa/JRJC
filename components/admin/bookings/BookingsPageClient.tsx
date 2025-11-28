'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { TAdminBooking } from '@/types/adminBooking';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
// Import service functions
import { 
  approveBookingsService, 
  declineBookingsService, 
  cancelBookingsService, 
  startBookingsService,
  finishBookingsService,
  extendBookingService
} from '@/app/services/bookingService'; 
import BookingsTableView from './BookingsTableView';
import BookingsHeader from './BookingsHeader';
import BookingDetailsModal from './BookingDetailsModal'; 
import { SpecificBookingDetails } from '@/types/adminBooking';
import { LoadingSpinner } from '@/components/LoadingSpinner'; 
import { useToast } from "@/components/toast/use-toast"; 

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
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingIdForModal, setSelectedBookingIdForModal] = useState<string | null>(null);
  const [modalBookingDetails, setModalBookingDetails] = useState<SpecificBookingDetails | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace, refresh } = useRouter();
  const { toast } = useToast(); 

  // Initialize Statuses
  useEffect(() => {
    if (!initialStatuses) return;
    let statuses = initialStatuses;
    if (view !== 'history') {
      statuses = statuses.filter((s: string) => s !== 'Completed');
    } else {
      statuses = ['All', 'Completed'];
    }
    setBookingStatuses(['All', ...statuses.filter(s => s !== 'All')]);
    setActiveTab('All');
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
  const processAction = async (
    actionName: string, 
    serviceFn: (ids: string[]) => Promise<any[]>,
    idsToProcess: string[] = selectedBookings
  ) => {
    // 1. Sanitize IDs (Remove empty strings or nulls)
    const validIds = idsToProcess.filter(id => id && id.trim() !== '');

    // 2. Validation Check
    if (validIds.length === 0) {
      toast({ 
        title: "No Selection", 
        description: `Please select at least one booking to ${actionName}.`, 
        variant: "destructive" 
      });
      return; // Stop execution here
    }

    const confirmMessage = `Are you sure you want to ${actionName.toUpperCase()} ${validIds.length} booking(s)?`;
    if (!confirm(confirmMessage)) return;

    setIsProcessing(true);

    try {
      const results = await serviceFn(validIds);
      
      // 3. Safety Check: If backend returns empty result
      if (!results || results.length === 0) {
        toast({ title: "No Changes", description: "No bookings were processed.", variant: "default" });
        return;
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      // 4. Enhanced Success Logic
      if (failCount === 0 && successCount > 0) {
        toast({ title: "Success", description: `Selected bookings have been successfully ${actionName}ed.`, variant: "default" });
      } else if (successCount === 0 && failCount === 0) {
         // Should be caught by the empty result check, but as a fallback
        toast({ title: "No Operation", description: "No changes were made.", variant: "default" });
      } else {
        toast({ title: "Warning", description: `Action completed with issues: ${successCount} successful, ${failCount} failed.`, variant: "destructive" });
      }
      
      setSelectedBookings([]); 
      refresh(); 
      setIsModalOpen(false); 

    } catch (error) {
      console.error(`Critical error during ${actionName}:`, error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 2. EXTEND HANDLER (Specific for single booking extension) ---
  const handleExtendAction = async (bookingId: string, newEndDate: string) => {
    // 1. Validation Check
    if (!bookingId || !newEndDate) {
        toast({ title: "Error", description: "Invalid booking ID or date.", variant: "destructive" });
        return;
    }

    setIsProcessing(true);
    try {
        const result = await extendBookingService(bookingId, newEndDate);
        
        if (result && result.success) {
            toast({ title: "Success", description: "Booking extended successfully.", variant: "default" });
            refresh();
            setIsModalOpen(false);
        } else {
            toast({ title: "Error", description: result?.error || "Failed to extend booking", variant: "destructive" });
        }
    } catch (error) {
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
  };

  // --- ACTION HANDLERS (Header) ---
  const handleApprove = () => processAction("approve", approveBookingsService);
  const handleDecline = () => processAction("decline", declineBookingsService);
  const handleCancel = () => processAction("cancel", cancelBookingsService);
  const handleStart = () => processAction("start", startBookingsService);
  const handleFinish = () => processAction("finish", finishBookingsService);
  
  const handleExtendHeader = () => { alert("Please select a specific booking to extend."); };

  // --- MODAL FUNCTIONS ---
  const handleOpenModal = useCallback(async (bookingId: string) => {
    setIsModalOpen(true);
    setSelectedBookingIdForModal(bookingId);
    setIsModalLoading(true);
    setModalBookingDetails(null); 
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }
      const details: SpecificBookingDetails = await response.json();
      setModalBookingDetails(details);
    } catch (error) {
      console.error("Failed to fetch booking details for modal:", error);
      toast({ title: "Error", description: "Failed to load booking details.", variant: "destructive" });
      setIsModalOpen(false);
    } finally {
      setIsModalLoading(false);
    }
  }, [toast]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBookingIdForModal(null);
    setModalBookingDetails(null);
  };

  // --- MODAL ACTION HANDLERS ---
  const handleModalApprove = () => selectedBookingIdForModal && processAction("approve", approveBookingsService, [selectedBookingIdForModal]);
  const handleModalDecline = () => selectedBookingIdForModal && processAction("decline", declineBookingsService, [selectedBookingIdForModal]);
  const handleModalCancel = () => selectedBookingIdForModal && processAction("cancel", cancelBookingsService, [selectedBookingIdForModal]);
  const handleModalStart = () => selectedBookingIdForModal && processAction("start", startBookingsService, [selectedBookingIdForModal]);
  const handleModalFinish = () => selectedBookingIdForModal && processAction("finish", finishBookingsService, [selectedBookingIdForModal]);
  
  const handleModalExtend = (bookingId: string, newEndDate: string) => handleExtendAction(bookingId, newEndDate);

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
        showCheckboxes={view !== 'history' && activeTab !== 'All'}
        onApprove={handleApprove}
        onDecline={handleDecline}
        onCancel={handleCancel}
        onStart={handleStart}
        onFinish={handleFinish}
        onExtend={handleExtendHeader} 
      />
      
      {/* Loading Overlay */}
      {isProcessing && !isModalOpen && (
        <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center rounded-3xl backdrop-blur-sm">
           <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-500 mb-4"></div>
              <p className="text-gray-700 font-semibold text-lg">Processing...</p>
           </div>
        </div>
      )}

      <div className="flex-grow overflow-y-auto">
        <BookingsTableView
          bookings={filteredBookings}
          selectedBookings={selectedBookings}
          setSelectedBookings={setSelectedBookings}
          showCheckboxes={view !== 'history' && activeTab !== 'All'}
          onRowClick={handleOpenModal}
        />
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        booking={modalBookingDetails}
        onApprove={handleModalApprove}
        onDecline={handleModalDecline}
        onCancel={handleModalCancel}
        onStart={handleModalStart}
        onFinish={handleModalFinish}
        onExtend={handleModalExtend} 
        isProcessing={isProcessing || isModalLoading}
      />

      {/* Loading Spinner for Modal Content Fetching */}
      {isModalOpen && isModalLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default BookingsPageClient;