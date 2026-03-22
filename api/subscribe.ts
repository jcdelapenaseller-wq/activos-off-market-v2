declare const process: any;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, source, fields, groups } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Map source to group ID from environment variables
  let groupId = process.env.MAILERLITE_GROUP_DEFAULT;
  if (source === 'checklist') {
    groupId = process.env.MAILERLITE_GROUP_CHECKLIST || groupId;
  } else if (source === 'calculadora') {
    groupId = process.env.MAILERLITE_GROUP_CALCULADORA || groupId;
  } else if (source === 'calculadora_free') {
    groupId = '182569815674717523';
  }

  // Use provided groups from frontend, or fallback to mapped groupId
  const finalGroups = Array.isArray(groups) && groups.length > 0 ? groups : (groupId ? [groupId] : []);

  if (!process.env.MAILERLITE_API_KEY) {
    console.error('❌ [MAILERLITE API ERROR] MAILERLITE_API_KEY is not set');
    return res.status(500).json({ error: 'MailerLite API key is missing' });
  }

  // Construct the payload strictly as requested by MailerLite
  const payload: any = {
    email: email,
    fields: fields || {}
  };

  // Only add groups if they exist and are not empty
  if (finalGroups.length > 0) {
    payload.groups = finalGroups;
  }

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

    console.log('📡 [MAILERLITE RESPONSE]', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read response body');
      console.log('MailerLite status:', response.status);
      console.log('MailerLite body:', errorText);

      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { rawBody: errorText };
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
