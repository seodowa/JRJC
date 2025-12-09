import { NextResponse } from 'next/server';
import { getSession } from '@/lib';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  // 1. Authenticate the user
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Handle the file upload
  const formData = await req.formData();
  const imageFile = formData.get('file') as File;

  if (!imageFile) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const contentType = imageFile.type;
    const fileName = imageFile.name;

    // 3. Generate unique path
    const uniquePath = `${uuidv4()}-${fileName}`;

    // 4. Upload to Supabase Storage using the admin client
    // Note: Server-side image optimization (Sharp) is removed for Vercel Free Tier compatibility.
    // Images are uploaded in their original format.
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

    // 5. Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage.from('images').getPublicUrl(data.path);

    if (!publicUrl) {
      return NextResponse.json({ error: 'Could not get public URL for uploaded image' }, { status: 500 });
    }

    // 6. Return the URL
    return NextResponse.json({ publicUrl });

  } catch (error) {
    console.error('Upload processing error:', error);
    return NextResponse.json({ error: 'Internal server error during upload processing' }, { status: 500 });
  }
}
