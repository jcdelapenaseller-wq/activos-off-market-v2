import React from 'react';
import { X, FileText, TrendingUp } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'analysis' | 'cargas';
  auctionId: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, type, auctionId }) => {
  const { plan } = useUser();
  if (!isOpen) return null;

  const getStripeUrl = (targetType: 'analysis' | 'cargas') => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('analysis', 'unlocked');
    
    if (targetType === 'cargas') {
      return `https://buy.stripe.com/test_cargas?client_reference_id=${auctionId}&redirect_url=${encodeURIComponent(currentUrl.toString())}`;
    }

    // Dynamic pricing for analysis based on plan
    switch (plan) {
      case 'pro':
        return `https://buy.stripe.com/test_analysis_pro?client_reference_id=${auctionId}&redirect_url=${encodeURIComponent(currentUrl.toString())}`;
      case 'basic':
        return `https://buy.stripe.com/test_analysis_basic?client_reference_id=${auctionId}&redirect_url=${encodeURIComponent(currentUrl.toString())}`;
      default:
        return `https://buy.stripe.com/test_analysis_free?client_reference_id=${auctionId}&redirect_url=${encodeURIComponent(currentUrl.toString())}`;
    }
  };

  const getPrice = (targetType: 'analysis' | 'cargas') => {
    if (targetType === 'cargas') return '2,99€';
    switch (plan) {
      case 'pro': return '0,99€';
      case 'basic': return '2,99€';
      default: return '4,99€';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10">
          <X size={24} />
        </button>

        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-3">Elige tu nivel de análisis</h2>
            <p className="text-slate-500 text-lg">Evita riesgos y maximiza tu rentabilidad con datos precisos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: Cargas */}
            <div className={`relative p-8 rounded-2xl border-2 transition-all ${type === 'cargas' ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50/50'}`}>
              <div className="mb-6">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-4">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Análisis de Cargas</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Detecta hipotecas, embargos y riesgos registrales que subsisten tras la subasta.
                </p>
              </div>

              <ul className="space-y-3 mb-8 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Hipotecas y Embargos
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Riesgos de Ocupación
                </li>
                <li className="flex items-center gap-2 text-slate-400 line-through">
                  Valor de mercado y ROI
                </li>
              </ul>

              <div className="mt-auto">
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-slate-900">{getPrice('cargas')}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pago único</span>
                </div>
                <button 
                  onClick={() => window.location.href = getStripeUrl('cargas')}
                  className="w-full py-3 px-6 rounded-xl border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-50 transition-all"
                >
                  Seleccionar
                </button>
              </div>
            </div>

            {/* Option 2: Full Analysis (Upsell) */}
            <div className="relative p-8 rounded-2xl border-2 border-brand-500 bg-brand-50/30 shadow-xl shadow-brand-100/50">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                Recomendado
              </div>
              
              <div className="mb-6">
                <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-brand-200">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Informe Completo</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Todo lo anterior más valoración de mercado real, ROI estimado y estrategia de puja.
                </p>
              </div>

              <ul className="space-y-3 mb-8 text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                  Todo el Análisis de Cargas
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                  Valoración de Mercado IA
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                  Calculadora de Puja Máxima
                </li>
              </ul>

              <div className="mt-auto">
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-slate-900">{getPrice('analysis')}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pago único</span>
                </div>
                <button 
                  onClick={() => window.location.href = getStripeUrl('analysis')}
                  className="w-full py-4 px-6 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
                >
                  Elegir Informe Completo <TrendingUp size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-4">
              <span>Pago seguro vía Stripe</span>
              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
              <span>Entrega inmediata</span>
              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
              <span>Sin suscripciones</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
