import "@/app/globals.css";
import CarCard from "../CarCard";
import { cars } from "@/lib/data/cars";

export default function CarsSection() {
  return (
    <section id="cars" className="min-h-screen relative bg-gradient-to-b from-main-color to-secondary-50 flex flex-col items-center pt-16">
        <h1 className="font-semibold text-4xl sm:text-5xl md:text-6xl py-10 text-center">Cars Available</h1>
        <div className="border-2 w-screen h-135 flex justify-center">
          <CarCard {...cars[0]}/>
        </div>
    </section>
  );
}