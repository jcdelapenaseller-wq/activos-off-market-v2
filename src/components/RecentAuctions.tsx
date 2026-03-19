import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, TrendingUp, ChevronRight, Calculator, Calendar, ArrowRight, Percent } from 'lucide-react';
import { ACTIVE_AUCTIONS as AUCTIONS } from '../data/filteredAuctions';
import { ROUTES } from '../constants/routes';
import { isAuctionFinished, sortAuctions, formatDate } from '../utils/auctionHelpers';
import { AuctionCard } from './AuctionCard';
import { AuctionFilters } from './AuctionFilters';
import { AuctionData } from '../data/auctions';

const RecentAuctions: React.FC = () => {
  const [filteredAuctions, setFilteredAuctions] = useState<Record<string, AuctionData>>(AUCTIONS);
  const sortedAuctions = sortAuctions(Object.entries(filteredAuctions));
  const activeCount = Object.keys(filteredAuctions).length;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Últimas subastas inmobiliarias detectadas | Activos Off-Market";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Listado de las subastas judiciales y administrativas más recientes detectadas en España. Análisis técnico y oportunidades de inversión inmobiliaria.");
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600">
      <header className="bg-white border-b border-slate-200 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
            <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Subastas Recientes</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
            Últimas subastas inmobiliarias detectadas
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <AuctionFilters auctions={AUCTIONS} onFilteredChange={setFilteredAuctions} />
        
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 font-bold px-4 py-2 rounded-lg shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
            </span>
            {activeCount} subastas activas ahora mismo
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedAuctions.map(([slug, data]) => (
            <AuctionCard key={slug} slug={slug} data={data} />
          ))}
        </div>

        <div className="mt-20 bg-brand-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-700 rounded-full -ml-32 -mb-32 opacity-30 blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <TrendingUp className="text-brand-400 mx-auto mb-6" size={48} />
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Quieres saber cuánto pujar por estas subastas?
            </h2>
            <p className="text-brand-100 mb-10 text-lg leading-relaxed">
              No dejes tu inversión al azar. Utiliza nuestra calculadora profesional para determinar tu puja máxima rentable basándote en números reales.
            </p>
            <Link 
              to="/calculadora-subastas" 
              className="inline-flex items-center gap-3 bg-white text-brand-900 font-bold py-5 px-10 rounded-2xl hover:bg-brand-50 transition-all shadow-xl text-lg"
            >
              Ir a la Calculadora <Calculator size={22} />
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0">
              <Percent size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">¿Buscas las mejores oportunidades?</h3>
              <p className="text-slate-600">Hemos seleccionado los activos con mayor margen de beneficio potencial.</p>
            </div>
          </div>
          <Link 
            to="/subastas-descuento-50" 
            className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition-all whitespace-nowrap"
          >
            Subastas con más del 50% de descuento
          </Link>
        </div>

        <div className="mt-20 pt-12 border-t border-slate-200">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8 text-center">
            Hub de contenido y subastas por ciudad
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Link to={ROUTES.NOTICIAS_SUBASTAS_INDEX} className="flex items-center justify-between bg-white border border-slate-200 p-6 rounded-2xl hover:border-brand-500 hover:shadow-md transition-all group">
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-brand-600">Noticias de Subastas</h3>
                <p className="text-sm text-slate-500">Actualidad y avisos del BOE</p>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-brand-600" />
            </Link>
            <Link to={ROUTES.HIGH_DISCOUNT} className="flex items-center justify-between bg-white border border-slate-200 p-6 rounded-2xl hover:border-brand-500 hover:shadow-md transition-all group">
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-brand-600">Subastas con Descuento</h3>
                <p className="text-sm text-slate-500">Más del 50% sobre tasación</p>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-brand-600" />
            </Link>
            <Link to={ROUTES.GUIDE_PILLAR} className="flex items-center justify-between bg-white border border-slate-200 p-6 rounded-2xl hover:border-brand-500 hover:shadow-md transition-all group">
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-brand-600">Guía de Inversión</h3>
                <p className="text-sm text-slate-500">Aprende a pujar con seguridad</p>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-brand-600" />
            </Link>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Explorar por ciudad</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/subastas-en/madrid" className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm">Madrid</Link>
            <Link to="/subastas-en/barcelona" className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm">Barcelona</Link>
            <Link to="/subastas-en/valencia" className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm">Valencia</Link>
            <Link to="/subastas-en/sevilla" className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm">Sevilla</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecentAuctions;
