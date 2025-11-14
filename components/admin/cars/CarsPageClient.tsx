"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { Car } from "@/types";
import CarsSidebar from "@/components/admin/cars/CarsSidebar";
import ViewToggle from "@/components/admin/cars/ViewToggle";
import CarGridView from "@/components/admin/cars/CarGridView";
import CarListView from "@/components/admin/cars/CarListView";
import SearchIcon from "@/components/icons/SearchIcon";
import { useState, useEffect } from "react";
import AddEditCarModal from "@/components/admin/cars/AddEditCarModal";
import { fetchManufacturers, fetchTransmissionTypes, fetchFuelTypes, fetchLocations } from '@/lib/supabase/queries/fetchDropdownData';

interface CarsPageClientProps {
  cars: Car[];
  view: 'list' | 'grid';
  search: string;
}

const CarsPageClient: React.FC<CarsPageClientProps> = ({ cars, view, search }) => {
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
      params.set('q', '');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 800);

  const handleViewChange = (newView: 'list' | 'grid') => {
    const params = new URLSearchParams(searchParams);
    params.set('view', newView);
    router.replace(`${pathname}?${params.toString()}`);
    router.refresh();
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

  const cardBaseStyle = "bg-white p-6 rounded-[30px] shadow-md";

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
      <main className="relative flex flex-col md:flex-row gap-4 h-full">
        {/* List View Sidebar */}
        <AnimatePresence>
          {view === 'list' && (
            <motion.div
              className={`relative w-full md:w-[300px] flex-shrink-0 ${cardBaseStyle}`}
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, mass: 1 }}
            >
              <h2 className="text-xl font-bold mb-4">Manage Cars</h2>
              <CarsSidebar cars={cars} onAddNewCar={handleOpenAddModal} />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <ViewToggle view={view} setView={handleViewChange} />
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
                    className="sticky top-0 bg-white py-2 px-6 z-40 flex items-center justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <h2 className="text-2xl font-bold">Manage Cars</h2>
                    <div className="relative w-1/3">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <SearchIcon className="h-5 w-5 text-gray-400" />
                      </span>
                      <input
                          type="text"
                          placeholder="Search by model or brand..."
                          defaultValue={search}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                  </div>
                </motion.div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                  <motion.div
                      key={`${view}-${search}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ ease: "easeInOut", duration: 0.3 }}
                  >
                      {view === 'list' ? (
                        <CarListView cars={cars} onEditCar={handleOpenEditModal} />
                      ) : (
                        <CarGridView cars={cars} onAddNewCar={handleOpenAddModal} onEditCar={handleOpenEditModal} />
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
                    <ViewToggle view={view} setView={handleViewChange} />
                </motion.div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default CarsPageClient;
