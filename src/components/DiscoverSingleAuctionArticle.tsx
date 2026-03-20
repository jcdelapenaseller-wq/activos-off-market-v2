import React from 'react';
import { Link } from 'react-router-dom';
import { AuctionData } from '../data/auctions';
import { AUCTION_RESULTS } from '../data/auctionResults';
import { calculateDiscount, isAuctionFinished } from '../utils/auctionHelpers';
import { getImageForPropertyType } from '../constants/auctionImages';

interface Props {
  auction: AuctionData;
  slug: string;
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
  if (d > today) return { label: 'En preparación', sentence: 'Análisis previo a la apertura.' };
  return { label: 'Activa', sentence: 'Análisis de la oportunidad actual.' };
};

const DiscoverSingleAuctionArticle: React.FC<Props> = ({ auction, slug }) => {
  const discount = calculateDiscount(auction.valorTasacion, auction.valorSubasta, auction.claimedDebt);
  const titleData = discount ? `${discount}% descuento` : `Valor: ${formatCurrency(auction.valorTasacion || auction.valorSubasta)}`;
  const imageUrl = getImageForPropertyType(auction.propertyType, slug);
  const status = getStatus(auction.auctionDate);
  const formattedDate = auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('es-ES') : 'N/A';

  return (
    <article className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
      <img 
        src={imageUrl} 
        alt={`${auction.propertyType} en ${auction.city}`} 
        className="w-full h-48 object-cover rounded-2xl mb-6"
        referrerPolicy="no-referrer"
      />
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.label === 'Activa' ? 'bg-emerald-100 text-emerald-800' : status.label === 'En preparación' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
          {status.label}
        </span>
        {AUCTION_RESULTS[slug] && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-white">
            Adjudicada: {AUCTION_RESULTS[slug].finalPrice?.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}
          </span>
        )}
        <span className="text-xs text-slate-500">Fecha: {formattedDate}</span>
      </div>
      <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">
        {auction.propertyType} en {auction.city} - {titleData}
      </h2>
      <div className="prose prose-slate max-w-none mb-4 text-sm">
        <p className="mb-2 font-medium text-slate-800">{status.sentence}</p>
        <p className="mb-2">
          Esta <Link to={`/subasta/${slug}`} className="text-brand-600 hover:underline">subasta en {auction.city}</Link> se encuentra {status.label.toLowerCase()} en {auction.address || auction.city}. 
          {discount ? ` Oportunidad con un descuento estimado del ${discount}%.` : ' Analiza las cargas antes de pujar.'}
        </p>
        <p className="text-slate-600 mb-2">
          Este activo presenta un margen técnico relevante entre su valor de tasación y la deuda reclamada, lo que permite una entrada en mercado con un descuento competitivo. 
          Su ubicación en {auction.city} sugiere una demanda estable para estrategias de arrendamiento o posterior venta.
        </p>
        <p className="text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4">
          <strong>Advertencia:</strong> Se recomienda verificar el estado de ocupación y las cargas registrales previas a la puja, ya que estos factores pueden influir en los plazos de posesión.
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
          <h4 className="text-sm font-bold text-slate-900 mb-1">Análisis Técnico</h4>
          <p className="text-xs text-slate-600">
            El margen entre el valor de tasación y la deuda reclamada ({formatCurrency(auction.claimedDebt)}) sugiere una oportunidad de entrada competitiva. 
            La rentabilidad final dependerá de la gestión de cargas registrales y la rapidez en la toma de posesión.
          </p>
        </div>
        {AUCTION_RESULTS[slug]?.auctionResultStatus === 'adjudicated' && AUCTION_RESULTS[slug].finalPrice && auction.valorTasacion && (
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 mb-4">
            <h4 className="text-sm font-bold text-emerald-900 mb-1">Resultado de la subasta</h4>
            <p className="text-sm text-emerald-800">
              Precio final: <span className="font-bold">{AUCTION_RESULTS[slug].finalPrice?.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
            </p>
            <p className="text-xs text-emerald-700 italic mt-1">
              Se adjudicó un {Math.abs(((auction.valorTasacion - AUCTION_RESULTS[slug].finalPrice!) / auction.valorTasacion) * 100).toFixed(0)}% {((auction.valorTasacion - AUCTION_RESULTS[slug].finalPrice!) / auction.valorTasacion) * 100 > 0 ? 'por debajo' : 'por encima'} del valor de tasación.
            </p>
          </div>
        )}
        <p className="text-sm text-slate-500 mb-4">
          Publicamos oportunidades en tiempo real en nuestro <a href="https://t.me/activosoffmarket" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline font-medium">canal de Telegram</a>.
        </p>
        <Link to={`/subastas/${auction.province?.toLowerCase()}`} className="text-slate-500 hover:text-brand-600 text-xs font-medium">
          Ver más subastas en {auction.province} →
        </Link>
      </div>
      <Link to={`/subasta/${slug}`} className="block text-brand-600 font-bold hover:underline mt-2">
        Ver detalles técnicos de la subasta →
      </Link>
    </article>
  );
};

export default DiscoverSingleAuctionArticle;
