import React from 'react';
import { Calendar, Send } from 'lucide-react';

const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 bg-brand-900 text-white relative overflow-hidden mb-16 md:mb-0">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-800 rounded-full opacity-40 blur-[100px] translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900 rounded-full opacity-40 blur-[100px] -translate-x-1/3 translate-y-1/3 animate-pulse delay-700"></div>

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        
        {/* FRASE ESTRATÉGICA FINAL */}
        <p className="font-serif italic text-xl md:text-2xl text-brand-200 opacity-90 mb-6">
            "Invertir en subastas no es cuestión de suerte. Es cuestión de información."
        </p>

        <h2 className="font-serif text-4xl md:text-6xl font-bold mb-8 leading-tight">
          ¿Ves oportunidades o ves riesgos?
        </h2>
        <p className="text-brand-100 text-xl md:text-2xl max-w-3xl mx-auto mb-12 font-light leading-relaxed">
          Empieza a ver lo que otros pasan por alto. Únete a mi canal y recibe tu primer análisis de oportunidad esta misma semana.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <a 
            href="https://t.me/activosoffmarket"
            target="_blank"
            rel="noopener noreferrer" 
            className="w-full sm:w-auto px-10 py-5 bg-white text-brand-900 font-bold text-lg rounded-xl hover:bg-brand-50 transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            <Send size={24} />
            Entrar al Canal Gratuito
          </a>
          <a 
            href="https://calendly.com/activosoffmarket"
            target="_blank"
            rel="noopener noreferrer" 
            className="w-full sm:w-auto px-10 py-5 bg-transparent border-2 border-brand-400 text-white font-bold text-lg rounded-xl hover:bg-brand-800 hover:border-brand-300 transition-all flex items-center justify-center gap-3"
          >
            <Calendar size={24} />
            Agendar Consulta
          </a>
        </div>
        
        <p className="mt-10 text-base text-brand-300 opacity-80">
          Sin compromiso. Entras, miras cómo trabajo y si no te aporta, sales.
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;