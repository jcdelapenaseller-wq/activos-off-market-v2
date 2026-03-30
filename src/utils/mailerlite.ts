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
    plan_status?: 'free' | 'pro';
    alerta_provincia?: string;
    alerta_tipo?: string;
    alerta_municipio?: string;
    timestamp?: number;
  };
  groups?: string[]; // Array of group IDs
}

/**
 * Prepara la estructura para la integración con la API de MailerLite.
 * Llama al endpoint del backend para no exponer la API key de MailerLite en el frontend.
 */
export const subscribeToMailerLite = async (subscriber: MailerLiteSubscriber): Promise<{ success: boolean; error?: string }> => {
  console.log('📧 [MAILERLITE API] Suscribiendo usuario:', subscriber);
  
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriber),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [MAILERLITE API ERROR] Status:', response.status, 'Data:', errorData);
      
      // Extraer mensaje de error detallado de MailerLite si existe
      let errorMessage = errorData.error || 'Error en la suscripción';
      if (errorData.details?.message) {
        errorMessage = `${errorMessage}: ${errorData.details.message}`;
      } else if (errorData.details?.errors) {
        // Manejar errores de validación de MailerLite
        const validationErrors = Object.entries(errorData.details.errors)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('; ');
        errorMessage = `${errorMessage} (${validationErrors})`;
      }

      return { success: false, error: errorMessage };
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ [MAILERLITE API ERROR]', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error de red' };
  }
};

/**
 * Envía un email de confirmación de alerta creada.
 */
export const sendAlertConfirmationEmail = async (email: string, city: string): Promise<void> => {
  console.log('📧 [MAILERLITE API] Enviando confirmación de alerta:', email, city);
  
  try {
    // No esperamos el resultado para no bloquear la UI
    fetch('/api/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, city }),
    }).catch(err => console.error('❌ [MAILERLITE API ERROR] Error enviando confirmación:', err));
  } catch (error) {
    console.error('❌ [MAILERLITE API ERROR] Error en sendAlertConfirmationEmail:', error);
  }
};
