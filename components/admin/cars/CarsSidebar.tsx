// components/admin/cars/CarsSidebar.tsx
import Link from "next/link";
import { Car } from "@/types";
import AsyncButton from "@/components/AsyncButton";

interface CarsSidebarProps {
  cars: Car[];
  onAddNewCar: () => void;
}

const CarsSidebar = ({ cars, onAddNewCar }: CarsSidebarProps) => {
  return (
    <div>
      <AsyncButton
        onClick={onAddNewCar}
        className="bg-white text-black px-4 py-4 rounded-xl hover:bg-[#A1E3F9] w-full block text-center mb-4 border border-gray-400"
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
