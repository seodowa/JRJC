import { Car } from "@/types";

export default function CarCard( { car }: { car:Car } ) {
    const LOCATION_1 = 0;
    const LOCATION_2 = 1;
    const LOCATION_3 = 2;
    const P_TEXT_SIZE = "text-sm";

    // Helper function to get price properties safely
    const getPriceProperty = (priceObj: any, property: string) => {
        return priceObj[property] || priceObj[property.toLowerCase()] || priceObj[property.toUpperCase()] || 0;
    };

    const getLocation = (priceObj: any) => {
        return priceObj.Location || priceObj.location || "Unknown Location";
    };

    return (
        <div className="flex flex-col justify-between items-center bg-white min-w-xs max-w-xs shadow-md rounded-3xl p-4">
            <img src={car.image} className="rounded-2xl min-w-full max-w-full aspect-video"/>
            <div className="flex flex-col justify-center items-center pt-2">
                <h1 className="text-lg font-semibold">{`${car.brand} ${car.model} ${car.year}`}</h1>
                <p className={P_TEXT_SIZE}>{`Transmission: ${car.transmission}`}</p>
                <p className={P_TEXT_SIZE}>{`Fuel Type: ${car.fuelType}`}</p>
                <p className={P_TEXT_SIZE}>{`${car.seats} Seats`}</p>

                <h2 className="pt-2">{getLocation(car.price[LOCATION_1])}</h2>
                <p className={P_TEXT_SIZE}>{`₱${getPriceProperty(car.price[LOCATION_1], 'Price_12_Hours')}/12hrs`}</p>
                <p className={P_TEXT_SIZE}>{`₱${getPriceProperty(car.price[LOCATION_1], 'Price_24_Hours')}/24hrs`}</p>

                <h2 className="pt-2">{getLocation(car.price[LOCATION_2])}</h2>
                <p className={P_TEXT_SIZE}>{`₱${getPriceProperty(car.price[LOCATION_2], 'Price_12_Hours')}/12hrs`}</p>
                <p className={P_TEXT_SIZE}>{`₱${getPriceProperty(car.price[LOCATION_2], 'Price_24_Hours')}/24hrs`}</p>

                <h2 className="pt-2">{getLocation(car.price[LOCATION_3])}</h2>
                <p className={P_TEXT_SIZE}>{`₱${getPriceProperty(car.price[LOCATION_3], 'Price_24_Hours')}/24hrs`}</p>

                <h2 className="pt-2">{`+₱300 Carwash Fee`}</h2>
            </div>
        </div>
    );
}