import React from 'react';
import { Bell, ArrowRight, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { trackConversion, TrackingOrigin } from '../utils/tracking';

interface RadarPremiumCTAProps {
  location?: string;
  propertyType?: string;
  variant?: 'compact' | 'full' | 'bar' | 'minimal';
  origin?: TrackingOrigin;
}

const RadarPremiumCTA: React.FC<RadarPremiumCTAProps> = ({ 
  location, 
  propertyType, 
  variant = 'full',
  origin = 'ficha'
}) => {
  const title = (location && location !== 'España')
    ? `¿Quieres que te avisemos si aparecen oportunidades en ${location}?`
    : "¿Quieres que te avisemos si aparecen oportunidades en tu ciudad?";

  const handleTrack = () => {
    trackConversion(location || 'espana', origin, 'premium', { plan: 'radar_premium' });
  };

  if (variant === 'bar') {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 mb-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-brand-300 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 shrink-0 group-hover:scale-110 transition-transform">
            <Bell size={24} />
          </div>
          <div>
            <p className="text-slate-900 font-bold text-lg leading-tight">
              {title}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Ahorra horas infinitas revisando el BOE cada día y activa las alertas
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
          <Link 
            to={ROUTES.ALERTAS} onClick={handleTrack}
            className="w-full md:w-auto whitespace-nowrap px-8 py-3 bg-brand-600 text-white font-bold rounded-xl text-base hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-600/10"
          >
            Crear alerta gratis <ArrowRight size={18} />
          </Link>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            7 días gratis · luego 5€/mes
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
        <div className="relative z-10">
          <h3 className="font-serif text-xl font-bold text-slate-900 mb-2 leading-tight">
            {title}
          </h3>
          <p className="text-slate-600 text-sm mb-6">
            Ahorra horas infinitas revisando el BOE cada día y activa las alertas
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              to={ROUTES.ALERTAS} onClick={handleTrack}
              className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl text-sm hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-600/10"
            >
              Crear alerta gratis <ArrowRight size={16} />
            </Link>
            <Link 
              to={ROUTES.ALERTAS} className="text-center text-xs text-slate-400 hover:text-brand-600 underline underline-offset-4"
            >
              ¿cómo funciona?
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-600 rounded-full opacity-10 blur-2xl -mr-12 -mt-12"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center text-brand-400">
              <Bell size={20} />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-brand-400">Radar Premium</span>
          </div>
          <h3 className="font-serif text-lg font-bold mb-3 leading-tight">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold mb-4 bg-brand-400/10 py-1.5 px-3 rounded-full w-fit">
            <Zap size={12} fill="currentColor" />
            Recíbelas antes de que otros las vean
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Ahorra horas infinitas revisando el BOE cada día y activa las alertas
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-4">
            <Star size={10} className="text-brand-400" fill="currentColor" />
            <span>Usuarios ya reciben alertas cada día</span>
          </div>
          <Link 
            to={ROUTES.ALERTAS} onClick={handleTrack}
            className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl text-sm hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
          >
            7 días gratis <ArrowRight size={16} />
          </Link>
          <div className="mt-3 text-center space-y-1">
            <p className="text-[10px] text-slate-400">Después 5€/mes. Sin compromiso.</p>
            <p className="text-[9px] text-slate-500 italic">Cancela en 1 clic desde tu panel</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-brand-600" fill="currentColor" />
            <span className="text-xs font-bold tracking-widest uppercase text-brand-600">Servicio Exclusivo</span>
          </div>
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-brand-700 text-sm font-bold mb-6 bg-brand-50 py-2 px-4 rounded-full w-fit border border-brand-100">
            <Zap size={16} className="text-brand-600" fill="currentColor" />
            Recibe nuevas subastas antes de que otros las vean
          </div>
          <p className="text-slate-600 text-lg mb-6">
            Ahorra horas infinitas revisando el BOE cada día y activa las alertas
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400">
                  U{i}
                </div>
              ))}
            </div>
            <span className="font-medium">Inversores ya reciben alertas personalizadas cada día</span>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex flex-col items-center gap-4">
          <Link 
            to={ROUTES.ALERTAS} onClick={handleTrack}
            className="px-8 py-4 bg-brand-600 text-white font-bold rounded-2xl text-lg hover:bg-brand-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-600/20"
          >
            Probar 7 días gratis <ArrowRight size={20} />
          </Link>
          <div className="text-center">
            <p className="text-slate-500 text-sm font-bold">Después 5€/mes</p>
            <p className="text-slate-400 text-xs">Sin compromiso. Cancela en 1 clic.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarPremiumCTA;
