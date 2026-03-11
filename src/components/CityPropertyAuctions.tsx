import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ChevronRight, MapPin, Home, DollarSign, TrendingUp, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../routes';

const CITY_MAP: Record<string, string> = {
  'madrid': 'Madrid',
  'barcelona': 'Barcelona',
  'valencia': 'Valencia',
  'sevilla': 'Sevilla'
};

const PROPERTY_TYPE_MAP: Record<string, string> = {
  'pisos': 'Piso',
  'locales': 'Local',
  'viviendas': 'Vivienda',
  'chalets': 'Chalet',
  'garajes': 'Garaje',
  'naves': 'Nave',
  'apartamentos': 'Apartamento'
};

const CityPropertyAuctions: React.FC = () => {
  const { city: cityParam, propertyType: propertyTypeParam } = useParams<{ city: string; propertyType: string }>();

  const city = useMemo(() => cityParam ? CITY_MAP[cityParam.toLowerCase()] || cityParam.charAt(0).toUpperCase() + cityParam.slice(1) : '', [cityParam]);
  const propertyType = useMemo(() => propertyTypeParam ? PROPERTY_TYPE_MAP[propertyTypeParam.toLowerCase()] || propertyTypeParam.charAt(0).toUpperCase() + propertyTypeParam.slice(1) : '', [propertyTypeParam]);

  const filteredAuctions = useMemo(() => {
    return Object.entries(AUCTIONS).filter(([_, data]) => {
      const cityMatch = data.city?.toLowerCase() === city.toLowerCase();
      const typeMatch = data.propertyType?.toLowerCase() === propertyType.toLowerCase();
      return cityMatch && typeMatch;
    });
  }, [city, propertyType]);

  useEffect(() => {
    if (city && propertyType) {
      document.title = `Subastas de ${propertyType} en ${city} | Activos Off-Market`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Listado de subastas de ${propertyType} en ${city}. Ejemplos reales y análisis de oportunidades en subastas inmobiliarias.`);
      }

      // SEO: Noindex if no auctions found to avoid thin content indexing
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
      // Cleanup robots tag on unmount
      const metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots && filteredAuctions.length === 0) {
        metaRobots.setAttribute('content', 'index, follow');
      }
    };
  }, [city, propertyType, filteredAuctions.length]);

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
            Subastas de {propertyType} en {city}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl">
            Listado de subastas de {propertyType.toLowerCase()} en {city}. Ejemplos reales y análisis de oportunidades en subastas inmobiliarias.
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
              Actualmente no hay ejemplos analizados de {propertyType} en {city}.
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

        <div className="mt-16 bg-brand-900 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-serif font-bold mb-4">¿Buscas oportunidades en {city}?</h2>
          <p className="text-brand-200 mb-8 max-w-2xl mx-auto">
            En nuestro canal de Telegram publicamos regularmente análisis de subastas activas en {city} y otras provincias de España.
          </p>
          <a 
            href="https://t.me/activosOffmarket" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-brand-900 font-bold py-4 px-8 rounded-xl hover:bg-brand-50 transition-all"
          >
            Unirme al canal de Telegram <ChevronRight size={20} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CityPropertyAuctions;
