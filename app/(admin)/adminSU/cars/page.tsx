"use client";

import { useState, useEffect } from "react";
import { Car } from "@/types";
import { fetchCars } from "@/lib/supabase/queries/fetchCars";
import AdminCarCard from "@/components/admin/cars/AdminCarCard";
import CarsSidebar from "@/components/admin/cars/CarsSidebar";
import ViewToggle from "@/components/admin/cars/ViewToggle";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

const ManageCarsPage = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const getCars = async () => {
      try {
        const fetchedCars = await fetchCars();
        setCars(fetchedCars);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };

    getCars();
  }, []);

  const cardBaseStyle = "bg-white p-6 rounded-[30px] shadow-md";

  return (
    <main className="relative flex flex-col md:flex-row gap-4 p-2 h-full">
      {view === 'list' && (
        <div className={`relative w-full md:w-[300px] flex-shrink-0 overflow-y-auto ${cardBaseStyle}`}>
          <CarsSidebar cars={cars} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <ViewToggle view={view} setView={setView} />
          </div>
        </div>
      )}

      {view === 'grid' && (
          <>
              {/* "Manage Cars" title for grid view */}
              <h2 className="absolute top-6 left-6 text-xl font-bold z-10">Manage Cars</h2>
              {/* View Toggle for grid view */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                  <ViewToggle view={view} setView={setView} />
              </div>
          </>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto ${cardBaseStyle}`}>
        {loading ? (
          <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>
        ) : view === 'list' ? (
          <div className="flex flex-col gap-4">
            {cars.map((car) => (
              <AdminCarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {cars.map((car) => (
                <div key={car.id} className="border rounded-lg p-4 text-center">
                    <h3 className="font-bold">{`${car.brand} ${car.model}`}</h3>
                    <p>{car.year}</p>
                </div>
             ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ManageCarsPage;