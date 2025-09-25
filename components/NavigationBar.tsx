import "@/app/globals.css";
import React from "react";
import HamburgerIcon from "./icons/HamburgerIcon";
import CloseIcon from "./icons/CloseIcon";

export default function NavigationBar() {
    const navigation = ["Cars", "Reviews", "About Us"];

    return (
        <section className="w-full shadow-[-1px_3px_5px_rgba(0,0,0,0.2)] sticky top-0
                           bg-[rgba(255,255,255,0.15)] z-1 overflow-hidden">
            <nav className="flex justify-end items-center h-12 px-3 md:pr-0 bg-transparent relative z-100">
                <p className="mr-auto">JRJC</p>
                <input type="checkbox" id="sidebar-active" className="peer sr-only"/>
                <label htmlFor="sidebar-active" className="md:hidden">
                    <HamburgerIcon />
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
                                peer-checked:z-[100]"></label>
                {/* Hamburger menu for smaller screen width */}
                <div className="pt-2 fixed peer-checked:right-0 z-100
                                top-0 -right-full bg-[rgba(255,255,255,0.15)] backdrop-blur-md flex flex-col 
                                items-start w-38 h-full 
                                shadow-[-1px_3px_5px_rgba(0,0,0,0.2)]
                                transition-[.3s_ease-in-out]
                                md:flex-row md:static md:w-full md:pt-0
                                md:h-full md:justify-end md:items-center 
                                md:shadow-none md:bg-transparent md:backdrop-blur-none">
                    <label htmlFor="sidebar-active" className="md:hidden">
                        <CloseIcon />
                    </label>
                    {navigation.map(
                        (item) => (
                            <a key={item} href="#" className="text-lg px-5 py-5 h-auto w-full flex hover:text-hover-color
                                                              md:w-auto md:h-full md:py-0 md:items-center">{item}</a>
                        )
                    )}
                    <a href="#" className="text-lg font-bold text-[#3674B5] px-5 py-5 h-auto w-full flex hover:text-hover-color
                                           md:w-auto md:h-full md:py-0 md:items-center">Book Now</a>
                </div>
            </nav>
        </section>
    );
}