"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { Car, CarStatus } from "@/types";
import CarsSidebar from "@/components/admin/cars/CarsSidebar";
import ViewToggle from "@/components/admin/cars/ViewToggle";
import CarGridView from "@/components/admin/cars/CarGridView";
import CarListView from "@/components/admin/cars/CarListView";
import SearchBar from "@/components/SearchBar";
import { useState, useEffect } from "react";
import AddEditCarModal from "@/components/admin/cars/AddEditCarModal";
import { fetchManufacturers, fetchTransmissionTypes, fetchFuelTypes, fetchLocations } from '@/lib/supabase/queries/client/fetchDropdownData';

interface CarsPageClientProps {
  cars: Car[];
  carStatuses: CarStatus[];
  view: 'list' | 'grid';
  search: string;
}

const CarsPageClient: React.FC<CarsPageClientProps> = ({ cars, carStatuses, view, search }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carToEdit, setCarToEdit] = useState<Car | null>(null);
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

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 800);

  const handleViewChange = (newView: 'list' | 'grid') => {
    const params = new URLSearchParams(searchParams);
    params.set('view', newView);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleOpenAddModal = () => {
    setCarToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (car: Car) => {
    setCarToEdit(car);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCarToEdit(null);
    router.refresh();
  };

  // Matches the visual style of the white container in the 2nd picture
  const cardBaseStyle = "bg-white p-6 rounded-[30px] shadow-sm border border-gray-100";

  return (
    <>
      <AddEditCarModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        carToEdit={carToEdit}
        brands={dropdownData.brands}
        transmissionTypes={dropdownData.transmissionTypes}
        fuelTypes={dropdownData.fuelTypes}
        locations={dropdownData.locations}
      />
      
      {/* Reduced gap from gap-6 to gap-4 for tighter layout */}
      <main className="relative flex flex-col md:flex-row gap-4 h-full">
        
        {/* List View Sidebar - Only visible in List View */}
        <AnimatePresence>
          {view === 'list' && (
            <motion.div
              // Reduced width from w-[320px] to w-[260px] to give more space to the list
              className={`relative w-full md:w-[260px] flex-shrink-0 ${cardBaseStyle} flex flex-col`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h2 className="text-xl font-bold mb-6 text-gray-800 flex-shrink-0">Manage Cars</h2>
              
              {/* Scrollable Sidebar Content */}
              <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
                <CarsSidebar cars={cars} onAddNewCar={handleOpenAddModal} />
              </div>
              
              {/* Toggle in Sidebar for List View */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                <ViewToggle view={view} setView={handleViewChange} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 h-full min-h-0">
          <div className={`relative h-full flex flex-col ${cardBaseStyle} overflow-hidden`}>
            
            {/* Header Section (Both Views) - Now visible in List View too if desired, or kept specific to Grid */}
            <motion.div 
                className="flex items-center justify-between mb-6 flex-shrink-0"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Only show title here if in Grid view, otherwise it's in the sidebar */}
                <h2 className="text-2xl font-bold text-gray-800">
                    {view === 'grid' ? 'Manage Cars' : ''}
                </h2>
                
                <div className="flex items-center gap-3 w-full max-w-md justify-end">
                    {/* Optional Filter Icon Button */}
                    <button className="p-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
                        </svg>
                    </button>
                    <div className="w-64">
                        <SearchBar
                            placeholder="Find Car"
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar pb-24">
              <AnimatePresence mode="wait">
                  <motion.div
                      key={`${view}-${search}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                  >
                      {view === 'list' ? (
                        <CarListView 
                            cars={cars} 
                            onEditCar={handleOpenEditModal} 
                            carStatuses={carStatuses} 
                        />
                      ) : (
                        <CarGridView 
                            cars={cars} 
                            onAddNewCar={handleOpenAddModal} 
                            onEditCar={handleOpenEditModal} 
                            carStatuses={carStatuses} 
                        />
                      )}
                  </motion.div>
              </AnimatePresence>
            </div>

            {/* Floating Toggle for Grid View */}
            {view === 'grid' && (
                <motion.div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    {/* FIX: Removed backdrop-blur-sm and bg-white/80, replaced with solid bg-white */}
                    <div className="bg-white p-1 rounded-full shadow-lg border border-gray-100">
                        <ViewToggle view={view} setView={handleViewChange} />
                    </div>
                </motion.div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default CarsPageClient;