import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, BookOpen, TrendingUp, ShieldCheck } from 'lucide-react';
import { DISCOVER_REPORTS } from '../data/discoverReports';
import TelegramCTA from './TelegramCTA';
import { ROUTES } from '../constants/routes';

const DiscoverReportsIndex: React.FC = () => {
  useEffect(() => {
    document.title = "Reportajes y Análisis de Subastas en Profundidad | Activos Off-Market";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Investigaciones exclusivas, análisis de rentabilidad y guías avanzadas sobre el mercado de subastas judiciales y administrativas en España.');
    }
  }, []);

  const sortedReports = Object.entries(DISCOVER_REPORTS).map(([slug, report]) => ({
    ...report,
    slug
  })).sort((a, b) => {
    return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
  });

  const featuredReport = sortedReports[0];
  const gridReports = sortedReports.slice(1);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      {featuredReport && (
        <link rel="preload" as="image" href={featuredReport.image} />
      )}
      
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-bold uppercase tracking-widest mb-6">
            <BookOpen size={14} />
            <span>Investigación Exclusiva</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mb-6 leading-tight">
            Análisis en Profundidad del Mercado
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8">
            Reportajes detallados, estudios de rentabilidad y estrategias avanzadas para inversores en subastas públicas en España.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <TrendingUp size={16} className="text-brand-600" /> Datos Reales
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <ShieldCheck size={16} className="text-brand-600" /> Rigor Jurídico
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <BookOpen size={16} className="text-brand-600" /> Lectura Premium
            </span>
          </div>
        </header>

        {/* Featured Report (Hero) */}
        {featuredReport && (
          <section className="mb-16">
            <Link to={ROUTES.DISCOVER_REPORT.replace(':slug', featuredReport.slug)} className="block group">
              <article className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group-hover:shadow-xl transition-all duration-500 flex flex-col lg:flex-row relative">
                <div className="lg:w-3/5 shrink-0 block relative overflow-hidden aspect-video lg:aspect-auto lg:h-[500px]">
                  <img 
                    src={featuredReport.image} 
                    alt={featuredReport.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                    width="1200"
                    height="675"
                    loading="eager"
                    fetchPriority="high"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-6 left-6 bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    Reportaje Destacado
                  </div>
                </div>
                
                <div className="p-8 lg:p-12 flex flex-col justify-center lg:w-2/5 bg-white relative z-10">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-4 font-medium">
                    <Calendar size={16} className="text-brand-600" />
                    <time dateTime={featuredReport.publishDate}>
                      {new Date(featuredReport.publishDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </time>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-900 mb-6 group-hover:text-brand-700 transition-colors leading-tight">
                    {featuredReport.title}
                  </h2>
                  <p className="text-slate-600 text-lg mb-8 line-clamp-3 leading-relaxed">
                    {featuredReport.intro}
                  </p>
                  <div className="inline-flex items-center gap-2 font-bold transition-colors mt-auto text-brand-600 group-hover:text-brand-800 bg-brand-50 w-fit px-5 py-2.5 rounded-xl">
                    Leer investigación completa <ChevronRight size={18} />
                  </div>
                </div>
              </article>
            </Link>
          </section>
        )}

        {/* Grid Reports */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
            <h3 className="text-2xl font-bold text-slate-900 font-serif">Últimos Análisis</h3>
            <span className="text-slate-500 text-sm font-medium">{gridReports.length} artículos</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridReports.map((report) => (
              <Link to={ROUTES.DISCOVER_REPORT.replace(':slug', report.slug)} key={report.id} className="block group h-full">
                <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group-hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                  <div className="relative overflow-hidden aspect-[16/10]">
                    <img 
                      src={report.image} 
                      alt={report.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                      Análisis
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-3 font-medium">
                      <Calendar size={14} />
                      <time dateTime={report.publishDate}>
                        {new Date(report.publishDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </time>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-3 leading-snug">
                      {report.title}
                    </h4>
                    <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow">
                      {report.intro}
                    </p>
                    <div className="inline-flex items-center gap-1.5 font-bold text-sm text-brand-600 group-hover:text-brand-800 mt-auto">
                      Leer artículo <ChevronRight size={16} />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        <TelegramCTA variant="banner" />
      </div>
    </div>
  );
};

export default DiscoverReportsIndex;
