"use client"

import "@/app/globals.css";
import CarCard from "../CarCard";
import Carousel from "../Carousel";
import { CARS } from "@/lib/data/cars";

export default function CarsSection() {
  
  return (
    <section id="cars" className="min-h-screen relative bg-gradient-to-b from-main-color to-secondary-50 flex flex-col items-center pt-16">
        <h1 className="font-main-font text-4xl sm:text-5xl md:text-6xl md:py-10 text-center">Cars Available</h1>
        <Carousel 
          items={CARS} 
          renderItem={(car) => <CarCard car={car} />}
        />
    </section>
  );
}