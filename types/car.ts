// types/car.ts

export interface CarPricing {
    Car_ID: number,
    Location: string,
    Price_12_Hours: number,
    Price_24_Hours: number
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
}

export interface CarFilters {
  brand?: string
  transmission?: string
  fuelType?: string
  seats?: number
}