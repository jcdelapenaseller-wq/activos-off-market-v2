import React, { useEffect } from 'react';
import { Calendar, Clock, ChevronRight, ArrowRight, BookOpen, AlertTriangle, ShieldCheck, Search, Globe, Building2, Gavel, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const SubastasBOEPage: React.FC = () => {
  
  // Dynamic Date
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();

  // Images
  const IMG_HERO = "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80&w=1200&h=630"; // Computer/Portal concept
  const IMG_PORTAL = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800&h=450"; // Analysis

  useEffect(() => {
    // 1. Scroll top
    window.scrollTo(0, 0);

    // 2. SEO Meta Tags
    document.title = "Subastas BOE en España | Guía Completa para Invertir";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', "Aprende cómo funcionan las subastas del BOE en España: procedimientos, análisis de cargas y estrategias de inversión inmobiliaria segura.");
    }

    // Open Graph Tags
    const setMeta = (property: string, content: string) => {
        let element = document.head.querySelector(`meta[property="${property}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('property', property);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    setMeta('og:title', "Subastas BOE en España | Guía Completa para Invertir");
    setMeta('og:description', "Aprende cómo funcionan las subastas del BOE en España: procedimientos, análisis de cargas y estrategias de inversión inmobiliaria segura.");
    setMeta('og:type', "article");
    setMeta('og:url', "https://activosoffmarket.es/subastas-boe/");
    setMeta('og:image', IMG_HERO);
    setMeta('og:site_name', "Activos Off-Market");

    // Schema.org Structured Data
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Subastas BOE en España: Cómo Funcionan y Cómo Invertir con Seguridad",
      "description": "Guía completa sobre el funcionamiento del Portal de Subastas del BOE, tipos de subastas y análisis de riesgos.",
      "image": [IMG_HERO],
      "datePublished": "2024-01-15T09:00:00+01:00",
      "dateModified": schemaDate,
      "author": {
        "@type": "Person",
        "name": "José de la Peña",
        "url": "https://activosoffmarket.es/quien-soy"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Activos Off-Market",
        "logo": {
          "@type": "ImageObject",
          "url": "https://activosoffmarket.es/favicon.ico"
        }
      }
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
      
      {/* HEADER SECTION */}
      <header className="bg-white pb-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
            <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
                <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
                <ChevronRight size={14} className="mx-2" />
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Subastas BOE</span>
            </nav>

            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-[1.1] tracking-tight">
                Subastas BOE en España: <br/>
                <span className="text-brand-700 italic">Cómo Funcionan y Cómo Invertir con Seguridad</span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                    <img src="/jose-de-la-pena-subastas-boe.jpg" alt="José de la Peña" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-none">José de la Peña</span>
                        <span className="text-xs text-brand-600 font-semibold mt-1 uppercase tracking-wide">Jurista</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                    <Calendar size={14} />
                    <span className="capitalize font-medium">{currentMonthYear}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                    <Clock size={14} />
                    <span className="font-medium">10 min lectura</span>
                </div>
            </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* MAIN CONTENT */}
        <main className="lg:col-span-8">
            <article className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-loose prose-li:leading-relaxed">
                
                {/* FEATURED IMAGE */}
                <figure className="mb-12 -mt-6">
                    <img 
                        src={IMG_HERO} 
                        alt="Portal de Subastas del BOE en ordenador"
                        width="1200"
                        height="630"
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                    />
                </figure>

                {/* INTRODUCCIÓN */}
                <p className="text-xl text-slate-700 leading-relaxed font-light mb-10 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                    Las <strong>subastas del BOE</strong> son el mecanismo oficial del Estado español para la venta forzosa de bienes (inmuebles, vehículos, etc.) con el fin de saldar deudas impagadas. Desde 2015, todas estas licitaciones se centralizan en un único portal electrónico, lo que ha democratizado el acceso a activos que antes estaban reservados a "subasteros" profesionales.
                </p>
                
                <p>
                   Sin embargo, la accesibilidad digital no elimina la complejidad jurídica. El Portal de Subastas del BOE es solo un tablón de anuncios; la seguridad de tu inversión depende de tu capacidad para analizar lo que hay detrás de cada expediente.
                </p>

                {/* H2: QUÉ SON */}
                <h2 id="que-son" className="text-3xl mt-16 mb-8 flex items-center gap-3">
                    <Globe className="text-brand-600" /> ¿Qué son las subastas del BOE?
                </h2>
                <p>
                    Es una plataforma pública gestionada por la Agencia Estatal Boletín Oficial del Estado. Funciona como un <em>marketplace</em> oficial donde diferentes organismos (Juzgados, Notarios, Hacienda, Seguridad Social) publican los bienes embargados para que cualquier ciudadano pueda pujar por ellos de forma telemática y anónima.
                </p>
                <p>
                    La principal ventaja es el <strong>precio</strong>. Al tratarse de una ejecución forzosa, los precios de salida no existen (se puede pujar desde 1€, aunque con matices) y las adjudicaciones suelen cerrarse con descuentos significativos respecto al mercado libre.
                </p>

                {/* H2: DIFERENCIAS */}
                <h2 id="tipos" className="text-3xl mt-16 mb-8">Diferencia entre subastas judiciales, AEAT y Seguridad Social</h2>
                <p>
                    Uno de los errores más comunes es pensar que todas las subastas del BOE funcionan igual. Nada más lejos de la realidad. El organismo de origen determina la normativa aplicable y el riesgo de la operación.
                </p>

                <div className="grid gap-6 my-8 not-prose">
                    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:border-brand-300 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <Gavel className="text-brand-600" size={24} />
                            <h3 className="font-bold text-slate-900 text-xl">1. Subastas Judiciales</h3>
                        </div>
                        <p className="text-slate-600 text-sm mb-3">
                            Son las más comunes y derivan de ejecuciones hipotecarias o reclamaciones de cantidad en juzgados civiles. Se rigen por la Ley de Enjuiciamiento Civil (LEC).
                        </p>
                        <Link to={ROUTES.GUIDE_PILLAR} className="text-brand-700 font-bold text-sm hover:underline flex items-center gap-1">
                            Ver guía detallada de subastas judiciales <ArrowRight size={14}/>
                        </Link>
                    </div>

                    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:border-brand-300 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <Building2 className="text-brand-600" size={24} />
                            <h3 className="font-bold text-slate-900 text-xl">2. Subastas AEAT (Hacienda)</h3>
                        </div>
                        <p className="text-slate-600 text-sm mb-3">
                            Administrativas. Derivan de deudas tributarias. Tienen su propia normativa (Reglamento General de Recaudación) y particularidades en cuanto a la entrega de posesión.
                        </p>
                        <Link to={ROUTES.COMPARISON} className="text-brand-700 font-bold text-sm hover:underline flex items-center gap-1">
                            Comparativa Judicial vs AEAT <ArrowRight size={14}/>
                        </Link>
                    </div>

                    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:border-brand-300 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <ShieldCheck className="text-brand-600" size={24} />
                            <h3 className="font-bold text-slate-900 text-xl">3. Seguridad Social</h3>
                        </div>
                        <p className="text-slate-600 text-sm">
                            Similares a las de Hacienda, para saldar deudas de cuotas. Suelen tener un sistema de gestión propio y a veces menos concurrencia.
                        </p>
                    </div>
                </div>

                {/* BLOQUE DESTACADO SEO: INTERLINKING ESTRATÉGICO */}
                <div className="bg-brand-50 border-l-4 border-brand-700 p-8 rounded-r-xl my-12 not-prose shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-brand-900 mb-4 flex items-center gap-2">
                            <Gavel className="text-brand-600" size={28} /> Subastas Judiciales: El Tipo Más Relevante del BOE
                        </h2>
                        <p className="text-slate-700 mb-6 leading-relaxed text-lg">
                            Aunque el Portal del BOE agrupa subastas de Hacienda y Seguridad Social, <strong>la inmensa mayoría de las oportunidades inmobiliarias rentables provienen de los Juzgados</strong> (ejecuciones hipotecarias). 
                        </p>
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            Es vital dominar su normativa específica (LEC) porque ofrece mayores garantías de "purga de cargas" que las subastas administrativas.
                        </p>
                        <Link to={ROUTES.GUIDE_PILLAR} className="inline-flex items-center gap-2 bg-brand-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-800 transition-all shadow-md transform hover:-translate-y-1">
                            Guía Completa de Subastas Judiciales <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* H2: ACCESO */}
                <h2 id="acceso" className="text-3xl mt-16 mb-8">Cómo acceder al portal oficial</h2>
                <p>
                    Para participar, necesitas cumplir tres requisitos técnicos básicos:
                </p>
                <ol className="list-decimal pl-6 space-y-4 my-6">
                    <li><strong>Identificación Digital:</strong> Necesitas un Certificado Digital (FNMT) o estar dado de alta en el sistema Cl@ve.</li>
                    <li><strong>Registro en el Portal:</strong> Debes crearte una cuenta de usuario en <a href="https://subastas.boe.es/" target="_blank" rel="nofollow noopener noreferrer" className="text-brand-700 underline hover:text-brand-900">subastas.boe.es</a>.</li>
                    <li><strong>Depósito previo:</strong> Para pujar por cualquier bien, es obligatorio consignar el 5% del valor de tasación.</li>
                </ol>
                
                <div className="bg-brand-50 p-6 rounded-xl border-l-4 border-brand-500 my-8 not-prose">
                    <p className="m-0 text-slate-700 text-sm leading-relaxed">
                        <strong>Dato Importante:</strong> El depósito se realiza telemáticamente a través de la pasarela de pagos de la AEAT conectada con tu banco. Si no ganas, te lo devuelven automáticamente.
                    </p>
                    <div className="mt-4">
                        <Link to={ROUTES.DEPOSIT} className="text-brand-800 font-bold text-sm hover:underline">
                            Lee todo sobre el depósito del 5% y sus plazos →
                        </Link>
                    </div>
                </div>

                {/* H2: RIESGOS */}
                <h2 id="riesgos" className="text-3xl mt-16 mb-8 flex items-center gap-3">
                    <AlertTriangle className="text-amber-500" /> Riesgos y oportunidades reales
                </h2>
                <p>
                    El portal del BOE ofrece poca información. Verás una descripción básica y, con suerte, la referencia catastral. Lo que <strong>NO</strong> verás en el portal son los problemas que pueden arruinar tu inversión.
                </p>
                
                <ul className="space-y-4 my-8 list-none pl-0">
                    <li className="flex gap-4">
                        <div className="bg-red-100 p-2 rounded-lg h-fit text-red-700"><Search size={20} /></div>
                        <div>
                            <strong className="block text-slate-900">Cargas Ocultas</strong>
                            <span className="text-slate-600 text-sm">Las deudas anteriores a la subasta (hipotecas previas) NO se cancelan. Tú las heredas.</span>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <div className="bg-red-100 p-2 rounded-lg h-fit text-red-700"><ArrowRight size={20} /></div>
                        <div>
                            <strong className="block text-slate-900">Sin Posesión Inmediata</strong>
                            <span className="text-slate-600 text-sm">No te entregan las llaves al ganar. Debes pedir la posesión al juez, y si hay ocupantes, el proceso se alarga.</span>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <div className="bg-red-100 p-2 rounded-lg h-fit text-red-700"><Scale size={20} /></div>
                        <div>
                            <strong className="block text-slate-900">Firmeza de la Adjudicación</strong>
                            <span className="text-slate-600 text-sm">Si pujas poco, el banco o el deudor pueden mejorar tu oferta a posteriori. Esto depende de la <Link to={ROUTES.RULE_70} className="text-brand-700 underline font-bold">regla del 70%</Link>.</span>
                        </div>
                    </li>
                </ul>

                {/* H2: ANÁLISIS */}
                <h2 id="analisis" className="text-3xl mt-16 mb-8">Cómo analizar una subasta antes de pujar</h2>
                <p>
                    Nunca confíes ciegamente en los datos del BOE. El "Valor de Subasta" suele estar desactualizado (tasaciones de la época del boom inmobiliario). Tu trabajo como inversor es realizar una <em>Due Diligence</em> completa.
                </p>

                <figure className="my-10">
                    <img 
                        src={IMG_PORTAL} 
                        alt="Análisis de expediente de subasta" 
                        width="800"
                        height="450"
                        loading="lazy"
                        className="w-full h-auto object-cover rounded-2xl shadow-lg" 
                    />
                </figure>

                <p>
                    El proceso resumido debe ser:
                </p>
                <ol className="list-decimal pl-6 space-y-3 mb-10">
                    <li><strong>Descarga la Certificación de Cargas:</strong> Es el documento más importante.</li>
                    <li><strong>Calcula las cargas anteriores:</strong> Resta ese importe de tu valoración de mercado.</li>
                    <li><strong>Investiga la ocupación:</strong> ¿Viven los propietarios o hay inquilinos?</li>
                    <li><strong>Define tu precio máximo:</strong> Descuenta ITP, reformas y margen de beneficio.</li>
                </ol>

                <div className="not-prose mt-8 mb-12">
                    <Link 
                        to={ROUTES.ANALYSIS} 
                        className="block bg-brand-50 border border-brand-200 rounded-xl p-6 hover:bg-brand-100 transition-colors group"
                    >
                        <h3 className="text-xl font-bold text-brand-900 mb-2 flex items-center gap-2">
                            <BookOpen size={24} className="text-brand-600"/> 
                            Guía Paso a Paso
                        </h3>
                        <p className="text-slate-700 mb-0 group-hover:text-slate-900">
                            Accede a nuestro tutorial detallado: <strong>Cómo analizar una subasta judicial paso a paso →</strong>
                        </p>
                    </Link>
                </div>

                <hr className="my-16 border-slate-200" />

                <p className="text-lg text-slate-600 font-light italic">
                    Invertir en subastas del BOE es rentable, pero exige profesionalidad. No es un juego de azar, es un mercado técnico donde la información es la clave del éxito.
                </p>

            </article>
        </main>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-10 max-h-[calc(100vh-120px)] overflow-auto pr-2 custom-scrollbar">
            
            {/* CTA TELEGRAM */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 block flex items-center gap-2">
                    <ShieldCheck size={14} /> Oportunidades Verificadas
                </span>
                <h3 className="font-serif text-2xl font-bold mb-4 leading-tight">
                    Evita buscar agujas en un pajar
                </h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    Filtro diariamente el BOE para encontrar las subastas que sí tienen margen. Recíbelas en tu móvil.
                </p>
                <a 
                    href="https://t.me/activosoffmarket" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-white text-slate-900 font-bold py-4 px-4 rounded-xl text-center hover:bg-brand-50 transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2 group"
                >
                    Entrar al Canal <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                </a>
                <p className="text-xs text-center text-slate-500 mt-4">Únete a +2.500 inversores</p>
            </div>

            {/* RELATED NAVIGATION */}
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <BookOpen size={18} className="text-brand-600"/>
                    Recursos Relacionados
                </h4>
                <nav className="space-y-4">
                    <Link to={ROUTES.GUIDE_PILLAR} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Subastas Judiciales</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.RULE_70} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Regla del 70%</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.DEPOSIT} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Depósito del 5%</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.ANALYSIS} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Análisis Paso a Paso</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                </nav>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
};

export default SubastasBOEPage;