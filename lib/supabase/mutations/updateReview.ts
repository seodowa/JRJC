'use server'

import { createClient } from "@/utils/supabase/client";
import { revalidatePath } from "next/cache";

const supabase = createClient();

export const updateHelpfulCount = async (reviewID: number, newCount: number) => {
    const { error } = await supabase
    .from("Reviews")
    .update( {helpful_count: newCount})
    .eq("id", reviewID);

    if (error) {
        console.error("Error updating: ", error)
    } 

    revalidatePath('/')
}