import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { Calendar, ChevronRight, MapPin } from 'lucide-react';
import { isAuctionFinished } from '../utils/auctionHelpers';
import { normalizeProvince, normalizePropertyType } from '../utils/auctionNormalizer';
import { getImageForPropertyType } from '../constants/auctionImages';
import { generateEditorialArticle, shouldGenerateDiscoverArticle } from '../utils/editorialGenerator';
import TelegramCTA from './TelegramCTA';
import DiscoverSingleAuctionArticle from './DiscoverSingleAuctionArticle';
import { DISCOVER_REPORTS } from '../data/discoverReports';
import { ROUTES } from '../constants/routes';
import { BookOpen } from 'lucide-react';

import { getAllowedProvincesForToday } from '../utils/discoverLimits';

const DiscoverArticlesIndex: React.FC = () => {
  useEffect(() => {
    document.title = "Últimas noticias y análisis de subastas en España | Activos Off-Market";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Análisis de mercado, oportunidades de inversión y últimas horas sobre subastas judiciales y administrativas por provincia en España.');
    }
  }, []);

  const { allArticles } = useMemo(() => {
    // 1. Get allowed provinces for today
    const allowedProvinces = getAllowedProvincesForToday();
    const activeAuctions = Object.values(AUCTIONS).filter(a => !isAuctionFinished(a.auctionDate));
    const provincesMap = new Map<string, { count: number, maxDiscount: number, latestPublished: Date, latestChecked: Date }>();
    
    activeAuctions.forEach(a => {
      const p = normalizeProvince(a.province || a.city);
      if (!p) return;
      
      // Only process if it's one of the allowed provinces for today
      if (!allowedProvinces.some(allowed => normalizeProvince(allowed).toLowerCase() === p.toLowerCase())) {
        return;
      }
      
      const now = new Date();
      let publishedAt = a.publishedAt ? new Date(a.publishedAt) : now;
      if (publishedAt > now) publishedAt = now;
      
      let lastCheckedAt = a.lastCheckedAt ? new Date(a.lastCheckedAt) : now;
      if (lastCheckedAt > now) lastCheckedAt = now;

      let discount = a.appraisalValue && a.claimedDebt !== undefined && a.claimedDebt !== null && a.appraisalValue > a.claimedDebt
        ? Math.round((1 - a.claimedDebt / a.appraisalValue) * 100)
        : 0;
        
      if (a.claimedDebt === 0 || discount > 85) {
        discount = 0; // Don't use this discount for the maxDiscount calculation
      }
        
      if (!provincesMap.has(p)) {
        provincesMap.set(p, { count: 1, maxDiscount: discount, latestPublished: publishedAt, latestChecked: lastCheckedAt });
      } else {
        const current = provincesMap.get(p)!;
        current.count += 1;
        if (discount > current.maxDiscount) current.maxDiscount = discount;
        if (publishedAt > current.latestPublished) current.latestPublished = publishedAt;
        if (lastCheckedAt > current.latestChecked) current.latestChecked = lastCheckedAt;
      }
    });

    const provinceArticles: any[] = [];
    let dayOffset = 0;

    // 2. For each province, generate a single editorial article
    Array.from(provincesMap.entries()).forEach(([province, stats], pIndex) => {
      const slugBase = province.toLowerCase().replace(/\s+/g, '-');
      const provinceSeed = province.length;
      
      const oppTitles = [
        `Ojo a estas subastas en ${province}: hay descuentos poco habituales`,
        `Este inmueble en ${province} podría venderse muy por debajo de su valor`,
        `Lo que está pasando con estas subastas en ${province} no es normal`,
        `Detectada oportunidad en ${province} con un ${stats.maxDiscount}% de descuento`
      ];
      const oppTitle = oppTitles[provinceSeed % oppTitles.length].substring(0, 90);

      provinceArticles.push({
        id: `${slugBase}-province`,
        url: `/noticias-subastas/provincia/${slugBase}`,
        title: oppTitle,
        excerpt: `El mercado de subastas en ${province} acaba de actualizarse. Se han seleccionado ${stats.count} oportunidades activas hoy con grandes descuentos.`,
        date: stats.latestChecked,
        lastChecked: stats.latestChecked,
        tag: 'Mercado Local',
        tagColor: 'bg-brand-600',
        propertyType: 'default',
        slug: `${slugBase}-0-${province}`
      });
    });
    provinceArticles.sort((a, b) => b.date.getTime() - a.date.getTime());

    // 3. Add individual auction articles (Top 10 by dateModified)
    const recentAuctionEntries = Object.entries(AUCTIONS).filter(([_, a]) => {
      if (!isAuctionFinished(a.auctionDate)) return true;
      if (!a.auctionDate) return false;
      const endDate = new Date(a.auctionDate.includes('T') ? a.auctionDate : `${a.auctionDate}T00:00:00Z`);
      const daysSinceClose = (new Date().getTime() - endDate.getTime()) / (1000 * 3600 * 24);
      return daysSinceClose <= 7; // Keep closed auctions for 7 days
    }).filter(([_, a]) => shouldGenerateDiscoverArticle(a));
    
    const auctionArticles = recentAuctionEntries
      .map(([slug, data]) => {
        const editorialData = generateEditorialArticle(slug, data);
        return { slug, data, editorialData };
      })
      .sort((a, b) => b.editorialData.dateModified.getTime() - a.editorialData.dateModified.getTime())
      .slice(0, 10)
      .map((item, index) => {
        return {
          id: `auction-${item.slug}`,
          url: `/noticias-subastas/analisis/${item.slug}`,
          title: item.editorialData.title,
          excerpt: item.editorialData.excerpt,
          date: item.editorialData.dateModified,
          lastChecked: item.data.lastCheckedAt ? new Date(item.data.lastCheckedAt) : new Date(),
          tag: item.editorialData.tag,
          tagColor: item.editorialData.tagColor,
          editorialData: item.editorialData,
          propertyType: item.data.propertyType,
          slug: item.slug
        };
      });

    // Combine and sort all articles by date
    const combinedArticles = [...auctionArticles, ...provinceArticles].sort((a, b) => b.date.getTime() - a.date.getTime());

    const allArticles = combinedArticles.map(article => {
      const img = getImageForPropertyType(article.propertyType, article.slug);
      return { ...article, imageUrl: img };
    });

    return { allArticles };
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      {allArticles.length > 0 && (
        <link rel="preload" as="image" href={allArticles[0].imageUrl} />
      )}
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
            Análisis profesional de subastas
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {allArticles.map((article, index) => {
            const isPriority = index === 0;
            if (article.id.startsWith('auction-')) {
              return (
                <div key={`featured-${article.id}`}>
                  <DiscoverSingleAuctionArticle 
                    auction={AUCTIONS[article.id.replace('auction-', '') as keyof typeof AUCTIONS]} 
                    slug={article.id.replace('auction-', '')} 
                    article={article.editorialData}
                    imageUrl={article.imageUrl}
                    isPriority={isPriority}
                  />
                </div>
              );
            } else {
              return (
                <Link to={article.url} key={article.id} className="block group">
                  <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group-hover:shadow-md transition-all flex flex-col md:flex-row relative">
                    <div className="md:w-2/5 shrink-0 block relative overflow-hidden">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        width="1200"
                        height="675"
                        loading={isPriority ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={isPriority ? "high" : "auto"}
                      />
                      <div className={`absolute top-4 left-4 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg ${article.tagColor}`}>
                        {article.tag}
                      </div>
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                        <Calendar size={16} />
                        <time dateTime={article.date.toISOString()}>
                          {article.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </time>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-brand-600 transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-slate-600 mb-6 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div 
                        className="inline-flex items-center gap-2 font-bold transition-colors mt-auto text-brand-600 group-hover:text-brand-800"
                      >
                        Leer artículo <ChevronRight size={18} />
                      </div>
                    </div>
                  </article>
                </Link>
              );
            }
          })}
        </div>
        
        {/* Cross-linking to Discover Reports */}
        <section className="mt-16 mb-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 bg-brand-600 h-full"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-widest mb-3">
                <BookOpen size={14} />
                <span>Lecturas Recomendadas</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
                Análisis en Profundidad
              </h3>
              <p className="text-slate-600 mt-2 max-w-xl">
                Descubre nuestros reportajes exclusivos sobre estrategias de inversión, rentabilidad y análisis del mercado de subastas.
              </p>
            </div>
            <Link 
              to={ROUTES.REPORTS_INDEX} className="shrink-0 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              Ver todos los reportajes <ChevronRight size={18} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(DISCOVER_REPORTS).slice(0, 3).map(([slug, report]) => (
              <Link to={ROUTES.DISCOVER_REPORT.replace(':slug', slug)} key={`crosslink-${report.id}`} className="block group">
                <article className="flex flex-col h-full">
                  <div className="relative overflow-hidden rounded-xl aspect-video mb-4">
                    <img 
                      src={report.image} 
                      alt={report.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {report.title}
                  </h4>
                  <p className="text-slate-600 text-sm line-clamp-2">
                    {report.intro}
                  </p>
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

export default DiscoverArticlesIndex;
