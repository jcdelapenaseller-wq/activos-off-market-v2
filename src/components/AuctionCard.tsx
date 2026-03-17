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
  const tasacion = data.valorTasacion || data.appraisalValue;
  const subasta = data.valorSubasta;
  
  // 1. Base del cálculo (Prioridad: valorTasacion > valorSubasta > appraisalValue)
  const valorReferencia = data.valorTasacion || data.valorSubasta || data.appraisalValue;
  const cantidadReclamada = data.claimedDebt;
  
  // 2. Fórmula final: ratio = (valorReferencia - cantidadReclamada) / valorReferencia
  const opportunityRatio = (valorReferencia && cantidadReclamada !== undefined) 
    ? Math.round(((valorReferencia - cantidadReclamada) / valorReferencia) * 100) 
    : null;

  // Cálculo de descuento legacy (para compatibilidad si no hay claimedDebt)
  const discount = data.discount || ((tasacion && subasta && tasacion > subasta) ? Math.round(((tasacion - subasta) / tasacion) * 100) : null);
  
  // Deuda: Priorizar claimedDebt
  const deuda = (typeof data.claimedDebt === 'number') ? data.claimedDebt : null;

  let title = normalizeTitle(data);
  const locationLabel = normalizeLocationLabel(data);
  const isFinished = isAuctionFinished(data.auctionDate);

  // 3. Badge dinámico y Título atractivo
  let badgeText = "Oportunidad detectada";
  let badgeClasses = "bg-emerald-600 text-white";
  
  if (opportunityRatio !== null) {
    if (opportunityRatio >= 50) {
      badgeText = `-${opportunityRatio}% Oportunidad`;
      badgeClasses = "bg-emerald-600 text-white shadow-emerald-200/50";
      title = `🔥 ${title}`; // Solo 🔥 si >= 50%
    } else if (opportunityRatio >= 15) {
      badgeText = `-${opportunityRatio}% Oportunidad`;
      badgeClasses = "bg-amber-500 text-white shadow-amber-200/50";
    } else if (opportunityRatio > 0) {
      badgeText = `-${opportunityRatio}% Oportunidad`;
      badgeClasses = "bg-slate-100 text-slate-700 border border-slate-200";
    } else {
      badgeText = "Análisis requerido";
      badgeClasses = "bg-slate-100 text-slate-500 border border-slate-200";
    }
  } else if (discount !== null && discount > 0) {
    badgeText = `-${discount}% Oportunidad`;
    badgeClasses = "bg-emerald-600 text-white";
  }

  // Formatear fecha corta para urgencia (Ej: 30 MAR)
  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return `${day} ${months[date.getMonth()]}`;
  };

  // Determinar si hay urgencia (menos de 7 días)
  const isUrgent = data.auctionDate ? (new Date(data.auctionDate).getTime() - new Date().getTime()) < 7 * 24 * 60 * 60 * 1000 : false;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative group">
      {/* 1. Badge Dinámico & 2. Referencia BOE */}
      <div className="p-6 pb-0 flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1">
          <span className={`${badgeClasses} text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm transition-all duration-300`}>
            {badgeText}
          </span>
        </div>
        {data.boeId && (
          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
            {data.boeId}
          </span>
        )}
      </div>

      <div className="p-6 flex-grow flex flex-col">
        {/* 3. Título (Tipo + Calle + Número) */}
        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-brand-700 transition-colors h-14 overflow-hidden">
          {title}
        </h3>

        {/* 4. Ubicación (Ciudad / Zona) */}
        <div className="flex items-center gap-1.5 text-slate-500 mb-6">
          <MapPin size={14} className="text-brand-700 shrink-0" />
          <span className="text-sm font-medium truncate">{locationLabel}</span>
        </div>
        
        <div className="space-y-4 mb-8">
          {/* Valor de Referencia (Tasación) */}
          {valorReferencia && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Valor tasación</span>
              <span className="text-2xl font-black text-slate-900">
                {valorReferencia.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* 6. Cantidad Reclamada (ROJO DEUDA) */}
            {deuda !== null && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-0.5">Deuda reclamada</span>
                <span className="text-sm font-bold text-red-600">
                  {deuda === 0 ? 'Sin deuda' : deuda.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}
                </span>
              </div>
            )}

            {/* 7. Ratio de Oportunidad (VERDE OPORTUNIDAD) */}
            {opportunityRatio !== null && opportunityRatio > 0 && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-0.5">Descuento potencial</span>
                <span className="text-sm font-bold text-emerald-600">
                  {opportunityRatio}% s/valor
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 8. CTAs (AZUL OSCURO) */}
        <div className="mt-auto space-y-3">
          <Link 
            to={`/ejemplo-subasta/${slug}`}
            className="w-full inline-flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl bg-brand-700 text-white hover:bg-brand-800 transition-all shadow-lg active:scale-[0.98]"
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

      {/* 9. Urgencia (Visible y con color si es inminente) */}
      {data.auctionDate && !isFinished && (
        <div className={`${isUrgent ? 'bg-red-50 border-red-100' : 'bg-brand-50 border-brand-100'} border-t px-6 py-3 flex items-center justify-center gap-2`}>
          <Clock size={14} className={isUrgent ? 'text-red-600' : 'text-brand-700'} />
          <span className={`text-xs font-bold ${isUrgent ? 'text-red-700' : 'text-brand-800'}`}>
            ⏳ Solo hasta {formatShortDate(data.auctionDate)}
          </span>
        </div>
      )}
    </div>
  );
};
