import "@/app/globals.css";
import CarCard from "../CarCard";
import Carousel from "../Carousel";
import { fetchCars } from "@/lib/supabase/queries/fetchCars";

export default async function CarsSection() {
  const CAROUSEL_HEIGHT = 38 * 16; // rem * 16 = px
  const cars = await fetchCars();
  const IN_MAINTENANCE = 3; // status id for car in maintenance
  
  return (
    <section id="cars" className="min-h-screen relative bg-gradient-to-b from-main-color to-secondary-50 flex flex-col items-center pt-16">
        <h1 className="font-main-font text-4xl sm:text-5xl md:text-6xl md:py-10 text-center">Cars Available</h1>
        <Carousel height={CAROUSEL_HEIGHT}>
          {cars.map(car => {
              if (car.status?.id === IN_MAINTENANCE) return

              return <CarCard key={car.id} car={car} />
            })}
        </Carousel>
    </section>
  );
}