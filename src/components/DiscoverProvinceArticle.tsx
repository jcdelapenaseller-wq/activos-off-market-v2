import React, { useEffect, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { Calendar, ChevronRight, TrendingUp, MapPin, ArrowRight } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { isAuctionFinished, sortActiveFirst } from '../utils/auctionHelpers';
import { normalizeProvince, normalizePropertyType, normalizeLocationLabel } from '../utils/auctionNormalizer';
import { trackConversion } from '../utils/tracking';
import { AuctionCard } from './AuctionCard';
import PremiumValueBlock from './PremiumValueBlock';
import Header from './Header';
import Footer from './Footer';
import TelegramCTA from './TelegramCTA';
import { getImageForPropertyType } from '../constants/auctionImages';

const DiscoverProvinceArticle: React.FC = () => {
  const { province } = useParams<{ province: string }>();
  
  const normalizedProvinceParam = useMemo(() => {
    if (!province) return '';
    return normalizeProvince(province.replace(/-/g, ' ')).toLowerCase();
  }, [province]);

  const provinceAuctions = useMemo(() => {
    if (!province) return [];
    const filtered = Object.entries(AUCTIONS).filter(([_, a]) => {
      const p = normalizeProvince(a.province || a.city).toLowerCase();
      return p === normalizedProvinceParam || p.includes(normalizedProvinceParam) || normalizedProvinceParam.includes(p);
    });
    return sortActiveFirst(filtered, (item) => item[1].auctionDate);
  }, [province, normalizedProvinceParam]);

  const provinceName = useMemo(() => {
    if (provinceAuctions.length > 0) {
      return normalizeProvince(provinceAuctions[0][1].province || provinceAuctions[0][1].city);
    }
    if (!province) return '';
    return province.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, [provinceAuctions, province]);

  const activeAuctions = useMemo(() => {
    return provinceAuctions.filter(([_, data]) => !isAuctionFinished(data.auctionDate));
  }, [provinceAuctions]);

  const stats = useMemo(() => {
    if (activeAuctions.length === 0) return null;
    
    let maxDiscount = 0;
    
    activeAuctions.forEach(([_, a]) => {
      if (a.appraisalValue && a.claimedDebt !== undefined && a.claimedDebt !== null && a.appraisalValue > a.claimedDebt) {
        const discount = Math.round((1 - a.claimedDebt / a.appraisalValue) * 100);
        if (a.claimedDebt !== 0 && discount <= 85 && discount > maxDiscount) {
          maxDiscount = discount;
        }
      }
    });
    
    return {
      totalActive: activeAuctions.length,
      maxDiscount
    };
  }, [activeAuctions]);

  const topExamples = useMemo(() => {
    return activeAuctions
      .map(([slug, data]) => {
        const valorReferencia = data.valorTasacion || data.valorSubasta || data.appraisalValue;
        const cantidadReclamada = data.claimedDebt;
        const ratio = (valorReferencia && cantidadReclamada !== undefined && cantidadReclamada !== null) 
          ? Math.round(((valorReferencia - cantidadReclamada) / valorReferencia) * 100)
          : 0;
        return { slug, data, ratio };
      })
      .filter(item => item.ratio > 0)
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 3);
  }, [activeAuctions]);

  const getStatus = (date?: string) => {
    if (!date) return { label: 'Desconocido', sentence: 'Estado no disponible.' };
    const d = new Date(date);
    const today = new Date();
    if (isAuctionFinished(date)) return { label: 'Finalizada', sentence: 'Resumen de resultados de la subasta.' };
    if (d > today) return { label: 'Próximamente', sentence: 'Análisis previo a la apertura.' };
    return { label: 'Activa', sentence: 'Análisis de la oportunidad actual.' };
  };

  const content = useMemo(() => {
    const total = stats?.totalActive || 0;
    const maxDesc = stats?.maxDiscount || 0;
    const bestDeal = topExamples[0]?.data;
    const bestSlug = topExamples[0]?.slug || 'default';
    const bestType = bestDeal ? normalizePropertyType(bestDeal.propertyType).toLowerCase() : 'inmueble';
    const bestCity = bestDeal ? (bestDeal.city || provinceName) : provinceName;
    const slugBase = provinceName.toLowerCase().replace(/\s+/g, '-');
    const dynamicImage = getImageForPropertyType('default', `${slugBase}-0-${provinceName}`, 0);

    const oppTitles = [
      `Ojo a estas subastas en ${provinceName}: hay descuentos poco habituales`,
      `Este inmueble en ${provinceName} podría venderse muy por debajo de su valor`,
      `Lo que está pasando con estas subastas en ${provinceName} no es normal`,
      `Detectada oportunidad en ${provinceName} con un ${maxDesc}% de descuento`
    ];
    const title = oppTitles[provinceName.length % oppTitles.length].substring(0, 90);

    const intro = maxDesc > 0 
      ? `Un ${bestType} en ${bestCity} acaba de aparecer con un descuento del ${maxDesc}%... y hay un detalle técnico que cambia todo. No es un caso aislado: esto está pasando ahora mismo en ${provinceName}.`
      : `Se han detectado nuevas subastas relevantes de tipo ${bestType} en ${bestCity}... y hay detalles técnicos que cambian todo. No es un caso aislado: esto está pasando ahora mismo en ${provinceName}.`;

    const meta = maxDesc > 0
      ? `Acabamos de detectar nuevas oportunidades en ${provinceName}. ${total} activos disponibles con descuentos de hasta el ${maxDesc}%.`
      : `Acabamos de detectar nuevas oportunidades en ${provinceName}. ${total} activos disponibles actualmente.`;

    const body = maxDesc > 0
      ? `
        <p class="mb-8 leading-8">El mercado de subastas en <strong>${provinceName}</strong> se ha actualizado con <strong>${total} nuevas oportunidades</strong> que están pasando desapercibidas para el gran público.</p>
        <p class="mb-8 leading-8">Mientras los precios en portales convencionales se mantienen rígidos, el sistema judicial está liberando activos a valoraciones de hace una década.</p>
        
        <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">💎 Oportunidades ocultas</h3>
        <p class="mb-8 leading-8">Esta asimetría de información es la base de las grandes fortunas inmobiliarias y hoy está al alcance del inversor particular formado en ${provinceName}.</p>
        <p class="mb-8 leading-8">Estamos viendo una entrada constante de activos en <strong>${bestCity}</strong> que salen a subasta por deudas que representan una fracción de su valor real.</p>
        
        <div id="telegram-cta-mid"></div>

        <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">📊 Análisis de rentabilidad</h3>
        <p class="mb-8 leading-8">Incluso tras considerar el pago de ITP y gastos de registro, la entrada en estos activos se realiza con un "colchón" de rentabilidad inmenso.</p>
        <p class="mb-8 leading-8">Es el momento de dejar de competir con cientos de compradores y empezar a analizar lo que el BOE esconde en ${provinceName}.</p>
        
        <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">🚀 Conclusión técnica</h3>
        <p class="mb-8 leading-8">Con descuentos que alcanzan el ${maxDesc}%, el potencial de revalorización inmediata tras la adjudicación definitiva es real y tangible.</p>
        <p class="mb-8 leading-8">No estamos ante una inversión pasiva, sino ante una gestión activa que premia a quien tiene la información correcta en el momento preciso.</p>
      `
      : `
        <p class="mb-8 leading-8">El mercado de subastas en <strong>${provinceName}</strong> se ha actualizado con <strong>${total} nuevas oportunidades</strong> que están pasando desapercibidas para el gran público.</p>
        <p class="mb-8 leading-8">Mientras los precios en portales convencionales se mantienen rígidos, el sistema judicial está liberando activos a valoraciones de hace una década.</p>
        
        <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">💎 Oportunidades ocultas</h3>
        <p class="mb-8 leading-8">Esta asimetría de información es la base de las grandes fortunas inmobiliarias y hoy está al alcance del inversor particular formado en ${provinceName}.</p>
        <p class="mb-8 leading-8">Estamos viendo una entrada constante de activos en <strong>${bestCity}</strong> que salen a subasta con características muy interesantes para inversores.</p>
        
        <div id="telegram-cta-mid"></div>

        <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">📊 Análisis de rentabilidad</h3>
        <p class="mb-8 leading-8">Incluso tras considerar el pago de ITP y gastos de registro, la entrada en estos activos puede realizarse con un margen de rentabilidad atractivo.</p>
        <p class="mb-8 leading-8">Es el momento de dejar de competir con cientos de compradores y empezar a analizar lo que el BOE esconde en ${provinceName}.</p>
        
        <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">🚀 Conclusión técnica</h3>
        <p class="mb-8 leading-8">Con estas nuevas entradas, el potencial de inversión tras la adjudicación definitiva es real y tangible.</p>
        <p class="mb-8 leading-8">No estamos ante una inversión pasiva, sino ante una gestión activa que premia a quien tiene la información correcta en el momento preciso.</p>
      `;

    return {
      title,
      meta,
      intro,
      body,
      cta: `Ver oportunidades en ${provinceName}`,
      image: dynamicImage
    };
  }, [provinceName, stats, topExamples]);

  const jsonLd = useMemo(() => {
    if (!provinceName || !content) return null;
    
    const now = new Date();
    let latestDate = topExamples[0]?.data.lastCheckedAt ? new Date(topExamples[0].data.lastCheckedAt) : now;
    if (latestDate > now) latestDate = now;
    
    let publishedDate = topExamples[0]?.data.publishedAt ? new Date(topExamples[0].data.publishedAt) : now;
    if (publishedDate > now) publishedDate = now;
    
    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": content.title,
      "description": content.meta,
      "image": [content.image],
      "datePublished": publishedDate.toISOString().split('T')[0],
      "dateModified": latestDate.toISOString().split('T')[0],
      "author": [{
        "@type": "Organization",
        "name": "Equipo Activos Off-Market",
        "url": "https://activosoffmarket.es"
      }],
      "publisher": {
        "@type": "Organization",
        "name": "Activos Off-Market",
        "logo": {
          "@type": "ImageObject",
          "url": "https://activosoffmarket.es/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    };
  }, [provinceName, content, topExamples]);

  const formattedDate = useMemo(() => {
    const now = new Date();
    let date = topExamples[0]?.data.lastCheckedAt ? new Date(topExamples[0].data.lastCheckedAt) : now;
    if (date > now) date = now;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [topExamples]);
  
  const updateText = useMemo(() => {
    const now = new Date();
    let date = topExamples[0]?.data.lastCheckedAt ? new Date(topExamples[0].data.lastCheckedAt) : now;
    if (date > now) date = now;
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours === 0 
      ? 'Publicado hoy'
      : diffHours < 24 && diffHours > 0
        ? `Actualizado hace ${diffHours} horas`
        : `Última actualización: ${formattedDate}`;
  }, [topExamples, formattedDate]);

  useEffect(() => {
    if (provinceName) {
      document.title = `${content.title} | Activos Off-Market`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', content.meta);
      }
    }
    window.scrollTo(0, 0);
  }, [provinceName, content]);

  if (!province) return <Navigate to={ROUTES.HOME} replace />;

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600 flex flex-col">
      <Header />
      
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
      
      <main className="flex-grow max-w-3xl mx-auto px-6 py-12 w-full">
        <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
          <ChevronRight size={14} className="mx-2" />
          <Link to={ROUTES.NOTICIAS_SUBASTAS_INDEX} className="hover:text-brand-600 transition-colors">Noticias</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md capitalize">{provinceName}</span>
        </nav>

        <article className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
              <div className="flex items-center gap-1.5 text-brand-700 bg-brand-50 px-3 py-1 rounded-full font-bold">
                <Calendar size={14} />
                <time dateTime={topExamples[0]?.data.lastCheckedAt || new Date().toISOString()}>
                  {updateText}
                </time>
              </div>
              {stats && stats.totalActive > 0 && (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {stats.totalActive} activos detectados
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              {content.title}
            </h1>

            {/* Imagen principal grande para Discover */}
            <figure className="mb-10 -mx-6 md:-mx-10 relative group">
              <img 
                src={content.image} 
                alt={`Subastas inmobiliarias en ${provinceName}`}
                className="w-full h-[300px] md:h-[450px] object-cover md:rounded-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40"></div>
              <figcaption className="absolute bottom-6 left-6 md:left-10 text-white">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1 opacity-80">Análisis de Mercado</p>
                <p className="text-lg md:text-xl font-serif italic">Inversión inmobiliaria en {provinceName}</p>
              </figcaption>
            </figure>
            
            <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
              <img 
                src="https://activosoffmarket.es/logo.png" 
                alt="Activos Off-Market" 
                className="w-12 h-12 rounded-full bg-slate-900 object-cover border-2 border-white shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Activos+OffMarket&background=0f172a&color=fff';
                }}
              />
              <div>
                <p className="font-bold text-slate-900">Equipo Activos Off-Market</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Especialistas en subastas judiciales</p>
              </div>
            </div>
          </header>

          <div className="prose prose-lg prose-slate max-w-none">
            <p className="lead text-xl text-slate-700 font-medium mb-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: content.intro }} />
            
            <div id="telegram-cta-mid"></div>

            {content?.body && (
              <>
                <div 
                  className="text-slate-600 mb-12 leading-9"
                  dangerouslySetInnerHTML={{ __html: content.body.split('<div id="telegram-cta-mid"></div>')[0] || '' }}
                />
                <TelegramCTA />
                <div 
                  className="text-slate-600 mb-12 leading-9"
                  dangerouslySetInnerHTML={{ __html: content.body.split('<div id="telegram-cta-mid"></div>')[1] || '' }}
                />
              </>
            )}

            {/* Resumen técnico para E-E-A-T */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-10 border border-slate-200 not-prose grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Oportunidades</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalActive || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Ahorro Máximo</p>
                <p className="text-2xl font-bold text-brand-600">{stats?.maxDiscount || 0}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Activo Top</p>
                <p className="text-sm font-bold text-slate-900 capitalize leading-tight">
                  {topExamples[0] ? normalizePropertyType(topExamples[0].data.propertyType) : 'Inmueble'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Ubicación</p>
                <p className="text-sm font-bold text-slate-900 truncate leading-tight">
                  {topExamples[0]?.data.city || provinceName}
                </p>
              </div>
            </div>

            <div className="my-12 flex flex-col sm:flex-row gap-4 w-full border-t border-slate-200 pt-10">
              <Link 
                to={topExamples[0] ? `/subasta/${topExamples[0].slug}` : `/subastas/${provinceName.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-brand-700 transition-colors shadow-sm text-center"
              >
                Ver análisis técnico <ArrowRight size={18} />
              </Link>
              <Link 
                to={`/subastas/${provinceName.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold px-8 py-4 rounded-xl hover:bg-slate-200 transition-colors text-center"
              >
                Más subastas en {provinceName}
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default DiscoverProvinceArticle;
