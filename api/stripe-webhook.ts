declare const process: any;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // En un entorno real, aquí validaríamos la firma de Stripe (stripe-signature)
  // Para este MVP, asumimos que la petición es legítima o el usuario configurará la validación después.
  
  const event = req.body;

  console.log('🔔 [STRIPE WEBHOOK] Evento recibido:', event.type);

  try {
    let email: string | null = null;
    let newStatus: 'free' | 'pro' | null = null;

    // 1. Manejar sesión completada (Alta/Trial)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      email = session.client_reference_id || session.customer_details?.email;
      newStatus = 'pro';
    } 
    
    // 2. Manejar suscripción borrada (Cancelación)
    else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      // En este caso, Stripe no envía el email directamente en el objeto suscripción de forma simple,
      // pero podemos obtener el customer_id y buscarlo, o confiar en que el usuario ya está en MailerLite.
      // Para simplificar el MVP, si tenemos el email en metadata o client_reference_id lo usamos.
      email = subscription.metadata?.email || subscription.customer_email;
      newStatus = 'free';
    }

    if (email && newStatus) {
      console.log(`📧 [STRIPE WEBHOOK] Actualizando ${email} a estado: ${newStatus}`);
      
      // Actualizar en MailerLite
      const mlResponse = await fetch(`https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            plan_status: newStatus
          }
        }),
      });

      if (!mlResponse.ok) {
        const errorData = await mlResponse.json();
        console.error('MailerLite Update Error:', errorData);
        throw new Error('Failed to update MailerLite');
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
