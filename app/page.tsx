import "@/app/globals.css";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-main-color to-secondary-50 fixed top-0 -z-1 w-full h-full
                    flex flex-col items-center pt-12">
       <div className="h-2/5 flex flex-col justify-center items-center">
          <h1 className="font-extrabold text-8xl text-[#578FCA]">JRJC</h1>
          <h3 className="pt-1 pb-9">Car Rental Services</h3>
          <a href="#" className="bg-secondary-100
                                py-2 px-4 text-2xl text-white rounded-full">Book Now</a>
       </div>
       <div className="">
          <img src="/images/kentb_car_gradient.webp" className="opacity-30 min-w-5xl absolute left-0"/>
       </div>
    </div>
  );
}
