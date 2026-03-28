import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, TrendingUp, ChevronRight, Calculator, ArrowRight, Percent } from 'lucide-react';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { ROUTES } from '../constants/routes';
import { AuctionCard } from './AuctionCard';
import { isAuctionActive, isAuctionFinished, sortAuctions } from '../utils/auctionHelpers';
import { normalizePropertyType, normalizeCity, normalizeLocationLabel } from '../utils/auctionNormalizer';

const HighDiscountAuctions: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Subastas inmobiliarias con más del 50% de descuento en España | Activos Off-Market";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Descubre subastas judiciales y administrativas en España con descuentos superiores al 50% sobre su valor de tasación. Oportunidades de inversión inmobiliaria analizadas.");
  }, []);

  const highDiscountAuctions = useMemo(() => {
    const filtered = Object.entries(AUCTIONS).filter(([_, data]) => {
      if (!isAuctionActive(data)) return false;
      const appraisalValue = data.appraisalValue || 0;
      if (data.claimedDebt === undefined || data.claimedDebt === null) return false;
      if (data.claimedDebt === 0) return false;
      const claimedDebt = data.claimedDebt;
      const discount = appraisalValue > 0 ? (appraisalValue - claimedDebt) / appraisalValue : 0;
      return discount * 100 >= 50 && discount * 100 <= 85;
    });
    return sortAuctions(filtered);
  }, []);

  const activeCount = highDiscountAuctions.length;

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
            <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Subastas con 50% de Descuento</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
            Subastas inmobiliarias con más del 50% de descuento en España
          </h1>

          <div className="prose prose-lg prose-slate max-w-3xl">
            <p className="text-xl leading-relaxed text-slate-600">
              Invertir en subastas judiciales y administrativas ofrece la posibilidad única de adquirir activos inmobiliarios muy por debajo de su valor real de mercado. En esta sección especializada, hemos filtrado exclusivamente aquellas subastas detectadas en el portal del BOE donde la diferencia entre el valor de tasación oficial y la deuda reclamada es superior al 50%. Estas oportunidades representan el segmento de mayor potencial de rentabilidad para inversores que buscan márgenes de seguridad amplios.
            </p>
            <p className="text-slate-600">
              Un descuento del 50% o superior suele indicar expedientes donde la carga que se ejecuta es pequeña en comparación con el valor del inmueble, lo que facilita la obtención de beneficios significativos incluso tras considerar los costes de adjudicación, impuestos y posibles saneamientos. Sin embargo, es vital realizar un análisis técnico riguroso de cada caso, revisando la certificación de cargas y la situación posesoria. Utiliza nuestro listado para identificar estos activos estratégicos y aplica nuestra calculadora de puja máxima para asegurar que tu inversión se mantiene dentro de los parámetros de rentabilidad deseados.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
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
          {(() => {
            let newBadgeCount = 0;
            return highDiscountAuctions.map(([slug, data]: [string, any]) => {
              const showNewBadge = data.isNew && newBadgeCount < 6;
              if (showNewBadge) newBadgeCount++;
              return <AuctionCard key={slug} slug={slug} data={data} showNewBadge={showNewBadge} />;
            });
          })()}
        </div>

        <div className="mt-20 bg-brand-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-700 rounded-full -ml-32 -mb-32 opacity-30 blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <Calculator className="text-brand-400 mx-auto mb-6" size={48} />
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Quieres calcular tu puja máxima para estas oportunidades?
            </h2>
            <p className="text-brand-100 mb-10 text-lg leading-relaxed">
              Incluso con grandes descuentos, es fundamental no sobrepujar. Utiliza nuestra herramienta profesional para determinar el límite exacto de tu inversión.
            </p>
            <Link 
              to="/calculadora-subastas" className="inline-flex items-center gap-3 bg-white text-brand-900 font-bold py-5 px-10 rounded-2xl hover:bg-brand-50 transition-all shadow-xl text-lg"
            >
              Calcular puja máxima <ArrowRight size={22} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HighDiscountAuctions;
