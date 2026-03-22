import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let event: Stripe.Event;

  // 1. Validar firma de Stripe si existe el secreto
  if (webhookSecret) {
    const sig = req.headers['stripe-signature'];
    try {
      // Nota: En Vercel/Cloud Run a veces hay que manejar el raw body
      // Si req.body ya es un objeto, Stripe.webhooks.constructEvent puede fallar
      // pero aquí asumimos que el entorno nos da lo necesario o usamos el objeto directamente
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`❌ [STRIPE WEBHOOK] Error de firma: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    event = req.body;
  }

  console.log('🔔 [STRIPE WEBHOOK] Evento recibido:', event.type);

  try {
    let email: string | null = null;
    let newStatus: 'free' | 'pro' | null = null;

    // 1. Manejar sesión completada (Alta/Trial)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      // Prioridad: client_reference_id (donde guardamos el email) > customer_details.email
      email = session.client_reference_id || session.customer_details?.email || null;
      newStatus = 'pro';
      console.log(`📍 [STRIPE WEBHOOK] Checkout completado detectado para: ${email}`);
    } 
    
    // 2. Manejar suscripción borrada (Cancelación definitiva)
    else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Intentar obtener el email del cliente
      if (subscription.customer) {
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (!customer.deleted) {
          email = (customer as Stripe.Customer).email;
        }
      }
      
      // Fallback a metadata si lo guardamos ahí
      if (!email) {
        email = subscription.metadata?.email || null;
      }

      newStatus = 'free';
      console.log(`📍 [STRIPE WEBHOOK] Suscripción cancelada detectada para: ${email}`);
    }

    if (email && newStatus) {
      console.log(`📧 [STRIPE WEBHOOK] Sincronizando ${email} en MailerLite -> plan_status: ${newStatus}`);
      
      // Actualizar en MailerLite
      // Usamos el email como ID (MailerLite lo permite en su API v2/connect)
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

      const mlData = await mlResponse.json().catch(() => ({}));

      if (!mlResponse.ok) {
        console.error('❌ [MAILERLITE ERROR] Error al actualizar suscriptor:', mlData);
        throw new Error(`MailerLite update failed: ${JSON.stringify(mlData)}`);
      }

      console.log(`✅ [STRIPE WEBHOOK] Sincronización exitosa: ${email} es ahora ${newStatus}`);
    } else {
      console.log('ℹ️ [STRIPE WEBHOOK] Evento procesado sin cambios de estado (email o status no detectados)');
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ [STRIPE WEBHOOK ERROR] Fallo en el procesamiento:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
