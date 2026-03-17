import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Percent, ArrowRight } from 'lucide-react';
import { AuctionData } from '../data/auctions';
import { isAuctionFinished, formatDate, calculateDiscount, formatPublishedDate, getOpportunityThreshold } from '../utils/auctionHelpers';
import { normalizePropertyType, normalizeCity, normalizeLocationLabel } from '../utils/auctionNormalizer';
import { AUCTIONS } from '../data/auctions';

interface AuctionCardProps {
  slug: string;
  data: AuctionData;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ slug, data }) => {
  const tasacion = data.valorTasacion || data.appraisalValue;
  const subasta = data.valorSubasta;
  const discount = (tasacion && subasta && tasacion > subasta) ? Math.round(((tasacion - subasta) / tasacion) * 100) : null;
  
  const deuda = (typeof data.claimedDebt === 'number') ? data.claimedDebt : null;

  // Título: Tipo + Calle (usamos propertyType como base, intentando limpiar)
  const title = `${normalizePropertyType(data.propertyType)} en ${data.address?.split(',')[0] || 'ubicación'}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative">
      <div className="p-6 flex-grow">
        {/* 1. Badge */}
        <div className="mb-4">
          <span className={`${discount !== null && discount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
            {discount !== null && discount > 0 ? `Oportunidad ${discount}%` : "Oportunidad detectada"}
          </span>
        </div>

        {/* 2. Título */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
          {title}
        </h3>

        {/* 3. Ubicación */}
        <p className="text-sm text-slate-500 mb-4">
          {normalizeLocationLabel(data)}
        </p>
        
        {/* 4 & 5. Tasación y Deuda */}
        <div className="space-y-2 mb-6">
          {tasacion && (
            <div className="text-sm text-slate-600">
              Tasación: <span className="font-bold text-slate-900">{tasacion.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}</span>
            </div>
          )}

          {deuda && (
            <div className="text-sm text-red-600">
              Deuda: <span className="font-bold">{deuda.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}</span>
            </div>
          )}
        </div>
      </div>

      {/* 6. CTA */}
      <div className="px-6 pb-6 mt-auto">
        <Link 
          to={`/ejemplo-subasta/${slug}`}
          className="w-full inline-flex items-center justify-center font-bold py-3 px-6 rounded-xl bg-slate-900 text-white hover:bg-brand-600 transition-colors"
        >
          Ver Oportunidad
        </Link>
      </div>
    </div>
  );
};
