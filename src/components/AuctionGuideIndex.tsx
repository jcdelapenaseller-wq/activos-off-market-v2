import React, { useEffect } from 'react';
import { Calendar, Clock, ChevronRight, BookOpen, Gavel, Search, ShieldAlert, FileText, ArrowRight, Layers, GraduationCap, Scale, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const AuctionGuideIndex: React.FC = () => {
  
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();

  const IMG_HERO = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1200&h=630"; // Library / Knowledge

  useEffect(() => {
    // SEO Optimization
    document.title = "Guía Completa de Subastas Judiciales en España | Activos Off-Market";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', "Accede a la guía completa sobre subastas judiciales en España: análisis, riesgos, reglas clave y estrategias para invertir con seguridad.");
    }
    window.scrollTo(0, 0);

    // Schema.org CollectionPage
    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "headline": "Guía Completa de Subastas Judiciales en España",
          "description": "Índice estructurado de recursos educativos para inversores en subastas públicas.",
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "url": "https://activosoffmarket.es" + ROUTES.GUIDE_PILLAR,
                "name": "Subastas Judiciales en España"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "url": "https://activosoffmarket.es" + ROUTES.SUBASTAS_BOE,
                "name": "Subastas BOE"
              }
            ]
          }
        },
        {
          "@type": "Article",
          "headline": "Índice de Guías sobre Subastas Judiciales",
          "description": "Índice estructurado de recursos educativos para inversores en subastas públicas.",
          "image": ["https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1200&h=630"],
          "datePublished": "2024-01-15T09:00:00+01:00",
          "dateModified": schemaDate,
          "author": {
            "@type": "Person",
            "name": "José de la Peña",
            "url": "https://activosoffmarket.es/equipo"
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://activosoffmarket.es/indice-guia-subastas"
          }
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [schemaDate]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600 selection:bg-brand-100 selection:text-brand-900">
      
      {/* HEADER */}
      <header className="bg-white pb-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
            <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium flex-wrap gap-2" aria-label="Breadcrumb">
                <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
                <ChevronRight size={14} />
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Índice Guía</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Guía Completa de <br/>
                <span className="text-brand-700 italic">Subastas Judiciales en España</span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                    <img src="/jose-de-la-pena-subastas-boe.jpg" alt="José de la Peña" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md" />
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-none">José de la Peña</span>
                        <span className="text-xs text-brand-600 mt-1 font-semibold uppercase">Jurista</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                    <Calendar size={14} />
                    <span className="capitalize">{currentMonthYear}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                    <Layers size={14} />
                    <span>Mapa de Contenidos</span>
                </div>
            </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* MAIN CONTENT */}
        <main className="lg:col-span-8">
            <div className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900">
                
                <figure className="mb-12 -mt-6">
                    <img 
                        src={IMG_HERO} 
                        alt="Biblioteca de conocimiento sobre subastas"
                        width="1200"
                        height="630"
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                    />
                </figure>

                <p className="text-xl text-slate-700 leading-relaxed font-light mb-10 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                    Bienvenido al centro de recursos. Aquí encontrarás estructurado todo el conocimiento necesario para invertir en subastas judiciales con rigor técnico y seguridad jurídica.
                </p>

                {/* TABLA DE CONTENIDOS */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-16 shadow-sm">
                    <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">Tabla de contenidos de la guía</h2>
                    <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3 list-none pl-0">
                        <li><Link to={ROUTES.ANALYSIS} className="text-brand-700 hover:text-brand-900 hover:underline font-medium flex items-center gap-2"><ChevronRight size={16}/> Cómo analizar una subasta</Link></li>
                        <li><Link to={ROUTES.RULE_70} className="text-brand-700 hover:text-brand-900 hover:underline font-medium flex items-center gap-2"><ChevronRight size={16}/> Regla del 70%</Link></li>
                        <li><Link to={ROUTES.DEPOSIT} className="text-brand-700 hover:text-brand-900 hover:underline font-medium flex items-center gap-2"><ChevronRight size={16}/> Depósito del 5%</Link></li>
                        <li><Link to={ROUTES.OCCUPIED} className="text-brand-700 hover:text-brand-900 hover:underline font-medium flex items-center gap-2"><ChevronRight size={16}/> Vivienda ocupada</Link></li>
                        <li><Link to={ROUTES.CHARGES} className="text-brand-700 hover:text-brand-900 hover:underline font-medium flex items-center gap-2"><ChevronRight size={16}/> Cargas registrales</Link></li>
                        <li><Link to={ROUTES.VISIT} className="text-brand-700 hover:text-brand-900 hover:underline font-medium flex items-center gap-2"><ChevronRight size={16}/> Visitar inmueble</Link></li>
                        <li><Link to={ROUTES.ERRORS} className="text-brand-700 hover:text-brand-900 hover:underline font-medium flex items-center gap-2"><ChevronRight size={16}/> Errores frecuentes</Link></li>
                        <li><Link to={ROUTES.ASSIGNMENT} className="text-brand-700 hover:text-brand-900 hover:underline font-medium flex items-center gap-2"><ChevronRight size={16}/> Cesión de remate</Link></li>
                        <li><Link to={ROUTES.EMPTY} className="text-brand-700 hover:text-brand-900 hover:underline font-medium flex items-center gap-2"><ChevronRight size={16}/> Subasta desierta</Link></li>
                        <li><Link to={ROUTES.COMPARISON} className="text-brand-700 hover:text-brand-900 hover:underline font-medium flex items-center gap-2"><ChevronRight size={16}/> Judicial vs AEAT</Link></li>
                        <li><Link to={ROUTES.GLOSSARY} className="text-brand-700 hover:text-brand-900 hover:underline font-medium flex items-center gap-2"><ChevronRight size={16}/> Glosario</Link></li>
                        <li><Link to={ROUTES.PROFITABILITY_CALC_GUIDE} className="text-brand-700 hover:text-brand-900 hover:underline font-medium flex items-center gap-2"><ChevronRight size={16}/> Calculadora Rentabilidad</Link></li>
                        <li><Link to={ROUTES.VALENCIA} className="text-brand-700 hover:text-brand-900 hover:underline font-medium flex items-center gap-2"><ChevronRight size={16}/> Subastas en Valencia</Link></li>
                        <li><Link to={ROUTES.SEVILLA} className="text-brand-700 hover:text-brand-900 hover:underline font-medium flex items-center gap-2"><ChevronRight size={16}/> Subastas en Sevilla</Link></li>
                    </ul>
                </div>

                {/* SECCIÓN 1: FUNDAMENTOS */}
                <div className="mb-16">
                    <h2 className="flex items-center gap-3 text-3xl mb-8 pb-4 border-b border-slate-200">
                        <GraduationCap className="text-brand-600" size={32} /> Fundamentos
                    </h2>
                    
                    <div className="grid gap-6">
                        <Link to={ROUTES.GUIDE_PILLAR} className="group block bg-white border border-slate-200 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-700 m-0">Subastas judiciales en España</h3>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all"/>
                            </div>
                            <p className="text-slate-600 text-base m-0 leading-relaxed">
                                La guía pilar. Entiende qué son, cómo funcionan los plazos y el proceso completo desde la publicación hasta la adjudicación.
                            </p>
                        </Link>

                        <Link to={ROUTES.SUBASTAS_BOE} className="group block bg-white border border-slate-200 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-700 m-0">Subastas BOE</h3>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all"/>
                            </div>
                            <p className="text-slate-600 text-base m-0 leading-relaxed">
                                Cómo funciona el Portal Oficial del Estado, tipos de subastas (Judicial vs AEAT) y requisitos técnicos para participar.
                            </p>
                        </Link>
                    </div>
                </div>

                {/* SECCIÓN 2: ANÁLISIS Y ESTRATEGIA */}
                <div className="mb-16">
                    <h2 className="flex items-center gap-3 text-3xl mb-8 pb-4 border-b border-slate-200">
                        <Search className="text-brand-600" size={32} /> Análisis y Estrategia
                    </h2>
                    
                    <div className="grid gap-6">
                        <Link to={ROUTES.ANALYSIS} className="group block bg-white border border-slate-200 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-700 m-0">Cómo analizar una subasta</h3>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all"/>
                            </div>
                            <p className="text-slate-600 text-base m-0 leading-relaxed">
                                Protocolo paso a paso de Due Diligence: lectura de edictos, valoración de mercado y cálculo de costes ocultos.
                            </p>
                        </Link>

                        <Link to={ROUTES.RULE_70} className="group block bg-white border border-slate-200 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-700 m-0">Regla del 70%</h3>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all"/>
                            </div>
                            <p className="text-slate-600 text-base m-0 leading-relaxed">
                                Domina el Art. 670 LEC. Calcula cuándo tu puja es firme, cuándo es provisional y cómo evitar que te quiten la adjudicación.
                            </p>
                        </Link>

                        <Link to={ROUTES.DEPOSIT} className="group block bg-white border border-slate-200 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-700 m-0">Depósito del 5%</h3>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all"/>
                            </div>
                            <p className="text-slate-600 text-base m-0 leading-relaxed">
                                Todo sobre la consignación obligatoria: plazos de devolución, riesgos de quiebra de subasta y operativa bancaria.
                            </p>
                        </Link>
                    </div>
                </div>

                {/* SECCIÓN 3: RIESGOS */}
                <div className="mb-16">
                    <h2 className="flex items-center gap-3 text-3xl mb-8 pb-4 border-b border-slate-200">
                        <ShieldAlert className="text-brand-600" size={32} /> Riesgos y Situaciones Especiales
                    </h2>
                    
                    <div className="grid gap-6">
                        <Link to={ROUTES.OCCUPIED} className="group block bg-white border border-slate-200 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-700 m-0">Vivienda ocupada</h3>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all"/>
                            </div>
                            <p className="text-slate-600 text-base m-0 leading-relaxed">
                                El mayor temor del inversor. Diferencias entre precaristas y alquileres, plazos de lanzamiento y costes legales.
                            </p>
                        </Link>

                        <Link to={ROUTES.VISIT} className="group block bg-white border border-slate-200 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-700 m-0">Visitar inmueble</h3>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all"/>
                            </div>
                            <p className="text-slate-600 text-base m-0 leading-relaxed">
                                ¿Se puede ver el piso antes de pujar? Realidad vs Teoría. Cómo investigar el estado físico sin entrar.
                            </p>
                        </Link>

                        <Link to={ROUTES.EMPTY} className="group block bg-white border border-slate-200 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-700 m-0">Subasta sin pujas</h3>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all"/>
                            </div>
                            <p className="text-slate-600 text-base m-0 leading-relaxed">
                                Qué ocurre cuando una subasta queda desierta. Opciones del acreedor y por qué a veces no interesa pujar.
                            </p>
                        </Link>

                        <Link to={ROUTES.CHARGES} className="group block bg-white border border-slate-200 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-700 m-0">Cargas registrales</h3>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all"/>
                            </div>
                            <p className="text-slate-600 text-base m-0 leading-relaxed">
                                Purga de cargas: qué deudas se cancelan con la adjudicación y cuáles heredas (y debes pagar).
                            </p>
                        </Link>
                    </div>
                </div>

                {/* SECCIÓN 4: GLOSARIO */}
                <div className="mb-16">
                    <h2 className="flex items-center gap-3 text-3xl mb-8 pb-4 border-b border-slate-200">
                        <BookOpen className="text-brand-600" size={32} /> Glosario
                    </h2>
                    
                    <div className="grid gap-6">
                        <Link to={ROUTES.GLOSSARY} className="group block bg-white border border-slate-200 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-700 m-0">Glosario y conceptos clave</h3>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all"/>
                            </div>
                            <p className="text-slate-600 text-base m-0 leading-relaxed">
                                Diccionario técnico. Definiciones claras de términos como "Remate", "Lanzamiento", "Mandamiento de cancelación" y más.
                            </p>
                        </Link>
                         <Link to={ROUTES.ASSIGNMENT} className="group block bg-white border border-slate-200 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-700 m-0">Cesión de Remate</h3>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all"/>
                            </div>
                            <p className="text-slate-600 text-base m-0 leading-relaxed">
                                Una figura avanzada para ceder tu derecho de adjudicación a un tercero antes de escriturar.
                            </p>
                        </Link>
                    </div>
                </div>

            </div>
        </main>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-10 max-h-[calc(100vh-120px)] overflow-auto pr-2 custom-scrollbar">
            
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 block flex items-center gap-2">
                    <Gavel size={14} /> Canal Premium
                </span>
                <h3 className="font-serif text-2xl font-bold mb-4 leading-tight">
                    ¿Demasiada teoría?
                </h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    Si prefieres ver cómo aplico todo esto en casos reales cada semana, únete al canal. Ahorra tiempo de estudio.
                </p>
                <a 
                    href="https://t.me/activosoffmarket" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-white text-slate-900 font-bold py-4 px-4 rounded-xl text-center hover:bg-brand-50 transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2 group"
                >
                    Ver Análisis Reales <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                </a>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Scale size={18} className="text-brand-600"/>
                    ¿Dudas Legales?
                </h4>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    Si tienes un expediente localizado y no estás seguro de aplicar bien la teoría, puedo revisarlo contigo.
                </p>
                <a 
                    href="https://calendly.com/activosoffmarket" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-700 font-bold text-sm hover:underline flex items-center gap-1"
                >
                    Consultar caso particular <ArrowRight size={14}/>
                </a>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
};

export default AuctionGuideIndex;