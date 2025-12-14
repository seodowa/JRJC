import { supabaseAdmin } from "@/utils/supabase/admin";
import { Car, Review } from "@/types";
import { verifyAdmin } from "@/lib/auth";
// Note: We can reuse the client-side specific car fetch if it's public,
// OR we should duplicate fetchSpecificCar in admin if needed.
// For reviews, usually just reading is fine, but let's stick to admin for admin pages.
// Ideally, we duplicate fetchSpecificCar here too.

const fetchSpecificCarAdmin = async (car_id: number): Promise<Car | null> => {
    const session = await verifyAdmin();
    if (!session) return null;

    const { data: carData, error: carsError } = await supabaseAdmin
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
    
    if (carsError) throw new Error(carsError.message);

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
}

export const fetchAllReviews = async (): Promise<Review[]> => {
    const session = await verifyAdmin();
    if (!session) return [];
    
    try {
        const { data: reviewsData, error:reviewsError } = await supabaseAdmin
        .from("Reviews")
        .select("*");

        if (reviewsError) {
            throw new Error(reviewsError.message);
        }

        const transformedReviews: Review[] = await Promise.all(reviewsData?.map(async (review) => {
            const carReviewed: Car | null = review.car_id ? await fetchSpecificCarAdmin(review.car_id) : null;

            return ({
                id: review.id,
                userName: review.user_name,
                rating: review.rating,
                title: review.title,
                comment: review.comment,
                car: carReviewed || undefined,
                helpfulCount: review.helpful_count,
                createdAt: review.created_at
            })
        })) || [];
        
        return transformedReviews;      

    } catch (error) {
        console.log("Error fetching reviews: ", error);
        throw error;
    }
}
