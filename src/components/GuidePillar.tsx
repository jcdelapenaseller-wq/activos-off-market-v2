import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronRight, CheckCircle, ArrowRight, BookOpen, AlertTriangle, Lightbulb, Info, FileText, Scale, Landmark, MapPin, XCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import LeadMagnetBlock from './LeadMagnetBlock';

const GuidePillar: React.FC = () => {
  
  // Dynamic Date
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  // State for read time
  const [readTime, setReadTime] = useState(3);

  // Images
  const IMG_FEATURED = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200&h=630";
  const IMG_STEP_BY_STEP = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800&h=450";

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
    document.title = "Subastas Judiciales en España (BOE) | Guía Completa para Invertir 2025";
    
    // Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', "Aprende cómo funcionan las subastas judiciales en España (BOE), riesgos reales, depósito del 5% y cómo encontrar oportunidades rentables.");
    }

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

    setMeta('og:title', "Subastas Judiciales en España (BOE) | Guía Completa para Invertir 2025");
    setMeta('og:description', "Aprende cómo funcionan las subastas judiciales en España (BOE), riesgos reales, depósito del 5% y cómo encontrar oportunidades rentables.");
    setMeta('og:type', "article");
    setMeta('og:url', "https://activosoffmarket.es/subastas-judiciales-espana/");
    setMeta('og:image', IMG_FEATURED);
    setMeta('og:site_name', "Activos Off-Market");

    // Schema.org Article Structured Data
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Subastas Judiciales en España (BOE): Guía Completa para Invertir",
      "description": "Aprende cómo funcionan las subastas judiciales en España (BOE), riesgos reales, depósito del 5% y cómo encontrar oportunidades rentables.",
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
      "image": [IMG_FEATURED],
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://activosoffmarket.es/subastas-judiciales-espana/"
      }
    };

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
      
      {/* HEADER SECTION */}
      <header className="bg-white pb-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
            <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
                <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
                <ChevronRight size={14} className="mx-2" />
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Guía Subastas</span>
            </nav>

            <h1 className="font-serif text-4xl md:text-6xl font-bold text-slate-900 mb-8 leading-[1.1] tracking-tight">
                Subastas Judiciales en España (BOE): <br/>
                <span className="text-brand-700 italic">Guía Completa para Invertir con Seguridad</span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                    <img 
                      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzI5M2Y1NiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXNpemU9IjYwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zNWVtIj5KPC90ZXh0Pjwvc3ZnPg==" 
                      alt="José de la Peña" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" 
                    />
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-none">José de la Peña</span>
                        <span className="text-xs text-brand-600 font-semibold mt-1 uppercase tracking-wide">Jurista & Analista de Inversión</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                    <Calendar size={14} />
                    <span className="capitalize font-medium">{currentMonthYear}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                    <Clock size={14} />
                    <span className="font-medium">{readTime} min lectura</span>
                </div>
            </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* MAIN CONTENT */}
        <main className="lg:col-span-8">
            <article className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-loose prose-li:leading-relaxed">
                
                {/* FEATURED IMAGE */}
                <figure className="mb-12 -mt-6">
                    <img 
                        src={IMG_FEATURED} 
                        alt="Análisis profesional de subastas judiciales en España"
                        width="1200"
                        height="630"
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                    />
                </figure>

                {/* CONTEXTUAL SEO LINK */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-10 text-sm text-slate-600 flex gap-4 items-start not-prose">
                     <Info className="text-brand-600 flex-shrink-0 mt-1" size={20} />
                     <div>
                         <p className="m-0 leading-relaxed">
                             <strong>Contexto:</strong> Las subastas judiciales son una categoría específica dentro del ecosistema general del <Link to={ROUTES.SUBASTAS_BOE} className="text-brand-700 font-bold hover:underline">Portal de Subastas del BOE</Link>. Si te pierdes con la terminología (adjudicación, remate, lanzamiento...), he preparado un <Link to={ROUTES.GLOSSARY} className="text-brand-700 font-bold hover:underline">Glosario de Subastas Judiciales</Link> donde explico cada concepto en detalle.
                         </p>
                     </div>
                </div>

                <LeadMagnetBlock />

                {/* INTRODUCCIÓN */}
                <p className="text-xl text-slate-700 leading-relaxed font-light mb-10 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                    Invertir en subastas judiciales es, posiblemente, la vía más potente para adquirir patrimonio inmobiliario con descuentos del 30% al 50% en España. Sin embargo, <strong>no es un mercado para la improvisación</strong>. 
                </p>
                
                <p>
                   A diferencia de una compraventa ante notario, aquí no hay garantías de saneamiento por vicios ocultos y compras "a cuerpo cierto". Si no sabes analizar el expediente judicial, lo que parece una ganga puede convertirse en una pesadilla de deudas heredadas y problemas posesorios.
                </p>

                {/* H2: QUÉ SON */}
                <h2 id="que-es" className="text-3xl mt-16 mb-8 flex items-center gap-3">
                    <Scale className="text-brand-600" /> ¿Qué son las subastas judiciales?
                </h2>
                <p>
                    Una subasta judicial es un procedimiento de venta forzosa ordenado por un juez para transformar un bien (inmueble, vehículo, etc.) en dinero líquido y así saldar una deuda impagada. En España, todo este proceso se centraliza obligatoriamente en el <strong>Portal de Subastas del BOE</strong>.
                </p>
                <p>
                    Es vital distinguir entre los tres tipos principales, ya que sus reglas de juego son diferentes:
                </p>

                <div className="grid gap-6 my-8 not-prose">
                    <div className="bg-white border-l-4 border-brand-600 p-6 rounded-r-xl shadow-sm">
                        <h3 className="font-bold text-slate-900 text-lg mb-2">1. Subasta Judicial (La más común)</h3>
                        <p className="text-slate-600 text-sm m-0">
                            Ordenada por un Juzgado (Civil, Mercantil, etc.). Rige la Ley de Enjuiciamiento Civil (LEC). Es la más segura jurídicamente porque ofrece una "purga de cargas" clara, aunque los plazos de entrega de llaves pueden dilatarse.
                        </p>
                    </div>
                    <div className="bg-white border-l-4 border-slate-400 p-6 rounded-r-xl shadow-sm">
                        <h3 className="font-bold text-slate-900 text-lg mb-2">2. Subasta AEAT (Hacienda)</h3>
                        <p className="text-slate-600 text-sm m-0">
                            Administrativa. <Link to={ROUTES.COMPARISON} className="text-brand-700 hover:underline font-bold">Ver diferencias Judicial vs AEAT</Link>. No aplica la regla del 70% igual que en juzgados y la posesión puede ser más compleja de recuperar si no está bien trabada.
                        </p>
                    </div>
                    <div className="bg-white border-l-4 border-slate-400 p-6 rounded-r-xl shadow-sm">
                        <h3 className="font-bold text-slate-900 text-lg mb-2">3. Subasta Notarial</h3>
                        <p className="text-slate-600 text-sm m-0">
                            Extrajudicial. Se celebra ante notario. Suele derivar de ejecuciones hipotecarias pactadas en escritura.
                        </p>
                    </div>
                </div>

                {/* H2: PASO A PASO */}
                <h2 id="funcionamiento" className="text-3xl mt-16 mb-8">Cómo funciona una subasta judicial paso a paso</h2>
                <p>El ciclo de vida de una subasta en el Portal del BOE dura 20 días naturales, pero el proceso completo para el inversor es más largo.</p>

                <div className="relative border-l-2 border-brand-200 ml-6 space-y-12 my-12 not-prose">
                    
                    {/* Paso 1 */}
                    <div className="relative pl-10">
                        <div className="absolute -left-[17px] bg-brand-600 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">1</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Publicación y Análisis</h3>
                        <p className="text-slate-600">
                            El edicto se publica en el BOE. Aquí empieza tu cuenta atrás para hacer la <em>Due Diligence</em>: pedir nota simple, valorar mercado y estudiar la ocupación.
                        </p>
                    </div>

                    {/* Paso 2 */}
                    <div className="relative pl-10">
                        <div className="absolute -left-[17px] bg-brand-600 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">2</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Depósito del 5%</h3>
                        <p className="text-slate-600">
                            Para entrar a la sala virtual, debes consignar el 5% del valor de tasación (no del valor de mercado). <Link to={ROUTES.DEPOSIT} className="text-brand-700 underline">Detalles sobre la fianza y sus riesgos</Link>.
                        </p>
                    </div>

                    {/* Paso 3 */}
                    <div className="relative pl-10">
                        <div className="absolute -left-[17px] bg-brand-600 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">3</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Periodo de Pujas</h3>
                        <p className="text-slate-600">
                            Dura 20 días naturales. Las pujas son anónimas. Si pujas en el último minuto, la subasta se extiende automáticamente. El 90% de la acción ocurre en la última hora.
                        </p>
                    </div>

                    {/* Paso 4 */}
                    <div className="relative pl-10">
                        <div className="absolute -left-[17px] bg-brand-600 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">4</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Adjudicación y Pago (Remate)</h3>
                        <p className="text-slate-600">
                            Si ganas, el Letrado de la Administración de Justicia (LAJ) aprueba el remate. Tienes <strong>40 días hábiles</strong> para pagar el resto del precio. Ojo: si no tienes el dinero, pierdes el depósito.
                        </p>
                    </div>

                    {/* Paso 5 */}
                    <div className="relative pl-10">
                        <div className="absolute -left-[17px] bg-slate-400 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">5</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Decreto de Adjudicación</h3>
                        <p className="text-slate-600">
                            Es tu "título de propiedad". Con este documento judicial vas a Hacienda (ITP) y luego al Registro de la Propiedad para inscribir la vivienda a tu nombre.
                        </p>
                    </div>
                </div>

                <figure className="my-10">
                    <img 
                        src={IMG_STEP_BY_STEP} 
                        alt="Proceso de análisis de expediente judicial" 
                        width="800"
                        height="450"
                        loading="lazy"
                        className="w-full h-auto object-cover rounded-2xl shadow-lg" 
                    />
                </figure>

                {/* H2: RIESGOS REALES */}
                <h2 id="riesgos" className="text-3xl mt-16 mb-8 flex items-center gap-3">
                    <AlertTriangle className="text-amber-500" /> Riesgos reales de las subastas
                </h2>
                <p>
                    Invertir en subastas no es como comprar en Idealista. Aquí no hay agente inmobiliario que te enseñe el piso. Los riesgos existen y deben cuantificarse económicamente antes de pujar.
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                    <Link to={ROUTES.OCCUPIED} className="block group">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 h-full hover:border-brand-300 hover:shadow-md transition-all">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <span className="bg-slate-200 text-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                Vivienda Ocupada
                            </h3>
                            <p className="text-sm text-slate-600 group-hover:text-brand-800 transition-colors">
                                El mayor miedo. ¿Quién vive dentro? ¿Un ex-propietario (fácil de echar) o un inquilino con contrato protegido?
                            </p>
                        </div>
                    </Link>

                    <Link to={ROUTES.CHARGES} className="block group">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 h-full hover:border-brand-300 hover:shadow-md transition-all">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <span className="bg-slate-200 text-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                Cargas Registrales
                            </h3>
                            <p className="text-sm text-slate-600 group-hover:text-brand-800 transition-colors">
                                El error que arruina. Las cargas anteriores a la subasta NO se borran. Tú las heredas.
                            </p>
                        </div>
                    </Link>

                    <Link to={ROUTES.VISIT} className="block group">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 h-full hover:border-brand-300 hover:shadow-md transition-all">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <span className="bg-slate-200 text-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                Estado Físico
                            </h3>
                            <p className="text-sm text-slate-600 group-hover:text-brand-800 transition-colors">
                                Compras "a cuerpo cierto". ¿Se puede visitar el interior? Descubre por qué casi nunca es posible.
                            </p>
                        </div>
                    </Link>

                    <Link to={ROUTES.ERRORS} className="block group">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 h-full hover:border-brand-300 hover:shadow-md transition-all">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <span className="bg-slate-200 text-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                                Errores de Análisis
                            </h3>
                            <p className="text-sm text-slate-600 group-hover:text-brand-800 transition-colors">
                                Leer mal el edicto o confundir el número de finca puede hacerte comprar un trastero a precio de piso.
                            </p>
                        </div>
                    </Link>
                </div>

                {/* H2: OPORTUNIDADES RENTABLES */}
                <h2 id="oportunidades" className="text-3xl mt-16 mb-8 flex items-center gap-3">
                    <Lightbulb className="text-yellow-500" /> Cómo encontrar oportunidades rentables
                </h2>
                <p>
                    A pesar de los riesgos, la rentabilidad existe. Para encontrarla, debes aplicar un filtro estricto. Antes de pujar en una subasta es recomendable calcular la rentabilidad real de la operación. Puedes hacerlo con esta <Link to={ROUTES.CALCULATOR} className="text-brand-700 font-bold hover:underline">calculadora de subastas judiciales</Link>. Mi método se basa en estos pilares:
                </p>

                <ul className="space-y-6 my-8 list-none pl-0">
                    <li className="flex gap-4">
                        <div className="bg-brand-100 p-2 rounded-lg h-fit text-brand-700"><MapPin size={24} /></div>
                        <div>
                            <strong className="block text-slate-900 text-lg">1. Ubicación y Valor Real</strong>
                            <span className="text-slate-600">Ignora el "Valor de Tasación" del BOE (suele estar inflado, de la época de la burbuja). Calcula el valor de mercado actual en Idealista/Fotocasa y aplica un descuento de seguridad del 20-30%.</span>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <div className="bg-brand-100 p-2 rounded-lg h-fit text-brand-700"><FileText size={24} /></div>
                        <div>
                            <strong className="block text-slate-900 text-lg">2. Estudio de Cargas</strong>
                            <span className="text-slate-600">Solicita siempre la Nota Simple actualizada. Tu puja máxima debe ser: <em>Valor Mercado - Reformas - Impuestos - Cargas Anteriores - Margen Beneficio</em>.</span>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <div className="bg-brand-100 p-2 rounded-lg h-fit text-brand-700"><Landmark size={24} /></div>
                        <div>
                            <strong className="block text-slate-900 text-lg">3. Dominio de la Regla del 70%</strong>
                            <span className="text-slate-600">Entender los tramos del Art. 670 LEC te permite saber si tu adjudicación será firme o si el banco/deudor pueden quitártela. <Link to={ROUTES.RULE_70} className="text-brand-700 font-bold hover:underline">Domina la mecánica de adjudicación (Art. 670)</Link>.</span>
                        </div>
                    </li>
                </ul>

                <hr className="my-16 border-slate-200" />

                {/* H2: FAQ (SEO OPTIMIZED) */}
                <h2 id="faq" className="text-3xl font-bold text-slate-900 mb-8">Preguntas Frecuentes (FAQ)</h2>
                
                <div className="not-prose space-y-4">
                    <details className="group bg-white border border-slate-200 rounded-xl open:border-brand-200 open:ring-1 open:ring-brand-100 transition-all">
                        <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-slate-800 group-hover:text-brand-700">
                            ¿Puedo visitar el inmueble antes de pujar?
                            <ChevronRight className="group-open:rotate-90 transition-transform text-slate-400" />
                        </summary>
                        <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                            Por norma general, <strong>no</strong>. En subastas judiciales no hay visitas organizadas. Compras "a ciegas" en cuanto al estado interior. A veces, si el ejecutado colabora (muy raro), se puede pactar, pero debes asumir reforma integral en tus números.
                        </div>
                    </details>

                    <details className="group bg-white border border-slate-200 rounded-xl open:border-brand-200 open:ring-1 open:ring-brand-100 transition-all">
                        <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-slate-800 group-hover:text-brand-700">
                            ¿Necesito abogado y procurador para participar?
                            <ChevronRight className="group-open:rotate-90 transition-transform text-slate-400" />
                        </summary>
                        <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                            Para participar y pujar, <strong>no es obligatorio</strong>. Puedes hacerlo tú mismo con tu certificado digital. Sin embargo, si surgen problemas procesales o necesitas pedir el lanzamiento (desalojo) posterior, sí necesitarás asistencia letrada.
                        </div>
                    </details>

                    <details className="group bg-white border border-slate-200 rounded-xl open:border-brand-200 open:ring-1 open:ring-brand-100 transition-all">
                        <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-slate-800 group-hover:text-brand-700">
                            ¿Puedo pedir una hipoteca para pagar la subasta?
                            <ChevronRight className="group-open:rotate-90 transition-transform text-slate-400" />
                        </summary>
                        <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                            Es <strong>muy difícil y arriesgado</strong>. Tienes solo 40 días hábiles para pagar. Los bancos tradicionales no suelen financiar si no pueden tasar el interior o si no hay inscripción registral previa a tu nombre. Se recomienda tener liquidez propia o financiación alternativa.
                        </div>
                    </details>

                    <details className="group bg-white border border-slate-200 rounded-xl open:border-brand-200 open:ring-1 open:ring-brand-100 transition-all">
                        <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-slate-800 group-hover:text-brand-700">
                            ¿Qué pasa si la vivienda tiene "okupas"?
                            <ChevronRight className="group-open:rotate-90 transition-transform text-slate-400" />
                        </summary>
                        <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                            Si son ocupantes sin título (precarios), puedes pedir el lanzamiento al mismo juzgado (Art. 675 LEC). El proceso tarda de 4 a 9 meses. Si tienen contrato de alquiler válido anterior a la hipoteca, tendrás que respetarlo hasta su fin.
                        </div>
                    </details>

                    <details className="group bg-white border border-slate-200 rounded-xl open:border-brand-200 open:ring-1 open:ring-brand-100 transition-all">
                        <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-slate-800 group-hover:text-brand-700">
                            ¿Se devuelve el depósito si no gano?
                            <ChevronRight className="group-open:rotate-90 transition-transform text-slate-400" />
                        </summary>
                        <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                            Sí. El Portal de Subastas ordena la devolución automática a tu IBAN en cuanto finaliza la subasta, salvo que marques la casilla de "reserva de postura" (quedar en lista de espera).
                        </div>
                    </details>

                    <details className="group bg-white border border-slate-200 rounded-xl open:border-brand-200 open:ring-1 open:ring-brand-100 transition-all">
                        <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-slate-800 group-hover:text-brand-700">
                            ¿Cuánto dinero necesito tener ahorrado?
                            <ChevronRight className="group-open:rotate-90 transition-transform text-slate-400" />
                        </summary>
                        <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                            Además del precio de adjudicación, calcula un <strong>10-12% extra</strong> para Impuesto de Transmisiones Patrimoniales (ITP), Notaría, Registro y posibles deudas de comunidad/IBI atrasadas.
                        </div>
                    </details>
                </div>
                
            </article>
        </main>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-10 max-h-[calc(100vh-120px)] overflow-auto pr-2 custom-scrollbar">
            
            {/* CTA TELEGRAM */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 block flex items-center gap-2">
                    <CheckCircle size={14} /> Oportunidades Filtradas
                </span>
                <h3 className="font-serif text-2xl font-bold mb-4 leading-tight">
                    ¿Quieres ver subastas rentables sin buscar horas en el BOE?
                </h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    Cada semana selecciono y publico en Telegram las mejores oportunidades, filtrando el ruido y destacando las que tienen margen real.
                </p>
                <a 
                    href="https://t.me/activosoffmarket" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-white text-slate-900 font-bold py-4 px-4 rounded-xl text-center hover:bg-brand-50 transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2 group"
                >
                    Entrar al Canal Gratuito <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                </a>
                <p className="text-xs text-center text-slate-500 mt-4">Únete a +2.500 inversores</p>
            </div>

            {/* SATELLITE ARTICLES NAVIGATION */}
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <BookOpen size={18} className="text-brand-600"/>
                    Guías Técnicas
                </h4>
                <nav className="space-y-4">
                    <Link to={ROUTES.ANALYSIS} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Análisis Paso a Paso</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.ERRORS} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Errores Frecuentes</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.OCCUPIED} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Vivienda Ocupada</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.CHARGES} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cargas y Deudas</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.RULE_70} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Regla del 70%</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.DEPOSIT} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Depósito del 5%</span>
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

      <section className="bg-brand-900 py-20 border-t border-brand-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-8">
                Deja de improvisar con tu capital
            </h2>
            <p className="text-brand-100 text-lg md:text-xl mb-10 font-light leading-relaxed">
                El mercado de subastas es rentable para quien tiene la información correcta. Únete a mi canal y recibe análisis verificados.
            </p>
            <a 
                href="https://t.me/activosoffmarket"
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white text-brand-900 font-bold py-4 px-10 rounded-xl hover:bg-brand-50 transition-transform hover:-translate-y-1 shadow-xl text-lg"
            >
                Acceder al Canal Gratuito <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default GuidePillar;