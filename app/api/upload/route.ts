
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

  // 3. Upload to Supabase Storage using the admin client
  const fileName = `${uuidv4()}-${imageFile.name}`;
  const { data, error: uploadError } = await supabaseAdmin.storage
    .from('images')
    .upload(fileName, imageFile, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 });
  }

  // 4. Get the public URL
  const { data: { publicUrl } } = supabaseAdmin.storage.from('images').getPublicUrl(data.path);

  if (!publicUrl) {
    return NextResponse.json({ error: 'Could not get public URL for uploaded image' }, { status: 500 });
  }

  // 5. Return the URL
  return NextResponse.json({ publicUrl });
}
