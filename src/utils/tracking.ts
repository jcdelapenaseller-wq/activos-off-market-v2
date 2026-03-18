export type TrackingOrigin = 'discover' | 'listing' | 'ficha' | 'home' | 'footer' | 'lead_magnet';
export type TrackingClickType = 'listado' | 'premium' | 'consultoria' | 'download';

export const trackConversion = (province: string, origin: TrackingOrigin, clickType: TrackingClickType) => {
  const event = {
    timestamp: new Date().toISOString(),
    province: province.toLowerCase(),
    origin,
    clickType
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
