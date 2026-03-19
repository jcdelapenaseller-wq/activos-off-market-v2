export interface MailerLiteSubscriber {
  email: string;
  fields?: {
    name?: string;
    roi_type?: string; // e.g., 'Alto margen', 'Margen bajo', 'Pérdida estimada'
    source?: string;
    roi?: string | number;
    precio?: string | number;
    tipo_subasta?: string;
  };
  groups?: string[]; // Array of group IDs
}

/**
 * Prepara la estructura para la integración con la API de MailerLite.
 * En producción, esto debería llamar a un endpoint del backend (ej. Next.js API route o Express)
 * para no exponer la API key de MailerLite en el frontend.
 */
export const subscribeToMailerLite = async (subscriber: MailerLiteSubscriber): Promise<boolean> => {
  console.log('📧 [MAILERLITE API MOCK] Suscribiendo usuario:', subscriber);
  
  try {
    // TODO: Reemplazar con llamada real al backend
    /*
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriber),
    });
    
    if (!response.ok) throw new Error('Error en la suscripción');
    */
    
    // Simulamos éxito
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  } catch (error) {
    console.error('❌ [MAILERLITE API ERROR]', error);
    return false;
  }
};
