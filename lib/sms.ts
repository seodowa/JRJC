
export const sendSMS = async (to: string, text: string) => {
  const PHONE_IP = '100.86.223.78';
  const PHONE_PORT = '8000';
  const APP_USER = 'admin';
  const APP_PASS = '12345678';

  if (!to || !text) {
    throw new Error('Missing info');
  }

  const authString = Buffer.from(`${APP_USER}:${APP_PASS}`).toString('base64');
  const gatewayUrl = `http://${PHONE_IP}:${PHONE_PORT}/message`;

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
};
