'use client';

import { useState, useMemo, useEffect } from 'react';
import { TAdminBooking } from '@/types/adminBooking';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { createClient } from '@/utils/supabase/client'; // Import Supabase Client
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
  const [isProcessing, setIsProcessing] = useState(false); // Add loading state
  
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace, refresh } = useRouter(); // Destructure refresh
  const supabase = createClient(); // Initialize Supabase

  // ... (Your existing useEffect for statuses) ...
  useEffect(() => {
    let statuses = initialStatuses;
    if (view !== 'history') {
      statuses = statuses.filter((s: string) => s !== 'Completed');
    } else {
      statuses = ['All', 'Completed'];
    }
    setBookingStatuses(['All', ...statuses.filter(s => s !== 'All')]);
  }, [initialStatuses, view]);

  // ... (Your existing handleSearch) ...
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

  // ... (Your existing useMemos) ...
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

  // --- NEW: Handle Approve Logic ---
  // Inside BookingsPageClient.tsx

const handleApprove = async () => {
  if (selectedBookings.length === 0) {
    alert("Please select at least one booking to approve.");
    return;
  }

  if (!confirm(`Are you sure you want to approve ${selectedBookings.length} booking(s)?`)) return;

  setIsProcessing(true);

  try {
    // 1. Identify the bookings to process
    const bookingsToProcess = bookings.filter(b => selectedBookings.includes(b.bookingId));
    
    for (const booking of bookingsToProcess) {
      
      // A. Update Status in Database (2 = Confirmed/Approved)
      const { error: updateError } = await supabase
        .from('Booking_Details')
        .update({ Booking_Status_ID: 2 }) 
        .eq('Booking_ID', booking.bookingId);

      if (updateError) {
        console.error(`Failed to update booking ${booking.bookingId}`, updateError);
        continue; 
      }

      // B. FETCH CONTACT INFO (The Fix)
      // Since TAdminBooking doesn't have the phone number, we fetch it here.
      const { data: customerData, error: fetchError } = await supabase
        .from('Booking_Details')
        .select(`
          Customer (
            Contact_Number,
            First_Name
          )
        `)
        .eq('Booking_ID', booking.bookingId)
        .single();

      if (fetchError) {
        console.error("Could not fetch customer phone for SMS", fetchError);
        continue;
      }

      // C. Prepare and Send SMS
      // Note: Supabase returns nested objects. We use optional chaining (?.) to be safe.
      // We check specifically for 'Customer' because of the join.
      // Type assertion might be needed if TypeScript complains, or just use 'any' for quick fix
      const customer = (customerData as any)?.Customer;
      const phone = customer?.Contact_Number;
      const firstName = customer?.First_Name || booking.customerName;

      if (phone) {
        let formattedNumber = phone;
        // Ensure PH format
        if (formattedNumber.startsWith('0')) formattedNumber = '+63' + formattedNumber.substring(1);

        const message = `Hi ${firstName}, Good news! Your booking (ID: ${booking.bookingId}) has been APPROVED. See you soon!`;

        await fetch('/api/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: formattedNumber, text: message })
        });
        
        console.log(`SMS sent to ${firstName}`);
      }
    }

    alert("Bookings approved successfully!");
    setSelectedBookings([]); 
    refresh(); 

  } catch (error) {
    console.error("Error processing approval:", error);
    alert("An error occurred while approving.");
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 bg-white rounded-3xl shadow-md">
      <BookingsHeader
        view={view}
        onSearch={handleSearch}
        onSelectAll={handleSelectAll}
        isAllSelected={isAllSelected}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        bookingStatuses={bookingStatuses}
        showCheckboxes={view !== 'history'}
        onApprove={handleApprove} // <--- Pass the function here
      />
      
      {/* Optional: Show a loading overlay if processing */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
           <div className="bg-white p-4 rounded-lg shadow-lg">Processing Approvals...</div>
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