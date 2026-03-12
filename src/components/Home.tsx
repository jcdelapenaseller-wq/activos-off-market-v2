import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import Hero from './Hero';
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

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <div className="max-w-7xl mx-auto px-6">
        <LeadMagnetBlock />
      </div>
      <SocialProof />
      <Services />
      <Pricing />
      <Process />
      <Opportunities />
      
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">
            Últimas subastas detectadas
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            Consulta las subastas inmobiliarias más recientes analizadas en la web.
          </p>
          <Link 
            to="/subastas-recientes" 
            className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Ver subastas recientes <ArrowRight size={20} />
          </Link>
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
            <Link to={ROUTES.CALCULATOR} className="inline-block bg-white text-brand-900 font-bold py-4 px-8 rounded-xl hover:bg-brand-50 transition-all">Calcular inversión</Link>
        </div>
      </div>
      <FAQ />
      <FinalCTA />
    </>
  );
};

export default Home;
