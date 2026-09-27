import { Car } from "@/types";

interface BookingSummaryProps {
  car: Car | null;
  area: string;
  pickup: string | null;
  dropoff: string | null;
  duration: string;
  rentalPrice: number;
  bookingFee: number;
  carWashFee: number;
}

/** Sticky side card on booking steps 2–3: selected car, schedule and running total. */
export default function BookingSummary({ car, area, pickup, dropoff, duration, rentalPrice, bookingFee, carWashFee }: BookingSummaryProps) {
  const rows: [string, string][] = [
    ["Pick-up", pickup ?? "—"],
    ["Return", dropoff ?? "—"],
    ["Duration", duration || "—"],
  ];

  return (
    <aside className="flex flex-col overflow-hidden rounded-md border border-line bg-surface lg:sticky lg:top-24">
      {car?.image && <img src={car.image} alt={`${car.brand} ${car.model}`} className="h-48 w-full object-cover" />}
      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-1">
          <span className="eyebrow">Your booking</span>
          <span className="font-display text-[1.75rem] leading-tight tracking-[-0.02em]">
            {car ? `${car.brand} ${car.model}` : "No car selected"}
          </span>
          {car && (
            <span className="text-sm text-ink-2">
              {car.transmission} · {car.seats} seats{area && ` · ${area}`}
            </span>
          )}
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 border-y border-line py-4 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-ink-2">{k}</dt>
              <dd className="num text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
          <dt className="text-ink-2">Rental</dt>
          <dd className="num text-right">₱{rentalPrice}</dd>
          <dt className="text-ink-2">Car wash</dt>
          <dd className="num text-right">₱{carWashFee}</dd>
          <dt className="text-ink-2">Booking fee</dt>
          <dd className="num text-right">₱{bookingFee}</dd>
        </dl>
        <div className="flex items-baseline justify-between border-t border-ink pt-4">
          <span className="text-[15px] font-medium">Total</span>
          <span className="num text-[1.375rem] font-medium text-clay">₱{rentalPrice + carWashFee + bookingFee}</span>
        </div>
      </div>
    </aside>
  );
}
