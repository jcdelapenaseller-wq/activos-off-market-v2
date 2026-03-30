export type TrackingOrigin = 'discover' | 'discover-auction' | 'listing' | 'ficha' | 'home' | 'footer' | 'lead_magnet' | 'calculator' | 'alert_creation' | 'pro_page_view';
export type TrackingClickType = 'listado' | 'premium' | 'consultoria' | 'download' | 'calculator' | 'pro_checkout' | 'pro_checkout_24h' | 'pro_checkout_monthly' | 'pro_checkout_lifetime' | 'pro_unlock' | 'email_submit' | 'calculator_from_card_click' | 'arrival' | 'share_open' | 'share_whatsapp' | 'share_copy' | 'share_x' | 'share_linkedin' | 'share_email';

export const trackConversion = (
  province: string, 
  origin: TrackingOrigin, 
  clickType: TrackingClickType,
  metadata?: { 
    roi?: number | string; 
    precio?: number | string; 
    tipo_subasta?: string; 
    plan?: string;
    step?: string;
    email?: string;
    [key: string]: any;
  }
) => {
  const event = {
    timestamp: new Date().toISOString(),
    province: province.toLowerCase(),
    origin,
    clickType,
    ...metadata
  };

  // 1. Console log estructurado
  console.log('📊 [TRACKING CONVERSION]', event);

  // 2. LocalStorage simple para análisis manual posterior
  try {
    const existing = localStorage.getItem('aom_tracking_events');
    const events = existing ? JSON.parse(existing) : [];
    events.push(event);
    localStorage.setItem('aom_tracking_events', JSON.stringify(events));
  } catch (e) {
    console.error('Error saving tracking event', e);
  }
};
