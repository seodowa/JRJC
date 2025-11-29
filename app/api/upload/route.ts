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
    let finalBuffer: Buffer = fileBuffer;
    let contentType = imageFile.type;
    let fileName = imageFile.name;

    // Check if it's an image that needs conversion
    // We preserve SVG and WebP. We convert other images to WebP.
    const isSvg = contentType === 'image/svg+xml';
    const isWebP = contentType === 'image/webp';
    const isImage = contentType.startsWith('image/');

    if (isImage && !isSvg && !isWebP) {
      try {
        // Dynamic import to prevent top-level load failures in serverless
        const { default: sharp } = await import('sharp');
        
        finalBuffer = await sharp(fileBuffer)
          .webp({ quality: 80 }) // Compress to 80% quality
          .toBuffer();
        
        contentType = 'image/webp';
        
        // Update filename extension to .webp
        const lastDotIndex = fileName.lastIndexOf('.');
        const nameWithoutExt = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
        fileName = `${nameWithoutExt}.webp`;
        
      } catch (conversionError) {
        console.error('Image conversion failed:', conversionError);
        // Fallback: If conversion fails, we upload the original file.
        console.warn('Proceeding with original file due to conversion error.');
      }
    }

    // 3. Generate unique path
    const uniquePath = `${uuidv4()}-${fileName}`;

    // 4. Upload to Supabase Storage using the admin client
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('images')
      .upload(uniquePath, finalBuffer, {
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