import React from 'react';
import { DashboardCar } from '@/types/dashboard';

interface CarsProps {
  cars: DashboardCar[];
}

const Cars: React.FC<CarsProps> = ({ cars }) => {
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Cars</h2>
      <div className="space-y-4">
        {cars.map((car) => {
          const bgColor = car.color_code || '#808080';
          return (
            <div key={car.Model_ID} className={`p-4 rounded-4xl shadow-md text-white min-h-32 flex flex-col justify-between`} style={{ backgroundColor: hexToRgba(bgColor, 0.7) }}>
              <div>
                <p className="font-bold">{`${car.Manufacturer_Name} ${car.Model_Name} ${car.Year_Model} (${car.Transmission_Type})`}</p>
                <p>{car.status === 'Parked' ? 'Available' : 'Unavailable'}</p>
              </div>
              {car.status === 'Traveling' && car.bookingDetails && (
                <div>
                  <p>{`Rented by: ${car.bookingDetails.Customer_Full_Name}`}</p>
                  <p>{`Duration: ${car.bookingDetails.Duration} hours, Location: ${car.bookingDetails.Location}`}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Cars;