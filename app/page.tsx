import "@/app/globals.css";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-main-color to-secondary-50 fixed top-0 -z-2 w-full h-full
                    flex flex-col items-center pt-12
                    md:flex-row-reverse">
       <div className="h-1/2 flex flex-col justify-center items-center w-full
                       md:h-full md:w-1/2 md:justify-start md:pt-46 md:pl-20 
                       md:bg-gradient-to-l from-main-color from-85% to-transparent">
          <div className="flex flex-col justify-center items-center">
            <h1 className="font-extrabold text-8xl text-[#578FCA]">JRJC</h1>
            <h3 className="pt-2 pb-9 text-2xl">Car Rental Services</h3>
            <a href="#" className="bg-secondary-100 py-2 md:py-3 px-16 md:px-16 
                                  text-2xl md:text-3xl text-white rounded-full 
                                  shadow-md">Book Now</a>
          </div>
          
       </div>
       <div className="-z-2 absolute left-0 top-1/2 md:top-auto">
          <img src="/images/kentb_car_gradient.webp" className="opacity-30 min-w-5xl "/>
       </div>
    </div>
  );
}
