import { Car } from "@/types";

export default function CarCard({ car }: { car: Car }) {
    // Helper function to get price properties safely
    const getPriceProperty = (priceObj: any, property: string) => {
        if (!priceObj) return 0;
        return priceObj[property] || priceObj[property.toLowerCase()] || priceObj[property.toUpperCase()] || 0;
    };

    const getLocation = (priceObj: any) => {
        if (!priceObj) return "N/A";
        return priceObj.Location || priceObj.location || "Unknown Location";
    };

    const prices = (car.price ?? []).slice(0, 3);

    return (
        <article className="flex flex-col gap-4">
            <img
                src={car.image}
                alt={`${car.brand} ${car.model}`}
                className="aspect-[4/3] w-full rounded-sm bg-gray-200 object-cover"
            />
            <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-[1.75rem] leading-tight tracking-tight">
                    {car.brand} {car.model}
                </h3>
                <span className="num text-sm text-ink-2">{car.year}</span>
            </div>
            <div className="num flex flex-wrap gap-x-5 gap-y-1 border-y border-line py-3 text-xs text-ink-2">
                <span>{car.transmission}</span>
                <span>{car.fuelType}</span>
                <span>{car.seats} seats</span>
            </div>
            <dl className="flex flex-col text-sm">
                {prices.map((price, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-4 py-1.5">
                        <dt className="text-ink-2">{getLocation(price)}</dt>
                        <dd className="num text-right">
                            {i < 2 && (
                                <>
                                    ₱{getPriceProperty(price, 'Price_12_Hours')}<span className="text-ink-3">/12h</span>
                                    <span className="px-2 text-line-strong">·</span>
                                </>
                            )}
                            ₱{getPriceProperty(price, 'Price_24_Hours')}<span className="text-ink-3">/24h</span>
                        </dd>
                    </div>
                ))}
            </dl>
            <div className="flex items-center justify-between border-t border-line pt-3">
                <span className="text-xs text-ink-2">+₱300 car wash fee</span>
                <a href="/book" className="text-[15px] font-medium text-forest hover:text-forest-hover">
                    Book this car <span aria-hidden="true">→</span>
                </a>
            </div>
        </article>
    );
}
