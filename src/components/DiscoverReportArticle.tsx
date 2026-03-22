import React, { useEffect, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { DISCOVER_REPORTS } from '../data/discoverReports';
import { ROUTES } from '../constants/routes';
import { ChevronRight, ShieldCheck, Calculator, ArrowRight, MapPin, Building2 } from 'lucide-react';
import { AuctionCard } from './AuctionCard';
import { ShareButtons } from './ShareButtons';
import Header from './Header';
import Footer from './Footer';
import TelegramCTA from './TelegramCTA';
import { normalizeCity, normalizePropertyType } from '../utils/auctionNormalizer';

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    if (diffInHours === 0) return 'Actualizado hoy';
    return `Publicado hace ${diffInHours} hora${diffInHours === 1 ? '' : 's'}`;
  } else if (diffInHours < 48) {
    return 'Actualizado ayer';
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `Publicado hace ${diffInDays} días`;
  }
};

const highlightText = (text: string, cityName?: string) => {
  if (!text) return text;
  let highlighted = text;
  
  // Highlight percentages (e.g. 20%, 25%)
  highlighted = highlighted.replace(/(\d+(?:,\d+)?%)/g, '<strong class="font-bold text-slate-900">$1</strong>');
  
  // Highlight currency (e.g. 100.000€, 33.946€)
  highlighted = highlighted.replace(/(\d{1,3}(?:\.\d{3})*(?:,\d+)?\s*€)/g, '<strong class="font-bold text-slate-900">$1</strong>');
  
  // Highlight city if provided
  if (cityName) {
    const cityRegex = new RegExp(`\\b${cityName}\\b`, 'gi');
    highlighted = highlighted.replace(cityRegex, `<strong class="font-bold text-slate-900">$&</strong>`);
  }

  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
};

