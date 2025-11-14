// components/admin/cars/AdminCarCard.tsx
'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Car } from "@/types";
import AsyncButton from "@/components/AsyncButton";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import CarPlaceholderIcon from "@/components/icons/CarPlaceholderIcon"; // Import the new icon
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast/use-toast';
import { deleteCar } from '@/lib/supabase/mutations/cars';

interface AdminCarCardProps {
  car: Car;
  onEditCar: (car: Car) => void;
}

const AdminCarCard = ({ car, onEditCar }: AdminCarCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDeleteClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCar(car.id);
      toast({
        title: "Success",
        description: "Car deleted successfully.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete car.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div id={`car-id-${car.id}`} className="flex flex-col md:flex-row gap-4 border border-gray-300 rounded-lg p-4 shadow-sm">
      {/* Image */}
      <div className="w-full md:w-[250px] flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg"> {/* Added flex, items-center, justify-center, bg-gray-100 */}
        {car.image ? (
          <Image
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            width={250}
            height={250}
            className="object-cover rounded-lg w-full h-full"
          />
        ) : (
          <CarPlaceholderIcon className="w-32 h-32 text-gray-400" /> // Render the SVG icon
        )}
      </div>

      {/* Details */}
      <div className="flex-1">
        <h3 className="text-xl font-bold">{`${car.brand} ${car.model} ${car.year}`}</h3>
        <p>Transmission: {car.transmission}</p>
        <p>Fuel Type: {car.fuelType}</p>
        <p>Seats: {car.seats}</p>
        
        <div className="mt-4 flex gap-2">
          <AsyncButton
            onClick={() => onEditCar(car)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Edit
          </AsyncButton>
          <AsyncButton 
            onClick={handleDeleteClick}
            className="bg-red-400 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Delete
          </AsyncButton>
        </div>
      </div>

      {/* Pricing */}
      <div className="w-full md:w-auto">
        {car.price?.map((priceInfo) => (
          <div key={priceInfo.Location} className="mb-3">
            <p className="font-semibold">{priceInfo.Location}:</p>
            {priceInfo.Location !== "Outside Region 10" && (
                <p>₱{priceInfo.Price_12_Hours}/12hrs</p>
            )}
            <p>₱{priceInfo.Price_24_Hours}/24hrs</p>
          </div>
        ))}
      </div>

      {/* ConfirmationModal for deletion */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the car "${car.brand} ${car.model} (${car.year})"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminCarCard;
