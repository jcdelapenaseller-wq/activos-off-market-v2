import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ChevronRight, MapPin, Home, DollarSign, TrendingUp } from 'lucide-react';

const AuctionExamplesIndex: React.FC = () => {
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
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Explora nuestra selección de análisis detallados de subastas reales. 
            Cada informe incluye el cálculo de rentabilidad, riesgos detectados y comparativa con el precio de mercado de la zona.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(AUCTIONS).map(([slug, data]) => (
            <div key={slug} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all group">
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
                  to={`/ejemplo-subasta/${slug}`}
                  className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-600 transition-all group-hover:translate-y-[-2px]"
                >
                  Ver análisis completo <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-brand-900 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-serif font-bold mb-4">¿Quieres aprender a analizar estas subastas tú mismo?</h2>
          <p className="text-brand-200 mb-8 max-w-2xl mx-auto">
            Nuestra guía completa te enseña paso a paso cómo revisar edictos, certificaciones de cargas y calcular pujas ganadoras.
          </p>
          <Link 
            to="/como-analizar-subasta-judicial-paso-a-paso"
            className="inline-flex items-center gap-2 bg-white text-brand-900 font-bold py-4 px-8 rounded-xl hover:bg-brand-50 transition-all"
          >
            Ir a la guía de análisis <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuctionExamplesIndex;
