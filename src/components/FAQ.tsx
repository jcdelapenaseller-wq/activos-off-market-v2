import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-0">
      <button 
        className="w-full flex justify-between items-center py-6 text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg md:text-xl font-bold text-slate-800 pr-8 group-hover:text-brand-700 transition-colors">{question}</span>
        {isOpen ? <ChevronUp size={24} className="text-brand-500 flex-shrink-0" /> : <ChevronDown size={24} className="text-slate-400 flex-shrink-0 group-hover:text-brand-500" />}
      </button>
      {isOpen && (
        <div className="pb-6 text-slate-600 text-base md:text-lg leading-relaxed animate-in slide-in-from-top-2">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "¿Qué recibo exactamente en el Plan Premium (9€/semana)?",
      answer: "Acceso a información estratégica y depurada. Semanalmente selecciono oportunidades reales y te entrego un análisis que incluye: cálculo detallado de cargas anteriores (la deuda real oculta tras la subasta), evaluación de la situación posesoria (ocupación sin título, alquileres, etc.) y una valoración conservadora de mercado. Mi objetivo es que tengas todos los datos críticos antes de plantearte siquiera pujar."
    },
    {
      question: "¿Garantizas que ganaré dinero?",
      answer: "No. Y huye de quien te lo garantice. Yo garantizo que la información sobre la que tomas la decisión es veraz, ha sido contrastada jurídicamente y que los riesgos legales están identificados. La rentabilidad final depende de tu estrategia de puja y de la gestión posterior del activo."
    },
    {
      question: "¿Eres una agencia inmobiliaria?",
      answer: "No. No vendo inmuebles, no tengo cartera propia y no cobro comisiones de éxito. Soy un consultor independiente. Mi único cliente eres tú (el inversor), no el banco ni el ejecutado. Cobro por mi análisis técnico, ganes la subasta o no."
    },
    {
      question: "¿Qué pasa si me suscribo y no me convence?",
      answer: "Te das de baja al momento. Sin permanencia ni preguntas. Si entras, revisas el material y consideras que no se ajusta a tu perfil de inversión, cancelas tu suscripción con un solo clic."
    },
    {
      question: "¿La consultoría 1:1 incluye informe jurídico escrito?",
      answer: "La sesión (desde 39€) se centra en un análisis estratégico y verbal en tiempo real. Revisamos la documentación (Certificación de Cargas, Edicto, etc.) en pantalla compartida y determinamos la viabilidad jurídica y económica de la operación. Si el caso requiere un dictamen pericial por escrito para presentar a terceros o socios, este servicio se puede contratar adicionalmente tras la sesión."
    },
    {
      question: "¿Pujas tú por mí?",
      answer: "No. Yo te doy la munición (información y estrategia), pero tú disparas (pujas). Debes hacerlo con tu propio certificado digital en el Portal del BOE. Si no sabes cómo, te guío en el proceso, es más sencillo de lo que parece."
    },
  ];

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-bold uppercase tracking-wide mb-4 hover:bg-slate-200 transition-colors cursor-default">
            <HelpCircle size={16} /> Dudas Frecuentes
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-6">Transparencia radical</h2>
          <p className="text-xl text-slate-600">
            Resuelvo las dudas más comunes antes de que inviertas un euro.
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;