import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronRight, EyeOff, Search, Home, AlertTriangle, ShieldCheck, DoorClosed, Footprints, Eye, Lock, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import LeadMagnetBlock from './LeadMagnetBlock';

const AuctionVisitGuide: React.FC = () => {
  
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  // State for read time
  const [readTime, setReadTime] = useState(3);

  // Imágenes seleccionadas (Unsplash IDs estables)
  const IMG_HERO = "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=1200&h=630"; // Puerta cerrada / Llaves
  const IMG_INSPECTION = "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800&h=450"; // Inspección / Lupa
  const IMG_NEIGHBORHOOD = "https://images.unsplash.com/photo-1444723121867-c61e74e36b1f?auto=format&fit=crop&q=80&w=800&h=450"; // Calle / Vecindario

  // Schema.org Article Structured Data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "¿Se Puede Visitar un Inmueble en Subasta Judicial? (Guía Realista 2025)",
    "description": "Descubre si es posible visitar una vivienda en subasta judicial, cuándo se permite y cómo evaluar el riesgo si no puedes acceder al inmueble.",
    "author": {
      "@type": "Person",
      "name": "José de la Peña",
      "jobTitle": "Consultor especializado en análisis de subastas públicas",
      "url": "https://activosoffmarket.es/quien-soy"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Activos Off-Market",
      "logo": {
        "@type": "ImageObject",
        "url": "https://activosoffmarket.es/logo.png"
      }
    },
    "datePublished": "2023-11-22T09:00:00+01:00",
    "dateModified": schemaDate,
    "image": [IMG_HERO],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://activosoffmarket.es/visitar-inmueble-subasta-judicial/"
    }
  };

  useEffect(() => {
    // Read Time Calculation
    const article = document.querySelector('article');
    if (article) {
      const text = article.innerText;
      const words = text.trim().split(/\s+/).length;
      const time = Math.ceil(words / 200);
      setReadTime(Math.max(3, time));
    }

    // SEO
    document.title = "¿Se Puede Visitar un Inmueble en Subasta Judicial? | BOE 2025";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', "Descubre si es posible visitar una vivienda en subasta judicial, cuándo se permite y cómo evaluar el riesgo si no puedes acceder al inmueble.");
    }
    window.scrollTo(0, 0);

    // Inject JSON-LD
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
                <Link to={ROUTES.GUIDE_PILLAR} className="hover:text-brand-600 transition-colors">Guía Subastas</Link>
                <ChevronRight size={14} />
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Visitar Inmueble</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                ¿Se Puede Visitar un Inmueble en <br/>
                <span className="text-brand-700 italic">Subasta Judicial? (Guía Realista 2025)</span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                    <img 
                      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzI5M2Y1NiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXNpemU9IjYwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zNWVtIj5KPC90ZXh0Pjwvc3ZnPg==" 
                      alt="José de la Peña" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md" 
                    />
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
                    <Clock size={14} />
                    <span>{readTime} min lectura</span>
                </div>
            </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* MAIN CONTENT */}
        <main className="lg:col-span-8">
            <article className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-loose">
                
                <figure className="mb-12 -mt-6">
                    <img 
                        src={IMG_HERO} 
                        alt="Puerta cerrada de vivienda en subasta judicial"
                        width="1200"
                        height="630"
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                    />
                </figure>

                <p className="text-xl text-slate-700 leading-relaxed font-light mb-10 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                    Es la pregunta más frecuente de todo inversor novato: <em>"¿Puedo ir a ver el piso antes de pujar?"</em>. 
                    La respuesta corta y honesta es: <strong>No, en el 95% de los casos no es posible visitar el inmueble</strong>.
                </p>
                
                <p>
                    A diferencia de una compraventa tradicional donde visitas la casa varias veces con la inmobiliaria, en el mercado de subastas del BOE compras "a ciegas" respecto al estado interior. No obstante, "a ciegas" no significa sin información. Existen métodos para reducir la incertidumbre.
                </p>

                <div className="bg-brand-50 p-6 rounded-xl border-l-4 border-brand-500 my-8 not-prose flex gap-4 items-start">
                    <EyeOff className="text-brand-600 flex-shrink-0 mt-1" size={24} />
                    <div>
                        <h3 className="font-bold text-brand-900 mb-1">Principio de "Cuerpo Cierto"</h3>
                        <p className="text-brand-800 m-0 text-sm leading-relaxed">
                            Jurídicamente, en subasta compras el bien como "cuerpo cierto". Asumes su estado físico y jurídico tal cual está. Si al abrir la puerta no hay cocina o las tuberías están rotas, no puedes reclamar al juzgado.
                        </p>
                    </div>
                </div>

                <h2 className="text-3xl mt-12 mb-6">Por qué no se puede visitar</h2>
                <p>
                    La vivienda subastada suele estar ocupada por el deudor (que va a perder su casa) o por inquilinos. El juzgado no tiene las llaves hasta que se ejecuta el lanzamiento (desalojo), lo cual ocurre meses después de la subasta.
                </p>
                <p>
                   Aunque la Ley de Enjuiciamiento Civil (LEC) prevé en su artículo 669 que el tribunal podrá acordar la inspección del inmueble si el ejecutado lo consiente, en la práctica:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>El ejecutado casi nunca consiente (por motivos obvios).</li>
                    <li>Los juzgados están saturados y no organizan visitas.</li>
                    <li>No hay agentes inmobiliarios intermediando.</li>
                </ul>

                <h2 className="text-3xl mt-12 mb-6">La excepción: Cuándo SÍ se puede ver</h2>
                <p>
                    Existen casos excepcionales, que suelen ser "unicornios" en el BOE, pero ocurren:
                </p>
                <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <DoorClosed size={20} className="text-green-600"/> Inmuebles Vacíos y en Posesión
                        </h3>
                        <p className="text-sm text-slate-600">
                            A veces, si el procedimiento es una liquidación concursal (empresa) o si el banco ya tomó posesión previamente, las llaves pueden estar en el juzgado o en manos del administrador concursal, quien sí organiza visitas.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <ShieldCheck size={20} className="text-brand-600"/> Colaboración del Ejecutado
                        </h3>
                        <p className="text-sm text-slate-600">
                            Si el deudor quiere vender rápido para saldar la deuda (y quizás quedarse con el sobrante), podría acceder a enseñar la casa. Es muy raro, pero posible.
                        </p>
                    </div>
                </div>

                <figure className="my-12">
                    <img 
                        src={IMG_INSPECTION} 
                        alt="Inspección visual exterior"
                        width="800"
                        height="450"
                        className="rounded-2xl shadow-lg w-full object-cover"
                    />
                    <figcaption className="text-center text-sm text-slate-500 mt-2">La inspección exterior es obligatoria para cualquier inversor serio.</figcaption>
                </figure>

                <h2 className="text-3xl mt-12 mb-6">Qué investigar si no puedes entrar</h2>
                <p>
                    Si no puedes ver el interior, debes convertirte en un detective inmobiliario. Tu objetivo es descartar la "ruina" y estimar el coste de reforma.
                </p>

                <div className="space-y-6 my-8 not-prose">
                    <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="bg-slate-100 p-2 h-fit rounded-lg text-slate-700 font-bold"><Search size={20} /></div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">1. Visita Exterior y Vecindario</h3>
                            <p className="text-slate-600 text-sm mt-1">
                                ¿En qué estado está la fachada? ¿Hay luz en las ventanas por la noche? ¿El buzón está lleno de cartas? Habla con el portero o los vecinos; suelen ser la mejor fuente de información sobre quién vive allí y cómo está el piso.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="bg-slate-100 p-2 h-fit rounded-lg text-slate-700 font-bold"><Home size={20} /></div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">2. Antigüedad y Calidades</h3>
                            <p className="text-slate-600 text-sm mt-1">
                                Usa Google Street View y la Sede Electrónica del Catastro para ver el año de construcción. Si el edificio es de 1970 y no se ve reforma exterior, asume que las tuberías y electricidad son de origen.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="bg-slate-100 p-2 h-fit rounded-lg text-slate-700 font-bold"><AlertTriangle size={20} /></div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">3. Estrategia de Costes</h3>
                            <p className="text-slate-600 text-sm mt-1">
                                En tu Excel de inversión, añade siempre una partida de <strong>"Reforma Integral"</strong> (aprox. 500-700€/m²). Si el piso está bien, será beneficio extra. Si está destrozado, ya lo tenías contemplado. Nunca asumas que está "para entrar a vivir".
                            </p>
                        </div>
                    </div>
                </div>

                <figure className="my-12">
                    <img 
                        src={IMG_NEIGHBORHOOD} 
                        alt="Entorno y vecindario del inmueble"
                        width="800"
                        height="450"
                        className="rounded-2xl shadow-lg w-full object-cover"
                    />
                    <figcaption className="text-center text-sm text-slate-500 mt-2">El estado de las zonas comunes (buzones, escalera) dice mucho del interior.</figcaption>
                </figure>

                <h2 className="text-3xl mt-12 mb-6">Conclusión</h2>
                <p>
                    No poder visitar el inmueble es la principal barrera de entrada para el gran público, y precisamente por eso existen los descuentos en las subastas. Es el "premio" por asumir ese riesgo.
                </p>
                <p>
                    Si no estás dispuesto a comprar sin ver, las subastas judiciales probablemente no sean para ti. Si aceptas el riesgo, mitígalo con información exterior y márgenes de seguridad amplios.
                </p>

                <hr className="my-16 border-slate-200" />

                {/* FAQ */}
                <section className="not-prose bg-slate-50 p-10 rounded-3xl border border-slate-200">
                    <h2 className="font-serif text-2xl font-bold text-slate-900 mb-8">Preguntas Frecuentes</h2>
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Puedo pedir las llaves al juzgado antes de la subasta?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">No. El juzgado no tiene las llaves hasta que se ha consumado la subasta, se ha dictado adjudicación y se ejecuta el lanzamiento.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Qué pasa si al entrar está destrozado?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Es tu responsabilidad. No puedes reclamar ni devolver el bien. Por eso siempre debes presupuestar el "peor escenario" posible en tu puja.</p>
                        </div>
                    </div>
                </section>
                
                <LeadMagnetBlock />
            </article>
        </main>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-10 max-h-[calc(100vh-120px)] overflow-auto pr-2 custom-scrollbar">
            
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 block">Canal de Alertas</span>
                <h3 className="font-serif text-2xl font-bold mb-4">No compres a ciegas del todo</h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    En el canal Premium te enseño trucos para averiguar el estado del inmueble sin entrar (cargas registrales, informes de tasación antiguos, etc.).
                </p>
                <a 
                    href="https://t.me/activosoffmarket" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-white text-slate-900 font-bold py-4 px-4 rounded-xl text-center hover:bg-brand-50 transition-all flex items-center justify-center gap-2"
                >
                    Ver Canal Telegram <ArrowRight size={16}/>
                </a>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <BookOpen size={18} className="text-brand-600"/>
                    Guías Relacionadas
                </h4>
                <nav className="space-y-4">
                    <Link to={ROUTES.OCCUPIED} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Vivienda Ocupada</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.ANALYSIS} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Análisis Paso a Paso</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.GUIDE_PILLAR} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Guía General Subastas</span>
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

export default AuctionVisitGuide;