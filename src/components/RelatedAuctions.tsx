import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AuctionData } from '../data/auctions';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { MapPin } from 'lucide-react';
import { isAuctionFinished, sortAuctions } from '../utils/auctionHelpers';

interface RelatedAuctionsProps {
  currentAuctionSlug: string;
  currentAuctionData: AuctionData;
}

const RelatedAuctions: React.FC<RelatedAuctionsProps> = ({ currentAuctionSlug, currentAuctionData }) => {
  const relatedAuctions = useMemo(() => {
    const seenSlugs = new Set([currentAuctionSlug]);
    const matches: [string, AuctionData][] = [];

    // 1. Try to find same city
    Object.entries(AUCTIONS).forEach(([slug, data]) => {
      if (!seenSlugs.has(slug) && data.city === currentAuctionData.city) {
        matches.push([slug, data]);
        seenSlugs.add(slug);
      }
    });

    // 2. If not enough, try same property type in same province
    if (matches.length < 4) {
      Object.entries(AUCTIONS).forEach(([slug, data]) => {
        if (!seenSlugs.has(slug) && 
            data.propertyType === currentAuctionData.propertyType && 
            data.province === currentAuctionData.province) {
          matches.push([slug, data]);
          seenSlugs.add(slug);
        }
      });
    }

    const sorted = sortAuctions(matches);
    return sorted.slice(0, 4);
  }, [currentAuctionSlug, currentAuctionData]);

  if (relatedAuctions.length === 0) return null;

  return (
    <section className="mb-16 md:mb-24">
      <div className="mb-12 md:mb-16 text-center md:text-left">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">Más oportunidades similares</h2>
        <p className="text-slate-500 text-xl md:text-2xl font-medium">Subastas en la zona y activos similares que podrían interesarte</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {relatedAuctions.slice(0, 3).map(([slug, data]) => {
          const isFinished = data.status === 'closed' || isAuctionFinished(data.auctionDate);
          const isSuspended = data.status === 'suspended';
          const isUpcoming = data.status === 'upcoming';
          const discount = data.appraisalValue && data.claimedDebt 
            ? Math.round((1 - (data.claimedDebt / data.appraisalValue)) * 100) 
            : 0;
          
          return (
          <Link 
            key={slug} 
            to={`/subasta/${slug}`} 
            className={`bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-brand-300 transition-all duration-300 group relative flex flex-col h-full ${isFinished ? 'opacity-70 grayscale-[0.3]' : ''}`}
          >
            <div className="absolute -top-3 -right-3 bg-brand-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md transform rotate-3 group-hover:rotate-6 transition-transform">
              Similar
            </div>
            <div className="flex justify-between items-start mb-6 gap-4">
              <div className="flex flex-col gap-1.5">
                <h3 className={`text-xl md:text-2xl font-bold transition-colors leading-tight ${isFinished ? 'text-slate-500 group-hover:text-slate-600' : 'text-slate-900 group-hover:text-brand-600'}`}>
                  {data.propertyType} en {data.zone || data.city}
                </h3>
                <div className="flex items-center gap-1.5 text-slate-500 text-base">
                  <MapPin size={18} />
                  <span>{data.city}</span>
                </div>
              </div>
              
              <div className="shrink-0 flex flex-col gap-2 items-end">
                {isFinished ? (
                  <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-300">
                    Finalizada
                  </span>
                ) : isSuspended ? (
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-amber-200">
                    Pausada
                  </span>
                ) : isUpcoming ? (
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-blue-200">
                    Próxima
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-200">
                    En curso
                  </span>
                )}
                {discount > 0 && !isFinished && (
                  <span className="bg-brand-50 text-brand-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-brand-100">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-50">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">Valor Tasación</span>
                <span className="text-2xl font-bold text-slate-900">
                  {data.appraisalValue ? data.appraisalValue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) : '---'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
            </div>
          </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedAuctions;
