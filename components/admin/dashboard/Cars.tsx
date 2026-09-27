'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardCarData } from "@/types";
import Badge from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/button";
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
      <div className="flex h-full flex-col">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-2xl">Fleet right now</h2>
          <span className="num text-xs text-ink-2">{cars.length} cars</span>
        </div>
        <ul className="flex-grow">
          {cars.map((car) => {
            const isAvailable = car.status_id === 1; // 1 for Parked
            const isTraveling = car.status_id === 2; // 2 for Traveling
            const statusLabel = isAvailable ? 'Available' : isTraveling ? 'On trip' : 'Unavailable';

            return (
              <li key={car.Model_ID} className="flex items-start justify-between gap-4 border-b border-line py-3.5">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-ink/15"
                    style={{ backgroundColor: car.color_code || '#B3A996' }}
                  />
                  <div className="min-w-0">
                    <p className="font-medium">{`${car.Manufacturer_Name} ${car.Model_Name}`}</p>
                    <p className="num text-xs text-ink-2">{car.Year_Model} · {car.Transmission_Type}</p>
                    {isTraveling && car.bookingDetails && (
                      <p className="mt-1 text-sm text-ink-2">
                        {car.bookingDetails.Customer_Full_Name} · {car.bookingDetails.Duration}h · {car.bookingDetails.Location}
                      </p>
                    )}
                  </div>
                </div>
                <Badge tone={isAvailable ? 'forest' : isTraveling ? 'ochre' : 'brick'}>{statusLabel}</Badge>
              </li>
            );
          })}
        </ul>
        <AsyncButton
          onClick={() => setIsModalOpen(true)}
          className={buttonClass("secondary", "md", "mt-5 w-full")}
        >
          + Add a car
        </AsyncButton>
      </div>
    </>
  );
};

export default Cars;