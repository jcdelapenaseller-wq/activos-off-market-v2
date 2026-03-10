import React from 'react';
import { MapPin, TrendingUp, AlertTriangle, ArrowRight, Lock } from 'lucide-react';

const Opportunities: React.FC = () => {
  return (
    <section id="ejemplos" className="py-24 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Ejemplos reales (ya adjudicados)</h2>
          <p className="text-xl text-slate-300 font-light">
            Así analizo las oportunidades. Datos claros, números conservadores y advertencias visibles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          
          {/* Card 1 */}
          <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-brand-500 transition-colors group flex flex-col">
            <div className="h-56 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800" 
                alt="Piso Madrid" 
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border border-slate-600 flex items-center gap-1">
                <Lock size={10} /> Adjudicada
              </div>
            </div>
            <div className="p-8 flex-grow flex flex-col">
              <h3 className="text-xl font-bold mb-3 flex items-start gap-2">
                <MapPin size={20} className="text-brand-400 mt-1 flex-shrink-0" />
                Piso en Madrid (Tetuán)
              </h3>
              <p className="text-sm text-slate-400 mb-6 font-medium uppercase tracking-wide">Ejecución Hipotecaria • 75m²</p>
              
              <div className="space-y-4 mb-8 text-base">
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">Valor Mercado</span>
                  <span className="font-medium">~320.000 €</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">Adjudicado por</span>
                  <span className="font-medium text-white">195.000 €</span>
                </div>
                <div className="flex justify-between text-green-400 font-bold pt-1">
                  <span>Descuento bruto</span>
                  <span>~39%</span>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-xl text-sm text-yellow-200 mt-auto flex gap-3">
                <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>Advertencia: Deudor residiendo. Se estimó proceso de lanzamiento de 6-8 meses (descontado en la oferta máxima).</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-brand-500 transition-colors group flex flex-col">
             <div className="h-56 relative overflow-hidden">
               <img 
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800" 
                alt="Chalet Valencia" 
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border border-slate-600 flex items-center gap-1">
                <Lock size={10} /> Adjudicada
              </div>
            </div>
            <div className="p-8 flex-grow flex flex-col">
              <h3 className="text-xl font-bold mb-3 flex items-start gap-2">
                <MapPin size={20} className="text-brand-400 mt-1 flex-shrink-0" />
                Chalet en Valencia
              </h3>
              <p className="text-sm text-slate-400 mb-6 font-medium uppercase tracking-wide">Concursal • 210m²</p>
              
              <div className="space-y-4 mb-8 text-base">
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">Valor Mercado</span>
                  <span className="font-medium">~450.000 €</span>
                </div>
                 <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">Adjudicado por</span>
                  <span className="font-medium text-white">285.000 €</span>
                </div>
                <div className="flex justify-between text-green-400 font-bold pt-1">
                  <span>Descuento bruto</span>
                  <span>~36%</span>
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-700/50 p-4 rounded-xl text-sm text-green-200 mt-auto flex gap-3">
                <TrendingUp size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>Llaves disponibles en juzgado. Inmueble vacío pero vandalizado. Reforma integral necesaria.</span>
              </div>
            </div>
          </div>

          {/* Card 3 - CTA */}
          <div className="bg-brand-900 rounded-2xl overflow-hidden border-2 border-brand-500/50 hover:border-brand-400 transition-colors group flex flex-col justify-center items-center text-center p-10 relative shadow-2xl">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             
             <div className="relative z-10 flex flex-col h-full justify-center items-center">
                <div className="mb-8 bg-brand-800 p-6 rounded-full border border-brand-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight size={40} className="text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold mb-6 text-white">¿Quieres ver las activas de esta semana?</h3>
                <p className="text-brand-100 mb-10 leading-relaxed text-lg">
                    Publico nuevas oportunidades filtradas cada semana en el canal gratuito y análisis profundos en el Premium.
                </p>
                <a 
                    href="https://t.me/activosoffmarket" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-white text-brand-900 font-bold text-lg rounded-xl hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                    Ver alertas en el canal
                </a>
                <p className="mt-6 text-xs text-brand-400 opacity-60">
                    *Resultados pasados no garantizan rentabilidades futuras.
                </p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Opportunities;