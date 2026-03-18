import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronRight, Percent, Gavel, ArrowRight, BookOpen, AlertTriangle, Calculator, CheckCircle, Info, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import LeadMagnetBlock from './LeadMagnetBlock';

const Auction70RuleGuide: React.FC = () => {
  
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  // State for read time
  const [readTime, setReadTime] = useState(3);

  // Images Updated
  const IMG_HERO = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200&h=630";

  // Schema.org Article Structured Data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Regla del 70% en Subastas Judiciales: Cómo Calcular el Precio Máximo Seguro",
    "description": "Descubre cómo aplicar la regla del 70% en subastas judiciales del BOE y calcular el precio máximo seguro antes de pujar.",
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
      "@id": "https://activosoffmarket.es/regla-70-subasta-judicial/"
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

    // SEO Optimization
    document.title = "Regla del 70% en Subastas Judiciales (BOE) | Guía Práctica 2025";
    
    // Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Descubre cómo aplicar la regla del 70% en subastas judiciales del BOE y calcular el precio máximo seguro antes de pujar.");

    // Open Graph Tags
    const setMeta = (property: string, content: string) => {
        let element = document.querySelector(`meta[property="${property}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('property', property);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    setMeta('og:title', "Regla del 70% en Subastas Judiciales (BOE) | Guía Práctica 2025");
    setMeta('og:description', "Descubre cómo aplicar la regla del 70% en subastas judiciales del BOE y calcular el precio máximo seguro antes de pujar.");
    setMeta('og:type', "article");
    setMeta('og:url', "https://activosoffmarket.es/regla-70-subasta-judicial/");
    setMeta('og:image', IMG_HERO);

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
      
      <header className="bg-white pb-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
            <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium flex-wrap gap-2" aria-label="Breadcrumb">
                <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
                <ChevronRight size={14} />
                <Link to={ROUTES.GUIDE_PILLAR} className="hover:text-brand-600 transition-colors">Guía Subastas</Link>
                <ChevronRight size={14} />
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Regla del 70%</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Regla del 70% en Subastas Judiciales: <br/><span className="text-brand-700 italic">Cómo Calcular el Precio Máximo Seguro</span>
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
                        alt="Cálculo financiero de la regla del 70% en subastas BOE"
                        width="1200"
                        height="630"
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                    />
                </figure>

                <p className="text-xl text-slate-700 leading-relaxed font-light mb-10 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                    La <strong>regla del 70%</strong> es el concepto jurídico más importante que debes dominar antes de participar en cualquier <Link to={ROUTES.GUIDE_PILLAR} className="text-brand-700 underline decoration-1 underline-offset-2 hover:text-brand-900">licitación pública del BOE</Link>. No es solo un porcentaje; es el umbral que define si tu adjudicación será firme, provisional o si perderás la oportunidad frente al banco o el deudor.
                </p>

                <div className="bg-brand-50 p-6 border-l-4 border-brand-600 rounded-r-xl shadow-sm my-10 not-prose flex items-start gap-4">
                    <Info size={24} className="text-brand-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-brand-900 text-lg mb-1">Aclaración Importante</h3>
                        <p className="text-brand-800 text-sm leading-relaxed m-0">
                            Este artículo analiza exclusivamente las subastas regidas por la <strong>Ley de Enjuiciamiento Civil (LEC)</strong>, que son las más comunes en el portal del BOE. Las subastas de la Seguridad Social o AEAT tienen normativas diferentes.
                        </p>
                    </div>
                </div>

                <div className="my-8 p-6 bg-brand-50 border border-brand-100 rounded-2xl">
                    <p className="text-brand-900 font-medium m-0">Puedes calcular rápidamente la rentabilidad usando esta <Link to={ROUTES.CALCULATOR} className="text-brand-700 underline font-bold hover:text-brand-900">calculadora de subastas judiciales</Link>.</p>
                </div>

                <h2 className="text-3xl mt-12 mb-6">¿Qué es la regla del 70%?</h2>
                <p>
                    La regla del 70% hace referencia al porcentaje mínimo del <strong>Valor de Tasación</strong> (fijado en la escritura de hipoteca o por perito judicial) que debe cubrir la mejor postura para que la adjudicación sea automática y firme en el acto.
                </p>
                <p>
                    Está regulada en el <strong>Artículo 670 de la Ley de Enjuiciamiento Civil (LEC)</strong>. Entender este artículo es vital porque determina si te llevas la casa o si entras en un limbo jurídico de 10 a 40 días donde pueden quitarte la adjudicación.
                </p>

                <h2 className="text-3xl mt-12 mb-6">Cómo se aplica en subastas judiciales del BOE</h2>
                <p>
                    Cuando finaliza la subasta (generalmente a las 18:00h del día 20), pueden darse tres escenarios según la cuantía de la puja ganadora respecto al tipo de subasta (valor de tasación):
                </p>

                <div className="space-y-6 my-8 not-prose">
                    <div className="flex gap-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="bg-green-100 p-2 h-fit rounded-lg text-green-700 font-bold">1</div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Puja ≥ 70%</h3>
                            <p className="text-slate-600 text-sm mt-1">
                                <strong>Adjudicación firme.</strong> El Letrado de la Administración de Justicia (LAJ) aprueba el remate a tu favor. Nadie puede mejorar tu oferta a posteriori.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="bg-amber-100 p-2 h-fit rounded-lg text-amber-700 font-bold">2</div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Puja &lt; 70%</h3>
                            <p className="text-slate-600 text-sm mt-1">
                                <strong>Adjudicación provisional.</strong> Se abre un plazo de 10 días hábiles donde el deudor puede presentar a un tercero que mejore tu postura. Si no lo hace, el acreedor (banco) puede pedir la adjudicación.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="bg-red-100 p-2 h-fit rounded-lg text-red-700 font-bold">3</div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Puja &lt; 50%</h3>
                            <p className="text-slate-600 text-sm mt-1">
                                <strong>Riesgo de subasta desierta.</strong> Si la mejor postura es inferior al 50% y no cubre la deuda reclamada, el juez tiene la potestad de NO aprobar el remate si considera que el precio es irrisorio.
                            </p>
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl mt-12 mb-6">Ejemplo práctico paso a paso</h2>
                <p>
                    Imaginemos un piso en Madrid que sale a subasta. Para calcular tu estrategia, necesitas dos datos del edicto: el <strong>Valor de Tasación</strong> y la <strong>Deuda Reclamada</strong>.
                </p>

                <div className="bg-slate-900 text-white p-8 rounded-3xl my-8 not-prose shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm border-b border-slate-700 pb-4">
                        <div>
                            <span className="block text-slate-400 font-bold uppercase">Valor Tasación (BOE)</span>
                            <span className="block text-2xl font-bold">200.000 €</span>
                        </div>
                        <div>
                            <span className="block text-slate-400 font-bold uppercase">Deuda Reclamada</span>
                            <span className="block text-2xl font-bold text-red-400">110.000 €</span>
                        </div>
                    </div>

                    <h3 className="font-serif font-bold text-xl mb-4 text-brand-200">Escenarios de tu puja:</h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <div>
                                <span className="block text-green-400 font-bold">TÚ PUJAS: 140.001 € (70% + 1€)</span>
                                <span className="text-xs text-slate-400">Resultado:</span>
                            </div>
                            <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">GANAS SEGURO</span>
                        </div>

                        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <div>
                                <span className="block text-amber-400 font-bold">TÚ PUJAS: 115.000 € (57,5%)</span>
                                <span className="text-xs text-slate-400">Cubre la deuda, pero no llega al 70%.</span>
                            </div>
                            <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">PROVISIONAL</span>
                        </div>
                         <p className="text-xs text-slate-400 pl-2">
                            *En este caso, el deudor tiene 10 días para traer a otro comprador. Si no, te la llevas tú porque cubres la deuda.
                        </p>

                        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <div>
                                <span className="block text-red-400 font-bold">TÚ PUJAS: 80.000 € (40%)</span>
                                <span className="text-xs text-slate-400">No cubre deuda ni llega al 50%.</span>
                            </div>
                            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">DIFÍCIL</span>
                        </div>
                    </div>
                </div>

                <p>
                    Para hacer estos números con precisión, primero debes <Link to={ROUTES.ANALYSIS} className="text-brand-700 underline decoration-1 underline-offset-2 hover:text-brand-900">saber analizar el expediente judicial</Link> y extraer la deuda real.
                </p>

                <h2 className="text-3xl mt-12 mb-6">Qué errores cometen los inversores</h2>
                <div className="grid md:grid-cols-2 gap-8 my-8 not-prose">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <XCircle className="text-red-500" size={24} />
                            <h3 className="font-bold text-slate-900">Confundir Tasación con Mercado</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            La tasación del BOE puede ser de 2007. El 70% de una tasación inflada puede ser SUPERIOR al precio real de mercado hoy. Haz tu propia valoración.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <XCircle className="text-red-500" size={24} />
                            <h3 className="font-bold text-slate-900">No calcular el depósito</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Recuerda que para jugar debes poner el <Link to={ROUTES.DEPOSIT} className="text-brand-700 font-bold hover:underline">consignación obligatoria para participar</Link>. Si te adjudican provisionalmente, ese dinero queda retenido semanas o meses hasta que el juez decida.
                        </p>
                    </div>
                </div>

                <h2 className="text-3xl mt-12 mb-6">¿Funciona siempre la regla del 70%?</h2>
                <p>
                    La regla del 70% es una garantía de firmeza, pero <strong>no es una obligación de puja</strong>. Muchos inversores profesionales ganan subastas pujando al 60% o incluso menos, asumiendo el riesgo de la espera y conociendo bien la posición del banco.
                </p>
                <p>
                    La clave está en saber si al banco le interesa adjudicárselo (para limpiar balance) o prefiere el dinero líquido que tú ofreces, aunque sea poco.
                </p>

                <hr className="my-16 border-slate-200" />

                {/* FAQ */}
                <section className="not-prose bg-slate-50 p-10 rounded-3xl border border-slate-200">
                    <h2 className="font-serif text-2xl font-bold text-slate-900 mb-8">Preguntas Frecuentes</h2>
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿El 70% es sobre valor de mercado?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">No. Es sobre el <strong>Valor de Tasación a efectos de subasta</strong> que figura en el edicto (puede ser un valor del año 2007, muy inflado).</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Cuánto tarda en aprobarse si no llego al 70%?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Depende de la carga de trabajo del juzgado. El deudor tiene 10 días hábiles, el acreedor otros 5, pero la resolución final del decreto puede tardar de 1 a 3 meses.</p>
                        </div>
                    </div>
                </section>
                
                <LeadMagnetBlock />
            </article>
        </main>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-10 max-h-[calc(100vh-120px)] overflow-auto pr-2 custom-scrollbar">
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 block">Canal de Alertas</span>
                <h3 className="font-serif text-2xl font-bold mb-4">¿Dudas con tu puja?</h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    En el canal Premium te indico la deuda reclamada y el valor de tasación para que sepas dónde está el límite estratégico.
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
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Análisis Paso a Paso</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.DEPOSIT} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Depósito del 5%</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                     <Link to={ROUTES.CHARGES} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cargas y Deudas</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.ASSIGNMENT} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cesión de Remate</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.COMPARISON} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Judicial vs AEAT</span>
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

export default Auction70RuleGuide;