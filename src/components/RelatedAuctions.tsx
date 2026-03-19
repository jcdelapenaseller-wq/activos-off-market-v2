import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AuctionData } from '../data/auctions';
import { ACTIVE_AUCTIONS as AUCTIONS } from '../data/filteredAuctions';
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
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Otras subastas interesantes en esta zona</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {relatedAuctions.map(([slug, data]) => {
          const isFinished = data.status === 'closed' || isAuctionFinished(data.auctionDate);
          const isSuspended = data.status === 'suspended';
          const isUpcoming = data.status === 'upcoming';
          
          return (
          <Link 
            key={slug} 
            to={`/subasta/${slug}`}
            className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-brand-300 transition-all group relative ${isFinished ? 'opacity-70 grayscale-[0.3]' : ''}`}
          >
            <div className="flex justify-between items-start mb-3 gap-2">
              <div className="flex flex-col gap-1">
                <h3 className={`font-bold transition-colors ${isFinished ? 'text-slate-500 group-hover:text-slate-600' : 'text-slate-900 group-hover:text-brand-600'}`}>
                  {data.propertyType} en {data.zone || data.city}
                </h3>
                <div className="flex items-center gap-1 text-slate-500 text-sm">
                  <MapPin size={14} />
                  <span>{data.city}</span>
                </div>
              </div>
              
              <div className="shrink-0">
                {isFinished ? (
                  <span className="bg-slate-200 text-slate-600 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border border-slate-300">
                    Finalizada
                  </span>
                ) : isSuspended ? (
                  <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border border-amber-200">
                    Pausada
                  </span>
                ) : isUpcoming ? (
                  <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border border-blue-200">
                    Próxima
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border border-emerald-200">
                    En curso
                  </span>
                )}
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
