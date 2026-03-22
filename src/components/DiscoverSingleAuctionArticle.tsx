import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import { AuctionData } from '../data/auctions';
import { EditorialArticle } from '../utils/editorialGenerator';

interface Props {
  auction: AuctionData;
  slug: string;
  article: EditorialArticle;
  imageUrl: string;
  isPriority?: boolean;
}

const DiscoverSingleAuctionArticle: React.FC<Props> = ({ auction, slug, article, imageUrl, isPriority = false }) => {
  const formattedDate = article.dateModified.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Link to={`/noticias-subastas/analisis/${slug}`} className="block group h-full">
      <article className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full flex flex-col group-hover:shadow-md transition-all">
        <div className="relative overflow-hidden rounded-2xl mb-6 shrink-0">
          <img 
            src={imageUrl} 
            alt={`${auction.propertyType} en ${auction.city}`} 
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            width="1200"
            height="675"
            loading={isPriority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={isPriority ? "high" : "auto"}
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-lg text-white ${article.tagColor}`}>
              {article.tag}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
          <span className="font-bold text-brand-600 uppercase tracking-widest">Noticia</span>
          <span>•</span>
          <time dateTime={article.dateModified.toISOString()}>{formattedDate}</time>
        </div>

        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4 group-hover:text-brand-600 transition-colors line-clamp-2">
          {article.title}
        </h2>

        <div className="prose prose-slate max-w-none mb-6 text-sm line-clamp-3 text-slate-600">
          <p>{article.excerpt}</p>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ShieldCheck size={16} />
            </div>
            <span className="text-xs font-bold text-slate-700">Análisis Editorial</span>
          </div>
          <div className="text-brand-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Leer noticia <ChevronRight size={16} />
          </div>
        </div>
      </article>
    </Link>
  );
};

export default DiscoverSingleAuctionArticle;
