import React from 'react';
import { AlertTriangle, Phone, ChevronRight } from 'lucide-react';
import { trackConversion } from '../utils/tracking';

interface Props {
  isHighUrgency: boolean;
  province: string;
  compact?: boolean;
}

const ConsultingCTA: React.FC<Props> = ({ isHighUrgency, province, compact = false }) => {
  return (
    <div className={`${compact ? 'my-8 p-6' : 'my-12 p-8'} rounded-3xl border-2 ${isHighUrgency ? 'bg-amber-50 border-amber-200' : 'bg-brand-50 border-brand-100'} shadow-sm`}>
      <div className={`flex flex-col ${compact ? 'md:flex-row items-start' : 'md:flex-row items-center'} justify-between gap-6 md:gap-8`}>
        <div className="flex-1">
          <h3 className={`${compact ? 'text-xl' : 'text-2xl'} font-bold mb-2 flex items-center gap-2 ${isHighUrgency ? 'text-amber-900' : 'text-slate-900'}`}>
            {isHighUrgency ? (
              <>
                <AlertTriangle className="text-amber-600 shrink-0" size={compact ? 22 : 28} />
                Anticípate: el éxito se decide antes de pujar
              </>
            ) : (
              "La rentabilidad se asegura antes de pujar"
            )}
          </h3>
          <p className={`${isHighUrgency ? 'text-amber-800' : 'text-slate-600'} ${compact ? 'text-sm' : 'font-medium'}`}>
            {isHighUrgency 
              ? "No esperes al último día. Un análisis temprano permite detectar riesgos que otros pasarán por alto." 
              : "Asegura tu inversión revisando el expediente judicial y la certificación de cargas con un experto."}
          </p>
        </div>
        <div className={`flex flex-col ${compact ? 'items-start md:items-center' : 'items-center'} gap-3`}>
          <a 
            href="https://calendly.com/activosoffmarket" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => trackConversion(province, 'ficha', 'consultoria')}
            className={`whitespace-nowrap ${compact ? 'px-6 py-3 text-base' : 'px-10 py-5 text-lg'} rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 ${
              isHighUrgency 
                ? 'bg-amber-600 text-white hover:bg-amber-700' 
                : 'bg-brand-700 text-white hover:bg-brand-800'
            }`}
          >
            <Phone size={compact ? 18 : 20} />
            Solicitar análisis
            <ChevronRight size={compact ? 18 : 20} />
          </a>
          {!compact && (
            <div className="flex flex-col items-center gap-1">
              <p className={`text-sm font-bold text-slate-600`}>
                Validar esto antes de pujar puede marcar la diferencia
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultingCTA;
