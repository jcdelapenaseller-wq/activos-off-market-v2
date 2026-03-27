import React, { useEffect, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ChevronRight, ArrowRight, ShieldCheck, Zap, Building2, MapPin, Euro, AlertCircle, TrendingDown, Clock, ShieldAlert } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { getImageForPropertyType } from '../constants/auctionImages';
import { generateEditorialArticle, shouldGenerateDiscoverArticle } from '../utils/editorialGenerator';
import { normalizeProvince, normalizeCity, normalizePropertyType } from '../utils/auctionNormalizer';
import { calculateDiscount } from '../utils/auctionHelpers';
import Header from './Header';
import Footer from './Footer';
import ConversionBlock from './ConversionBlock';
import RadarPremiumCTA from './RadarPremiumCTA';
import { ShareButtons } from './ShareButtons';

const renderParagraph = (text: string, idx: number, prefix: string) => {
  if (text.startsWith('## ')) {
    return (
      <h2 key={`${prefix}-${idx}`} className="text-3xl font-serif font-bold text-slate-900 mt-16 mb-8">
        {text.replace('## ', '')}
      </h2>
    );
  }
  if (text.startsWith('### ')) {
    return (
      <h3 key={`${prefix}-${idx}`} className="text-xl font-bold text-slate-900 mt-12 mb-6 flex items-center gap-2">
        {text.replace('### ', '')}
      </h3>
    );
  }
  if (text.startsWith('CARD_OPPORTUNITY:')) {
    return (
      <div key={`${prefix}-${idx}`} className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 my-8 shadow-sm">
        <h4 className="text-emerald-800 font-bold mb-3 flex items-center gap-2">📈 Oportunidad</h4>
        <p className="text-emerald-900 m-0 leading-relaxed">{text.replace('CARD_OPPORTUNITY:', '').trim()}</p>
      </div>
    );
  }
  if (text.startsWith('CARD_RISK:')) {
    return (
      <div key={`${prefix}-${idx}`} className="bg-amber-50 border border-amber-100 rounded-xl p-6 my-8 shadow-sm">
        <h4 className="text-amber-800 font-bold mb-3 flex items-center gap-2">⚠️ Riesgos principales</h4>
        <p className="text-amber-900 m-0 leading-relaxed">{text.replace('CARD_RISK:', '').trim()}</p>
      </div>
    );
  }
  if (text.startsWith('CARD_PROFILE:')) {
    return (
      <div key={`${prefix}-${idx}`} className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 my-8 shadow-sm">
        <h4 className="text-indigo-800 font-bold mb-3 flex items-center gap-2">🎯 Perfil inversor</h4>
        <p className="text-indigo-900 m-0 leading-relaxed">{text.replace('CARD_PROFILE:', '').trim()}</p>
      </div>
    );
  }
  
  // For normal paragraphs, parse bold text (e.g. **text**)
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <p key={`${prefix}-${idx}`} className="mb-8 leading-relaxed text-lg text-slate-700">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </p>
  );
};

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

  const formattedDate = article.dateModified.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const diffMs = new Date().getTime() - article.dateModified.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const updateText = diffHours === 0 
    ? 'Publicado hoy'
    : diffHours < 24 && diffHours > 0
      ? `Actualizado hace ${diffHours} horas`
      : `Última actualización: ${formattedDate}`;

  const imageUrl = getImageForPropertyType(auction.propertyType, slug);

  return (
    <>
      <link rel="preload" as="image" href={imageUrl} />
      <link rel="canonical" href={`${window.location.origin}/noticias-subastas/analisis/${slug}`} />
      
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
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              {article.title}
            </h1>

            <ShareButtons title={article.title} className="mb-8 -mt-2" />

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
            
            {/* Mini Resumen */}
            <div className="bg-slate-100 border-l-4 border-brand-500 p-6 rounded-r-xl mb-12">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Resumen rápido</h3>
              <ul className="space-y-3 text-slate-800 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-brand-600">📉</span> <strong>Descuento:</strong> {calculateDiscount(auction.appraisalValue || auction.valorTasacion || auction.valorSubasta || 0, auction.valorSubasta, auction.claimedDebt) || 0}%
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600">📍</span> <strong>Ciudad:</strong> {normalizeCity(auction) || auction.province}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600">🏢</span> <strong>Tipo:</strong> {normalizePropertyType(auction.propertyType)}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600">🎯</span> <strong>Perfil inversor:</strong> {(auction.claimedDebt || auction.valorSubasta || 0) < 50000 ? 'Minorista / Principiante' : 'Experimentado / Institucional'}
                </li>
              </ul>
            </div>
            
            <div className="text-slate-600 mb-12 leading-9">
              {article.content.slice(0, 8).map((paragraph, idx) => renderParagraph(paragraph, idx, 'p1'))}
            </div>

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
                      <p className="font-bold text-slate-900">{auction.claimedDebt ? `${auction.claimedDebt.toLocaleString('es-ES')} €` : 'No consta'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <TrendingDown className="text-brand-600 mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Descuento Teórico</p>
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
                      <p className="font-bold text-slate-900">{auction.occupancy || 'No consta'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-slate-600 mb-12 leading-9">
              {article.content.slice(8, 16).map((paragraph, idx) => renderParagraph(paragraph, idx, 'p2'))}
            </div>

            <ConversionBlock />

            <div className="text-slate-600 mb-12 leading-9 mt-12">
              {article.content.slice(16).map((paragraph, idx) => renderParagraph(paragraph, idx, 'p3'))}
            </div>

            <div className="my-16">
              <RadarPremiumCTA 
                location={auction.province || auction.city} 
                origin="discover-auction"
              />
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
