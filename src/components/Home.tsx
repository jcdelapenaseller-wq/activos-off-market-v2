import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import Hero from './Hero';
import { DiscoverReportsBlock } from './DiscoverReportsBlock';
import RecentAuctionsHome from './RecentAuctionsHome';
import LeadMagnetBlock from './LeadMagnetBlock';
import Services from './Services';
import SocialProof from './SocialProof';
import Pricing from './Pricing';
import Process from './Process';
import Opportunities from './Opportunities';
import { ArrowRight } from 'lucide-react';
import SeoBlock from './SeoBlock';
import FAQ from './FAQ';
import FinalCTA from './FinalCTA';
import { trackConversion } from '../utils/tracking';
import PremiumValueBlock from './PremiumValueBlock';

const Home: React.FC = () => {
  React.useEffect(() => {
    document.title = "Activos Off-Market | Expertos en Subastas Judiciales y BOE";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Encuentra las mejores oportunidades en subastas judiciales, BOE y AEAT en España. Análisis técnico, jurídico y financiero para inversores inmobiliarios.");
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Hero />
      <DiscoverReportsBlock />
      <RecentAuctionsHome />
      <div className="max-w-7xl mx-auto px-6">
        <LeadMagnetBlock />
      </div>
      <SocialProof />
      <Services />
      <Pricing />
      
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <PremiumValueBlock />
        </div>
      </section>

      <Process />
      <Opportunities />

      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">
              Analiza cualquier subasta antes de pujar
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Pega el enlace de la subasta y elige el nivel de profundidad que necesitas para tomar tu decisión de inversión.
            </p>
          </div>

          <div className="flex justify-center">
            <Link 
              to={ROUTES.ANALIZAR_SUBASTA}
              className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold py-4 px-8 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Analizar una subasta <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">
            Ejemplos reales de subastas analizadas
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            Descubre cómo analizamos oportunidades reales procedentes del BOE. Casos prácticos con números detallados, rentabilidad calculada y riesgos evaluados para que entiendas el proceso de inversión.
          </p>
          <Link 
            to={ROUTES.EXAMPLES_INDEX} 
            onClick={() => trackConversion('general', 'home', 'listado')}
            className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Ver ejemplos de subastas <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <SeoBlock />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-brand-900 rounded-3xl p-8 md:p-12 text-center text-white flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">Herramienta gratuita: Calculadora de rentabilidad en subastas judiciales</h2>
            <Link 
              to={ROUTES.CALCULATOR} 
              onClick={() => trackConversion('general', 'home', 'premium')}
              className="inline-block bg-white text-brand-900 font-bold py-4 px-8 rounded-xl hover:bg-brand-50 transition-all"
            >
              Calcular inversión
            </Link>
        </div>
      </div>
      <FAQ />
      <FinalCTA />
    </>
  );
};

export default Home;
