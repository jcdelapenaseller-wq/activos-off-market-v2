import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronRight, ArrowRight, BookOpen, CheckCircle, Search, FileText, Home, Calculator, Gavel, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import LeadMagnetBlock from './LeadMagnetBlock';
import ConversionBlock from './ConversionBlock';

const AuctionAnalysisGuide: React.FC = () => {
  // Imágenes estáticas optimizadas (Unsplash)
  const IMG_HERO = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200&h=630"; // Análisis documental / Legal
  const IMG_DOCS = "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=800&h=450"; // Auditoría financiera / Cargas
  const IMG_BUILDING = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&h=450"; // Edificio real / Perspectiva

  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  // State for read time
  const [readTime, setReadTime] = useState(3);

    // Schema.org Article Structured Data
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Cómo Analizar una Subasta Judicial Paso a Paso (Guía Completa BOE)",
      "description": "Guía práctica para analizar una subasta judicial del BOE paso a paso: cargas, ocupación, valor real y cálculo del precio máximo seguro.",
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
        "@id": "https://activosoffmarket.es/como-analizar-subasta-judicial-paso-a-paso/"
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

    // 1. Scroll top
    window.scrollTo(0, 0);

    // 2. SEO Meta Tags
    document.title = "Cómo Analizar una Subasta Judicial Paso a Paso (BOE) | Guía 2025";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Guía práctica para analizar una subasta judicial del BOE paso a paso: cargas, ocupación, valor real y cálculo del precio máximo seguro.");

    // Helper for meta tags
    const setMeta = (property: string, content: string) => {
        let element = document.querySelector(`meta[property="${property}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('property', property);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    // Open Graph
    setMeta('og:type', 'article');
    setMeta('og:title', 'Cómo Analizar una Subasta Judicial Paso a Paso (BOE) | Guía 2025');
    setMeta('og:description', 'Guía práctica para analizar una subasta judicial del BOE paso a paso: cargas, ocupación, valor real y cálculo del precio máximo seguro.');
    setMeta('og:image', IMG_HERO);
    setMeta('og:url', 'https://activosoffmarket.es/como-analizar-subasta-judicial-paso-a-paso/');
    setMeta('og:site_name', 'Activos Off-Market');

    // Twitter Card
    let twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
        twitterCard = document.createElement('meta');
        twitterCard.setAttribute('name', 'twitter:card');
        document.head.appendChild(twitterCard);
    }
    twitterCard.setAttribute('content', 'summary_large_image');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', "https://activosoffmarket.es/como-analizar-subasta-judicial-paso-a-paso/");

    // 3. Inject JSON-LD
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
      
      {/* HEADER STANDARD */}
      <header className="bg-white pb-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
            <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium flex-wrap gap-2" aria-label="Breadcrumb">
                <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
                <ChevronRight size={14} />
                <Link to={ROUTES.GUIDE_PILLAR} className="hover:text-brand-600 transition-colors">Guía Subastas</Link>
                <ChevronRight size={14} />
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Análisis Paso a Paso</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Cómo Analizar una Subasta Judicial Paso a Paso <br/><span className="text-brand-700 italic">(Guía Completa BOE)</span>
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
        
        {/* MAIN COLUMN */}
        <main className="lg:col-span-8">
            <article className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-loose">
          
              {/* IMAGEN HERO */}
              <figure className="mb-12 -mt-6">
                <img 
                  src={IMG_HERO} 
                  alt="Análisis de expediente judicial para subasta BOE" 
                  width="1200" 
                  height="630"
                  className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                  // @ts-ignore
                  fetchpriority="high"
                />
              </figure>

              <p className="text-xl leading-relaxed mb-8 font-light first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                El 90% del éxito en una inversión en <Link to={ROUTES.GUIDE_PILLAR} className="text-brand-700 underline decoration-1 underline-offset-2 hover:text-brand-900">el mercado de ejecuciones hipotecarias</Link> no ocurre durante la puja, sino en la fase de análisis previo. 
                Pujar es fácil (son dos clics); saber <strong>qué estás comprando realmente</strong> es lo que distingue al inversor profesional del que acaba perdiendo su depósito.
              </p>
              
              <p className="mb-8">
                A continuación, detallo el <strong>protocolo de diligencia debida</strong> (Due Diligence) paso a paso que aplicamos en Activos Off-Market para filtrar cualquier expediente antes de considerarlo una oportunidad viable. Antes de pujar en una subasta es recomendable calcular la rentabilidad real de la operación. Puedes hacerlo con esta <Link to={ROUTES.CALCULATOR} className="text-brand-700 underline font-bold hover:text-brand-900">calculadora de subastas judiciales</Link>.
              </p>

              <ConversionBlock />

              <hr className="border-slate-200 my-10" />

              <h2 className="text-3xl font-bold mt-12 mb-6">Paso 1: Verificar el tipo de procedimiento</h2>
              <p>
                No todas las subastas son iguales. Antes de profundizar, revisa la autoridad gestora en el portal del BOE:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li>
                  <strong>Juzgado (Subasta Judicial):</strong> Rige la Ley de Enjuiciamiento Civil. Garantías procesales fuertes, pero plazos más lentos.
                </li>
                <li>
                  <strong>Agencia Tributaria (AEAT) o Seguridad Social:</strong> Son subastas administrativas. Tienen normativas propias y no siempre aplican las mismas reglas de purga de cargas o posesión.
                </li>
              </ul>
              <div className="bg-slate-50 border-l-4 border-slate-400 p-4 rounded-r-md not-prose text-sm mb-8">
                  <p><strong>¿Por qué importa?</strong> Porque determina cómo se entregan las llaves y qué deudas se cancelan. En esta guía nos centramos en las <strong>judiciales</strong>.</p>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Paso 2: Revisar la nota simple y cargas registrales</h2>
              <p>
                Nunca pujes sin revisar la <strong>Certificación de Cargas</strong> expedida por el Registrador (disponible en el portal del BOE). Es el historial jurídico del inmueble.
              </p>
              <p>
                 Debes identificar claramente qué cargas se cancelan y cuáles heredas. Para ello, consulta nuestra guía específica sobre <Link to={ROUTES.CHARGES} className="text-brand-700 underline font-bold hover:text-brand-900">jerarquía y cancelación de cargas</Link>, pero el resumen es:
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                 <li><strong>Carga Ejecutada:</strong> La deuda por la que sale a subasta. Se cancela tras la adjudicación.</li>
                 <li><strong>Cargas Posteriores:</strong> Se cancelan automáticamente (purga).</li>
                 <li><strong>Cargas Anteriores:</strong> ¡PELIGRO! Estas subsisten. Debes restarlas de tu valoración porque te tocará pagarlas.</li>
              </ul>

              <figure className="my-10">
                <img 
                  src={IMG_DOCS} 
                  alt="Documentación de cargas registrales" 
                  width="800" 
                  height="450"
                  loading="lazy"
                  className="w-full h-auto object-cover rounded-2xl shadow-lg border border-slate-100 bg-slate-100"
                />
              </figure>

              <h2 className="text-3xl font-bold mt-12 mb-6">Paso 3: Analizar la situación posesoria (ocupada o no)</h2>
              <p>
                El Registro te dice quién es el dueño, pero no quién vive dentro. Lee el Edicto con lupa buscando frases como <em>"situación posesoria: ocupado"</em> o <em>"se ignora ocupación"</em>.
              </p>
              <p>
                  Si hay ocupantes, debes distinguir entre el ejecutado (propietario) y terceros (inquilinos u okupas). Esto determinará el coste y tiempo del desalojo.
              </p>
              <p>
                  ¿Y el estado interior? Si hay ocupantes, olvídate de entrar. Consulta nuestra guía sobre <Link to={ROUTES.VISIT} className="text-brand-700 font-bold hover:underline">cuándo es posible visitar un inmueble en subasta</Link> y cómo actuar si no te dejan.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Paso 4: Calcular el valor real de mercado</h2>
              <p>
                <strong>Error de novato:</strong> Confiar en el "Valor de Subasta" que aparece en el BOE. Ese valor suele ser la tasación original de la hipoteca (quizás de 2007) y estar totalmente fuera de mercado.
              </p>
              <p>
                Haz tu propia valoración (comparables en Idealista/Fotocasa) para saber cuánto vale realmente ese piso HOY. Ese será tu punto de partida.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Paso 5: Aplicar la regla del 70%</h2>
              <p>
                Una vez tienes tu valoración, debes mirar el Valor de Tasación del BOE solo para una cosa: calcular los tramos legales del Artículo 670 LEC.
              </p>
              <p>
                Entender la <Link to={ROUTES.RULE_70} className="text-brand-700 underline font-bold hover:text-brand-900">firmeza del decreto de adjudicación</Link> es vital para saber si tu puja será firme o si el banco podrá mejorarla y quitarte el activo.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Paso 6: Evaluar riesgos legales y económicos</h2>
              <p>
                Antes de fijar tu precio máximo, resta los costes "invisibles":
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                  <li><strong>Depósito:</strong> Recuerda que debes consignar el <Link to={ROUTES.DEPOSIT} className="text-brand-700 hover:underline">fianza del 5%</Link> para participar.</li>
                  <li><strong>Deudas ocultas:</strong> IBI (hasta 4 años) y Comunidad de Propietarios (año en curso + 3 anteriores).</li>
                  <li><strong>Impuestos:</strong> ITP (6-10%) y gastos de inscripción.</li>
              </ul>

              <div className="bg-brand-50 border-l-4 border-brand-500 p-8 rounded-r-xl shadow-sm my-12 not-prose">
                 <h3 className="text-brand-900 font-bold text-xl mb-4 flex items-center gap-2">
                    <CheckCircle size={24} className="text-brand-600"/> Checklist de Viabilidad
                 </h3>
                 <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded border border-slate-300 bg-white mt-1"></div>
                        <span>He leído la Certificación de Cargas completa.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded border border-slate-300 bg-white mt-1"></div>
                        <span>He restado las cargas anteriores a mi valoración.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded border border-slate-300 bg-white mt-1"></div>
                        <span>He verificado la ocupación física (visita exterior).</span>
                    </li>
                     <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded border border-slate-300 bg-white mt-1"></div>
                        <span>Tengo liquidez para pagar en menos de 40 días.</span>
                    </li>
                 </ul>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Conclusión</h2>
              <p>
                Si al realizar este análisis paso a paso encuentras un dato que no cuadra (una carga confusa, un ocupante sin identificar), la regla es simple: <strong>NO PUJES</strong>. Hay miles de oportunidades en el BOE; no te arriesgues en una dudosa.
              </p>

              <hr className="my-16 border-slate-200" />

              <section className="not-prose bg-slate-50 p-10 rounded-3xl border border-slate-200">
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-8">Preguntas frecuentes</h2>
                <div className="space-y-8">
                    <div>
                        <h3 className="font-bold text-slate-900 mb-2 text-lg">
                             ¿El valor de tasación del BOE es el precio de mercado?
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            <strong>No.</strong> Suele ser el valor de tasación original de la escritura de hipoteca. Ignóralo para valorar el activo; úsalo solo para calcular el depósito (5%) y los tramos del 70%.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 mb-2 text-lg">
                             ¿Cómo sé la deuda exacta de la comunidad?
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            No es público en el expediente judicial. Debes intentar contactar con el administrador de fincas. Si no te dan el dato, estima el máximo legal (anualidad en curso + 3 anteriores).
                        </p>
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
                    <Link to={ROUTES.ERRORS} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Errores Frecuentes</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.CHARGES} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cargas y Deudas</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.OCCUPIED} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Vivienda Ocupada</span>
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

export default AuctionAnalysisGuide;