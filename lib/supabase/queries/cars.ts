// utils/supabase/carQueries.ts
import { createClient } from "@/utils/supabase/client";
import { Car } from "@/types";

export const fetchCars = async (): Promise<Car[]> => {
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
        Car_Pricing (
          Location,
          Price_12_Hours,
          Price_24_Hours
        )
      `);

    if (carsError) {
      throw new Error(carsError.message);
    }

    // Transform the data to match the Car type
    const transformedCars: Car[] = carsData?.map(car => ({
      id: car.Model_ID,
      brand: car.Manufacturer?.Manufacturer_Name,
      model: car.Model_Name,
      year: car.Year_Model,
      transmission: car.Transmission_Types?.Name || "Unknown",
      fuelType: car.Fuel_Types?.Fuel || "Unknown",
      image: car.image,
      price: car.Car_Pricing,
      seats: car.Number_Of_Seats,
      available: car.Available || true
    })) || [];

    return transformedCars;
    
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
};