const DiscoverReportArticle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const report = useMemo(() => {
    if (!slug) return null;
    return DISCOVER_REPORTS[slug];
  }, [slug]);

  const reportAuctions = useMemo(() => {
    if (!report) return [];
    return report.auctionDetails
      .map(detail => ({ detail, data: AUCTIONS[detail.slug] }))
      .filter(item => item.data !== undefined);
  }, [report]);

  const jsonLd = useMemo(() => {
    if (!report) return null;
    
    const itemListElements = reportAuctions.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "RealEstateListing",
        "url": `${window.location.origin}/subasta/${item.detail.slug}`,
        "name": `Subasta de ${item.data.propertyType || 'Inmueble'} en ${item.data.city || item.data.province}`
      }
    }));

    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": report.title,
      "description": report.intro,
      "image": [report.image],
      "datePublished": new Date(report.publishDate).toISOString(),
      "dateModified": new Date(report.publishDate).toISOString(),
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
      },
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": itemListElements
      }
    };
  }, [report, reportAuctions]);

  useEffect(() => {
    if (report) {
      document.title = `${report.title} | Activos Off-Market`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', report.intro.substring(0, 155) + '...');
      window.scrollTo(0, 0);
    }
  }, [report]);

  if (!report) return <Navigate to={ROUTES.HOME} replace />;

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600 flex flex-col">
      <Header />
      
      <link rel="preload" as="image" href={report.image} />
      <link rel="canonical" href={`${window.location.origin}/discover/reportajes/${slug}`} />
      
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}

      <main className="max-w-3xl mx-auto px-6 py-12 w-full">
        <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
          <ChevronRight size={14} className="mx-2" />
          <Link to={ROUTES.RECENT_AUCTIONS} className="hover:text-brand-600 transition-colors">Subastas</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-slate-900 truncate" aria-current="page">Reportaje</span>
        </nav>

        <article className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-100 text-sm">
                <ShieldCheck size={14} />
                Selección del experto
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              {report.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 py-6 border-y border-slate-100">
              <div className="flex items-center gap-4">
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
                  <div className="font-bold text-slate-900">Equipo Activos Off-Market</div>
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <time dateTime={report.publishDate} className="font-medium text-emerald-700">
                      {getRelativeTime(report.publishDate)}
                    </time>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{new Date(report.publishDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <ShareButtons 
                title={report.title} 
                label="Compartir:" 
              />
            </div>

            <figure className="mb-10 -mx-6 md:-mx-10 relative group">
              <img 
                src={report.image} 
                alt={report.title}
                className="w-full h-[300px] md:h-[450px] object-cover md:rounded-none"
                referrerPolicy="no-referrer"
                width="1200"
                height="675"
                fetchPriority="high"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40"></div>
            </figure>

            {/* Mini Resumen Superior */}
            <div className="mb-12">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Resumen del reportaje</h3>
              <div className="flex flex-wrap gap-3">
                {reportAuctions.map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 flex items-center gap-2 text-slate-700 font-medium">
                    <span className="text-brand-600">📍</span> 
                    <span>
                      <strong>{normalizeCity(item.data) || item.data.province}</strong>: {normalizePropertyType(item.data.propertyType)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="prose prose-lg prose-slate max-w-none">
              {report.intro.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
                <p key={idx} className="text-lg leading-relaxed text-slate-700 mb-8">
                  {highlightText(paragraph)}
                </p>
              ))}
            </div>

            {/* CTA Pre-Subastas */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 mt-12 mb-4 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
              <div>
                <h3 className="text-xl font-bold mb-2 text-white mt-0">Analizamos {reportAuctions.length} oportunidades reales</h3>
                <p className="text-slate-300 text-sm m-0">Seleccionadas por su alto margen de descuento y viabilidad jurídica.</p>
              </div>
              <a href="#subasta-1" className="shrink-0 bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 no-underline">
                Ver primera oportunidad <ArrowRight size={18} />
              </a>
            </div>
          </header>

          <div className="space-y-20 mb-16">
            {reportAuctions.map((item, index) => {
              const cityName = normalizeCity(item.data);
              return (
                <section key={item.detail.slug} className="scroll-mt-24 pt-12 mt-12 border-t-2 border-slate-100 first:pt-4 first:mt-4 first:border-t-0" id={`subasta-${index + 1}`}>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-900 text-white font-serif text-2xl font-bold shrink-0 shadow-sm">
                      {index + 1}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-serif font-black text-slate-900 leading-tight tracking-tight">
                      {item.detail.subtitle}
                    </h2>
                  </div>
                  
                  {/* Oportunidad Card */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 md:p-8 my-8 shadow-sm">
                    <h3 className="text-emerald-800 font-bold mb-4 flex items-center gap-2 text-xl">
                      📈 Análisis de la oportunidad
                    </h3>
                    <div className="space-y-4">
                      {item.detail.analysis.split('\n').filter(p => p.trim() !== '').map((p, i) => (
                        <p key={i} className="text-emerald-900 m-0 leading-relaxed text-lg">
                          {highlightText(p, cityName)}
                        </p>
                      ))}
                    </div>
                  </div>
                  
                  {/* Riesgos Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 my-8 shadow-sm">
                    <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2 text-xl">
                      ⚠️ Riesgos a considerar
                    </h3>
                    <div className="space-y-4">
                      {item.detail.risks.split('\n').filter(p => p.trim() !== '').map((p, i) => (
                        <p key={i} className="text-slate-700 m-0 leading-relaxed text-lg">
                          {highlightText(p, cityName)}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Perfil Inversor Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 my-8 shadow-sm">
                    <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2 text-xl">
                      🎯 Perfil de inversor
                    </h3>
                    <div className="space-y-4">
                      {item.detail.investorProfile.split('\n').filter(p => p.trim() !== '').map((p, i) => (
                        <p key={i} className="text-slate-700 m-0 leading-relaxed text-lg">
                          {highlightText(p, cityName)}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-12">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Building2 className="text-brand-600" size={24} />
                      Ficha Técnica del Expediente
                    </h3>
                    <AuctionCard slug={item.detail.slug} data={item.data} />
                  </div>
                </section>
              );
            })}
          </div>

          <div className="prose prose-lg prose-slate max-w-none mb-16 bg-slate-50 p-8 md:p-10 rounded-2xl border border-slate-200">
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6 mt-0">Conclusión</h3>
            {report.conclusion.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
              <p key={idx} className="text-slate-700 leading-relaxed text-lg mb-6">
                {highlightText(paragraph)}
              </p>
            ))}
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-8 md:p-12 text-center mb-16 shadow-sm">
            <Calculator className="w-12 h-12 text-brand-600 mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">
              ¿Quieres saber cuánto pujar por estas propiedades?
            </h3>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto text-lg">
              No te dejes llevar por la emoción. Utiliza nuestra calculadora gratuita para determinar tu puja máxima y asegurar la rentabilidad de tu inversión.
            </p>
            <Link 
              to={ROUTES.CALCULATOR}
              className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-700 transition-colors w-full sm:w-auto shadow-sm"
            >
              Calcular rentabilidad ahora
              <ArrowRight size={20} />
            </Link>
          </div>

          <TelegramCTA />
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default DiscoverReportArticle;
