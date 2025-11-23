// lib/supabase/queries/fetchDisplayManageCars.ts
import { createClient } from "@/utils/supabase/client";
import { Car, CarPricing, CarStatus } from "@/types";

export const fetchDisplayManageCars = async (): Promise<Car[]> => {
  const supabase = createClient();
  
  try {
    const { data: carsData, error: carsError } = await supabase
      .from("Car_Models")
      .select(`
        *,
        Transmission_Types (
          Name
        ),
        Manufacturer (
          Manufacturer_Name
        ),
        Fuel_Types (
          Fuel
        ),
        Car_Status!status_id (
            id,
            status
        ),
        Car_Pricing (
          *,
          Location (
            location_name
          )
        )
      `)
      .eq('is_deleted', false);
    
    if (carsError) {
      throw new Error(carsError.message);
    }

    // Transform the data to match the Car type
    const transformedCars: Car[] = carsData?.map(car => {
      const carPricing: CarPricing[] = car.Car_Pricing?.map((price: any) => ({
        Car_ID: price.Car_ID,
        Location: price.Location?.location_name,
        Price_12_Hours: price.Price_12_Hours,
        Price_24_Hours: price.Price_24_Hours
      })) || [];

      return {
        id: car.Model_ID,
        brand: car.Manufacturer?.Manufacturer_Name,
        model: car.Model_Name,
        year: car.Year_Model,
        transmission: car.Transmission_Types?.Name || "Unknown",
        fuelType: car.Fuel_Types?.Fuel || "Unknown",
        image: car.image,
        price: carPricing,
        seats: car.Number_Of_Seats,
        available: car.Available || true,
        color: car.color_code,
        status: car.Car_Status ? { id: car.Car_Status.id, status: car.Car_Status.status } : null
      };
    }) || [];

    return transformedCars;
    
  } catch (error) {
    console.error("Error fetching display cars:", error);
    throw error;
  }
};
