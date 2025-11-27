// types/car.ts

export interface CarPricing {
    Car_ID: number,
    Location: string,
    Price_12_Hours: number,
    Price_24_Hours: number
}

export interface CarStatus {
    id: number;
    status: string;
}

export interface Car {
  id: number
  model: string
  brand: string
  year: number
  price?: CarPricing[] 
  image?: string
  transmission: 'Manual' | 'Automatic' 
  seats: number
  fuelType: 'Gasoline' | 'Hybrid' | 'Diesel'
  available: boolean
  color?: string
  status?: CarStatus
}

export interface CarFilters {
  brand?: string
  transmission?: string
  fuelType?: string
  seats?: number
}

export interface DashboardCarData {
    Model_ID: number;
    Model_Name: string;
    Year_Model: number;
    color_code: string;
    status_id: number;
    Transmission_Type: string;
    Manufacturer_Name: string;
    bookingDetails: {
        Customer_Full_Name: string;
        Duration: number;
        Location: string;
    } | null;
}