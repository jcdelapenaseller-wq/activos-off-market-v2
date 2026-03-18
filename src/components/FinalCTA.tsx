import React from 'react';
import { Send } from 'lucide-react';
import { trackConversion } from '../utils/tracking';

const FinalCTA: React.FC = () => {
  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200 mb-16 md:mb-0">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-8">
          ¿Quieres recibir oportunidades antes que otros inversores?
        </h2>
        <a 
          href="https://t.me/activosoffmarket"
          target="_blank"
          rel="noopener noreferrer" 
          onClick={() => trackConversion('general', 'footer', 'premium')}
          className="inline-flex items-center gap-2 bg-brand-700 text-white font-bold py-4 px-10 rounded-xl hover:bg-brand-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Send size={20} />
          Canal Telegram
        </a>
      </div>
    </section>
  );
};

export default FinalCTA;