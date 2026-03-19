import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { ChevronRight, MapPin, Home, DollarSign, TrendingUp, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { MetricHighlight, MetricNeutral, MetricWarning, MetricTag, getDiscountColor } from '../utils/themeClasses';

import { CITY_MAP, PROPERTY_TYPE_MAP } from '../constants';
import { AuctionCard } from './AuctionCard';
import { AuctionFilters } from './AuctionFilters';
import { AuctionData } from '../data/auctions';
import { isAuctionFinished, sortAuctions } from '../utils/auctionHelpers';
import { normalizePropertyType as normalizeTypeLabel, normalizeProvince, normalizeCity, normalizeLocationLabel } from '../utils/auctionNormalizer';
import { trackConversion } from '../utils/tracking';

const CityPropertyAuctions: React.FC = () => {
  const { province: provinceParam, propertyType: propertyTypeParam } = useParams<{ province: string; propertyType: string }>();

  const province = useMemo(() => {
    if (!provinceParam) return '';
    return CITY_MAP[provinceParam.toLowerCase()] || provinceParam.charAt(0).toUpperCase() + provinceParam.slice(1);
  }, [provinceParam]);
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

  const initialFiltered = useMemo(() => {
    const filtered = Object.entries(AUCTIONS).filter(([_, data]) => {
      const p = normalizeProvince(data.province || data.city);
      const provinceMatch = p.toLowerCase() === province.toLowerCase() || p.toLowerCase().includes(province.toLowerCase()) || province.toLowerCase().includes(p.toLowerCase());
      const typeMatch = data.propertyType && normalizePropertyType(data.propertyType) === normalizePropertyType(propertyType);
      return provinceMatch && typeMatch;
    });
    return Object.fromEntries(filtered);
  }, [province, propertyType]);

  const [userFiltered, setUserFiltered] = useState<Record<string, AuctionData>>(initialFiltered);

  useEffect(() => {
    setUserFiltered(initialFiltered);
  }, [initialFiltered]);

  const sortedAuctions = useMemo(() => sortAuctions(Object.entries(userFiltered)), [userFiltered]);
  const activeCount = Object.keys(userFiltered).length;

  const availableZones = useMemo(() => {
    if (!province) return [];
    const provinceAuctions = Object.values(AUCTIONS).filter(a => {
      const p = normalizeProvince(a.province || a.city);
      return p.toLowerCase() === province.toLowerCase() || p.toLowerCase().includes(province.toLowerCase()) || province.toLowerCase().includes(p.toLowerCase());
    });
    const zones = new Set<string>();
    provinceAuctions.forEach(a => {
      if (a.zone) zones.add(a.zone);
    });
    return Array.from(zones).sort();
  }, [province]);

  const availablePropertyTypes = useMemo(() => {
    if (!province) return [];
    const provinceAuctions = Object.values(AUCTIONS).filter(a => {
      const p = normalizeProvince(a.province || a.city);
      return p.toLowerCase() === province.toLowerCase() || p.toLowerCase().includes(province.toLowerCase()) || province.toLowerCase().includes(p.toLowerCase());
    });
    const types = new Set<string>();
    provinceAuctions.forEach(a => {
      if (a.propertyType) types.add(normalizePropertyType(a.propertyType));
    });
    return Array.from(types).sort();
  }, [province]);

  const normalizeForUrl = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');

  const metrics = useMemo(() => {
    const count = sortedAuctions.length;
    if (count === 0) return { count: 0, avgAppraisal: 0, avgDebt: 0 };

    let totalAppraisal = 0;
    let totalDebt = 0;
    let appraisalCount = 0;
    let debtCount = 0;

    sortedAuctions.forEach(([_, data]: [string, any]) => {
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
  }, [sortedAuctions]);

  useEffect(() => {
    if (province && propertyType) {
      document.title = `Subastas de ${propertyType} en la provincia de ${province} | Activos Off-Market`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Listado de subastas de ${propertyType} en la provincia de ${province}. Ejemplos reales y análisis de oportunidades en subastas inmobiliarias.`);
      }

      // SEO: Noindex if no auctions found to avoid thin content indexing
      let metaRobots = document.querySelector('meta[name="robots"]');
      if (sortedAuctions.length === 0) {
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
      if (metaRobots && sortedAuctions.length === 0) {
        metaRobots.setAttribute('content', 'index, follow');
      }
    };
  }, [province, propertyType, sortedAuctions.length]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-6xl mx-auto">
        <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium flex-wrap gap-2" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-600 transition-colors">Inicio</Link>
          <ChevronRight size={14} />
          <Link to={`/subastas/${provinceParam}`} className="hover:text-brand-600 transition-colors capitalize">Subastas en {province}</Link>
          <ChevronRight size={14} />
          <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md capitalize" aria-current="page">{propertyType}</span>
        </nav>

        <div className="mb-8">
          <Link to={`/subastas/${provinceParam}`} className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
            <ArrowLeft size={20} /> Ver todas las subastas en {province}
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Subastas de {propertyType} en {province}
          </h1>

          <AuctionFilters auctions={initialFiltered} onFilteredChange={setUserFiltered} />

          {activeCount > 0 && (
            <div className="mb-8 inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 font-bold px-4 py-2 rounded-lg shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
              </span>
              {activeCount} subastas activas ahora mismo
            </div>
          )}

          {sortedAuctions.length > 0 && (
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
            Listado de subastas de {propertyType.toLowerCase()} en la provincia de {province}. Ejemplos reales y análisis de oportunidades en subastas inmobiliarias.
          </p>
          
          <div className="prose prose-slate max-w-3xl mx-auto space-y-6">
            <p>
              Las subastas inmobiliarias en la provincia de {province} representan una de las oportunidades de inversión más dinámicas y rentables en el mercado actual. Acceder a {propertyType.toLowerCase()} a través de subastas judiciales permite adquirir activos por debajo de su valor de mercado, pero requiere un análisis riguroso para asegurar la rentabilidad.
            </p>

            <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100 my-8">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 mt-0">
                Qué hace interesante este tipo de inmueble para invertir
              </h2>
              <ul className="space-y-2 mb-0">
                <li>Alta demanda de {propertyType.toLowerCase()} en el mercado actual de {province}.</li>
                <li>Posibilidad de adquirir activos con un descuento significativo sobre el valor de mercado.</li>
                <li>Excelente potencial para estrategias de alquiler o reforma y venta (flipping).</li>
              </ul>
            </div>

            <p>
              No se trata simplemente de buscar chollos, sino de gestionar riesgos de forma profesional. Antes de participar, es fundamental realizar una auditoría completa que incluya la revisión detallada de las cargas registrales, la situación posesoria y de ocupación del inmueble, y la determinación precisa de la puja máxima.
            </p>
            <p>
              Solo mediante un análisis técnico exhaustivo de estos factores podrás transformar una subasta en una inversión inmobiliaria sólida y segura en {province}.
            </p>
          </div>
        </div>

        {sortedAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedAuctions.map(([slug, data]: [string, any]) => (
              <AuctionCard key={slug} slug={slug} data={data} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <Home size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No hay subastas disponibles</h2>
            <p className="text-slate-600 mb-8">
              Actualmente no hay ejemplos analizados de {propertyType} en {province}.
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
            Qué debes analizar antes de pujar por un {propertyType.toLowerCase()} en subasta en {province}
          </h2>
          <p>
            La clave del éxito en las subastas de {propertyType.toLowerCase()} en {province} radica en la preparación. No te centres únicamente en el precio de salida; analiza la rentabilidad neta tras considerar todos los costes asociados: impuestos, gastos de gestión, posibles reformas y, sobre todo, la resolución de la situación posesoria.
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
          <h2 className="text-3xl font-serif font-bold mb-4">¿Buscas oportunidades en {province}?</h2>
          <p className="text-brand-200 mb-2 max-w-2xl mx-auto">
            En nuestro canal de Telegram publicamos regularmente análisis de subastas activas en {province} y otras provincias de España.
          </p>
          <p className="text-brand-300 text-sm mb-8 italic">
            Incluye: análisis, riesgos reales y estrategia de puja. Acceso limitado para mantener calidad.
          </p>
          <div className="flex flex-col items-center gap-4">
            <a 
              href="https://t.me/activosOffmarket" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackConversion(province, 'listing', 'premium')}
              className="inline-flex items-center gap-2 bg-white text-brand-900 font-bold py-4 px-8 rounded-xl hover:bg-brand-50 transition-all"
            >
              Unirme al canal de Telegram <ChevronRight size={20} />
            </a>
            <p className="text-brand-200 text-xs font-medium">
              🔒 Nuevas oportunidades cada día que no se publican en el canal gratuito
            </p>
          </div>
        </div>

        {/* Internal Linking Blocks */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-200 pt-12">
          {availableZones.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Subastas en otras zonas de {province}</h2>
              <ul className="flex flex-wrap gap-2">
                {availableZones.map(z => (
                  <li key={z}>
                    <Link 
                      to={`/subastas/${normalizeForUrl(province)}/${normalizeForUrl(z)}`}
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
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Otros tipos de subastas en {province}</h2>
              <ul className="flex flex-wrap gap-2">
                {availablePropertyTypes.map(pt => (
                  <li key={pt}>
                    <Link 
                      to={`/subastas/${normalizeForUrl(province)}/${normalizeForUrl(pt)}`}
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

export default CityPropertyAuctions;
