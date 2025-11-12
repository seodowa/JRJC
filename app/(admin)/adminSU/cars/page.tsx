"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car } from "@/types";
import { fetchCars } from "@/lib/supabase/queries/fetchCars";
import AdminCarCard from "@/components/admin/cars/AdminCarCard";
import CarsSidebar from "@/components/admin/cars/CarsSidebar";
import ViewToggle from "@/components/admin/cars/ViewToggle";
import CarPlaceholderIcon from "@/components/icons/CarPlaceholderIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import AsyncButton from "@/components/AsyncButton";

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
    <main className="relative flex flex-col md:flex-row gap-4 h-full">
      {/* List View Sidebar */}
      <AnimatePresence>
        {view === 'list' && (
          <motion.div
            className={`relative w-full md:w-[300px] flex-shrink-0 ${cardBaseStyle}`}
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <h2 className="text-xl font-bold mb-4">Manage Cars</h2>
            <CarsSidebar cars={cars} />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <ViewToggle view={view} setView={setView} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1">
        <div className={`relative h-full flex flex-col ${cardBaseStyle}`}>
          {/* Sticky Top Bar for Grid View */}
          {view === 'grid' && (
              <motion.div
                  className="sticky top-0 bg-white px-4 z-40 flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                  <h2 className="text-2xl font-bold">Manage Cars</h2>
              </motion.div>
          )}

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    {loading ? (
                      <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>
                    ) : view === 'list' ? (
                      <div className="flex flex-col gap-4 p-6">
                        {cars.map((car) => (
                          <AdminCarCard key={car.id} car={car} />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4 px-6">
                         {/* Add a new car tile */}
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg text-center flex flex-col items-center justify-center group" style={{ minHeight: '250px' }}>
                            <AsyncButton className="w-full h-full flex flex-col items-center justify-center rounded-md text-black hover:bg-gray-500/25">
                                <PlusIcon className="w-16 h-16 mb-2" />
                                <span className="font-bold">Add a new car</span>
                            </AsyncButton>
                        </div>
                         {cars.map((car) => (
                            <div key={car.id} className="relative border rounded-lg p-4 text-center overflow-hidden group flex items-center justify-center" style={{ minHeight: '250px' }}>
                                {car.image ? (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
                                        style={{ backgroundImage: `url(${car.image})` }}
                                    ></div>
                                ) : (
                                    <CarPlaceholderIcon className="w-32 h-32 text-gray-300" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-white/80 z-20"></div>
                                <div className="absolute bottom-0 left-0 right-0 z-30 bg-opacity-50 p-2 rounded-t-lg flex justify-between items-end">
                                    <div className="text-left">
                                        <h1 className="font-bold text-black text-lg">{`${car.brand} ${car.model} ${car.year} (${car.transmission})`}</h1>
                                    </div>
                                    <div className="text-sm text-right">
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
                            </div>
                         ))}
                      </div>
                    )}
                </motion.div>
            </AnimatePresence>
          </div>

          {/* Sticky Bottom Bar for Grid View */}
          {view === 'grid' && (
              <motion.div
                  className="sticky bottom-0 bg-white px-4 z-40 flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                  <ViewToggle view={view} setView={setView} />
              </motion.div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ManageCarsPage;