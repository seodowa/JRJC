"use client";

import { Car } from "@/types";
import AdminCarCard from "@/components/admin/cars/AdminCarCard";

interface CarListViewProps {
    cars: Car[];
    onEditCar: (car: Car) => void;
}

const CarListView = ({ cars, onEditCar }: CarListViewProps) => {
    return (
        <div className="flex flex-col gap-4 p-6">
            {cars.map((car) => (
                <AdminCarCard key={car.id} car={car} onEditCar={onEditCar} />
            ))}
        </div>
    );
};

export default CarListView;
