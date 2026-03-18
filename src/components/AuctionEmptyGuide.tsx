import React, { useEffect } from 'react';
import { Calendar, Clock, ChevronRight, Gavel, ArrowRight, BookOpen, UserX, Building2, TrendingDown, HelpCircle, AlertCircle, Percent, Info, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const AuctionEmptyGuide: React.FC = () => {
  
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();

  // Images - Professional & Abstract
  const IMG_HERO = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1200&h=630"; // Gavel in empty room context
  const IMG_BANK = "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=800&h=450"; // Bank / Creditor
  const IMG_PROCESS = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800&h=450"; // Documents

  useEffect(() => {
    // SEO Optimization
    document.title = "¿Qué Pasa Si Nadie Puja en una Subasta Judicial? | BOE 2025";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', "Descubre qué ocurre cuando una subasta judicial queda desierta, qué opciones tiene el acreedor y cómo puede afectar al precio final.");
    }
    window.scrollTo(0, 0);

    // Schema.org
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "¿Qué Pasa Si Nadie Puja en una Subasta Judicial?",
      "description": "Análisis técnico sobre las subastas desiertas en el BOE y los derechos de adjudicación del acreedor.",
      "image": [IMG_HERO],
      "datePublished": "2024-02-10T09:00:00+01:00",
      "dateModified": schemaDate,
      "author": {
        "@type": "Person",
        "name": "José de la Peña",
        "url": "https://activosoffmarket.es/quien-soy"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://activosoffmarket.es/que-pasa-si-nadie-puja-subasta-judicial"
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
      
      {/* HEADER */}
      <header className="bg-white pb-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
            <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium flex-wrap gap-2" aria-label="Breadcrumb">
                <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
                <ChevronRight size={14} />
                <Link to={ROUTES.GUIDE_PILLAR} className="hover:text-brand-600 transition-colors">Guía Subastas</Link>
                <ChevronRight size={14} />
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Subasta Desierta</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                ¿Qué Pasa Si Nadie Puja en una <br/>
                <span className="text-brand-700 italic">Subasta Judicial? (Explicación Completa)</span>
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
                    <Clock size={14} />
                    <span>6 min lectura</span>
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
                        alt="Sala de subastas vacía o mazo judicial"
                        width="1200"
                        height="630"
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                    />
                </figure>

                <p className="text-xl text-slate-700 leading-relaxed font-light mb-10 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                    Una situación muy común en el portal del BOE es que transcurran los 20 días de plazo y el contador de pujas permanezca en cero. 
                    Contrario a la creencia popular, que nadie puje no significa que la deuda desaparezca ni que el propietario conserve su casa.
                </p>
                <p>
                    Cuando una <Link to={ROUTES.GUIDE_PILLAR} className="text-brand-700 font-bold hover:underline">subasta judicial</Link> finaliza sin postores, se activa un mecanismo legal específico diseñado para proteger al acreedor (normalmente el banco) y evitar que el procedimiento quede en punto muerto.
                </p>

                {/* H2 1 */}
                <h2 className="text-3xl mt-16 mb-8 flex items-center gap-3">
                    <UserX className="text-brand-600" /> ¿Se declara desierta la subasta?
                </h2>
                <p>
                    Técnicamente sí. Cuando el Portal de Subastas certifica el cierre sin ninguna oferta válida, el Letrado de la Administración de Justicia (LAJ) declara el acto <strong>"sin postores"</strong> o desierto.
                </p>
                <p>
                    Esto no implica que se vaya a celebrar una "segunda subasta" con precio rebajado (ese sistema antiguo ya no existe en la LEC actual para inmuebles). El procedimiento entra en una nueva fase procesal donde el protagonista exclusivo es el <strong>ejecutante</strong> (quien reclamaba la deuda).
                </p>

                {/* H2 2 */}
                <h2 className="text-3xl mt-16 mb-8">Qué opciones tiene el acreedor</h2>
                <p>
                    Según el artículo 671 de la Ley de Enjuiciamiento Civil, si no hay ningún postor, el acreedor tiene un plazo de <strong>20 días hábiles</strong> para pedir la adjudicación del bien.
                </p>
                <p>
                    Aquí es donde muchos inversores se confunden. El acreedor no puede quedarse el bien "gratis" ni por el precio que quiera. La ley fija unos mínimos estrictos para evitar el enriquecimiento injusto y proteger al deudor.
                </p>

                <div className="bg-brand-50 p-6 rounded-xl border border-brand-100 my-8 not-prose">
                    <h3 className="font-bold text-brand-900 mb-2 flex items-center gap-2">
                        <Info size={20} /> Dato importante
                    </h3>
                    <p className="text-brand-800 text-sm m-0">
                        Si el acreedor NO pide la adjudicación en esos 20 días, se levanta el embargo (a instancia del ejecutado) y el bien queda libre de esta ejecución concreta. Esto es rarísimo que ocurra con bancos, pero puede pasar con comunidades de propietarios o particulares.
                    </p>
                </div>

                {/* H2 3 */}
                <h2 className="text-3xl mt-16 mb-8 flex items-center gap-3">
                    <Building2 className="text-slate-700" /> Puede el banco adjudicarse el inmueble
                </h2>
                <p>
                    Sí, y es lo más habitual. Si nadie puja, el banco se lo queda. Pero, ¿a qué precio? La Ley distingue si es vivienda habitual o no:
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <CheckCircle size={20} className="text-green-600"/> Vivienda Habitual
                        </h3>
                        <p className="text-sm text-slate-600">
                            El banco debe adjudicársela por el <strong>70% del valor de tasación</strong>.
                        </p>
                        <p className="text-xs text-slate-500 mt-2 border-t border-slate-100 pt-2">
                            *Excepción: Si la deuda total (principal + intereses + costas) es inferior al 70%, se lo puede quedar por el <strong>60%</strong>.
                        </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Gavel size={20} className="text-brand-600"/> No Vivienda Habitual
                        </h3>
                        <p className="text-sm text-slate-600">
                            (Locales, segundas residencias, naves). El banco puede pedir la adjudicación por el <strong>50% del valor de tasación</strong> o por la cantidad que se le deba por todos los conceptos.
                        </p>
                    </div>
                </div>

                <p>
                    Por este motivo, muchas veces no ves pujas en subastas donde el tipo es muy alto. Los inversores saben que el banco se lo quedará al 50% o 70% y prefieren no inmovilizar su <Link to={ROUTES.DEPOSIT} className="text-brand-700 font-bold hover:underline">depósito del 5%</Link> sabiendo que no tienen margen.
                </p>

                <figure className="my-12">
                    <img 
                        src={IMG_BANK} 
                        alt="Entidad bancaria o acreedor adjudicándose el bien"
                        width="800"
                        height="450"
                        className="rounded-2xl shadow-lg w-full object-cover"
                    />
                    <figcaption className="text-center text-sm text-slate-500 mt-2">Los bancos acumulan stock inmobiliario a través de las subastas desiertas.</figcaption>
                </figure>

                {/* H2 4 */}
                <h2 className="text-3xl mt-16 mb-8 flex items-center gap-3">
                    <TrendingDown className="text-red-500" /> Cómo afecta al valor futuro
                </h2>
                <p>
                    Si el banco se adjudica el bien, este pasa a formar parte de sus activos adjudicados (REO). Posteriormente, lo pondrá a la venta en el mercado libre (a través de inmobiliarias o servicers).
                </p>
                <p>
                    <strong>¿Será más barato entonces?</strong> No necesariamente.
                </p>
                <ul className="list-disc pl-6 space-y-3 mb-6">
                    <li>El banco intentará venderlo a precio de mercado para recuperar pérdidas.</li>
                    <li>Ya no tendrá cargas anteriores (se habrán purgado con la adjudicación), lo que lo hace más atractivo para el comprador final.</li>
                    <li>Posiblemente el banco ya haya iniciado el desalojo de ocupantes.</li>
                </ul>
                <p>
                    Comprar en subasta suele ser más barato que esperar a que el banco lo revenda, pero exige asumir los riesgos que explicamos en nuestra guía sobre <Link to={ROUTES.ANALYSIS} className="text-brand-700 font-bold hover:underline">cómo analizar una subasta</Link>.
                </p>

                {/* H2 5 */}
                <h2 className="text-3xl mt-16 mb-8">Oportunidades en "segundas subastas"</h2>
                <p>
                    El concepto clásico de "segunda" o "tercera" subasta presencial con bajada de precio desapareció hace años. Hoy el proceso es único.
                </p>
                <p>
                    Sin embargo, existen situaciones excepcionales:
                </p>
                <div className="space-y-4 not-prose my-6">
                    <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="bg-slate-100 p-2 h-fit rounded text-slate-700"><Percent size={20} /></div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-base">Concurso de Acreedores</h4>
                            <p className="text-sm text-slate-600 m-0">En liquidaciones concursales (empresas en quiebra) sí pueden celebrarse planes de liquidación con subastas sucesivas o venta directa si la primera queda desierta.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="bg-slate-100 p-2 h-fit rounded text-slate-700"><AlertCircle size={20} /></div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-base">AEAT / Seguridad Social</h4>
                            <p className="text-sm text-slate-600 m-0">En subastas administrativas, si queda desierta, a veces se abre un periodo de "adjudicación directa" donde se puede presentar oferta en sobre cerrado durante 6 meses.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-900 text-white p-8 rounded-2xl my-12 not-prose">
                    <h3 className="font-serif text-xl font-bold mb-4">¿Quieres saber si el banco va a pujar?</h3>
                    <p className="text-brand-100 text-lg leading-relaxed mb-6">
                        Es vital conocer la deuda real. Si la deuda es superior al 70% del valor, el banco defenderá su posición. Si es baja, podría dejarla escapar.
                    </p>
                    <Link to={ROUTES.ANALYSIS} className="inline-block bg-white text-brand-900 font-bold px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors">
                        Aprende a calcular la deuda real del banco
                    </Link>
                </div>

            </article>
        </main>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-10 max-h-[calc(100vh-120px)] overflow-auto pr-2 custom-scrollbar">
            
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 block flex items-center gap-2">
                    <HelpCircle size={14} /> Estrategia de Puja
                </span>
                <h3 className="font-serif text-2xl font-bold mb-4 leading-tight">
                    ¿Esperar a que quede desierta?
                </h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    A veces la mejor estrategia es NO pujar y negociar después la cesión de remate con el acreedor. Te explico cuándo funciona esto en el canal Premium.
                </p>
                <a 
                    href="https://t.me/activosoffmarket" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-white text-slate-900 font-bold py-4 px-4 rounded-xl text-center hover:bg-brand-50 transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2 group"
                >
                    Ver Estrategias en Telegram <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                </a>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <BookOpen size={18} className="text-brand-600"/>
                    Lecturas Relacionadas
                </h4>
                <nav className="space-y-4">
                    <Link to={ROUTES.RULE_70} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Regla del 70%</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.GUIDE_PILLAR} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Funcionamiento Subastas</span>
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

export default AuctionEmptyGuide;