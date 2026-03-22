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

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        fields: fields || {},
        groups: finalGroups
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('MailerLite API error:', errorData);
      return res.status(response.status).json({ error: 'Failed to subscribe' });
    }

    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
