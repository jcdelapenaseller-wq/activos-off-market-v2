import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Percent, ArrowRight, Calculator, ExternalLink } from 'lucide-react';
import { AuctionData } from '../data/auctions';
import { isAuctionFinished, formatDate, calculateDiscount } from '../utils/auctionHelpers';
import { normalizePropertyType, normalizeLocationLabel } from '../utils/auctionNormalizer';

interface AuctionCardProps {
  slug: string;
  data: AuctionData;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ slug, data }) => {
  const tasacion = data.valorTasacion || data.appraisalValue;
  const subasta = data.valorSubasta;
  const discount = (tasacion && subasta && tasacion > subasta) ? Math.round(((tasacion - subasta) / tasacion) * 100) : null;
  
  const deuda = (typeof data.claimedDebt === 'number' && data.claimedDebt > 0) ? data.claimedDebt : null;

  // Título: Tipo + Calle corta (limpiando basura del BOE)
  const cleanAddress = data.address?.split(',')[0].split(' Nº')[0].split(' NÚMERO')[0] || 'Ubicación no disponible';
  const title = `${normalizePropertyType(data.propertyType)} en ${cleanAddress}`;

  const locationLabel = normalizeLocationLabel(data);
  const isFinished = isAuctionFinished(data.auctionDate);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative group">
      {/* 1. Badge & 2. Referencia BOE */}
      <div className="p-6 pb-0 flex justify-between items-start gap-4">
        <span className={`${discount !== null && discount >= 30 ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-700'} text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-black/5`}>
          {discount !== null && discount > 0 ? `Oportunidad ${discount}%` : "Oportunidad detectada"}
        </span>
        {data.boeId && (
          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
            {data.boeId}
          </span>
        )}
      </div>

      <div className="p-6 flex-grow flex flex-col">
        {/* 3. Título */}
        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-brand-600 transition-colors">
          {title}
        </h3>

        {/* 4. Ubicación */}
        <div className="flex items-center gap-1.5 text-slate-500 mb-6">
          <MapPin size={14} className="text-brand-500 shrink-0" />
          <span className="text-sm font-medium truncate">{locationLabel}</span>
        </div>
        
        <div className="space-y-4 mb-8">
          {/* 5. Valor */}
          {(tasacion || subasta) && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Valor tasación</span>
              <span className="text-2xl font-black text-slate-900">
                {(tasacion || subasta || 0).toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* 6. Deuda */}
            {deuda && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-0.5">Deuda</span>
                <span className="text-sm font-bold text-red-600">
                  {deuda.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}
                </span>
              </div>
            )}

            {/* 7. Descuento potencial */}
            {discount !== null && discount > 0 && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-0.5">Descuento</span>
                <span className="text-sm font-bold text-emerald-600">
                  -{discount}% s/tasación
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 8. CTAs */}
        <div className="mt-auto space-y-3">
          <Link 
            to={`/ejemplo-subasta/${slug}`}
            className="w-full inline-flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl bg-slate-900 text-white hover:bg-brand-600 transition-all shadow-lg active:scale-[0.98]"
          >
            Ver detalles <ArrowRight size={18} />
          </Link>
          <Link 
            to="/calculadora-subastas"
            className="w-full inline-flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all text-sm"
          >
            <Calculator size={16} /> Calcular puja máxima
          </Link>
        </div>
      </div>

      {/* 9. Urgencia */}
      {data.auctionDate && !isFinished && (
        <div className="bg-brand-50 border-t border-brand-100 px-6 py-3 flex items-center justify-center gap-2">
          <Calendar size={14} className="text-brand-600" />
          <span className="text-xs font-bold text-brand-700">
            Solo hasta el {formatDate(data.auctionDate)}
          </span>
        </div>
      )}
    </div>
  );
};
