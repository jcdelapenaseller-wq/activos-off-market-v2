import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import Hero from './Hero';
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

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <RecentAuctionsHome />
      <div className="max-w-7xl mx-auto px-6">
        <LeadMagnetBlock />
      </div>
      <SocialProof />
      <Services />
      <Pricing />
      <Process />
      <Opportunities />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-brand-50 rounded-3xl p-8 md:p-16 border border-brand-100">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-8 text-center">
                Por qué muchos inversores siguen el canal premium
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-lg text-slate-700 leading-relaxed">
                    En el canal gratuito publico únicamente algunas de las subastas con mayor potencial detectadas.
                  </p>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    En el canal premium analizo más activos, explico el contexto jurídico de cada oportunidad y comparto estrategias que muchos inversores utilizan antes de presentar una puja.
                  </p>
                  <div className="pt-4">
                    <Link 
                      to="/premium" 
                      className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-700 transition-all shadow-lg"
                    >
                      Ver canal premium <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-100 space-y-6">
                  <h3 className="font-bold text-slate-900 text-xl mb-4">Ventajas del canal premium:</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-slate-700">
                      <span className="text-2xl">🧾</span>
                      <span><strong>Más activos detectados</strong> cada semana</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <span className="text-2xl">⚖️</span>
                      <span><strong>Estrategia y contexto jurídico</strong> explicado</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <span className="text-2xl">💬</span>
                      <span><strong>Soporte por email y Telegram</strong> en menos de 24h</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <span className="text-2xl">🎁</span>
                      <span><strong>20% de descuento</strong> en todas las consultorías</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">
              Análisis profesional de subastas
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Antes de pujar muchos inversores prefieren revisar el expediente completo de la subasta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-6">En una revisión profesional se analiza:</h3>
              <ul className="space-y-4 mb-8 flex-grow">
                {['cargas registrales', 'situación posesoria', 'expediente judicial', 'estrategia de puja', 'estimación del valor real del activo'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                    <span className="capitalize">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6 border-t border-slate-100">
                <p className="text-slate-900 font-medium italic">
                  "Un pequeño detalle en el expediente puede cambiar completamente la rentabilidad real de una subasta."
                </p>
              </div>
            </div>

            <div className="bg-brand-900 text-white p-8 rounded-2xl flex flex-col justify-center items-center text-center">
              <h3 className="text-2xl font-serif font-bold mb-6">¿Quieres ir con seguridad a tu próxima subasta?</h3>
              <p className="text-brand-100 mb-8 max-w-sm">
                Evita errores costosos o sorpresas jurídicas después de la adjudicación con un análisis técnico completo.
              </p>
              <a 
                href="https://calendly.com/activosoffmarket" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-white text-brand-900 font-bold py-4 px-10 rounded-xl hover:bg-brand-50 transition-all shadow-lg"
              >
                Solicitar análisis de subasta
              </a>
            </div>
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
