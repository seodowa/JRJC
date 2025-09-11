import "@/app/globals.css";
import React from "react";

export default function NavigationBar() {
    const navigation = ["Product", "Features", "Pricing", "Company", "Blog"];

    return (
        <header className="w-full bg-white shadow-md sticky top-0">
            <nav className="flex justify-end items-center h-16">
                <input type="checkbox" id="sidebar-active" className="hidden"/>
                <label htmlFor="sidebar-active" className="md:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#000000"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
                </label>
            </nav>
        </header>
    );
}