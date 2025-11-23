"use client";

import { Car, CarStatus } from "@/types";
import AdminCarCard from "@/components/admin/cars/AdminCarCard";

interface CarListViewProps {
    cars: Car[];
    onEditCar: (car: Car) => void;
    carStatuses: CarStatus[];
}

const CarListView = ({ cars, onEditCar, carStatuses }: CarListViewProps) => {
    return (
        <div className="flex flex-col gap-4 p-6">
            {cars.map((car) => (
                <AdminCarCard key={car.id} car={car} onEditCar={onEditCar} carStatuses={carStatuses} />
            ))}
        </div>
    );
};

export default CarListView;
