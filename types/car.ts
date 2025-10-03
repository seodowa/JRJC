// types/car.ts

export interface CarPricing {
    location: string,
    price_12_hours: number,
    price_24_hours: number
}

export interface Car {
  id: number
  model: string
  brand: string
  year: number
  price: CarPricing[]
  image: string
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