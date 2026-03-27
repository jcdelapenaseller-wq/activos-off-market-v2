import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, ChevronRight, Percent, Calculator } from 'lucide-react';
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
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ slug, data, showNewBadge }) => {
  const id = slug;
  const valorReferencia = data.valorTasacion || data.valorSubasta || data.appraisalValue;
  const cantidadReclamada = data.claimedDebt;

  const computedStatus = getComputedStatus(data);
  const isFinished = computedStatus === 'closed';
  const isSuspended = computedStatus === 'suspended';
  const isUpcoming = computedStatus === 'upcoming';
  const isActive = computedStatus === 'active';
  
  const pricePerM2 = data.pricePerM2 || (data.surface && valorReferencia ? Math.round(valorReferencia / data.surface) : null);

  const city = normalizeCity(data) || '';
  const province = normalizeProvince(data.province || data.city);

  // Badges Logic
  const oppRatio = data.opportunityRatio || 0;
  
  // 1. "Recién publicada": publishedAt < 48h
  const isRecienPublicada = data.publishedAt ? (new Date().getTime() - new Date(data.publishedAt).getTime()) < (48 * 60 * 60 * 1000) : false;
  
  const isCapitalCity = isCapital(data);
  const discount = calculateDiscount(data.valorTasacion, data.valorSubasta, data.claimedDebt);
  
  // Urgency: closing in less than 3 days
  const isClosingSoon = data.auctionDate ? (new Date(data.auctionDate).getTime() - new Date().getTime()) < (3 * 24 * 60 * 60 * 1000) && (new Date(data.auctionDate).getTime() - new Date().getTime()) > 0 : false;

  const isConflict = isConflictZone(data);
  const isTopLocation = isCapitalCity;

  // New Dynamic Opportunity Badge
  const getOpportunityBadge = () => {
    if (oppRatio >= 0.50) return { label: "🔥 Top Oportunidad", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (oppRatio >= 0.21) return { label: "⭐ Buena oportunidad", color: "text-amber-700 bg-amber-50 border-amber-200" };
    if (oppRatio >= 0.20) return { label: "🧐 Interesante", color: "text-blue-700 bg-blue-50 border-blue-200" };
    return null;
  };
  const oppBadge = getOpportunityBadge();

  // Secondary Badge (Left) - Priority: Conflict > Analysis > New
  const getSecondaryBadge = () => {
    if (isConflict) return { label: "⚠️ Revisar zona", color: "text-rose-700 bg-rose-50 border-rose-200" };
    if (discount === null) return { label: "🔍 Análisis requerido", color: "text-slate-500 bg-slate-50 border-slate-200" };
    if (isRecienPublicada) return { label: "✨ Recién publicada", color: "text-brand-700 bg-brand-50 border-brand-200" };
    return null;
  };
  const secondaryBadge = getSecondaryBadge();

  const getDiscountColor = (d: number) => {
    if (d >= 70) return "text-rose-700 bg-rose-50 border-rose-200";
    if (d >= 50) return "text-amber-700 bg-amber-50 border-amber-200";
    if (d >= 30) return "text-blue-700 bg-blue-50 border-blue-200";
    return "text-slate-700 bg-slate-50 border-slate-200";
  };

  const locationLabel = normalizeLocationLabel(data);
  const imageUrl = getImageForPropertyType(data.propertyType, slug);

  return (
    <div 
      onMouseEnter={() => prefetchAuction(slug)}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative group ${isFinished ? 'opacity-70 grayscale-[0.3]' : ''}`}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img 
          src={imageUrl} 
          alt={`${normalizePropertyType(data.propertyType)} en ${city}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
      </div>

      {/* Absolute Badges Container */}
      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start gap-2">
        {/* Left: Commercial Badges (Max 2) */}
        <div className="flex flex-col items-start gap-1.5">
          {oppBadge && (
            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border shadow-sm ${oppBadge.color}`}>
              {oppBadge.label}
            </span>
          )}
          
          {secondaryBadge && (
            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border shadow-sm ${secondaryBadge.color}`}>
              {secondaryBadge.label}
            </span>
          )}
        </div>

        {/* Right: Status + FOMO (Max 2) */}
        <div className="flex flex-col items-end gap-1.5">
          {isClosingSoon && !isFinished ? (
            <span className="inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border text-rose-700 bg-rose-50 border-rose-200 shadow-sm animate-pulse">
              ⏳ Termina pronto
            </span>
          ) : isTopLocation ? (
            <span className="inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border text-violet-700 bg-violet-50 border-violet-200 shadow-sm">
              📍 Ubicación Top
            </span>
          ) : null}

          <div className="flex flex-col items-end">
            {isFinished ? (
              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border border-slate-300 shadow-sm">
                Finalizada
              </span>
            ) : isSuspended ? (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border border-amber-200 shadow-sm">
                Pausada
              </span>
            ) : isUpcoming ? (
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border border-blue-200 shadow-sm">
                Próxima apertura
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border border-emerald-200 shadow-sm">
                En curso
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <Link 
          to={`/subasta/${id}`} 
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-4"
        >
          <h2 className="text-lg font-bold text-slate-900 leading-tight hover:text-brand-600 transition-colors line-clamp-2">
            {normalizePropertyType(data.propertyType)} en {data.address?.split(',')[0] || normalizeLocationLabel(data).split(',')[0]}
          </h2>
          {isUpcoming && (
            <div className="mt-2 text-[11px] font-medium text-blue-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Disponible próximamente
            </div>
          )}
        </Link>

        <div className="space-y-2.5 mb-6 flex-grow">
          <div className="flex items-start gap-2 text-slate-600 text-sm">
            <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
            <span className="font-medium leading-snug">
              {normalizeLocationLabel(data)}
            </span>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-3">
            {valorReferencia && (
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-slate-500">Tasación:</span>
                <span className="font-bold text-slate-900">{valorReferencia.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}</span>
              </div>
            )}

            {cantidadReclamada !== undefined && cantidadReclamada !== null && (
              <div className={`flex justify-between items-center text-sm ${pricePerM2 ? 'mb-1' : ''}`}>
                <span className="text-slate-500">Deuda:</span>
                <span className="font-bold text-rose-700/90">{cantidadReclamada.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}</span>
              </div>
            )}

            {pricePerM2 ? (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Precio m²:</span>
                <span className="font-bold text-slate-700">💸 {pricePerM2.toLocaleString('es-ES')} €/m²</span>
              </div>
            ) : null}

            <Link 
              to={`${ROUTES.CALCULATOR}?tasacion=${valorReferencia || 0}&precio=${cantidadReclamada || 0}&ccaa=${province}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                trackConversion(province, 'listing', 'calculator_from_card_click', { precio: cantidadReclamada || 0 });
              }}
              className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-center gap-1.5 text-[11px] font-bold text-brand-600 hover:text-brand-700 transition-colors group/calc"
            >
              <Calculator size={14} className="group-hover/calc:scale-110 transition-transform" />
              Calcular puja máxima
            </Link>
          </div>
        </div>

        <div className="mt-auto pt-2">
          {isActive && !isFinished && !isSuspended && !isUpcoming && (
            <div className="text-center mb-2">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Disponible ahora</span>
            </div>
          )}
          <Link 
            to={`/subasta/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full inline-flex items-center justify-center font-bold py-3.5 px-6 rounded-xl transition-all group ${isFinished ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : isSuspended ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow-md hover:-translate-y-0.5'}`}
          >
            {isFinished ? 'Ver resultado' : isSuspended ? 'Ver detalles' : 'Ver oportunidad'}
            <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

