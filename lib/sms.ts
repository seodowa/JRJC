export const sendSMS = async (to: string, text: string) => {
  // 1. Load the URL from your .env file
  const BASE_URL = process.env.NEXT_PUBLIC_SMS_API_URL;
  
  // 2. Keep credentials safe (better to move these to .env too, but this works for now)
  const APP_USER = 'admin';
  const APP_PASS = '12345678';

  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_SMS_API_URL is missing in .env file');
  }

  if (!to || !text) {
    throw new Error('Missing info');
  }

  // 3. Encode credentials
  const authString = Buffer.from(`${APP_USER}:${APP_PASS}`).toString('base64');
  
  // 4. Construct the Full URL
  // We remove any trailing slash from the env var just in case, then add /message
  const gatewayUrl = `${BASE_URL.replace(/\/$/, '')}/message`; 

  console.log(`Attempting to send SMS to ${gatewayUrl}`);

  try {
    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify({
        textMessage: { text },
        phoneNumbers: [to],
        simNumber: 1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Phone rejected request: ${response.status} - ${errorText}`);
    }

    return await response.json();

  } catch (error) {
    console.error("SMS Failed:", error);
    throw error; // Re-throw so your UI knows it failed
  }
};