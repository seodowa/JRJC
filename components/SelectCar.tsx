// components/SelectCar.tsx (fixed version)
"use client";

import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Car {
  id: number;
  Model_Name: string;
  Transmission_ID?: number;
  Manufacturer_ID?: number;
  Fuel_Type_ID?: number;
  Year_Model?: number;
  Number_Of_Seats?: number;
  image?: string | null;
  Transmission_Types?: {
    ID: number;
    Name: string;
  };
  [key: string]: any;
}

interface SelectCarProps {
  selectedCar: number | null;
  setSelectedCar: React.Dispatch<React.SetStateAction<number | null>>;
  onCarSelect?: (car: Car | null) => void;
}

export default function SelectCar({ selectedCar, setSelectedCar, onCarSelect }: SelectCarProps) {
  const supabase = createClient();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchCars = async () => {
      try {
        setLoading(true);
        
        // First get cars
        const { data: carsData, error: carsError } = await supabase
          .from("Car_Models")
          .select("*");

        if (carsError) {
          setError(carsError.message);
          setLoading(false);
          return;
        }

        // Get all transmission types
        const { data: transmissionData, error: transmissionError } = await supabase
          .from("Transmission_Types")
          .select("*");

        // Combine the data - FIXED: use ID (uppercase) instead of id
        const carsWithTransmission = carsData?.map(car => {
          const transmission = transmissionData?.find(trans => trans.Transmission_ID === car.Transmission_ID);
          
                return {
          ...car,
          Transmission_Types: transmission ? {
            ID: transmission.Transmission_ID,  // Map from Transmission to ID
            Name: transmission.Name
          } : undefined
        };
      }) || [];
        if (!mounted) return;
        setCars(carsWithTransmission);
        
      } catch (err) {
        setError("Failed to fetch cars");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const scrollBy = (distance: number) => {
    scrollRef.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  const selectedCarData = cars.find(car => car.id === selectedCar);

  const handleCarSelect = (car: Car) => {
    setSelectedCar(car.id);
    setIsOpen(false);
    onCarSelect?.(car);
  };

  const handleClearSelection = () => {
    setSelectedCar(null);
    onCarSelect?.(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer hover:border-gray-400 transition-colors"
      >
        {selectedCarData ? (
          <div className="flex items-center justify-between">
            <span>{selectedCarData.Model_Name}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearSelection();
                }}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
              <span className="text-gray-400">▼</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-gray-500">
            <span>Select car</span>
            <span className="text-gray-400">▼</span>
          </div>
        )}
      </div>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Select a car:</h3>
          
          {loading && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Loading cars...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-4">
              <p className="text-sm text-red-500">Error: {error}</p>
            </div>
          )}

          {!loading && !error && cars.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No car models available</p>
            </div>
          )}

          {!loading && !error && cars.length > 0 && (
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => scrollBy(-320)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow-sm mr-2 flex-shrink-0"
                aria-label="Scroll left"
              >
                ‹
              </button>

              <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollBehavior: "smooth" }}
              >
                {cars.map((car) => (
                  <div
                    key={`car-${car.id}`}
                    onClick={() => handleCarSelect(car)}
                    role="button"
                    tabIndex={0}
                    className={`flex-shrink-0 w-64 border rounded-xl p-4 bg-white shadow-sm cursor-pointer transition-all duration-200 snap-start
                      ${selectedCar === car.id ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-400"}`}
                  >
                    <div className="w-full h-32 bg-gray-100 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                      {car.image ? (
                        <img 
                          src={car.image} 
                          alt={car.Model_Name} 
                          className="h-full object-contain"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg">{car.Model_Name}</h3>
                    <p className="text-sm text-gray-500">Transmission: {car.Transmission_Types?.Name || "—"}</p>
                    <p className="text-sm text-gray-500">Year: {car.Year_Model ?? "—"}</p>
                    <p className="text-sm text-gray-500">Seats: {car.Number_Of_Seats ?? "—"}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => scrollBy(320)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow-sm ml-2 flex-shrink-0"
                aria-label="Scroll right"
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}