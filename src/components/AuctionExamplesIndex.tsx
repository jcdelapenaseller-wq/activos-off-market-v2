import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { ChevronRight, MapPin, Home, DollarSign, TrendingUp } from 'lucide-react';
import { isAuctionFinished, sortActiveFirst } from '../utils/auctionHelpers';

const AuctionExamplesIndex: React.FC = () => {
  const allAuctions = React.useMemo(() => {
    return sortActiveFirst(Object.entries(AUCTIONS), (item) => item[1].auctionDate);
  }, []);

  const activeCount = React.useMemo(() => {
    return allAuctions.filter(item => !isAuctionFinished(item[1].auctionDate)).length;
  }, [allAuctions]);

  useEffect(() => {
    document.title = "Ejemplos de análisis de subastas inmobiliarias | Activos Off-Market";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Listado de análisis reales de subastas judiciales y administrativas en España. Aprende a detectar oportunidades y riesgos.");
    }
    
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Ejemplos de análisis de subastas inmobiliarias
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Explora nuestra selección de análisis detallados de subastas reales. 
            Cada informe incluye el cálculo de rentabilidad, riesgos detectados y comparativa con el precio de mercado de la zona.
          </p>
          {activeCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 font-bold px-4 py-2 rounded-lg shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
              </span>
              {activeCount} subastas activas ahora mismo
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allAuctions.map(([slug, data]) => {
            const isFinished = isAuctionFinished(data.auctionDate);
            return (
            <div key={slug} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all group relative">
              {isFinished && (
                <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20 shadow-sm">
                  Adjudicada
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 text-brand-600 font-bold text-sm uppercase tracking-wider mb-3">
                  <TrendingUp size={16} /> Análisis de oportunidad
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                  {data.propertyType} en subasta en {data.city}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <MapPin size={16} className="text-brand-500" />
                    <span>{data.city}{data.zone ? ` / ${data.zone}` : ''}</span>
                  </div>
                  {data.appraisalValue && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <DollarSign size={16} className="text-brand-500" />
                      <span>Valor tasación: <span className="font-bold text-slate-900">{data.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span></span>
                    </div>
                  )}
                  {data.surface && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Home size={16} className="text-brand-500" />
                      <span>Superficie: <span className="font-bold text-slate-900">{data.surface} m²</span></span>
                    </div>
                  )}
                </div>

                <Link 
                  to={`/subasta/${slug}`} className={`inline-flex items-center justify-center gap-2 w-full font-bold py-3 px-6 rounded-xl transition-all group-hover:translate-y-[-2px] ${isFinished ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-slate-900 text-white hover:bg-brand-600'}`}
                >
                  Ver análisis completo <ChevronRight size={18} />
                </Link>
              </div>
            </div>
            );
          })}
        </div>

        <div className="mt-16 bg-brand-900 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-serif font-bold mb-4">¿Quieres aprender a analizar estas subastas tú mismo?</h2>
          <p className="text-brand-200 mb-8 max-w-2xl mx-auto">
            Nuestra guía completa te enseña paso a paso cómo revisar edictos, certificaciones de cargas y calcular pujas ganadoras.
          </p>
          <Link 
            to="/como-analizar-subasta-judicial-paso-a-paso" className="inline-flex items-center gap-2 bg-white text-brand-900 font-bold py-4 px-8 rounded-xl hover:bg-brand-50 transition-all"
          >
            Ir a la guía de análisis <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuctionExamplesIndex;
