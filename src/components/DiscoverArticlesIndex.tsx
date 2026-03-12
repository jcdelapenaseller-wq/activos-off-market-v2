import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { Calendar, ChevronRight } from 'lucide-react';
import { generateDiscoverTitle } from '../utils/discoverTitles';

const DiscoverArticlesIndex: React.FC = () => {
  useEffect(() => {
    document.title = "Últimas subastas inmobiliarias detectadas en España | Activos Off-Market";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Listado cronológico de las últimas oportunidades de inversión en subastas inmobiliarias procedentes del BOE en España.');
    }
  }, []);

  const articles = useMemo(() => {
    return Object.entries(AUCTIONS).map(([slug, auction], index) => {
      // Generate a deterministic date based on index so they can be sorted
      // We subtract days from today based on the index
      const date = new Date();
      date.setDate(date.getDate() - index * 2); // Every 2 days
      
      return {
        slug,
        auction,
        date,
        title: generateDiscoverTitle(slug, auction),
        imageUrl: `https://picsum.photos/seed/real-estate-auction-${slug}/800/450`
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Últimas subastas inmobiliarias detectadas en España
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Descubre las oportunidades de inversión más recientes procedentes del Boletín Oficial del Estado (BOE). 
            Estas subastas judiciales y administrativas permiten adquirir inmuebles con importantes descuentos sobre 
            su valor de mercado. Analiza cada expediente detalladamente y utiliza nuestra calculadora para estimar 
            tu puja máxima con total seguridad.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {articles.map((article) => (
            <article key={article.slug} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row">
              <Link to={`/noticias-subastas/${article.slug}`} className="md:w-2/5 shrink-0 block">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-64 md:h-full object-cover"
                  referrerPolicy="no-referrer"
                />
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
                  className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-800 transition-colors mt-auto"
                >
                  Leer noticia completa <ChevronRight size={18} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscoverArticlesIndex;
