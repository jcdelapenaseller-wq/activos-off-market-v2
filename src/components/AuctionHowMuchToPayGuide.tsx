import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronRight, ArrowRight, BookOpen, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import LeadMagnetBlock from './LeadMagnetBlock';

const AuctionHowMuchToPayGuide: React.FC = () => {
  const IMG_HERO = "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1200&h=630"; 

  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  const [readTime, setReadTime] = useState(4);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Cuánto pagar en una subasta judicial | Guía para inversores",
    "description": "Aprende cómo calcular el precio máximo que deberías pagar en una subasta judicial incluyendo impuestos, reformas y margen de seguridad.",
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
      "@id": "https://activosoffmarket.es/cuanto-pagar-subasta-judicial"
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

    document.title = "Cuánto pagar en una subasta judicial | Guía para inversores";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Aprende cómo calcular el precio máximo que deberías pagar en una subasta judicial incluyendo impuestos, reformas y margen de seguridad.");

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
    setMeta('og:title', 'Cuánto pagar en una subasta judicial | Guía para inversores');
    setMeta('og:description', 'Aprende cómo calcular el precio máximo que deberías pagar en una subasta judicial incluyendo impuestos, reformas y margen de seguridad.');
    setMeta('og:image', IMG_HERO);
    setMeta('og:url', 'https://activosoffmarket.es/cuanto-pagar-subasta-judicial');
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
    canonical.setAttribute('href', "https://activosoffmarket.es/cuanto-pagar-subasta-judicial");

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
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Cuánto Pagar</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Cuánto pagar en una subasta judicial
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
                  alt="Cuánto pagar en una subasta judicial" 
                  width="1200" 
                  height="630"
                  className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                  // @ts-ignore
                  fetchpriority="high"
                />
              </figure>

              <p className="text-xl leading-relaxed mb-8 font-light first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                Uno de los mayores errores que cometen los inversores novatos es basar su puja en el valor de tasación que publica el BOE. El precio de adjudicación nunca debe basarse en ese dato, sino en el valor real de mercado actual del inmueble.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Cómo determinar el precio máximo de puja</h2>
              <p>
                Para saber cuánto es razonable pagar por un inmueble en subasta, debes calcular tu precio máximo de puja. Este límite no es arbitrario, sino que depende directamente de varios factores clave:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li><strong>Valor real de mercado:</strong> El precio por el que podrías vender el inmueble hoy mismo, una vez reformado y vacío.</li>
                <li><strong>Costes de reforma:</strong> El presupuesto necesario para adecuar la vivienda para su venta o alquiler.</li>
                <li><strong>Impuestos (ITP):</strong> El Impuesto de Transmisiones Patrimoniales que deberás liquidar tras la adjudicación.</li>
                <li><strong>Deudas heredadas:</strong> IBI atrasado y cuotas pendientes de la comunidad de propietarios.</li>
                <li><strong>Margen de seguridad:</strong> El beneficio que esperas obtener por asumir el riesgo y el trabajo de la operación.</li>
              </ul>
              <p>
                Como regla general, muchos inversores profesionales aplican descuentos de entre el <strong>20% y el 40%</strong> respecto al valor de mercado a la hora de fijar su puja máxima, garantizando así un margen de seguridad suficiente ante imprevistos.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Ejemplo práctico de cálculo</h2>
              <p>
                Veamos un ejemplo simple para entender cómo se estructuran los números antes de decidir cuánto pagar:
              </p>

              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm my-8">
                <ul className="space-y-4 text-slate-700 font-medium">
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Valor de mercado:</span> <span>200.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Precio adjudicación posible:</span> <span>130.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Reforma:</span> <span>25.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>ITP:</span> <span>7.800€</span>
                    </li>
                    <li className="flex justify-between pt-4 font-bold text-lg text-slate-900 border-t-2 border-slate-200">
                        <span>Coste total aproximado:</span> <span>162.800€</span>
                    </li>
                    <li className="flex justify-between text-brand-700 font-bold text-xl mt-4">
                        <span>Beneficio potencial:</span> <span>37.200€</span>
                    </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">La regla del 70% en subastas judiciales</h2>
              <p>
                A la hora de decidir cuánto pagar, es fundamental conocer el artículo 670 de la Ley de Enjuiciamiento Civil (LEC). Este artículo establece que si la mejor postura es igual o superior al 70% del valor por el que el bien hubiere salido a subasta, se aprobará el remate a favor del mejor postor.
              </p>
              <p>
                Pujar por debajo de este porcentaje es posible, pero abre la puerta a que el deudor presente a un tercero o que el acreedor se adjudique el bien, complicando la operación. Para entender a fondo cómo funciona este mecanismo, te recomiendo leer nuestra guía sobre la <Link to={ROUTES.RULE_70} className="text-brand-700 font-bold hover:underline">regla del 70% en subasta judicial</Link>.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Errores frecuentes al decidir cuánto pagar</h2>
              <p>
                Fijar el precio máximo de puja de forma incorrecta suele ser consecuencia de estos errores típicos:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li><strong>Confiar en la tasación BOE:</strong> Como hemos mencionado, es un valor a efectos de subasta, no el valor real de mercado actual.</li>
                <li><strong>No calcular impuestos:</strong> El ITP y los gastos de notaría/registro merman directamente tu beneficio.</li>
                <li><strong>Ignorar cargas registrales:</strong> Las cargas anteriores o preferentes no se cancelan y deberás asumirlas.</li>
                <li><strong>Subestimar reformas:</strong> Un inmueble procedente de embargo suele requerir una inversión importante en adecuación.</li>
              </ul>

              <div className="bg-brand-50 border border-brand-100 p-8 rounded-2xl my-12">
                  <p className="text-brand-900 font-medium text-lg m-0 flex items-start gap-4">
                      <Calculator className="text-brand-600 shrink-0 mt-1" size={24} />
                      <span>Si quieres calcular automáticamente cuánto pagar por una subasta, puedes utilizar esta <Link to={ROUTES.CALCULATOR} className="text-brand-700 font-bold hover:underline">calculadora de subastas judiciales</Link>.</span>
                  </p>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">También puede interesarte:</h3>
                <ul className="list-none pl-0 space-y-3">
                  <li>
                    <Link to={ROUTES.PROFITABILITY} className="text-brand-700 font-medium hover:underline flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                      Cómo calcular la rentabilidad de una subasta judicial
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.MAX_BID} className="text-brand-700 font-medium hover:underline flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                      Cómo calcular la puja máxima en una subasta
                    </Link>
                  </li>
                </ul>
              </div>

              <LeadMagnetBlock />
            </article>
        </main>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-10 max-h-[calc(100vh-120px)] overflow-auto pr-2 custom-scrollbar">
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
                    <Link to={ROUTES.PROFITABILITY} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Calcular Rentabilidad</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.ANALYSIS} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cómo Analizar Subastas</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.ERRORS} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Errores Frecuentes</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                     <Link to={ROUTES.RULE_70} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Regla del 70%</span>
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

export default AuctionHowMuchToPayGuide;
