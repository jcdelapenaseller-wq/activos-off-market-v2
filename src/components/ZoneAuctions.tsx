import React, { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { ChevronRight, MapPin, Home, DollarSign, TrendingUp, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { AuctionCard } from './AuctionCard';
import { isAuctionFinished, sortAuctions, isAuctionActive } from '../utils/auctionHelpers';
import { MetricHighlight, MetricNeutral, MetricWarning, MetricTag, getDiscountColor } from '../utils/themeClasses';
import { normalizePropertyType as normalizeTypeLabel, normalizeProvince, normalizeCity, normalizeLocationLabel } from '../utils/auctionNormalizer';
import { trackConversion } from '../utils/tracking';

const ZoneAuctions: React.FC = () => {
  const { province, zone } = useParams<{ province: string, zone: string }>();
  const navigate = useNavigate();

  const { displayProvince, displayZone } = useMemo(() => {
    if (!province || !zone) return { displayProvince: '', displayZone: '' };

    const foundProvince = province.charAt(0).toUpperCase() + province.slice(1);
    const displayZone = zone.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return { displayProvince: foundProvince, displayZone };
  }, [province, zone]);

  const filteredAuctions = useMemo(() => {
    if (!province || !zone) return [];
    
    const normalize = (str: string) => str.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-');
      
    const normalizedProvince = normalize(province);
    const normalizedZone = normalize(zone);

    const filtered = Object.entries(AUCTIONS).filter(([slug, data]) => {
      if (!isAuctionActive(data)) return false;
      const p = normalizeProvince(data.province || data.city);
      const provinceMatch = normalize(p) === normalizedProvince || normalize(p).includes(normalizedProvince) || normalizedProvince.includes(normalize(p));
      const dataZoneSlug = normalize(data.zone || '');
      
      return provinceMatch && dataZoneSlug === normalizedZone;
    });
    
    return sortAuctions(filtered);
  }, [province, zone]);

  const activeCount = useMemo(() => {
    return filteredAuctions.length;
  }, [filteredAuctions]);

  // Redirección si no hay subastas activas
  useEffect(() => {
    if (filteredAuctions.length > 0 && activeCount === 0) {
      // Si hay subastas pero todas finalizadas, permitimos verlas (histórico)
      // Pero si el usuario pidió específicamente redirección si no hay activas:
      // navigate(`/subastas/${city}`, { replace: true });
    }
    
    // Si no hay ninguna subasta (ni activa ni finalizada) en esta zona
    if (filteredAuctions.length === 0 && province) {
      navigate(`/subastas/${province}`, { replace: true });
    }
  }, [activeCount, filteredAuctions.length, province, navigate]);

  // Try to get the actual display name from the first match if available
  const actualZoneName = useMemo(() => {
    if (filteredAuctions.length > 0) {
      return filteredAuctions[0][1].zone;
    }
    return displayZone;
  }, [filteredAuctions, displayZone]);

  const availableZones = useMemo(() => {
    if (!province) return [];
    const normalize = (str: string) => str.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-');
    const normalizedProvince = normalize(province);
    
    const provinceAuctions = Object.values(AUCTIONS).filter(a => {
      const p = normalizeProvince(a.province || a.city);
      return normalize(p) === normalizedProvince || normalize(p).includes(normalizedProvince) || normalizedProvince.includes(normalize(p));
    });
    const zones = new Set<string>();
    provinceAuctions.forEach(a => {
      if (a.zone) zones.add(a.zone);
    });
    return Array.from(zones).sort();
  }, [province]);

  const availablePropertyTypes = useMemo(() => {
    if (!province) return [];
    const normalize = (str: string) => str.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-');
    const normalizedProvince = normalize(province);
    
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

    const provinceAuctions = Object.values(AUCTIONS).filter(a => {
      const p = normalizeProvince(a.province || a.city);
      return normalize(p) === normalizedProvince || normalize(p).includes(normalizedProvince) || normalizedProvince.includes(normalize(p));
    });
    const types = new Set<string>();
    provinceAuctions.forEach(a => {
      if (a.propertyType) types.add(normalizePropertyType(a.propertyType));
    });
    return Array.from(types).sort();
  }, [province]);

  const normalizeForUrl = (str: string) => str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  const availableStreets = useMemo(() => {
    if (!province || !zone) return [];
    const normalizedProvince = normalizeForUrl(province);
    const normalizedZone = normalizeForUrl(zone);
    
    const zoneAuctions = Object.entries(AUCTIONS).filter(([_, a]) => {
      const p = normalizeProvince(a.province || a.city);
      return normalizeForUrl(p) === normalizedProvince && 
             normalizeForUrl(a.zone || '') === normalizedZone;
    });
    
    const streets = new Set<string>();
    zoneAuctions.forEach(([_, a]) => {
      if (a.address) streets.add(a.address);
    });
    return Array.from(streets).sort().slice(0, 6);
  }, [province, zone]);

  const metrics = useMemo(() => {
    const count = filteredAuctions.length;
    if (count === 0) return { count: 0, avgAppraisal: 0, avgDebt: 0 };

    let totalAppraisal = 0;
    let totalDebt = 0;
    let appraisalCount = 0;
    let debtCount = 0;

    filteredAuctions.forEach(([_, data]: [string, any]) => {
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
    if (actualZoneName && displayProvince) {
      document.title = `Subastas inmobiliarias en ${actualZoneName}, ${displayProvince} | Activos Off-Market`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Ejemplos de subastas inmobiliarias en ${actualZoneName}, ${displayProvince}. Análisis de oportunidades procedentes del BOE.`);
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
  }, [displayProvince, actualZoneName, filteredAuctions.length]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-6xl mx-auto">
        <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium flex-wrap gap-2" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-600 transition-colors">Inicio</Link>
          <ChevronRight size={14} />
          <Link to={`/subastas/${province}`} className="hover:text-brand-600 transition-colors capitalize">Subastas en {displayProvince}</Link>
          <ChevronRight size={14} />
          <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md capitalize" aria-current="page">{actualZoneName}</span>
        </nav>

        <div className="mb-8">
          <Link to={`/subastas/${province}`} className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
            <ArrowLeft size={20} /> Ver todas las subastas en {displayProvince}
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Subastas inmobiliarias en {actualZoneName}, {displayProvince}
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
              to={`/inversion/${province}/${zone}`} 
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
            Ejemplos de subastas inmobiliarias en {actualZoneName}, {displayProvince}. Análisis de oportunidades procedentes del BOE y otros portales oficiales.
          </p>
          
          <div className="prose prose-slate max-w-3xl mx-auto space-y-6">
            <p>
              Invertir en subastas inmobiliarias en {actualZoneName}, {displayProvince}, ofrece oportunidades únicas para adquirir inmuebles en zonas de alta demanda. Este mercado permite encontrar activos con un potencial de revalorización significativo, siempre que se aborde con una estrategia profesional.
            </p>
            
            <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100 my-8">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 mt-0">
                Qué hace interesante esta zona para invertir
              </h2>
              <ul className="space-y-2 mb-0">
                <li>Alta demanda de alquiler y compraventa en {actualZoneName}.</li>
                <li>Potencial de revalorización a medio y largo plazo en {displayProvince}.</li>
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
            {(() => {
              let newBadgeCount = 0;
              return filteredAuctions.map(([slug, data]: [string, any]) => {
                const showNewBadge = data.isNew && newBadgeCount < 6;
                if (showNewBadge) newBadgeCount++;
                return <AuctionCard key={slug} slug={slug} data={data} showNewBadge={showNewBadge} />;
              });
            })()}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <Home size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No hay subastas disponibles</h2>
            <p className="text-slate-600 mb-8">
              Actualmente no hay ejemplos analizados en {actualZoneName}, {displayProvince}.
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
            Qué deben tener en cuenta los inversores en subastas de {actualZoneName} ({displayProvince})
          </h2>
          <p>
            El mercado de subastas en {actualZoneName} requiere un enfoque especializado. Dada la alta demanda en esta zona de {displayProvince}, es crucial entender no solo el valor de mercado actual, sino también las particularidades de la zona que pueden afectar a la liquidez del activo.
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
        <div className="mt-16 bg-brand-900 rounded-3xl p-10 text-center text-white mb-16">
          <h2 className="text-3xl font-serif font-bold mb-4">¿Buscas oportunidades en {displayProvince}?</h2>
          <p className="text-brand-200 mb-2 max-w-2xl mx-auto">
            En nuestro canal de Telegram publicamos regularmente análisis de subastas activas en {displayProvince} y otras provincias de España.
          </p>
          <p className="text-brand-300 text-sm mb-8 italic">
            Incluye: análisis, riesgos reales y estrategia de puja. Acceso limitado para mantener calidad.
          </p>
          <div className="flex flex-col items-center gap-4">
            <a 
              href="https://t.me/activosOffmarket" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackConversion(displayProvince, 'listing', 'premium')}
              className="inline-flex items-center gap-2 bg-white text-brand-900 font-bold py-4 px-8 rounded-xl hover:bg-brand-50 transition-all"
            >
              Unirme al canal de Telegram <ChevronRight size={20} />
            </a>
            <p className="text-brand-200 text-xs font-medium">
              🔒 Nuevas oportunidades cada día que no se publican en el canal gratuito
            </p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-200 pt-12">
          {availableZones.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Otras zonas interesantes en {displayProvince}</h2>
              <ul className="flex flex-wrap gap-2">
                {availableZones.map(z => (
                  <li key={z}>
                    <Link 
                      to={`/subastas/${normalizeForUrl(displayProvince)}/${normalizeForUrl(z)}`}
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
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Tipos de activos en {displayProvince}</h2>
              <ul className="flex flex-wrap gap-2">
                {availablePropertyTypes.map(pt => (
                  <li key={pt}>
                    <span className={`${MetricTag} capitalize cursor-default`}>
                      {pt}
                    </span>
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
