import React, { useEffect } from 'react';
import { ShieldCheck, Search, X, Calculator, BookOpen, ArrowRight, Activity, LineChart, Linkedin, Star, User } from 'lucide-react';

const About: React.FC = () => {

  useEffect(() => {
    // SEO: E-E-A-T Optimization
    document.title = "Equipo | Activos Off-Market";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', "Conoce al equipo de Activos Off-Market. Inteligencia y rigor jurídico para invertir con seguridad en subastas judiciales.");
    }

    // Schema.org Organization Data
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Activos Off-Market",
      "url": "https://activosoffmarket.es",
      "description": "Plataforma de análisis de subastas judiciales en España.",
      "founder": {
        "@type": "Person",
        "name": "José Carlos de la Peña",
        "jobTitle": "Director de Análisis"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

    window.scrollTo(0, 0);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="bg-white font-sans text-slate-900">
      
      {/* 1. HERO: Compact & Sobrio */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-20 max-w-5xl mx-auto px-6 text-center">
        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold tracking-widest uppercase rounded-full mb-6">
          Experiencia + Rigor Jurídico
        </span>
        <h1 className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-slate-900 md:whitespace-nowrap">
          Inteligencia y rigor para dominar el BOE.
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Análisis exhaustivo y auditoría jurídica para invertir con seguridad.
        </p>
      </section>

      {/* 2. EL ECOSISTEMA: Bento Grid Compacto */}
      <section className="py-16 bg-[#FAFAFA] border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tarjeta 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <Activity className="text-slate-400 mb-4" size={24} strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-2 tracking-tight">Rastreo Continuo</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Estudiamos las subastas activas en España para detectar oportunidades reales.
              </p>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <ShieldCheck className="text-slate-400 mb-4" size={24} strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-2 tracking-tight">Evaluación de Riesgo</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Descartamos expedientes inviables mediante un estudio jurídico detallado.
              </p>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <Calculator className="text-slate-400 mb-4" size={24} strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-2 tracking-tight">Herramientas Propias</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Calculadoras integradas de rentabilidad, ITP y estimación de pujas.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. QUIÉN HAY DETRÁS: Fundador & EEAT Card */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
            <div className="w-full md:w-5/12">
              <div className="aspect-[4/5] w-full relative rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src="/jose-de-la-pena-subastas-boe.jpg"
                  alt="José Carlos de la Peña - Director de Análisis"
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="w-full md:w-7/12">
              <h2 className="font-serif text-3xl font-bold mb-6 tracking-tight">Quién hay detrás.</h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                Fundada por José Carlos de la Peña, jurista especializado. Activos Off-Market nace para aportar claridad al proceso mediante un estudio exhaustivo y rigor artesanal.
              </p>
              <blockquote className="border-l-2 border-slate-300 pl-6">
                <p className="font-serif text-xl text-slate-700 leading-snug italic">
                  "Nuestro objetivo es que nunca pierdas dinero por falta de diligencia debida."
                </p>
              </blockquote>
            </div>
          </div>

          <div className="p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm bg-white flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex-1">
              <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">Dirección de Análisis</h2>
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-1">José Carlos de la Peña</h3>
              <p className="text-brand-700 text-sm font-medium mb-4">Jurista especializado en subastas BOE · CEO Activos Off-Market</p>
              
              <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xl">
                Mi enfoque es estrictamente analítico, basado en el estudio de cargas registrales y la evaluación de riesgos posesorios.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  <Linkedin size={16} />
                  <span>Ver perfil LinkedIn</span>
                </a>
                <a 
                  href="https://calendly.com/activosoffmarket" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <User size={16} />
                  <span>Agendar consulta</span>
                </a>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col items-center md:items-end md:pl-8 md:border-l border-slate-100">
              <div className="flex items-center gap-1 text-yellow-400 mb-2">
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
              </div>
              <span className="text-2xl font-bold text-slate-900 mb-1">4.9/5</span>
              <span className="text-xs text-slate-500 text-center md:text-right">Opiniones verificadas<br/>en Google Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NUESTRO ENFOQUE: Línea de tiempo compacta */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold mb-12 text-center tracking-tight">Nuestro enfoque.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative">
            {/* Línea conectora (solo desktop) */}
            <div className="hidden md:block absolute top-6 left-6 right-6 h-[1px] bg-slate-200 -z-10"></div>
            
            <div className="relative bg-transparent pt-2">
              <span className="text-xs font-bold text-slate-400 tracking-widest mb-3 block">01</span>
              <h3 className="text-base font-bold mb-2">Primera revisión</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Descarte inicial de expedientes inviables o sin margen.</p>
            </div>
            
            <div className="relative bg-transparent pt-2">
              <span className="text-xs font-bold text-slate-400 tracking-widest mb-3 block">02</span>
              <h3 className="text-base font-bold mb-2">Revisión jurídica</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Lectura de Nota Simple. Búsqueda de embargos ocultos.</p>
            </div>
            
            <div className="relative bg-transparent pt-2">
              <span className="text-xs font-bold text-slate-400 tracking-widest mb-3 block">03</span>
              <h3 className="text-base font-bold mb-2">Situación del inmueble</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Análisis del edicto. ¿Hay ocupantes o precaristas?</p>
            </div>
            
            <div className="relative bg-transparent pt-2">
              <span className="text-xs font-bold text-slate-400 tracking-widest mb-3 block">04</span>
              <h3 className="text-base font-bold mb-2">Evaluación económica</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Cálculo estricto de rentabilidad y costes totales.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INDEPENDENCIA: Contraste oscuro compacto */}
      <section className="py-20 bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl font-bold mb-12 tracking-tight">Independencia radical.</h2>
          
          <ul className="space-y-4 text-lg text-slate-300 font-light text-left max-w-lg mx-auto">
            <li className="flex items-start gap-4">
              <X className="text-slate-500 mt-1 flex-shrink-0" size={18} />
              <span>No somos agencia inmobiliaria.</span>
            </li>
            <li className="flex items-start gap-4">
              <X className="text-slate-500 mt-1 flex-shrink-0" size={18} />
              <span>No vendemos propiedades.</span>
            </li>
            <li className="flex items-start gap-4">
              <X className="text-slate-500 mt-1 flex-shrink-0" size={18} />
              <span>No cobramos a éxito.</span>
            </li>
            <li className="flex items-start gap-4 pt-4 border-t border-slate-800">
              <span className="text-slate-500 mt-1 flex-shrink-0">—</span>
              <span className="text-white font-medium">Nuestro único incentivo es ofrecerte un análisis técnico veraz.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 6. SIGUIENTES PASOS: Tarjetas fantasma compactas */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <a 
              href="https://sublaunch.com/activosoffmarket" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group p-8 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between min-h-[200px]"
            >
              <div>
                <h3 className="text-xl font-bold mb-2 tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors">Canal Premium</h3>
                <p className="text-slate-500 text-sm">Accede al radar y a los análisis diarios.</p>
              </div>
              <div className="flex justify-end">
                <ArrowRight className="text-slate-300 group-hover:text-brand-700 transition-colors group-hover:translate-x-2 transform duration-300" size={24} />
              </div>
            </a>

            <a 
              href="https://calendly.com/activosoffmarket" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group p-8 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between min-h-[200px]"
            >
              <div>
                <h3 className="text-xl font-bold mb-2 tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors">Consultoría Privada</h3>
                <p className="text-slate-500 text-sm">Auditamos un expediente judicial contigo.</p>
              </div>
              <div className="flex justify-end">
                <ArrowRight className="text-slate-300 group-hover:text-brand-700 transition-colors group-hover:translate-x-2 transform duration-300" size={24} />
              </div>
            </a>

          </div>
        </div>
      </section>

    </div>
  );
};

export default About;