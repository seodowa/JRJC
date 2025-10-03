"use client";

import React, { useEffect, useRef, useState } from "react";
import { Car } from "@/types";
import CarCard from "./CarCard";
import { fetchCars } from "@/lib/supabase/queries/cars";

interface SelectCarProps {
  selectedCar: number | null;
  setSelectedCar: React.Dispatch<React.SetStateAction<number | null>>;
  onCarSelect?: (car: Car | null) => void;
}

export default function SelectCar({ selectedCar, setSelectedCar, onCarSelect }: SelectCarProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadCars = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const carsData = await fetchCars();
        
        if (!mounted) return;
        
        console.log("First car data structure:", carsData?.[0]);
        setCars(carsData);
        
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch cars");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCars();
    return () => {
      mounted = false;
    };
  }, []);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer hover:border-gray-400 transition-colors"
      >
        {selectedCarData ? (
          <div className="flex items-center justify-between">
            <span>{`${selectedCarData.brand} ${selectedCarData.model} ${selectedCarData.year}`}</span>
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
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow-sm mr-2 flex-shrink-0 z-20"
                aria-label="Scroll left"
              >
                ‹
              </button>

              <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide flex-1"
                style={{ scrollBehavior: "smooth" }}
              >
                {cars.map((car) => (
                  <div
                    key={`car-${car.id}`}
                    onClick={() => handleCarSelect(car)}
                    role="button"
                    tabIndex={0}
                    className={`flex-shrink-0 cursor-pointer transition-all duration-200 snap-start
                      ${selectedCar === car.id ? "ring-2 ring-blue-500 ring-offset-2 rounded-3xl" : "hover:scale-105"}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleCarSelect(car);
                      }
                    }}
                  >
                    <CarCard car={car} />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => scrollBy(320)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow-sm ml-2 flex-shrink-0 z-20"
                aria-label="Scroll right"
              >
                ›
              </button>
            </div>
          )}

          {/* Selected car preview */}
          {selectedCarData && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Currently Selected:</h4>
              <div className="flex items-center gap-4">
                {selectedCarData.image && (
                  <img 
                    src={selectedCarData.image} 
                    alt={`${selectedCarData.brand} ${selectedCarData.model}`}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className="font-semibold">{`${selectedCarData.brand} ${selectedCarData.model} ${selectedCarData.year}`}</p>
                  <p className="text-sm text-gray-600">{selectedCarData.transmission} • {selectedCarData.fuelType}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}