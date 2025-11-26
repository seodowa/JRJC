import { supabaseAdmin } from "@/utils/supabase/admin";
import { Car, CarPricing, CarStatus } from "@/types";

export const fetchDisplayManageCars = async (): Promise<Car[]> => {
    // Uses supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
        .from('Car_Models')
        .select(`
            *,
            Manufacturer (Manufacturer_Name),
            Transmission_Types (Name),
            Fuel_Types (Fuel),
            Car_Status (id, status),
            Car_Pricing (
                *,
                Location (location_name)
            )
        `)
        .eq('is_deleted', false)
        .order('Model_ID', { ascending: true });

    if (error) {
        console.error("Error fetching cars for management:", error);
        return [];
    }

    return data.map((car: any) => {
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
    });
};
