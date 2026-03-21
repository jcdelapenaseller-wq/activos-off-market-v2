import React, { useEffect, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ChevronRight, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { getImageForPropertyType } from '../constants/auctionImages';
import { generateEditorialArticle } from '../utils/editorialGenerator';
import { normalizeProvince } from '../utils/auctionNormalizer';
import Header from './Header';
import Footer from './Footer';
import TelegramCTA from './TelegramCTA';

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
      "image": [getImageForPropertyType(auction.propertyType, slug!, 0)],
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

  if (!slug || !auction || !article) return <Navigate to={ROUTES.NOTICIAS_SUBASTAS_INDEX} replace />;

  const formattedDate = article.dateModified.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const diffMs = new Date().getTime() - article.dateModified.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const updateText = diffHours === 0 
    ? 'Publicado hoy'
    : diffHours < 24 && diffHours > 0
      ? `Actualizado hace ${diffHours} horas`
      : `Última actualización: ${formattedDate}`;

  const imageUrl = getImageForPropertyType(auction.propertyType, slug, 0);

  // Split content into two halves to insert CTA in the middle
  const midPoint = Math.ceil(article.content.length / 2);
  const firstHalf = article.content.slice(0, midPoint);
  const secondHalf = article.content.slice(midPoint);

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

            <figure className="mb-10 -mx-6 md:-mx-10 relative group">
              <img 
                src={imageUrl} 
                alt={`Análisis de subasta en ${auction.city || auction.province}`}
                className="w-full h-[300px] md:h-[450px] object-cover md:rounded-none"
                referrerPolicy="no-referrer"
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
            
            <div className="text-slate-600 mb-12 leading-9">
              {firstHalf.map((paragraph, idx) => (
                <p key={`p1-${idx}`} className="mb-8">{paragraph}</p>
              ))}
            </div>

            <TelegramCTA />

            <div className="text-slate-600 mb-12 leading-9 mt-12">
              {secondHalf.map((paragraph, idx) => (
                <p key={`p2-${idx}`} className="mb-8">{paragraph}</p>
              ))}
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
      </main>
    </div>
  );
};

export default DiscoverAuctionArticle;
