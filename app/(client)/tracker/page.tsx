"use client"

import { fetchBookingStatus } from "@/lib/supabase/queries/fetchBooking";
import { BookingStatus } from "@/types";
import { useEffect, useRef, useState } from "react";

export default function BookingTrackerPage() {
    const [booking, setBooking] = useState<BookingStatus | null>(null);
    const [uuid, setUUID] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);    
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUUIDSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (inputRef.current)
            setUUID(inputRef.current.value);
    }

    const BookingStatusDisplay = () => {
        // 1. Handle Loading State
        if (isLoading && inputRef.current) {
            return <div>Loading booking details...</div>;
        }

        // 2. Handle Error State
        if (error) {
            return <div>{error}</div>;
        }

        // 3. Handle Success (Data Found)
        // (You were missing this part!)
        if (booking) {
            return (
            <>
                <p>
                <strong>Customer:</strong> {booking.customerFirstName} {booking.customerLastName}
                </p>
                <p>
                <strong>Vehicle:</strong> {booking.carManufacturer} {booking.carModelName}
                </p>
                <p>
                <strong>Status:</strong> {booking.bookingStatus}
                </p>
            </>
            );
        }

        // 4. Handle "Not Found" State
        // This will only show if not loading, no error, and no booking
        return <div>You can track your booking here.</div>;

    }

    // --- Data Fetching ---
    useEffect(() => {
        // Define an async helper function inside the effect
        const getStatus = async () => {
            try {
                setIsLoading(true); // Start loading
                setError(null); // Clear any previous errors

                // Call your imported function
                const data = await fetchBookingStatus(uuid);
                
                if (data) {
                    setBooking(data); // Save the data to state
                } else {
                    setError("Booking not found."); // Handle the "not found" case
                }

            } catch (err: any) {
                setError(err.message); // Save the error to state
            } finally {
                setIsLoading(false); // Stop loading (in all cases)
            }
        };

        // Call the helper function
        if (uuid) {
            getStatus();
        }

    }, [uuid]); // Re-run the effect if the uuid prop ever changes


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