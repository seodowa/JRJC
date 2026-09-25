'use client';

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/(admin)/services/auth/auth";
import { useToast } from "@/components/toast/use-toast";
import PasswordInputField from "./PasswordInputField"; // Import the custom PasswordInputField component
import AsyncButton from "@/components/AsyncButton";
import { buttonClass } from "@/components/ui/button";
import OTPModal from "@/components/OTPModal"; // Corrected import path

const AdminLoginForm: React.FC = () => {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const router = useRouter();
    const formRef = useRef<HTMLFormElement | null>(null);
    const { toast } = useToast();

    const handleLogin = async (showLoading = true) => {
        if (isLoading && showLoading) return;

        if (showLoading) setIsLoading(true);
        try {
            const form = formRef.current;
            if (!form) return;
            const data = new FormData(form);
            const username = String(data.get('username') || '');
            const password = String(data.get('password') || '');

            await login(username, password);

            toast({
                title: "Verification email sent",
                description: "Please check your email for a verification link.",
            });
            setUsername(username); // Store username for OTP submission
            setIsOtpModalOpen(true);
        } catch (error) {
            console.error("Login failed:", error);
            const description = error instanceof Error ? error.message : "Invalid username or password";
            toast({
                variant: "destructive",
                title: "Login failed",
                description,
            });
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (otp: string, trustDevice: boolean) => {
        setIsSubmittingOtp(true);
        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, otp, trustDevice }),
            });

            if (response.ok) {
                toast({
                    title: "Login successful",
                    description: "Redirecting to dashboard...",
                });
                router.push('/adminSU/dashboard');
            } else {
                const data = await response.json();
                throw new Error(data.error || "OTP verification failed.");
            }
        } catch (error) {
            console.error("OTP verification failed:", error);
            const description = error instanceof Error ? error.message : "An unexpected error occurred.";
            toast({
                variant: "destructive",
                title: "OTP Verification Failed",
                description,
            });
        } finally {
            setIsSubmittingOtp(false);
        }
    };

    const handleResendCode = async () => {
        if (isResending) return;

        setIsResending(true);
        try {
            // This will re-trigger the login flow, which sends a new OTP
            await handleLogin(false);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <>
            <form
                ref={formRef}
                onSubmit={(e) => {
                    e.preventDefault();
                    void handleLogin();
                }}
                className="my-16 flex w-full max-w-sm flex-col gap-5"
            >
                <div className="mb-2 flex flex-col gap-3">
                    <p className="eyebrow">Admin</p>
                    <h1 className="text-5xl leading-none font-normal tracking-[-0.03em]">Sign in.</h1>
                </div>
                <div>
                    <label htmlFor="username" className="field-label">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                        className="field"
                    />
                </div>
                <div>
                    <div className="flex items-baseline justify-between">
                        <label htmlFor="password" className="field-label">Password</label>
                        <a className="text-sm text-forest hover:underline" href="#">Forgot password?</a>
                    </div>
                    <PasswordInputField
                        id="password"
                        name="password"
                        required
                    />
                </div>
                <AsyncButton
                    type="submit"
                    isLoading={isLoading}
                    className={buttonClass("primary", "md", "mt-2 w-full")}
                    loadingText="Signing in…"
                >
                    Sign in
                </AsyncButton>
            </form>
            <OTPModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                onSubmit={handleOtpSubmit}
                isSubmitting={isSubmittingOtp}
                onResend={handleResendCode}
                isResending={isResending}
                title="JRJC ADMIN" // Pass the title
                descriptionText="Enter the code we just sent you via email."
            />
        </>
    );
};

export default AdminLoginForm;