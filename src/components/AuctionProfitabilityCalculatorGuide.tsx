import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronRight, ArrowRight, BookOpen, Calculator, ShieldAlert, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import LeadMagnetBlock from './LeadMagnetBlock';

const AuctionProfitabilityCalculatorGuide: React.FC = () => {
  const IMG_HERO = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200&h=630"; 

  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  const [readTime, setReadTime] = useState(6);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Calculadora de rentabilidad en subastas judiciales",
    "description": "Calcula el ROI real de una subasta judicial incluyendo impuestos, reforma y margen de seguridad.",
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
    "datePublished": "2024-03-10T11:00:00+01:00",
    "dateModified": schemaDate,
    "image": [IMG_HERO],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://activosoffmarket.es/calculadora-rentabilidad-subastas"
    }
  };

  useEffect(() => {
    const article = document.querySelector('article');
    if (article) {
      const text = article.innerText;
      const words = text.trim().split(/\s+/).length;
      const time = Math.ceil(words / 200);
      setReadTime(Math.max(4, time));
    }

    window.scrollTo(0, 0);

    document.title = "Calculadora de rentabilidad en subastas judiciales";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Calcula el ROI real de una subasta judicial incluyendo impuestos, reforma y margen de seguridad.");

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
    setMeta('og:title', 'Calculadora de rentabilidad en subastas judiciales');
    setMeta('og:description', 'Calcula el ROI real de una subasta judicial incluyendo impuestos, reforma y margen de seguridad.');
    setMeta('og:image', IMG_HERO);
    setMeta('og:url', 'https://activosoffmarket.es/calculadora-rentabilidad-subastas');
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
    canonical.setAttribute('href', "https://activosoffmarket.es/calculadora-rentabilidad-subastas");

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
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Calculadora Rentabilidad</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Calculadora de rentabilidad de subastas judiciales
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
                  alt="Cálculo de rentabilidad en subastas" 
                  width="1200" 
                  height="630"
                  className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                  // @ts-ignore
                  fetchpriority="high"
                />
              </figure>

              <p className="text-xl leading-relaxed mb-8 font-light first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                Antes de participar en una subasta judicial, es fundamental realizar un análisis financiero exhaustivo. Muchos inversores novatos pierden dinero no por pujar alto, sino por no calcular correctamente los costes asociados: impuestos, reformas, cargas anteriores y el margen de seguridad necesario para absorber imprevistos.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Qué costes debes incluir en una subasta judicial</h2>
              <p>
                Para obtener una cifra real de inversión, no basta con mirar el precio de adjudicación. Debes sumar todos estos conceptos:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li><strong>Precio de adjudicación:</strong> Es el importe neto de tu puja ganadora.</li>
                <li><strong>ITP (Impuesto de Transmisiones Patrimoniales):</strong> Varía según la Comunidad Autónoma (entre el 4% y el 10%). Es el gasto más importante después de la compra.</li>
                <li><strong>Reforma o adecuación:</strong> Coste estimado para poner el inmueble en condiciones de venta o alquiler.</li>
                <li><strong>Gastos de Notaría y Registro:</strong> Necesarios para inscribir el testimonio del decreto de adjudicación y cancelar las cargas posteriores.</li>
                <li><strong>Cargas anteriores:</strong> Deudas hipotecarias o embargos que tengan preferencia sobre el que se ejecuta. <Link to={ROUTES.CHARGES} className="text-brand-700 font-bold hover:underline">Lee más sobre cargas aquí</Link>.</li>
                <li><strong>Deudas de Comunidad e IBI:</strong> El adjudicatario responde de la anualidad corriente y las tres anteriores en comunidad, y de la afección real en el IBI.</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6">Cómo calcular el ROI de una subasta inmobiliaria</h2>
              <p>
                El ROI (Return on Investment) nos indica la rentabilidad porcentual de la operación. Una fórmula simplificada para subastas sería:
              </p>
              <div className="bg-slate-900 text-white p-8 rounded-2xl font-mono text-center my-8 shadow-inner">
                ROI = [(Valor de Venta - Coste Total) / Coste Total] x 100
              </div>
              <p>
                Donde el <strong>Coste Total</strong> incluye la adjudicación más todos los gastos mencionados anteriormente. En subastas judiciales, un ROI objetivo saludable debería situarse por encima del 15-20% para compensar el riesgo y el tiempo de espera.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Errores frecuentes al calcular una subasta</h2>
              <div className="grid md:grid-cols-3 gap-6 my-8">
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                    <AlertTriangle className="text-red-500 mb-4" size={24} />
                    <h3 className="font-bold text-lg mb-2">No incluir impuestos</h3>
                    <p className="text-sm text-slate-600">Olvidar el ITP puede reducir tu beneficio en un 10% de golpe.</p>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                    <AlertTriangle className="text-red-500 mb-4" size={24} />
                    <h3 className="font-bold text-lg mb-2">Subestimar reforma</h3>
                    <p className="text-sm text-slate-600">Al no poder visitar el interior, siempre hay que presupuestar al alza.</p>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                    <AlertTriangle className="text-red-500 mb-4" size={24} />
                    <h3 className="font-bold text-lg mb-2">Ignorar cargas</h3>
                    <p className="text-sm text-slate-600">Las cargas anteriores no se cancelan y pasan a ser tu deuda.</p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Calcula automáticamente tu inversión</h2>
              <p>
                Para evitar errores manuales y asegurarte de que tu puja tiene sentido económico, he desarrollado una herramienta específica que hace estos cálculos por ti.
              </p>
              
              <div className="bg-brand-700 text-white p-10 rounded-3xl my-12 shadow-xl flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold mb-4 text-white">Calculadora de Subastas Judiciales</h3>
                      <p className="text-brand-100 mb-0">Estima automáticamente el ROI, los impuestos por comunidad autónoma y tu puja máxima recomendada.</p>
                  </div>
                  <Link 
                    to={ROUTES.CALCULATOR} 
                    className="bg-white text-brand-700 font-bold py-4 px-8 rounded-xl hover:bg-brand-50 transition-all flex items-center gap-2 shadow-lg whitespace-nowrap"
                  >
                    Ir a la Calculadora <ArrowRight size={18} />
                  </Link>
              </div>

              <p>
                Recuerda que el cálculo es solo una parte del éxito. También debes dominar la <Link to={ROUTES.RULE_70} className="text-brand-700 font-bold hover:underline">Regla del 70%</Link> y saber <Link to={ROUTES.ANALYSIS} className="text-brand-700 font-bold hover:underline">cómo analizar el expediente paso a paso</Link> para no dejar nada al azar.
              </p>

              <LeadMagnetBlock />
            </article>
        </main>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-10 max-h-[calc(100vh-120px)] overflow-auto pr-2 custom-scrollbar">
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 block">Canal de Alertas</span>
                <h3 className="font-serif text-2xl font-bold mb-4">¿Te falta experiencia?</h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    En el canal Premium analizo yo las subastas por ti. Ahorra tiempo y evita errores de cálculo fatales.
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
                    <Link to={ROUTES.ANALYSIS} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cómo Analizar Subastas</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.RULE_70} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Regla del 70%</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.CHARGES} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cargas Registrales</span>
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

export default AuctionProfitabilityCalculatorGuide;
