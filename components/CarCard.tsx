import { Car } from "@/types";

export default function CarCard( car:Car ) {
    const LOCATION_1 = 0;
    const LOCATION_2 = 1;
    const LOCATION_3 = 2;
    const P_TEXT_SIZE = "text-sm";

    return (
        <div className="flex flex-col items-center bg-white w-xs shadow-md rounded-3xl p-4">
            <img src={car.image} className="rounded-2xl"/>
            <div className="flex flex-col justify-center items-center pt-2">
                <h1 className="text-lg font-semibold">{`${car.brand} ${car.model} ${car.year}`}</h1>
                <p className={P_TEXT_SIZE}>{`Transmission: ${car.transmission}`}</p>
                <p className={P_TEXT_SIZE}>{`Fuel Type: ${car.fuelType}`}</p>

                <h2 className="pt-2">{`${car.price[LOCATION_1].location}`}</h2>
                <p className={P_TEXT_SIZE}>{`₱${car.price[LOCATION_1].price_12_hours}/12hrs`}</p>
                <p className={P_TEXT_SIZE}>{`₱${car.price[LOCATION_1].price_24_hours}/24hrs`}</p>

                <h2 className="pt-2">{`${car.price[LOCATION_2].location}`}</h2>
                <p className={P_TEXT_SIZE}>{`₱${car.price[LOCATION_2].price_12_hours}/12hrs`}</p>
                <p className={P_TEXT_SIZE}>{`₱${car.price[LOCATION_2].price_24_hours}/24hrs`}</p>

                <h2 className="pt-2">{`${car.price[LOCATION_3].location}`}</h2>
                <p className={P_TEXT_SIZE}>{`₱${car.price[LOCATION_3].price_24_hours}/24hrs`}</p>

                <h2 className="pt-2">{`+₱300 Carwash Fee`}</h2>
            </div>
        </div>
    );
}