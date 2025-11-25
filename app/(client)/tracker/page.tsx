'use client'

import { fetchBookingStatus } from "@/lib/supabase/queries/fetchBooking";
import { BookingStatus } from "@/types";
import { useEffect, useRef, useState } from "react";
import { cancelBookingService } from "@/app/services/bookingService"; // Import the service

export default function BookingTrackerPage() {
    const [booking, setBooking] = useState<BookingStatus | null>(null);
    const [uuid, setUUID] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false); 
    const [isCancelling, setIsCancelling] = useState(false); 
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const handleUUIDSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (inputRef.current)
            setUUID(inputRef.current.value);
    }

    // --- NEW: Handle Cancel Logic using Service ---
    const handleCancel = async () => {
        if (!booking || !uuid) return;

        if (!confirm("Are you sure you want to cancel your booking? This action cannot be undone.")) return;

        setIsCancelling(true);

        try {
            // Call the service instead of inline logic
            const result = await cancelBookingService(uuid);

            if (result.success) {
                alert("Booking cancelled successfully.");
                // Update local state to reflect change immediately
                setBooking(prev => prev ? { ...prev, bookingStatus: "Cancelled" } : null);
            } else {
                throw result.error || new Error("Failed to cancel booking.");
            }

        } catch (err) {
            console.error("Error cancelling booking:", err);
            alert("Failed to cancel booking. Please try again or contact support.");
        } finally {
            setIsCancelling(false);
        }
    };

    const BookingStatusDisplay = () => {
        // 1. Handle Loading State
        if (isLoading) {
            return <div>Loading booking details...</div>;
        }

        // 2. Handle Error State
        if (error) {
            return <div className="text-red-500">{error}</div>;
        }

        // 3. Handle Success (Data Found)
        if (booking) {
            const canCancel = booking.bookingStatus !== 'Cancelled' && booking.bookingStatus !== 'Completed' && booking.bookingStatus !== 'Declined';

            return (
                <div className="flex flex-col gap-2">
                    <p>
                        <strong>Customer:</strong> {booking.customerFirstName} {booking.customerLastName}
                    </p>
                    <p>
                        <strong>Vehicle:</strong> {booking.carManufacturer} {booking.carModelName}
                    </p>
                    <p>
                        <strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-md text-sm font-medium ${
                            booking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            booking.bookingStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            booking.bookingStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {booking.bookingStatus}
                        </span>
                    </p>

                    {/* Show Cancel Button only if booking is active */}
                    {canCancel && (
                        <button 
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="mt-6 bg-red-500 text-white py-2 px-4 rounded-xl hover:bg-red-600 disabled:bg-red-300 transition-colors"
                        >
                            {isCancelling ? 'Processing...' : 'Cancel Booking'}
                        </button>
                    )}
                </div>
            );
        }

        // 4. Handle "Not Found" State
        return <div className="text-gray-500">You can track your booking here.</div>;
    }

    // --- Data Fetching ---
    useEffect(() => {
        const getStatus = async () => {
            try {
                setIsLoading(true); 
                setError(null); 

                const data = await fetchBookingStatus(uuid);
                
                if (data) {
                    setBooking(data); 
                } else {
                    setBooking(null);
                    setError("Booking not found."); 
                }

            } catch (err: any) {
                setError(err.message || "An error occurred"); 
                setBooking(null);
            } finally {
                setIsLoading(false); 
            }
        };

        if (uuid) {
            getStatus();
        }
    }, [uuid]); 


    return (
        <div className="flex justify-center items-start min-h-screen bg-main-color md:bg-transparent md:bg-gradient-to-b from-main-color from-80% md:from-60% lg:from-40% to-transparent -mt-12 pt-9 md:pt-12 relative overflow-hidden font-main-font">
            <img src="/images/BG.webp" className="opacity-20 min-w-full absolute bottom-0 -z-2" />

            <div className="bg-white flex flex-col mt-12 h-144 p-4 rounded-2xl shadow-xl sm:w-md md:flex-row md:w-full md:max-w-6xl md:mx-12">
                <div className="flex flex-col md:min-w-3xs md:max-w-3xs">
                    <h1 className="font-bold text-2xl">Booking Tracker</h1>
                    <label htmlFor="id-input" className="mt-3">Enter your booking ID:</label>
                    <span className="flex md:flex-col md:items-center justify-between gap-3 mt-2">
                        <input type="text" id="id-input" ref={inputRef}
                        className="border-2 border-main-color rounded-xl grow px-1 self-stretch md:h-10"
                        placeholder="Booking ID"/>
                        <button className="bg-secondary-100 py-2 px-4 rounded-3xl
                            hover:cursor-pointer hover:bg-cyan-200"
                            onClick={handleUUIDSearch}>Search</button>
                    </span>
                </div>
                <div className="mt-8 mb-4 bg-gray-400 w-full h-[1px] md:h-full md:w-[1px] md:mx-4 md:my-0"/>
                <div className="flex flex-col items-center w-full text-md md:text-lg lg:text-xl">
                    <h1 className="font-bold text-2xl">Booking Status</h1>
                    <div className="flex flex-col gap-3 mt-8 text-wrap flex-wrap grow-0 min-w-xs max-w-xs text-center">
                        <BookingStatusDisplay/>
                    </div>
                </div>
            </div>
        </div>
    );
}