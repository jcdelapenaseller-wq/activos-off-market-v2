import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import { AuctionData } from '../data/auctions';
import { AUCTION_RESULTS } from '../data/auctionResults';
import { calculateDiscount, isAuctionFinished } from '../utils/auctionHelpers';
import { getImageForPropertyType } from '../constants/auctionImages';

interface Props {
  auction: AuctionData;
  slug: string;
  index?: number;
}

const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null) return 'N/A';
  return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
};

const getStatus = (date?: string) => {
  if (!date) return { label: 'Desconocido', sentence: 'Estado no disponible.' };
  const d = new Date(date);
  const today = new Date();
  if (isAuctionFinished(date)) return { label: 'Finalizada', sentence: 'Resumen de resultados de la subasta.' };
  if (d > today) return { label: 'Próximamente', sentence: 'Análisis previo a la apertura.' };
  return { label: 'Activa', sentence: 'Análisis de la oportunidad actual.' };
};

const DiscoverSingleAuctionArticle: React.FC<Props> = ({ auction, slug, index = 0 }) => {
  const discount = calculateDiscount(auction.valorTasacion, auction.valorSubasta, auction.claimedDebt);
  const titleData = discount ? `${discount}% descuento` : `Valor: ${formatCurrency(auction.valorTasacion || auction.valorSubasta)}`;
  const imageUrl = getImageForPropertyType(auction.propertyType, slug, index, []);
  const status = getStatus(auction.auctionDate);
  const formattedDate = auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('es-ES') : 'N/A';

  return (
    <Link to={`/noticias-subastas/analisis/${slug}`} className="block group h-full">
      <article className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full flex flex-col group-hover:shadow-md transition-all">
        <div className="relative overflow-hidden rounded-2xl mb-6 shrink-0">
          <img 
            src={imageUrl} 
            alt={`${auction.propertyType} en ${auction.city}`} 
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-lg ${status.label === 'Activa' ? 'bg-emerald-600 text-white' : status.label === 'Próximamente' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-white'}`}>
              {status.label}
            </span>
            {AUCTION_RESULTS[slug] && (
              <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-slate-900 text-white shadow-lg">
                Adjudicada
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
          <span className="font-bold text-brand-600 uppercase tracking-widest">Análisis de Activo</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>

        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4 group-hover:text-brand-600 transition-colors line-clamp-2">
          {auction.propertyType} en {auction.city} - {titleData}
        </h2>

        <div className="prose prose-slate max-w-none mb-6 text-sm line-clamp-3 text-slate-600">
          <p>
            {status.sentence} Esta oportunidad en {auction.city} presenta un margen técnico relevante entre su valor de tasación y la deuda reclamada. 
            Analizamos los riesgos y beneficios de este activo en {auction.province}.
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ShieldCheck size={16} />
            </div>
            <span className="text-xs font-bold text-slate-700">Auditado por expertos</span>
          </div>
          <div className="text-brand-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Leer análisis <ChevronRight size={16} />
          </div>
        </div>
      </article>
    </Link>
  );
};

export default DiscoverSingleAuctionArticle;
