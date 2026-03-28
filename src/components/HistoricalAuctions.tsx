import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calculator, TrendingUp, Percent } from 'lucide-react';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions, sortAuctions, getComputedStatus } from '../utils/auctionHelpers';
import { ROUTES } from '../constants/routes';
import { AuctionCard } from './AuctionCard';

const HistoricalAuctions: React.FC = () => {
  const historicalAuctions = sortAuctions(
    Object.entries(AUCTIONS).filter(([_, data]) => getComputedStatus(data) === 'closed')
  );
  const historicalCount = historicalAuctions.length;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Histórico de subastas inmobiliarias | Activos Off-Market";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Archivo histórico de subastas inmobiliarias finalizadas. Datos para análisis de mercado y precios de adjudicación.");
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600">
      <header className="bg-white border-b border-slate-200 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
            <Link 
              to={ROUTES.HOME} className="hover:text-brand-600 transition-colors"
            >
              Inicio
            </Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Histórico de Subastas</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
            Archivo histórico de subastas
          </h1>
          <p className="text-xl text-slate-600 mb-8 font-medium">Subastas finalizadas · Archivo histórico de oportunidades</p>

          <div className="prose prose-lg prose-slate max-w-3xl">
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-2 mt-0">Base de datos de subastas finalizadas</h2>
              <p className="text-slate-700 mb-0">
                Este archivo contiene subastas cuya fecha de cierre ya ha pasado. Estos datos son valiosos para entender el mercado y los tipos de activos que salen a subasta.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg shadow-sm">
            {historicalCount} subastas en el archivo histórico
          </div>
        </div>

        {historicalCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(() => {
              let newBadgeCount = 0;
              return historicalAuctions.map(([slug, data]: [string, any]) => {
                const showNewBadge = data.isNew && newBadgeCount < 6;
                if (showNewBadge) newBadgeCount++;
                return <AuctionCard key={slug} slug={slug} data={data} showNewBadge={showNewBadge} />;
              });
            })()}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
            <p className="text-xl text-slate-500">No hay subastas históricas registradas todavía.</p>
          </div>
        )}

        <div className="mt-20 bg-brand-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Buscas subastas activas?
            </h2>
            <p className="text-brand-100 mb-10 text-lg leading-relaxed">
              Consulta las últimas oportunidades detectadas que aún están en plazo para pujar.
            </p>
            <Link 
              to={ROUTES.RECENT_AUCTIONS} className="inline-flex items-center gap-3 bg-white text-brand-900 font-bold py-5 px-10 rounded-2xl hover:bg-brand-50 transition-all shadow-xl text-lg"
            >
              Ver Subastas Activas <TrendingUp size={22} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HistoricalAuctions;
