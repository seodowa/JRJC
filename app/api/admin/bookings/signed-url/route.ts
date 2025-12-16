import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await verifyAdmin();
  if (!session) return unauthorizedResponse();

  try {
    const { path } = await req.json();
    if (!path) return NextResponse.json({ error: 'Path is required' }, { status: 400 });

    const { data, error } = await supabaseAdmin.storage
      .from('private_documents')
      .createSignedUrl(path, 3600); // 1 hour

    if (error) throw error;

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }
}
