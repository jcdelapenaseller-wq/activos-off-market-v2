import React, { useEffect, useMemo } from 'react';
import { Link, useParams, Navigate, useLocation } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ChevronRight, ArrowRight, ShieldCheck, Zap, Building2, MapPin, Euro, AlertCircle, TrendingDown, Clock, ShieldAlert, Star, ExternalLink } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { getImageForPropertyType } from '../constants/auctionImages';
import { generateEditorialArticle, shouldGenerateDiscoverArticle } from '../utils/editorialGenerator';
import { normalizeProvince, normalizeCity, normalizePropertyType } from '../utils/auctionNormalizer';
import { calculateDiscount } from '../utils/auctionHelpers';
import { ShareButtons } from './ShareButtons';
import { AuctionCard } from './AuctionCard';

const DiscoverAuctionArticle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const auction = useMemo(() => {
    if (!slug) return null;
    return AUCTIONS[slug as keyof typeof AUCTIONS];
  }, [slug]);

  const article = useMemo(() => {
    if (!auction || !slug) return null;
    return generateEditorialArticle(slug, auction);
  }, [auction, slug]);

  const articleData = (article as any)?.data;
  const isAdjudicated = article?.phase === 'ADJUDICATED';
  const currentPath = useLocation().pathname;
  const analysisPath = ROUTES.NOTICIAS_SUBASTAS_ANALYSIS.replace(':slug', slug || '');
  const canonicalUrl = `${window.location.origin}${analysisPath}`;
  const isResultPage = currentPath.includes('/resultado/');

  const jsonLd = useMemo(() => {
    if (!auction || !article) return null;
    
    const now = new Date();
    let publishedDate = auction.publishedAt ? new Date(auction.publishedAt) : now;
    if (publishedDate > now) publishedDate = now;

    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "description": article.excerpt,
      "image": [getImageForPropertyType(auction.propertyType, slug!)],
      "datePublished": publishedDate.toISOString().split('T')[0],
      "dateModified": article.dateModified.toISOString(),
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
  }, [auction, article, slug]);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} | Activos Off-Market`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', article.excerpt);
      }
    }
    window.scrollTo(0, 0);
  }, [article]);

  if (!slug || !auction) return <Navigate to={ROUTES.NOTICIAS_SUBASTAS_INDEX} replace />;
  
  // Redirect to normal auction page if it doesn't meet Discover criteria
  if (!shouldGenerateDiscoverArticle(auction)) {
    return <Navigate to={`/subasta/${slug}`} replace />;
  }

  if (!article) return <Navigate to={ROUTES.NOTICIAS_SUBASTAS_INDEX} replace />;

  // Redirect if on wrong path for current phase
  // Removed incorrect redirect logic

  const formattedDate = article.dateModified.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const diffMs = new Date().getTime() - article.dateModified.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const updateText = diffHours === 0 
    ? 'Publicado hoy'
    : diffHours < 24 && diffHours > 0
      ? `Actualizado hace ${diffHours} horas`
      : `Última actualización: ${formattedDate}`;

  const imageUrl = getImageForPropertyType(auction.propertyType, slug);

  const layoutOrder = useMemo(() => {
    if (!slug) return ['chips', 'card', 'graphic'];
    // Simple hash to vary order based on slug
    const hash = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const layouts = [
      ['chips', 'card', 'graphic'],
      ['graphic', 'card', 'chips'],
      ['chips', 'graphic', 'card'],
      ['card', 'graphic', 'chips']
    ];
    return layouts[hash % layouts.length];
  }, [slug]);

  const hasGraphicData = useMemo(() => {
    return auction && auction.claimedDebt && (auction.appraisalValue || auction.valorTasacion || auction.valorSubasta);
  }, [auction]);

  const renderSpecialBlock = (type: string) => {
    if (type === 'chips' && articleData?.chips) {
      return (
        <div className="flex flex-nowrap items-center gap-1 mb-6 not-prose overflow-x-auto pb-1 scrollbar-hide max-h-[60px]">
          <div className="bg-slate-100 border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0">
            <span className="text-[11px]">📍</span>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{articleData.chips.city}</span>
          </div>
          <div className="bg-slate-100 border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0">
            <span className="text-[11px]">🏠</span>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{articleData.chips.type}</span>
          </div>
          <div className="bg-brand-50 border border-brand-100 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0">
            <span className="text-[11px]">💰</span>
            <span className="text-[11px] font-bold text-brand-700 uppercase tracking-tight">{articleData.chips.appraisal}</span>
          </div>
          <div className="bg-amber-50 border border-amber-100 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0">
            <span className="text-[11px]">🏦</span>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-tight">{articleData.chips.debt}</span>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0">
            <span className="text-[11px]">⏱</span>
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-tight">{articleData.chips.closing}</span>
          </div>
          {articleData.chips.finalPrice && articleData.chips.finalPrice !== 'Dato no disponible' && (
            <div className="bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0">
              <span className="text-[11px]">🏆</span>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-tight">{articleData.chips.finalPrice}</span>
            </div>
          )}
          {articleData.chips.savings && articleData.chips.savings !== '0 €' && (
            <div className="bg-brand-50 border border-brand-100 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0">
              <span className="text-[11px]">📉</span>
              <span className="text-[11px] font-bold text-brand-700 uppercase tracking-tight">-{articleData.chips.savings}</span>
            </div>
          )}
        </div>
      );
    }

    if (type === 'card' && auction) {
      const cardTitles = [
        "Detalles técnicos de este activo",
        "Ficha de la subasta analizada",
        "Información oficial del expediente",
        "Datos clave del inmueble"
      ];
      const cardTitle = cardTitles[slug ? slug.length % cardTitles.length : 0];

      return (
        <div className="my-10 not-prose">
          <p className="text-xs font-medium text-slate-500 mb-1 text-center">{cardTitle}</p>
          <AuctionCard slug={slug || ''} data={auction} />
        </div>
      );
    }

    if (type === 'graphic') {
      if (hasGraphicData) {
        return (
          <div className="my-10 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm not-prose">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingDown size={18} className="text-brand-600" />
              Viabilidad Económica
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-1.5">
                  <span className="font-medium text-slate-500 uppercase tracking-wider">Tasación</span>
                  <span className="font-bold text-slate-900">{articleData?.appraisalValue.toLocaleString('es-ES')} €</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-brand-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1.5">
                  <span className="font-medium text-slate-500 uppercase tracking-wider">Deuda</span>
                  <span className="font-bold text-slate-900">
                    {articleData?.debtValue > 0 ? `${articleData.debtValue.toLocaleString('es-ES')} €` : 'No publicada'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`${articleData?.debtValue > 0 ? 'bg-slate-400' : 'bg-slate-200'} h-1.5 rounded-full transition-all duration-1000`} 
                    style={{ width: `${Math.min(100, (articleData?.debtValue / (articleData?.appraisalValue || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Margen Teórico</span>
                <span className="text-xl font-serif font-bold text-brand-600">
                  {calculateDiscount(articleData?.appraisalValue, auction.valorSubasta, articleData?.debtValue) || 0}%
                </span>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="my-10 p-5 bg-slate-50 border border-slate-100 rounded-2xl italic text-slate-500 text-xs text-center">
            <p>Análisis técnico de viabilidad en curso. Recomendamos verificar el edicto para confirmar cargas.</p>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <>
      <link rel="preload" as="image" href={imageUrl} />
      <link rel="canonical" href={canonicalUrl} />
      {isResultPage && <meta name="robots" content="noindex, follow" />}
      
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
      
      <div className="flex-grow max-w-3xl mx-auto px-6 py-12 w-full">
        <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
          <ChevronRight size={14} className="mx-2" />
          <Link to={ROUTES.NOTICIAS_SUBASTAS_INDEX} className="hover:text-brand-600 transition-colors">Noticias</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md">Análisis Editorial</span>
        </nav>

        <article className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
              <div className="flex items-center gap-1.5 text-brand-700 bg-brand-50 px-3 py-1 rounded-full font-bold">
                <Zap size={14} className="text-brand-500" />
                <time dateTime={article.dateModified.toISOString()}>
                  {updateText}
                </time>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-100">
                <ShieldCheck size={14} />
                Verificado por expertos
              </div>
              <div className={`flex items-center gap-1.5 text-white px-3 py-1 rounded-full font-bold ${article.tagColor}`}>
                {article.tag}
              </div>
              {article.phase === 'ADJUDICATED' && (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-200 animate-pulse">
                  <Star size={14} className="fill-emerald-500" />
                  Resultado Confirmado
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              {article.title}
            </h1>

            <ShareButtons 
              title={article.title} 
              className="mb-8 -mt-2" 
              province={auction.city || auction.province || 'España'}
              origin="discover-auction"
            />

            <figure className="mb-10 -mx-6 md:-mx-10 relative group">
              <img 
                src={imageUrl} 
                alt={`Análisis de subasta en ${auction.city || auction.province}`}
                className="w-full h-[300px] md:h-[450px] object-cover md:rounded-none"
                referrerPolicy="no-referrer"
                width="1200"
                height="675"
                fetchPriority="high"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40"></div>
              <figcaption className="absolute bottom-6 left-6 md:left-10 text-white">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1 opacity-80">Ficha Técnica de Inversión</p>
                <p className="text-lg md:text-xl font-serif italic">{auction.propertyType} en {auction.city || auction.province}</p>
              </figcaption>
            </figure>
            
            <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
              <img 
                src="https://activosoffmarket.es/logo.png" 
                alt="Activos Off-Market" 
                className="w-12 h-12 rounded-full bg-slate-900 object-cover border-2 border-white shadow-sm"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
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
            <p className="lead text-xl text-slate-700 font-medium mb-8 leading-relaxed">
              {article.excerpt}
            </p>
            
            <div className="border-t border-slate-100 my-3" />
            
            {/* Bloque 1 del layout */}
            {renderSpecialBlock(layoutOrder[0])}
            
            <div className="text-slate-600 mb-12">
              {articleData?.sections && articleData.sections.map((section: any, idx: number) => (
                <React.Fragment key={idx}>
                  <div className="border-t border-slate-100 my-3" />
                  
                  <h2 className="text-3xl font-serif font-bold text-slate-900 mt-12 mb-8">
                    {section.title}
                  </h2>
                  <div className="space-y-6">
                    {Array.isArray(section.content) ? (
                      <ul className="list-disc pl-6 space-y-4 mb-8 text-lg text-slate-700">
                        {section.content.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-lg text-slate-700 leading-relaxed space-y-4">
                        {section.content.split('\n\n').map((para: string, pIdx: number) => (
                          <p key={pIdx} className="mb-4">{para}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bloque 2 del layout tras el primer bloque de texto */}
                  {idx === 0 && (
                    <>
                      <div className="border-t border-slate-100 my-3" />
                      {renderSpecialBlock(layoutOrder[1])}
                    </>
                  )}

                  {/* Bloque 3 del layout tras el segundo bloque de texto */}
                  {idx === 1 && (
                    <>
                      <div className="border-t border-slate-100 my-3" />
                      {renderSpecialBlock(layoutOrder[2])}
                    </>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="border-t border-slate-100 my-3" />

            {/* Bloque Datos Subasta */}
            <div className="my-12 bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Building2 className="text-brand-600" size={24} />
                Ficha Técnica del Expediente
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-slate-400 mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Ubicación</p>
                      <p className="font-bold text-slate-900">{auction.city || auction.province}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Euro className="text-slate-400 mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Valor de Tasación</p>
                      <p className="font-bold text-slate-900">{(auction.appraisalValue || auction.valorTasacion || auction.valorSubasta || 0).toLocaleString('es-ES')} €</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-slate-400 mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Deuda Reclamada</p>
                      <p className="font-bold text-slate-900">{auction.claimedDebt ? `${auction.claimedDebt.toLocaleString('es-ES')} €` : 'Dato no publicado'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <TrendingDown className="text-brand-600 mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Margen Potencial</p>
                      <p className="font-bold text-brand-700 text-lg">{calculateDiscount(auction.appraisalValue || auction.valorTasacion || auction.valorSubasta || 0, auction.valorSubasta, auction.claimedDebt) || 0}%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="text-slate-400 mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Procedimiento</p>
                      <p className="font-bold text-slate-900">{auction.procedureType || 'Ejecución'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="text-slate-400 mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Estado Posesorio</p>
                      <p className="font-bold text-slate-900">
                        {auction.occupancy === 'No consta' ? 'Pendiente de análisis' : (auction.occupancy || 'Pendiente de análisis')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-slate-600 mb-12 leading-9">
              {/* Contenido renderizado arriba */}
            </div>

            <div className="text-slate-600 mb-12 leading-9 mt-12">
              {/* Contenido renderizado arriba */}
            </div>

            <div className="my-12">
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Fuentes y Referencias</h2>
              <ul className="space-y-3">
                {articleData?.sources?.map((source: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm">
                    <ExternalLink size={14} className="text-slate-400" />
                    <a href={source.url} target="_blank" rel="nofollow" className="text-brand-600 hover:underline font-medium">
                      {source.name}
                    </a>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-slate-700 text-sm">
                  <ExternalLink size={14} className="text-slate-400" />
                  <a href={articleData?.boeUrl} target="_blank" rel="nofollow" className="text-brand-600 hover:underline font-medium">
                    Expediente oficial en BOE
                  </a>
                </li>
              </ul>
            </div>

            <div className="my-8 not-prose">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-50 rounded-full -mr-10 -mt-10 opacity-40"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Star size={10} className="text-brand-600 fill-brand-600" />
                      <span className="text-[9px] font-bold text-brand-600 uppercase tracking-widest">Alertas Premium</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      ¿Quieres recibir alertas similares?
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Te avisamos por WhatsApp cuando detectamos oportunidades en {auction.city || auction.province}.
                    </p>
                  </div>

                  <div className="flex flex-col items-center md:items-end gap-1">
                    <Link 
                      to={ROUTES.ALERTAS}
                      className="bg-slate-900 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-all text-xs whitespace-nowrap"
                    >
                      PROBAR 7 DÍAS GRATIS
                    </Link>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Después 5€/mes · Cancela en 1 clic</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="my-12 flex flex-col sm:flex-row gap-4 w-full border-t border-slate-200 pt-10">
              <Link 
                to={`/subasta/${slug}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-brand-700 transition-colors shadow-sm text-center"
              >
                Ver análisis técnico <ArrowRight size={18} />
              </Link>
              <Link 
                to={`/subastas/${normalizeProvince(auction.province || auction.city).toLowerCase().replace(/\s+/g, '-')}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold px-8 py-4 rounded-xl hover:bg-slate-200 transition-colors text-center"
              >
                Más subastas en {normalizeProvince(auction.province || auction.city)}
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default DiscoverAuctionArticle;
