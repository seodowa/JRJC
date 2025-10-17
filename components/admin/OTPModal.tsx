'use client';

import React, { useState, useEffect, useRef } from 'react';
import AsyncButton from '@/components/AsyncButton';
import CloseIcon from "@/components/icons/CloseIcon";
import OTPVerificationIcon from '@/components/icons/OTPVerificationIcon';
import CheckmarkButtonIcon from '@/components/icons/CheckmarkButtonIcon';

interface OtpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (otp: string, trustDevice: boolean) => Promise<void>;
    isSubmitting: boolean;
    onResend: () => Promise<void>;
    isResending: boolean;
}

const OTPModal: React.FC<OtpModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting, onResend, isResending }) => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [trustDevice, setTrustDevice] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (isOpen) {
            setCooldown(180); // 3 minutes
        }
    }, [isOpen]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    if (!isOpen) {
        return null;
    }

    const handleOtpChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return; // Only allow numbers

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.nextSibling && element.value) {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const paste = e.clipboardData.getData('text');
        if (/^\d{6}$/.test(paste)) {
            e.preventDefault();
            const newOtp = paste.split('');
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        void onSubmit(otp.join(""), trustDevice);
    };

    const handleResend = async () => {
        await onResend();
        setCooldown(180);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="relative bg-[#E6F5F3] p-4 sm:p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="absolute top-4 left-4 font-bold text-lg sm:text-xl">JRJC ADMIN</h1>
                <button type="button" onClick={onClose} className="absolute top-4 right-4 hover:bg-[#8BFFF1]/50 hover:rounded-lg">
                    <CloseIcon />
                </button>
                <div className="text-center pt-10">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">Two-Step Verification</h2>
                    <div className="flex justify-center my-6">
                        <OTPVerificationIcon size={64} />
                    </div>
                    <p className="mb-6">Enter the code we just sent you via email.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-1 sm:gap-2 mb-4">
                            {otp.map((data, index) => {
                                return (
                                    <input
                                        key={index}
                                        type="text"
                                        name="otp"
                                        className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl sm:text-2xl border border-gray-300 rounded-md focus:outline-2 focus:outline-[#8BFFF1] focus:border-transparent"
                                        maxLength={1}
                                        value={data}
                                        onChange={e => handleOtpChange(e.target, index)}
                                        onFocus={e => e.target.select()}
                                        onKeyDown={e => handleKeyDown(e, index)}
                                        onPaste={handlePaste}
                                        ref={el => { if(el) inputRefs.current[index] = el}}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-center my-4">
                            <label htmlFor="trustDevice" className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="trustDevice"
                                    className="hidden peer"
                                    checked={trustDevice}
                                    onChange={(e) => setTrustDevice(e.target.checked)}
                                />
                                <span className="w-5 h-5 border-2 border-gray-300 rounded-sm grid place-items-center peer-checked:bg-[#8BFFF1] peer-checked:border-[#8BFFF1]">
                                    {trustDevice && <CheckmarkButtonIcon className="w-3 h-3" />}
                                </span>
                                <span className="ml-2 block text-sm text-gray-900">
                                    Trust this device for 30 days
                                </span>
                            </label>
                        </div>
                        <div className="text-center my-4">
                            <button type="button" onClick={handleResend} disabled={cooldown > 0 || isResending} className="text-sm text-gray-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed">
                                {isResending ? "Sending..." : cooldown > 0 ? `Resend Code in ${Math.floor(cooldown / 60)}:${(cooldown % 60).toString().padStart(2, '0')}` : "Resend Code"}
                            </button>
                        </div>
                        <AsyncButton
                            type="submit"
                            isLoading={isSubmitting}
                            className="w-28 sm:w-32 h-10 rounded-lg bg-white border border-gray-300 text-black hover:bg-[#8BFFF1] transition-colors"
                            loadingText="Verifying..."
                        >
                            Verify
                        </AsyncButton>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OTPModal;

