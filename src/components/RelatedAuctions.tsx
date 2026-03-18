import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AUCTIONS, AuctionData } from '../data/auctions';
import { MapPin } from 'lucide-react';
import { isAuctionFinished, sortActiveFirst } from '../utils/auctionHelpers';

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

    const sorted = sortActiveFirst(matches, (item) => item[1].auctionDate);
    return sorted.slice(0, 4);
  }, [currentAuctionSlug, currentAuctionData]);

  if (relatedAuctions.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Otras subastas interesantes en esta zona</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {relatedAuctions.map(([slug, data]) => {
          const isFinished = isAuctionFinished(data.auctionDate);
          return (
          <Link 
            key={slug} 
            to={`/subasta/${slug}`}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-brand-300 transition-all group relative"
          >
            {isFinished && (
              <div className="absolute top-2 right-2 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border border-white/20 shadow-sm">
                Adjudicada
              </div>
            )}
            <h3 className={`font-bold transition-colors ${isFinished ? 'text-slate-500 group-hover:text-slate-600' : 'text-slate-900 group-hover:text-brand-600'}`}>
              {data.propertyType} en {data.zone || data.city}
            </h3>
            <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
              <MapPin size={14} />
              <span>{data.city}</span>
            </div>
          </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedAuctions;
