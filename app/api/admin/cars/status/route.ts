// app/api/admin/cars/status/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

export async function PUT(request: Request) {
    // 1. Authenticate using the centralized verifyAdmin function
    const session = await verifyAdmin();
    if (!session) {
        return unauthorizedResponse();
    }

    // 2. Parse request body
    const { carId, statusId } = await request.json();

    if (!carId || !statusId) {
        return NextResponse.json({ error: 'Missing carId or statusId' }, { status: 400 });
    }

    // 3. Use the admin client to update the database
    const { data, error } = await supabaseAdmin
        .from('Car_Models')
        .update({ status_id: statusId })
        .eq('Model_ID', carId)
        .select('status_id')
        .single();

    if (error) {
        console.error('Error updating car status in API route:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Status updated successfully', data });
}