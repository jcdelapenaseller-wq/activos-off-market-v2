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
    const dynamicImage = getImageForPropertyType(bestDeal?.propertyType, bestSlug, 0);

    const generateEditorial = (v: string) => {
      if (v === 'urgency') {
        const urgTitles = [
          `Cierre inminente en ${provinceName}: ${total} subastas clave (-${maxDesc}% de ahorro)`,
          `Si buscas en ${provinceName}, estas ${total} subastas (-${maxDesc}%) están a punto de desaparecer`,
          `Última ventana en ${provinceName}: ${total} subastas clave cierran hoy`
        ];
        const title = urgTitles[provinceName.length % urgTitles.length].substring(0, 90);

        return {
          title,
          meta: `No dejes pasar la oportunidad. Hoy cierran ${total} subastas en ${provinceName}. Analizamos los activos más rentables antes del fin del plazo.`,
          intro: `Hay **${total} subastas** en **${provinceName}** que cierran hoy... y la mayoría de los inversores no se han dado cuenta. No es un caso aislado: esto está pasando ahora mismo y es tu última oportunidad para pujar antes de que desaparezcan.`,
          body: `
            <p class="mb-8 leading-8">La parálisis administrativa suele dar paso a cierres masivos de expedientes, y hoy estamos viviendo uno de esos momentos críticos en la provincia. Participar en una subasta que termina hoy requiere rapidez, pero sobre todo precisión técnica.</p>
            
            <div id="telegram-cta-mid"></div>

            <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">📊 El contexto de hoy</h3>
            <p class="mb-8 leading-8">En el mercado de <strong>${provinceName}</strong>, hemos observado una tendencia recurrente: la agrupación de fechas de finalización suele dispersar la atención de los postores habituales.</p>
            <p class="mb-8 leading-8">Esto permite que activos de alta calidad, como el <strong>${bestType}</strong> detectado en <strong>${bestCity}</strong>, puedan quedar con menos competencia de la esperada en los minutos finales.</p>
            
            <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">⚠️ Riesgos y margen</h3>
            <p class="mb-8 leading-8">La demanda de activos adjudicados en ${provinceName} sigue al alza, pero la barrera de entrada técnica (revisión de cargas y depósitos) mantiene los precios en niveles muy atractivos.</p>
            <p class="mb-8 leading-8">Entre los ${total} activos que cierran hoy, algunos mantienen deudas significativamente bajas frente a su valor de tasación, lo que genera un margen de seguridad inusual.</p>
            
            <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">💡 Estrategia recomendada</h3>
            <p class="mb-8 leading-8">Muchos inversores cometen el error de pujar demasiado pronto, revelando sus cartas; la estrategia ganadora hoy es la vigilancia hasta el último segundo.</p>
            <p class="mb-8 leading-8">Este cierre inminente representa el escenario ideal para ejecutar una compra con descuento máximo en una provincia con la dinámica de ${provinceName}.</p>
          `,
          cta: `Ver cierres de hoy en ${provinceName}`,
          image: dynamicImage
        };
      }
      
      if (v === 'analysis') {
        const anaTitles = [
          `Algo está pasando en las subastas de ${provinceName} (${total} oportunidades detectadas)`,
          `Se disparan las subastas en ${provinceName}: varias viviendas (-${maxDesc}%) muy por debajo de mercado`,
          `Análisis de ${total} subastas en ${provinceName}: ¿dónde está el margen real?`
        ];
        const title = anaTitles[provinceName.length % anaTitles.length].substring(0, 90);

        return {
          title,
          meta: `Analizamos la rentabilidad en ${provinceName}. Con ${total} activos disponibles y descuentos del ${maxDesc}%, el mercado ofrece opciones estratégicas.`,
          intro: `El mercado de **${provinceName}** acaba de revelar una oportunidad que la mayoría no está viendo. Con **${total} activos disponibles** y descuentos de hasta el **${maxDesc}%**, estamos ante un escenario que podría cambiar tu estrategia de inversión hoy mismo.`,
          body: `
            <p class="mb-8 leading-8">Invertir en <strong>${provinceName}</strong> requiere hoy una visión periférica y un análisis de datos riguroso que escape a los circuitos comerciales tradicionales.</p>
            <p class="mb-8 leading-8">Ya no basta con buscar en las zonas más evidentes; el flujo de subastas judiciales se está desplazando hacia municipios de segunda corona y zonas en expansión.</p>
            
            <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">📈 Dónde está el valor</h3>
            <p class="mb-8 leading-8">Nuestro análisis técnico de los ${total} activos disponibles muestra una concentración interesante de <strong>${bestType}s</strong> en ubicaciones estratégicas.</p>
            <p class="mb-8 leading-8">En particular, en <strong>${bestCity}</strong>, detectamos una brecha de valor entre la tasación oficial y el precio de mercado que supera con creces el ${maxDesc}%.</p>
            
            <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">🔍 Interpretación inversora</h3>
            <p class="mb-8 leading-8">Muchas valoraciones judiciales no han capturado la revalorización reciente de la zona, dejando un margen de beneficio latente para el adjudicatario.</p>
            <p class="mb-8 leading-8">La clave no es la subasta en sí, sino la gestión posterior y el conocimiento de los tiempos judiciales locales en ${provinceName}.</p>
            
            <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">🛡️ Margen de seguridad</h3>
            <p class="mb-8 leading-8">Adquirir un activo con un descuento técnico importante permite absorber cualquier imprevisto y asegurar una rentabilidad de doble dígito.</p>
            <p class="mb-8 leading-8">Comprar con un margen del ${maxDesc}% en una provincia con la tracción de ${provinceName} es la mejor defensa contra la incertidumbre actual.</p>
          `,
          cta: `Analizar mercado de ${provinceName}`,
          image: dynamicImage
        };
      }

      // default: opportunity
      const oppTitles = [
        `Oportunidad en ${provinceName}: ${total} activos detectados con hasta un ${maxDesc}% de descuento`,
        `Este ${bestType} en ${bestCity} podría venderse muy por debajo de su valor (-${maxDesc}%)`,
        `Lo que está pasando con estas ${total} subastas en ${provinceName} no es normal`,
        `Detectada oportunidad en ${provinceName} (${total} activos): descuentos de hasta ${maxDesc}%`
      ];
      const title = oppTitles[provinceName.length % oppTitles.length].substring(0, 90);

      return {
        title,
        meta: `Acabamos de detectar nuevas oportunidades en ${provinceName}. ${total} activos disponibles con descuentos de hasta el ${maxDesc}%.`,
        intro: `Un **${bestType}** en **${bestCity}** acaba de aparecer con un descuento del **${maxDesc}%**... y hay un detalle técnico que cambia todo. No es un caso aislado: esto está pasando ahora mismo en **${provinceName}**.`,
        body: `
          <p class="mb-8 leading-8">El mercado de subastas en <strong>${provinceName}</strong> se ha actualizado con <strong>${total} nuevas oportunidades</strong> que están pasando desapercibidas para el gran público.</p>
          <p class="mb-8 leading-8">Mientras los precios en portales convencionales se mantienen rígidos, el sistema judicial está liberando activos a valoraciones de hace una década.</p>
          
          <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">💎 Oportunidades ocultas</h3>
          <p class="mb-8 leading-8">Esta asimetría de información es la base de las grandes fortunas inmobiliarias y hoy está al alcance del inversor particular formado en ${provinceName}.</p>
          <p class="mb-8 leading-8">Estamos viendo una entrada constante de activos en <strong>${bestCity}</strong> que salen a subasta por deudas que representan una fracción de su valor real.</p>
          
          <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">📊 Análisis de rentabilidad</h3>
          <p class="mb-8 leading-8">Incluso tras considerar el pago de ITP y gastos de registro, la entrada en estos activos se realiza con un "colchón" de rentabilidad inmenso.</p>
          <p class="mb-8 leading-8">Es el momento de dejar de competir con cientos de compradores y empezar a analizar lo que el BOE esconde en ${provinceName}.</p>
          
          <h3 class="text-lg font-bold text-slate-900 mb-6 mt-10 flex items-center gap-2">🚀 Conclusión técnica</h3>
          <p class="mb-8 leading-8">Con descuentos que alcanzan el ${maxDesc}%, el potencial de revalorización inmediata tras la adjudicación definitiva es real y tangible.</p>
          <p class="mb-8 leading-8">No estamos ante una inversión pasiva, sino ante una gestión activa que premia a quien tiene la información correcta en el momento preciso.</p>
        `,
        cta: `Ver oportunidades en ${provinceName}`,
        image: dynamicImage
      };
    };

    return generateEditorial(variant);
  }, [variant, provinceName, stats, topExamples]);

  const jsonLd = useMemo(() => {
    if (!provinceName || !content) return null;
    
    const latestDate = topExamples[0]?.data.lastCheckedAt || new Date().toISOString();
    const publishedDate = topExamples[0]?.data.publishedAt || new Date().toISOString();
    
    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": content.title,
      "description": content.meta,
      "image": [content.image],
      "datePublished": publishedDate.split('T')[0],
      "dateModified": latestDate.split('T')[0],
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
  }, [provinceName, content, topExamples]);

  const formattedDate = useMemo(() => {
    const date = topExamples[0]?.data.lastCheckedAt ? new Date(topExamples[0].data.lastCheckedAt) : new Date();
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [topExamples]);
  
  const updateText = useMemo(() => {
    const date = topExamples[0]?.data.lastCheckedAt ? new Date(topExamples[0].data.lastCheckedAt) : new Date();
    const diffMs = new Date().getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours < 24
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
                <p className="font-bold text-slate-900">Equipo de Análisis Técnico</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Activos Off-Market · Especialistas YMYL</p>
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
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default DiscoverProvinceArticle;
