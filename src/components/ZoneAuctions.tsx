import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ChevronRight, MapPin, Home, DollarSign, TrendingUp, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../routes';
import { isAuctionFinished, sortActiveFirst } from '../utils/auctionHelpers';
import { MetricHighlight, MetricNeutral, MetricWarning, MetricTag, getDiscountColor } from '../utils/themeClasses';

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

    const filtered = Object.entries(AUCTIONS).filter(([slug, data]) => {
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
    
    return sortActiveFirst(filtered, (item) => item[1].auctionDate);
  }, [city, zone]);

  const activeCount = useMemo(() => {
    return filteredAuctions.filter(item => !isAuctionFinished(item[1].auctionDate)).length;
  }, [filteredAuctions]);

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

  const normalizeForUrl = (str: string) => str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  const availableStreets = useMemo(() => {
    if (!city || !zone) return [];
    const normalizedCity = normalizeForUrl(city);
    const normalizedZone = normalizeForUrl(zone);
    
    const zoneAuctions = Object.values(AUCTIONS).filter(a => 
      normalizeForUrl(a.city || '') === normalizedCity && 
      normalizeForUrl(a.zone || '') === normalizedZone
    );
    
    const streets = new Set<string>();
    zoneAuctions.forEach(a => {
      if (a.address) streets.add(a.address);
    });
    return Array.from(streets).sort().slice(0, 6);
  }, [city, zone]);

  const metrics = useMemo(() => {
    const count = filteredAuctions.length;
    if (count === 0) return { count: 0, avgAppraisal: 0, avgDebt: 0 };

    let totalAppraisal = 0;
    let totalDebt = 0;
    let appraisalCount = 0;
    let debtCount = 0;

    filteredAuctions.forEach(([_, data]) => {
      if (data.appraisalValue) {
        totalAppraisal += data.appraisalValue;
        appraisalCount++;
      }
      if (data.claimedDebt) {
        totalDebt += data.claimedDebt;
        debtCount++;
      }
    });

    return {
      count,
      avgAppraisal: appraisalCount > 0 ? totalAppraisal / appraisalCount : 0,
      avgDebt: debtCount > 0 ? totalDebt / debtCount : 0
    };
  }, [filteredAuctions]);

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

          {activeCount > 0 && (
            <div className="mb-8 inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 font-bold px-4 py-2 rounded-lg shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
              </span>
              {activeCount} subastas activas ahora mismo
            </div>
          )}

          <div className="mb-8">
            <Link 
              to={`/inversion/${city}/${zone}`} 
              className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-800 transition-colors"
            >
              📊 Análisis del mercado en {actualZoneName} →
            </Link>
          </div>

          {filteredAuctions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className={MetricHighlight.container}>
                <p className={MetricHighlight.label}>Subastas detectadas</p>
                <p className={MetricHighlight.value}>{metrics.count}</p>
              </div>
              <div className={MetricNeutral.container}>
                <p className={MetricNeutral.label}>Tasación media</p>
                <p className={MetricNeutral.value}>
                  {metrics.avgAppraisal > 0 ? metrics.avgAppraisal.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : 'N/D'}
                </p>
              </div>
              <div className={MetricWarning.container}>
                <p className={MetricWarning.label}>Deuda media</p>
                <p className={MetricWarning.value}>
                  {metrics.avgDebt > 0 ? metrics.avgDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : 'N/D'}
                </p>
              </div>
            </div>
          )}

          <p className="text-xl text-slate-600 max-w-3xl mb-12">
            Ejemplos de subastas inmobiliarias en {actualZoneName}, {displayCity}. Análisis de oportunidades procedentes del BOE y otros portales oficiales.
          </p>
          
          <div className="prose prose-slate max-w-3xl mx-auto space-y-6">
            <p>
              Invertir en subastas inmobiliarias en {actualZoneName}, {displayCity}, ofrece oportunidades únicas para adquirir inmuebles en zonas de alta demanda. Este mercado permite encontrar activos con un potencial de revalorización significativo, siempre que se aborde con una estrategia profesional.
            </p>
            
            <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100 my-8">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 mt-0">
                Qué hace interesante esta zona para invertir
              </h2>
              <ul className="space-y-2 mb-0">
                <li>Alta demanda de alquiler y compraventa en {actualZoneName}.</li>
                <li>Potencial de revalorización a medio y largo plazo en {displayCity}.</li>
                <li>Oportunidades de adquirir inmuebles por debajo del valor de mercado.</li>
              </ul>
            </div>

            <p>
              El éxito en estas operaciones depende directamente de tu capacidad para analizar minuciosamente las cargas registrales, verificar la situación de ocupación y calcular con precisión la puja máxima que garantiza la rentabilidad.
            </p>
            <p>
              En un mercado tan competitivo como {actualZoneName}, la rapidez y la precisión en el análisis son tus mejores aliados. No permitas que la emoción de la subasta nuble tu juicio; basa cada decisión en datos sólidos y una evaluación de riesgos realista para asegurar que tu inversión en {actualZoneName} sea un éxito a largo plazo.
            </p>
          </div>
        </div>

        {filteredAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAuctions.map(([slug, data]) => {
              const isFinished = isAuctionFinished(data.auctionDate);
              return (
              <div key={slug} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all group relative">
                {isFinished && (
                  <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20 shadow-sm">
                    Adjudicada
                  </div>
                )}
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
                    {data.claimedDebt && (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <DollarSign size={16} className="text-red-500" />
                        <span>Deuda: <span className="font-bold text-red-600">{data.claimedDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span></span>
                      </div>
                    )}
                    {data.appraisalValue && data.claimedDebt && (() => {
                      const discount = Math.round((1 - data.claimedDebt / data.appraisalValue) * 100);
                      const discountColor = getDiscountColor(discount);
                      return (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp size={16} className={discountColor} />
                          <span className="text-slate-500">Descuento potencial: <span className={discountColor}>-{discount}%</span></span>
                        </div>
                      );
                    })()}
                  </div>

                  <Link 
                    to={`/ejemplo-subasta/${slug}`}
                    className={`inline-flex items-center justify-center gap-2 w-full font-bold py-3 px-6 rounded-xl transition-all group-hover:translate-y-[-2px] ${isFinished ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-slate-900 text-white hover:bg-brand-600'}`}
                  >
                    Ver análisis completo <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
              );
            })}
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

        <div className="mt-16 prose prose-slate max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mt-12 mb-6">
            Qué deben tener en cuenta los inversores en subastas de {actualZoneName} ({displayCity})
          </h2>
          <p>
            El mercado de subastas en {actualZoneName} requiere un enfoque especializado. Dada la alta demanda en esta zona de {displayCity}, es crucial entender no solo el valor de mercado actual, sino también las particularidades de la zona que pueden afectar a la liquidez del activo.
          </p>
          <p>
            Antes de realizar cualquier puja, asegúrate de haber calculado todos los costes ocultos y de tener una estrategia clara para la toma de posesión del inmueble.
          </p>
          <div className="mt-8">
            <Link 
              to="/calculadora-subastas" 
              className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-700 transition-all no-underline"
            >
              Calcular puja máxima <ChevronRight size={20} />
            </Link>
          </div>
        </div>

        {/* Internal Linking Blocks */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-200 pt-12">
          {availableStreets.length > 0 && (
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Subastas detectadas en calles de {actualZoneName}</h2>
              <ul className="flex flex-wrap gap-2">
                {availableStreets.map(streetName => (
                  <li key={streetName}>
                    <Link 
                      to={`/subastas/${normalizeForUrl(displayCity)}/${normalizeForUrl(actualZoneName || '')}/${normalizeForUrl(streetName)}`}
                      className={MetricTag}
                    >
                      {streetName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {availableZones.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Subastas en otras zonas de {displayCity}</h2>
              <ul className="flex flex-wrap gap-2">
                {availableZones.map(z => (
                  <li key={z}>
                    <Link 
                      to={`/subastas/${normalizeForUrl(displayCity)}/${normalizeForUrl(z)}`}
                      className={MetricTag}
                    >
                      {z}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {availablePropertyTypes.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Otros tipos de subastas en {displayCity}</h2>
              <ul className="flex flex-wrap gap-2">
                {availablePropertyTypes.map(pt => (
                  <li key={pt}>
                    <Link 
                      to={`/subastas/${normalizeForUrl(displayCity)}/${normalizeForUrl(pt)}`}
                      className={`${MetricTag} capitalize`}
                    >
                      {pt}
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
