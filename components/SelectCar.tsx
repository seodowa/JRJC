// components/SelectCar.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import {createClient} from "@/utils/supabase/client";

interface Car {
  id: number;
  Model_Name: string;
  Transmission_ID?: number;
  Manufacturer_ID?: number;
  Fuel_Type_ID?: number;
  Year_Model?: number;
  Number_Of_Seats?: number;
  image?: string | null;
  [key: string]: any;
}

interface SelectCarProps {
  selectedCar: number | null;
  setSelectedCar: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function SelectCar({ selectedCar, setSelectedCar }: SelectCarProps) {
  const supabase = createClient();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchCars = async () => {
    const { data, error } = await supabase
      .from("Car_Models")
      .select("*");

    if (error) console.error("Error fetching cars:", error);
    else setCars(data as Car[]);
  

      if (!mounted) return;
      if (error) {
        console.error("Supabase error:", error);
        setError(error.message);
      } else {
        setCars(data ?? []);
      }
      setLoading(false);
    };

    fetchCars();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const scrollBy = (distance: number) => {
    scrollRef.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Select a car: <span className="text-red-500">*</span></h2>

      {loading && <p className="text-sm text-gray-500 mb-2">Loading cars…</p>}
      {error && <p className="text-sm text-red-500 mb-2">Error: {error}</p>}

      <div className="flex items-center">
        <button
          type="button"
          onClick={() => scrollBy(-320)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow-sm mr-2"
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div
          ref={scrollRef}
          id="carScroll"
          className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {cars.length === 0 && !loading ? (
            <div className="text-sm text-gray-500 p-6">No car models found</div>
          ) : (
            cars.map((car) => (
              <div
                key={car.id}
                onClick={() => setSelectedCar(car.id)}
                role="button"
                tabIndex={0}
                className={`flex-shrink-0 w-64 border rounded-xl p-4 bg-white shadow-sm cursor-pointer transition-all duration-200 snap-start
                  ${selectedCar === car.id ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-400"}`}
              >
                <div className="w-full h-32 bg-gray-100 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                  {car.image ? (
                    // if your images are relative paths ensure they exist in /public
                    <img src={car.image} alt={car.Model_Name} className="h-full object-contain" />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>

                <h3 className="font-semibold text-lg">{car.Model_Name}</h3>
                <p className="text-sm text-gray-500">Year: {car.Year_Model ?? "—"}</p>
                <p className="text-sm text-gray-500">Seats: {car.Number_Of_Seats ?? "—"}</p>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={() => scrollBy(320)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow-sm ml-2"
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </div>
  );
}
