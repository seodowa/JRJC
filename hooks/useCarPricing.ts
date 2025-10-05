import { useState, useEffect } from 'react';
import { fetchSpecificCarPricing } from '@/lib/supabase/queries/cars';
import { CarPricing } from '@/types';

export const useCarPricing = (carModelId?: number | null) => {
  const [pricingData, setPricingData] = useState<CarPricing[]>([]);
  const [loading, setLoading] = useState(false); // Start as false
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricing = async () => {
      // Don't fetch if no car is selected
      if (!carModelId) {
        setPricingData([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Pass carModelId to the service!
        const data = await fetchSpecificCarPricing(carModelId);
        setPricingData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load pricing data');
        console.error('Error fetching pricing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [carModelId]); // Add carModelId as dependency!

  const calculatePrice = (area: string, duration: string): number => {
    if (!area || !duration || pricingData.length === 0) return 0;
    
    const areaPricing = pricingData.find(item => item.Location === area);
    if (!areaPricing) return 0;
    
    if (duration === "12 hours") {
      return areaPricing.Price_12_Hours || 0;
    } else if (duration === "24 hours") {
      return areaPricing.Price_24_Hours;
    }
    
    return 0;
  };

  return { 
    pricingData, 
    loading, 
    error, 
    calculatePrice 
  };
};