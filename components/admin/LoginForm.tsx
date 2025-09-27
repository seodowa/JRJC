'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "./PasswordInput"; // Import the custom PasswordInput component
import { login } from "../../app/(admin)/services/auth/auth";

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const form = e.currentTarget;
            const data = new FormData(form);
            const username = String(data.get('username') || '');
            const password = String(data.get('password') || '');

            await login(username, password);

            // Redirect to the admin dashboard or home page
            router.push("/adminSU/dashboard");
        } catch (error) {
            console.error("Login failed:", error);
            alert("Invalid username or password");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid h-full lg:w-150 md:w-100 sm:w-80 flex-col place-items-center gap-4 rounded-2xl
                outline-[0.50px] outline-offset-[-0.50px] outline-white/20
                bg-black/5 backdrop-blur-sm shadow-lg shadow-black/25 p-10">
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
                <PasswordInput
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                />
            </div>
            <a className="underline pl-30 text-sm -mt-3.5" href="#">Forgot Password?</a>
            <div className="mt-6">
                <button
                    type="submit"
                    className="mb-4 w-36 rounded-4xl border border-white/30 bg-[#8BFFF1]/40 px-4 py-2
                              text-black hover:bg-[#8BFFF1] transition-colors duration-200"
                >
                    Log in
                </button>
            </div>
        </form>
    );
};

export default LoginForm;