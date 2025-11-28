// utils/supabase/carQueries.ts
import { createClient } from "@/utils/supabase/client";
import { Car, CarPricing, CarStatus } from "@/types";

export const fetchCars = async (query?: string): Promise<Car[]> => {
  const supabase = createClient();
  
  try {
    const { data: carsData, error: carsError } = await supabase
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

    // Transform the data to match the Car type, now with pricing included
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
        status: car.Car_Status ? { id: car.Car_Status.id, status: car.Car_Status.status } : undefined
      };
    }) || [];

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

export const fetchSpecificCar = async (car_id: number): Promise<Car> => {
  const supabase = createClient();
  
  try {
    const { data: carData, error: carsError } = await supabase
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
      `).eq("Model_ID", car_id)
      .eq('is_deleted', false);
    
    if (carsError) {
      throw new Error(carsError.message);
    }

    const transformedCar: Car[] = carData.map( car => (
      {
          id: car.Model_ID,
          brand: car.Manufacturer?.Manufacturer_Name,
          model: car.Model_Name,
          year: car.Year_Model,
          transmission: car.Transmission_Types?.Name || "Unknown",
          fuelType: car.Fuel_Types?.Fuel || "Unknown",
          seats: car.Number_Of_Seats,
          available: car.Available || true,
          color: car.color_code,
          price: undefined,
          status: undefined
      }
    ))

    return transformedCar[0];

  } catch (error) {
    console.error("Error fetching car prices: ", error);
    throw error;
  }
}

export const fetchCarStatuses = async (): Promise<CarStatus[]> => {
    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from("Car_Status")
            .select("id, status");
        if (error) throw new Error(error.message);
        return data.map(d => ({ id: d.id, status: d.status })) as CarStatus[];
    } catch (error) {
        console.error("Error fetching car statuses:", error);
        return [];
    }
};
