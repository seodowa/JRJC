import "@/app/globals.css";

export default function HeroSection() {
  return (
    <section id="hero" className="bg-main-color font-main-font min-h-screen relative z-0
                    flex flex-col items-center -mt-12 overflow-hidden
                    md:flex-row-reverse">
       <div className="flex flex-col items-center w-full h-1/2
                       md:min-h-screen md:w-3/5 pt-40 md:pt-50 md:pl-20 
                       md:bg-gradient-to-l from-main-color from-85% to-transparent z-1">
          <div className="flex flex-col justify-center items-center">
            <img src="/images/JRJC TEXT ONLY.png" alt="" className="min-h-40 max-h-40 md:min-h-50 md:max-h-50"/>
            {/* <h1 className="font-extrabold text-8xl text-[#578FCA]">JRJC</h1> */}
            <h3 className="pt-2 pb-9 text-2xl">Car Rental Services</h3>
            <a href="book" className="bg-secondary-100 py-2 md:py-3 px-16 md:px-16 
                                  text-2xl md:text-3xl text-white rounded-full transition-transform hover:scale-110
                                  shadow-md">Book Now</a>
          </div>
       </div>
       <div className="flex overflow-hidden object-cover absolute left-0 top-5/11 md:top-auto w-full max-h-screen">
          <img src="/images/kentb_car_gradient.webp" className="opacity-30 min-w-3xl max-w-3xl sm:max-w-4xl md:max-w-full max-h-screen object-cover"/>
       </div>
    </section>
  );
}