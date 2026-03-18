import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, ChevronRight, BookOpen, ArrowRight, 
  AlertTriangle, CheckCircle, XCircle, Search, FileText, 
  Home, Calculator, Scale, Eye, AlertOctagon, FileWarning 
} from 'lucide-react';
import { ROUTES } from '../constants/routes';

const AuctionAnalysisStepByStep: React.FC = () => {
  
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  const [readTime, setReadTime] = useState(8);

  // Image: Professional analysis context
  const IMG_HERO = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200&h=630";

  useEffect(() => {
    // Read Time Calculation
    const article = document.querySelector('article');
    if (article) {
      const text = article.innerText;
      const words = text.trim().split(/\s+/).length;
      const time = Math.ceil(words / 200);
      setReadTime(Math.max(5, time));
    }

    // SEO Optimization
    document.title = "Cómo Analizar una Subasta Judicial antes de Pujar | Guía Técnica 2025";
    
    // Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', "Guía técnica para analizar subastas del BOE. Aprende a leer la certificación de cargas, detectar ocupantes y calcular tu puja máxima segura.");
    } else {
        const newMeta = document.createElement('meta');
        newMeta.name = "description";
        newMeta.content = "Guía técnica para analizar subastas del BOE. Aprende a leer la certificación de cargas, detectar ocupantes y calcular tu puja máxima segura.";
        document.head.appendChild(newMeta);
    }

    // Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', "https://activosoffmarket.es/como-analizar-subasta-judicial-antes-de-pujar");

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

    setMeta('og:title', "Cómo Analizar una Subasta Judicial antes de Pujar | Guía Técnica");
    setMeta('og:description', "No pujes a ciegas. Descubre el protocolo de análisis jurídico y financiero para invertir en subastas del BOE sin riesgos.");
    setMeta('og:type', "article");
    setMeta('og:url', "https://activosoffmarket.es/como-analizar-subasta-judicial-antes-de-pujar");
    setMeta('og:image', IMG_HERO);

    // Schema.org
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "Cómo analizar una subasta judicial paso a paso",
        "description": "Protocolo de análisis jurídico y económico para participar en subastas del BOE con seguridad.",
        "image": {
            "@type": "ImageObject",
            "url": IMG_HERO
        },
        "step": [
            {
                "@type": "HowToStep",
                "name": "Lectura del Edicto",
                "text": "Identificar el tipo de subasta, la deuda reclamada y el valor de tasación."
            },
            {
                "@type": "HowToStep",
                "name": "Análisis de Cargas",
                "text": "Solicitar la Certificación de Cargas para verificar hipotecas anteriores y embargos preferentes."
            },
            {
                "@type": "HowToStep",
                "name": "Verificación Posesoria",
                "text": "Investigar si el inmueble está ocupado y el título jurídico de los ocupantes."
            },
            {
                "@type": "HowToStep",
                "name": "Cálculo de Puja Máxima",
                "text": "Aplicar la fórmula de descuento incluyendo ITP, reformas y margen de beneficio."
            }
        ],
        "author": {
            "@type": "Person",
            "name": "José de la Peña",
            "jobTitle": "Jurista Experto en Subastas"
        }
    };

    const script = document.createElement('script');
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
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
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Análisis Paso a Paso</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Cómo Analizar una <span className="text-brand-700 italic">Subasta Judicial</span> <br/>Antes de Pujar
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-serif font-bold border border-brand-200">
                      J
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-none">José de la Peña</span>
                        <span className="text-xs text-brand-600 mt-1 font-semibold uppercase">Jurista Experto</span>
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
                        alt="Análisis de expedientes judiciales y subastas BOE"
                        width="1200"
                        height="630"
                        loading="eager"
                        className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                    />
                </figure>

                <p className="text-xl text-slate-700 leading-relaxed font-light mb-10 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                    El 90% de los errores en <Link to={ROUTES.GUIDE_PILLAR} className="text-brand-700 underline decoration-1 underline-offset-2 hover:text-brand-900">subastas judiciales</Link> se cometen antes de hacer la transferencia del depósito. Pujar es fácil; lo difícil es saber <strong>qué estás comprando realmente</strong>. Un expediente mal analizado puede convertir una oportunidad en una deuda vitalicia.
                </p>

                <div className="bg-brand-50 p-6 border-l-4 border-brand-600 rounded-r-xl shadow-sm my-10 not-prose flex items-start gap-4">
                    <Search size={24} className="text-brand-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-brand-900 text-lg mb-1">La Regla de Oro</h3>
                        <p className="text-brand-800 text-sm leading-relaxed m-0">
                            Nunca te fíes solo de la información del portal del BOE. El portal es un mero tablón de anuncios; la verdad jurídica está en el Juzgado y en el Registro de la Propiedad.
                        </p>
                    </div>
                </div>

                <h2 className="text-3xl mt-12 mb-8">El Protocolo de Análisis en 5 Pasos</h2>
                <p>
                    Antes de plantearte siquiera participar, debes someter el activo a este filtro riguroso. Si falla en alguno de los puntos, descártalo inmediatamente.
                </p>

                {/* Diagrama Visual del Proceso */}
                <div className="not-prose my-10 space-y-4">
                    {[
                        { step: "01", title: "Lectura del Edicto", icon: FileText, desc: "Identificar juzgado, procedimiento y tipo de subasta." },
                        { step: "02", title: "Certificación de Cargas", icon: FileWarning, desc: "La clave de todo. ¿Qué deudas sobreviven?" },
                        { step: "03", title: "Situación Posesoria", icon: Home, desc: "¿Quién vive ahí y con qué derecho?" },
                        { step: "04", title: "Valoración de Mercado", icon: Eye, desc: "Visita exterior y comparables reales." },
                        { step: "05", title: "Cálculo de Puja", icon: Calculator, desc: "Definir tu límite máximo infranqueable." }
                    ].map((item, index) => (
                        <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-brand-200 transition-colors">
                            <div className="absolute -left-2 top-0 bottom-0 w-1 bg-brand-600"></div>
                            <div className="text-3xl font-bold text-slate-100 absolute right-4 top-2 select-none group-hover:text-brand-50 transition-colors">{item.step}</div>
                            <div className="bg-brand-50 p-3 rounded-full text-brand-700 relative z-10">
                                <item.icon size={24} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                                <p className="text-slate-500 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 className="text-3xl mt-12 mb-6">1. Cómo leer el anuncio del BOE</h2>
                <p>
                    El anuncio contiene datos básicos, pero a veces engañosos. Fíjate especialmente en:
                </p>
                <ul>
                    <li><strong>Valor de Subasta:</strong> No es el valor de mercado. Es la tasación a efectos legales (a veces de hace 15 años).</li>
                    <li><strong>Cantidad Reclamada:</strong> Es la deuda por la que se ejecuta. Importante para saber si tu puja cubrirá la deuda (firmeza inmediata).</li>
                    <li><strong>Lotes:</strong> Verifica si se subasta el 100% del pleno dominio o solo una parte indivisa (50%, nuda propiedad, usufructo). <strong>Si no es el 100% del pleno dominio, huye si eres novato.</strong></li>
                </ul>

                <h2 className="text-3xl mt-12 mb-6">2. La Certificación de Cargas (Vital)</h2>
                <p>
                    Es el documento más importante. En él verás la "cola" de acreedores. Recuerda la regla de oro de las <Link to={ROUTES.CHARGES} className="text-brand-700 underline hover:text-brand-900">cargas en subasta</Link>:
                </p>
                <div className="bg-slate-900 text-slate-200 p-6 rounded-xl not-prose my-6 font-mono text-sm border-l-4 border-brand-500">
                    <p className="mb-2"><span className="text-green-400">✓</span> Cargas POSTERIORES a la ejecución: <strong>SE BORRAN</strong>.</p>
                    <p><span className="text-red-400">✗</span> Cargas ANTERIORES a la ejecución: <strong>TE LAS COMES</strong>.</p>
                </div>
                <p>
                    Debes sumar todas las cargas anteriores (hipotecas previas, embargos antiguos) al precio que piensas pagar. Esa es tu "mochila" de deuda oculta.
                </p>

                <h2 className="text-3xl mt-12 mb-6">3. Riesgo de Ocupación</h2>
                <p>
                    El juzgado subasta la propiedad, pero la posesión es otra historia. Si hay ocupantes, el proceso se alarga.
                </p>
                <div className="overflow-x-auto my-8 not-prose rounded-xl border border-slate-200 shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Ocupante</th>
                                <th className="px-6 py-4">Riesgo</th>
                                <th className="px-6 py-4">Solución</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            <tr>
                                <td className="px-6 py-4 font-medium">Ejecutado (Deudor)</td>
                                <td className="px-6 py-4 text-green-600 font-bold">Bajo</td>
                                <td className="px-6 py-4">Lanzamiento judicial (3-6 meses).</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-medium">Inquilino (Contrato)</td>
                                <td className="px-6 py-4 text-amber-600 font-bold">Medio</td>
                                <td className="px-6 py-4">Si el contrato es anterior y legal, se respeta hasta su fin.</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-medium">Okupa (Sin título)</td>
                                <td className="px-6 py-4 text-red-600 font-bold">Alto</td>
                                <td className="px-6 py-4">Procedimiento de desahucio (puede tardar +1 año).</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2 className="text-3xl mt-12 mb-6">4. Cálculo del Precio Máximo (La Fórmula)</h2>
                <p>
                    Nunca empieces a pujar sin tener este número escrito en un papel. Es tu límite de seguridad. Si la subasta lo supera, te retiras.
                </p>

                <div className="bg-white p-8 rounded-3xl border-2 border-slate-900 shadow-xl my-10 not-prose relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-slate-100 px-4 py-2 rounded-bl-xl text-xs font-bold uppercase tracking-widest text-slate-500">Fórmula Maestra</div>
                    
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="text-slate-500 font-bold text-sm w-32">VALOR REAL</span>
                            <div className="flex-1 bg-green-50 p-3 rounded-lg border border-green-200 font-mono font-bold text-green-800">
                                Valor de Mercado Conservador (Reformado)
                            </div>
                        </div>
                        
                        <div className="flex justify-center text-slate-400"><ArrowRight className="rotate-90 md:rotate-0" /></div>

                        <div className="space-y-2 pl-4 md:pl-32 border-l-2 border-slate-200 md:border-l-0">
                            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                                <span>-</span> Gastos de Reforma Integral
                            </div>
                            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                                <span>-</span> ITP (6% - 10%) + Notaría + Registro
                            </div>
                            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                                <span>-</span> Cargas Anteriores (La Mochila)
                            </div>
                            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                                <span>-</span> Deudas Comunidad e IBI (4 años)
                            </div>
                            <div className="flex items-center gap-2 text-brand-600 font-bold text-sm">
                                <span>-</span> TU MARGEN DE BENEFICIO (Mín. 20%)
                            </div>
                        </div>

                        <div className="border-t-2 border-slate-900 pt-4 mt-4 flex flex-col md:flex-row md:items-center gap-4">
                            <span className="text-slate-900 font-black text-xl w-32">PUJA MÁXIMA</span>
                            <div className="flex-1 bg-slate-900 text-white p-4 rounded-xl font-mono text-xl font-bold text-center shadow-lg">
                                = TU LÍMITE INFRANQUEABLE
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl mt-12 mb-6">Cuándo NO pujar (Red Flags)</h2>
                <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                    <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                        <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2"><AlertOctagon size={18}/> Derecho de Uso</h3>
                        <p className="text-red-700 text-sm">Si hay un derecho de uso atribuido a un cónyuge e hijos en divorcio, no podrás echarles hasta que los hijos sean independientes. Inversión bloqueada años.</p>
                    </div>
                    <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                        <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2"><AlertOctagon size={18}/> Usufructo</h3>
                        <p className="text-red-700 text-sm">Si se subasta la "Nuda Propiedad", el usufructuario tiene derecho a vivir ahí hasta que fallezca. No tendrás llaves ni rentas.</p>
                    </div>
                </div>

                <h2 className="text-3xl mt-12 mb-6">Resumen del Caso Práctico</h2>
                <p>
                    Analizar bien significa esto: Un piso en Madrid tasado en 300.000€. Parece un chollo salir a pujar por 150.000€.
                </p>
                <p>
                    Pero al pedir la nota simple, ves una hipoteca anterior de 80.000€. Y al visitar la finca, el portero te dice que vive un inquilino con contrato de renta antigua.
                </p>
                <p>
                    <strong>Análisis:</strong> 150k (puja) + 80k (carga anterior) = 230k. Con inquilino de renta antigua, el valor de mercado cae a 180k. <strong>Resultado: Perderías 50.000€ si pujas.</strong>
                </p>
                <p>
                    Por eso es vital el análisis previo. Recuerda siempre tener listo tu <Link to={ROUTES.DEPOSIT} className="text-brand-700 underline hover:text-brand-900">depósito del 5%</Link> solo cuando estés 100% seguro.
                </p>

                <hr className="my-16 border-slate-200" />

                {/* FAQ */}
                <section className="not-prose bg-slate-50 p-10 rounded-3xl border border-slate-200">
                    <h2 className="font-serif text-2xl font-bold text-slate-900 mb-8">Preguntas Frecuentes</h2>
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Cómo sé si hay ocupantes?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">El edicto a veces lo dice, pero no es fiable. Lo mejor es visitar la finca, hablar con conserjes, vecinos o ver si hay luz/movimiento. Nunca entres en la vivienda ni acoses.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Dónde consigo la Certificación de Cargas?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">En el portal del BOE suele estar adjunta en PDF. Si no, debes pedir una Nota Simple o Certificación al Registro de la Propiedad (cuesta unos 10-30€).</p>
                        </div>
                    </div>
                </section>
                
            </article>
        </main>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-10 max-h-[calc(100vh-120px)] overflow-auto pr-2 custom-scrollbar">
            {/* CTA Premium */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 block">Ahorra tiempo y riesgos</span>
                <h3 className="font-serif text-2xl font-bold mb-4">Análisis Profesional Incluido</h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    En el canal Premium no solo te damos la oportunidad, te damos el análisis de cargas y valoración hecho por expertos.
                </p>
                <a 
                    href="https://sublaunch.com/activosoffmarket" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-brand-600 text-white font-bold py-4 px-4 rounded-xl text-center hover:bg-brand-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-900/50"
                >
                    Ver Canal Premium <ArrowRight size={16}/>
                </a>
            </div>

            {/* CTA Consultoría */}
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                <div className="bg-brand-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-brand-700">
                    <Scale size={24} />
                </div>
                <h4 className="font-bold text-slate-900 mb-2 text-lg">
                    ¿Dudas con un expediente?
                </h4>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    Si ya has visto una subasta pero no sabes interpretar las cargas, revisémoslo juntos antes de que pongas tu dinero.
                </p>
                <a 
                    href="https://calendly.com/activosoffmarket/consultoria" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full border-2 border-slate-900 text-slate-900 font-bold py-3 px-4 rounded-xl text-center hover:bg-slate-900 hover:text-white transition-all text-sm"
                >
                    Reservar Consultoría
                </a>
            </div>

            {/* Related Links */}
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <BookOpen size={18} className="text-brand-600"/>
                    Artículos Relacionados
                </h4>
                <nav className="space-y-4">
                    <Link to={ROUTES.RULE_70} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Regla del 70%</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.CHARGES} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cargas y Deudas</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.DEPOSIT} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Depósito del 5%</span>
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

export default AuctionAnalysisStepByStep;
