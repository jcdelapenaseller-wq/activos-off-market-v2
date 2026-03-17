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
    fomoLabel = "⌛ Oportunidad perdida";
    fomoColor = "text-slate-400";
  } else if (diffHours !== null && diffHours > 0 && diffHours <= 24) {
    fomoLabel = "🚨 ÚLTIMAS HORAS";
    fomoColor = "text-red-600";
  } else if (diffDays !== null && diffDays > 0 && diffDays <= 5) {
    fomoLabel = "⏳ Termina pronto";
    fomoColor = "text-amber-600";
  } else if (publishedDiffHours !== null && publishedDiffHours <= 48) {
    fomoLabel = "✨ Oportunidad nueva";
    fomoColor = "text-brand-600";
  } else {
    fomoLabel = "🔥 Oportunidad activa";
    fomoColor = "text-slate-500";
  }

  const locationLabel = normalizeLocationLabel(data);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative">
      {isFinished && (
        <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20 shadow-sm">
          Finalizada
        </div>
      )}
      
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          {/* Badge de Oportunidad o Análisis Requerido */}
          {opportunityRatio !== null && opportunityRatio >= 18 ? (
            <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Oportunidad {opportunityRatio}%
            </span>
          ) : (cantidadReclamada === undefined || cantidadReclamada === null) && valorReferencia ? (
            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Análisis requerido
            </span>
          ) : (
            <div /> // Spacer
          )}
          
          {/* Fecha Dinámica / FOMO */}
          {fomoLabel && (
            <span className={`text-[11px] font-bold text-right ${fomoColor}`}>
              {fomoLabel}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-4 leading-snug">
          {normalizePropertyType(data.propertyType)} en {data.address?.split(',')[0] || 'ubicación'}
        </h2>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <MapPin size={16} className="text-brand-500" />
            <span className="font-medium">
              <span className="text-slate-900 font-bold">{data.city}</span>
              {data.zone ? ` / ${data.zone}` : ''}
            </span>
          </div>
          
          {valorReferencia && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <DollarSign size={16} className="text-brand-500" />
              <span>Valor tasación: <span className="font-bold text-slate-900">{valorReferencia.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}</span></span>
            </div>
          )}

          {cantidadReclamada !== undefined && cantidadReclamada !== null && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <DollarSign size={16} className="text-red-500" />
              <span>Deuda: <span className="font-bold text-red-600">{cantidadReclamada.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}</span></span>
            </div>
          )}

          {opportunityRatio !== null && opportunityRatio > 0 && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Percent size={16} className="text-green-500" />
              <span className="text-slate-500">Descuento potencial: <span className="font-bold text-green-600">-{opportunityRatio}%</span></span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link 
            to={`/subasta/${id}`}
            className={`w-full inline-flex items-center justify-center font-bold py-3 px-6 rounded-xl transition-colors group ${isFinished ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-slate-900 text-white hover:bg-brand-600'}`}
          >
            Ver detalles
            <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to={ROUTES.CALCULATOR}
            className="w-full inline-flex items-center justify-center bg-brand-50 text-brand-700 font-bold py-3 px-6 rounded-xl hover:bg-brand-100 transition-colors"
          >
            Calcular puja máxima
          </Link>
        </div>
      </div>
    </div>
  );
};

