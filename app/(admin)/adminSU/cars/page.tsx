import { fetchCars } from "@/lib/supabase/queries/fetchCars";
import AdminCarCard from "@/components/admin/cars/AdminCarCard";
import CarsSidebar from "@/components/admin/cars/CarsSidebar";

const ManageCarsPage = async () => {
  const cars = await fetchCars();
  const cardBaseStyle = "bg-white p-6 rounded-[30px] shadow-md";

  return (
    <main className="flex flex-col md:flex-row gap-4 p-2 h-full">
      {/* CONTAINER 1: The Left Sidebar */}
      <div className={`w-full md:w-[300px] flex-shrink-0 overflow-y-auto ${cardBaseStyle}`}>
        <CarsSidebar cars={cars} />
      </div>

      {/* CONTAINER 2: The Main Content Area */}
      <div className={`flex-1 overflow-y-auto ${cardBaseStyle}`}>
        <div className="flex flex-col gap-4">
          {cars.map((car) => (
            <AdminCarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default ManageCarsPage;