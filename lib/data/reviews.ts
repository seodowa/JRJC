import { fetchAllReviews, fetchTopFiveReviews } from "../supabase/queries/client/fetchReviews";

export const TOP_FIVE_REVIEWS = await fetchTopFiveReviews();
export const ALL_REVIEWS = await fetchAllReviews();