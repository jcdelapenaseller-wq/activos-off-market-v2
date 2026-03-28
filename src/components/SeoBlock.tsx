import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { ROUTES } from '../constants/routes';

const SeoBlock: React.FC = () => {
  return (
    <section className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="prose prose-lg prose-slate max-w-none">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Especialistas en Subastas Judiciales en España (BOE)
          </h2>
          <p>
            Las <strong>subastas judiciales</strong> son procedimientos de ejecución forzosa regulados por la Ley de Enjuiciamiento Civil, donde se liquidan bienes (viviendas, locales, terrenos) para saldar deudas impagadas. En España, estas licitaciones se centralizan obligatoriamente en el <strong>Portal de Subastas del BOE</strong>, ofreciendo oportunidades de inversión con descuentos significativos respecto al mercado libre.
          </p>
          <p>
            Sin embargo, invertir en este nicho requiere un <strong>análisis técnico riguroso</strong>. A diferencia de una compraventa tradicional ante notario, en una subasta judicial no existen garantías de saneamiento por vicios ocultos. Se adquiere "a cuerpo cierto", asumiendo el estado físico y, lo más crítico, el estado jurídico del inmueble.
          </p>
          <p>
            Los riesgos de no auditar correctamente el expediente son altos: desde heredar cargas registrales anteriores (hipotecas o embargos que no se cancelan) hasta encontrarse con ocupantes con derecho a permanecer en la vivienda. Por ello, la clave del éxito no es solo el precio de adjudicación, sino la correcta valoración de los costes ocultos y tiempos de posesión. Para dominar el lenguaje técnico, consulta nuestro <Link to={ROUTES.GLOSSARY} >Glosario de Subastas</Link>.
          </p>
          
          <div className="bg-brand-50 p-6 rounded-xl border border-brand-100 my-8 not-prose flex items-center gap-4 shadow-sm">
             <div className="bg-white p-3 rounded-full text-brand-700 shadow-sm border border-brand-100">
                <BookOpen size={24} />
             </div>
             <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">Recurso Esencial</p>
                <Link 
                  to={ROUTES.GUIDE_PILLAR} className="text-brand-800 font-bold text-lg md:text-xl hover:underline decoration-2 underline-offset-2 transition-all"
                >
                  Guía completa sobre subastas judiciales en España
                </Link>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeoBlock;