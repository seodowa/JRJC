'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardCarData } from "@/types";
import CheckmarkIcon from "@/components/icons/CheckmarkIcon";
import XmarkIcon from "@/components/icons/XmarkIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import AsyncButton from "@/components/AsyncButton";
import AddEditCarModal from "@/components/admin/cars/AddEditCarModal";
import { fetchManufacturers, fetchTransmissionTypes, fetchFuelTypes, fetchLocations } from '@/lib/supabase/queries/client/fetchDropdownData';

interface CarsProps {
  cars: DashboardCarData[];
}

const Cars: React.FC<CarsProps> = ({ cars }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    brands: [] as string[],
    transmissionTypes: [] as string[],
    fuelTypes: [] as string[],
    locations: [] as string[],
  });

  useEffect(() => {
    const loadDropdownData = async () => {
      const [brands, transmissionTypes, fuelTypes, locations] = await Promise.all([
        fetchManufacturers(),
        fetchTransmissionTypes(),
        fetchFuelTypes(),
        fetchLocations(),
      ]);
      setDropdownData({ brands, transmissionTypes, fuelTypes, locations });
    };
    loadDropdownData();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.refresh();
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <>
      <AddEditCarModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        brands={dropdownData.brands}
        transmissionTypes={dropdownData.transmissionTypes}
        fuelTypes={dropdownData.fuelTypes}
        locations={dropdownData.locations}
      />
      <div className="flex flex-col h-full">
        <h2 className="text-2xl font-bold mb-4">Cars</h2>
        <div className="flex-grow space-y-4 max-h-[90vh] overflow-y-auto">
          {cars.map((car) => {
            const bgColor = car.color_code || '#808080';
            const isAvailable = car.status_id === 1; // 1 for Parked

            return (
              <div
                key={car.Model_ID}
                className="p-4 rounded-4xl shadow-md text-white min-h-32 flex items-center justify-between"
                style={{ backgroundColor: hexToRgba(bgColor, 0.7) }}
              >
                <div className="flex-grow">
                  <p className="font-bold">{`${car.Manufacturer_Name} ${car.Model_Name} ${car.Year_Model} (${car.Transmission_Type})`}</p>
                  {car.status_id === 2 && car.bookingDetails && ( // 2 for Traveling
                    <div>
                      <p>{`Rented by: ${car.bookingDetails.Customer_Full_Name}`}</p>
                      <p>{`Duration: ${car.bookingDetails.Duration} hours, Location: ${car.bookingDetails.Location}`}</p>
                    </div>
                  )}
                </div>
                <div className="w-16 h-16">
                  {isAvailable ? <CheckmarkIcon className="w-full h-full" /> : <XmarkIcon className="w-full h-full" />}
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-white h-auto p-4">
          <div className="flex">
              <AsyncButton 
                onClick={() => setIsModalOpen(true)}
                className="flex flex-grow justify-center py-6 text-black font-bold rounded-3xl hover:bg-black/25 transition-colors ">
                <PlusIcon className="w-16 h-16" />
              </AsyncButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cars;