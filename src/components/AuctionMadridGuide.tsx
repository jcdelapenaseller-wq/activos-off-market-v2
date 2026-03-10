import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronRight, ArrowRight, BookOpen, Calculator, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import LeadMagnetBlock from './LeadMagnetBlock';

const AuctionMadridGuide: React.FC = () => {
  const IMG_HERO = "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80&w=1200&h=630"; 

  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  const [readTime, setReadTime] = useState(5);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Subastas judiciales en Madrid | Guía para inversores",
    "description": "Aprende cómo encontrar y analizar subastas judiciales en Madrid. Incluye ejemplos reales y cálculo de rentabilidad.",
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
    "datePublished": "2024-01-15T09:00:00+01:00",
    "dateModified": schemaDate,
    "image": [IMG_HERO],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://activosoffmarket.es/subastas-madrid"
    }
  };

  useEffect(() => {
    const article = document.querySelector('article');
    if (article) {
      const text = article.innerText;
      const words = text.trim().split(/\s+/).length;
      const time = Math.ceil(words / 200);
      setReadTime(Math.max(3, time));
    }

    window.scrollTo(0, 0);

    document.title = "Subastas judiciales en Madrid | Guía para inversores";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Aprende cómo encontrar y analizar subastas judiciales en Madrid. Incluye ejemplos reales y cálculo de rentabilidad.");

    const setMeta = (property: string, content: string) => {
        let element = document.querySelector(`meta[property="${property}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('property', property);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    setMeta('og:type', 'article');
    setMeta('og:title', 'Subastas judiciales en Madrid | Guía para inversores');
    setMeta('og:description', 'Aprende cómo encontrar y analizar subastas judiciales en Madrid. Incluye ejemplos reales y cálculo de rentabilidad.');
    setMeta('og:image', IMG_HERO);
    setMeta('og:url', 'https://activosoffmarket.es/subastas-madrid');
    setMeta('og:site_name', 'Activos Off-Market');

    let twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
        twitterCard = document.createElement('meta');
        twitterCard.setAttribute('name', 'twitter:card');
        document.head.appendChild(twitterCard);
    }
    twitterCard.setAttribute('content', 'summary_large_image');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', "https://activosoffmarket.es/subastas-madrid");

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
      
      <header className="bg-white pt-32 pb-12 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium flex-wrap gap-2" aria-label="Breadcrumb">
                <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
                <ChevronRight size={14} />
                <Link to={ROUTES.GUIDE_PILLAR} className="hover:text-brand-600 transition-colors">Guía Subastas</Link>
                <ChevronRight size={14} />
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Subastas en Madrid</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Subastas judiciales en Madrid: cómo encontrarlas y analizarlas
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                    <img 
                      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzI5M2Y1NiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXNpemU9IjYwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zNWVtIj5KPC90ZXh0Pjwvc3ZnPg==" 
                      alt="José de la Peña" 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200" 
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

      <div className="container mx-auto px-4 md:px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-7xl">
        
        <main className="lg:col-span-8">
            <article className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-loose">
          
              <figure className="mb-12 -mt-6">
                <img 
                  src={IMG_HERO} 
                  alt="Subastas judiciales en Madrid" 
                  width="1200" 
                  height="630"
                  className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                  // @ts-ignore
                  fetchpriority="high"
                />
              </figure>

              <p className="text-xl leading-relaxed mb-8 font-light first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                Madrid es, sin duda, una de las ciudades con mayor actividad y volumen de subastas inmobiliarias en toda España. El dinamismo de su mercado inmobiliario hace que constantemente surjan oportunidades de inversión a través de la vía judicial y administrativa.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Dónde encontrar subastas judiciales en Madrid</h2>
              <p>
                Para localizar subastas de pisos, locales o garajes en la Comunidad de Madrid, debes acudir a las fuentes oficiales. Las principales son:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li><strong>Portal de Subastas del BOE:</strong> Es la plataforma centralizada del Estado. Aquí se publican la inmensa mayoría de las subastas inmobiliarias, tanto judiciales como notariales.</li>
                <li><strong>Subastas de Hacienda (AEAT):</strong> La Agencia Tributaria realiza sus propias subastas por embargos de deudas fiscales. También se anuncian y celebran a través del portal del BOE.</li>
                <li><strong>Ejecuciones hipotecarias:</strong> Son el tipo de subasta judicial más común, derivadas del impago de préstamos hipotecarios a entidades bancarias.</li>
              </ul>
              <p>
                En resumen, si quieres buscar oportunidades en Madrid, tu principal herramienta de trabajo diaria debe ser el buscador avanzado del portal oficial del BOE.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Barrios de Madrid donde aparecen más subastas</h2>
              <p>
                Las subastas no se distribuyen de manera uniforme por toda la ciudad. Suelen concentrarse en zonas con mayor densidad de población y mayor rotación inmobiliaria. Algunos de los distritos y barrios de Madrid donde es más frecuente encontrar subastas son:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li>Carabanchel</li>
                <li>Puente de Vallecas</li>
                <li>Usera</li>
                <li>Tetuán</li>
                <li>Villaverde</li>
              </ul>
              <p>
                Estos barrios suelen ofrecer rentabilidades por alquiler (yield) más atractivas, lo que los convierte en el objetivo principal de muchos inversores que acuden a las subastas para comprar para alquilar (Buy to Let).
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Ejemplo real de cálculo de una subasta en Madrid</h2>
              <p>
                Para entender los números de una operación típica en la capital, veamos un ejemplo simple:
              </p>

              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm my-8">
                <ul className="space-y-4 text-slate-700 font-medium">
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Valor de mercado:</span> <span>240.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Precio posible de adjudicación:</span> <span>150.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Reforma estimada:</span> <span>30.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>ITP Madrid (6%):</span> <span>9.000€</span>
                    </li>
                    <li className="flex justify-between pt-4 font-bold text-lg text-slate-900 border-t-2 border-slate-200">
                        <span>Coste total aproximado:</span> <span>189.000€</span>
                    </li>
                    <li className="flex justify-between text-brand-700 font-bold text-xl mt-4">
                        <span>Beneficio potencial:</span> <span>51.000€</span>
                    </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Cómo calcular la rentabilidad de una subasta en Madrid</h2>
              <p>
                Como has visto en el ejemplo anterior, para calcular correctamente la rentabilidad de una subasta en Madrid es estrictamente necesario incluir en tus números:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li>El <strong>precio de adjudicación</strong> (tu puja ganadora).</li>
                <li>Los <strong>impuestos (ITP)</strong>, que en la Comunidad de Madrid es del 6% con carácter general.</li>
                <li>El coste de la <strong>reforma</strong> o adecuación del inmueble.</li>
                <li>Las <strong>posibles deudas</strong> heredadas (IBI y cuotas de la comunidad de propietarios).</li>
              </ul>

              <div className="bg-brand-50 border border-brand-100 p-8 rounded-2xl my-12">
                  <p className="text-brand-900 font-medium text-lg m-0 flex items-start gap-4">
                      <Calculator className="text-brand-600 shrink-0 mt-1" size={24} />
                      <span>Puedes estimar automáticamente la rentabilidad de una operación utilizando esta <Link to={ROUTES.CALCULATOR} className="text-brand-700 font-bold hover:underline">calculadora de subastas judiciales</Link>.</span>
                  </p>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Preguntas frecuentes sobre subastas en Madrid</h2>
              
              <div className="space-y-6 my-8">
                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                    <HelpCircle size={20} className="text-brand-600" />
                    ¿Se pueden visitar los pisos antes de la subasta?
                  </h3>
                  <p className="text-slate-600 m-0">
                    Por norma general, no. Al tratarse de inmuebles embargados, a menudo siguen ocupados por el deudor o por inquilinos. No existen "jornadas de puertas abiertas" oficiales.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                    <HelpCircle size={20} className="text-brand-600" />
                    ¿Es posible financiar una subasta con hipoteca?
                  </h3>
                  <p className="text-slate-600 m-0">
                    Sí, es legalmente posible, pero en la práctica es muy complejo. Tienes un plazo muy corto (generalmente 40 días hábiles) para rematar el pago, por lo que los bancos tradicionales rara vez llegan a tiempo a menos que tengas el crédito pre-aprobado.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                    <HelpCircle size={20} className="text-brand-600" />
                    ¿Cuánto dinero se necesita para participar?
                  </h3>
                  <p className="text-slate-600 m-0">
                    Para poder pujar, necesitas depositar previamente el 5% del valor de tasación a efectos de subasta (no del valor de mercado). Si no ganas, el depósito se te devuelve íntegramente.
                  </p>
                </div>
              </div>

              <LeadMagnetBlock />
            </article>
        </main>

        <aside className="lg:col-span-4 space-y-10 sticky top-24">
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 block">Canal de Alertas</span>
                <h3 className="font-serif text-2xl font-bold mb-4">¿Te falta experiencia?</h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    En el canal Premium analizo yo las subastas por ti. Ahorra tiempo y evita errores de novato.
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
                    <Link to={ROUTES.HOW_MUCH_TO_PAY} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cuánto Pagar</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.PROFITABILITY} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Calcular Rentabilidad</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.ANALYSIS} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cómo Analizar Subastas</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                     <Link to={ROUTES.RULE_70} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Regla del 70%</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                </nav>
            </div>
        </aside>

      </div>
    </div>
  );
};

export default AuctionMadridGuide;
