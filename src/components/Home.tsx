import React from 'react';
import Hero from './Hero';
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
      <SocialProof />
      <Services />
      <Pricing />
      <Process />
      <Opportunities />
      <SeoBlock />
      <FAQ />
      <FinalCTA />
    </>
  );
};

export default Home;
