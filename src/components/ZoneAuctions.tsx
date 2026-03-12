import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ChevronRight, MapPin, Home, DollarSign, TrendingUp, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../routes';

const CITY_LIST = ['madrid', 'barcelona', 'valencia', 'sevilla'];

const ZoneAuctions: React.FC = () => {
  const { city, zone } = useParams<{ city: string, zone: string }>();

  const { displayCity, displayZone } = useMemo(() => {
    if (!city || !zone) return { displayCity: '', displayZone: '' };

    const foundCity = city.charAt(0).toUpperCase() + city.slice(1);
    const displayZone = zone.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return { displayCity: foundCity, displayZone };
  }, [city, zone]);

  const filteredAuctions = useMemo(() => {
    if (!city || !zone) return [];
    
    console.log("Params recibidos:", { city, zone });
    console.log("AUCTIONS completo:", AUCTIONS);
    
    const normalize = (str: string) => str.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-');
      
    const normalizedCity = normalize(city);
    const normalizedZone = normalize(zone);

    return Object.entries(AUCTIONS).filter(([slug, data]) => {
      const dataCitySlug = normalize(data.city || '');
      const dataZoneSlug = normalize(data.zone || '');
      
      console.log("Subasta evaluada:", slug);
      console.log("Ciudad datos:", data.city);
      console.log("Zona datos:", data.zone);
      console.log("Comparación normalizada:", {
        dataCitySlug,
        normalizedCity,
        dataZoneSlug,
        normalizedZone
      });
      
      return dataCitySlug === normalizedCity && dataZoneSlug === normalizedZone;
    });
  }, [city, zone]);

  // Try to get the actual display name from the first match if available
  const actualZoneName = useMemo(() => {
    if (filteredAuctions.length > 0) {
      return filteredAuctions[0][1].zone;
    }
    return displayZone;
  }, [filteredAuctions, displayZone]);

  const availableZones = useMemo(() => {
    if (!city) return [];
    const normalize = (str: string) => str.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-');
    const normalizedCity = normalize(city);
    
    const cityAuctions = Object.values(AUCTIONS).filter(a => normalize(a.city || '') === normalizedCity);
    const zones = new Set<string>();
    cityAuctions.forEach(a => {
      if (a.zone) zones.add(a.zone);
    });
    return Array.from(zones).sort();
  }, [city]);

  const availablePropertyTypes = useMemo(() => {
    if (!city) return [];
    const normalize = (str: string) => str.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-');
    const normalizedCity = normalize(city);
    
    const normalizePropertyType = (type: string): string => {
      const normalized = type.toLowerCase();
      const map: Record<string, string> = {
        'piso': 'pisos', 'pisos': 'pisos',
        'vivienda': 'pisos', 'viviendas': 'pisos',
        'apartamento': 'pisos', 'apartamentos': 'pisos',
        'local': 'locales', 'locales': 'locales',
        'garaje': 'garajes', 'garajes': 'garajes',
        'nave': 'naves', 'naves': 'naves',
        'chalet': 'chalets', 'chalets': 'chalets'
      };
      return map[normalized] || normalized;
    };

    const cityAuctions = Object.values(AUCTIONS).filter(a => normalize(a.city || '') === normalizedCity);
    const types = new Set<string>();
    cityAuctions.forEach(a => {
      if (a.propertyType) types.add(normalizePropertyType(a.propertyType));
    });
    return Array.from(types).sort();
  }, [city]);

  const normalizeForUrl = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');

  useEffect(() => {
    if (actualZoneName && displayCity) {
      document.title = `Subastas inmobiliarias en ${actualZoneName}, ${displayCity} | Activos Off-Market`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Ejemplos de subastas inmobiliarias en ${actualZoneName}, ${displayCity}. Análisis de oportunidades procedentes del BOE.`);
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
  }, [displayCity, actualZoneName, filteredAuctions.length]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-6xl mx-auto">
        <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium flex-wrap gap-2" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-600 transition-colors">Inicio</Link>
          <ChevronRight size={14} />
          <Link to={`/subastas-${city}`} className="hover:text-brand-600 transition-colors capitalize">Subastas</Link>
          <ChevronRight size={14} />
          <Link to={`/subastas-${city}`} className="hover:text-brand-600 transition-colors capitalize">{displayCity}</Link>
          <ChevronRight size={14} />
          <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md capitalize" aria-current="page">{actualZoneName}</span>
        </nav>

        <div className="mb-8">
          <Link to={ROUTES.EXAMPLES_INDEX} className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
            <ArrowLeft size={20} /> Ver todos los ejemplos
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Subastas inmobiliarias en {actualZoneName}, {displayCity}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mb-12">
            Ejemplos de subastas inmobiliarias en {actualZoneName}, {displayCity}. Análisis de oportunidades procedentes del BOE y otros portales oficiales.
          </p>
          
          <div className="prose prose-slate max-w-3xl">
            <p>
              Invertir en subastas inmobiliarias en {actualZoneName}, {displayCity}, ofrece oportunidades únicas para adquirir inmuebles en zonas de alta demanda. Este mercado permite encontrar activos con un potencial de revalorización significativo, siempre que se aborde con una estrategia profesional. El éxito en estas operaciones depende directamente de tu capacidad para analizar minuciosamente las cargas registrales, verificar la situación de ocupación y calcular con precisión la puja máxima que garantiza la rentabilidad. En un mercado tan competitivo como {actualZoneName}, la rapidez y la precisión en el análisis son tus mejores aliados. No permitas que la emoción de la subasta nuble tu juicio; basa cada decisión en datos sólidos y una evaluación de riesgos realista para asegurar que tu inversión en {actualZoneName} sea un éxito a largo plazo.
            </p>
          </div>
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
              Actualmente no hay ejemplos analizados en {actualZoneName}, {displayCity}.
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

        <div className="mt-16 prose prose-slate max-w-3xl">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">
            Qué deben tener en cuenta los inversores en subastas de {actualZoneName} ({displayCity})
          </h2>
          <p className="mb-8">
            El mercado de subastas en {actualZoneName} requiere un enfoque especializado. Dada la alta demanda en esta zona de {displayCity}, es crucial entender no solo el valor de mercado actual, sino también las particularidades de la zona que pueden afectar a la liquidez del activo. Antes de realizar cualquier puja, asegúrate de haber calculado todos los costes ocultos y de tener una estrategia clara para la toma de posesión del inmueble.
          </p>
          <Link 
            to="/calculadora-subastas" 
            className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-700 transition-all"
          >
            Calcular puja máxima <ChevronRight size={20} />
          </Link>
        </div>

        {/* Internal Linking Blocks */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-200 pt-12">
          {availableZones.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Subastas en otras zonas de {displayCity}</h2>
              <ul className="space-y-3">
                {availableZones.map(z => (
                  <li key={z}>
                    <Link 
                      to={`/subastas/${normalizeForUrl(displayCity)}/${normalizeForUrl(z)}`}
                      className="text-brand-600 hover:text-brand-800 hover:underline font-medium flex items-center gap-2"
                    >
                      <ChevronRight size={16} /> Subastas en {z}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {availablePropertyTypes.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Otros tipos de subastas en {displayCity}</h2>
              <ul className="space-y-3">
                {availablePropertyTypes.map(pt => (
                  <li key={pt}>
                    <Link 
                      to={`/subastas/${normalizeForUrl(displayCity)}/${normalizeForUrl(pt)}`}
                      className="text-brand-600 hover:text-brand-800 hover:underline font-medium flex items-center gap-2 capitalize"
                    >
                      <ChevronRight size={16} /> Subastas de {pt} en {displayCity}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZoneAuctions;
