import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ChevronRight, MapPin, Home, DollarSign, TrendingUp, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../routes';

const CITY_LIST = ['madrid', 'barcelona', 'valencia', 'sevilla'];

const ZoneAuctions: React.FC = () => {
  const { cityZone } = useParams<{ cityZone: string }>();

  const { city, zone, zoneSlug } = useMemo(() => {
    if (!cityZone) return { city: '', zone: '', zoneSlug: '' };

    let foundCity = '';
    let foundZoneSlug = '';

    for (const c of CITY_LIST) {
      if (cityZone.startsWith(c + '-')) {
        foundCity = c.charAt(0).toUpperCase() + c.slice(1);
        foundZoneSlug = cityZone.replace(c + '-', '');
        break;
      }
    }

    // Convert slug back to display name (simple version)
    // In a real app, we might have a map, but here we can try to match against AUCTIONS data
    const displayZone = foundZoneSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return { city: foundCity, zone: displayZone, zoneSlug: foundZoneSlug };
  }, [cityZone]);

  const filteredAuctions = useMemo(() => {
    return Object.entries(AUCTIONS).filter(([_, data]) => {
      if (!city || !zoneSlug) return false;
      
      const cityMatch = data.city?.toLowerCase() === city.toLowerCase();
      // Match zone by slugifying the data.zone (removing accents)
      const dataZoneSlug = data.zone?.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-');
      return cityMatch && dataZoneSlug === zoneSlug;
    });
  }, [city, zoneSlug]);

  // Try to get the actual display name from the first match if available
  const actualZoneName = useMemo(() => {
    if (filteredAuctions.length > 0) {
      return filteredAuctions[0][1].zone;
    }
    return zone;
  }, [filteredAuctions, zone]);

  useEffect(() => {
    if (actualZoneName && city) {
      document.title = `Subastas inmobiliarias en ${actualZoneName}, ${city} | Activos Off-Market`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Ejemplos de subastas inmobiliarias en ${actualZoneName}, ${city}. Análisis de oportunidades procedentes del BOE.`);
      }

      // SEO: Noindex if no auctions found
      let metaRobots = document.querySelector('meta[name="robots"]');
      if (filteredAuctions.length === 0) {
        if (!metaRobots) {
          metaRobots = document.createElement('meta');
          metaRobots.setAttribute('name', 'robots');
          document.head.appendChild(metaRobots);
        }
        metaRobots.setAttribute('content', 'noindex');
      } else if (metaRobots) {
        metaRobots.setAttribute('content', 'index, follow');
      }
    }
    window.scrollTo(0, 0);

    return () => {
      const metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots && filteredAuctions.length === 0) {
        metaRobots.setAttribute('content', 'index, follow');
      }
    };
  }, [city, actualZoneName, filteredAuctions.length]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to={ROUTES.EXAMPLES_INDEX} className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
            <ArrowLeft size={20} /> Ver todos los ejemplos
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Subastas inmobiliarias en {actualZoneName}, {city}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl">
            Ejemplos de subastas inmobiliarias en {actualZoneName}, {city}. Análisis de oportunidades procedentes del BOE y otros portales oficiales.
          </p>
        </div>

        {filteredAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAuctions.map(([slug, data]) => (
              <div key={slug} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all group">
                <div className="p-6">
                  <div className="flex items-center gap-2 text-brand-600 font-bold text-sm uppercase tracking-wider mb-3">
                    <TrendingUp size={16} /> Análisis de oportunidad
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {data.propertyType} en subasta en {data.city}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <MapPin size={16} className="text-brand-500" />
                      <span>{data.city}{data.zone ? ` / ${data.zone}` : ''}</span>
                    </div>
                    {data.appraisalValue && (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <DollarSign size={16} className="text-brand-500" />
                        <span>Valor tasación: <span className="font-bold text-slate-900">{data.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span></span>
                      </div>
                    )}
                  </div>

                  <Link 
                    to={`/ejemplo-subasta/${slug}`}
                    className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-600 transition-all group-hover:translate-y-[-2px]"
                  >
                    Ver análisis completo <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <Home size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No hay subastas disponibles</h2>
            <p className="text-slate-600 mb-8">
              Actualmente no hay ejemplos analizados en {actualZoneName}, {city}.
              Estamos añadiendo nuevos análisis semanalmente.
            </p>
            <Link 
              to={ROUTES.EXAMPLES_INDEX}
              className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-700 transition-all"
            >
              Ver todos los ejemplos <ChevronRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneAuctions;
