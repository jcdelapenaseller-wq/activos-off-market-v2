import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, ShieldCheck, Download, CheckCircle } from 'lucide-react';

interface LeadMagnetBlockProps {
  variant?: 'aside' | 'full';
}

const LeadMagnetBlock: React.FC<LeadMagnetBlockProps> = ({ variant = 'aside' }) => {
  // Hardcoded path to avoid dependency on routes.ts updates
  const TARGET_URL = '/protocolo-analisis-subastas';

  if (variant === 'full') {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl my-16 relative overflow-hidden not-prose border border-slate-800">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-900 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
                <div className="inline-flex items-center gap-2 text-brand-300 font-bold text-xs uppercase tracking-widest mb-4">
                    <ShieldCheck size={16} />
                    <span>Recurso Gratuito</span>
                </div>
                <h3 className="font-serif text-3xl font-bold text-white mb-4 leading-tight">
                    ¿Vas a pujar sin revisar las cargas?
                </h3>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                    Descarga nuestro <strong>Protocolo de Análisis de Riesgos</strong>. Una checklist profesional para detectar deudas ocultas y problemas posesorios antes de perder tu depósito.
                </p>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle size={16} className="text-brand-500" /> Sin coste
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle size={16} className="text-brand-500" /> PDF Inmediato
                    </div>
                </div>
            </div>
            
            <div className="w-full md:w-auto flex-shrink-0">
                <Link 
                    to={TARGET_URL}
                    className="block w-full md:w-auto bg-brand-600 text-white font-bold py-4 px-8 rounded-xl text-center hover:bg-brand-500 transition-all shadow-lg shadow-brand-900/50 flex items-center justify-center gap-2 group"
                >
                    <Download size={20} />
                    Descargar Protocolo
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
      </div>
    );
  }

  // Default: 'aside'
  return (
    <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:border-brand-200 transition-colors">
        <div className="bg-brand-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-brand-700">
            <FileText size={24} />
        </div>
        <h4 className="font-bold text-slate-900 mb-2 text-lg">
            Protocolo de Análisis
        </h4>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            No improvises. Usa la misma checklist que usamos nosotros para filtrar expedientes y evitar errores.
        </p>
        <Link 
            to={TARGET_URL}
            className="block w-full border-2 border-brand-600 text-brand-700 font-bold py-3 px-4 rounded-xl text-center hover:bg-brand-600 hover:text-white transition-all text-sm flex items-center justify-center gap-2"
        >
            <Download size={16} />
            Descargar Gratis
        </Link>
    </div>
  );
};

export default LeadMagnetBlock;
