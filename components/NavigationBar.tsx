import "@/app/globals.css";
import React from "react";

export default function NavigationBar() {
    const navigation = ["Cars", "Reviews", "About Us"];

    return (
        <header className="w-full shadow-[-1px_3px_5px_rgba(0,0,0,0.2)] sticky top-0
                           bg-[rgba(255,255,255,0.15)] backdrop-blur-md z-2">
            <nav className="flex justify-end items-center h-12 px-3 md:pr-0 bg-transparent">
                <p className="mr-auto">JRJC</p>
                <input type="checkbox" id="sidebar-active" className="peer sr-only"/>
                <label htmlFor="sidebar-active" className="md:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#000000"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
                </label>
                {/* For translucent background when opening hamburger menu */}
                <label htmlFor="sidebar-active" id="overlay" 
                    className="peer-checked:bg-black 
                                peer-checked:opacity-10 
                                peer-checked:w-full
                                peer-checked:h-full 
                                peer-checked:fixed 
                                peer-checked:top-0 
                                peer-checked:right-0 
                                peer-checked:z-[9]"></label>
                {/* Hamburger menu for smaller screen width */}
                <div className="pt-2 fixed peer-checked:right-0 z-10
                                top-0 -right-full bg-[rgba(255,255,255,0.15)] backdrop-blur-md flex flex-col 
                                items-start w-38 h-full 
                                shadow-[-1px_3px_5px_rgba(0,0,0,0.2)]
                                transition-[.3s_ease-in-out]
                                md:flex-row md:static md:w-full md:pt-0
                                md:h-full md:justify-end md:items-center 
                                md:shadow-none md:bg-transparent md:backdrop-blur-none">
                    <label htmlFor="sidebar-active" className="md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
                    </label>
                    {navigation.map(
                        (item) => (
                            <a key={item} href="#" className="text-lg px-5 py-5 h-auto w-full flex hover:text-cyan-600
                                                              md:w-auto md:h-full md:py-0 md:items-center">{item}</a>
                        )
                    )}
                    <a href="#" className="text-lg font-bold text-[#3674B5] px-5 py-5 h-auto w-full flex hover:text-cyan-600
                                           md:w-auto md:h-full md:py-0 md:items-center">Book Now</a>
                </div>
            </nav>
        </header>
    );
}