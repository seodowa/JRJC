import { NextResponse } from 'next/server';
import { getSession } from '@/lib';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { v4 as uuidv4 } from 'uuid';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

export async function POST(req: Request) {
  const formData = await req.formData();
  const imageFile = formData.get('file') as File;
  const category = formData.get('category') as string;

  // 1. Authenticate (Hybrid Strategy)
  // If category is 'secure_id', we allow guest uploads (no session required yet).
  // For all other categories, we enforce session presence.
  let session = null;
  if (category !== 'secure_id') {
    session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: No active session' }, { status: 401 });
    }
  }

  // 2. Validate File Presence
  if (!imageFile) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // 3. Conditional Role Verification & Validation
  if (category === 'car' || category === 'misc' || !category) {
    // Only admins can upload car images or use undefined/misc categories
    const adminSession = await verifyAdmin();
    if (!adminSession) {
      return unauthorizedResponse();
    }
  }

  if (category === 'secure_id') {
    // Strict validation for guest uploads
    if (!imageFile.type.startsWith('image/')) {
       return NextResponse.json({ error: 'Only image files are allowed for ID uploads.' }, { status: 400 });
    }
    // Optional: Add size limit check here if needed (e.g. 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 400 });
    }
  }

  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const contentType = imageFile.type;
    const fileName = imageFile.name;

    // 4. Generate unique path based on category
    const fileExt = fileName.split('.').pop() || 'png';
    let uniquePath = '';
    let bucketName = 'images'; // Default public bucket

    if (category === 'profile') {
        // Secure naming for profiles: identifiable by user ID but unique with UUID
        uniquePath = `profiles/${session!.user.id}-${uuidv4()}.${fileExt}`;
    } else if (category === 'car') {
        uniquePath = `cars/${uuidv4()}-${fileName}`;
    } else if (category === 'secure_id') {
        // PRIVATE BUCKET for IDs
        bucketName = 'private_documents'; 
        uniquePath = `bookings/${uuidv4()}-${fileName}`;
    } else {
        // Default / Legacy fallback
        uniquePath = `misc/${uuidv4()}-${fileName}`;
    }

    // 5. Upload to Supabase Storage
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(uniquePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: contentType,
      });

    if (uploadError) {
      return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 });
    }

    // 6. Return Response
    // For 'secure_id', we return the internal PATH (to be stored in DB), not a public URL.
    if (category === 'secure_id') {
        return NextResponse.json({ path: data.path });
    }

    // For others, return Public URL
    const { data: { publicUrl } } = supabaseAdmin.storage.from(bucketName).getPublicUrl(data.path);

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

export async function DELETE(req: Request) {
  // 1. Only admins can delete files via this generic route
  const adminSession = await verifyAdmin();
  if (!adminSession) {
    return unauthorizedResponse();
  }

  try {
    const { url, path, bucket } = await req.json(); // Accepted 'path' and 'bucket' for private files
    
    // Deleting by Public URL (Legacy/Public files)
    if (url) {
        const pathParts = url.split('/images/');
        if (pathParts.length < 2) {
             console.warn('Invalid URL format for deletion:', url);
             return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }
        const storagePath = pathParts[pathParts.length - 1];
        const { error } = await supabaseAdmin.storage.from('images').remove([storagePath]);
        if (error) throw error;
    } 
    // Deleting by Path (Private/New files)
    else if (path) {
        const targetBucket = bucket || 'images'; // Default to images if not specified
        const { error } = await supabaseAdmin.storage.from(targetBucket).remove([path]);
        if (error) throw error;
    } else {
        return NextResponse.json({ error: 'No URL or Path provided' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete processing error:', error);
    return NextResponse.json({ error: `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}
