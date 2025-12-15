"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Car, CarStatus } from "@/types";
import AsyncButton from "@/components/AsyncButton";
import PlusIcon from "@/components/icons/PlusIcon";
import CarPlaceholderIcon from "@/components/icons/CarPlaceholderIcon";
import { useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast/use-toast';
import { deleteCar, updateCarStatus } from '@/lib/supabase/mutations/cars';

interface CarGridViewProps {
  cars: Car[];
  onAddNewCar: () => void;
  onEditCar: (car: Car) => void;
  carStatuses: CarStatus[];
}

const containerVariants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const CarGridView = ({ cars, onAddNewCar, onEditCar, carStatuses }: CarGridViewProps) => {
  const [carToDelete, setCarToDelete] = useState<Car | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDeleteClick = (car: Car) => {
    setCarToDelete(car);
  };

  const handleCloseModal = () => {
    setCarToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!carToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCar(carToDelete.id);
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
      setCarToDelete(null);
    }
  };

  const handleStatusChange = async (carId: number, statusId: number) => {
    try {
      await updateCarStatus(carId, statusId);
      toast({
        title: "Success",
        description: "Car status updated successfully.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update car status.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4 px-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Add a new car tile */}
        <div>
          <div className="relative border-2 border-dashed border-gray-300 rounded-2xl text-center flex flex-col items-center justify-center group bg-white hover:bg-gray-50 transition-colors h-[220px]">
              <AsyncButton
                onClick={onAddNewCar}
                className="w-full h-full flex flex-col items-center justify-center rounded-xl text-gray-600 hover:text-gray-800"
              >
                  <PlusIcon className="w-12 h-12 mb-2 opacity-60" />
                  <span className="font-medium text-base">Add a new car</span>
              </AsyncButton>
          </div>
        </div>

        {cars.map((car) => (
            <motion.div key={car.id} variants={itemVariants}>
              <div className="relative border border-gray-200 rounded-2xl p-4 shadow-sm bg-white overflow-hidden h-[220px] group hover:shadow-md transition-shadow">
                  
                  {/* Faded Background Image */}
                  <div className="absolute inset-0 z-0">
                    {car.image ? (
                        <div
                            className="w-full h-full bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500"
                            style={{ backgroundImage: `url(${car.image})` }}
                        ></div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 opacity-50">
                            <CarPlaceholderIcon className="w-24 h-24 text-gray-300" />
                        </div>
                    )}
                    {/* White gradient overlay to ensure text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/90"></div>
                  </div>

                  {/* Content Layout */}
                  <div className="relative z-10 flex flex-col h-full justify-between">
                      
                      {/* Top Row: Title and Prices */}
                      <div className="flex justify-between items-start gap-2">
                          {/* Car Title */}
                          <h3 className="font-bold text-gray-900 text-lg leading-tight max-w-[55%]">
                              {car.brand} {car.model} <span className="text-gray-700">{car.year}</span>
                              <span className="block text-sm font-normal text-gray-600 mt-0.5">({car.transmission})</span>
                          </h3>

                          {/* Pricing Info - Right Aligned */}
                          <div className="text-[10px] text-right text-gray-800 font-medium leading-tight">
                              {car.price?.map((priceInfo) => (
                                  <div key={priceInfo.Location} className="mb-1.5 last:mb-0">
                                      <div className="font-bold text-gray-600 opacity-90">{priceInfo.Location}:</div>
                                      {priceInfo.Location !== "Outside Region 10" && (
                                          <div>₱{priceInfo.Price_12_Hours}/12hrs</div>
                                      )}
                                      <div>₱{priceInfo.Price_24_Hours}/24hrs</div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Bottom Row: Actions and Status */}
                      <div className="flex justify-between items-end mt-auto">
                          {/* Edit/Delete Buttons */}
                          <div className="flex flex-col gap-1">
                              <AsyncButton
                                onClick={() => onEditCar(car)}
                                className="text-[10px] text-blue-600 font-bold hover:text-blue-700 hover:underline text-left pl-1 bg-transparent border-none shadow-none p-0 h-auto w-auto"
                              >
                                  Edit
                              </AsyncButton>
                              <button 
                                onClick={() => handleDeleteClick(car)}
                                className="text-[10px] text-red-500 font-bold hover:text-red-600 hover:underline text-left pl-1"
                              >
                                  Delete
                              </button>
                          </div>

                          {/* Status Dropdown with Label - Changed items-end to items-start */}
                          <div className="flex flex-col items-start gap-0.5">
                                <label htmlFor={`status-${car.id}`} className="text-[10px] font-semibold text-gray-500">Status:</label>
                                <div className="relative">
                                    <select
                                        id={`status-${car.id}`}
                                        value={car.status?.id || ''}
                                        onChange={(e) => handleStatusChange(car.id, parseInt(e.target.value))}
                                        className="appearance-none text-[10px] font-medium py-1 pl-2 pr-6 bg-white/80 border border-gray-200 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                        style={{ backgroundImage: 'none' }} 
                                    >
                                        {carStatuses.map(status => (
                                            <option key={status.id} value={status.id}>{status.status}</option>
                                        ))}
                                    </select>
                                    {/* Custom arrow indicator */}
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-500">
                                        <svg className="h-3 w-3 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                      </div>
                  </div>
              </div>
            </motion.div>
        ))}
      </motion.div>

      {carToDelete && (
        <ConfirmationModal
          isOpen={!!carToDelete}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          title="Confirm Deletion"
          message={`Are you sure you want to delete the car "${carToDelete.brand} ${carToDelete.model} (${carToDelete.year})"? This action cannot be undone.`}
          isLoading={isDeleting}
          loadingText="Deleting..."
        />
      )}
    </>
  );
};

export default CarGridView;