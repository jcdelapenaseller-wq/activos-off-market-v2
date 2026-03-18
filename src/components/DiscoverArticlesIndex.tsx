import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { Calendar, ChevronRight, MapPin } from 'lucide-react';
import { isAuctionFinished } from '../utils/auctionHelpers';
import { normalizeProvince } from '../utils/auctionNormalizer';
import TelegramCTA from './TelegramCTA';

const DiscoverArticlesIndex: React.FC = () => {
  useEffect(() => {
    document.title = "Últimas noticias y análisis de subastas en España | Activos Off-Market";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Análisis de mercado, oportunidades de inversión y últimas horas sobre subastas judiciales y administrativas por provincia en España.');
    }
  }, []);

  const articles = useMemo(() => {
    // 1. Get unique provinces with active auctions
    const activeAuctions = Object.values(AUCTIONS).filter(a => !isAuctionFinished(a.auctionDate));
    const provincesMap = new Map<string, { count: number, maxDiscount: number }>();
    
    activeAuctions.forEach(a => {
      const p = normalizeProvince(a.province || a.city);
      if (!p) return;
      
      const discount = a.appraisalValue && a.claimedDebt && a.appraisalValue > a.claimedDebt
        ? Math.round((1 - a.claimedDebt / a.appraisalValue) * 100)
        : 0;
        
      if (!provincesMap.has(p)) {
        provincesMap.set(p, { count: 1, maxDiscount: discount });
      } else {
        const current = provincesMap.get(p)!;
        current.count += 1;
        if (discount > current.maxDiscount) current.maxDiscount = discount;
      }
    });

    const generatedArticles: any[] = [];
    let dayOffset = 0;

    // 2. For each province, generate variants based on volume
    Array.from(provincesMap.entries()).forEach(([province, stats]) => {
      const slugBase = province.toLowerCase().replace(/\s+/g, '-');
      
      // 1. Siempre generamos la variante "Oportunidad" (para < 5 subastas)
      const dateOpp = new Date();
      dateOpp.setDate(dateOpp.getDate() - dayOffset);
      generatedArticles.push({
        id: `${slugBase}-opportunity`,
        url: `/noticias-subastas/provincia/${slugBase}/oportunidades`,
        title: `Nuevas oportunidades en ${province}: hasta ${stats.maxDiscount}% de descuento`,
        excerpt: `El mercado de subastas en ${province} acaba de actualizarse. Nuestro sistema ha detectado ${stats.count} oportunidades activas hoy con grandes descuentos.`,
        date: dateOpp,
        imageUrl: `https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80`,
        tag: 'Oportunidad',
        tagColor: 'bg-brand-600'
      });
      dayOffset += 1;

      // 2. Si hay >= 5 subastas, añadimos la variante "Urgencia" (total: 2 variantes para 5-10)
      if (stats.count >= 5) {
        const dateUrg = new Date();
        dateUrg.setDate(dateUrg.getDate() - dayOffset);
        generatedArticles.push({
          id: `${slugBase}-urgency`,
          url: `/noticias-subastas/provincia/${slugBase}/hoy`,
          title: `Subastas en ${province} hoy: ${stats.count} expedientes a punto de cerrar`,
          excerpt: `El tiempo es clave en las subastas judiciales. Hoy tenemos ${stats.count} expedientes activos en la provincia de ${province}. Revisa estas oportunidades antes de que finalice el plazo.`,
          date: dateUrg,
          imageUrl: `https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800&q=80`,
          tag: 'Última hora',
          tagColor: 'bg-red-600'
        });
        dayOffset += 1;
      }

      // 3. Si hay > 10 subastas, añadimos la variante "Análisis" (total: 3 variantes para > 10)
      if (stats.count > 10) {
        const dateAna = new Date();
        dateAna.setDate(dateAna.getDate() - dayOffset);
        generatedArticles.push({
          id: `${slugBase}-analysis`,
          url: `/noticias-subastas/provincia/${slugBase}/donde-invertir`,
          title: `Dónde invertir en subastas en ${province}: Análisis de mercado`,
          excerpt: `¿Buscando rentabilidad en ${province}? Analizamos el estado actual de las subastas públicas en la región. Con ${stats.count} activos disponibles, el mercado ofrece opciones estratégicas.`,
          date: dateAna,
          imageUrl: `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80`,
          tag: 'Análisis',
          tagColor: 'bg-slate-800'
        });
        dayOffset += 1;
      }
    });

    return generatedArticles.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Noticias y Análisis de Subastas
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Descubre las oportunidades de inversión más recientes procedentes del Boletín Oficial del Estado (BOE). 
            Analizamos el mercado provincia a provincia para encontrar los activos con mayor rentabilidad.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
            Sistema que detecta oportunidades automáticamente
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {articles.map((article) => {
            return (
            <article key={article.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row relative">
              <Link to={article.url} className="md:w-2/5 shrink-0 block relative group">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute top-4 left-4 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg ${article.tagColor}`}>
                  {article.tag}
                </div>
              </Link>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                  <Calendar size={16} />
                  <time dateTime={article.date.toISOString()}>
                    {article.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </time>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 hover:text-brand-600 transition-colors">
                  <Link to={article.url}>
                    {article.title}
                  </Link>
                </h2>
                <p className="text-slate-600 mb-6 line-clamp-2">
                  {article.excerpt}
                </p>
                <Link 
                  to={article.url}
                  className="inline-flex items-center gap-2 font-bold transition-colors mt-auto text-brand-600 hover:text-brand-800"
                >
                  Leer artículo <ChevronRight size={18} />
                </Link>
              </div>
            </article>
            );
          })}
        </div>
        <TelegramCTA variant="banner" />
      </div>
    </div>
  );
};

export default DiscoverArticlesIndex;
