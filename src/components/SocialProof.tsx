import React from 'react';
import { Star } from 'lucide-react';

const SocialProof: React.FC = () => {
  return (
    <section className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Trust Logos Row - OFFICIAL LOGOS */}
        {/* Adjusted to be smaller, opacity 80%, no grayscale to keep the official dark blue tone */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 mb-20 select-none">
            {/* BOE Logo */}
            <div className="group opacity-80 hover:opacity-100 transition-opacity duration-300">
                <img 
                  src="/assets/logo-boe.png" 
                  alt="BOE" 
                  className="h-10 md:h-12 w-auto object-contain"
                  onError={(e) => {
                    // Fallback visual if image fails
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="font-serif font-bold text-2xl text-slate-800">BOE.es</span>';
                  }}
                />
            </div>

            {/* AEAT Logo */}
            <div className="group opacity-80 hover:opacity-100 transition-opacity duration-300">
                <img 
                  src="/assets/logo-aeat.png" 
                  alt="Agencia Tributaria" 
                  className="h-10 md:h-12 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="font-sans font-bold text-xl text-slate-800">Agencia Tributaria</span>';
                  }}
                />
            </div>

            {/* Justicia Logo */}
            <div className="group opacity-80 hover:opacity-100 transition-opacity duration-300">
                <img 
                  src="/assets/logo-judicial.png" 
                  alt="Sede Judicial Electrónica" 
                  className="h-10 md:h-12 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="font-serif font-bold text-xl text-slate-800">Sede Judicial</span>';
                  }}
                />
            </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-20">
          
          {/* Google Review Widget - LARGER */}
          <div className="flex flex-col md:w-1/3 transform md:scale-110 origin-left">
             <div className="flex items-center gap-6 bg-white px-10 py-8 rounded-3xl border border-slate-200 mb-3 shadow-lg hover:shadow-xl transition-shadow cursor-default">
                <svg className="w-10 h-10 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <div>
                <div className="flex text-yellow-400 mb-2 gap-1">
                    {[...Array(5)].map((_, i) => (
                    <Star key={i} size={22} fill="currentColor" />
                    ))}
                </div>
                <p className="text-lg text-slate-600 font-medium">
                    <span className="text-slate-900 font-bold text-xl">4.9/5</span> opiniones
                </p>
                </div>
            </div>
            <p className="text-sm text-slate-400 pl-4 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Clientes verificados
            </p>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 relative hover:bg-white hover:shadow-md transition-all">
               <span className="absolute top-6 right-6 text-6xl text-slate-200 font-serif leading-none">"</span>
              <p className="text-slate-600 text-lg italic mb-6 relative z-10 leading-relaxed">
                Me ha evitado meterme en un lío enorme con una carga que no aparecía clara en la certificación. Su análisis fue directo y sin rodeos.
              </p>
              <p className="text-sm font-bold text-slate-800">— Carlos M. <span className="text-slate-400 font-normal">| Madrid</span></p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 relative hover:bg-white hover:shadow-md transition-all">
               <span className="absolute top-6 right-6 text-6xl text-slate-200 font-serif leading-none">"</span>
              <p className="text-slate-600 text-lg italic mb-6 relative z-10 leading-relaxed">
                Buscaba alguien que no me vendiera la moto. Aquí encontré prudencia y datos. Si la subasta no es buena, te lo dice.
              </p>
              <p className="text-sm font-bold text-slate-800">— Elena R. <span className="text-slate-400 font-normal">| Valencia</span></p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default SocialProof;