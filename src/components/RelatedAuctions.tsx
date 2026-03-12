import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AUCTIONS, AuctionData } from '../data/auctions';
import { MapPin } from 'lucide-react';

interface RelatedAuctionsProps {
  currentAuctionSlug: string;
  currentAuctionData: AuctionData;
}

const RelatedAuctions: React.FC<RelatedAuctionsProps> = ({ currentAuctionSlug, currentAuctionData }) => {
  const relatedAuctions = useMemo(() => {
    return Object.entries(AUCTIONS)
      .filter(([slug, data]) => {
        if (slug === currentAuctionSlug) return false;
        return data.city === currentAuctionData.city || data.propertyType === currentAuctionData.propertyType;
      })
      .slice(0, 4);
  }, [currentAuctionSlug, currentAuctionData]);

  if (relatedAuctions.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Otras subastas interesantes en esta zona</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {relatedAuctions.map(([slug, data]) => (
          <Link 
            key={slug} 
            to={`/ejemplo-subasta/${slug}`}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-brand-300 transition-all group"
          >
            <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
              {data.propertyType} en {data.zone || data.city}
            </h3>
            <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
              <MapPin size={14} />
              <span>{data.city}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedAuctions;
