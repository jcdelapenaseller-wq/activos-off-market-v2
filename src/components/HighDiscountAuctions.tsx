import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, TrendingUp, ChevronRight, Calculator, ArrowRight, Percent } from 'lucide-react';
import { AUCTIONS } from '../data/auctions';
import { ROUTES } from '../routes';
import { isAuctionFinished, sortActiveFirst } from '../utils/auctionHelpers';

const HighDiscountAuctions: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Subastas inmobiliarias con más del 50% de descuento en España | Activos Off-Market";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Descubre subastas judiciales y administrativas en España con descuentos superiores al 50% sobre su valor de tasación. Oportunidades de inversión inmobiliaria analizadas.");
  }, []);

  const highDiscountAuctions = useMemo(() => {
    const filtered = Object.entries(AUCTIONS)
      .map(([slug, data]) => {
        const appraisalValue = data.appraisalValue || 0;
        const claimedDebt = data.claimedDebt || 0;
        const discount = appraisalValue > 0 ? (appraisalValue - claimedDebt) / appraisalValue : 0;
        
        return {
          slug,
          data,
          discount: discount * 100
        };
      })
      .filter(item => item.discount >= 50)
      .sort((a, b) => b.discount - a.discount);
      
    return sortActiveFirst(filtered, (item) => item.data.auctionDate);
  }, []);

  const activeCount = useMemo(() => {
    return highDiscountAuctions.filter(item => !isAuctionFinished(item.data.auctionDate)).length;
  }, [highDiscountAuctions]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600">
      <header className="bg-white border-b border-slate-200 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
            <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
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
          {highDiscountAuctions.map(({ slug, data, discount }) => {
            const isFinished = isAuctionFinished(data.auctionDate);
            return (
            <div key={slug} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full relative">
              {isFinished && (
                <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20 shadow-sm">
                  Adjudicada
                </div>
              )}
              <div className="p-8 flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                    <Percent size={14} /> {discount.toFixed(0)}% Descuento
                  </div>
                  <div className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter">
                    {data.procedureType || 'Subasta'}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-brand-600 transition-colors leading-snug">
                  {data.propertyType || 'Inmueble'} en {data.city || 'España'}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <MapPin size={16} className="text-brand-500" />
                    </div>
                    <span className="text-sm font-medium">{data.zone || data.city || 'Ubicación no disponible'}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <DollarSign size={16} className="text-brand-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Valor Tasación</span>
                      <span className="text-sm font-bold text-slate-900">
                        {data.appraisalValue?.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <TrendingUp size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">Deuda Reclamada</span>
                      <span className="text-sm font-bold text-slate-900">
                        {data.claimedDebt?.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                  {data.description || `Oportunidad de inversión con un ${discount.toFixed(0)}% de descuento sobre tasación. Análisis técnico de ${(data.propertyType || 'inmueble').toLowerCase()} en ${data.city || 'España'}.`}
                </p>
              </div>

              <div className="px-8 pb-8 mt-auto">
                <Link 
                  to={`/ejemplo-subasta/${slug}`}
                  className={`inline-flex items-center justify-center gap-2 w-full font-bold py-4 px-6 rounded-2xl transition-all shadow-lg ${isFinished ? 'bg-slate-200 text-slate-600 hover:bg-slate-300 shadow-none' : 'bg-slate-900 text-white hover:bg-brand-600 shadow-slate-200'}`}
                >
                  Ver Análisis Completo <ArrowRight size={18} />
                </Link>
              </div>
            </div>
            );
          })}
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
              to="/calculadora-subastas" 
              className="inline-flex items-center gap-3 bg-white text-brand-900 font-bold py-5 px-10 rounded-2xl hover:bg-brand-50 transition-all shadow-xl text-lg"
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
