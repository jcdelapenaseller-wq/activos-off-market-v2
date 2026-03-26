import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ROUTES } from '../constants/routes';
import { normalizeCity } from '../utils/auctionNormalizer';
import AuctionCalculator from './AuctionCalculator';
import Header from './Header';
import Footer from './Footer';

const AuctionCalculatorPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const cleanSlug = slug ? decodeURIComponent(slug).replace(/\/$/, '').toLowerCase() : '';
  const auction = cleanSlug ? AUCTIONS[cleanSlug] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!auction) return <Navigate to={ROUTES.CALCULATOR} replace />;

  const cityName = normalizeCity(auction) || 'España';

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden">
          <div className="p-10 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
              Calculadora de Puja Máxima
            </h1>
            <p className="text-slate-500 mb-6">
              Análisis de rentabilidad para: <span className="font-bold text-slate-700">{auction.address || auction.boeId}</span>
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tasación</p>
                <p className="font-bold text-slate-900">{auction.appraisalValue?.toLocaleString('es-ES')}€</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deuda</p>
                <p className="font-bold text-slate-900">{auction.claimedDebt?.toLocaleString('es-ES')}€</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Superficie</p>
                <p className="font-bold text-slate-900">{auction.surface || '---'} m²</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Localidad</p>
                <p className="font-bold text-slate-900 truncate">{cityName}</p>
              </div>
            </div>
          </div>
          <div className="p-10">
            <AuctionCalculator 
              appraisalValue={auction.appraisalValue}
              claimedDebt={auction.claimedDebt}
              surface={auction.surface}
              city={cityName}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuctionCalculatorPage;
