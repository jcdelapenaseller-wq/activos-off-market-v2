import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronRight, Briefcase, Gavel, ArrowRight, BookOpen, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const AuctionAssignmentGuide: React.FC = () => {
  
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  // State for read time
  const [readTime, setReadTime] = useState(3);

  // IMÁGENES ÚNICAS Y EXCLUSIVAS (Política de no repetición)
  // 1. Hero: Acuerdo entre partes (Representa la Cesión). ID: 1556761175-5973dc0f32e7
  const IMG_HERO = "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200&h=630"; 
  
  // 2. Judicial: Balanza de la justicia (Diferente al mazo de otras guías). ID: 1589578527966-fdac0f44566c
  const IMG_JUDICIAL = "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&q=80&w=800&h=450";
  
  // 3. Estrategia: Análisis de datos y gráficos (Enfoque financiero). ID: 1460925895917-afdab827c52f
  const IMG_STRATEGY = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800&h=450";

  // Schema.org Structured Data
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": "Cesión de remate en subastas judiciales: guía práctica",
        "description": "Descubre qué es la cesión de remate en subastas judiciales en España y cuándo puede interesarte estratégicamente.",
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
          "@id": "https://activosoffmarket.es/cesion-de-remate-subasta-judicial/"
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
            "name": "Cesión de Remate",
            "item": "https://activosoffmarket.es/cesion-de-remate-subasta-judicial/"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "¿Siempre se puede ceder el remate?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No en todos los procedimientos ni en cualquier fase. Depende del tipo de ejecución y de los plazos procesales vigentes."
            }
          },
          {
            "@type": "Question",
            "name": "¿Genera impuestos la cesión de remate?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sí, puede generar obligaciones fiscales específicas (ITP) dependiendo de si hay beneficio en la cesión y de la comunidad autónoma."
            }
          },
          {
            "@type": "Question",
            "name": "¿Es habitual en subastas judiciales?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Es menos frecuente que la adjudicación directa, pero se utiliza recurrentemente en operaciones estratégicas de inversión profesional."
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

    // Scroll to top on mount
    window.scrollTo(0, 0);

    // SEO Optimization: Title (50-60 chars) & Description (140-155 chars)
    document.title = "Cesión de Remate: Qué es y Cómo Funciona | Activos Off-Market";

    // Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Guía sobre la cesión de remate en subastas. Aprende a transmitir el derecho de adjudicación a un tercero, ahorrar impuestos y monetizar tu posición.");

    // Helper to set meta tags dynamically
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
    setMeta('og:title', 'Cesión de Remate: Qué es y Cómo Funciona');
    setMeta('og:description', 'Estrategia avanzada: transmite el derecho de adjudicación antes de la inscripción definitiva.');
    setMeta('og:image', IMG_HERO);
    setMeta('og:url', 'https://activosoffmarket.es/cesion-de-remate-subasta-judicial/');
    setMeta('og:site_name', 'Activos Off-Market');

    // Twitter
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
    canonical.setAttribute('href', "https://activosoffmarket.es/cesion-de-remate-subasta-judicial/");

    // Schema.org
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
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Cesión de Remate</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Cesión de Remate en Subastas: <br/><span className="text-brand-700 italic">Qué es y cuándo interesa</span>
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
                        alt="Acuerdo de cesión de remate entre partes"
                        width="1200"
                        height="630"
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                    />
                </figure>

                <p className="text-xl text-slate-700 leading-relaxed font-light mb-10 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                    La <strong>cesión de remate</strong> es una figura jurídica poco conocida en el ámbito de las subastas judiciales en España. 
                    Permite que el adjudicatario inicial (quien ganó la puja) transmita su "derecho de adjudicación" a un tercero antes de formalizar la inscripción definitiva del inmueble en el Registro.
                </p>

                <div className="bg-brand-50 p-6 rounded-xl border-l-4 border-brand-500 my-8 not-prose">
                    <p className="text-brand-900 font-medium m-0 text-lg">
                        "Bien utilizada, puede ser una herramienta estratégica de alto valor. Mal entendida, puede generar conflictos procesales y riesgos jurídicos innecesarios."
                    </p>
                </div>

                <h2 className="text-3xl mt-12 mb-6">¿Qué es exactamente la cesión de remate?</h2>
                <p>
                    Es la posibilidad procesal de que quien ha resultado mejor postor en una <Link to={ROUTES.GUIDE_PILLAR} className="text-brand-700 underline decoration-1 underline-offset-2 hover:text-brand-900">subasta judicial</Link> ceda su posición a otra persona (física o jurídica) antes de que se dicte el decreto de adjudicación firme.
                </p>
                <p>
                    <strong>No es una reventa tradicional.</strong> Es una transmisión del derecho a adjudicarse el bien. El tercero (cesionario) pasa a ocupar la posición del adjudicatario original frente al juzgado.
                </p>

                <h2 className="text-3xl mt-12 mb-6">¿Cuándo está permitida?</h2>
                <p>
                    En el marco de una ejecución hipotecaria, la cesión de remate está expresamente prevista en la Ley de Enjuiciamiento Civil. Sin embargo, no es un derecho absoluto ni automático:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Debe realizarse dentro del <strong>plazo procesal</strong> habilitado tras la aprobación del remate.</li>
                    <li>Requiere <strong>aceptación judicial</strong> y comparecencia (normalmente ante el Letrado de la Administración de Justicia).</li>
                    <li>Exige el cumplimiento estricto de los requisitos formales (identificación del cesionario, solvencia, etc.).</li>
                </ul>

                <figure className="my-14">
                    <img 
                        src={IMG_JUDICIAL} 
                        alt="Balanza de la justicia y procedimiento legal" 
                        width="800"
                        height="450"
                        loading="lazy"
                        className="w-full h-auto object-cover rounded-2xl shadow-lg border border-slate-100" 
                    />
                    <figcaption className="text-center text-sm text-slate-500 mt-3 font-medium italic">La comparecencia en el juzgado es obligatoria para formalizar la cesión.</figcaption>
                </figure>

                <h2 className="text-3xl mt-12 mb-6">¿Qué implica económicamente?</h2>
                <p>
                    Para el cesionario (quien recibe el derecho), la operación implica asumir todas las cargas de la adjudicación original:
                </p>
                <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Briefcase size={20} className="text-brand-600"/> Obligaciones</h3>
                        <ul className="text-sm text-slate-600 space-y-2">
                            <li>Completar el precio del remate (restando el <Link to={ROUTES.DEPOSIT} className="text-brand-700 hover:underline">depósito ya consignado</Link>).</li>
                            <li>Pagar el Impuesto de Transmisiones Patrimoniales (ITP).</li>
                        </ul>
                    </div>
                    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><TrendingUp size={20} className="text-brand-600"/> Oportunidad</h3>
                        <ul className="text-sm text-slate-600 space-y-2">
                            <li>El cedente puede obtener un margen de beneficio si existe un acuerdo económico privado por la cesión.</li>
                        </ul>
                    </div>
                </div>

                <h2 className="text-3xl mt-12 mb-6">Diferencia entre cesión de remate y compraventa posterior</h2>
                <p>
                    Muchos inversores confunden ambas figuras, pero sus implicaciones fiscales y temporales son opuestas:
                </p>
                <div className="overflow-x-auto my-8 not-prose">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-200">
                                <th className="p-4 font-bold text-slate-900">Característica</th>
                                <th className="p-4 font-bold text-brand-700">Cesión de Remate</th>
                                <th className="p-4 font-bold text-slate-600">Compraventa Posterior</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-100">
                                <td className="p-4 font-medium">Momento</td>
                                <td className="p-4">Antes de inscripción registral</td>
                                <td className="p-4">Tras inscripción a nombre del adjudicatario</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="p-4 font-medium">Objeto</td>
                                <td className="p-4">Derecho procesal</td>
                                <td className="p-4">Propiedad del inmueble</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="p-4 font-medium">Costes</td>
                                <td className="p-4">Menores (una sola transmisión)</td>
                                <td className="p-4">Dobles (ITP adjudicación + ITP venta)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2 className="text-3xl mt-12 mb-6">¿Cuándo puede ser interesante?</h2>
                <p>
                    Esta figura no es para improvisar, pero resulta muy útil en escenarios concretos:
                </p>
                <ul className="space-y-4 list-none pl-0 my-6">
                    <li className="flex gap-3">
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20}/>
                        <span><strong>Intermediación:</strong> El adjudicatario actúa como "conseguidor" profesional y cede el activo a un inversor final.</span>
                    </li>
                    <li className="flex gap-3">
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20}/>
                        <span><strong>Liquidez Inmediata:</strong> Se detecta un comprador interesado antes de tener que desembolsar el total del precio.</span>
                    </li>
                    <li className="flex gap-3">
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20}/>
                        <span><strong>Optimización Fiscal:</strong> Evita la doble tributación de una compraventa sucesiva rápida.</span>
                    </li>
                </ul>

                <h2 className="text-3xl mt-12 mb-6">Riesgos Frecuentes</h2>
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl my-6 not-prose">
                    <h3 className="text-red-900 font-bold mb-2 flex items-center gap-2"><AlertTriangle size={20}/> ¡Cuidado!</h3>
                    <ul className="list-disc pl-5 space-y-1 text-red-800 text-sm">
                        <li>No respetar los plazos procesales puede anular la cesión.</li>
                        <li>No formalizar correctamente ante el juzgado deja al cedente como responsable único.</li>
                        <li>Si existen <Link to={ROUTES.CHARGES} className="text-red-900 underline font-bold">cargas anteriores</Link>, el cesionario se las "come" igual que el adjudicatario original.</li>
                    </ul>
                </div>

                <figure className="my-14">
                    <img 
                        src={IMG_STRATEGY} 
                        alt="Análisis estratégico y financiero de la operación" 
                        width="800"
                        height="450"
                        loading="lazy"
                        className="w-full h-auto object-cover rounded-2xl shadow-lg border border-slate-100" 
                    />
                </figure>

                <h2 className="text-3xl mt-12 mb-6">Estrategia antes de plantear una cesión</h2>
                <p>
                    Antes de comprometerte a ceder un remate, confirma la viabilidad jurídica del expediente. Debes tener muy claros los números, incluyendo la posible <Link to={ROUTES.RULE_70} className="text-brand-700 underline decoration-1 underline-offset-2 hover:text-brand-900">regla del 70%</Link> para saber si la adjudicación será firme o provisional.
                </p>

                <hr className="my-16 border-slate-200" />

                {/* FAQ */}
                <section className="not-prose bg-slate-50 p-10 rounded-3xl border border-slate-200">
                    <h2 className="font-serif text-2xl font-bold text-slate-900 mb-8">Preguntas Frecuentes</h2>
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Siempre se puede ceder el remate?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">No en todos los procedimientos ni en cualquier fase. Depende del tipo de ejecución y de los plazos procesales vigentes.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Genera impuestos?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Sí, la cesión puede tener implicaciones en ITP o IVA, y si hay ganancia patrimonial para el cedente, tributa en IRPF.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Es habitual en subastas?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Es menos frecuente que la adjudicación directa, pero es una herramienta habitual en la inversión profesional y fondos.</p>
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
                <h3 className="font-serif text-2xl font-bold mb-4">Estrategia Avanzada</h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    En el canal Premium explico qué subastas son aptas para cesión de remate y cómo plantear la operación.
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
                    <Link to={ROUTES.RULE_70} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Regla del 70%</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                     <Link to={ROUTES.CHARGES} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cargas y Deudas</span>
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

export default AuctionAssignmentGuide;