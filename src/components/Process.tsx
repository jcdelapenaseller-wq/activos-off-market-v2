import React from 'react';
import { Filter, Scale, Home, ReceiptEuro, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: <Filter size={32} />,
    title: "1. Filtro Rápido",
    desc: "Descarto el 95% del ruido del BOE: proindivisos, nuda propiedad y precios fuera de mercado."
  },
  {
    icon: <Scale size={32} />,
    title: "2. Cargas y Deudas",
    desc: "Calculo la deuda real. Leo la certificación para asegurar que no heredas hipotecas o embargos ocultos."
  },
  {
    icon: <Home size={32} />,
    title: "3. Ocupación",
    desc: "Investigo indicios en el edicto y notificaciones. ¿Viven allí? ¿Tienen contrato? ¿Se irán fácil?"
  },
  {
    icon: <ReceiptEuro size={32} />,
    title: "4. Números Reales",
    desc: "Sumo ITP, registro, comunidad y reformas. Te doy el precio máximo de puja para que tengas margen."
  }
];

const Process: React.FC = () => {
  return (
    <section id="metodo" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-slate-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-brand-600 font-bold text-sm tracking-widest uppercase mb-3 block">Rigor Técnico</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-6">Mi metodología de verificación</h2>
          <p className="text-xl text-slate-600 mb-6">
             La improvisación sale cara en las subastas. Yo sigo siempre este protocolo estricto.
          </p>
          <Link 
            to="/subastas-judiciales-espana" className="inline-flex items-center gap-2 text-brand-700 font-medium hover:text-brand-900 hover:underline underline-offset-4"
          >
             <BookOpen size={16} /> Lee la guía técnica completa sobre subastas
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center p-8 rounded-2xl bg-white border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-20 h-20 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mb-6 shadow-inner group-hover:bg-brand-700 group-hover:text-white transition-colors">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
            <a 
                href="https://t.me/activosoffmarket" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-700 font-bold text-lg hover:text-brand-900 transition-colors border-b-2 border-brand-200 hover:border-brand-700 pb-1"
            >
                Ver cómo trabajo en el canal <ArrowRight size={20} />
            </a>
        </div>
      </div>
    </section>
  );
};

export default Process;