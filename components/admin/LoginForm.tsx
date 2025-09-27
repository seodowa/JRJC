'use client';

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInputField from "./PasswordInputField"; // Import the custom PasswordInputField component
import { login } from "../../app/(admin)/services/auth/auth";
import AsyncButton from "@/components/AsyncButton";
import { useToast } from "@/components/ui/use-toast";

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState("");
    const router = useRouter();
    const formRef = useRef<HTMLFormElement | null>(null);
    const { toast } = useToast();

    const handleLogin = async () => {
        try {
            const form = formRef.current;
            if (!form) return;
            const data = new FormData(form);
            const username = String(data.get('username') || '');
            const password = String(data.get('password') || '');

            await login(username, password);

            // Redirect to the admin dashboard or home page
            router.push("/adminSU/dashboard");
        } catch (error) {
            console.error("Login failed:", error);
            const description = error instanceof Error ? error.message : "Invalid username or password";
            toast({
                variant: "destructive",
                title: "Login failed",
                description,
            });
        }
    };

    return (
        <form
            ref={formRef}
            onSubmit={(e) => {
                e.preventDefault();
                // Support Enter key submission by delegating to the same async handler
                void handleLogin();
            }}
            className="grid h-full lg:w-150 md:w-100 sm:w-80 flex-col place-items-center gap-4 rounded-2xl
                outline-[0.50px] outline-offset-[-0.50px] outline-white/20
                bg-black/5 backdrop-blur-sm shadow-lg shadow-black/25 p-10"
        >
            <h2 className="text-4xl font-bold mb-4 text-center">Login</h2>
            <div>
                <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    className="w-[250px] rounded-3xl border border-white/30 bg-white p-2
                    text-black placeholder:font-normal placeholder-black/70 backdrop-blur-sm shadow-lg"
                />
            </div>
            <div className="mt-4">
                <PasswordInputField
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                />
            </div>
            <a className="underline pl-30 text-sm -mt-3.5" href="#">Forgot Password?</a>
            <div className="mt-6">
                <AsyncButton
                    onClick={handleLogin}
                    className="mb-4 w-40 rounded-4xl border border-white/30 bg-[#8BFFF1]/40 px-4 py-2
                              text-black hover:bg-[#8BFFF1] transition-colors duration-200"
                    loadingText="Logging in..."
                >
                    Log in
                </AsyncButton>
            </div>
        </form>
    );
};

export default LoginForm;