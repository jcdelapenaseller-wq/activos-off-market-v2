import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { MetricTag } from '../utils/themeClasses';

const Pricing: React.FC = () => {
  return (
    <section id="precios" className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-7xl mx-auto mb-20">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-6">Planes de Colaboración</h2>
          <p className="text-xl md:text-2xl text-slate-700 font-medium max-w-2xl mx-auto leading-relaxed">
            "Publico nuevas oportunidades filtradas cada semana en el canal gratuito y análisis profundos en el Premium."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          
          {/* Free Tier */}
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 flex flex-col hover:border-slate-300 transition-colors group">
            <div className="mb-4">
              <span className={MetricTag}>Canal Gratuito</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Radar de Mercado</h3>
            <div className="text-4xl font-bold text-slate-900 mb-6">0€ <span className="text-base font-medium text-slate-500">/siempre</span></div>
            <p className="text-slate-600 mb-8 flex-grow leading-relaxed">
              Recibe las alertas básicas (título + precio) para estar al día de lo que sale.
            </p>
            <a href="https://t.me/activosoffmarket" target="_blank" rel="noopener noreferrer" className="block w-full py-4 px-6 bg-slate-100 text-slate-800 font-bold rounded-xl text-center hover:bg-slate-200 transition-colors mb-8 text-lg">
              Acceder
            </a>
            <ul className="space-y-4 text-slate-700">
              <li className="flex items-center gap-3">
                <div className="bg-slate-100 p-1 rounded-full group-hover:bg-slate-200 transition-colors"><Check size={16} className="text-slate-600" /></div>
                <span>Alertas de oportunidades</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-slate-100 p-1 rounded-full group-hover:bg-slate-200 transition-colors"><Check size={16} className="text-slate-600" /></div>
                <span>Enlace directo al BOE</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <div className="bg-slate-50 p-1 rounded-full"><X size={16} /></div>
                <span>Análisis de cargas y estrategia</span>
              </li>
            </ul>
          </div>

          {/* Premium Tier - HIGHLIGHTED */}
          <div className="bg-brand-50/50 p-10 rounded-3xl shadow-2xl border-2 border-brand-500 relative flex flex-col transform md:-translate-y-4 z-10 transition-transform hover:-translate-y-5">
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${MetricTag} !bg-brand-600 !text-white !border-brand-600 shadow-lg flex items-center gap-1.5 whitespace-nowrap !px-4 !py-1.5`}>
                <Sparkles size={14} /> Recomendado
            </div>
            <div className="mb-4 mt-2">
              <span className={`${MetricTag} !bg-brand-100 !text-brand-800 !border-brand-200`}>Premium</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Análisis Profundo</h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm font-bold text-slate-500">Desde</span>
                <span className="text-4xl font-bold text-slate-900">9€</span>
                <span className="text-base font-medium text-slate-500">/semana</span>
            </div>
            <p className="text-slate-600 mb-8 flex-grow leading-relaxed">
              Acceso al análisis completo de cargas, posesión y valoración de cada oportunidad.
            </p>
            <a 
                href="https://sublaunch.com/activosoffmarket" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block w-full py-5 px-6 bg-brand-700 text-white font-bold rounded-xl text-center hover:bg-brand-800 transition-all mb-8 shadow-lg hover:shadow-brand-500/30 text-lg transform active:scale-95"
            >
              Ver Oferta
            </a>
            <ul className="space-y-4 text-slate-700">
              <li className="flex items-center gap-3">
                <div className="bg-brand-100 p-1 rounded-full"><Check size={16} className="text-brand-700" /></div>
                <span><strong>Todo</strong> lo del canal gratuito</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-brand-100 p-1 rounded-full"><Check size={16} className="text-brand-700" /></div>
                <span><strong>Análisis de cargas</strong> (vital)</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-brand-100 p-1 rounded-full"><Check size={16} className="text-brand-700" /></div>
                <span>Estimación de valor y margen</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-brand-100 p-1 rounded-full"><Check size={16} className="text-brand-700" /></div>
                <span>Soporte de dudas en el canal</span>
              </li>
            </ul>
          </div>

          {/* Consulting Tier */}
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 flex flex-col hover:border-slate-300 transition-colors group">
            <div className="mb-4">
              <span className={MetricTag}>Consultoría</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Sesión 1:1</h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm font-bold text-slate-500">Desde solo</span>
                <span className="text-4xl font-bold text-slate-900">39€</span>
            </div>
            <p className="text-slate-600 mb-8 flex-grow leading-relaxed">
              Videollamada privada para analizar UNA subasta concreta o revisar tu estrategia de inversión.
            </p>
            <div className="flex flex-col gap-3 mb-8">
                <a href="https://calendly.com/activosoffmarket" target="_blank" rel="noopener noreferrer" className="block w-full py-4 px-6 bg-slate-900 text-white font-bold rounded-xl text-center hover:bg-slate-800 transition-colors text-lg transform active:scale-95 shadow-md">
                Agendar llamada
                </a>
            </div>
            
            <ul className="space-y-4 text-slate-700">
              <li className="flex items-center gap-3">
                <div className="bg-green-100 p-1 rounded-full group-hover:bg-green-200 transition-colors"><Check size={16} className="text-green-700" /></div>
                <span>30 min por Google Meet</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-green-100 p-1 rounded-full group-hover:bg-green-200 transition-colors"><Check size={16} className="text-green-700" /></div>
                <span>Revisión en directo de docs</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-green-100 p-1 rounded-full group-hover:bg-green-200 transition-colors"><Check size={16} className="text-green-700" /></div>
                <span>Opinión honesta: "¿Yo pujaría?"</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Pricing;