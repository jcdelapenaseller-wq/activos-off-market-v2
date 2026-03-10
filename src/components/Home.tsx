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
import SeoBlock from './SeoBlock';
import FAQ from './FAQ';
import FinalCTA from './FinalCTA';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <LeadMagnetBlock />
      </div>
      <SocialProof />
      <Services />
      <Pricing />
      <Process />
      <Opportunities />
      <SeoBlock />
      <div className="container mx-auto px-4 md:px-6 max-w-7xl py-12">
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
