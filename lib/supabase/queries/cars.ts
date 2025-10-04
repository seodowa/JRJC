// utils/supabase/carQueries.ts
import { createClient } from "@/utils/supabase/client";
import { Car, CarPricing } from "@/types";

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
        )
      `);
    
    if (carsError) {
      throw new Error(carsError.message);
    }

    

    // Transform the data to match the Car type
    const transformedCars: Car[] = await Promise.all(carsData?.map(async (car) => {
      const carPricing: CarPricing[] = await fetchSpecificCarPricing( car.Model_ID );

      return (
        {
          id: car.Model_ID,
          brand: car.Manufacturer?.Manufacturer_Name,
          model: car.Model_Name,
          year: car.Year_Model,
          transmission: car.Transmission_Types?.Name || "Unknown",
          fuelType: car.Fuel_Types?.Fuel || "Unknown",
          image: car.image,
          price: carPricing,
          seats: car.Number_Of_Seats,
          available: car.Available || true
        }
      )
    })) || [];

    return transformedCars;
    
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
};

export const fetchSpecificCarPricing = async ( car_id: number ): Promise<CarPricing[]> => {
  const supabase = createClient();

  try {
    const { data: priceData, error: priceError } = await supabase
        .from("Car_Pricing")
        .select(`
          *, 
          Location (
            location_name
          )`)
        .eq("Car_ID", car_id);

    if (priceError) {
        throw new Error(priceError.message);
      }

    const transformedCarPrices: CarPricing[] = priceData.map( price => (
      {
        Car_ID: price.Car_ID,
        Location: price.Location?.location_name,
        Price_12_Hours: price.Price_12_Hours,
        Price_24_Hours: price.Price_24_Hours
      }
    )) || [];

    return transformedCarPrices;

  } catch (error) {
    console.error("Error fetching car prices: ", error);
    throw error;
  }
}