import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronRight, Scale, Building2, ArrowRight, BookOpen, AlertTriangle, CheckCircle, XCircle, Landmark, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const AuctionComparisonGuide: React.FC = () => {
  
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  // State for read time
  const [readTime, setReadTime] = useState(3);

  // IMÁGENES ÚNICAS Y EXCLUSIVAS (Política de no repetición)
  // 1. Hero: Concepto de Elección/Comparación (Dos caminos/Archivos). ID: 1517245386807-bb43f82c33c4
  const IMG_HERO = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200&h=630"; 
  
  // 2. Judicial: Arquitectura judicial/Columnas (Diferente a otras guías). ID: 1585829365295-ab7cd400c167
  const IMG_JUDICIAL = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800&h=450";
  
  // 3. AEAT: Concepto Fiscal/Administración Pública. ID: 1628348068343-c6a848d2b6dd
  const IMG_AEAT = "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=800&h=450";

  // Schema.org Structured Data
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": "Subasta judicial vs AEAT: diferencias clave en España",
        "description": "Descubre las diferencias entre subasta judicial y subasta AEAT en España y qué debes analizar antes de invertir.",
        "image": [IMG_HERO],
        "datePublished": "2023-11-20T09:00:00+01:00",
        "dateModified": schemaDate,
        "author": {
          "@type": "Person",
          "name": "José de la Peña",
          "url": "https://activosoffmarket.es/quien-soy"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Activos Off-Market",
          "logo": {
            "@type": "ImageObject",
            "url": "https://activosoffmarket.es/favicon.ico"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://activosoffmarket.es/subasta-judicial-vs-aeat-diferencias/"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Inicio",
            "item": "https://activosoffmarket.es/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Guía Subastas",
            "item": "https://activosoffmarket.es/subastas-judiciales-espana/"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Comparativa Judicial vs AEAT",
            "item": "https://activosoffmarket.es/subasta-judicial-vs-aeat-diferencias/"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "¿Se puede visitar el inmueble en ambos casos?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No siempre. Depende del expediente concreto y de la colaboración del ocupante, aunque en AEAT a veces hay más facilidades si el bien está en depósito."
            }
          },
          {
            "@type": "Question",
            "name": "¿Es más segura una subasta judicial?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No necesariamente. Ambas requieren análisis técnico de cargas y posesión. La judicial tiene más garantías procesales, pero también tiempos más largos."
            }
          },
          {
            "@type": "Question",
            "name": "¿Dónde hay más oportunidades?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Depende del momento del mercado. Las judiciales suelen tener más volumen de vivienda residencial, mientras que AEAT mueve más locales, plazas de garaje y bienes muebles."
            }
          }
        ]
      }
    ]
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

    window.scrollTo(0, 0);
    // SEO Optimization: Title (50-60 chars) & Description (140-155 chars)
    document.title = "Subasta Judicial vs AEAT: Diferencias Clave | Activos";
    
    // Meta tags management
    const setMeta = (property: string, content: string) => {
        let element = document.querySelector(`meta[property="${property}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('property', property);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Comparativa técnica: Subasta Judicial vs Subasta AEAT. Diferencias en normativa, regla del 70%, posesión del inmueble y riesgos para el inversor.");

    setMeta('og:type', 'article');
    setMeta('og:title', 'Subasta Judicial vs AEAT: Diferencias Clave | Activos');
    setMeta('og:description', 'Análisis comparativo técnico: riesgos, rentabilidad y normativa.');
    setMeta('og:image', IMG_HERO);
    setMeta('og:url', 'https://activosoffmarket.es/subasta-judicial-vs-aeat-diferencias/');
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
    canonical.setAttribute('href', "https://activosoffmarket.es/subasta-judicial-vs-aeat-diferencias/");

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
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Comparativa Judicial vs AEAT</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Subasta Judicial vs AEAT: <br/><span className="text-brand-700 italic">Diferencias clave para invertir</span>
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
                        alt="Comparativa entre expedientes judiciales y administrativos"
                        width="1200"
                        height="630"
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                    />
                </figure>

                <p className="text-xl text-slate-700 leading-relaxed font-light mb-10 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                    En España existen distintos tipos de subastas públicas, pero las más habituales en inversión inmobiliaria son las <strong>subastas judiciales</strong> (las más comunes en el BOE) y las <strong>subastas administrativas de la Agencia Tributaria (AEAT)</strong>.
                </p>
                <p>
                    Aunque ambas permiten adquirir inmuebles por debajo del precio de mercado, su funcionamiento, riesgos y estrategia son muy distintos. Comprender estas diferencias es esencial antes de participar para evitar errores costosos.
                </p>

                <div className="grid md:grid-cols-2 gap-8 my-12 not-prose">
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <Scale className="text-brand-600 mb-4" size={32} />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">¿Qué es una subasta judicial?</h2>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            Se produce en el marco de un procedimiento judicial (ejecución hipotecaria, reclamación de cantidad).
                        </p>
                        <ul className="text-sm space-y-2">
                            <li className="flex gap-2"><CheckCircle size={16} className="text-brand-500 mt-0.5"/> Interviene un Juzgado.</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-brand-500 mt-0.5"/> Rige la <Link to={ROUTES.GUIDE_PILLAR} className="underline hover:text-brand-700">LEC</Link>.</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-brand-500 mt-0.5"/> Aplica la <Link to={ROUTES.RULE_70} className="underline hover:text-brand-700">Regla del 70%</Link>.</li>
                        </ul>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <Building2 className="text-brand-600 mb-4" size={32} />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">¿Qué es una subasta AEAT?</h2>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            Es una subasta administrativa organizada por la Agencia Tributaria para liquidar bienes embargados por deudas fiscales.
                        </p>
                         <ul className="text-sm space-y-2">
                            <li className="flex gap-2"><CheckCircle size={16} className="text-brand-500 mt-0.5"/> Procedimiento administrativo.</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-brand-500 mt-0.5"/> Reglamento General de Recaudación.</li>
                            <li className="flex gap-2"><XCircle size={16} className="text-red-500 mt-0.5"/> NO aplica regla del 70%.</li>
                        </ul>
                    </div>
                </div>

                <h2 className="text-3xl mt-12 mb-6">Tabla comparativa rápida</h2>
                <div className="overflow-x-auto my-8 not-prose shadow-lg rounded-xl border border-slate-200">
                    <table className="w-full text-left text-sm border-collapse bg-white">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="p-4 font-bold uppercase tracking-wider text-xs">Aspecto</th>
                                <th className="p-4 font-bold uppercase tracking-wider text-xs bg-brand-700">Subasta Judicial</th>
                                <th className="p-4 font-bold uppercase tracking-wider text-xs">Subasta AEAT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="p-4 font-bold text-slate-700">Órgano</td>
                                <td className="p-4 bg-slate-50">Juzgado de 1ª Instancia / Mercantil</td>
                                <td className="p-4">Agencia Tributaria</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-bold text-slate-700">Normativa</td>
                                <td className="p-4 bg-slate-50">Ley de Enjuiciamiento Civil (LEC)</td>
                                <td className="p-4">Reglamento General de Recaudación</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-bold text-slate-700">Regla del 70%</td>
                                <td className="p-4 bg-slate-50 text-green-700 font-bold">SÍ (Garantía de aprobación)</td>
                                <td className="p-4 text-red-700 font-bold">NO (Mesa decide)</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-bold text-slate-700">Depósito</td>
                                <td className="p-4 bg-slate-50">5% Valor Tasación</td>
                                <td className="p-4">Variable (Suele ser 5%)</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-bold text-slate-700">Protección Vivienda</td>
                                <td className="p-4 bg-slate-50">Sí (Vivienda habitual protegida)</td>
                                <td className="p-4">Menor protección</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-bold text-slate-700">Cesión de remate</td>
                                <td className="p-4 bg-slate-50">Posible (si se cumplen plazos)</td>
                                <td className="p-4">No en los mismos términos</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2 className="text-3xl mt-12 mb-6">Principales diferencias estratégicas</h2>
                
                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Margen y Descuentos</h3>
                <p>
                    En las judiciales, la complejidad procesal suele ahuyentar a muchos inversores, lo que puede generar mayores descuentos. En AEAT, al ser procedimientos más "limpios" documentalmente, a veces hay más competencia, aunque existe flexibilidad en tramos bajos si la Mesa lo aprueba.
                </p>

                <figure className="my-14">
                    <img 
                        src={IMG_JUDICIAL} 
                        alt="Procedimiento judicial complejo" 
                        width="800"
                        height="450"
                        loading="lazy"
                        className="w-full h-auto object-cover rounded-2xl shadow-lg border border-slate-100" 
                    />
                    <figcaption className="text-center text-sm text-slate-500 mt-3 font-medium italic">La vía judicial ofrece garantías procesales fuertes pero tiempos más dilatados.</figcaption>
                </figure>

                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Riesgo Jurídico</h3>
                <p>
                    <strong>Judicial:</strong> Es más técnico. Debes entender bien las notificaciones, los plazos de recursos y la <Link to={ROUTES.CHARGES} className="text-brand-700 underline hover:text-brand-900">purga de cargas</Link>. Es previsible si se analiza bien.
                </p>
                <p>
                    <strong>AEAT:</strong> Depende mucho de la fase del procedimiento administrativo. A veces es más rápido obtener el decreto de adjudicación, pero la posesión puede ser más compleja si no está bien trabada.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Posesión del inmueble</h3>
                <p>
                    En ambos casos el inmueble puede estar ocupado. Sin embargo, el juzgado que ejecuta la subasta judicial es el mismo que debe darte la posesión (Art. 675 LEC). En subastas administrativas, si el ocupante no se va, a veces toca iniciar un procedimiento judicial posterior (desahucio) si la administración no logra el lanzamiento.
                </p>

                <figure className="my-14">
                    <img 
                        src={IMG_AEAT} 
                        alt="Edificio oficial de administración pública" 
                        width="800"
                        height="450"
                        loading="lazy"
                        className="w-full h-auto object-cover rounded-2xl shadow-lg border border-slate-100" 
                    />
                </figure>

                <h2 className="text-3xl mt-12 mb-6">¿Cuál es más interesante para invertir?</h2>
                <p>No existe una respuesta universal. Depende de tu perfil:</p>
                
                <ul className="list-disc pl-5 space-y-4">
                    <li><strong>Tu liquidez:</strong> Ambas requieren fondos propios, pero los plazos de pago pueden variar ligeramente.</li>
                    <li><strong>Tu experiencia jurídica:</strong> Si no sabes leer una nota simple o un edicto judicial, la judicial es más peligrosa.</li>
                    <li><strong>Tu capacidad de gestión:</strong> ¿Tienes equipo para gestionar una ocupación o reformas?</li>
                </ul>

                <h2 className="text-3xl mt-12 mb-6">Errores frecuentes</h2>
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl my-6 not-prose">
                    <h3 className="text-red-900 font-bold mb-2 flex items-center gap-2"><AlertTriangle size={20}/> ¡Evita esto!</h3>
                    <ul className="list-disc pl-5 space-y-1 text-red-800 text-sm">
                        <li>Creer que todas las subastas funcionan igual y tienen los mismos plazos.</li>
                        <li>Aplicar la regla del 70% en AEAT (allí la Mesa decide si aprueba posturas bajas).</li>
                        <li>No revisar cargas anteriores (subsisten en ambos casos).</li>
                    </ul>
                </div>

                <h2 className="text-3xl mt-12 mb-6">Conclusión</h2>
                <p>
                    Las subastas judiciales y las subastas AEAT son herramientas distintas dentro del mercado de inversión en activos públicos. Invertir sin entender sus diferencias puede convertir una oportunidad en un error estratégico.
                </p>
                <p>
                    En <strong>Activos Offmarket</strong> analizamos cada activo según el tipo de procedimiento y su impacto real en la rentabilidad.
                </p>

                <hr className="my-16 border-slate-200" />

                {/* FAQ */}
                <section className="not-prose bg-slate-50 p-10 rounded-3xl border border-slate-200">
                    <h2 className="font-serif text-2xl font-bold text-slate-900 mb-8">Preguntas Frecuentes</h2>
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Se puede visitar el inmueble en ambos casos?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">No siempre. Depende del expediente concreto y de la colaboración del ocupante.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Es más segura una judicial?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">No necesariamente. Ambas requieren análisis técnico. La judicial tiene garantías procesales fuertes.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Dónde hay más oportunidades?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Depende del momento del mercado. Judicial suele tener más volumen residencial.</p>
                        </div>
                    </div>
                </section>
                
            </article>
        </main>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-10 max-h-[calc(100vh-120px)] overflow-auto pr-2 custom-scrollbar">
            
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 block">Canal de Alertas</span>
                <h3 className="font-serif text-2xl font-bold mb-4">¿Judicial o AEAT?</h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    En el canal Premium te digo exactamente qué tipo de subasta es y qué normativa aplica antes de que pierdas el tiempo.
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
                    <Link to={ROUTES.RULE_70} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Regla del 70%</span>
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
                </nav>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
};

export default AuctionComparisonGuide;