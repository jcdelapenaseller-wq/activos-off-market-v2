import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, ChevronRight, Percent, Calculator, Building2 } from 'lucide-react';
import { AuctionData } from '../data/auctions';
import { isAuctionFinished, getComputedStatus, isCapital, calculateDiscount, isConflictZone } from '../utils/auctionHelpers';
import { normalizeLocationLabel, normalizePropertyType, normalizeCity, normalizeProvince } from '../utils/auctionNormalizer';
import { ROUTES } from '../constants/routes';
import { trackConversion } from '../utils/tracking';
import { prefetchAuction } from '../utils/prefetch';

import { getImageForPropertyType } from '../constants/auctionImages';

interface AuctionCardProps {
  slug: string;
  data: AuctionData;
  showNewBadge?: boolean;
  showImage?: boolean;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ slug, data, showNewBadge, showImage = true }) => {
  console.log(`Rendering AuctionCard for slug: ${slug}`, data);
  const navigate = useNavigate();
  const id = slug;
  const valorReferencia = data.valorTasacion || data.valorSubasta || data.appraisalValue || 0;
  const cantidadReclamada = data.claimedDebt || 0;

  const computedStatus = getComputedStatus(data);
  const isFinished = computedStatus === 'closed';
  const isSuspended = computedStatus === 'suspended';
  const isUpcoming = computedStatus === 'upcoming';
  const isActive = computedStatus === 'active';
  
  const locationLabel = normalizeLocationLabel(data);
  const imageUrl = getImageForPropertyType(data.propertyType, slug);

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative group"
      style={{ minHeight: '400px', backgroundColor: '#ffffff', color: '#0f172a' }}
    >
      {/* Image Container */}
      {showImage && (
        <div className="relative h-48 overflow-hidden bg-slate-100">
          <img 
            src={imageUrl} 
            alt={normalizePropertyType(data.propertyType)}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/auction/800/600';
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 leading-tight">
            {normalizePropertyType(data.propertyType)} en {data.city || 'Ubicación pendiente'}
          </h2>
          <p className="text-slate-600 text-sm mt-1">{data.address || 'Sin dirección'}</p>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <MapPin size={16} />
            <span>{locationLabel}</span>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-3">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-slate-500">Tasación:</span>
              <span className="font-bold text-slate-900">{valorReferencia.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Deuda:</span>
              <span className="font-bold text-rose-700">{cantidadReclamada.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <button 
            onClick={() => navigate(`/subasta/${id}`)}
            className="w-full bg-brand-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-700 transition-colors"
            style={{ backgroundColor: '#0c91e9', color: '#ffffff' }}
          >
            Ver oportunidad
          </button>
        </div>
      </div>
    </div>
  );
};

