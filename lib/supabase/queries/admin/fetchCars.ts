import { supabaseAdmin } from "@/utils/supabase/admin";
import { Car, CarPricing, CarStatus } from "@/types";

// DUPLICATE of fetchCars but using supabaseAdmin for Admin Context
export const fetchCars = async (query?: string): Promise<Car[]> => {
  try {
    const { data: carsData, error: carsError } = await supabaseAdmin
      .rpc('search_cars', { search_term: query || '' })
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
        Car_Status (
            id,
            status
        ),
        Car_Pricing (
          *,
          Location (
            location_name
          )
        )
      `);
    
    if (carsError) {
      throw new Error(carsError.message);
    }

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
    console.error("Error fetching cars:", error);
    throw error;
  }
};

export const fetchCarStatuses = async (): Promise<CarStatus[]> => {
    try {
        const { data, error } = await supabaseAdmin
            .from("Car_Status")
            .select("id, status");
        if (error) throw new Error(error.message);
        return data.map(d => ({ id: d.id, status: d.status })) as CarStatus[];
    } catch (error) {
        console.error("Error fetching car statuses:", error);
        return [];
    }
};
