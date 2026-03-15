import React from 'react';
import { Smartphone, UserCheck, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { MetricTag } from '../utils/themeClasses';

const Services: React.FC = () => {
  return (
    <section id="como-te-ayudo" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-6">¿Cómo te ayudo?</h2>
          <p className="text-xl text-slate-600">Dos vías para acceder al mercado off-market, dependiendo de tu nivel de autonomía.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 max-w-6xl mx-auto mb-24">
          
          {/* Telegram Channel - Enhanced Visuals */}
          <div className="bg-white rounded-3xl p-10 md:p-12 shadow-lg border border-slate-100 hover:border-brand-200 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group flex flex-col h-full transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-brand-50 to-brand-100 rounded-bl-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-110"></div>
            <div className="relative z-10 flex-grow">
              <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-700 mb-8 shadow-inner group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
                <Smartphone size={40} />
              </div>
              <div className="mb-4 flex gap-2">
                <span className={MetricTag}>Canal Gratuito</span>
                <span className={`${MetricTag} !bg-brand-100 !text-brand-800 !border-brand-200`}>Premium</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-6 group-hover:text-brand-700 transition-colors">Canal de Telegram</h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Cada semana analizo cientos de subastas y filtro el ruido. Tienes dos opciones: el canal gratuito (alertas básicas) o el Premium (análisis estratégico detallado).
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-4 text-slate-700 text-lg group/item">
                  <div className="bg-green-100 p-1 rounded-full mt-1 group-hover/item:bg-green-500 group-hover/item:text-white transition-colors">
                    <Check size={18} className="text-green-700 group-hover/item:text-white" />
                  </div>
                  <span>Alertas semanales de activos con margen</span>
                </li>
                <li className="flex items-start gap-4 text-slate-700 text-lg group/item">
                  <div className="bg-brand-100 p-1 rounded-full mt-1 group-hover/item:bg-brand-500 group-hover/item:text-white transition-colors">
                    <Check size={18} className="text-brand-700 group-hover/item:text-white" />
                  </div>
                  <span className="font-semibold text-brand-900">Análisis de cargas anteriores (Premium)</span>
                </li>
              </ul>
            </div>
            
            {/* Buttons */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 mt-auto">
                <a 
                    href="https://sublaunch.com/activosoffmarket"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-brand-700 hover:bg-brand-800 text-white font-bold py-4 px-6 rounded-xl text-center transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-brand-500/30 transform active:scale-95"
                >
                    Canal Premium <ShieldCheck size={20} />
                </a>
                <a 
                    href="https://t.me/activosoffmarket" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 border-2 border-slate-200 hover:border-brand-300 bg-transparent hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 rounded-xl text-center transition-all"
                >
                    Canal gratuito
                </a>
            </div>
          </div>

          {/* 1-to-1 Consulting - Enhanced Visuals */}
          <div className="bg-white rounded-3xl p-10 md:p-12 shadow-lg border border-slate-100 hover:border-slate-300 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group flex flex-col h-full transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-bl-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-110"></div>
            <div className="relative z-10 flex-grow">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 mb-8 shadow-inner group-hover:bg-slate-800 group-hover:text-white transition-colors duration-300">
                <UserCheck size={40} />
              </div>
              <div className="mb-4">
                <span className={MetricTag}>Consultoría</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-6 group-hover:text-slate-700 transition-colors">Consultoría Estratégica</h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Si ya tienes un activo en el radar, lo destripo por ti. No dejo cabo suelto: jurídico, posesorio y económico.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-4 text-slate-700 text-lg group/item">
                  <div className="bg-slate-100 p-1 rounded-full mt-1 group-hover/item:bg-slate-800 group-hover/item:text-white transition-colors">
                    <Check size={18} className="text-slate-700 group-hover/item:text-white" />
                  </div>
                  <span>Lectura experta de Certificación de Cargas</span>
                </li>
                <li className="flex items-start gap-4 text-slate-700 text-lg group/item">
                   <div className="bg-slate-100 p-1 rounded-full mt-1 group-hover/item:bg-slate-800 group-hover/item:text-white transition-colors">
                    <Check size={18} className="text-slate-700 group-hover/item:text-white" />
                  </div>
                  <span>Investigación de ocupación y estado real</span>
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 mt-auto">
                <a 
                    href="https://calendly.com/activosoffmarket" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl text-center transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-slate-500/30 transform active:scale-95"
                >
                    Agendar consulta <ArrowRight size={20} />
                </a>
            </div>
          </div>
        </div>

        {/* Who is this for - AUTHORITY BLOCK */}
        <div className="bg-white border border-slate-200 rounded-3xl p-10 md:p-14 max-w-5xl mx-auto shadow-sm">
            <h3 className="text-3xl font-serif font-bold text-center mb-12 text-slate-900">Mentalidad de Inversor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
                {/* Content remains same, structural component re-used */}
                <div className="relative">
                     <h4 className="flex items-center gap-3 font-bold text-brand-800 mb-6 text-xl border-b border-slate-100 pb-2">
                        <Check size={24} className="text-brand-600" /> ¿Para quién es esto?
                    </h4>
                    <ul className="space-y-4 text-lg text-slate-700">
                        <li className="flex items-start gap-3">
                            <span className="block w-1.5 h-1.5 rounded-full bg-brand-500 mt-2.5"></span>
                            <span><strong>Inversores prudentes</strong> que valoran su capital.</span>
                        </li>
                        <li className="flex items-start gap-3">
                             <span className="block w-1.5 h-1.5 rounded-full bg-brand-500 mt-2.5"></span>
                            <span>Personas que <strong>no quieren improvisar</strong> con la burocracia.</span>
                        </li>
                        <li className="flex items-start gap-3">
                             <span className="block w-1.5 h-1.5 rounded-full bg-brand-500 mt-2.5"></span>
                            <span>Quien prefiere <strong>criterio y datos</strong> antes que hype.</span>
                        </li>
                    </ul>
                </div>
                <div>
                     <h4 className="flex items-center gap-3 font-bold text-slate-400 mb-6 text-xl border-b border-slate-100 pb-2">
                         <div className="text-red-300">
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                         </div>
                         ¿Para quién NO es?
                    </h4>
                    <ul className="space-y-4 text-lg text-slate-500">
                        <li className="flex items-start gap-3">
                             <span className="block w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5"></span>
                            <span>Quien busca rentabilidades mágicas sin esfuerzo.</span>
                        </li>
                        <li className="flex items-start gap-3">
                             <span className="block w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5"></span>
                            <span>Quien no quiere analizar riesgos reales.</span>
                        </li>
                        <li className="flex items-start gap-3">
                             <span className="block w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5"></span>
                            <span>Quien cree que pujar es apostar.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Services;