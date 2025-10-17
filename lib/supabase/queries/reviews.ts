import { createClient } from "@/utils/supabase/client";
import { Car, Review } from "@/types";
import { fetchSpecificCar } from "./cars";


export const fetchReviews = async (): Promise<Review[]> => {
    const supabase = createClient();

    try {
        const { data: reviewsData, error:reviewsError } = await supabase
        .from("Reviews")
        .select("*");

        if (reviewsError) {
            throw new Error(reviewsError.message);
        }

        const transformedReviews: Review[] = await Promise.all(reviewsData?.map(async (review) => {
            const carReviewed: Car = await fetchSpecificCar(review.car_id);

            return ({
                id: review.id,
                userName: review.user_name,
                rating: review.rating,
                title: review.title,
                comment: review.comment,
                car: carReviewed || null,
                helpful: review.helpful_count,
                createdAt: review.created_at
            })
        })) || [];
        
        return transformedReviews;      

    } catch (error) {
        console.log("Error fetching reviews: ", error);
        throw error;
    }
}