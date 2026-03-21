export interface MailerLiteSubscriber {
  email: string;
  source?: string;
  fields?: {
    name?: string;
    roi_type?: string; // e.g., 'Alto margen', 'Margen bajo', 'Pérdida estimada'
    source?: string;
    roi?: string | number;
    precio?: string | number;
    tipo_subasta?: string;
    plan?: string;
    timestamp?: number;
  };
  groups?: string[]; // Array of group IDs
}

/**
 * Prepara la estructura para la integración con la API de MailerLite.
 * Llama al endpoint del backend para no exponer la API key de MailerLite en el frontend.
 */
export const subscribeToMailerLite = async (subscriber: MailerLiteSubscriber): Promise<boolean> => {
  console.log('📧 [MAILERLITE API] Suscribiendo usuario:', subscriber);
  
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriber),
    });
    
    if (!response.ok) throw new Error('Error en la suscripción');
    
    return true;
  } catch (error) {
    console.error('❌ [MAILERLITE API ERROR]', error);
    return false;
  }
};
