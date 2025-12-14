import { createClient } from "@/utils/supabase/client";
import { CMSContent } from "@/types/cms";

export async function fetchCMSContentClient(section?: string): Promise<CMSContent[]> {
    const supabase = createClient();
    
    let query = supabase
        .from('cms_content')
        .select('section, key, value, image_url');
        
    if (section) {
        query = query.eq('section', section);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching CMS content (client):", error);
        return [];
    }

    return (data as CMSContent[]) || [];
}
