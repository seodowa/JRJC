"use client";

import { motion } from "framer-motion";
import { Car } from "@/types";
import AsyncButton from "@/components/AsyncButton";
import PlusIcon from "@/components/icons/PlusIcon";
import CarPlaceholderIcon from "@/components/icons/CarPlaceholderIcon";

interface CarGridViewProps {
  cars: Car[];
}

const containerVariants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const CarGridView = ({ cars }: CarGridViewProps) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4 px-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Add a new car tile */}
      <div>
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg text-center flex flex-col items-center justify-center group" style={{ minHeight: '250px', height: '100%' }}>
            <AsyncButton href="/adminSU/cars/new" className="w-full h-full flex flex-col items-center justify-center rounded-md text-black hover:bg-gray-500/25">
                <PlusIcon className="w-16 h-16 mb-2" />
                <span className="font-bold">Add a new car</span>
            </AsyncButton>
        </div>
      </div>

      {cars.map((car) => (
          <motion.div key={car.id} variants={itemVariants}>
            <div className="relative border rounded-lg p-4 text-center overflow-hidden group flex items-center justify-center" style={{ minHeight: '250px', height: '100%' }}>
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
          </motion.div>
      ))}
    </motion.div>
  );
};

export default CarGridView;
