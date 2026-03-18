import React from 'react';
import { Check, Zap, Eye, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

const PremiumValueBlock: React.FC = () => {
  return (
    <div className="bg-white border-2 border-brand-100 rounded-3xl overflow-hidden shadow-sm">
      <div className="bg-brand-50 p-6 border-b border-brand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="text-brand-600" size={24} />
          ¿Qué obtienes en el canal premium?
        </h3>
        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest bg-white px-2 py-1 rounded border border-brand-100">
          Metodología propia
        </span>
      </div>
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Beneficios Premium</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-700 text-sm">
                <Zap className="text-brand-500 shrink-0 mt-0.5" size={16} />
                <span><strong>Acceso prioritario:</strong> Nuevos expedientes antes que el resto.</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700 text-sm">
                <Check className="text-brand-500 shrink-0 mt-0.5" size={16} />
                <span><strong>Selección experta:</strong> Solo activos con margen real de beneficio.</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700 text-sm">
                <AlertTriangle className="text-brand-500 shrink-0 mt-0.5" size={16} />
                <span><strong>Señales de riesgo:</strong> Alertas sobre posibles complicaciones jurídicas.</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center">
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              El canal premium ofrece una lectura técnica inicial. Para un análisis detallado del expediente judicial, solicita una consultoría personalizada.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <a 
            href="https://sublaunch.com/activosoffmarket" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-brand-600 text-white font-bold py-4 px-6 rounded-xl text-center hover:bg-brand-700 transition-all shadow-md flex items-center justify-center gap-2"
          >
            Acceder al Canal Premium <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PremiumValueBlock;
