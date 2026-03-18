import React, { useEffect } from 'react';
import { Calendar, ChevronRight, BookOpen, Search, Gavel, FileText, Scale, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const AuctionGlossary: React.FC = () => {
  
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();

  // Imagen Hero: Biblioteca / Conocimiento
  const IMG_HERO = "https://images.unsplash.com/photo-1507842217121-9e9628376f72?auto=format&fit=crop&q=80&w=1200&h=630";

  useEffect(() => {
    // SEO
    document.title = "Glosario de Subastas Judiciales (BOE) | Definiciones Clave 2025";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', "Consulta el glosario completo de subastas judiciales en España: términos clave explicados de forma clara y profesional.");
    }
    window.scrollTo(0, 0);

    // Schema.org
    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "DefinedTermSet",
          "name": "Glosario de Subastas Judiciales",
          "description": "Definiciones técnicas de términos relacionados con subastas públicas y judiciales en España.",
          "inDefinedTermSet": "https://activosoffmarket.es/glosario-subastas-judiciales"
        },
        {
          "@type": "Article",
          "headline": "Glosario de Subastas Judiciales: Términos Clave",
          "description": "Definiciones técnicas de términos relacionados con subastas públicas y judiciales en España.",
          "image": ["https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1200&h=630"],
          "datePublished": "2024-01-15T09:00:00+01:00",
          "dateModified": schemaDate,
          "author": {
            "@type": "Person",
            "name": "José de la Peña",
            "url": "https://activosoffmarket.es/quien-soy"
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://activosoffmarket.es/glosario-subastas"
          }
        }
      ]
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
      
      {/* HEADER */}
      <header className="bg-white pb-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
            <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium flex-wrap gap-2" aria-label="Breadcrumb">
                <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
                <ChevronRight size={14} />
                <Link to={ROUTES.GUIDE_PILLAR} className="hover:text-brand-600 transition-colors">Guía Subastas</Link>
                <ChevronRight size={14} />
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Glosario</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Glosario Completo de <br/>
                <span className="text-brand-700 italic">Subastas Judiciales (BOE)</span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                    <img src="/jose-de-la-pena-subastas-boe.jpg" alt="José de la Peña" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md" />
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
                    <BookOpen size={14} />
                    <span>Diccionario Técnico</span>
                </div>
            </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* MAIN CONTENT */}
        <main className="lg:col-span-8">
            <article className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-loose">
                
                <figure className="mb-12 -mt-6">
                    <img 
                        src={IMG_HERO} 
                        alt="Diccionario jurídico de subastas BOE"
                        width="1200"
                        height="630"
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                    />
                </figure>

                <p className="text-xl text-slate-700 leading-relaxed font-light mb-10 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                    El lenguaje jurídico de las subastas puede ser una barrera de entrada formidable. Términos arcaicos como "remate", "postura" o "lanzamiento" esconden realidades económicas que afectan directamente a tu bolsillo. Este glosario no es académico; es una herramienta práctica para que entiendas qué estás leyendo en el BOE.
                </p>

                {/* TÉRMINOS */}
                
                <div className="space-y-12">

                    {/* 1. Adjudicación */}
                    <section id="adjudicacion" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6 flex items-center gap-3">
                            <Gavel className="text-brand-600" size={28}/> Adjudicación
                        </h2>
                        <p>
                            Es el acto procesal mediante el cual la autoridad gestora de la subasta (el Letrado de la Administración de Justicia en el caso de las <Link to={ROUTES.GUIDE_PILLAR} className="text-brand-700 font-bold hover:underline">subastas judiciales</Link>) atribuye la propiedad del bien subastado al mejor postor. Sin embargo, ganar la puja no implica una adjudicación automática inmediata. 
                        </p>
                        <p>
                            Para que la adjudicación sea firme, debe dictarse el "Decreto de Adjudicación", documento que actúa como título de propiedad y que permite la inscripción en el Registro. Hasta que no tienes este documento, técnicamente no eres el propietario legal, aunque hayas ganado la subasta.
                        </p>
                    </section>

                    {/* 2. Cesión de remate */}
                    <section id="cesion-de-remate" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6 flex items-center gap-3">
                            <ArrowRight className="text-brand-600" size={28}/> Cesión de remate
                        </h2>
                        <p>
                            Facultad que permite al adjudicatario provisional (quien ha ganado la subasta) transmitir su derecho a un tercero antes de que la adjudicación sea definitiva y se inscriba. Es una figura estratégica que permite, por ejemplo, que un inversor ceda la propiedad a un cliente final sin tener que escriturar dos veces, ahorrando así costes fiscales (doble ITP).
                        </p>
                        <p>
                            No obstante, esta figura tiene plazos muy estrictos y requiere comparecencia en el juzgado. Si te interesa esta mecánica, revisa nuestra guía detallada sobre <Link to={ROUTES.ASSIGNMENT} className="text-brand-700 font-bold hover:underline">cesión de remate</Link>.
                        </p>
                    </section>

                    {/* 3. Tipo de subasta */}
                    <section id="tipo-de-subasta" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6 flex items-center gap-3">
                            <Scale className="text-brand-600" size={28}/> Tipo de subasta
                        </h2>
                        <p>
                            Es la cifra económica que sirve como base para calcular los porcentajes de adjudicación. Normalmente coincide con el valor de tasación a efectos de subasta fijado en la escritura de hipoteca original. Es un valor técnico, a menudo desactualizado respecto al mercado real.
                        </p>
                        <p>
                            Su importancia radica en que define los tramos legales para la aprobación del remate. Por ejemplo, si tu puja supera el 70% del "Tipo de Subasta", la adjudicación es automática. Si no, entras en un proceso de validación provisional. Entiende cómo funciona en la <Link to={ROUTES.RULE_70} className="text-brand-700 font-bold hover:underline">regla del 70% en subastas judiciales</Link>.
                        </p>
                    </section>

                    {/* 4. Mejor postura */}
                    <section id="mejor-postura" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6">
                            Mejor postura
                        </h2>
                        <p>
                            Es la oferta económica más alta recibida y válida en el momento del cierre de la subasta. En el Portal del BOE, las posturas son anónimas y se actualizan en tiempo real. 
                        </p>
                        <p>
                            Al finalizar el periodo de licitación, la mejor postura se convierte en la oferta ganadora provisional. Si esta oferta no cumple con los mínimos legales (por ejemplo, es inferior al 50% del tipo), el juzgado puede decidir no aprobarla si la considera insuficiente ("quiebra por precio irrisorio"), aunque esto es subjetivo y depende del criterio del LAJ.
                        </p>
                    </section>

                    {/* 5. Postor */}
                    <section id="postor" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6">
                            Postor
                        </h2>
                        <p>
                            Persona física o jurídica que participa activamente en una subasta realizando ofertas. Para adquirir la condición de postor en el sistema español, es obligatorio identificarse mediante certificado digital reconocido y haber constituido el depósito previo exigido por la ley.
                        </p>
                        <p>
                            El ejecutante (normalmente el banco acreedor) también puede actuar como postor, con la ventaja de que no necesita consignar depósito, ya que participa con la deuda que se le debe ("a cuenta de la deuda").
                        </p>
                    </section>

                    {/* 6. Depósito del 5% */}
                    <section id="deposito" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6">
                            Depósito del 5%
                        </h2>
                        <p>
                            Es la fianza obligatoria que cualquier interesado debe consignar telemáticamente a través del Portal de Subastas del BOE para poder pujar. Su cuantía corresponde exactamente al 5% del Valor de Tasación (Tipo de Subasta) del bien.
                        </p>
                        <p>
                            Este dinero queda bloqueado por la AEAT hasta que finaliza la subasta. Si no ganas, se te devuelve automáticamente (salvo que reserves postura). Si ganas y no pagas el resto, pierdes este dinero. Lee más sobre los riesgos del <Link to={ROUTES.DEPOSIT} className="text-brand-700 font-bold hover:underline">depósito del 5%</Link>.
                        </p>
                    </section>

                    {/* 7. Subasta sin pujas (Desierta) */}
                    <section id="subasta-desierta" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6">
                            Subasta sin pujas
                        </h2>
                        <p>
                            Situación que ocurre cuando finaliza el plazo de 20 días y nadie ha realizado ninguna oferta válida. En este escenario, la subasta se declara "desierta".
                        </p>
                        <p>
                            Cuando esto ocurre, el acreedor (el banco) tiene un plazo privilegiado para solicitar la adjudicación del bien por un porcentaje fijo de la deuda (normalmente el 50% en vivienda habitual o el 70% en otros casos). Es el mecanismo por el cual los bancos se quedan con los pisos que nadie quiso comprar en primera instancia.
                        </p>
                    </section>

                    {/* 8. Cargas registrales */}
                    <section id="cargas-registrales" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6 flex items-center gap-3">
                            <FileText className="text-brand-600" size={28}/> Cargas registrales
                        </h2>
                        <p>
                            Son las deudas, embargos o hipotecas que gravan un inmueble y que constan inscritas en el Registro de la Propiedad. En una subasta judicial, es crítico distinguir entre cargas anteriores y posteriores.
                        </p>
                        <p>
                            Las cargas posteriores a la que se ejecuta se borran (purga). Las cargas anteriores (hipotecas previas) <strong>subsisten</strong> y el adjudicatario debe asumirlas como propias. No analizar esto es el error número uno.
                        </p>
                    </section>

                    {/* 9. Nota simple */}
                    <section id="nota-simple" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6">
                            Nota simple
                        </h2>
                        <p>
                            Documento informativo emitido por el Registro de la Propiedad que resume la situación jurídica de un inmueble: quién es el titular actual, la descripción física y, lo más importante, las cargas vigentes.
                        </p>
                        <p>
                            Para <Link to={ROUTES.ANALYSIS} className="text-brand-700 font-bold hover:underline">analizar una subasta correctamente</Link>, la Nota Simple es insuficiente; necesitas la "Certificación de Cargas" que emite el registrador para el procedimiento, ya que es el documento que tiene valor legal en la ejecución.
                        </p>
                    </section>

                    {/* 10. Inscripción registral */}
                    <section id="inscripcion-registral" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6">
                            Inscripción registral
                        </h2>
                        <p>
                            Es el paso final del proceso de inversión. Consiste en llevar el Decreto de Adjudicación (ya liquidado de impuestos) al Registro de la Propiedad para cambiar la titularidad del inmueble a tu nombre.
                        </p>
                        <p>
                            Solo con la inscripción registral quedas plenamente protegido frente a terceros (fe pública registral). Además, es el momento en el que el Registrador procede a cancelar (tachar) las cargas posteriores que ordenó borrar el juzgado.
                        </p>
                    </section>

                    {/* 11. Lote */}
                    <section id="lote" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6">
                            Lote
                        </h2>
                        <p>
                            A veces, una subasta no es de un solo bien, sino que se divide en varios "lotes" independientes (por ejemplo, un piso y un garaje subastados por separado dentro del mismo expediente).
                        </p>
                        <p>
                            Cada lote tiene su propio Tipo de Subasta y requiere su propio depósito independiente. Puedes pujar por un lote y no por otro. Es importante verificar si los lotes son divisibles o si se subastan en conjunto ("lote único").
                        </p>
                    </section>

                    {/* 12. Portal de subastas del BOE */}
                    <section id="portal-boe" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6">
                            Portal de subastas del BOE
                        </h2>
                        <p>
                            Plataforma oficial del Estado (subastas.boe.es) donde, desde 2015, se publican y gestionan obligatoriamente todas las subastas judiciales y administrativas de España. Es el único lugar legítimo para realizar pujas.
                        </p>
                        <p>
                            Actúa como intermediario tecnológico: gestiona los depósitos, garantiza el anonimato de los postores y certifica la hora exacta de las pujas. Consulta más en nuestra sección de <Link to={ROUTES.SUBASTAS_BOE} className="text-brand-700 font-bold hover:underline">Subastas BOE</Link>.
                        </p>
                    </section>

                    {/* 13. Valor de tasación */}
                    <section id="valor-tasacion" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6">
                            Valor de tasación
                        </h2>
                        <p>
                            Es el valor oficial asignado al bien para el procedimiento de subasta. No debe confundirse con el valor de mercado actual. A menudo, este valor proviene de una tasación antigua (de la época de la concesión de la hipoteca) y puede ser muy superior al precio real de venta.
                        </p>
                        <p>
                            Nunca tomes decisiones de inversión basadas en este valor; úsalo solo como referencia para calcular el depósito y los umbrales legales de adjudicación.
                        </p>
                    </section>

                    {/* 14. Precio de salida */}
                    <section id="precio-salida" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6">
                            Precio de salida
                        </h2>
                        <p>
                            En las subastas judiciales actuales, <strong>no existe precio de salida mínimo</strong>. Se puede pujar teóricamente desde 1 euro. Sin embargo, el sistema sí establece "tramos" mínimos entre pujas para evitar incrementos ridículos (ej. subir de 1 en 1 céntimo).
                        </p>
                        <p>
                            Aunque no haya precio de salida, las pujas muy bajas corren el riesgo de no ser aprobadas por el juzgado o de que el acreedor ejerza su derecho de mejora.
                        </p>
                    </section>

                    {/* 15. Mandamiento judicial */}
                    <section id="mandamiento-judicial" className="scroll-mt-32">
                        <h2 className="text-3xl text-brand-800 border-b border-brand-100 pb-4 mb-6">
                            Mandamiento judicial
                        </h2>
                        <p>
                            Es una orden escrita emitida por el juez o el LAJ dirigida a otro funcionario o entidad pública. En el contexto de subastas, el más importante es el "Mandamiento de Cancelación de Cargas".
                        </p>
                        <p>
                            Este documento ordena al Registrador de la Propiedad que borre todas las hipotecas y embargos posteriores a la carga ejecutada, entregando el inmueble "limpio" al nuevo propietario. Sin este papel, no podrás limpiar el historial de la casa.
                        </p>
                    </section>

                </div>

                <hr className="my-16 border-slate-200" />

                <div className="bg-brand-50 p-8 rounded-2xl border border-brand-100 text-center not-prose">
                    <h3 className="font-serif text-2xl font-bold text-slate-900 mb-4">¿Te quedan dudas con algún término?</h3>
                    <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                        En el canal Premium explico estos conceptos aplicados a casos reales cada semana.
                    </p>
                    <a 
                        href="https://t.me/activosoffmarket"
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-brand-700 text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-800 transition-colors shadow-lg"
                    >
                        <Search size={20} /> Resolver dudas en Telegram
                    </a>
                </div>

            </article>
        </main>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-10 max-h-[calc(100vh-120px)] overflow-auto pr-2 custom-scrollbar">
            
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 block flex items-center gap-2">
                    <ShieldCheck size={14} /> Diccionario en Práctica
                </span>
                <h3 className="font-serif text-2xl font-bold mb-4 leading-tight">
                    La teoría está bien, la práctica es rentable
                </h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    Aplicar bien estos conceptos es lo que separa una mala compra de una inversión del 40% de rentabilidad.
                </p>
                <a 
                    href="https://t.me/activosoffmarket" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-white text-slate-900 font-bold py-4 px-4 rounded-xl text-center hover:bg-brand-50 transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2 group"
                >
                    Ver Ejemplos Reales <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                </a>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <BookOpen size={18} className="text-brand-600"/>
                    Guías Recomendadas
                </h4>
                <nav className="space-y-4">
                    <Link to={ROUTES.ANALYSIS} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Análisis Paso a Paso</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.GUIDE_PILLAR} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Guía General Subastas</span>
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

export default AuctionGlossary;