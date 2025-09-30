import { Car } from "@/types";

export default function CarCard( car:Car ) {
    return (
        <div className="flex flex-col items-center bg-white w-xs h-full">
            <img src={car.image} className="w-auto p-8"/>
        </div>
    );
}