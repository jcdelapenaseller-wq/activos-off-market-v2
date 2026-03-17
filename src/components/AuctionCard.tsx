import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Calculator, Clock } from 'lucide-react';
import { AuctionData } from '../data/auctions';
import { isAuctionFinished } from '../utils/auctionHelpers';
import { normalizeLocationLabel, extractEstimatedCharges, normalizeTitle } from '../utils/auctionNormalizer';

interface AuctionCardProps {
  slug: string;
  data: AuctionData;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ slug, data }) => {
  const id = slug;
  const valorReferencia = data.valorTasacion || data.valorSubasta || data.appraisalValue;
  const cantidadReclamada = data.claimedDebt;
  
  // 1. Ratio de Oportunidad
  const opportunityRatio = (valorReferencia && cantidadReclamada !== undefined) 
    ? Math.round(((valorReferencia - cantidadReclamada) / valorReferencia) * 100) 
    : null;

  const discount = data.discount || 0;
  const deuda = (typeof data.claimedDebt === 'number') ? data.claimedDebt : null;

  // 2. Formateo de Fecha (Esquina superior derecha)
  const auctionDate = data.auctionDate ? new Date(data.auctionDate) : null;
  const diffDays = auctionDate ? Math.ceil((auctionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isUrgent = diffDays !== null && diffDays >= 0 && diffDays < 5;
  
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const formattedDate = auctionDate ? `${auctionDate.getDate()} ${months[auctionDate.getMonth()]}` : 'S/F';

  // 3. Limpieza de Título (Tipo + Calle)
  let cleanType = data.propertyType || "Inmueble";
  if (cleanType.toLowerCase().includes('vivienda')) cleanType = "Vivienda";
  if (cleanType.toLowerCase().includes('piso')) cleanType = "Piso";
  if (cleanType.toLowerCase().includes('local')) cleanType = "Local";
  if (cleanType.toLowerCase().includes('garaje')) cleanType = "Garaje";
  
  const cleanAddress = data.address ? data.address.split(',')[0].trim() : "";
  let displayTitle = `${cleanType} en ${cleanAddress}`;
  
  // 4. Badge dinámico y Título atractivo
  let badgeText = "Oportunidad";
  let badgeClasses = "bg-emerald-600 text-white";
  
  if (opportunityRatio !== null) {
    badgeText = `-${opportunityRatio}% Oportunidad`;
    if (opportunityRatio >= 50) {
      badgeClasses = "bg-emerald-600 text-white shadow-emerald-200/50";
      displayTitle = `🔥 ${displayTitle}`; // Solo 🔥 si >= 50%
    } else if (opportunityRatio >= 15) {
      badgeClasses = "bg-amber-500 text-white shadow-amber-200/50";
    } else if (opportunityRatio > 0) {
      badgeClasses = "bg-slate-100 text-slate-700 border border-slate-200";
    } else {
      badgeText = "Análisis requerido";
      badgeClasses = "bg-slate-100 text-slate-500 border border-slate-200";
    }
  } else if (discount > 0) {
    badgeText = `-${discount}% Oportunidad`;
    badgeClasses = "bg-emerald-600 text-white";
  }

  const locationLabel = normalizeLocationLabel(data);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative group">
      {/* Header: Badge + Fecha */}
      <div className="p-4 pb-0 flex justify-between items-center">
        <span className={`${badgeClasses} text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider transition-all duration-300`}>
          {badgeText}
        </span>
        <span className={`text-[11px] font-bold flex items-center gap-1 ${isUrgent ? 'text-red-600' : 'text-slate-500'}`}>
          ⏳ {formattedDate}
        </span>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        {/* Título Compacto */}
        <h3 className="text-base font-bold text-slate-900 mb-1 leading-tight group-hover:text-brand-700 transition-colors line-clamp-2 min-h-[2.5rem]">
          {displayTitle}
        </h3>

        {/* Ubicación */}
        <div className="flex items-center gap-1 text-slate-400 mb-4">
          <MapPin size={12} className="shrink-0" />
          <span className="text-[11px] font-medium truncate">{locationLabel}</span>
        </div>
        
        <div className="space-y-2 mb-4">
          {/* Valor de Referencia */}
          {valorReferencia && (
            <div className="flex justify-between items-end">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Valor tasación</span>
              <span className="text-base font-bold text-brand-700">
                {valorReferencia.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}
              </span>
            </div>
          )}

          {/* Deuda Reclamada */}
          {deuda !== null && (
            <div className="flex justify-between items-end">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Deuda reclamada</span>
              <span className="text-sm font-bold text-red-600">
                {deuda === 0 ? 'Sin deuda' : deuda.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}
              </span>
            </div>
          )}

          {/* Descuento Potencial */}
          {opportunityRatio !== null && opportunityRatio > 0 && (
            <div className="flex justify-between items-end pt-1 border-t border-slate-50">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Descuento potencial</span>
              <span className="text-sm font-bold text-emerald-600">
                {opportunityRatio}%
              </span>
            </div>
          )}
        </div>

        <Link 
          to={`/subasta/${id}`}
          className="mt-auto w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-brand-700 transition-all duration-300 group/btn"
        >
          Ver oportunidad
          <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
