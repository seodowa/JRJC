import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { verifyOwner, forbiddenResponse, unauthorizedResponse } from "@/lib/auth";

export async function POST(req: Request) {
    // 1. Strict Owner Verification
    const session = await verifyOwner();
    if (!session) {
        // Distinguish between not logged in and not owner if possible, 
        // but verifyOwner returns null for both.
        // We can check if getSession returns something to be precise, 
        // but verifyOwner encapsulating it is safer.
        return forbiddenResponse();
    }

    try {
        const payload = await req.json();
        const { section, key, value, image_url } = payload;

        if (!section || !key) {
            return NextResponse.json({ error: 'Section and Key are required' }, { status: 400 });
        }

        // 2. Perform Update using Service Role (Bypassing RLS)
        // We use upsert to handle both creation and updates
        const { data, error } = await supabaseAdmin
            .from('cms_content')
            .upsert({
                section,
                key,
                value,
                image_url,
                updated_at: new Date().toISOString()
            }, { onConflict: 'section, key' })
            .select()
            .single();

        if (error) {
            console.error("CMS Update Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error("CMS API Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
