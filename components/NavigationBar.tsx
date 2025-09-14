import "@/app/globals.css";
import React from "react";

export default function NavigationBar() {
    const navigation = ["Cars", "Reviews", "About Us", "Book Now"];

    return (
        <header className="w-full bg-white shadow-md sticky top-0">
            <nav className="flex justify-end items-center h-16 ">
                <input type="checkbox" id="sidebar-active" className="peer sr-only"/>
                <label htmlFor="sidebar-active" className="md:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#000000"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
                </label>
                <label htmlFor="sidebar-active" id="overlay" 
                    className="peer-checked:bg-black 
                                peer-checked:opacity-10 
                                peer-checked:w-full
                                peer-checked:h-full 
                                peer-checked:fixed 
                                peer-checked:top-0 
                                peer-checked:right-0 
                                peer-checked:z-[9]"></label>
                
                <div className="pt-2 fixed peer-checked:right-0 z-10
                                top-0 -right-full bg-white flex flex-col 
                                items-start w-38 h-full 
                                shadow-[-1px_3px_5px_rgba(0,0,0,0.2)]
                                transition-[.3s_ease-in-out]
                                ">
                    <label htmlFor="sidebar-active" className="md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
                    </label>
                    {navigation.map(
                        (item) => (
                            <a key={item} href="#" className="px-5 py-5 h-auto w-full flex hover:bg-secondary-100">{item}</a>
                        )
                    )}
                </div>
            </nav>
        </header>
    );
}