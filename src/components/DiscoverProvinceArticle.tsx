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
import { getImageForPropertyType } from '../constants/auctionImages';

interface Props {
  variant?: 'urgency' | 'opportunity' | 'analysis';
}

const DiscoverProvinceArticle: React.FC<Props> = ({ variant = 'opportunity' }) => {
  const { province } = useParams<{ province: string }>();
  
  const normalizedProvinceParam = province?.toLowerCase() || '';
  const provinceName = useMemo(() => {
    if (!province) return '';
    return province.charAt(0).toUpperCase() + province.slice(1).toLowerCase();
  }, [province]);

  const provinceAuctions = useMemo(() => {
    if (!province) return [];
    const filtered = Object.entries(AUCTIONS).filter(([_, a]) => {
      const p = normalizeProvince(a.province || a.city).toLowerCase();
      return p === normalizedProvinceParam || p.includes(normalizedProvinceParam) || normalizedProvinceParam.includes(p);
    });
    return sortActiveFirst(filtered, (item) => item[1].auctionDate);
  }, [province, normalizedProvinceParam]);

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
    if (d > today) return { label: 'En preparación', sentence: 'Análisis previo a la apertura.' };
    return { label: 'Activa', sentence: 'Análisis de la oportunidad actual.' };
  };

  const content = useMemo(() => {
    const total = stats?.totalActive || 0;
    const maxDesc = stats?.maxDiscount || 0;
    const bestDeal = topExamples[0]?.data;
    const bestSlug = topExamples[0]?.slug || 'default';
    const bestType = bestDeal ? normalizePropertyType(bestDeal.propertyType).toLowerCase() : 'inmueble';
    const bestCity = bestDeal ? (bestDeal.city || provinceName) : provinceName;
    const dynamicImage = getImageForPropertyType(bestDeal?.propertyType, bestSlug);
    
    if (variant === 'urgency') {
      const urgTitles = [
        `Última ventana en ${provinceName}: ${total} subastas clave cierran hoy`,
        `Si buscas en ${provinceName}, estas ${total} subastas están a punto de desaparecer`,
        `Cierre inminente en ${provinceName}: ${total} expedientes que no deberías ignorar`
      ];
      const title = urgTitles[provinceName.length % urgTitles.length].substring(0, 90);

      return {
        title,
        meta: `No dejes pasar la oportunidad. Hoy cierran ${total} subastas en ${provinceName}. Analizamos los activos más rentables antes del fin del plazo.`,
        intro: `El reloj corre. Hoy monitorizamos **${total} expedientes activos** en la provincia de **${provinceName}** que están a punto de desaparecer del BOE. Si buscas un **${bestType}** o activos con descuentos reales, esta es tu última ventana de oportunidad antes de que se adjudiquen definitivamente.`,
        body: `Participar en una subasta que termina hoy requiere rapidez, pero sobre todo precisión. Hemos detectado que algunos de estos activos en **${provinceName}** mantienen deudas significativamente bajas frente a su valor de tasación, lo que genera un margen de seguridad inusual para el inversor de última hora.`,
        cta: `Ver cierres de hoy en ${provinceName}`,
        image: dynamicImage
      };
    }
    if (variant === 'analysis') {
      const anaTitles = [
        `La realidad de las subastas en ${provinceName}: ¿oportunidad o riesgo?`,
        `Analizamos las ${total} subastas de ${provinceName}: dónde está el margen real`,
        `Lo que nadie te cuenta de invertir en subastas en ${provinceName} hoy`
      ];
      const title = anaTitles[provinceName.length % anaTitles.length].substring(0, 90);

      return {
        title,
        meta: `Analizamos la rentabilidad en ${provinceName}. Con ${total} activos disponibles y descuentos del ${maxDesc}%, el mercado ofrece opciones estratégicas.`,
        intro: `¿Buscas rentabilidad real en **${provinceName}**? El escenario actual es revelador. Con **${total} activos disponibles** y descuentos detectados que alcanzan el **${maxDesc}%**, la provincia se posiciona como un punto caliente para el flipping y el alquiler patrimonial.`,
        body: `Nuestro análisis técnico confirma una tendencia clara: la aparición de **${bestType}s** en zonas como **${bestCity}** con valoraciones de salida muy por debajo del precio de mercado. Esto no es suerte, es una ventana de mercado que requiere un estudio detallado de cargas antes de dar el paso.`,
        cta: `Analizar mercado de ${provinceName}`,
        image: dynamicImage
      };
    }
    // default: opportunity
    const oppTitles = [
      `Ojo a estas subastas en ${provinceName}: hay descuentos poco habituales`,
      `Este ${bestType} en ${provinceName} podría venderse muy por debajo de su valor`,
      `Lo que está pasando con estas subastas en ${provinceName} no es normal`,
      `Detectada oportunidad en ${provinceName} con un ${maxDesc}% de descuento`
    ];
    const title = oppTitles[provinceName.length % oppTitles.length].substring(0, 90);

    return {
      title,
      meta: `Acabamos de detectar nuevas oportunidades en ${provinceName}. ${total} activos disponibles con descuentos de hasta el ${maxDesc}%.`,
      intro: `Ojo al dato: acabamos de localizar un **${bestType}** en **${bestCity}** con un descuento que roza el **${maxDesc}%**. No es un caso aislado. El mercado de subastas en **${provinceName}** se ha actualizado con **${total} nuevas oportunidades** que están pasando desapercibidas para el gran público.`,
      body: `Invertir en subastas en **${provinceName}** permite acceder a inmuebles a precios que no existen en los portales tradicionales. La clave está en la detección temprana. Hoy, la oferta en la provincia incluye desde viviendas residenciales hasta activos comerciales con un potencial de revalorización inmediato tras la adjudicación.`,
      cta: `Ver oportunidades en ${provinceName}`,
      image: dynamicImage
    };
  }, [variant, provinceName, stats, topExamples]);

  const jsonLd = useMemo(() => {
    if (!provinceName || !content) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": content.title,
      "description": content.meta,
      "image": [content.image],
      "datePublished": new Date().toISOString().split('T')[0],
      "dateModified": new Date().toISOString().split('T')[0],
      "author": [{
        "@type": "Organization",
        "name": "Activos Off-Market",
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
  }, [provinceName, content]);

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

  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

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
                <time dateTime={today.toISOString()}>
                  {today.getHours() < 12 ? 'Edición Mañana' : 'Edición Tarde'} · {formattedDate}
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
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
                <p className="font-bold text-slate-900">Equipo de Análisis Técnico</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Activos Off-Market · Especialistas YMYL</p>
              </div>
            </div>
          </header>

          <div className="prose prose-lg prose-slate max-w-none">
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

            <p className="lead text-xl text-slate-700 font-medium mb-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: content.intro }} />
            
            <p className="text-slate-600 mb-8 leading-relaxed">
              {content.body}
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Publicamos oportunidades en tiempo real en nuestro <a href="https://t.me/activosoffmarket" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline font-medium">canal de Telegram</a>.
            </p>

            {/* CTA Calculadora Integrado */}
            <div className="my-10 p-8 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-8 not-prose shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 text-center md:text-left">
                <p className="text-brand-400 font-bold text-xs uppercase tracking-widest mb-2">Herramienta Gratuita</p>
                <p className="text-xl font-bold mb-1">¿Cuánto deberías pujar?</p>
                <p className="text-slate-400 text-sm">Calcula tu rentabilidad real y evita errores costosos.</p>
              </div>
              <Link 
                to={ROUTES.CALCULATOR}
                onClick={() => trackConversion(provinceName, 'discover', 'calculator')}
                className="relative z-10 bg-white text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 transition-all whitespace-nowrap shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Abrir Calculadora
              </Link>
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-brand-500/20 transition-colors"></div>
            </div>

            {stats && stats.totalActive > 0 ? (
              <>
                <div className="my-10 text-center">
                  <Link 
                    to={`/subastas/${normalizedProvinceParam}`}
                    onClick={() => trackConversion(provinceName, 'discover', 'listado')}
                    className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-bold px-10 py-5 rounded-2xl hover:bg-brand-700 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto text-lg"
                  >
                    🔎 Ver las {stats.totalActive} subastas en {provinceName}
                  </Link>
                </div>

                {topExamples.length > 0 && (
                  <div className="my-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3 border-b border-slate-100 pb-5">
                      <TrendingUp className="text-brand-600" size={28} /> 
                      Selección de activos destacados
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 not-prose mb-10">
                      {topExamples.slice(0, 2).map(({ slug, data }) => {
                        const status = getStatus(data.auctionDate);
                        return (
                          <div key={slug} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.label === 'Activa' ? 'bg-emerald-100 text-emerald-800' : status.label === 'En preparación' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                                {status.label}
                              </span>
                              <p className="text-xs font-medium text-slate-600">{status.sentence}</p>
                            </div>
                            <AuctionCard slug={slug} data={data} showNewBadge={data.isNew} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center not-prose">
                      <p className="text-lg font-bold text-slate-900 mb-4">¿No encuentras lo que buscas?</p>
                      <p className="text-slate-600 mb-6 text-sm">El mercado se actualiza a diario con nuevos expedientes judiciales y de la AEAT.</p>
                      <Link 
                        to={`/subastas/${normalizedProvinceParam}`}
                        onClick={() => trackConversion(provinceName, 'discover', 'listado')}
                        className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 transition-all shadow-sm border border-brand-200"
                      >
                        Explorar listado completo <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 my-10 text-center">
                <p className="text-amber-900 font-medium">
                  Actualmente estamos monitorizando el BOE y los juzgados de {provinceName}, pero no hay subastas activas que cumplan nuestros criterios mínimos de rentabilidad hoy. El mercado es volátil; te recomendamos revisar el listado completo regularmente para no perderte la próxima actualización.
                </p>
              </div>
            )}

            <div className="mt-16 pt-10 border-t border-slate-100">
              <PremiumValueBlock />
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default DiscoverProvinceArticle;
