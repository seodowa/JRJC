"use client"; // This component needs to be a Client Component to use useCMS

import "@/app/globals.css";
import FbIcon from "./icons/FbIcon";
import EmailIcon from "./icons/EmailIcon";
import CallIcon from "./icons/CallIcon";
import { useCMS } from "@/app/(client)/context/CMSContext"; // Import useCMS


export default function Footer() {
    const { getText } = useCMS(); // Use the hook to get CMS functions
    const ICONSIZE = 25;
    
    // Fetch content from CMS with fallbacks
    const facebookUrl = getText('footer', 'facebook_url', "https://www.facebook.com/profile.php?id=61555492203800");
    const facebookText = getText('footer', 'facebook_text', "JRJC Car Rental");
    const email = getText('footer', 'email', "jasperj0y0903@gmail.com");
    const phone = getText('footer', 'phone', "+63 967 653 6176");
  
    return (
    <section id="footer" className="h-auto relative bg-footer-color flex flex-col items-center py-10 font-secondary-font">
        <h1 className="text-xl text-center text-white pb-6">Contact Us</h1>
        <div className="w-screen flex justify-center items-center text-white">
            <ul className="flex gap-4 flex-col *:flex *:flex-row *:w-full *:gap-2 *:text-nowrap sm:flex-row">
                <li>
                    <FbIcon size={ICONSIZE}/>
                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-300">{facebookText}</a>
                </li>
                <li>
                    <EmailIcon size={ICONSIZE}/>
                    <p>{email}</p>
                </li>
                <li>
                    <CallIcon size={ICONSIZE}/>
                    <p>{phone}</p>
                </li>
            </ul>
        </div>
    </section>
  );
}