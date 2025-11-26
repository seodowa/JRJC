import { NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, text } = body;

    const data = await sendSMS(to, text);
    return NextResponse.json({ success: true, gatewayResponse: data });

  } catch (error: any) {
    console.error('SMS Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}