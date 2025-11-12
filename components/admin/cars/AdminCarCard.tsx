// components/admin/cars/AdminCarCard.tsx
import Image from "next/image";
import Link from "next/link";
import { Car } from "@/types";
import DeleteCarButton from "./DeleteCarButton";

interface AdminCarCardProps {
  car: Car;
}

const AdminCarCard = ({ car }: AdminCarCardProps) => {
  return (
    <div id={`car-id-${car.id}`} className="flex flex-col md:flex-row gap-4 border border-gray-300 rounded-lg p-4 shadow-sm">
      {/* Image */}
      <div className="w-full md:w-[250px] flex-shrink-0">
        <Image
          src={car.image || "/images/kentb_car.webp"} // Placeholder image
          alt={`${car.brand} ${car.model}`}
          width={250}
          height={250}
          className="object-cover rounded-lg w-full h-full"
        />
      </div>

      {/* Details */}
      <div className="flex-1">
        <h3 className="text-xl font-bold">{`${car.brand} ${car.model} ${car.year}`}</h3>
        <p>Transmission: {car.transmission}</p>
        <p>Fuel Type: {car.fuelType}</p>
        <p>Seats: {car.seats}</p>
        
        <div className="mt-4 flex gap-2">
          <Link href={`/adminSU/cars/edit/${car.id}`} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Edit
          </Link>
          <DeleteCarButton carId={car.id} />
        </div>
      </div>

      {/* Pricing */}
      <div className="w-full md:w-auto">
        {car.price?.map((priceInfo) => (
          <div key={priceInfo.Location} className="mb-3">
            <p className="font-semibold">{priceInfo.Location}:</p>
            <p>₱{priceInfo.Price_12_Hours}/12hrs</p>
            <p>₱{priceInfo.Price_24_Hours}/24hrs</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCarCard;
