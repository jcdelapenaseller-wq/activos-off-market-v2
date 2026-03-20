import React, { useEffect, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { Calendar, ChevronRight, TrendingUp, MapPin, ArrowRight, Calculator, ShieldCheck, Zap } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { isAuctionFinished } from '../utils/auctionHelpers';
import { normalizePropertyType } from '../utils/auctionNormalizer';
import { trackConversion } from '../utils/tracking';

const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null) return 'N/A';
  return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
};
import { AuctionCard } from './AuctionCard';
import PremiumValueBlock from './PremiumValueBlock';
import Header from './Header';
import Footer from './Footer';

const DiscoverAuctionArticle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const auction = useMemo(() => {
    if (!slug) return null;
    return AUCTIONS[slug as keyof typeof AUCTIONS];
  }, [slug]);

  const stats = useMemo(() => {
    if (!auction) return null;
    
    const valorReferencia = auction.valorTasacion || auction.valorSubasta || auction.appraisalValue;
    const cantidadReclamada = auction.claimedDebt;
    const discount = (valorReferencia && cantidadReclamada !== undefined && cantidadReclamada !== null && valorReferencia > cantidadReclamada) 
      ? Math.round(((valorReferencia - cantidadReclamada) / valorReferencia) * 100)
      : 0;
    
    return {
      valorReferencia,
      cantidadReclamada,
      discount,
      propertyType: normalizePropertyType(auction.propertyType),
      location: auction.city || auction.province,
      province: auction.province
    };
  }, [auction]);

  const content = useMemo(() => {
    if (!auction || !stats) return null;

    const type = stats.propertyType.toLowerCase();
    const location = stats.location;
    const discount = stats.discount;
    
    const titles = [
      `Este ${type} en ${location} podría venderse por un ${discount}% menos de su valor`,
      `Oportunidad detectada: ${stats.propertyType} en ${location} con deuda reducida`,
      `Análisis técnico: ¿Merece la pena pujar por este ${type} en ${location}?`,
      `Lo que oculta la subasta de este ${type} en ${location}: precio vs valor real`
    ];
    
    // Use slug length to pick a title for consistency
    const title = titles[slug!.length % titles.length].substring(0, 90);

    return {
      title,
      meta: `Analizamos la subasta de un ${type} en ${location}. Valor de tasación: ${formatCurrency(stats.valorReferencia)}. Deuda reclamada: ${formatCurrency(stats.cantidadReclamada)}.`,
      intro: `Hemos localizado un **${type}** en **${location}** que presenta una configuración financiera extremadamente interesante para un inversor. Con un valor de tasación de **${formatCurrency(stats.valorReferencia)}** y una deuda reclamada de solo **${formatCurrency(stats.cantidadReclamada)}**, el margen teórico de beneficio es del **${discount}%**.`,
      body: `Este tipo de activos suelen pasar desapercibidos en el BOE debido a la falta de análisis técnico. Sin embargo, tras revisar el expediente, observamos que la ubicación en **${location}** y el tipo de activo lo convierten en una pieza codiciada para estrategias de flipping o alquiler patrimonial. La clave aquí es la diferencia entre el valor de mercado y la carga que origina la subasta.`,
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'
    };
  }, [auction, stats, slug]);

  const jsonLd = useMemo(() => {
    if (!auction || !content) return null;
    
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
  }, [auction, content]);

  useEffect(() => {
    if (content) {
      document.title = `${content.title} | Activos Off-Market`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', content.meta);
      }
    }
    window.scrollTo(0, 0);
  }, [content]);

  if (!slug || !auction) return <Navigate to={ROUTES.NOTICIAS_SUBASTAS_INDEX} replace />;

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
          <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md">Análisis de Activo</span>
        </nav>

        <article className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
              <div className="flex items-center gap-1.5 text-brand-700 bg-brand-50 px-3 py-1 rounded-full font-bold">
                <Zap size={14} className="text-brand-500" />
                <time dateTime={today.toISOString()}>
                  Análisis Exclusivo · {formattedDate}
                </time>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-100">
                <ShieldCheck size={14} />
                Verificado por expertos
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              {content?.title}
            </h1>

            <figure className="mb-10 -mx-6 md:-mx-10 relative group">
              <img 
                src={content?.image} 
                alt={`Análisis de subasta en ${stats?.location}`}
                className="w-full h-[300px] md:h-[450px] object-cover md:rounded-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
              <figcaption className="absolute bottom-6 left-6 md:left-10 text-white">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1 opacity-80">Ficha Técnica de Inversión</p>
                <p className="text-lg md:text-xl font-serif italic">{stats?.propertyType} en {stats?.location}</p>
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
            {/* Tabla de datos reales */}
            <div className="bg-slate-50 rounded-2xl p-8 mb-10 border border-slate-200 not-prose">
              <h3 className="text-slate-900 font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-brand-600" />
                Métricas clave del activo
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 text-sm">Valor de Tasación</span>
                  <span className="font-bold text-slate-900">{formatCurrency(stats?.valorReferencia)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 text-sm">Deuda Reclamada</span>
                  <span className="font-bold text-slate-900">{formatCurrency(stats?.cantidadReclamada)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 text-sm">Descuento Teórico</span>
                  <span className="font-bold text-brand-600">{stats?.discount}%</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 text-sm">Ubicación</span>
                  <span className="font-bold text-slate-900">{stats?.location}</span>
                </div>
              </div>
            </div>

            <p className="lead text-xl text-slate-700 font-medium mb-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: content?.intro || '' }} />
            
            <p className="text-slate-600 mb-8 leading-relaxed">
              {content?.body}
            </p>

            {/* CTA Calculadora Integrado */}
            <div className="my-10 p-8 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-8 not-prose shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 text-center md:text-left">
                <p className="text-brand-400 font-bold text-xs uppercase tracking-widest mb-2">Herramienta Gratuita</p>
                <p className="text-xl font-bold mb-1">¿Es rentable esta puja?</p>
                <p className="text-slate-400 text-sm">Introduce los datos de esta subasta y obtén tu margen neto.</p>
              </div>
              <Link 
                to={ROUTES.CALCULATOR}
                onClick={() => trackConversion(stats?.location || '', 'discover-auction', 'calculator')}
                className="relative z-10 bg-white text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 transition-all whitespace-nowrap shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Abrir Calculadora
              </Link>
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-brand-500/20 transition-colors"></div>
            </div>

            <div className="my-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to={`/subasta/${slug}`}
                className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-brand-700 transition-colors shadow-lg"
              >
                Ver ficha técnica completa <ArrowRight size={18} />
              </Link>
              <Link 
                to={`/subastas/${stats?.province?.toLowerCase()}`}
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200"
              >
                Más subastas en {stats?.province}
              </Link>
            </div>

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

export default DiscoverAuctionArticle;
