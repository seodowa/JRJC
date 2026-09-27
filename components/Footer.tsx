"use client";

import { useCMS } from "@/app/(client)/context/CMSContext";

export default function Footer() {
    const { getText, getImage } = useCMS();

    const facebookUrl = getText('footer', 'facebook_url', "https://www.facebook.com/profile.php?id=61555492203800");
    const facebookText = getText('footer', 'facebook_text', "JRJC Car Rental");
    const email = getText('footer', 'email', "jasperj0y0903@gmail.com");
    const phone = getText('footer', 'phone', "+63 967 653 6176");
    const textImage = getImage('hero', 'text_image', '/images/JRJC TEXT ONLY.png');

    const heading = "num mb-3 text-xs tracking-[0.12em] text-gray-400 uppercase";

    return (
        <footer id="footer" className="bg-ink text-paper">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-4 pt-16 pb-10 sm:px-8 lg:px-16 lg:pt-20">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-6">
                    <div className="flex flex-col gap-6 md:col-span-6">
                        <span className="font-display text-[5.5rem] leading-[0.85] font-medium tracking-[-0.05em] lg:text-[8.5rem]">JRJC</span>
                        <img src={textImage} alt="JRJC Rent a Car" className="h-16 w-auto self-start object-contain" />
                    </div>
                    <nav className="flex flex-col gap-2.5 text-[15px] md:col-span-2" aria-label="Footer">
                        <span className={heading}>Site</span>
                        <a href="/#cars" className="hover:text-gray-300">Fleet</a>
                        <a href="/book" className="hover:text-gray-300">Book a car</a>
                        <a href="/tracker" className="hover:text-gray-300">Track a booking</a>
                        <a href="/reviews" className="hover:text-gray-300">Reviews</a>
                    </nav>
                    <div className="flex flex-col gap-2.5 text-[15px] md:col-span-4">
                        <span className={heading}>Contact</span>
                        <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">{facebookText} ↗</a>
                        <a href={`mailto:${email}`} className="break-all hover:text-gray-300">{email}</a>
                        <a href={`tel:${phone.replace(/\s/g, '')}`} className="num hover:text-gray-300">{phone}</a>
                    </div>
                </div>
                <div className="num flex flex-col justify-between gap-2 border-t border-gray-800 pt-6 text-xs text-gray-400 sm:flex-row">
                    <span>© {new Date().getFullYear()} JRJC Rent-a-Car</span>
                    <span>Bukidnon, Philippines</span>
                </div>
            </div>
        </footer>
    );
}
