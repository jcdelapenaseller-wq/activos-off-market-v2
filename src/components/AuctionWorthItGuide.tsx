import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, ChevronRight, Gavel, ArrowRight, BookOpen, 
  AlertTriangle, CheckCircle, XCircle, TrendingUp, Download, 
  ShieldCheck, DollarSign, Scale 
} from 'lucide-react';

const AuctionWorthItGuide: React.FC = () => {
  
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  // State for read time
  const [readTime, setReadTime] = useState(5);

  // Images
  const IMG_HERO = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200&h=630";

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
    document.title = "¿Merecen la pena las subastas del BOE? Rentabilidad y Riesgos Reales";
    
    // Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', "Análisis honesto sobre la rentabilidad real de las subastas judiciales en España. Desmontamos mitos, analizamos riesgos y comparamos con el mercado libre.");
    } else {
        const newMeta = document.createElement('meta');
        newMeta.name = "description";
        newMeta.content = "Análisis honesto sobre la rentabilidad real de las subastas judiciales en España. Desmontamos mitos, analizamos riesgos y comparamos con el mercado libre.";
        document.head.appendChild(newMeta);
    }

    // Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', "https://activosoffmarket.es/merecen-pena-subastas-boe");

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

    setMeta('og:title', "¿Merecen la pena las subastas del BOE? Rentabilidad y Riesgos Reales");
    setMeta('og:description', "Descubre si realmente es rentable invertir en subastas judiciales. Análisis de costes ocultos, tiempos y márgenes reales.");
    setMeta('og:type', "article");
    setMeta('og:url', "https://activosoffmarket.es/merecen-pena-subastas-boe");
    setMeta('og:image', IMG_HERO);

    // Schema.org
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "¿Merecen la pena las subastas del BOE? Rentabilidad y Riesgos Reales",
        "image": [IMG_HERO],
        "datePublished": "2024-01-15T08:00:00+01:00",
        "dateModified": schemaDate,
        "author": {
            "@type": "Person",
            "name": "José de la Peña",
            "jobTitle": "Jurista Experto en Subastas",
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
        "description": "Análisis honesto sobre la rentabilidad real de las subastas judiciales en España. Desmontamos mitos, analizamos riesgos y comparamos con el mercado libre.",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://activosoffmarket.es/merecen-pena-subastas-boe"
        }
    };

    const script = document.createElement('script');
    script.type = "application/ld+json";
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
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">¿Merecen la pena?</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                ¿Merecen la pena las <span className="text-brand-700 italic">Subastas del BOE</span>? <br/>La Verdad sobre la Rentabilidad
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
                        alt="Análisis de rentabilidad en subastas inmobiliarias"
                        width="1200"
                        height="630"
                        loading="eager"
                        className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                    />
                </figure>

                <p className="text-xl text-slate-700 leading-relaxed font-light mb-10 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                    La respuesta corta es <strong>SÍ</strong>, pero no como te lo han contado en YouTube. Las <Link to="/subastas-judiciales-espana" className="text-brand-700 underline decoration-1 underline-offset-2 hover:text-brand-900">subastas judiciales</Link> no son un supermercado de chollos donde compras pisos al 50% sin esfuerzo. Son un mercado técnico, complejo y lleno de aristas legales donde la rentabilidad se consigue gestionando el riesgo, no evitándolo.
                </p>

                <div className="bg-brand-50 p-6 border-l-4 border-brand-600 rounded-r-xl shadow-sm my-10 not-prose flex items-start gap-4">
                    <ShieldCheck size={24} className="text-brand-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-brand-900 text-lg mb-1">Criterio de Autoridad</h3>
                        <p className="text-brand-800 text-sm leading-relaxed m-0">
                            Como jurista, he visto a inversores novatos perder su depósito por no entender las cargas registrales. La rentabilidad real existe, pero exige profesionalidad y análisis previo.
                        </p>
                    </div>
                </div>

                <h2 className="text-3xl mt-12 mb-6">Subasta vs. Mercado Libre: La Comparativa Real</h2>
                <p>
                    Para entender si merecen la pena, debemos comparar manzanas con manzanas. Aquí tienes la realidad de los números frente a una compra tradicional:
                </p>

                <div className="overflow-x-auto my-8 not-prose rounded-xl border border-slate-200 shadow-sm">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-xs">
                          <tr>
                              <th className="px-6 py-4">Factor</th>
                              <th className="px-6 py-4 bg-brand-50 text-brand-900">Subasta BOE</th>
                              <th className="px-6 py-4">Mercado Libre</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                          <tr>
                              <td className="px-6 py-4 font-medium">Precio de Adquisición</td>
                              <td className="px-6 py-4 text-green-600 font-bold">-20% a -40%</td>
                              <td className="px-6 py-4 text-slate-500">Precio Mercado</td>
                          </tr>
                          <tr>
                              <td className="px-6 py-4 font-medium">Estado Físico</td>
                              <td className="px-6 py-4 text-amber-600">Incógnita (Sin visita)</td>
                              <td className="px-6 py-4 text-green-600">Visitable</td>
                          </tr>
                          <tr>
                              <td className="px-6 py-4 font-medium">Cargas y Deudas</td>
                              <td className="px-6 py-4 text-red-600">Complejo (Requiere análisis)</td>
                              <td className="px-6 py-4 text-green-600">Se entrega libre</td>
                          </tr>
                          <tr>
                              <td className="px-6 py-4 font-medium">Financiación</td>
                              <td className="px-6 py-4 text-red-600">Difícil (Capital propio)</td>
                              <td className="px-6 py-4 text-green-600">Hipoteca fácil</td>
                          </tr>
                          <tr>
                              <td className="px-6 py-4 font-medium">Posesión (Llaves)</td>
                              <td className="px-6 py-4 text-amber-600">4 a 12 meses</td>
                              <td className="px-6 py-4 text-green-600">Inmediata (Notaría)</td>
                          </tr>
                      </tbody>
                  </table>
                </div>

                <h2 className="text-3xl mt-12 mb-6">Los 3 Riesgos que Destruyen la Rentabilidad</h2>
                <p>
                    Si decides entrar, debes saber que el margen de beneficio está directamente relacionado con tu capacidad para resolver estos problemas:
                </p>

                <div className="grid gap-6 my-8 not-prose">
                    <div className="flex gap-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-red-100 p-3 h-fit rounded-lg text-red-600"><AlertTriangle size={24} /></div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">1. Cargas Anteriores Ocultas</h3>
                            <p className="text-slate-600 text-sm mt-2">
                                En subasta, tú asumes las deudas anteriores a la hipoteca que se ejecuta. Si no sabes leer una Certificación de Cargas, puedes comprar una casa con una "mochila" de 50.000€. Revisa siempre nuestra guía sobre <Link to="/cargas-subasta-judicial" className="text-brand-600 hover:underline font-medium">cargas en subasta</Link>.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-amber-100 p-3 h-fit rounded-lg text-amber-600"><Gavel size={24} /></div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">2. Ocupación Ilegal o Precaria</h3>
                            <p className="text-slate-600 text-sm mt-2">
                                El juzgado te da la propiedad, pero no siempre la posesión inmediata. Si hay ocupantes, tendrás que iniciar un lanzamiento. Esto cuesta tiempo (dinero) y abogados.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-slate-100 p-3 h-fit rounded-lg text-slate-600"><DollarSign size={24} /></div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">3. Error en el Depósito</h3>
                            <p className="text-slate-600 text-sm mt-2">
                                Para participar necesitas consignar el 5%. Si te equivocas en la puja o te retiras, puedes perderlo. Consulta la guía sobre el <Link to="/deposito-subasta-judicial-5-por-ciento" className="text-brand-600 hover:underline font-medium">depósito del 5%</Link> para evitar desastres.
                            </p>
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl mt-12 mb-6">Rentabilidad Real: Números sobre la mesa</h2>
                <p>
                    Olvídate de comprar por 10.000€ un piso que vale 200.000€. Eso no existe. Una operación "buena" en 2024 se ve así:
                </p>

                <div className="bg-slate-900 text-white p-8 rounded-3xl my-8 not-prose shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600 rounded-full blur-3xl opacity-10 -mr-20 -mt-20"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div>
                            <h3 className="font-serif text-2xl font-bold text-brand-200 mb-4">Ejemplo de Éxito</h3>
                            <ul className="space-y-3 text-sm text-slate-300">
                                <li className="flex justify-between border-b border-slate-700 pb-2">
                                    <span>Valor de Mercado:</span>
                                    <span className="font-bold text-white">200.000 €</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-700 pb-2">
                                    <span>Puja Ganadora (60%):</span>
                                    <span className="font-bold text-white">120.000 €</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-700 pb-2">
                                    <span>ITP + Gastos (12%):</span>
                                    <span className="font-bold text-white">14.400 €</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-700 pb-2">
                                    <span>Reformas + Desalojo:</span>
                                    <span className="font-bold text-white">25.000 €</span>
                                </li>
                                <li className="flex justify-between pt-2">
                                    <span className="text-brand-400 font-bold">COSTE TOTAL:</span>
                                    <span className="font-bold text-brand-400 text-lg">159.400 €</span>
                                </li>
                            </ul>
                        </div>
                        <div className="flex flex-col justify-center items-center bg-white/5 rounded-2xl p-6 border border-white/10">
                            <TrendingUp size={48} className="text-green-400 mb-4" />
                            <span className="text-slate-400 text-sm uppercase tracking-widest mb-2">Margen Bruto</span>
                            <span className="text-4xl font-bold text-white mb-2">40.600 €</span>
                            <span className="text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full text-sm">+25,4% Rentabilidad</span>
                        </div>
                    </div>
                </div>

                <p>
                    ¿Merece la pena un 25% de rentabilidad? Sí, si tienes el capital y la paciencia. No, si necesitas el dinero mañana o si te da miedo la burocracia.
                </p>

                <div className="bg-green-50 p-8 rounded-2xl border border-green-100 my-12 not-prose">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-green-100 p-3 rounded-full text-green-700">
                            <Download size={24} />
                        </div>
                        <h3 className="font-bold text-green-900 text-xl">Checklist de Viabilidad</h3>
                    </div>
                    <p className="text-green-800 mb-6 text-sm">
                        Antes de pujar, verifica estos 5 puntos clave para asegurar que la subasta merece la pena:
                    </p>
                    <ul className="space-y-3">
                        {[
                            "He solicitado y leído la Certificación de Cargas completa.",
                            "He verificado si hay ocupantes y su título (alquiler, precario).",
                            "He calculado el ITP y gastos de comunidad pendientes.",
                            "He visitado la zona y el exterior del inmueble.",
                            "Tengo el 100% del capital disponible (no dependo de hipoteca)."
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-green-900 text-sm font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <h2 className="text-3xl mt-12 mb-6">Conclusión: ¿Para quién son las subastas?</h2>
                <p>
                    Las subastas del BOE merecen la pena para inversores que:
                </p>
                <ul>
                    <li>Tienen liquidez (no necesitan financiación bancaria urgente).</li>
                    <li>Tienen paciencia (pueden esperar 6-12 meses para rentabilizar).</li>
                    <li>Se asesoran correctamente o se forman en la <Link to="/regla-70-subasta-judicial" className="text-brand-700 underline hover:text-brand-900">regla del 70%</Link> y el análisis de expedientes.</li>
                </ul>

                <hr className="my-16 border-slate-200" />

                {/* FAQ */}
                <section className="not-prose bg-slate-50 p-10 rounded-3xl border border-slate-200">
                    <h2 className="font-serif text-2xl font-bold text-slate-900 mb-8">Preguntas Frecuentes</h2>
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Puedo pedir hipoteca para una subasta?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Es muy difícil. Tienes solo 20 o 40 días para pagar el resto del precio tras ganar. Los bancos tradicionales no suelen ser tan rápidos ni hipotecan bienes sin posesión.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Qué pasa si el piso tiene deudas de comunidad?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Tú, como nuevo propietario, respondes de las deudas de la comunidad del año en curso y los tres anteriores. Debes descontar este importe de tu puja máxima.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 mb-2">¿Es mejor subasta judicial o notarial?</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Las judiciales suelen ser más seguras jurídicamente, aunque más lentas. Las notariales son más ágiles pero requieren revisar muy bien el pliego de condiciones.</p>
                        </div>
                    </div>
                </section>
                
            </article>
        </main>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-10 max-h-[calc(100vh-120px)] overflow-auto pr-2 custom-scrollbar">
            {/* CTA Premium */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 block">Oportunidades Reales</span>
                <h3 className="font-serif text-2xl font-bold mb-4">No pierdas tiempo buscando</h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    Filtramos el BOE diariamente. Solo te enviamos las subastas que SÍ merecen la pena, con el análisis de cargas ya hecho.
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
                    ¿Tienes una subasta a la vista?
                </h4>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    No te la juegues. Analizamos el expediente contigo en una sesión 1:1 para confirmar si es rentable o una trampa.
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
                    Sigue Leyendo
                </h4>
                <nav className="space-y-4">
                    <Link to="/regla-70-subasta-judicial" className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Regla del 70%</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to="/cargas-subasta-judicial" className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cargas y Deudas</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to="/deposito-subasta-judicial-5-por-ciento" className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
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

export default AuctionWorthItGuide;
