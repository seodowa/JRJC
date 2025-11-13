// components/admin/cars/CarsSidebar.tsx
import { Car } from "@/types";
import AsyncButton from "@/components/AsyncButton";

interface CarsSidebarProps {
  cars: Car[];
}

const CarsSidebar = ({ cars }: CarsSidebarProps) => {
  return (
    <div>
      <AsyncButton
        href="/adminSU/cars/new" 
        className="bg-white text-black px-4 py-4 rounded-xl hover:bg-[#A1E3F9]/90 w-full block text-center mb-4 border border-gray-400"
      >
        + Add a new car
      </AsyncButton>
      <nav>
        <ul>
          {cars.map((car) => (
            <li key={car.id} className="border-y border-gray-400">
              <a 
                href={`#car-id-${car.id}`} 
                className="block p-4 hover:bg-gray-200 whitespace-nowrap overflow-hidden text-black text-sm text-center"
              >
                {`${car.brand} ${car.model} ${car.year}`}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default CarsSidebar;
