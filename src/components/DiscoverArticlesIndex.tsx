import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { Calendar, ChevronRight, MapPin } from 'lucide-react';
import { isAuctionFinished } from '../utils/auctionHelpers';
import { normalizeProvince, normalizePropertyType } from '../utils/auctionNormalizer';
import { getImageForPropertyType } from '../constants/auctionImages';
import TelegramCTA from './TelegramCTA';
import DiscoverSingleAuctionArticle from './DiscoverSingleAuctionArticle';

const DiscoverArticlesIndex: React.FC = () => {
  useEffect(() => {
    document.title = "Últimas noticias y análisis de subastas en España | Activos Off-Market";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Análisis de mercado, oportunidades de inversión y últimas horas sobre subastas judiciales y administrativas por provincia en España.');
    }
  }, []);

  const { auctionArticles, provinceArticles } = useMemo(() => {
    // 1. Get unique provinces with active auctions
    const activeAuctions = Object.values(AUCTIONS).filter(a => !isAuctionFinished(a.auctionDate));
    const provincesMap = new Map<string, { count: number, maxDiscount: number, latestPublished: Date, latestChecked: Date }>();
    
    activeAuctions.forEach(a => {
      const p = normalizeProvince(a.province || a.city);
      if (!p) return;
      
      const publishedAt = a.publishedAt ? new Date(a.publishedAt) : new Date();
      const lastCheckedAt = a.lastCheckedAt ? new Date(a.lastCheckedAt) : new Date();

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

    // 2. For each province, generate variants based on volume
    Array.from(provincesMap.entries()).forEach(([province, stats], pIndex) => {
      const slugBase = province.toLowerCase().replace(/\s+/g, '-');
      const provinceSeed = province.length;
      
      // 1. Siempre generamos la variante "Oportunidad" (para < 5 subastas)
      const dateOpp = new Date();
      dateOpp.setDate(dateOpp.getDate() - dayOffset);
      
      const oppTitles = [
        `Ojo a estas subastas en ${province}: hay descuentos poco habituales`,
        `Este inmueble en ${province} podría venderse muy por debajo de su valor`,
        `Lo que está pasando con estas subastas en ${province} no es normal`,
        `Detectada oportunidad en ${province} con un ${stats.maxDiscount}% de descuento`
      ];
      const oppTitle = oppTitles[provinceSeed % oppTitles.length].substring(0, 90);

      provinceArticles.push({
        id: `${slugBase}-opportunity`,
        url: `/noticias-subastas/provincia/${slugBase}/oportunidades`,
        title: oppTitle,
        excerpt: `El mercado de subastas en ${province} acaba de actualizarse. Se han seleccionado ${stats.count} oportunidades activas hoy con grandes descuentos.`,
        date: stats.latestPublished,
        lastChecked: stats.latestChecked,
        imageUrl: getImageForPropertyType('default', province, pIndex * 3 + 0),
        tag: 'Oportunidad',
        tagColor: 'bg-brand-600'
      });

      // 2. Si hay >= 5 subastas, añadimos la variante "Urgencia"
      if (stats.count >= 5) {
        const urgTitles = [
          `Cierre inminente en ${province}: ${stats.count} subastas clave (-${stats.maxDiscount}% de ahorro)`,
          `Si buscas en ${province}, estas ${stats.count} subastas (-${stats.maxDiscount}%) están a punto de desaparecer`,
          `Última ventana en ${province}: ${stats.count} subastas clave cierran hoy`
        ];
        provinceArticles.push({
          id: `${slugBase}-urgency`,
          url: `/noticias-subastas/provincia/${slugBase}/hoy`,
          title: urgTitles[provinceSeed % urgTitles.length].substring(0, 90),
          excerpt: `El tiempo es clave en las subastas judiciales. Hoy tenemos ${stats.count} expedientes activos en la provincia de ${province}. Revisa estas oportunidades antes de que finalice el plazo.`,
          date: stats.latestPublished,
          lastChecked: stats.latestChecked,
          imageUrl: getImageForPropertyType('default', province, pIndex * 3 + 1),
          tag: 'Última hora',
          tagColor: 'bg-red-600'
        });
      }

      // 3. Si hay > 10 subastas, añadimos la variante "Análisis"
      if (stats.count > 10) {
        const anaTitles = [
          `Algo está pasando en las subastas de ${province} (${stats.count} oportunidades detectadas)`,
          `Se disparan las subastas en ${province}: varias viviendas (-${stats.maxDiscount}%) muy por debajo de mercado`,
          `Análisis de ${stats.count} subastas en ${province}: ¿dónde está el margen real?`
        ];
        provinceArticles.push({
          id: `${slugBase}-analysis`,
          url: `/noticias-subastas/provincia/${slugBase}/donde-invertir`,
          title: anaTitles[provinceSeed % anaTitles.length].substring(0, 90),
          excerpt: `¿Buscando rentabilidad en ${province}? Analizamos el estado actual de las subastas públicas en la región. Con ${stats.count} activos disponibles, el mercado ofrece opciones estratégicas.`,
          date: stats.latestPublished,
          lastChecked: stats.latestChecked,
          imageUrl: getImageForPropertyType('default', province, pIndex * 3 + 2),
          tag: 'Análisis',
          tagColor: 'bg-slate-800'
        });
      }
    });
    provinceArticles.sort((a, b) => b.date.getTime() - a.date.getTime());

    // 3. Add individual auction articles (Top 5 by discount)
    const activeAuctionEntries = Object.entries(AUCTIONS).filter(([_, a]) => !isAuctionFinished(a.auctionDate));
    
    const topIndividualAuctions = activeAuctionEntries
      .map(([slug, data]) => {
        const valorReferencia = data.valorTasacion || data.valorSubasta || data.appraisalValue;
        const cantidadReclamada = data.claimedDebt;
        const discount = (valorReferencia && cantidadReclamada !== undefined && cantidadReclamada !== null && valorReferencia > cantidadReclamada) 
          ? Math.round(((valorReferencia - cantidadReclamada) / valorReferencia) * 100)
          : 0;
        return { slug, data, discount };
      })
      .filter(a => a.discount > 30 && a.discount < 85)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 5);

    const auctionArticles = activeAuctionEntries
      .map(([slug, data]) => {
        const valorReferencia = data.valorTasacion || data.valorSubasta || data.appraisalValue;
        const cantidadReclamada = data.claimedDebt;
        const discount = (valorReferencia && cantidadReclamada !== undefined && cantidadReclamada !== null && valorReferencia > cantidadReclamada) 
          ? Math.round(((valorReferencia - cantidadReclamada) / valorReferencia) * 100)
          : 0;
        return { slug, data, discount };
      })
      .filter(a => a.discount > 30 && a.discount < 85)
      .sort((a, b) => {
        // Sort by date (latest first), with a slight boost for high discount
        const dateA = a.data.publishedAt ? new Date(a.data.publishedAt).getTime() : 0;
        const dateB = b.data.publishedAt ? new Date(b.data.publishedAt).getTime() : 0;
        return dateB - dateA + (b.discount - a.discount) * 1000 * 60 * 60 * 24; // 1 day boost per 1% discount
      })
      .slice(0, 5)
      .map((item, index) => {
        const date = item.data.publishedAt ? new Date(item.data.publishedAt) : new Date();
        const lastChecked = item.data.lastCheckedAt ? new Date(item.data.lastCheckedAt) : new Date();
        
        const type = normalizePropertyType(item.data.propertyType).toLowerCase();
        const location = item.data.city || item.data.province;
        
        const titles = [
          `Un ${item.data.propertyType} en ${location} sale a subasta con un -${item.discount}%... y hay un detalle clave`,
          `Oportunidad: ${normalizePropertyType(item.data.propertyType)} en ${location} con deuda reducida`,
          `Análisis técnico: ¿Merece la pena pujar por este ${type} en ${location}?`,
          `Lo que oculta la subasta de este ${type} en ${location}: precio vs valor real`
        ];
        const title = titles[item.slug.length % titles.length].substring(0, 90);

        return {
          id: `auction-${item.slug}`,
          url: `/noticias-subastas/analisis/${item.slug}`,
          title: title,
          excerpt: `Analizamos en profundidad la subasta de este ${type} en ${location}. Con un valor de tasación de ${Math.round((item.data.valorTasacion || item.data.appraisalValue || 0) / 1000)}k€, el margen es notable.`,
          date: date,
          lastChecked: lastChecked,
          imageUrl: getImageForPropertyType(item.data.propertyType, item.slug, index),
          tag: 'Análisis Activo',
          tagColor: 'bg-emerald-600'
        };
      });

    // Combine and sort all articles by date
    const allArticles = [...auctionArticles, ...provinceArticles].sort((a, b) => b.date.getTime() - a.date.getTime());

    return { auctionArticles: allArticles.filter(a => a.id.startsWith('auction-')), provinceArticles: allArticles.filter(a => !a.id.startsWith('auction-')) };
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
            Análisis profesional de subastas
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Featured Auctions */}
          {auctionArticles.map((article, index) => (
            <div key={`featured-${article.id}`}>
              <DiscoverSingleAuctionArticle 
                auction={AUCTIONS[article.id.replace('auction-', '') as keyof typeof AUCTIONS]} 
                slug={article.id.replace('auction-', '')} 
                index={index}
              />
            </div>
          ))}

          {provinceArticles.map((article) => {
            return (
            <Link to={article.url} key={article.id} className="block group">
              <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group-hover:shadow-md transition-all flex flex-col md:flex-row relative">
                <div className="md:w-2/5 shrink-0 block relative overflow-hidden">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
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
          })}
        </div>
        <TelegramCTA variant="banner" />
      </div>
    </div>
  );
};

export default DiscoverArticlesIndex;
