declare const process: any;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, city } = req.body;

  if (!email || !city) {
    return res.status(400).json({ error: 'Email and city are required' });
  }

  if (!process.env.MAILERLITE_API_KEY) {
    console.error('❌ [MAILERLITE API ERROR] MAILERLITE_API_KEY is not set');
    return res.status(500).json({ error: 'MailerLite API key is missing' });
  }

  const payload = {
    subject: "Alerta activada correctamente",
    from: "alertas@activosoffmarket.es",
    from_name: "Alertas Off-Market",
    to: email,
    content: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0f172a;">Alerta activada correctamente</h2>
        <p>Hola,</p>
        <p>Has activado una alerta en <strong>${city}</strong>.</p>
        <p>Te avisaremos en cuanto aparezcan nuevas oportunidades que coincidan con tus criterios.</p>
        <div style="margin-top: 30px;">
          <a href="https://activosoffmarket.es/subastas/${city.toLowerCase()}" 
             style="display: inline-block; background: #1d4ed8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
             Ver oportunidades
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
          Recibes este email porque acabas de activar una alerta en Activos Off-Market.
        </p>
      </div>
    `
  };

  try {
    const response = await fetch('https://connect.mailerlite.com/api/emails/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [MAILERLITE API ERROR] Status:', response.status, 'Data:', errorData);
      return res.status(response.status).json({ error: 'Failed to send email', details: errorData });
    }

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
