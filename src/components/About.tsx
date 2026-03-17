import React, { useEffect } from 'react';
import { ShieldCheck, Search, XCircle, FileSearch, ArrowRight, Gavel, Scale, Home, Euro, AlertOctagon, ExternalLink, Linkedin, Star, Calendar, BookOpen, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const About: React.FC = () => {

  useEffect(() => {
    // SEO: E-E-A-T Optimization
    document.title = "José Carlos de la Peña | Especialista en Subastas Judiciales BOE";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', "Conoce la experiencia y metodología de análisis de subastas judiciales en España basada en datos oficiales y gestión prudente del riesgo.");
    }

    // Schema.org Person Data
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "José Carlos de la Peña",
      "jobTitle": "Especialista en Subastas Judiciales",
      "description": "Especialista en análisis de subastas judiciales en España, estudio de cargas registrales y evaluación de riesgos.",
      "url": "https://activosoffmarket.es/#/quien-soy",
      "worksFor": {
        "@type": "Organization",
        "name": "Activos Off-Market",
        "url": "https://activosoffmarket.es"
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
    <div className="bg-white">
      
      {/* 1. SECCIÓN PRINCIPAL: BIO Y EXPERIENCIA */}
      <section className="pb-16 md:pb-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start mx-auto">
          
          {/* TEXTO - Orden: Abajo en móvil (2), Izquierda en desktop (1) */}
          <div className="order-2 md:order-1 flex flex-col justify-center">
            
            {/* H1 E-E-A-T + SOCIAL PROOF */}
            <div className="mb-8 border-l-4 border-brand-700 pl-6">
                <span className="block text-brand-600 font-bold tracking-widest uppercase text-sm mb-2">
                    Perfil Profesional
                </span>
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                    José Carlos de la Peña | <br/>
                    <span className="text-slate-600 text-2xl md:text-3xl font-normal block mt-2">Jurista Especializado en Subastas Judiciales y Análisis BOE</span>
                </h1>

                {/* GOOGLE REVIEWS WIDGET */}
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-700">
                    <div className="bg-white p-1.5 rounded-full shadow-sm border border-slate-100 flex-shrink-0">
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
                    <span className="text-sm font-medium text-slate-600"><strong className="text-slate-900">4.9/5</strong> opiniones verificadas</span>
                </div>
            </div>
            
            {/* H2: EXPERIENCIA */}
            <div className="prose prose-lg prose-slate text-slate-600 leading-relaxed text-lg font-light mb-10">
              <h2 className="font-serif text-2xl font-bold text-slate-900 mb-4">Experiencia en Subastas Judiciales en España</h2>
              <p className="mb-4">
                Mi trayectoria se centra en el análisis técnico y jurídico de activos en liquidación. Me especializo en desgranar la complejidad de las <Link to={ROUTES.GUIDE_PILLAR} className="text-brand-700 font-bold hover:underline">subastas judiciales en España</Link>, donde la falta de información es el principal riesgo para el capital.
              </p>
              <p className="mb-4">
                No trabajo con intuiciones. Mi enfoque es estrictamente analítico, basado en el estudio de cargas registrales, la evaluación de riesgos posesorios y el cruce de datos oficiales del <Link to={ROUTES.SUBASTAS_BOE} className="text-brand-700 font-bold hover:underline">Portal de Subastas del BOE</Link> y el Registro de la Propiedad.
              </p>
              <p className="mb-0">
                Mi objetivo no es que ganes todas las subastas, sino que <strong>nunca pierdas dinero</strong> en una adjudicación fallida por falta de diligencia debida.
              </p>
            </div>

            {/* H2: ENFOQUE Y FILOSOFÍA */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 mb-10">
                <h2 className="font-serif text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Scale size={24} className="text-brand-600"/> Enfoque y Filosofía
                </h2>
                <ul className="space-y-3 text-slate-700">
                    <li className="flex gap-3">
                        <CheckCircle size={20} className="text-brand-600 flex-shrink-0 mt-1"/>
                        <span><strong>Prudencia extrema:</strong> Ante la duda en un expediente (cargas confusas, ocupación incierta), mi recomendación siempre es "NO pujar".</span>
                    </li>
                    <li className="flex gap-3">
                        <CheckCircle size={20} className="text-brand-600 flex-shrink-0 mt-1"/>
                        <span><strong>Transparencia:</strong> No prometo rentabilidades irreales ni "chollos" imposibles. El mercado es eficiente y exige trabajo.</span>
                    </li>
                    <li className="flex gap-3">
                        <CheckCircle size={20} className="text-brand-600 flex-shrink-0 mt-1"/>
                        <span><strong>Trabajo personalizado:</strong> Cada expediente es único. No utilizo software automático de valoración; leo cada documento judicial personalmente.</span>
                    </li>
                </ul>
            </div>

            {/* BOTONES */}
            <div className="flex flex-col xl:flex-row gap-5">
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 flex items-center justify-center gap-4 px-8 py-4 rounded-xl border border-slate-200 text-slate-700 hover:border-brand-600 hover:text-brand-800 hover:bg-slate-50 transition-all duration-300 group shadow-sm"
                >
                    <Linkedin size={24} className="text-slate-400 group-hover:text-[#0077b5] transition-colors" />
                    <span className="font-bold">Perfil Profesional</span>
                </a>
                
                <a 
                  href="https://calendly.com/activosoffmarket" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 flex items-center justify-center gap-4 px-8 py-4 rounded-xl border border-brand-200 bg-brand-50 text-brand-900 hover:bg-brand-100 hover:border-brand-300 transition-all duration-300 shadow-sm"
                >
                    <Calendar size={24} className="text-brand-700" />
                    <span className="font-bold">Agendar Consulta</span>
                </a>
            </div>
          </div>

          {/* FOTO - LCP OPTIMIZED */}
          <div className="order-1 md:order-2 h-full flex items-center justify-center relative">
             <div className="absolute top-6 -right-6 w-full h-full border-2 border-slate-100 rounded-3xl -z-10 hidden md:block"></div>
             <div className="w-full h-[400px] md:h-[650px] relative">
                <img
                  src="/jose-de-la-pena-subastas-boe.jpg"
                  alt="José Carlos de la Peña - Especialista en Subastas BOE"
                  width="600"
                  height="800"
                  loading="eager"
                  // @ts-ignore
                  fetchpriority="high"
                  style={{ maxWidth: "100%", height: "auto" }}
                  className="rounded-2xl shadow-xl object-cover h-full w-full"
                />
             </div>
          </div>

        </div>
      </section>

      {/* 2. H2: METODOLOGÍA DE ANÁLISIS */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-bold text-sm tracking-widest uppercase mb-4 block">Rigor Técnico</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-4">Metodología de Análisis</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
                Mi proceso de validación sigue un estándar estricto para minimizar la incertidumbre jurídica y económica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl hover:border-brand-300 transition-all">
              <FileSearch className="text-brand-600 mb-6" size={32} />
              <h3 className="font-bold text-lg mb-3 text-slate-900">1. Revisión Nota Simple</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Análisis de titularidad y cargas registrales. Identificación de hipotecas preferentes que no se cancelan con la adjudicación.
              </p>
            </div>
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl hover:border-brand-300 transition-all">
              <ShieldCheck className="text-brand-600 mb-6" size={32} />
              <h3 className="font-bold text-lg mb-3 text-slate-900">2. Análisis Jurídico</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Lectura del Edicto y Certificación de Cargas. Verificación de notificaciones correctas para evitar nulidades futuras.
              </p>
            </div>
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl hover:border-brand-300 transition-all">
              <AlertOctagon className="text-brand-600 mb-6" size={32} />
              <h3 className="font-bold text-lg mb-3 text-slate-900">3. Riesgo de Ocupación</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Evaluación de indicios de ocupantes. Distinción legal entre precaristas, ejecutados y alquileres protegidos.
              </p>
            </div>
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl hover:border-brand-300 transition-all">
              <Euro className="text-brand-600 mb-6" size={32} />
              <h3 className="font-bold text-lg mb-3 text-slate-900">4. Margen de Seguridad</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Cálculo del precio máximo de puja aplicando la regla del 70% y descontando ITP, costes de lanzamiento y reformas.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
             <Link 
                to={ROUTES.ANALYSIS} 
                className="inline-flex items-center gap-2 text-brand-700 font-bold hover:text-brand-900 hover:underline decoration-2 underline-offset-4"
             >
                <BookOpen size={20} /> Ver guía detallada: Cómo analizo una subasta paso a paso
             </Link>
          </div>
        </div>
      </section>

      {/* 3. CTA ESTRATÉGICO */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 font-serif">¿Cómo puedo ayudarte?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Opción A */}
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center group hover:border-brand-200 hover:shadow-lg transition-all">
                    <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 mb-6 font-bold text-2xl group-hover:bg-brand-600 group-hover:text-white transition-colors">1</div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-900">Quiero ver oportunidades</h3>
                    <p className="text-slate-600 mb-10 flex-grow text-lg leading-relaxed">
                        Accede al canal gratuito y observa cómo analizo las oportunidades del BOE cada semana.
                    </p>
                    <a 
                        href="https://t.me/activosoffmarket" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-4 border-2 border-brand-100 text-brand-800 font-bold rounded-xl hover:bg-brand-50 transition-colors text-lg"
                    >
                        Ver Canal Gratuito
                    </a>
                </div>

                {/* Opción B */}
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center relative overflow-hidden group hover:border-brand-200 hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-brand-100 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform"></div>
                    <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white mb-6 font-bold text-2xl group-hover:bg-brand-600 transition-colors">2</div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-900">Necesito validar una subasta</h3>
                    <p className="text-slate-600 mb-10 flex-grow text-lg leading-relaxed">
                        No te la juegues. Agenda una consultoría privada y revisamos la documentación jurídica juntos.
                    </p>
                    <a 
                        href="https://calendly.com/activosoffmarket" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-brand-700 text-white font-bold rounded-xl hover:bg-brand-800 transition-colors flex justify-center items-center gap-2 shadow-lg text-lg"
                    >
                        Agendar Consulta <ArrowRight size={20} />
                    </a>
                </div>
            </div>
        </div>
      </section>

      {/* 4. POSICIONAMIENTO FUERTE (No soy agencia) */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
         {/* Decor */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full opacity-50 blur-3xl translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8 leading-tight">
                  Independencia total del banco y del deudor.
                </h2>
                <div className="h-1.5 w-24 bg-brand-500 mb-10"></div>
                <p className="text-xl text-slate-300 leading-relaxed font-light">
                  No soy una agencia inmobiliaria. Mi único incentivo es ofrecerte un análisis veraz para proteger tu inversión.
                </p>
            </div>
            <div className="w-full md:w-1/2 bg-slate-800/50 p-10 rounded-3xl border border-slate-700 backdrop-blur-sm shadow-2xl">
                <ul className="space-y-8 text-xl">
                    <li className="flex items-center gap-5">
                        <XCircle className="text-red-400 flex-shrink-0" size={28} />
                        <span className="text-slate-200">No vendo propiedades.</span>
                    </li>
                    <li className="flex items-center gap-5">
                        <XCircle className="text-red-400 flex-shrink-0" size={28} />
                        <span className="text-slate-200">No cobro comisiones de éxito.</span>
                    </li>
                    <li className="flex items-center gap-5">
                        <Gavel className="text-brand-400 flex-shrink-0" size={28} />
                        <span className="text-white font-bold">Solo cobro por mi análisis técnico.</span>
                    </li>
                </ul>
            </div>
        </div>
      </section>

      {/* Icono CheckCircle extra para completar imports si falta alguno usado en el texto (aunque ya están importados) */}
      <div className="hidden"><CheckCircle /></div> 
    </div>
  );
};

export default About;