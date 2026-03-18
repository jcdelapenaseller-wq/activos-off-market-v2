import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, ChevronRight, Percent } from 'lucide-react';
import { AuctionData } from '../data/auctions';
import { isAuctionFinished } from '../utils/auctionHelpers';
import { normalizeLocationLabel, normalizePropertyType } from '../utils/auctionNormalizer';
import { ROUTES } from '../constants/routes';

interface AuctionCardProps {
  slug: string;
  data: AuctionData;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ slug, data }) => {
  const id = slug;
  const valorReferencia = data.valorTasacion || data.valorSubasta || data.appraisalValue;
  const cantidadReclamada = data.claimedDebt;
  
  // Ratio de Oportunidad
  const opportunityRatio = (valorReferencia && cantidadReclamada !== undefined && cantidadReclamada !== null) 
    ? Math.round(((valorReferencia - cantidadReclamada) / valorReferencia) * 100) 
    : null;

  const isFinished = isAuctionFinished(data.auctionDate);
  
  const pricePerM2 = data.pricePerM2 || (data.surface && valorReferencia ? Math.round(valorReferencia / data.surface) : null);

  // Ranking visual (Absoluto para no añadir complejidad a los listados)
  let rankingLabel = null;
  let rankingColor = "";
  if (opportunityRatio !== null && !isFinished) {
    if (opportunityRatio >= 50) {
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

  // Formateo de Fecha y FOMO
  const auctionDate = data.auctionDate ? new Date(data.auctionDate) : null;
  const publishedDate = data.publishedAt ? new Date(data.publishedAt) : null;
  const now = new Date();
  
  const diffMs = auctionDate ? auctionDate.getTime() - now.getTime() : null;
  const diffDays = diffMs !== null ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : null;
  const diffHours = diffMs !== null ? Math.ceil(diffMs / (1000 * 60 * 60)) : null;
  
  const publishedDiffMs = publishedDate ? now.getTime() - publishedDate.getTime() : null;
  const publishedDiffHours = publishedDiffMs !== null ? publishedDiffMs / (1000 * 60 * 60) : null;

  let fomoLabel = "";
  let fomoColor = "text-slate-500";

  if (isFinished) {
    fomoLabel = "⌛ Finalizada";
    fomoColor = "text-slate-400 bg-slate-100 border-slate-200";
  } else if (diffHours !== null && diffHours > 0 && diffHours <= 24) {
    fomoLabel = "🚨 Cierra en horas";
    fomoColor = "text-red-700 bg-red-50 border-red-200";
  } else if (diffDays !== null && diffDays > 0 && diffDays <= 5) {
    fomoLabel = `⏳ Cierra en ${diffDays} días`;
    fomoColor = "text-amber-700 bg-amber-50 border-amber-200";
  } else if (publishedDiffHours !== null && publishedDiffHours <= 48) {
    fomoLabel = "✨ Recién publicada";
    fomoColor = "text-brand-700 bg-brand-50 border-brand-200";
  } else {
    fomoLabel = "🔥 Alta oportunidad";
    fomoColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  }

  const locationLabel = normalizeLocationLabel(data);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative">
      {isFinished && (
        <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20 shadow-sm">
          Finalizada
        </div>
      )}
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-3 gap-2">
          {/* Badge de Oportunidad o Análisis Requerido */}
          {opportunityRatio !== null && opportunityRatio > 40 ? (
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
              🔥 -{opportunityRatio}% DTO
            </span>
          ) : opportunityRatio !== null && opportunityRatio >= 15 ? (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider border border-emerald-200">
              -{opportunityRatio}% DTO
            </span>
          ) : (cantidadReclamada === undefined || cantidadReclamada === null) && valorReferencia ? (
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider border border-slate-200">
              Análisis requerido
            </span>
          ) : (
            <div /> // Spacer
          )}
          
          {/* Fecha Dinámica / FOMO */}
          {fomoLabel && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${fomoColor} whitespace-nowrap`}>
              {fomoLabel}
            </span>
          )}
        </div>

        {rankingLabel && (
          <div className="mb-3">
            <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-md border ${rankingColor}`}>
              {rankingLabel}
            </span>
          </div>
        )}

        <Link to={`/subasta/${id}`} className="block mb-4">
          <h2 className="text-lg font-bold text-slate-900 leading-tight hover:text-brand-600 transition-colors line-clamp-2">
            {normalizePropertyType(data.propertyType)} en {data.address?.split(',')[0] || normalizeLocationLabel(data).split(',')[0]}
          </h2>
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
                <span className="font-bold text-red-600">{cantidadReclamada.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}</span>
              </div>
            )}

            {pricePerM2 ? (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Precio m²:</span>
                <span className="font-bold text-slate-700">💸 {pricePerM2.toLocaleString('es-ES')} €/m²</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-auto pt-2">
          <Link 
            to={`/subasta/${id}`}
            className={`w-full inline-flex items-center justify-center font-bold py-3.5 px-6 rounded-xl transition-all group ${isFinished ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow-md hover:-translate-y-0.5'}`}
          >
            {isFinished ? 'Ver resultado' : 'Ver oportunidad'}
            <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

