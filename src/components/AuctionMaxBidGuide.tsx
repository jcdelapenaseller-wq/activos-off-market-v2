import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronRight, ArrowRight, BookOpen, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import LeadMagnetBlock from './LeadMagnetBlock';

const AuctionMaxBidGuide: React.FC = () => {
  const IMG_HERO = "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=1200&h=630"; 

  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const schemaDate = currentDate.toISOString();
  
  const [readTime, setReadTime] = useState(4);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Cómo calcular la puja máxima en una subasta judicial",
    "description": "Aprende a calcular el precio máximo que deberías pujar en una subasta judicial teniendo en cuenta impuestos, reformas y margen de seguridad.",
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
    "datePublished": "2024-01-15T09:00:00+01:00",
    "dateModified": schemaDate,
    "image": [IMG_HERO],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://activosoffmarket.es/calcular-puja-maxima-subasta"
    }
  };

  useEffect(() => {
    const article = document.querySelector('article');
    if (article) {
      const text = article.innerText;
      const words = text.trim().split(/\s+/).length;
      const time = Math.ceil(words / 200);
      setReadTime(Math.max(3, time));
    }

    window.scrollTo(0, 0);

    document.title = "Cómo calcular la puja máxima en una subasta judicial";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Aprende a calcular el precio máximo que deberías pujar en una subasta judicial teniendo en cuenta impuestos, reformas y margen de seguridad.");

    const setMeta = (property: string, content: string) => {
        let element = document.querySelector(`meta[property="${property}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('property', property);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    setMeta('og:type', 'article');
    setMeta('og:title', 'Cómo calcular la puja máxima en una subasta judicial');
    setMeta('og:description', 'Aprende a calcular el precio máximo que deberías pujar en una subasta judicial teniendo en cuenta impuestos, reformas y margen de seguridad.');
    setMeta('og:image', IMG_HERO);
    setMeta('og:url', 'https://activosoffmarket.es/calcular-puja-maxima-subasta');
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
    canonical.setAttribute('href', "https://activosoffmarket.es/calcular-puja-maxima-subasta");

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
                <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md" aria-current="page">Calcular Puja Máxima</span>
            </nav>
            
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Cómo calcular la puja máxima en una subasta judicial
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
                  alt="Calcular la puja máxima en una subasta judicial" 
                  width="1200" 
                  height="630"
                  className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 bg-slate-100"
                  // @ts-ignore
                  fetchpriority="high"
                />
              </figure>

              <p className="text-xl leading-relaxed mb-8 font-light first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-700 first-letter:mr-3 first-letter:float-left">
                Uno de los errores más comunes y destructivos en las subastas judiciales es dejarse llevar por la emoción del momento y pujar sin haber calculado previamente el límite máximo de inversión. Entrar a una puja sin un techo claro es la vía más rápida para arruinar la rentabilidad de una operación.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Qué es la puja máxima en una subasta</h2>
              <p>
                La puja máxima es el precio tope absoluto que un inversor debería ofrecer por un inmueble para garantizar que la operación siga siendo rentable tras descontar todos los gastos, impuestos y el margen de beneficio esperado. No es lo que <em>quieres</em> pagar, sino lo máximo que <em>puedes</em> permitirte pagar sin poner en riesgo tu capital.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Fórmula básica para calcular la puja máxima</h2>
              <p>
                El cálculo de la puja máxima se realiza a la inversa: partiendo del valor final del inmueble y restando todos los costes asociados hasta llegar al precio de compra. La fórmula es la siguiente:
              </p>

              <div className="bg-slate-900 text-white p-6 rounded-xl my-8 font-mono text-lg shadow-lg">
                <p>Puja máxima =</p>
                <p className="pl-4">Valor de mercado</p>
                <p className="pl-4 text-red-400">− coste de reforma</p>
                <p className="pl-4 text-red-400">− impuestos (ITP)</p>
                <p className="pl-4 text-red-400">− deudas heredadas</p>
                <p className="pl-4 text-brand-400">− margen de seguridad</p>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Ejemplo práctico</h2>
              <p>
                Veamos cómo se aplica esta fórmula en un escenario real:
              </p>

              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm my-8">
                <ul className="space-y-4 text-slate-700 font-medium">
                    <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Valor mercado:</span> <span>220.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2 text-red-600">
                        <span>Reforma estimada:</span> <span>- 30.000€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2 text-red-600">
                        <span>ITP:</span> <span>- 13.200€</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-2 text-red-600">
                        <span>Otros costes (Registro, Notaría, etc.):</span> <span>- 3.000€</span>
                    </li>
                    <li className="flex justify-between pt-4 font-bold text-xl text-brand-700 border-t-2 border-slate-200">
                        <span>Puja máxima recomendada:</span> <span>~ 173.000€</span>
                    </li>
                </ul>
              </div>
              <p className="text-sm text-slate-500 italic mt-2">
                * Nota: En este ejemplo simplificado, la diferencia entre la puja máxima (173.000€) y el resto de costes asume que el margen de seguridad ya está descontado o que el inversor busca adquirir el inmueble a precio de coste total para uso propio. Si buscas rentabilidad, deberías restar también tu beneficio esperado.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Cómo influye la regla del 70% en la puja</h2>
              <p>
                A la hora de establecer tu estrategia de pujas, debes tener muy presente el artículo 670 de la Ley de Enjuiciamiento Civil (LEC). Este artículo dicta que si la mejor postura es igual o superior al 70% del valor de tasación a efectos de subasta, la adjudicación es firme y automática.
              </p>
              <p>
                Si tu puja máxima calculada queda por debajo de ese 70%, debes saber que la adjudicación no será inmediata y el deudor o el acreedor tendrán la oportunidad de mejorar tu postura. Para dominar esta dinámica, te aconsejo revisar nuestra guía detallada sobre la <Link to={ROUTES.RULE_70} className="text-brand-700 font-bold hover:underline">regla del 70% en subasta judicial</Link>.
              </p>

              <div className="bg-brand-50 border border-brand-100 p-8 rounded-2xl my-12">
                  <p className="text-brand-900 font-medium text-lg m-0 flex items-start gap-4">
                      <Calculator className="text-brand-600 shrink-0 mt-1" size={24} />
                      <span>Si quieres calcular automáticamente la puja máxima de una operación, puedes utilizar esta <Link to={ROUTES.CALCULATOR} className="text-brand-700 font-bold hover:underline">calculadora de subastas judiciales</Link>.</span>
                  </p>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">También puede interesarte:</h3>
                <ul className="list-none pl-0 space-y-3">
                  <li>
                    <Link to={ROUTES.PROFITABILITY} className="text-brand-700 font-medium hover:underline flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                      Cómo calcular la rentabilidad de una subasta judicial
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.HOW_MUCH_TO_PAY} className="text-brand-700 font-medium hover:underline flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                      Cuánto pagar en una subasta judicial
                    </Link>
                  </li>
                </ul>
              </div>

              <LeadMagnetBlock />
            </article>
        </main>

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
                    <Link to={ROUTES.HOW_MUCH_TO_PAY} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cuánto Pagar</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.PROFITABILITY} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Calcular Rentabilidad</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500"/>
                    </Link>
                    <Link to={ROUTES.ANALYSIS} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-slate-600 text-sm font-medium group-hover:text-brand-700">Cómo Analizar Subastas</span>
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

export default AuctionMaxBidGuide;
