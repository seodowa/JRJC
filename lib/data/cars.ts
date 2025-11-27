import { fetchCars } from "../supabase/queries/client/fetchCars";


export const CARS = await fetchCars();