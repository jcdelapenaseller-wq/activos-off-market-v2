import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronRight, ArrowRight, BookOpen, CheckCircle, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import LeadMagnetBlock from './LeadMagnetBlock';

const AuctionProfitabilityGuide: React.FC = () => {
  const IMG_HERO = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200&h=630"; 

  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  const [readTime, setReadTime] = useState(4);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Cómo calcular la rentabilidad de una subasta judicial",
    "description": "Aprende cómo calcular la rentabilidad real de una subasta judicial incluyendo ITP, reforma y costes ocultos. Incluye ejemplo práctico.",
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
      "@id": "https://activosoffmarket.es/como-calcular-rentabilidad-subasta-judicial"
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

    document.title = "Cómo calcular la rentabilidad de una subasta judicial";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Aprende cómo calcular la rentabilidad real de una subasta judicial incluyendo ITP, reforma y costes ocultos. Incluye ejemplo práctico.");

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
    setMeta('og:title', 'Cómo calcular la rentabilidad de una subasta judicial');
    setMeta('og:description', 'Aprende cómo calcular la rentabilidad real de una subasta judicial incluyendo ITP, reforma y costes ocultos. Incluye ejemplo práctico.');
    setMeta('og:image', IMG_HERO);
    setMeta('og:url', 'https://activosoffmarket.es/como-calcular-rentabilidad-subasta-judicial');
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
    canonical.setAttribute('href', "https://activosoffmarket.es/como-calcular-rentabilidad-subasta-judicial");

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
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Calcular Rentabilidad</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Cómo calcular la rentabilidad de una subasta judicial
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
                  alt="Cálculo de rentabilidad en subastas judiciales" 
                  width="1200" 
                  height="630"
                  className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                  // @ts-ignore
                  fetchpriority="high"
                />
              </figure>

              <p className="text-xl leading-relaxed mb-8 font-light first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                Calcular correctamente la rentabilidad antes de pujar es el paso más crítico en cualquier inversión inmobiliaria, especialmente en las subastas judiciales. Un error de cálculo puede transformar una oportunidad aparente en una pérdida económica severa.
              </p>
              
              <p className="mb-8">
                En este artículo te explico de forma clara y directa cómo calcular la rentabilidad real de una subasta en España, qué costes ocultos debes considerar siempre y cómo evitar los errores más comunes.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Qué costes incluir al calcular una subasta judicial</h2>
              <p>
                El precio de adjudicación (lo que pujas) es solo una parte del coste total. Para no llevarte sorpresas, debes sumar siempre los siguientes conceptos:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li>
                  <strong>Precio de adjudicación:</strong> El importe final por el que ganas la subasta.
                </li>
                <li>
                  <strong>ITP (Impuesto de Transmisiones Patrimoniales):</strong> Varía según la comunidad autónoma (generalmente entre el 6% y el 10%). Se calcula sobre el valor de referencia o el precio de adjudicación (el mayor de los dos).
                </li>
                <li>
                  <strong>Costes de notaría y registro:</strong> Gastos derivados de la inscripción del decreto de adjudicación y mandamiento de cancelación de cargas en el Registro de la Propiedad.
                </li>
                <li>
                  <strong>Reforma:</strong> Estimación realista de los costes para adecuar la vivienda para su venta o alquiler.
                </li>
                <li>
                  <strong>Deudas heredadas:</strong> IBI (hasta 4 años) y cuotas de la comunidad de propietarios (año en curso y los 3 anteriores).
                </li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6">Cómo calcular el ROI de una subasta</h2>
              <p>
                El ROI (Retorno sobre la Inversión) es la métrica clave. Se calcula con esta fórmula básica:
              </p>
              
              <div className="bg-slate-900 text-white p-6 rounded-xl my-8 font-mono text-lg text-center shadow-lg">
                ROI = (Beneficio / Coste Total) × 100
              </div>

              <p>
                Para aplicar la fórmula, primero debes calcular el <strong>beneficio</strong>. Este se obtiene restando el <strong>coste total</strong> de la inversión al <strong>valor de mercado</strong> realista del inmueble una vez reformado.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Ejemplo real de cálculo de una subasta</h2>
              <p>
                Veamos un ejemplo simple con números redondos para ilustrar el proceso:
              </p>

              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm my-8">
                <ul className="space-y-4 text-slate-700 font-medium">
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Valor de mercado:</span> <span>220.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Precio adjudicación:</span> <span>140.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Reforma:</span> <span>25.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>ITP (ej. 6%):</span> <span>8.400€</span>
                    </li>
                    <li className="flex justify-between pt-4 font-bold text-lg text-slate-900 border-t-2 border-slate-200">
                        <span>Coste total:</span> <span>173.400€</span>
                    </li>
                    <li className="flex justify-between text-brand-700 font-bold text-lg">
                        <span>Beneficio potencial:</span> <span>46.600€</span>
                    </li>
                    <li className="flex justify-between text-emerald-600 font-bold text-xl mt-4">
                        <span>ROI aproximado:</span> <span>26%</span>
                    </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Errores frecuentes al calcular la rentabilidad de una subasta</h2>
              <p>
                Muchos inversores fracasan por cometer estos errores básicos de cálculo:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li><strong>Olvidar el ITP:</strong> Es el gasto más importante después del precio de adjudicación.</li>
                <li><strong>Subestimar la reforma:</strong> Siempre añade un margen de imprevistos (10-15%) al presupuesto de obra.</li>
                <li><strong>No considerar deudas de comunidad:</strong> Pueden sumar miles de euros si el anterior propietario llevaba años sin pagar.</li>
                <li><strong>Confiar demasiado en la tasación BOE:</strong> El valor de subasta que publica el BOE suele estar desactualizado. Haz siempre tu propio estudio de mercado.</li>
              </ul>

              <div className="bg-brand-50 border border-brand-100 p-8 rounded-2xl my-12">
                  <p className="text-brand-900 font-medium text-lg m-0 flex items-start gap-4">
                      <Calculator className="text-brand-600 shrink-0 mt-1" size={24} />
                      <span>Si quieres estimar automáticamente la rentabilidad de una operación, puedes utilizar esta <Link to={ROUTES.CALCULATOR} className="text-brand-700 font-bold hover:underline">calculadora de subastas judiciales</Link>.</span>
                  </p>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">También puede interesarte:</h3>
                <ul className="list-none pl-0 space-y-3">
                  <li>
                    <Link to={ROUTES.HOW_MUCH_TO_PAY} className="text-brand-700 font-medium hover:underline flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                      Cuánto pagar en una subasta judicial
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
                    <Link to={ROUTES.GUIDE_PILLAR} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Guía General Subastas</span>
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

export default AuctionProfitabilityGuide;
