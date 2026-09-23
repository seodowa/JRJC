import CarCard from "../CarCard";
import SectionHeader from "../ui/SectionHeader";
import { fetchCars } from "@/lib/supabase/queries/client/fetchCars";

export default async function CarsSection() {
  const cars = await fetchCars();
  const IN_MAINTENANCE = 3; // status id for car in maintenance
  const available = cars.filter(car => car.status?.id !== IN_MAINTENANCE);

  return (
    <section className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 pb-24 sm:px-8 lg:px-16 lg:pb-28">
      <SectionHeader index="01" label="Fleet" title="Pick what fits the trip.">
        <p className="num text-xs text-ink-2">{available.length} cars available</p>
      </SectionHeader>
      {available.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {available.map(car => <CarCard key={car.id} car={car} />)}
        </div>
      ) : (
        <p className="text-ink-2">No cars are available right now. Please check back soon.</p>
      )}
    </section>
  );
}
