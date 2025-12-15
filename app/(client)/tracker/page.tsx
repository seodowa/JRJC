'use client';

import { fetchBookingStatus } from "@/lib/supabase/queries/client/fetchBooking";
import { BookingStatus } from "@/types";
import { useEffect, useRef, useState } from "react";
import { cancelBookingService, requestCancelOTPService } from "@/app/services/bookingService";
import OTPModal from "@/components/OTPModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useToast } from "@/components/toast/use-toast";

export default function BookingTrackerPage() {
    const [booking, setBooking] = useState<BookingStatus | null>(null);
    const [uuid, setUUID] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Modal States
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    
    const handleUUIDSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (inputRef.current) setUUID(inputRef.current.value);
    }

    // --- Step 1: Open Confirmation Modal ---
    const handleCancelClick = () => {
        if (!booking || !uuid) return;
        setIsConfirmModalOpen(true);
    };

    // --- Step 2: Request OTP (After Confirmation) ---
    const requestCancelOtp = async () => {
        setIsConfirmModalOpen(false); // Close confirmation modal
        setIsSendingOtp(true);
        try {
            const result = await requestCancelOTPService(uuid);
            if (result.success) {
                toast({
                    title: "OTP Sent",
                    description: "An OTP has been sent to your registered contact method.",
                });
                setIsOtpModalOpen(true);
            } else {
                throw new Error(result.error || "Failed to send OTP.");
            }
        } catch (err: any) {
            console.error("Error requesting OTP:", err);
            toast({
                variant: "destructive",
                title: "Failed to Send OTP",
                description: err.message || "Please try again.",
            });
        } finally {
            setIsSendingOtp(false);
        }
    };

    // --- Step 3: Handle OTP Submission ---
    const handleOtpSubmit = async (otp: string) => {
        if (!booking || !uuid) return;

        setIsVerifyingOtp(true);

        try {
            const result = await cancelBookingService(uuid, otp);
            if (result.success) {
                toast({
                    title: "Booking Cancelled",
                    description: "Your booking has been cancelled successfully.",
                });
                setBooking(prev => prev ? { ...prev, bookingStatus: "Cancelled" } : null);
                setIsOtpModalOpen(false);
                setUUID(""); 
                if (inputRef.current) inputRef.current.value = "";
            } else {
                throw new Error(result.error || "Failed to cancel booking.");
            }
        } catch (err: any) {
            console.error("Error cancelling booking with OTP:", err);
            toast({
                variant: "destructive",
                title: "Cancellation Failed",
                description: err.message || "Failed to verify OTP or cancel booking.",
            });
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleResendCode = async () => {
        await requestCancelOtp();
    };

    const BookingStatusDisplay = () => {
        if (isLoading) {
            return <div>Loading booking details...</div>;
        }

        if (error) {
            return <div className="text-red-500">{error}</div>;
        }

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

                    {canCancel && (
                        <button 
                            onClick={handleCancelClick}
                            disabled={isSendingOtp}
                            className="mt-6 bg-red-500 text-white py-2 px-4 rounded-xl hover:bg-red-600 disabled:bg-red-300 transition-colors"
                        >
                            {isSendingOtp ? 'Sending OTP...' : 'Cancel Booking'}
                        </button>
                    )}
                </div>
            );
        }

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

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={requestCancelOtp}
                title="Cancel Booking"
                message="Are you sure you want to cancel your booking? An OTP will be sent to your registered contact method."
                confirmButtonText="Yes, Proceed"
                cancelButtonText="No, Keep it"
            />

            <OTPModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                onSubmit={handleOtpSubmit}
                isSubmitting={isVerifyingOtp}
                onResend={handleResendCode}
                isResending={isSendingOtp}
                title="JRJC BOOKING"
                showTrustDeviceOption={false} // Hide for public cancellation
            />
        </div>
    );
}
