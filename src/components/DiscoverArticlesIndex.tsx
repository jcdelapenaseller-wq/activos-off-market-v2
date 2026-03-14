import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { Calendar, ChevronRight, MapPin } from 'lucide-react';
import { generateDiscoverTitle } from '../utils/discoverTitles';
import { isAuctionFinished, sortActiveFirst } from '../utils/auctionHelpers';

const DiscoverArticlesIndex: React.FC = () => {
  useEffect(() => {
    document.title = "Últimas subastas inmobiliarias detectadas en España | Activos Off-Market";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Listado cronológico de las últimas oportunidades de inversión en subastas inmobiliarias procedentes del BOE en España.');
    }
  }, []);

  const articles = useMemo(() => {
    const mapped = Object.entries(AUCTIONS).map(([slug, auction], index) => {
      // Generate a deterministic date based on index so they can be sorted
      // We subtract days from today based on the index
      const date = new Date();
      date.setDate(date.getDate() - index * 2); // Every 2 days
      
      const discount = auction.appraisalValue && auction.claimedDebt 
        ? Math.round((1 - auction.claimedDebt / auction.appraisalValue) * 100)
        : null;

      const altText = `Subasta de ${auction.propertyType?.toLowerCase()} en ${auction.zone} ${auction.city}${discount ? ` con descuento del ${discount}% sobre tasación` : ''}`;
      
      return {
        slug,
        auction,
        date,
        title: generateDiscoverTitle(slug, auction),
        imageUrl: `https://picsum.photos/seed/real-estate-building-facade-auction-${slug}/800/450`,
        altText
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return sortActiveFirst(mapped, (item) => item.auction.auctionDate);
  }, []);

  const activeCount = useMemo(() => {
    return articles.filter(item => !isAuctionFinished(item.auction.auctionDate)).length;
  }, [articles]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Últimas subastas inmobiliarias detectadas en España
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Descubre las oportunidades de inversión más recientes procedentes del Boletín Oficial del Estado (BOE). 
            Estas subastas judiciales y administrativas permiten adquirir inmuebles con importantes descuentos sobre 
            su valor de mercado. Analiza cada expediente detalladamente y utiliza nuestra calculadora para estimar 
            tu puja máxima con total seguridad.
          </p>
          {activeCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 font-bold px-4 py-2 rounded-lg shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
              </span>
              {activeCount} subastas activas ahora mismo
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 gap-8">
          {articles.map((article) => {
            const isFinished = isAuctionFinished(article.auction.auctionDate);
            return (
            <article key={article.slug} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row relative">
              {isFinished && (
                <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20 shadow-sm">
                  Adjudicada
                </div>
              )}
              <Link to={`/noticias-subastas/${article.slug}`} className="md:w-2/5 shrink-0 block relative group">
                <img 
                  src={article.imageUrl} 
                  alt={article.altText}
                  className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  Oportunidad
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-slate-900 p-2 rounded-lg shadow-lg">
                  <MapPin size={16} className="text-brand-600" />
                </div>
                {article.auction.appraisalValue && article.auction.claimedDebt && (
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-brand-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    -{Math.round((1 - article.auction.claimedDebt / article.auction.appraisalValue) * 100)}% Dto.
                  </div>
                )}
              </Link>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                  <Calendar size={16} />
                  <time dateTime={article.date.toISOString()}>
                    {article.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </time>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 hover:text-brand-600 transition-colors">
                  <Link to={`/noticias-subastas/${article.slug}`}>
                    {article.title}
                  </Link>
                </h2>
                <p className="text-slate-600 mb-6 line-clamp-2">
                  Una nueva oportunidad acaba de aparecer en el portal de subastas: un {article.auction.propertyType?.toLowerCase()} ubicado en {article.auction.zone}, {article.auction.city}.
                </p>
                <Link 
                  to={`/noticias-subastas/${article.slug}`}
                  className={`inline-flex items-center gap-2 font-bold transition-colors mt-auto ${isFinished ? 'text-slate-500 hover:text-slate-700' : 'text-brand-600 hover:text-brand-800'}`}
                >
                  Leer noticia completa <ChevronRight size={18} />
                </Link>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DiscoverArticlesIndex;
