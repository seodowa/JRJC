"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Car, CarStatus } from "@/types";
import AsyncButton from "@/components/AsyncButton";
import PlusIcon from "@/components/icons/PlusIcon";
import CarPlaceholderIcon from "@/components/icons/CarPlaceholderIcon";
import { useState } from "react";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
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
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg text-center flex flex-col items-center justify-center group" style={{ minHeight: '250px', height: '100%' }}>
              <AsyncButton
                onClick={onAddNewCar}
                className="w-full h-full flex flex-col items-center justify-center rounded-md text-black hover:bg-gray-500/25"
              >
                  <PlusIcon className="w-16 h-16 mb-2" />
                  <span className="font-bold">Add a new car</span>
              </AsyncButton>
          </div>
        </div>

        {cars.map((car) => (
            <motion.div key={car.id} variants={itemVariants}>
              <div className="relative border rounded-lg p-4 text-center overflow-hidden group flex items-center justify-center" style={{ minHeight: '250px', height: '100%' }}>
                  {car.image ? (
                      <div
                          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundImage: `url(${car.image})` }}
                      ></div>
                  ) : (
                      <CarPlaceholderIcon className="w-32 h-32 text-gray-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-white/80 z-5"></div> {/*White Gradient*/}
                  <div className="absolute top-1 left-0 right-0 z-5 bg-opacity-50 p-2 rounded-t-lg flex justify-between items-end">
                      <div className="text-left">
                          <h1 className="absolute top-1 font-bold text-black text-lg">{`${car.brand} ${car.model} ${car.year} (${car.transmission})`}</h1>
                      </div>
                      <div className="abosolute bottom-1 text-sm text-right">
                          {car.price?.map((priceInfo) => (
                              <div key={priceInfo.Location} className="mb-1">
                                  <p className="font-semibold">{priceInfo.Location}:</p>
                                  {priceInfo.Location !== "Outside Region 10" && (
                                      <p>₱{priceInfo.Price_12_Hours}/12hrs</p>
                                  )}
                                  <p>₱{priceInfo.Price_24_Hours}/24hrs</p>
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="absolute right-2 bottom-2 z-5 flex items-center gap-2">
                        <label htmlFor={`status-${car.id}`} className="font-semibold text-sm">Status:</label>
                        <select
                            id={`status-${car.id}`}
                            value={car.status?.id || ''}
                            onChange={(e) => handleStatusChange(car.id, parseInt(e.target.value))}
                            className="text-sm rounded-md w-full max-w-[100px] text-black bg-white"
                        >
                            {carStatuses.map(status => (
                                <option key={status.id} value={status.id}>{status.status}</option>
                            ))}
                        </select>
                    </div>
                  <AsyncButton
                    onClick={() => onEditCar(car)}
                    className="absolute left-2 bottom-8 z-5 px-2 rounded-md bg-white/70 border-1 border-black/60 hover:bg-white text-black text-sm"
                  >
                      Edit
                  </AsyncButton>
                  <AsyncButton 
                    onClick={() => handleDeleteClick(car)}
                    className="absolute left-2 bottom-2 z-5 px-2 rounded-md bg-red-400 border-1 border-black/60 hover:bg-red-600 text-black text-sm"
                  >
                      Delete
                  </AsyncButton>
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
        />
      )}
    </>
  );
};

export default CarGridView;
