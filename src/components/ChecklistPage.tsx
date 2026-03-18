import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  Download, 
  FileText, 
  Search, 
  Home, 
  Calculator, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { trackConversion } from '../utils/tracking';

const ChecklistPage: React.FC = () => {
  useEffect(() => {
    // Add noindex meta tag
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const handleDownload = () => {
    trackConversion('all', 'lead_magnet', 'download');
    window.print();
  };

  const checklistSections = [
    {
      title: "1. Cargas Registrales",
      icon: <FileText className="text-brand-600" size={24} />,
      tip: "Punto clave: La Nota Simple es tu única protección real ante deudas ocultas.",
      items: [
        "Solicitar Nota Simple actualizada (no más de 48h antes de la subasta).",
        "Identificar cargas anteriores: Estas se mantienen y deberás pagarlas tú.",
        "Identificar cargas posteriores: Estas se cancelan tras la adjudicación.",
        "Verificar deudas de IBI: El nuevo dueño responde de los últimos 4 años.",
        "Verificar deudas de Comunidad: Respondes del año en curso y los 3 anteriores."
      ]
    },
    {
      title: "2. Situación Posesoria",
      icon: <Home className="text-brand-600" size={24} />,
      tip: "Ojo con: Los contratos de alquiler 'fantasma' firmados justo antes de la ejecución.",
      items: [
        "Confirmar si el inmueble está ocupado por el deudor o por terceros.",
        "Verificar si existe contrato de alquiler vigente y si es oponible.",
        "Comprobar si es la vivienda habitual del deudor (afecta a los plazos de lanzamiento).",
        "Investigar si hay derecho de uso concedido por sentencia judicial (ej. divorcios)."
      ]
    },
    {
      title: "3. Valor de Mercado Real",
      icon: <Search className="text-brand-600" size={24} />,
      tip: "Error típico: Confiar en el valor de tasación del BOE como si fuera el precio de venta.",
      items: [
        "Ignorar la tasación del BOE: Suele estar inflada o muy desactualizada.",
        "Realizar un estudio de mercado con testigos reales vendidos recientemente.",
        "Visitar la zona: Comprobar estado del edificio, servicios y vecindario.",
        "Estimar costes de reforma si no se ha podido visitar el interior."
      ]
    },
    {
      title: "4. Cálculo de Puja Máxima",
      icon: <Calculator className="text-brand-600" size={24} />,
      tip: "Punto clave: No olvides que el ITP se paga sobre el valor de referencia, no sobre tu puja.",
      items: [
        "Calcular el ITP exacto según la Comunidad Autónoma.",
        "Prever gastos de Registro de la Propiedad y Notaría.",
        "Establecer un margen de beneficio mínimo (recomendado >25%).",
        "Fijar una puja máxima 'infranqueable' para no dejarse llevar por la emoción."
      ]
    },
    {
      title: "5. Riesgos Ocultos y Legales",
      icon: <AlertTriangle className="text-brand-600" size={24} />,
      tip: "Precaución: Una subasta puede anularse meses después si el deudor no fue bien notificado.",
      items: [
        "Verificar derechos de retracto (inquilinos, colindantes, administraciones).",
        "Comprobar si hay tercerías de dominio interpuestas.",
        "Revisar posibles vicios en la notificación del edicto que puedan anular la subasta.",
        "Confirmar que el deudor no está en concurso de acreedores."
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="bg-slate-900 text-white py-16 px-6 print:bg-white print:text-slate-900 print:py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-400 px-4 py-1.5 rounded-full text-sm font-bold mb-6 print:hidden">
            <ShieldCheck size={16} />
            Contenido Exclusivo para Suscriptores
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight">
            Checklist profesional para analizar subastas del BOE
          </h1>
          <p className="text-brand-400 font-medium mb-8 text-lg">
            “Este checklist es el mismo que utilizo antes de consignar el 5% en el BOE.”
          </p>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light print:text-slate-600">
            El proceso paso a paso que utilizo para filtrar oportunidades y evitar errores costosos antes de pujar.
          </p>
          
          <button 
            onClick={handleDownload}
            className="mt-10 inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl hover:shadow-brand-500/20 print:hidden"
          >
            <Download size={20} />
            Descargar Checklist en PDF
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-16 px-6 print:py-0">
        <div className="space-y-12">
          {checklistSections.map((section, idx) => (
            <section key={idx} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 print:bg-white print:border-slate-200 print:p-4 print:break-inside-avoid">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 print:border-slate-300">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
              </div>
              <ul className="space-y-4 mb-6">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={20} />
                    <span className="text-lg leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-slate-200/60 text-brand-700 font-medium italic text-sm">
                {section.tip}
              </div>
            </section>
          ))}
        </div>

        {/* Authority Block */}
        <section className="mt-20 bg-brand-50 rounded-3xl p-10 border border-brand-100 print:bg-white print:border-slate-200 print:mt-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Info className="text-brand-600" />
            Cómo utilizar este checklist
          </h2>
          <div className="prose prose-slate max-w-none text-lg text-slate-700 leading-relaxed">
            <p>
              Este checklist no es una garantía absoluta, sino un <strong>filtro de seguridad</strong>. En el mundo de las subastas, la información es poder, pero la información <em>verificada</em> es dinero.
            </p>
            <p>
              Mi recomendación es que no avances a la siguiente sección si no has marcado todos los puntos de la anterior. Si encuentras un "No" rotundo en las cargas o en la situación posesoria, lo más inteligente suele ser descartar y pasar a la siguiente oportunidad.
            </p>
            <p className="font-medium text-slate-900">
              Recuerda: La mejor inversión es a veces la que no se hace.
            </p>
          </div>
        </section>

        {/* Soft Conversion Block */}
        <section className="mt-20 text-center py-12 border-t border-slate-100 print:hidden">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
            ¿Quieres ir un paso más allá?
          </h2>
          <p className="text-lg text-slate-600 mb-4 max-w-2xl mx-auto">
            Si has encontrado una subasta que cumple todos los puntos pero quieres una segunda opinión profesional antes de comprometer tu capital.
          </p>
          <p className="text-slate-900 font-bold mb-10 italic">
            “La mayoría de errores en subastas no vienen de la puja… sino de no revisar bien esto.”
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/contacto" 
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all"
            >
              Consultoría Personalizada
              <ArrowRight size={18} />
            </a>
            <a 
              href="https://t.me/activosoffmarket" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Unirse al Canal Premium
            </a>
          </div>
        </section>
      </main>

      {/* Footer Note */}
      <footer className="py-12 bg-slate-50 text-center text-slate-400 text-sm print:bg-white print:text-slate-600">
        <p>© {new Date().getFullYear()} Activos Off-Market. Todos los derechos reservados.</p>
        <p className="mt-2">Este documento es para fines informativos y no constituye asesoramiento legal o financiero.</p>
      </footer>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 2cm; }
          nav, .print\\:hidden { display: none !important; }
          body { background: white !important; color: black !important; }
          main { width: 100% !important; max-width: none !important; padding: 0 !important; }
          .bg-slate-50, .bg-brand-50 { background: white !important; border: 1px solid #e2e8f0 !important; box-shadow: none !important; }
          .rounded-3xl { border-radius: 1rem !important; }
          h1 { font-size: 24pt !important; margin-bottom: 10pt !important; }
          h2 { font-size: 18pt !important; margin-bottom: 8pt !important; }
          .text-lg { font-size: 11pt !important; color: #1e293b !important; }
          .text-slate-700, .text-slate-600 { color: #1e293b !important; }
          .border-t { border-color: #e2e8f0 !important; }
          .shadow-sm, .shadow-xl { box-shadow: none !important; }
        }
      `}} />
    </div>
  );
};

export default ChecklistPage;
