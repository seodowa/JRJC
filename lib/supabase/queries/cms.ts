import { createClient } from "@/utils/supabase/server";
import { CMSContent } from "@/types/cms";

export { type CMSContent };

export async function fetchCMSContent(section?: string): Promise<CMSContent[]> {
    const supabase = await createClient();
    
    let query = supabase
        .from('cms_content')
        .select('section, key, value, image_url');
        
    if (section) {
        query = query.eq('section', section);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching CMS content:", error);
        return [];
    }

    return data || [];
}

export async function fetchCMSContentMap(section?: string): Promise<Record<string, CMSContent>> {
    const content = await fetchCMSContent(section);
    const map: Record<string, CMSContent> = {};
    content.forEach(item => {
        map[item.key] = item;
    });
    return map;
}
