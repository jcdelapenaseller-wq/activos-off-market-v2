import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ChevronRight, MapPin, Home, DollarSign, TrendingUp, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../routes';

import { CITY_MAP, PROPERTY_TYPE_MAP } from '../constants';

const CityPropertyAuctions: React.FC = () => {
  const { city: cityParam, propertyType: propertyTypeParam } = useParams<{ city: string; propertyType: string }>();

  const city = useMemo(() => {
    if (!cityParam) return '';
    return CITY_MAP[cityParam.toLowerCase()] || cityParam.charAt(0).toUpperCase() + cityParam.slice(1);
  }, [cityParam]);
  const propertyType = useMemo(() => propertyTypeParam ? PROPERTY_TYPE_MAP[propertyTypeParam.toLowerCase()] || propertyTypeParam.charAt(0).toUpperCase() + propertyTypeParam.slice(1) : '', [propertyTypeParam]);

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

  const filteredAuctions = useMemo(() => {
    return Object.entries(AUCTIONS).filter(([_, data]) => {
      const cityMatch = data.city && data.city.toLowerCase() === city.toLowerCase();
      const typeMatch = data.propertyType && normalizePropertyType(data.propertyType) === normalizePropertyType(propertyType);
      return cityMatch && typeMatch;
    });
  }, [city, propertyType]);

  const availableZones = useMemo(() => {
    if (!city) return [];
    const cityAuctions = Object.values(AUCTIONS).filter(a => a.city && a.city.toLowerCase() === city.toLowerCase());
    const zones = new Set<string>();
    cityAuctions.forEach(a => {
      if (a.zone) zones.add(a.zone);
    });
    return Array.from(zones).sort();
  }, [city]);

  const availablePropertyTypes = useMemo(() => {
    if (!city) return [];
    const cityAuctions = Object.values(AUCTIONS).filter(a => a.city && a.city.toLowerCase() === city.toLowerCase());
    const types = new Set<string>();
    cityAuctions.forEach(a => {
      if (a.propertyType) types.add(normalizePropertyType(a.propertyType));
    });
    return Array.from(types).sort();
  }, [city]);

  const normalizeForUrl = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');

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
        <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium flex-wrap gap-2" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-600 transition-colors">Inicio</Link>
          <ChevronRight size={14} />
          <Link to={`/subastas-${city}`} className="hover:text-brand-600 transition-colors capitalize">Subastas</Link>
          <ChevronRight size={14} />
          <Link to={`/subastas-${city}`} className="hover:text-brand-600 transition-colors capitalize">{city}</Link>
          <ChevronRight size={14} />
          <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md capitalize" aria-current="page">{propertyType}</span>
        </nav>

        <div className="mb-8">
          <Link to={ROUTES.EXAMPLES_INDEX} className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
            <ArrowLeft size={20} /> Ver todos los ejemplos
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Subastas de {propertyType} en {city}
          </h1>

          {filteredAuctions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                <p className="text-sm text-slate-500 font-bold uppercase mb-1">Subastas detectadas</p>
                <p className="text-2xl font-bold text-brand-600">{metrics.count}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                <p className="text-sm text-slate-500 font-bold uppercase mb-1">Tasación media</p>
                <p className="text-2xl font-bold text-slate-900">
                  {metrics.avgAppraisal > 0 ? metrics.avgAppraisal.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : 'N/D'}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                <p className="text-sm text-slate-500 font-bold uppercase mb-1">Deuda media</p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics.avgDebt > 0 ? metrics.avgDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : 'N/D'}
                </p>
              </div>
            </div>
          )}

          <p className="text-xl text-slate-600 max-w-3xl mb-12">
            Listado de subastas de {propertyType.toLowerCase()} en {city}. Ejemplos reales y análisis de oportunidades en subastas inmobiliarias.
          </p>
          
          <div className="prose prose-slate max-w-3xl mx-auto space-y-6">
            <p>
              Las subastas inmobiliarias en {city} representan una de las oportunidades de inversión más dinámicas y rentables en el mercado actual. Acceder a {propertyType.toLowerCase()} a través de subastas judiciales permite adquirir activos por debajo de su valor de mercado, pero requiere un análisis riguroso para asegurar la rentabilidad.
            </p>

            <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100 my-8">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 mt-0">
                Qué hace interesante este tipo de inmueble para invertir
              </h2>
              <ul className="space-y-2 mb-0">
                <li>Alta demanda de {propertyType.toLowerCase()} en el mercado actual de {city}.</li>
                <li>Posibilidad de adquirir activos con un descuento significativo sobre el valor de mercado.</li>
                <li>Excelente potencial para estrategias de alquiler o reforma y venta (flipping).</li>
              </ul>
            </div>

            <p>
              No se trata simplemente de buscar chollos, sino de gestionar riesgos de forma profesional. Antes de participar, es fundamental realizar una auditoría completa que incluya la revisión detallada de las cargas registrales, la situación posesoria y de ocupación del inmueble, y la determinación precisa de la puja máxima.
            </p>
            <p>
              Solo mediante un análisis técnico exhaustivo de estos factores podrás transformar una subasta en una inversión inmobiliaria sólida y segura en {city}.
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
                    {data.claimedDebt && (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <DollarSign size={16} className="text-red-500" />
                        <span>Deuda: <span className="font-bold text-red-600">{data.claimedDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span></span>
                      </div>
                    )}
                    {data.appraisalValue && data.claimedDebt && (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <TrendingUp size={16} className={((data.appraisalValue - data.claimedDebt) / data.appraisalValue * 100) > 40 ? 'text-green-500' : 'text-slate-400'} />
                        <span className="text-slate-500">Descuento potencial: <span className={`font-bold ${((data.appraisalValue - data.claimedDebt) / data.appraisalValue * 100) > 40 ? 'text-green-600' : 'text-slate-900'}`}>-{Math.round((data.appraisalValue - data.claimedDebt) / data.appraisalValue * 100)} %</span></span>
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

        <div className="mt-16 prose prose-slate max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mt-12 mb-6">
            Qué debes analizar antes de pujar por un {propertyType.toLowerCase()} en subasta en {city}
          </h2>
          <p>
            La clave del éxito en las subastas de {propertyType.toLowerCase()} en {city} radica en la preparación. No te centres únicamente en el precio de salida; analiza la rentabilidad neta tras considerar todos los costes asociados: impuestos, gastos de gestión, posibles reformas y, sobre todo, la resolución de la situación posesoria.
          </p>
          <p>
            Una mala estimación de estos factores puede convertir una oportunidad aparentemente atractiva en una inversión deficitaria.
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

        {/* Internal Linking Blocks */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-200 pt-12">
          {availableZones.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Subastas en otras zonas de {city}</h2>
              <ul className="space-y-3">
                {availableZones.map(z => (
                  <li key={z}>
                    <Link 
                      to={`/subastas/${normalizeForUrl(city)}/${normalizeForUrl(z)}`}
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
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Otros tipos de subastas en {city}</h2>
              <ul className="space-y-3">
                {availablePropertyTypes.map(pt => (
                  <li key={pt}>
                    <Link 
                      to={`/subastas/${normalizeForUrl(city)}/${normalizeForUrl(pt)}`}
                      className="text-brand-600 hover:text-brand-800 hover:underline font-medium flex items-center gap-2 capitalize"
                    >
                      <ChevronRight size={16} /> Subastas de {pt} en {city}
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

export default CityPropertyAuctions;
