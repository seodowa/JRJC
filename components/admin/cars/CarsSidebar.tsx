// components/admin/cars/CarsSidebar.tsx
import { buttonClass } from "@/components/ui/button";
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
        className={buttonClass("secondary", "lg", "mb-4 w-full")}
      >
        + Add a new car
      </AsyncButton>
      <nav>
        <ul>
          {cars.map((car) => (
            <li key={car.id} className="border-b border-line">
              <a 
                href={`#car-id-${car.id}`} 
                className="block p-4 hover:bg-gray-200 whitespace-nowrap overflow-hidden text-ink text-sm"
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
