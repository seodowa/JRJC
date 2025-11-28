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
import OngoingBookingModal from './OngoingBookingModal'; 
import ExtendBookingModal from './ExtendBookingModal'; 
import ConfirmationModal from '../ConfirmationModal'; // Import ConfirmationModal
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
  
  // Details Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOngoingModalOpen, setIsOngoingModalOpen] = useState(false); 
  const [selectedBookingIdForModal, setSelectedBookingIdForModal] = useState<string | null>(null);
  const [modalBookingDetails, setModalBookingDetails] = useState<SpecificBookingDetails | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Header Extend Modal State
  const [isHeaderExtendOpen, setIsHeaderExtendOpen] = useState(false); 
  const [headerExtendBooking, setHeaderExtendBooking] = useState<SpecificBookingDetails | null>(null); 

  // Confirmation Modal State
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    actionName: string;
    idsToProcess: string[];
    serviceFn: ((ids: string[]) => Promise<any[]>) | null;
  }>({
    isOpen: false,
    actionName: '',
    idsToProcess: [],
    serviceFn: null,
  });

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
  }, [initialStatuses, view]);

  // Reset Tab on View Change
  useEffect(() => {
    setActiveTab('All');
  }, [view]);

  // Clear selected bookings when activeTab changes
  useEffect(() => {
    setSelectedBookings([]);
  }, [activeTab]);

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

  // Check if extend should be disabled
  const isExtendDisabled = useMemo(() => {
      if (selectedBookings.length !== 1) return true;
      const selectedId = selectedBookings[0];
      const booking = bookings.find(b => b.bookingId === selectedId);
      return !booking || !!booking.dateReturned;
  }, [selectedBookings, bookings]);

  // --- GENERIC ACTION PROCESSOR ---
  const processAction = (
    actionName: string, 
    serviceFn: (ids: string[]) => Promise<any[]>,
    idsToProcess: string[] = selectedBookings
  ) => {
    const validIds = idsToProcess.filter(id => id && id.trim() !== '');

    if (validIds.length === 0) {
      toast({ 
        title: "No Selection", 
        description: `Please select at least one booking to ${actionName}.`, 
        variant: "destructive" 
      });
      return; 
    }

    // Open Confirmation Modal instead of native confirm
    setConfirmationState({
      isOpen: true,
      actionName,
      idsToProcess: validIds,
      serviceFn,
    });
  };

  // Execute the action after confirmation
  const executeConfirmAction = async () => {
    const { actionName, serviceFn, idsToProcess } = confirmationState;
    if (!serviceFn) return;

    setIsProcessing(true);

    try {
      const results = await serviceFn(idsToProcess);
      
      if (!results || results.length === 0) {
        toast({ title: "No Changes", description: "No bookings were processed.", variant: "default" });
        return;
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0 && successCount > 0) {
        toast({ title: "Success", description: `Selected bookings have been successfully ${actionName}ed.`, variant: "default" });
      } else if (successCount === 0 && failCount === 0) {
        toast({ title: "No Operation", description: "No changes were made.", variant: "default" });
      } else {
        toast({ title: "Warning", description: `Action completed with issues: ${successCount} successful, ${failCount} failed.`, variant: "destructive" });
      }
      
      setSelectedBookings([]); 
      refresh(); 
      setIsModalOpen(false); // Close details modal if open
      setConfirmationState(prev => ({ ...prev, isOpen: false })); // Close confirmation modal

    } catch (error) {
      console.error(`Critical error during ${actionName}:`, error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      setConfirmationState(prev => ({ ...prev, isOpen: false }));
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 2. EXTEND HANDLER (Specific for single booking extension) ---
  const handleExtendAction = async (bookingId: string, newEndDate: string) => {
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
            setIsHeaderExtendOpen(false); 
            setHeaderExtendBooking(null); 
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
  
  // Updated Handle Extend Header
  const handleExtendHeader = async () => { 
    if (selectedBookings.length === 0) {
      toast({ 
        title: "No Selection", 
        description: "Please select a booking to extend.", 
        variant: "destructive" 
      });
      return;
    }

    if (selectedBookings.length > 1) {
      toast({ 
        title: "Too Many Selected", 
        description: "Please select only one booking to extend.", 
        variant: "destructive" 
      });
      return;
    }

    // Process single selection
    const bookingId = selectedBookings[0];
    setIsProcessing(true); 
    
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }
      const details: SpecificBookingDetails = await response.json();
      setHeaderExtendBooking(details);
      setIsHeaderExtendOpen(true);
    } catch (error) {
      console.error("Failed to fetch booking for extension:", error);
      toast({ title: "Error", description: "Failed to load booking details.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- MODAL FUNCTIONS ---
  const handleOpenModal = useCallback(async (bookingId: string) => {
    setIsModalLoading(true);
    setSelectedBookingIdForModal(bookingId);
    setModalBookingDetails(null); 

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }
      const details: SpecificBookingDetails = await response.json();
      setModalBookingDetails(details);

      // Logic to determine which modal to open based on status
      if (details.Booking_Status.Name === 'Ongoing') {
        setIsOngoingModalOpen(true);
        setIsModalOpen(false); 
      } else {
        setIsModalOpen(true);
        setIsOngoingModalOpen(false); 
      }

    } catch (error) {
      console.error("Failed to fetch booking details for modal:", error);
      toast({ title: "Error", description: "Failed to load booking details.", variant: "destructive" });
      setIsModalOpen(false); 
      setIsOngoingModalOpen(false); 
    } finally {
      setIsModalLoading(false);
    }
  }, [toast]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsOngoingModalOpen(false); 
    setSelectedBookingIdForModal(null);
    setModalBookingDetails(null);
    refresh(); 
  };

  // --- MODAL ACTION HANDLERS ---
  const handleModalApprove = () => selectedBookingIdForModal && processAction("approve", approveBookingsService, [selectedBookingIdForModal]);
  const handleModalDecline = () => selectedBookingIdForModal && processAction("decline", declineBookingsService, [selectedBookingIdForModal]);
  const handleModalCancel = () => selectedBookingIdForModal && processAction("cancel", cancelBookingsService, [selectedBookingIdForModal]);
  const handleModalStart = () => selectedBookingIdForModal && processAction("start", startBookingsService, [selectedBookingIdForModal]);
  
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
        onExtend={handleExtendHeader}
        isExtendDisabled={isExtendDisabled} 
      />
      
      {/* Loading Overlay */}
      {isProcessing && !isModalOpen && !isHeaderExtendOpen && !isOngoingModalOpen && !confirmationState.isOpen && (
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
        onExtend={handleModalExtend} 
        isProcessing={isProcessing || isModalLoading}
      />

      {/* Ongoing Booking Modal */}
      <OngoingBookingModal
        isOpen={isOngoingModalOpen}
        onClose={handleCloseModal}
        booking={modalBookingDetails}
        onSuccess={handleCloseModal} 
        onExtend={handleModalExtend} 
      />

      {/* Standalone Extend Modal */}
      {isHeaderExtendOpen && headerExtendBooking && ( 
        <ExtendBookingModal 
          isOpen={isHeaderExtendOpen}
          onClose={() => {
            setIsHeaderExtendOpen(false);
            setHeaderExtendBooking(null);
          }}
          booking={headerExtendBooking}
          onConfirm={handleExtendAction}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={() => setConfirmationState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={executeConfirmAction}
        title={`Confirm ${confirmationState.actionName.charAt(0).toUpperCase() + confirmationState.actionName.slice(1)}`}
        message={`Are you sure you want to ${confirmationState.actionName.toUpperCase()} ${confirmationState.idsToProcess.length} booking(s)?`}
        confirmButtonText={`Yes, ${confirmationState.actionName.charAt(0).toUpperCase() + confirmationState.actionName.slice(1)}`}
        cancelButtonText="Cancel"
        isLoading={isProcessing}
        loadingText={
          confirmationState.actionName === 'approve' ? 'Approving...' :
          confirmationState.actionName === 'decline' ? 'Declining...' :
          confirmationState.actionName === 'cancel' ? 'Cancelling...' :
          confirmationState.actionName === 'start' ? 'Starting...' :
          'Processing...'
        }
      />

      {/* Loading Spinner for Modal Content Fetching */}
      {(isModalOpen || isOngoingModalOpen) && isModalLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default BookingsPageClient;