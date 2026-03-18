import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronRight, CheckCircle, AlertTriangle, Scale, ArrowRight, BookOpen, AlertOctagon, Coins, XCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import LeadMagnetBlock from './LeadMagnetBlock';

const AuctionChargesGuide: React.FC = () => {
  
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  // State for read time
  const [readTime, setReadTime] = useState(3);

  // Images Updated - Stable Assets
  const IMG_HERO = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200&h=630";
  // Updated IMG_REGISTRY to a very stable 'Office working' image
  const IMG_REGISTRY = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800&h=450"; 
  const IMG_MONEY = "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&q=80&w=800&h=450";

  // Schema.org Article Structured Data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Cargas en Subasta Judicial: Qué se Cancela y Qué No",
    "description": "Descubre qué cargas se cancelan en una subasta judicial (purga) y cuáles subsisten. Evita heredar hipotecas anteriores y deudas ocultas al adjudicarte.",
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
      "@id": "https://activosoffmarket.es/cargas-subasta-judicial-cancelacion/"
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

    // SEO Optimization: Title (50-60 chars) & Description (140-155 chars)
    document.title = "Cargas en Subasta Judicial: Qué se Cancela y Qué No | Activos";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Descubre qué cargas se cancelan en una subasta judicial (purga) y cuáles subsisten. Evita heredar hipotecas anteriores y deudas ocultas al adjudicarte.");
    
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
                <Link to="/" className="hover:text-brand-600 transition-colors">Inicio</Link>
                <ChevronRight size={14} />
                <Link to="/subastas-judiciales-espana" className="hover:text-brand-600 transition-colors">Guía Subastas</Link>
                <ChevronRight size={14} />
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Cargas y Deudas</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Qué cargas se cancelan en subasta <br/><span className="text-brand-700 italic">(y cuáles pagas tú)</span>
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
                        alt="Análisis de cargas"
                        width="1200"
                        height="630"
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                    />
                </figure>

                <p className="text-xl text-slate-700 leading-relaxed font-light mb-10 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                    Uno de los mayores errores al invertir en subastas judiciales es pensar que <strong>“todas las deudas desaparecen”</strong> al ganar la puja. 
                    No es así. Al adjudicar un inmueble, algunas cargas se cancelan automáticamente, pero otras pueden mantenerse y convertirse en tu responsabilidad.
                </p>

                <div className="bg-brand-50 p-8 rounded-2xl border-l-4 border-brand-500 my-10 shadow-sm">
                    <p className="text-brand-900 font-medium text-lg italic m-0">
                        "Un descuento del 40% en subasta puede convertirse en pérdidas totales si heredas una hipoteca preferente que no viste."
                    </p>
                </div>

                <div className="my-8 p-6 bg-brand-50 border border-brand-100 rounded-2xl">
                    <p className="text-brand-900 font-medium m-0">Puedes calcular rápidamente la rentabilidad usando esta <Link to={ROUTES.CALCULATOR} className="text-brand-700 underline font-bold hover:text-brand-900">calculadora de subastas judiciales</Link>.</p>
                </div>

                <div className="my-12 not-prose bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center gap-5">
                    <div className="bg-white p-3 rounded-full shadow-sm text-brand-600 border border-slate-100">
                         <BookOpen size={24} />
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contexto Básico</span>
                        <Link to="/subastas-judiciales-espana" className="block text-brand-700 font-bold text-lg hover:underline decoration-2 underline-offset-2">
                            Lee primero la Guía Técnica General →
                        </Link>
                    </div>
                </div>

                <h2 className="text-3xl mt-12 mb-6">Cargas que se cancelan (Lo bueno)</h2>
                <p>
                    En una ejecución estándar, rige el principio de <strong>purga de cargas posteriores</strong>. El juzgado ordenará cancelar:
                </p>
                <ul className="grid grid-cols-1 gap-4 list-none pl-0 my-6 not-prose">
                    <li className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-4">
                        <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
                        <span className="font-medium text-green-900">La hipoteca o embargo que se ejecuta (la del banco que subasta).</span>
                    </li>
                    <li className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-4">
                        <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
                        <span className="font-medium text-green-900">Todas las cargas inscritas DESPUÉS (posteriores en rango).</span>
                    </li>
                </ul>

                <figure className="my-14">
                    <img 
                        src={IMG_REGISTRY} 
                        alt="Revisión de documentación técnica" 
                        width="800"
                        height="450"
                        loading="lazy"
                        className="w-full h-auto object-cover rounded-2xl shadow-lg" 
                    />
                    <figcaption className="text-center text-sm text-slate-500 mt-3 font-medium italic">La fecha de inscripción en el Registro determina qué se borra.</figcaption>
                </figure>

                <h2 className="text-3xl mt-12 mb-6">Cargas que NO se cancelan (El peligro)</h2>
                <p>
                    Aquí es donde se pierde dinero. Las siguientes cargas <strong>subsisten</strong> y tú, como nuevo dueño, te subrogas en ellas (las asumes):
                </p>

                <div className="space-y-6 my-8 not-prose">
                    <div className="flex gap-4 p-5 bg-white border-l-4 border-red-500 rounded-r-xl shadow-sm">
                        <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">1. Cargas Anteriores</h3>
                            <p className="text-slate-600 text-sm mt-1">Si hay una hipoteca del año 2005 y se ejecuta un embargo del 2010, la hipoteca de 2005 se queda. Tendrás que pagarla.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-5 bg-white border-l-4 border-amber-500 rounded-r-xl shadow-sm">
                        <AlertOctagon className="text-amber-500 flex-shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">2. Deudas "Invisibles"</h3>
                            <p className="text-slate-600 text-sm mt-1">
                                <strong>Comunidad de Propietarios:</strong> Año en curso + 3 anteriores.<br/>
                                <strong>IBI:</strong> Hasta 4 años atrás.
                            </p>
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl mt-12 mb-6">Ejemplo práctico de Ruina</h2>
                <div className="bg-slate-900 text-white p-10 rounded-3xl my-8 not-prose shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                    
                    <div className="flex justify-between items-end border-b border-slate-700 pb-4 mb-6 relative z-10">
                        <span className="text-slate-400 text-sm uppercase tracking-wide font-bold">Valor de Tasación</span>
                        <span className="text-3xl font-bold">200.000 €</span>
                    </div>
                    <div className="space-y-4 mb-8 relative z-10 text-lg">
                        <div className="flex justify-between text-red-300 border-b border-slate-800 pb-2 border-dashed">
                            <span>1. Hipoteca Anterior (Subsiste)</span>
                            <span className="font-mono">- 80.000 €</span>
                        </div>
                        <div className="flex justify-between text-green-400 border-b border-slate-800 pb-2 border-dashed">
                            <span>2. Embargo Ejecutado (Se borra)</span>
                            <span className="font-mono">- 40.000 €</span>
                        </div>
                        <div className="flex justify-between text-green-400">
                            <span>3. Embargo Posterior (Se borra)</span>
                            <span className="font-mono">- 15.000 €</span>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-700 relative z-10 bg-slate-800/50 p-4 rounded-xl">
                        <p className="text-sm text-slate-300 mb-2">Si pujas 100.000 € y ganas:</p>
                        <p className="font-bold text-xl text-white">Coste total = 100k (puja) + 80k (carga anterior) = <span className="text-yellow-400">180.000 €</span></p>
                    </div>
                </div>

                <figure className="my-14">
                    <img 
                        src={IMG_MONEY} 
                        alt="Calculadora financiera" 
                        width="800"
                        height="450"
                        loading="lazy"
                        className="w-full h-auto object-cover rounded-2xl shadow-lg border border-slate-100 bg-slate-100" 
                    />
                </figure>

                <h2 className="text-3xl mt-12 mb-6">Estrategia antes de pujar</h2>
                <p>
                    Nunca confíes solo en el BOE. Solicita siempre una <strong>Nota Simple actualizada</strong> al Registro de la Propiedad antes de mover un dedo.
                </p>

                <hr className="my-16 border-slate-200" />

                {/* FAQ */}
                <section className="not-prose bg-slate-50 p-10 rounded-3xl border border-slate-200">
                    <h2 className="font-serif text-2xl font-bold text-slate-900 mb-8">Preguntas Frecuentes</h2>
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Cómo sé cuánto se debe de hipoteca anterior?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">La nota simple dice el principal original, no la deuda actual. El juzgado a veces lo certifica, pero a menudo es una incógnita que debes investigar.</p>
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
                <h3 className="font-serif text-2xl font-bold mb-4">¿Te lían las cargas?</h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    En el canal Premium te doy el análisis ya hecho: "Carga anterior de 30k€", "Libre de cargas", etc.
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

            {/* SATELLITE NAVIGATION ADDED */}
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <BookOpen size={18} className="text-brand-600"/>
                    Guías Relacionadas
                </h4>
                <nav className="space-y-4">
                    <Link to="/subastas-judiciales-espana" className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Guía General Subastas</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to="/como-analizar-subasta-judicial-paso-a-paso" className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Análisis Paso a Paso</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to="/vivienda-ocupada-subasta-judicial" className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Vivienda Ocupada</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to="/deposito-subasta-judicial-5-por-ciento" className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Depósito 5%: Riesgos</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                     <Link to="/cesion-de-remate-subasta-judicial" className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cesión de Remate</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to="/subasta-judicial-vs-aeat-diferencias" className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
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

export default AuctionChargesGuide;