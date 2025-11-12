// components/admin/cars/CarsSidebar.tsx
import { Car } from "@/types";
import AsyncButton from "@/components/AsyncButton";

interface CarsSidebarProps {
  cars: Car[];
}

const CarsSidebar = ({ cars }: CarsSidebarProps) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Manage Cars</h2>
      <AsyncButton
        href="/adminSU/cars/new" 
        className="bg-white text-black px-4 py-4 rounded-xl hover:bg-[#A1E3F9] w-full block text-center mb-4 border border-gray-300"
      >
        + Add a new car
      </AsyncButton>
      <nav>
        <ul>
          {cars.map((car) => (
            <li key={car.id} className="border-y border-gray-300">
              <a 
                href={`#car-id-${car.id}`} 
                className="block p-4 hover:bg-gray-200 whitespace-nowrap overflow-hidden text-ellipsis text-sm text-center"
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
