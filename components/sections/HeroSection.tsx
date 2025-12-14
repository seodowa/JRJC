"use client"; // This component needs to be a Client Component to use useCMS

import "@/app/globals.css";
import { useCMS } from "@/app/(client)/context/CMSContext"; // Import useCMS

export default function HeroSection() {
  const { getText, getImage } = useCMS(); // Use the hook to get CMS functions

  // Fetch content from CMS
  const subtitle = getText('hero', 'subtitle', 'Car Rental Services');
  const mainImage = getImage('hero', 'main_image', '/images/kentb_car_gradient.webp'); // Default fallback
  const textImage = getImage('hero', 'text_image', '/images/JRJC TEXT ONLY.png'); // Default fallback

  return (
    <section id="hero" className="bg-main-color font-main-font min-h-screen relative z-0
                    flex flex-col items-center -mt-12 overflow-hidden
                    md:flex-row-reverse">
       <div className="flex flex-col items-center w-full h-1/2
                       md:min-h-screen md:w-3/5 pt-40 md:pt-50 md:pl-20 
                       md:bg-gradient-to-l from-main-color from-85% to-transparent z-1">
          <div className="flex flex-col justify-center items-center">
            <img src={textImage} alt="JRJC Logo" className="-my-10 min-h-60 max-h-60 md:-my-12 md:min-h-80 md:max-h-80"/>
            <h3 className="pt-2 pb-9 text-2xl">{subtitle}</h3>
            <a href="book" className="bg-secondary-100 py-2 md:py-3 px-16 md:px-16 
                                  text-2xl md:text-3xl text-white rounded-full transition-transform hover:scale-110
                                  shadow-md">Book Now</a>
          </div>
       </div>
       <div className="flex overflow-hidden object-cover absolute left-0 top-5/11 md:top-auto w-full max-h-screen">
          <img src={mainImage} alt="Car background" className="opacity-30 min-w-3xl max-w-3xl sm:max-w-4xl md:max-w-full max-h-screen object-cover"/>
       </div>
    </section>
  );
}