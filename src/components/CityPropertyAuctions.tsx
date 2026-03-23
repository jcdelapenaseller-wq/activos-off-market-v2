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
import RadarPremiumCTA from './RadarPremiumCTA';
import { AuctionData } from '../data/auctions';
import { isAuctionFinished, sortAuctions, isAuctionActive, calculateDiscount } from '../utils/auctionHelpers';
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
      if (!isAuctionActive(data)) return false;
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
    if (count === 0) return { count: 0, avgAppraisal: 0, avgDebt: 0, avgDiscount: 0, dominantType: 'N/D' };

    let totalAppraisal = 0;
    let totalDebt = 0;
    let appraisalCount = 0;
    let debtCount = 0;
    let totalDiscount = 0;
    let discountCount = 0;
    const typeCounts: Record<string, number> = {};

    sortedAuctions.forEach(([_, data]: [string, any]) => {
      if (data.appraisalValue) {
        totalAppraisal += data.appraisalValue;
        appraisalCount++;
      }
      if (data.claimedDebt) {
        totalDebt += data.claimedDebt;
        debtCount++;
      }
      const discount = calculateDiscount(data.valorTasacion, data.valorSubasta, data.claimedDebt);
      if (discount !== null) {
        totalDiscount += discount;
        discountCount++;
      }
      const type = data.propertyType || 'Otros';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Vivienda';

    return {
      count,
      avgAppraisal: appraisalCount > 0 ? totalAppraisal / appraisalCount : 0,
      avgDebt: debtCount > 0 ? totalDebt / debtCount : 0,
      avgDiscount: discountCount > 0 ? totalDiscount / discountCount : 0,
      dominantType
    };
  }, [sortedAuctions]);

  const schema = useMemo(() => {
    if (sortedAuctions.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": sortedAuctions.map(([slug, data], index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://activosoffmarket.es/subasta/${slug}`,
        "name": `${data.propertyType} en ${data.city || data.province}`
      }))
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
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
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

          {/* Summary Block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold">Subastas activas</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.count}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold">Descuento medio</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.avgDiscount.toFixed(0)}%</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold">Activo dominante</p>
              <p className="text-2xl font-bold text-slate-900 capitalize">{metrics.dominantType}</p>
            </div>
          </div>

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

          <p className="text-xl text-slate-600 max-w-3xl mb-12">
            Listado de subastas de {propertyType.toLowerCase()} en la provincia de {province}. Ejemplos reales y análisis de oportunidades en subastas inmobiliarias.
          </p>

          {sortedAuctions.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-12 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                <div className="bg-brand-100 p-2 rounded-lg text-brand-700"><TrendingUp size={20} /></div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Subastas</p>
                  <p className="text-lg font-bold text-slate-900">{metrics.count}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-700"><DollarSign size={20} /></div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Tasación media</p>
                  <p className="text-lg font-bold text-slate-900">
                    {metrics.avgAppraisal > 0 ? metrics.avgAppraisal.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : 'N/D'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-700"><DollarSign size={20} /></div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Deuda media</p>
                  <p className="text-lg font-bold text-slate-900">
                    {metrics.avgDebt > 0 ? metrics.avgDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : 'N/D'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Double CTA */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Link to="/calculadora-subastas" className="bg-brand-600 text-white font-bold py-3 px-6 rounded-full hover:bg-brand-700 transition shadow-md">
              Analizar una subasta ahora
            </Link>
            <a href="https://calendly.com/activosoffmarket" target="_blank" rel="noopener noreferrer" className="bg-white text-slate-900 font-bold py-3 px-6 rounded-full border border-slate-200 hover:bg-slate-50 transition shadow-sm">
              Hablar con un experto
            </a>
          </div>
          
          <div className="prose prose-slate prose-lg max-w-3xl mx-auto space-y-8">
            <p>
              Actualmente en la provincia de {province} monitorizamos <strong>{metrics.count} subastas activas</strong>.
              Con una tasación media de {metrics.avgAppraisal > 0 ? metrics.avgAppraisal.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : 'N/D'},
              este mercado ofrece oportunidades únicas para inversores que buscan {propertyType.toLowerCase()}.
            </p>
            <p>
              Acceder a estos activos a través de subastas judiciales permite adquirir propiedades por debajo de su valor de mercado,
              pero requiere un análisis riguroso. Antes de pujar, te recomendamos usar nuestra
              <Link to={ROUTES.CALCULATOR} className="text-brand-600 font-bold hover:underline">calculadora de rentabilidad</Link>
              para asegurar tu inversión.
            </p>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm my-10">
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 mt-0">
                Por qué invertir en {propertyType.toLowerCase()}
              </h2>
              <ul className="space-y-4 mb-0 list-none pl-0">
                <li className="flex items-start gap-3">
                  <span className="text-brand-600 font-bold">01.</span>
                  <span>Alta demanda de {propertyType.toLowerCase()} en el mercado actual de {province}.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-600 font-bold">02.</span>
                  <span>Adquisición de activos con un descuento significativo sobre el valor de mercado.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-600 font-bold">03.</span>
                  <span>Excelente potencial para estrategias de alquiler o reforma y venta (flipping).</span>
                </li>
              </ul>
            </div>

            {/* Telegram CTA */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-12 text-center">
              <p className="text-blue-900 font-bold mb-4">Publicamos oportunidades antes de que aparezcan aquí →</p>
              <a href="https://t.me/activosoffmarket" target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700 transition">
                Unirse al canal de Telegram
              </a>
            </div>

            <p>
              No se trata simplemente de buscar chollos, sino de gestionar riesgos de forma profesional.
              Si quieres profundizar en el análisis, puedes consultar nuestras
              <Link to={ROUTES.ANALYSIS} className="text-brand-600 font-bold hover:underline">guías de análisis técnico</Link>.
            </p>
            <p>
              Antes de participar, es fundamental realizar una auditoría completa que incluya la revisión detallada de las cargas registrales,
              la situación posesoria y de ocupación del inmueble, y la determinación precisa de la puja máxima.
            </p>
            <p>
              Solo mediante un análisis técnico exhaustivo de estos factores podrás transformar una subasta en una inversión inmobiliaria sólida y segura en {province}.
            </p>
          </div>
        </div>

        {sortedAuctions.length > 0 ? (
          <div className="space-y-12">
            <RadarPremiumCTA 
              location={province} 
              variant="bar"
              origin="listing"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(() => {
                let newBadgeCount = 0;
                return sortedAuctions.slice(0, 3).map(([slug, data]: [string, any]) => {
                  const showNewBadge = data.isNew && newBadgeCount < 6;
                  if (showNewBadge) newBadgeCount++;
                  return <AuctionCard key={slug} slug={slug} data={data} showNewBadge={showNewBadge} />;
                });
              })()}
            </div>

            <RadarPremiumCTA 
              location={province} 
              origin="listing"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(() => {
                let newBadgeCount = 0; 
                return sortedAuctions.slice(3).map(([slug, data]: [string, any]) => {
                  const showNewBadge = data.isNew && newBadgeCount < 6;
                  if (showNewBadge) newBadgeCount++;
                  return <AuctionCard key={slug} slug={slug} data={data} showNewBadge={showNewBadge} />;
                });
              })()}
            </div>
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

        <div className="mt-20 prose prose-slate prose-lg max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">
            Análisis previo: Claves antes de pujar
          </h2>
          <p>
            La clave del éxito en las subastas de {propertyType.toLowerCase()} en {province} radica en la preparación.
            No te centres únicamente en el precio de salida.
          </p>
          <p>
            Analiza la rentabilidad neta tras considerar todos los costes asociados: impuestos, gastos de gestión,
            posibles reformas y, sobre todo, la resolución de la situación posesoria.
          </p>
          <p>
            Una mala estimación de estos factores puede convertir una oportunidad aparentemente atractiva en una inversión deficitaria.
          </p>
          <div className="mt-10 p-8 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">¿Necesitas calcular tu puja máxima?</h3>
              <p className="text-slate-400 text-sm">Usa nuestra calculadora técnica para evitar errores de valoración.</p>
            </div>
            <Link 
              to="/calculadora-subastas" 
              className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-700 transition-all no-underline shrink-0"
            >
              Calcular puja <ChevronRight size={20} />
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
