import React, { useEffect } from 'react';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle, XCircle, ArrowRight, Lock } from 'lucide-react';

const ProtocoloAnalisisSubastas: React.FC = () => {

  useEffect(() => {
    // Scroll top
    window.scrollTo(0, 0);

    // SEO
    document.title = "Protocolo de Análisis de Subastas | Descarga Gratuita";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', "Descarga el protocolo profesional de análisis de riesgos para subastas judiciales. Checklist de cargas, posesión y cálculo de puja máxima.");
    } else {
        const newMeta = document.createElement('meta');
        newMeta.name = "description";
        newMeta.content = "Descarga el protocolo profesional de análisis de riesgos para subastas judiciales. Checklist de cargas, posesión y cálculo de puja máxima.";
        document.head.appendChild(newMeta);
    }

    // Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', "https://activosoffmarket.es/protocolo-analisis-subastas");

    // Open Graph Tags
    const setMeta = (property: string, content: string) => {
        let element = document.querySelector(`meta[property="${property}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('property', property);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };
    setMeta('og:title', "Protocolo de Análisis de Subastas | Descarga Gratuita");
    setMeta('og:description', "Evita errores de novato. Descarga la checklist profesional para filtrar expedientes del BOE.");
    setMeta('og:url', "https://activosoffmarket.es/protocolo-analisis-subastas");
    setMeta('og:type', "website");

  }, []);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600 selection:bg-brand-100 selection:text-brand-900">
      
      {/* HERO SECTION */}
      <div className="bg-white pb-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-brand-100">
                <Lock size={12} /> Recurso Profesional
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-[1.1]">
                Protocolo de <span className="text-brand-700 italic">Análisis de Riesgos</span> <br/>en Subastas Judiciales
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
                La metodología exacta para filtrar expedientes, detectar cargas ocultas y calcular tu puja máxima sin emociones.
            </p>
            
            <div className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-500 border-t border-slate-100 pt-6 max-w-xs mx-auto">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-serif font-bold border border-brand-200">J</div>
                <span>Validado por <strong>José de la Peña</strong> (Jurista Experto)</span>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
        
        {/* PROBLEM BLOCK */}
        <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-r-xl mb-16 shadow-sm">
            <div className="flex gap-4">
                <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={28} />
                <div>
                    <h3 className="font-bold text-red-900 text-lg mb-2">El error número 1 del inversor novato</h3>
                    <p className="text-red-800 leading-relaxed">
                        El 90% de los errores no ocurren durante la puja, sino antes. Pujar sin haber auditado la <strong>Certificación de Cargas</strong> o la situación posesoria es la forma más rápida de perder tu depósito o heredar una deuda impagable.
                    </p>
                </div>
            </div>
        </div>

        {/* WHAT'S INCLUDED */}
        <div className="mb-16">
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8 text-center">Qué incluye el protocolo</h2>
            <div className="grid gap-4">
                {[
                    { title: "Checklist de Cargas", desc: "Cómo leer la certificación y diferenciar cargas preferentes de las que se purgan.", icon: FileText },
                    { title: "Auditoría de Posesión", desc: "Pasos para verificar ocupantes, inquilinos y derechos de uso antes de visitar.", icon: ShieldCheck },
                    { title: "Semáforo de Riesgos", desc: "5 Red Flags que deben hacerte descartar un expediente en 60 segundos.", icon: AlertTriangle },
                    { title: "Calculadora de Puja", desc: "Fórmula para descontar ITP, reformas y margen antes de definir tu límite.", icon: CheckCircle }
                ].map((item, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 flex items-start gap-4 shadow-sm hover:border-brand-200 transition-colors">
                        <div className="bg-brand-50 p-2 rounded-lg text-brand-700 flex-shrink-0">
                            <item.icon size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">{item.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* PROFESSIONAL FILTER */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 text-sm">
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2"><CheckCircle size={16}/> Para Inversores</h4>
                <ul className="space-y-3 text-green-800">
                    <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 bg-green-600 rounded-full"></span> Que buscan rentabilidad {'>'}20%.</li>
                    <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 bg-green-600 rounded-full"></span> Que disponen de capital propio.</li>
                    <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 bg-green-600 rounded-full"></span> Que valoran la seguridad jurídica.</li>
                </ul>
            </div>
            <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 opacity-75">
                <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><XCircle size={16}/> No para Curiosos</h4>
                <ul className="space-y-3 text-slate-600">
                    <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full"></span> Buscadores de "chollos" imposibles.</li>
                    <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full"></span> Sin intención real de compra.</li>
                    <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full"></span> Que creen que el BOE lo explica todo.</li>
                </ul>
            </div>
        </div>

        {/* CAPTURE FORM */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl mb-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-brand-900 opacity-20 pointer-events-none"></div>
            <div className="relative z-10">
                <h2 className="text-3xl font-serif font-bold mb-4">Descarga el PDF Gratuito</h2>
                <p className="text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
                    Recibe el protocolo en tu email y accede a nuestra lista privada de oportunidades diarias.
                </p>
                {/* MailerLite Form */}
                <div className="ml-embedded" data-form="NhdDQe"></div>
            </div>
        </div>

        {/* SOFT TRANSITION */}
        <div className="border-t border-slate-200 pt-12 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Otros Recursos</p>
            <div className="flex flex-col md:flex-row justify-center gap-6">
                <a href="https://sublaunch.com/activosoffmarket" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:border-brand-300 hover:text-brand-700 transition-all shadow-sm">
                    Canal Premium <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                </a>
                <a href="https://calendly.com/activosoffmarket/consultoria" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:border-slate-400 hover:text-slate-900 transition-all shadow-sm">
                    Consultoría 1:1 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                </a>
            </div>
        </div>

        </div>
      </div>
    </div>
  );
};

export default ProtocoloAnalisisSubastas;
