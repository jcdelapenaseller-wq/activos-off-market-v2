import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronRight, ArrowRight, BookOpen, Calculator, HelpCircle, MapPin, DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import LeadMagnetBlock from './LeadMagnetBlock';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { isAuctionFinished, sortActiveFirst, formatDate } from '../utils/auctionHelpers';
import { normalizePropertyType, normalizeCity, normalizeLocationLabel } from '../utils/auctionNormalizer';

const AuctionBarcelonaGuide: React.FC = () => {
  const cityAuctions = React.useMemo(() => {
    const filtered = Object.entries(AUCTIONS).filter(([_, a]) => normalizeCity(a) === "Barcelona");
    return sortActiveFirst(filtered, (item) => item[1].auctionDate);
  }, []);
  
  const activeCount = React.useMemo(() => {
    return cityAuctions.filter(item => !isAuctionFinished(item[1].auctionDate)).length;
  }, [cityAuctions]);

  const summary = React.useMemo(() => {
    const active = cityAuctions.filter(item => !isAuctionFinished(item[1].auctionDate));
    const count = active.length;
    if (count === 0) return null;
    
    const totalDiscount = active.reduce((acc, curr) => acc + (curr[1].discount || 0), 0);
    const avgDiscount = (totalDiscount / count).toFixed(1);
    
    const typeCounts: Record<string, number> = {};
    active.forEach(item => {
      const type = normalizePropertyType(item[1].propertyType || "Otros");
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];
    
    return { count, avgDiscount, dominantType };
  }, [cityAuctions]);

  const IMG_HERO = "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=1200&h=630"; 

  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  const [readTime, setReadTime] = useState(5);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Subastas judiciales en Barcelona | Guía para inversores",
    "description": "Aprende cómo encontrar y analizar subastas judiciales en Barcelona. Incluye ejemplo real y cálculo de rentabilidad.",
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
      "@id": "https://activosoffmarket.es/subastas-barcelona"
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

    document.title = "Subastas judiciales en Barcelona | Guía para inversores";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Aprende cómo encontrar y analizar subastas judiciales en Barcelona. Incluye ejemplo real y cálculo de rentabilidad.");

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
    setMeta('og:title', 'Subastas judiciales en Barcelona | Guía para inversores');
    setMeta('og:description', 'Aprende cómo encontrar y analizar subastas judiciales en Barcelona. Incluye ejemplo real y cálculo de rentabilidad.');
    setMeta('og:image', IMG_HERO);
    setMeta('og:url', 'https://activosoffmarket.es/subastas-barcelona');
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
    canonical.setAttribute('href', "https://activosoffmarket.es/subastas-barcelona");

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
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Subastas en Barcelona</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Subastas judiciales en Barcelona: cómo encontrarlas y analizarlas
            </h1>

            <p className="text-lg text-slate-600 mb-12 max-w-3xl">
              Las subastas judiciales en Barcelona ofrecen oportunidades de inversión únicas para adquirir inmuebles con importantes descuentos. A continuación, analizamos las claves para encontrar, evaluar y pujar con seguridad en esta provincia.
            </p>

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
                  alt="Subastas judiciales en Barcelona" 
                  width="1200" 
                  height="630"
                  className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                  // @ts-ignore
                  fetchpriority="high"
                />
              </figure>

              <p className="text-xl leading-relaxed mb-6 font-light first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                Las subastas inmobiliarias en Barcelona representan una de las vías más interesantes para adquirir propiedades con **importantes descuentos** sobre el valor de mercado. Este sistema público permite a los inversores acceder a viviendas, locales, garajes y naves industriales procedentes de embargos o ejecuciones hipotecarias.
              </p>

              {summary && (
                <div className="bg-slate-50 border-l-4 border-brand-600 p-6 rounded-r-lg my-8">
                  <h3 className="text-xl font-bold text-brand-900 mb-4">Resumen rápido del mercado en Barcelona</h3>
                  <ul className="space-y-2 text-lg">
                    <li><strong>Subastas activas:</strong> {summary.count}</li>
                    <li><strong>Descuento medio:</strong> {summary.avgDiscount}%</li>
                    <li><strong>Activo dominante:</strong> {summary.dominantType}</li>
                  </ul>
                </div>
              )}

              <p className="text-xl leading-relaxed mb-6 font-light">
                La principal oportunidad de inversión radica en la diferencia entre el valor de tasación del inmueble y su precio de adjudicación final, permitiendo obtener márgenes de rentabilidad muy superiores a los de la compraventa tradicional.
              </p>
              <p className="text-xl leading-relaxed mb-8 font-light">
                Sin embargo, participar en subastas judiciales o administrativas en Barcelona no está exento de riesgos y requiere un **conocimiento técnico profundo**. Es fundamental realizar un estudio exhaustivo antes de pujar, analizando detalladamente la certificación de cargas del Registro de la Propiedad y verificando la situación posesoria del inmueble.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Dónde encontrar subastas judiciales en Barcelona</h2>
              <p>
                Para localizar subastas de pisos, locales o garajes en Barcelona y su área metropolitana, es fundamental conocer las fuentes oficiales donde se publican estos activos:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li><strong>Portal de Subastas del BOE:</strong> Es la plataforma principal. La inmensa mayoría de las subastas inmobiliarias (judiciales y notariales) se publican aquí de forma centralizada.</li>
                <li><strong>Subastas administrativas de Hacienda (AEAT):</strong> La Agencia Tributaria subasta bienes embargados por deudas fiscales, también accesibles a través del portal del BOE.</li>
                <li><strong>Ejecuciones hipotecarias:</strong> Derivadas del impago de préstamos bancarios, estas subastas judiciales representan una gran parte de la oferta en la ciudad.</li>
              </ul>
              <p>
                Mantener un rastreo diario en el portal oficial del BOE filtrando por la provincia de Barcelona es la mejor estrategia para no perder ninguna oportunidad.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Zonas de Barcelona donde aparecen más subastas</h2>
              <p>
                Las subastas suelen concentrarse en zonas con mayor rotación inmobiliaria y densidad poblacional. En la ciudad condal y sus alrededores, los distritos con mayor frecuencia de activos en subasta suelen ser:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li>Nou Barris</li>
                <li>Sant Martí</li>
                <li>Sants-Montjuïc</li>
                <li>Horta-Guinardó</li>
                <li>L'Hospitalet de Llobregat (zona metropolitana)</li>
              </ul>
              <p>
                Estas zonas ofrecen perfiles de inversión variados, desde activos para reformar y vender hasta inmuebles con alta demanda de alquiler.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Ejemplo real de cálculo de una subasta en Barcelona</h2>
              <p>
                Para ilustrar la viabilidad de una operación en Barcelona, veamos un desglose de costes aproximados para un piso medio:
              </p>

              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm my-8">
                <ul className="space-y-4 text-slate-700 font-medium">
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Valor de mercado:</span> <span>260.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Precio posible de adjudicación:</span> <span>160.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Reforma estimada:</span> <span>30.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>ITP Cataluña (10%):</span> <span>16.000€</span>
                    </li>
                    <li className="flex justify-between pt-4 font-bold text-lg text-slate-900 border-t-2 border-slate-200">
                        <span>Coste total aproximado:</span> <span>206.000€</span>
                    </li>
                    <li className="flex justify-between text-brand-700 font-bold text-xl mt-4">
                        <span>Beneficio potencial:</span> <span>54.000€</span>
                    </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Cómo calcular la rentabilidad de una subasta en Barcelona</h2>
              <p>
                Para asegurar que la inversión es rentable, es vital realizar un análisis exhaustivo que incluya todos los gastos asociados a la adquisición:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li><strong>Precio de adjudicación:</strong> El importe final de tu puja.</li>
                <li><strong>Impuestos (ITP):</strong> En Cataluña, el tipo general del Impuesto de Transmisiones Patrimoniales es del 10%.</li>
                <li><strong>Reforma:</strong> Costes de adecuación para poner el activo en el mercado.</li>
                <li><strong>Posibles deudas:</strong> Deudas de comunidad o IBI que el adjudicatario deba asumir.</li>
              </ul>

              <div className="bg-brand-50 border border-brand-100 p-8 rounded-2xl my-12">
                  <p className="text-brand-900 font-medium text-lg m-0 flex items-start gap-4">
                      <Calculator className="text-brand-600 shrink-0 mt-1" size={24} />
                      <span>Puedes estimar automáticamente la rentabilidad de una operación utilizando esta <Link to={ROUTES.CALCULATOR} className="text-brand-700 font-bold hover:underline">calculadora de subastas judiciales</Link>.</span>
                  </p>
              </div>

              <div className="bg-white border border-brand-200 p-8 rounded-2xl my-12 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">¿Quieres saber cuánto pujar?</h3>
                  <p className="text-slate-600 mb-6">
                      Calcular la puja máxima es clave para no perder dinero. Usa nuestra herramienta para evitar errores al pujar.
                  </p>
                  <Link to={`/calcular-puja-subasta/barcelona`} className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-600 transition-all">
                      Calcular la puja en subastas en Barcelona <ArrowRight size={18} />
                  </Link>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Subastas por tipo en Barcelona</h2>
              <p>
                Si buscas un tipo de activo específico en la ciudad condal, puedes filtrar los análisis por categoría:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8 not-prose">
                <Link to="/subastas/barcelona/pisos" className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm">Pisos</Link>
                <Link to="/subastas/barcelona/locales" className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm">Locales</Link>
                <Link to="/subastas/barcelona/viviendas" className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm">Viviendas</Link>
                <Link to="/subastas/barcelona/chalets" className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm">Chalets</Link>
                <Link to="/subastas/barcelona/garajes" className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm">Garajes</Link>
                <Link to="/subastas/barcelona/naves" className="bg-white border border-slate-200 p-4 rounded-xl text-center hover:border-brand-500 hover:text-brand-700 transition-all font-bold shadow-sm">Naves</Link>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Preguntas frecuentes sobre subastas en Barcelona</h2>
              
              <div className="space-y-6 my-8">
                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                    <HelpCircle size={20} className="text-brand-600" />
                    ¿Se pueden visitar los pisos antes de la subasta?
                  </h3>
                  <p className="text-slate-600 m-0">
                    Generalmente no. Al ser ejecuciones forzosas, el deudor suele permanecer en la vivienda y no hay obligación legal de permitir visitas. Es uno de los riesgos que se asumen a cambio del descuento en el precio.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                    <HelpCircle size={20} className="text-brand-600" />
                    ¿Se puede comprar una subasta con hipoteca?
                  </h3>
                  <p className="text-slate-600 m-0">
                    Es posible pero muy difícil debido a los plazos (20 o 40 días para pagar). La mayoría de inversores utilizan fondos propios o financiación alternativa que no dependa de la tasación previa del inmueble.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                    <HelpCircle size={20} className="text-brand-600" />
                    ¿Cuánto dinero se necesita para participar?
                  </h3>
                  <p className="text-slate-600 m-0">
                    Debes depositar un 5% del valor de tasación del bien como fianza para poder pujar. Si no resultas ganador, el dinero se devuelve automáticamente a tu cuenta en pocos días.
                  </p>
                </div>
              </div>

              {cityAuctions.length > 0 && (
                <div className="mt-16 pt-12 border-t border-slate-200">
                  <h2 className="text-3xl font-bold mb-6">Ejemplos de subastas inmobiliarias en Barcelona</h2>
                  
                  {activeCount > 0 && (
                    <div className="mb-8 inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 font-bold px-4 py-2 rounded-lg shadow-sm">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                      </span>
                      {activeCount} subastas activas ahora mismo
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                    {cityAuctions.map(([slug, data]) => {
                      const isFinished = isAuctionFinished(data.auctionDate);
                      return (
                      <div key={slug} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group relative">
                        {isFinished && (
                          <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20 shadow-sm flex flex-col items-center gap-1">
                            <span>Adjudicada</span>
                            {data.auctionDate && (
                              <span className="text-[10px] font-normal normal-case">Adjudicada el {formatDate(data.auctionDate)}</span>
                            )}
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-3">
                            <TrendingUp size={14} /> Análisis real
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                            {normalizePropertyType(data.propertyType)} en subasta en {normalizeCity(data)}
                          </h3>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                              <MapPin size={14} className="text-brand-500" />
                              <span>{normalizeLocationLabel(data)}</span>
                            </div>
                            {data.appraisalValue && (
                              <div className="flex items-center gap-2 text-slate-500 text-xs">
                                <DollarSign size={14} className="text-brand-500" />
                                <span>Valor tasación: <span className="font-bold text-slate-900">{data.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span></span>
                              </div>
                            )}
                          </div>
                          <Link 
                            to={`/subasta/${slug}`}
                            className={`inline-flex items-center justify-center gap-2 w-full font-bold py-2 px-4 rounded-lg text-sm transition-all ${isFinished ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-slate-900 text-white hover:bg-brand-600'}`}
                          >
                            Ver análisis <ChevronRight size={16} />
                          </Link>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="my-16">
                <h2 className="text-3xl font-bold mb-6">Cómo analizar una subasta inmobiliaria en Barcelona</h2>
                <p className="mb-8">
                  Para tener éxito en el mercado de subastas de Barcelona, el análisis previo debe ser metódico. Comienza revisando el edicto de la subasta y la certificación de cargas para entender exactamente qué se subasta (pleno dominio, nuda propiedad, proindiviso) y qué deudas arrastra la finca. Posteriormente, evalúa el mercado inmobiliario local en la zona específica de Barcelona para determinar el valor real de mercado del activo, ignorando el valor de tasación oficial si este está desactualizado. Finalmente, calcula todos los costes asociados: ITP o IVA, gastos de notaría, registro, posibles reformas y costes de un procedimiento de desahucio si el inmueble está ocupado.
                </p>

                <h2 className="text-3xl font-bold mb-6">Errores comunes al comprar en subastas judiciales</h2>
                <p className="mb-8">
                  Uno de los errores más frecuentes entre los inversores novatos es pujar basándose únicamente en el precio de salida, sin haber descontado las cargas anteriores que subsisten tras la adjudicación. Otro fallo crítico es no investigar el estado de ocupación del inmueble, asumiendo que se entregará vacío. Además, muchos participantes olvidan incluir en sus cálculos los impuestos de transmisión y los gastos de adecuación del activo. Para evitar estos errores que pueden arruinar la rentabilidad de la operación, es vital establecer un límite estricto de puja basado en números fríos y no dejarse llevar por la emoción del momento.
                </p>

                <Link 
                  to="/calculadora-subastas" 
                  className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-700 transition-all mt-4"
                >
                  Calcular puja máxima <ChevronRight size={20} />
                </Link>
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
                    <Link to={ROUTES.VALENCIA} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Subastas en Valencia</span>
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

export default AuctionBarcelonaGuide;
