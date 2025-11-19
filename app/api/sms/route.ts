import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 1. Configuration (Replace these with your real values)
  const PHONE_IP = '100.86.223.78';      // Your Phone's Tailscale IP
  const PHONE_PORT = '8000';         // The port shown in the App
  const APP_USER = 'admin';          // Username from App
  const APP_PASS = '12345678';      // Password from App

  try {
    // 2. Get data from your frontend
    const body = await request.json();
    const { to, text } = body;

    if (!to || !text) {
      return NextResponse.json({ error: 'Missing info' }, { status: 400 });
    }

    // 3. Prepare the "Basic Auth" header
    const authString = Buffer.from(`${APP_USER}:${APP_PASS}`).toString('base64');

    // 4. Construct the URL (Capcom6 App uses /message)
    const gatewayUrl = `http://${PHONE_IP}:${PHONE_PORT}/message`;

    // 5. Send the Request to your Phone
    // Note: The payload structure below is specific to the Capcom6 App
    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify({
        textMessage: {
          text: text
        },
        phoneNumbers: [to], // Must be an array
        simNumber: 1        // Use SIM 1
      }),
    });

    // 6. Handle the Result
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Phone rejected request: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, gatewayResponse: data });

  } catch (error: any) {
    console.error('SMS Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}