'use client';

import { useState } from "react";
import Image from "next/image";
import { Car, CarStatus } from "@/types";
import AsyncButton from "@/components/AsyncButton";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import CarPlaceholderIcon from "@/components/icons/CarPlaceholderIcon";
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast/use-toast';
import { deleteCar, updateCarStatus } from '@/lib/supabase/mutations/cars';

interface AdminCarCardProps {
  car: Car;
  onEditCar: (car: Car) => void;
  carStatuses: CarStatus[];
}

const AdminCarCard = ({ car, onEditCar, carStatuses }: AdminCarCardProps) => {
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
    // Changed gap-6 to gap-4 and p-6 to p-5 for tighter layout
    <div id={`car-id-${car.id}`} className="flex flex-col md:flex-row gap-4 p-5 bg-white rounded-[24px] border border-gray-200 shadow-sm items-start">
      
      {/* 1. Image Section - Reduced width from w-48 to w-40 */}
      <div className="w-full md:w-40 h-40 flex-shrink-0 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100">
        {car.image ? (
          <Image
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            width={160}
            height={160}
            className="object-cover w-full h-full"
          />
        ) : (
          <CarPlaceholderIcon className="w-16 h-16 text-gray-300" />
        )}
      </div>

      {/* 2. Content Section */}
      <div className="flex-1 w-full min-w-0"> {/* min-w-0 ensures flex child truncates properly */}
        
        {/* Header Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-3 truncate">
            {car.brand} {car.model} <span className="text-gray-600 font-semibold">{car.year}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4"> {/* Reduced gap-6 to gap-4 */}
            
            {/* Column A: Buttons & Status */}
            <div className="md:col-span-3 flex flex-col gap-3">
                <div className="flex flex-col gap-2"> {/* Changed from flex-row to flex-col */}
                    <AsyncButton
                        onClick={() => onEditCar(car)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all text-xs"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        Edit
                    </AsyncButton>
                    <AsyncButton 
                        onClick={handleDeleteClick}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 font-medium hover:bg-red-50 hover:border-red-300 transition-all text-xs"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        Delete
                    </AsyncButton>
                </div>

                <div>
                    <label htmlFor={`status-${car.id}`} className="block text-xs text-gray-500 mb-1">Status:</label>
                    <div className="relative">
                        <select
                            id={`status-${car.id}`}
                            value={car.status?.id || ''}
                            onChange={(e) => handleStatusChange(car.id, parseInt(e.target.value))}
                            className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-1.5 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs font-medium"
                        >
                            {carStatuses.map(status => (
                                <option key={status.id} value={status.id}>{status.status}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Column B: Specs */}
            <div className="md:col-span-4 text-xs text-gray-600 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Transmission:</span>
                    <span className="font-medium text-gray-800">{car.transmission}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Fuel Type:</span>
                    <span className="font-medium text-gray-800">{car.fuelType}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Color:</span>
                    <div className="flex items-center gap-2">
                        {car.color && (
                            <span 
                                className="w-3 h-3 rounded-full border border-gray-300 shadow-sm" 
                                style={{ backgroundColor: car.color }}
                            />
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Number of Seats:</span>
                    <span className="font-medium text-gray-800">{car.seats}</span>
                </div>
            </div>

            {/* Column C: Pricing */}
            <div className="md:col-span-5 text-xs">
                <div className="space-y-2">
                    {car.price?.map((priceInfo) => (
                        <div key={priceInfo.Location} className="flex justify-between items-start pb-1.5 border-b border-gray-100 last:border-0 last:pb-0">
                            <span className="text-gray-500 font-medium w-1/2 truncate pr-1" title={priceInfo.Location}>{priceInfo.Location}:</span>
                            <div className="text-right w-1/2 flex flex-col">
                                {priceInfo.Location !== "Outside Region 10" && (
                                    <span className="text-gray-700">₱{priceInfo.Price_12_Hours}/12hrs</span>
                                )}
                                <span className="text-gray-900 font-semibold">₱{priceInfo.Price_24_Hours}/24hrs</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>

      {/* ConfirmationModal for deletion */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the car "${car.brand} ${car.model} (${car.year})"? This action cannot be undone.`}
        isLoading={isDeleting}
        loadingText="Deleting..."
      />
    </div>
  );
};

export default AdminCarCard;