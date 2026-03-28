import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, ArrowRight, TrendingDown } from 'lucide-react';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { normalizePropertyType, normalizeCity, normalizeLocationLabel } from '../utils/auctionNormalizer';
import { sortAuctions, isAuctionFinished } from '../utils/auctionHelpers';
import { ROUTES } from '../constants/routes';

const RecentAuctionsHome: React.FC = () => {
  // Get the 3 most relevant recent auctions (prioritizing active)
  const filtered = getFilteredAuctions(AUCTIONS);
  const recentAuctions = sortAuctions(Object.entries(filtered)).slice(0, 3);

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-2">
              Subastas detectadas recientemente
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <p className="text-slate-600">
                Oportunidades reales analizadas en los últimos días.
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-0.5 rounded border border-brand-100 w-fit">
                Análisis profesional de subastas
              </span>
            </div>
          </div>
          <Link 
            to="/subastas-recientes" className="text-brand-700 font-bold hover:text-brand-800 flex items-center gap-1 transition-colors"
          >
            Ver todas <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {recentAuctions.map(([slug, data], index) => {
            // Use existing discount if available, otherwise calculate it
            const hasValues = data.appraisalValue && data.claimedDebt !== undefined && data.claimedDebt !== null;
            let discount = data.discount !== undefined 
              ? data.discount 
              : (hasValues ? Math.round((1 - (data.claimedDebt! / data.appraisalValue!)) * 100) : null);
              
            if (data.claimedDebt === 0 || (discount !== null && discount > 85)) {
              discount = null;
            }

            const isOpportunity = discount !== null && discount > 35;
            const isNew = data.isNew; // Use the actual isNew property from data

            const isFinished = data.status === 'closed' || isAuctionFinished(data.auctionDate);
            const isSuspended = data.status === 'suspended';
            const isUpcoming = data.status === 'upcoming';
            const isActive = data.status === 'active' || (!isFinished && !isSuspended && !isUpcoming);

            return (
              <div key={slug} className={`relative bg-white rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all flex flex-col h-full group mt-4 md:mt-0 ${isFinished ? 'opacity-70 grayscale-[0.3]' : ''}`}>
                
                {/* Etiquetas flotantes encima de la tarjeta */}
                <div className="absolute -top-3.5 left-0 w-full flex items-center justify-center gap-1.5 md:gap-2 z-10 px-2">
                  {isFinished ? (
                    <span className="bg-slate-900/90 text-white text-[10px] md:text-[11px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full flex items-center gap-1 md:gap-1.5 shadow-sm border border-white/20 whitespace-nowrap">
                      <span>⌛</span> Finalizada
                    </span>
                  ) : isSuspended ? (
                    <span className="bg-amber-600/90 text-white text-[10px] md:text-[11px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full flex items-center gap-1 md:gap-1.5 shadow-sm border border-white/20 whitespace-nowrap">
                      <span>⏸️</span> Pausada
                    </span>
                  ) : isUpcoming ? (
                    <span className="bg-blue-600/90 text-white text-[10px] md:text-[11px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full flex items-center gap-1 md:gap-1.5 shadow-sm border border-white/20 whitespace-nowrap">
                      <span>📅</span> Próxima apertura
                    </span>
                  ) : (
                    <>
                      {isNew && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] md:text-[11px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full flex items-center gap-1 md:gap-1.5 shadow-sm border border-blue-200 whitespace-nowrap">
                          <span>⚡</span> Nueva
                        </span>
                      )}
                      {isOpportunity && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] md:text-[11px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full flex items-center gap-1 md:gap-1.5 shadow-sm border border-emerald-200 whitespace-nowrap">
                          <span>🔥</span> Oportunidad
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="p-8 flex-grow">
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mt-1">
                      {normalizePropertyType(data.propertyType)}
                    </span>
                    {discount !== null && discount > 0 && (
                      <div className="flex flex-col items-end">
                        <span className="flex items-center gap-1 text-3xl font-black text-emerald-600 leading-none">
                          <TrendingDown size={24} className="text-emerald-500" /> {discount}%
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600/70 mt-1">Descuento</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {normalizePropertyType(data.propertyType)} en {data.address?.split(',')[0] || 'ubicación'}
                  </h3>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="truncate">{normalizeLocationLabel(data)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Tasación</p>
                      <p className="text-sm font-bold text-slate-900">
                        {data.appraisalValue 
                          ? data.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) 
                          : 'N/D'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Deuda</p>
                      <p className="text-sm font-bold text-slate-900">
                        {data.claimedDebt 
                          ? data.claimedDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) 
                          : 'N/D'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8 mt-auto">
                  <Link 
                    to={`/subasta/${slug}`} className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-brand-600 transition-all shadow-lg"
                  >
                    Ver Ficha <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            to={ROUTES.NOTICIAS_SUBASTAS_INDEX} className="inline-flex items-center justify-center gap-2 bg-white border-2 border-brand-600 text-brand-700 font-bold py-4 px-8 rounded-full hover:bg-brand-50 transition-all shadow-sm hover:shadow-md"
          >
            Ver Noticias de Subastas <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentAuctionsHome;
