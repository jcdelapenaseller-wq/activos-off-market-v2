import React from 'react';
import { Search, ArrowRight, TrendingUp, ShieldCheck, UserCheck, Sparkles, Star } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-36 pb-24 md:pt-52 md:pb-40 overflow-hidden bg-slate-50">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -right-[5%] w-2/3 h-full bg-gradient-to-l from-brand-50/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full filter blur-[80px] opacity-60 -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-5xl mx-auto text-center mb-20 md:mb-32">
          {/* Badge updated */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-100 text-brand-700 text-sm font-bold uppercase tracking-wide mb-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 hover:scale-105 transition-transform cursor-default">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span>
            Rastreo diario en busca de los activos más rentables
          </div>
          
          {/* Headline updated */}
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] mb-10 tracking-tight">
            Ahorra tiempo e <br className="hidden md:block"/>
            <span className="text-brand-700 relative inline-block">
              Invierte con Ventaja
              <svg className="absolute w-[105%] h-4 -bottom-2 left-0 text-brand-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 12 100 5" stroke="currentColor" strokeWidth="10" fill="none" opacity="0.6" />
              </svg>
            </span>
          </h1>

          {/* FRASE CLAVE ESTRATÉGICA */}
          <p className="text-xl md:text-3xl font-serif italic text-slate-800 mb-10 max-w-3xl mx-auto border-l-4 border-brand-500 pl-6 md:pl-0 md:border-l-0">
            "Invertir en subastas no es cuestión de suerte. <br className="hidden md:block" /> Es cuestión de información."
          </p>
          
          <p className="text-lg md:text-2xl text-slate-600 mb-14 max-w-3xl mx-auto leading-relaxed font-light">
             Yo te ayudo a <strong>ganar tiempo</strong> y <strong>minimizar riesgos</strong> antes de que pongas un euro sobre la mesa. Filtro y analizo las subastas públicas (BOE, AEAT) para que tú solo decidas.
          </p>
          
          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full">
                <a 
                href="https://t.me/activosoffmarket" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-10 py-5 bg-brand-700 hover:bg-brand-800 text-white text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                <Search size={22} />
                Ver Canal Gratuito
                </a>
                <div className="relative w-full sm:w-auto group">
                    <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10 uppercase tracking-wide flex items-center gap-1">
                        <Sparkles size={10} /> Oferta Lanzamiento
                    </div>
                    <a 
                    href="https://sublaunch.com/activosoffmarket"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-10 py-5 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 text-lg font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 group-hover:border-brand-300"
                    >
                    Canal Premium
                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>

            {/* GOOGLE REVIEWS INTEGRATION */}
            <div className="flex items-center gap-3 text-slate-600 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-200 cursor-pointer hover:scale-105 transition-transform">
                <div className="bg-white p-1.5 rounded-full shadow-sm border border-slate-100">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                </div>
                <div className="flex gap-0.5 text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <span className="text-sm font-medium"><strong className="text-slate-900">4.9/5</strong> en opiniones</span>
            </div>
          </div>
        </div>

        {/* BLOQUE DE AUTORIDAD (3 CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Card 1 */}
            <div className="bg-white p-10 md:p-12 rounded-3xl shadow-lg border border-slate-100 hover:border-brand-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="bg-brand-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 text-brand-700 group-hover:bg-brand-600 group-hover:text-white transition-all">
                    <TrendingUp size={40} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-6 leading-tight group-hover:text-brand-700 transition-colors">Oportunidades filtradas</h3>
                <p className="text-xl text-slate-600 leading-relaxed">
                    Publico en el canal gratuito nuevas subastas ya seleccionadas. Sin ruido. Solo lo que tiene sentido económico.
                </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-10 md:p-12 rounded-3xl shadow-xl border-2 border-slate-100 hover:border-brand-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden z-10">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-bl-full -mr-4 -mt-4 z-0 transition-transform group-hover:scale-125"></div>
                <div className="relative z-10">
                    <div className="bg-brand-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 text-brand-800 group-hover:bg-brand-600 group-hover:text-white transition-all">
                        <ShieldCheck size={40} />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-6 leading-tight group-hover:text-brand-700 transition-colors">Análisis profundo</h3>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        Cargas ocultas, situación posesoria (ocupación) y números reales antes de que decidas pujar.
                    </p>
                </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-10 md:p-12 rounded-3xl shadow-lg border border-slate-100 hover:border-brand-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="bg-slate-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition-all">
                    <UserCheck size={40} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-6 leading-tight group-hover:text-slate-700 transition-colors">Servicio personal</h3>
                <p className="text-xl text-slate-600 leading-relaxed">
                   Analizo subastas públicas con datos verificados y criterio jurídico. Sin conflictos de interés.
                </p>
            </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;