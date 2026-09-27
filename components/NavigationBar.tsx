"use client"

import React from "react";
import { Menu, X } from "lucide-react";
import { useCMS } from "@/app/(client)/context/CMSContext";
import { buttonClass } from "./ui/button";

export default function NavigationBar() {
    const { getImage } = useCMS();

    const navLogoUrl = getImage('navigation', 'logo', '/images/jrjc_logo.png');

    const navigationLinks = {
        "Fleet": "/#cars",
        "Reviews": "/#reviews",
        "Track a booking": "/tracker",
        "About": "/#about-us",
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-line bg-paper/95 backdrop-blur-sm">
            <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-16">
                <a href="/" className="flex items-center gap-3 text-ink">
                    <img src={navLogoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                    <span className="font-display text-2xl font-semibold tracking-tight">JRJC</span>
                    <span className="hidden text-[13px] tracking-wide text-ink-2 sm:inline">Rent-a-Car · Bukidnon</span>
                </a>

                <input type="checkbox" id="sidebar-active" className="peer sr-only" />
                <label htmlFor="sidebar-active" className="-mr-2 p-2 md:hidden" aria-label="Open menu">
                    <Menu size={24} strokeWidth={1.75} />
                </label>
                {/* Backdrop behind the mobile sheet */}
                <label
                    htmlFor="sidebar-active"
                    aria-hidden="true"
                    className="hidden peer-checked:fixed peer-checked:inset-0 peer-checked:z-[90] peer-checked:block peer-checked:bg-ink/30 md:peer-checked:hidden"
                />

                <div className="fixed top-0 -right-full z-[100] flex h-dvh w-[82%] max-w-sm flex-col bg-paper px-6 pt-4 pb-8 transition-[right] duration-200 peer-checked:right-0
                                md:static md:h-auto md:w-auto md:max-w-none md:flex-row md:items-center md:gap-9 md:bg-transparent md:p-0">
                    <label htmlFor="sidebar-active" className="-mr-2 mb-6 self-end p-2 md:hidden" aria-label="Close menu">
                        <X size={24} strokeWidth={1.75} />
                    </label>
                    {Object.entries(navigationLinks).map(([name, href]) => (
                        <a
                            key={name}
                            href={href}
                            className="border-b border-line py-4 font-display text-3xl text-ink hover:text-forest
                                       md:border-0 md:py-0 md:font-sans md:text-[15px]"
                        >
                            {name}
                        </a>
                    ))}
                    <a href="/book" className={buttonClass("primary", "md", "mt-8 md:mt-0")}>
                        Book a car <span aria-hidden="true">→</span>
                    </a>
                </div>
            </nav>
        </header>
    );
}
