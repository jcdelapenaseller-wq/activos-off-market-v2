declare const process: any;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, source, fields, groups } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (!process.env.MAILERLITE_API_KEY) {
    console.error('❌ [MAILERLITE API ERROR] MAILERLITE_API_KEY is not set');
    return res.status(500).json({ error: 'MailerLite API key is missing' });
  }

  // Construct the payload strictly as requested by MailerLite
  // Minimal payload to avoid 422 errors
  const payload = {
    email: email,
    status: "active",
    fields: fields || {}
  };

  console.log("MAILERLITE PAYLOAD:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text().catch(() => 'Could not read response body');
    console.log("MAILERLITE RESPONSE:", response.status, responseText);

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { rawBody: responseText };
      }

      console.error('❌ [MAILERLITE API ERROR] MailerLite responded with:', response.status, errorData);
      return res.status(response.status).json({ 
        error: 'Failed to subscribe', 
        details: errorData 
      });
    }

    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
