import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, ChevronRight, Percent, Calculator } from 'lucide-react';
import { AuctionData } from '../data/auctions';
import { isAuctionFinished, getComputedStatus, isConflictZone } from '../utils/auctionHelpers';
import { normalizeLocationLabel, normalizePropertyType, normalizeCity, normalizeProvince } from '../utils/auctionNormalizer';
import { ROUTES } from '../constants/routes';
import { trackConversion } from '../utils/tracking';

interface AuctionCardProps {
  slug: string;
  data: AuctionData;
  showNewBadge?: boolean;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ slug, data, showNewBadge }) => {
  const id = slug;
  const valorReferencia = data.valorTasacion || data.valorSubasta || data.appraisalValue;
  const cantidadReclamada = data.claimedDebt;
  
  // Ratio de Oportunidad
  const opportunityRatio = (valorReferencia && cantidadReclamada !== undefined && cantidadReclamada !== null) 
    ? Math.round(((valorReferencia - cantidadReclamada) / valorReferencia) * 100) 
    : null;

  const computedStatus = getComputedStatus(data);
  const isFinished = computedStatus === 'closed';
  const isSuspended = computedStatus === 'suspended';
  const isUpcoming = computedStatus === 'upcoming';
  const isActive = computedStatus === 'active';
  
  const pricePerM2 = data.pricePerM2 || (data.surface && valorReferencia ? Math.round(valorReferencia / data.surface) : null);

  const city = normalizeCity(data);
  const province = normalizeProvince(data.province || data.city);
  const isCityCapital = city && city !== 'España' && city.toLowerCase() === province.toLowerCase();
  const hasConflict = isConflictZone(data);

  // Ranking visual (Absoluto para no añadir complejidad a los listados)
  let rankingLabel = null;
  let rankingColor = "";
  if (!isFinished && !isSuspended && !isUpcoming) {
    if (hasConflict) {
      rankingLabel = "⚠️ Zona a analizar";
      rankingColor = "bg-rose-50 text-rose-700 border-rose-200";
    } else if (opportunityRatio !== null) {
      if (cantidadReclamada === 0) {
        // Already handled in the main badge
      } else if (opportunityRatio > 85) {
        // Already handled in the main badge
      } else if (opportunityRatio >= 50) {
        rankingLabel = "🥇 Top oportunidad";
        rankingColor = "bg-amber-100 text-amber-800 border-amber-300";
      } else if (opportunityRatio >= 40) {
        rankingLabel = "🥈 Muy interesante";
        rankingColor = "bg-slate-100 text-slate-700 border-slate-300";
      } else if (opportunityRatio >= 30) {
        rankingLabel = "🥉 A seguir";
        rankingColor = "bg-orange-50 text-orange-800 border-orange-200";
      }
    }
  }

  // Formateo de Fecha y FOMO
  const auctionDate = data.auctionDate ? new Date(data.auctionDate) : null;
  const now = new Date();
  
  const diffMs = auctionDate ? auctionDate.getTime() - now.getTime() : null;
  const diffDays = diffMs !== null ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : null;
  const diffHours = diffMs !== null ? Math.ceil(diffMs / (1000 * 60 * 60)) : null;
  
  let fomoLabel = "";
  let fomoColor = "text-slate-500";

  if (isFinished) {
    fomoLabel = "⌛ Finalizada";
    fomoColor = "text-slate-400 bg-slate-100 border-slate-200";
  } else if (isSuspended) {
    fomoLabel = "⏸️ Pausada";
    fomoColor = "text-amber-700 bg-amber-50 border-amber-200";
  } else if (isUpcoming) {
    fomoLabel = "📅 Próxima apertura";
    fomoColor = "text-blue-700 bg-blue-50 border-blue-200";
  } else if (diffHours !== null && diffHours > 0 && diffHours <= 24) {
    fomoLabel = "🚨 Cierra en horas";
    fomoColor = "text-red-700 bg-red-50 border-red-200";
  } else if (diffDays !== null && diffDays > 0 && diffDays <= 5) {
    fomoLabel = `⏳ Cierra en ${diffDays} días`;
    fomoColor = "text-amber-700 bg-amber-50 border-amber-200";
  } else if (showNewBadge !== undefined ? showNewBadge : data.isNew) {
    fomoLabel = "✨ Recién publicada";
    fomoColor = "text-brand-700 bg-brand-50 border-brand-200";
  } else if (opportunityRatio !== null && opportunityRatio >= 35 && isCityCapital) {
    fomoLabel = "🔥 Alta oportunidad";
    fomoColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  } else {
    fomoLabel = "";
    fomoColor = "";
  }

  const locationLabel = normalizeLocationLabel(data);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative ${isFinished ? 'opacity-70 grayscale-[0.3]' : ''}`}>
      <div className="p-5 flex-grow flex flex-col">
        {/* Top Badges Row: Commercial (Left) vs Status (Right) */}
        <div className="flex justify-between items-start mb-4 gap-2">
          {/* Left: Commercial Badges */}
          <div className="flex flex-col gap-2">
            {isCityCapital ? (
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider border border-indigo-200 w-fit flex items-center gap-1">
                👉 Ubicación Top
              </span>
            ) : cantidadReclamada === 0 ? (
              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider border border-slate-200 w-fit">
                Sin cargas declaradas
              </span>
            ) : (opportunityRatio !== null && opportunityRatio <= 80) ? (
              opportunityRatio > 40 ? (
                <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit">
                  🔥 -{opportunityRatio}% DTO
                </span>
              ) : opportunityRatio >= 15 ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider border border-emerald-200 w-fit">
                  -{opportunityRatio}% DTO
                </span>
              ) : null
            ) : (cantidadReclamada === undefined || cantidadReclamada === null) && valorReferencia ? (
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider border border-slate-200 w-fit">
                Análisis requerido
              </span>
            ) : null}

            {rankingLabel && (!isCityCapital || hasConflict) && (
              <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1.5 rounded-md border ${rankingColor} w-fit`}>
                {rankingLabel}
              </span>
            )}
          </div>

          {/* Right: Status & FOMO */}
          <div className="flex flex-col items-end gap-2">
            {isFinished ? (
              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-full uppercase tracking-widest border border-slate-300">
                Finalizada
              </span>
            ) : isSuspended ? (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1.5 rounded-full uppercase tracking-widest border border-amber-200">
                Pausada
              </span>
            ) : isUpcoming ? (
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1.5 rounded-full uppercase tracking-widest border border-blue-200">
                Próxima apertura
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-full uppercase tracking-widest border border-emerald-200">
                En curso
              </span>
            )}

            {fomoLabel && !isFinished && !isSuspended && !isUpcoming && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${fomoColor} whitespace-nowrap`}>
                {fomoLabel}
              </span>
            )}
          </div>
        </div>

        <Link to={`/subasta/${id}`} className="block mb-4">
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

