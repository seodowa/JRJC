import { NextResponse } from 'next/server';
import { getSession } from '@/lib';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { v4 as uuidv4 } from 'uuid';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

export async function POST(req: Request) {
  // 1. Authenticate the user (any logged-in user for 'profile' uploads)
  const session = await getSession();
  if (!session?.user?.id) { // Ensure user.id is available
    return NextResponse.json({ error: 'Unauthorized: No active session' }, { status: 401 });
  }

  // 2. Handle the file upload
  const formData = await req.formData();
  const imageFile = formData.get('file') as File;
  const category = formData.get('category') as string;

  // 3. Conditional role verification for specific categories
  if (category === 'car' || category === 'misc' || !category) {
    // Only admins can upload car images or use undefined/misc categories
    const adminSession = await verifyAdmin();
    if (!adminSession) {
      return unauthorizedResponse();
    }
  }
  // 'profile' category will proceed with just the initial getSession() check

  if (!imageFile) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const contentType = imageFile.type;
    const fileName = imageFile.name;

    // 4. Generate unique path based on category
    const fileExt = fileName.split('.').pop() || 'png';
    let uniquePath = '';

    if (category === 'profile') {
        // Secure naming for profiles: identifiable by user ID but unique with UUID
        // Folder: profiles/
        uniquePath = `profiles/${session.user.id}-${uuidv4()}.${fileExt}`;
    } else if (category === 'car') {
        // Folder: cars/
        uniquePath = `cars/${uuidv4()}-${fileName}`;
    } else {
        // Default / Legacy fallback (now requires admin access)
        uniquePath = `misc/${uuidv4()}-${fileName}`;
    }

    // 5. Upload to Supabase Storage using the admin client
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('images')
      .upload(uniquePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: contentType,
      });

    if (uploadError) {
      return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 });
    }

    // 6. Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage.from('images').getPublicUrl(data.path);

    if (!publicUrl) {
      return NextResponse.json({ error: 'Could not get public URL for uploaded image' }, { status: 500 });
    }

    // 7. Return the URL
    return NextResponse.json({ publicUrl });

  } catch (error) {
    console.error('Upload processing error:', error);
    return NextResponse.json({ error: 'Internal server error during upload processing' }, { status: 500 });
  }
}
