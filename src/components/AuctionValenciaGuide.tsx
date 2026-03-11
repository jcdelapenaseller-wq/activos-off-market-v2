import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronRight, ArrowRight, BookOpen, Calculator, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import LeadMagnetBlock from './LeadMagnetBlock';

const AuctionValenciaGuide: React.FC = () => {
  const IMG_HERO = "https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&q=80&w=1200&h=630"; 

  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  const [readTime, setReadTime] = useState(5);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Subastas judiciales en Valencia | Guía para inversores",
    "description": "Aprende cómo encontrar y analizar subastas judiciales en Valencia. Incluye ejemplos reales y cálculo de rentabilidad.",
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
    "datePublished": "2024-03-10T09:00:00+01:00",
    "dateModified": schemaDate,
    "image": [IMG_HERO],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://activosoffmarket.es/subastas-valencia"
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

    document.title = "Subastas judiciales en Valencia | Guía para inversores";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Aprende cómo encontrar y analizar subastas judiciales en Valencia. Incluye ejemplos reales y cálculo de rentabilidad.");

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
    setMeta('og:title', 'Subastas judiciales en Valencia | Guía para inversores');
    setMeta('og:description', 'Aprende cómo encontrar y analizar subastas judiciales en Valencia. Incluye ejemplos reales y cálculo de rentabilidad.');
    setMeta('og:image', IMG_HERO);
    setMeta('og:url', 'https://activosoffmarket.es/subastas-valencia');
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
    canonical.setAttribute('href', "https://activosoffmarket.es/subastas-valencia");

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
      
      <header className="bg-white pb-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
            <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium flex-wrap gap-2" aria-label="Breadcrumb">
                <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
                <ChevronRight size={14} />
                <Link to={ROUTES.GUIDE_PILLAR} className="hover:text-brand-600 transition-colors">Guía Subastas</Link>
                <ChevronRight size={14} />
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Subastas en Valencia</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Subastas judiciales en Valencia: guía para inversores
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

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        <main className="lg:col-span-8">
            <article className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-loose">
          
              <figure className="mb-12 -mt-6">
                <img 
                  src={IMG_HERO} 
                  alt="Subastas judiciales en Valencia" 
                  width="1200" 
                  height="630"
                  className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                  // @ts-ignore
                  fetchpriority="high"
                />
              </figure>

              <p className="text-xl leading-relaxed mb-8 font-light first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                Valencia es actualmente una de las provincias con mayor actividad en subastas judiciales en España. El volumen constante de ejecuciones hipotecarias y procedimientos de apremio la convierten en un mercado prioritario para inversores inmobiliarios que buscan rentabilidades superiores a la media nacional.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Dónde encontrar subastas judiciales en Valencia</h2>
              <p>
                Para localizar oportunidades en la capital del Turia y su área metropolitana, el inversor debe monitorizar tres canales fundamentales:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li><strong>Portal de Subastas del BOE:</strong> Es el punto de encuentro oficial donde se centralizan todas las subastas judiciales de los juzgados de Valencia.</li>
                <li><strong>Subastas de la AEAT:</strong> La Agencia Tributaria subasta inmuebles en Valencia derivados de embargos por deudas fiscales, a menudo con condiciones de salida muy competitivas.</li>
                <li><strong>Ejecuciones hipotecarias judiciales:</strong> Procedimientos derivados del impago de préstamos bancarios, que representan el mayor volumen de activos residenciales en subasta.</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6">Zonas con más oportunidades en Valencia</h2>
              <p>
                Aunque las subastas pueden aparecer en cualquier punto de la ciudad, existen ciertos barrios y municipios donde la rotación de activos es históricamente más alta:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li><strong>Patraix y Benicalap:</strong> Zonas residenciales consolidadas con alta demanda de alquiler, ideales para estrategias de Buy to Let.</li>
                <li><strong>Poblats Marítims:</strong> Un área con gran potencial de revalorización debido a su proximidad a la costa y proyectos de renovación urbana.</li>
                <li><strong>L'Olivereta:</strong> Barrio tradicional donde suelen aparecer activos con precios de adjudicación muy por debajo de mercado.</li>
                <li><strong>Torrent y municipios del área metropolitana:</strong> Localidades como Paterna, Mislata o Torrent ofrecen un volumen significativo de subastas con un ticket de entrada más bajo que en el centro de la capital.</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6">Ejemplo real de cálculo de inversión en Valencia</h2>
              <p>
                Veamos cómo se estructuran los números en una operación típica en la Comunidad Valenciana, teniendo en cuenta su fiscalidad específica:
              </p>

              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm my-8">
                <ul className="space-y-4 text-slate-700 font-medium">
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Valor de mercado estimado:</span> <span>210.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Precio de adjudicación:</span> <span>140.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Reforma estimada:</span> <span>20.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>ITP Comunidad Valenciana (10%):</span> <span>14.000€</span>
                    </li>
                    <li className="flex justify-between pt-4 font-bold text-lg text-slate-900 border-t-2 border-slate-200">
                        <span>Coste total aproximado:</span> <span>174.000€</span>
                    </li>
                    <li className="flex justify-between text-brand-700 font-bold text-xl mt-4">
                        <span>Beneficio potencial:</span> <span>36.000€</span>
                    </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Cómo calcular la rentabilidad de una subasta en Valencia</h2>
              <p>
                A diferencia de otras regiones, el ITP en la Comunidad Valenciana se sitúa generalmente en el 10%, lo que impacta directamente en el margen de la operación. Es vital realizar un análisis de costes exhaustivo antes de consignar el depósito.
              </p>

              <div className="bg-brand-50 border border-brand-100 p-8 rounded-2xl my-12">
                  <p className="text-brand-900 font-medium text-lg m-0 flex items-start gap-4">
                      <Calculator className="text-brand-600 shrink-0 mt-1" size={24} />
                      <span>Puedes usar esta <Link to={ROUTES.CALCULATOR} className="text-brand-700 font-bold hover:underline">calculadora de subastas judiciales</Link> para estimar automáticamente el ROI, los impuestos y la puja máxima recomendada.</span>
                  </p>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Preguntas frecuentes (FAQ)</h2>
              
              <div className="space-y-6 my-8">
                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                    <HelpCircle size={20} className="text-brand-600" />
                    ¿Se puede visitar una vivienda en subasta en Valencia?
                  </h3>
                  <p className="text-slate-600 m-0">
                    En la inmensa mayoría de los casos, no. Al ser ejecuciones forzosas, el deudor no suele permitir el acceso. El análisis debe basarse en la certificación de cargas, el edicto y una inspección externa del edificio y la zona.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                    <HelpCircle size={20} className="text-brand-600" />
                    ¿Se puede pedir hipoteca para una subasta?
                  </h3>
                  <p className="text-slate-600 m-0">
                    Es posible, pero extremadamente difícil debido a los plazos de pago (40 días hábiles). La mayoría de los inversores utilizan fondos propios o líneas de crédito pre-aprobadas para asegurar el remate.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                    <HelpCircle size={20} className="text-brand-600" />
                    ¿Cuánto dinero necesito para participar?
                  </h3>
                  <p className="text-slate-600 m-0">
                    Como mínimo, debes disponer del 5% del valor de tasación para el depósito inicial. Si resultas ganador, deberás abonar el resto del precio de adjudicación en el plazo legal establecido.
                  </p>
                </div>
              </div>

              <LeadMagnetBlock />
            </article>
        </main>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-10 max-h-[calc(100vh-120px)] overflow-auto pr-2 custom-scrollbar">
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 block">Canal de Alertas</span>
                <h3 className="font-serif text-2xl font-bold mb-4">¿Buscas subastas en Valencia?</h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    En el canal Premium analizo las mejores oportunidades de la Comunidad Valenciana para que inviertas con seguridad.
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
                    <Link to={ROUTES.MADRID} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Subastas en Madrid</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.BARCELONA} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Subastas en Barcelona</span>
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
                    <Link to={ROUTES.SEVILLA} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Subastas en Sevilla</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.PROFITABILITY_CALC_GUIDE} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Calculadora Rentabilidad</span>
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

export default AuctionValenciaGuide;
