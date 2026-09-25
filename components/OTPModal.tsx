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
    title?: string;
    showTrustDeviceOption?: boolean; // New prop
    descriptionText?: string; // New prop for custom description
}

const OTPModal: React.FC<OtpModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    onResend,
    isResending,
    title = "JRJC ADMIN",
    showTrustDeviceOption = true, // Default to true for existing admin usage
    descriptionText = "Enter the code we just sent you via email." // Default text
}) => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [trustDevice, setTrustDevice] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (isOpen) {
            setCooldown(180); // 3 minutes
            // Reset trustDevice checkbox state when modal opens
            if (!showTrustDeviceOption) {
                setTrustDevice(false);
            }
        }
    }, [isOpen, showTrustDeviceOption]);

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
        if (isNaN(Number(element.value))) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

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
        // Pass trustDevice conditionally, default to false if option is not shown
        void onSubmit(otp.join(""), showTrustDeviceOption ? trustDevice : false);
    };

    const handleResend = async () => {
        await onResend();
        setCooldown(180);
    };

    return (
        <div className="fixed inset-0 bg-ink/40 flex justify-center items-center z-50 p-4">
            <div className="relative w-full max-w-md rounded-md bg-surface p-6 shadow-xl sm:p-8">
                <p className="eyebrow absolute top-5 left-6">{title}</p>
                <button type="button" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 rounded-md p-1.5 text-ink-2 hover:bg-gray-200 hover:text-ink">
                    <CloseIcon />
                </button>
                <div className="text-center pt-10">
                    <h2 className="mb-2 text-3xl">Enter your code.</h2>
                    <div className="flex justify-center my-6">
                        <OTPVerificationIcon size={64} />
                    </div>
                    <p className="mb-6 text-ink-2">{descriptionText}</p>
                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-1 sm:gap-2 mb-4">
                            {otp.map((data, index) => {
                                return (
                                    <input
                                        key={index}
                                        type="text"
                                        name="otp"
                                        className="field num h-12 w-10 px-0 text-center text-xl sm:h-14 sm:w-12 sm:text-2xl"
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
                        {showTrustDeviceOption && ( // Conditionally render
                            <div className="flex items-center justify-center my-4">
                                <label htmlFor="trustDevice" className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="trustDevice"
                                        className="hidden peer"
                                        checked={trustDevice}
                                        onChange={(e) => setTrustDevice(e.target.checked)}
                                    />
                                    <span className="w-5 h-5 border-2 border-gray-300 rounded-sm grid place-items-center peer-checked:bg-forest peer-checked:border-forest peer-checked:text-paper">
                                        {trustDevice && <CheckmarkButtonIcon className="w-3 h-3" />}
                                    </span>
                                    <span className="ml-2 block text-sm text-gray-900">
                                        Trust this device for 30 days
                                    </span>
                                </label>
                            </div>
                        )}
                        <div className="text-center my-4">
                            <button type="button" onClick={handleResend} disabled={cooldown > 0 || isResending} className="text-sm text-gray-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed">
                                {isResending ? "Sending..." : cooldown > 0 ? `Resend Code in ${Math.floor(cooldown / 60)}:${(cooldown % 60).toString().padStart(2, '0')}` : "Resend Code"}
                            </button>
                        </div>
                        <AsyncButton
                            type="submit"
                            isLoading={isSubmitting}
                            className="h-11 w-full rounded-md bg-forest font-medium text-paper transition-colors hover:bg-forest-hover"
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

