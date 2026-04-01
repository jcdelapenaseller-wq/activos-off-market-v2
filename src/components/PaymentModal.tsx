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

  const getPriceData = () => {
    const currentUrl = new URL(window.location.href);
    
    if (type === 'cargas') {
      currentUrl.searchParams.set('analysis', 'unlocked');
      return {
        price: '2,99€',
        url: `https://buy.stripe.com/test_cargas?client_reference_id=${auctionId}&redirect_url=${encodeURIComponent(currentUrl.toString())}`
      };
    }

    // Dynamic pricing for analysis based on plan
    currentUrl.searchParams.set('analysis', 'unlocked');
    switch (plan) {
      case 'pro':
        return {
          price: '0,99€',
          url: `https://buy.stripe.com/test_analysis_pro?client_reference_id=${auctionId}&redirect_url=${encodeURIComponent(currentUrl.toString())}`
        };
      case 'basic':
        return {
          price: '2,99€',
          url: `https://buy.stripe.com/test_analysis_basic?client_reference_id=${auctionId}&redirect_url=${encodeURIComponent(currentUrl.toString())}`
        };
      default:
        return {
          price: '4,99€',
          url: `https://buy.stripe.com/test_analysis_free?client_reference_id=${auctionId}&redirect_url=${encodeURIComponent(currentUrl.toString())}`
        };
    }
  };

  const priceData = getPriceData();

  const handlePay = () => {
    window.location.href = priceData.url;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 md:p-8 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10">
          <X size={20} />
        </button>
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-brand-100">
          <FileText size={32} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
          {type === 'analysis' ? 'Análisis completo de inversión' : 'Análisis de cargas registrales'}
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          {type === 'analysis' ? 'Desbloquea el informe detallado con valor de mercado, ROI y puja máxima.' : 'Desbloquea el análisis detallado de las cargas registrales de esta subasta.'}
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 w-full mb-8">
          <div className="flex flex-col items-center mb-1">
            {type === 'analysis' && (
              <span className="text-sm text-slate-400 line-through font-medium mb-0.5">
                Valor estimado {plan === 'pro' ? '9,99€' : plan === 'basic' ? '19€' : '29€'}
              </span>
            )}
            <span className="text-4xl font-bold text-slate-900 tracking-tight">
              {priceData.price}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pago único</p>
        </div>
        <div className="w-full space-y-4">
          <button 
            onClick={handlePay}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            Pagar ahora <TrendingUp size={18} />
          </button>
          <div className="text-center space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pago seguro vía Stripe</p>
            <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">Entrega inmediata en PDF</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
