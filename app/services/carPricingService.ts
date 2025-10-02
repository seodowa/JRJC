import { createClient } from '@/utils/supabase/client';

const supabase = createClient(); // Remove 'await' - createClient is synchronous

export interface CarPricing {
  Location: string;
  Price_12_Hours: number | null;
  Price_24_Hours: number;
  car_model_id?: number; // Add this field if it exists in your table
}

export const carPricingService = {
  async getCarPricing(carModelId?: number): Promise<CarPricing[]> {
    let query = supabase
      .from('Car_Pricing')
      .select('*')
      .order('Location');

    // Filter by car model if provided
    if (carModelId) {
      query = query.eq('Car_ID', carModelId); // Use your actual column name
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching car pricing:', error);
      throw error;
    }
    
    return data || [];
  },

  async getPricingByAreaAndCar(area: string, carModelId?: number): Promise<CarPricing | null> {
    let query = supabase
      .from('Car_Pricing')
      .select('*')
      .eq('Location', area);

    // Filter by car model if provided
    if (carModelId) {
      query = query.eq('car_model_id', carModelId);
    }

    const { data, error } = await query.single();
    
    if (error) {
      console.error('Error fetching pricing for area and car:', error);
      return null;
    }
    
    return data;
  }
};