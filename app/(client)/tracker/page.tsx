'use client';

import { fetchBookingStatus } from "@/lib/supabase/queries/client/fetchBooking";
import Badge, { toneForStatus } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/button";
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
    
    const handleUUIDSearch = (e: React.FormEvent<HTMLFormElement>) => {
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
            return <p className="text-ink-2">Looking up your booking…</p>;
        }

        if (error) {
            return <p className="text-red-600">{error}</p>;
        }

        if (booking) {
            const canCancel = booking.bookingStatus !== 'Cancelled' && booking.bookingStatus !== 'Completed' && booking.bookingStatus !== 'Declined';

            return (
                <div className="flex flex-col">
                    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-y border-line py-5 text-[15px]">
                        <dt className="text-ink-2">Customer</dt>
                        <dd className="text-right">{booking.customerFirstName} {booking.customerLastName}</dd>
                        <dt className="text-ink-2">Vehicle</dt>
                        <dd className="text-right">{booking.carManufacturer} {booking.carModelName}</dd>
                        <dt className="text-ink-2">Status</dt>
                        <dd className="text-right"><Badge tone={toneForStatus(booking.bookingStatus)}>{booking.bookingStatus}</Badge></dd>
                    </dl>

                    {canCancel && (
                        <button 
                            onClick={handleCancelClick}
                            disabled={isSendingOtp}
                            className={buttonClass("secondary", "md", "mt-6 self-start border-red-600 text-red-700 hover:bg-red-600 hover:text-paper")}
                        >
                            {isSendingOtp ? 'Sending code…' : 'Cancel booking'}
                        </button>
                    )}
                </div>
            );
        }

        return <p className="text-ink-2">Enter the booking ID from your confirmation text or email to see its status.</p>;
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
        <div className="mx-auto max-w-[1440px] px-4 pt-10 pb-24 sm:px-8 lg:px-16 lg:pt-14">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-6">
                <div className="flex flex-col gap-6 md:col-span-5">
                    <p className="eyebrow">Booking tracker</p>
                    <h1 className="text-5xl leading-none font-normal tracking-[-0.03em] sm:text-6xl">Where’s my booking?</h1>
                    <form
                        className="flex flex-col gap-2"
                        onSubmit={handleUUIDSearch}
                    >
                        <label htmlFor="id-input" className="field-label">Booking ID</label>
                        <div className="flex gap-2">
                            <input type="text" id="id-input" ref={inputRef} className="field num" placeholder="e.g. 3f2a…"/>
                            <button type="submit" className={buttonClass("primary", "md", "shrink-0")}>Search</button>
                        </div>
                    </form>
                </div>
                <section className="flex flex-col gap-5 rounded-md border border-line bg-surface p-6 sm:p-8 md:col-span-6 md:col-start-7" aria-live="polite">
                    <h2 className="font-display text-2xl tracking-tight">Status</h2>
                    <BookingStatusDisplay/>
                </section>
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
                descriptionText="Enter the code we just sent you via sms."
            />
        </div>
    );
}
