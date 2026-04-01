import React from 'react';
import { X } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug?: string;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, slug }) => {
  if (!isOpen) return null;

  const handlePayment = () => {
    const currentUrl = new URL(window.location.href);
    if (slug) {
      currentUrl.pathname = `/subasta/${slug}`;
    }
    currentUrl.searchParams.set('analysis', 'unlocked');
    
    window.location.href = `https://buy.stripe.com/aFa14p7avcGl6dLa8MdjO04?client_reference_id=${slug || 'unknown'}&redirect_url=${encodeURIComponent(currentUrl.toString())}`;
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 text-center">
          Análisis jurídico profesional de cargas
        </h2>
        
        <div className="text-slate-600 mb-8 space-y-3">
          <p>Detectamos antes de pujar:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Cargas que subsisten</li>
            <li>Deudas ocultas</li>
            <li>Riesgo jurídico real</li>
            <li>Impacto económico</li>
            <li>Recomendación profesional</li>
          </ul>
        </div>

        <div className="text-center mb-8">
          <span className="text-4xl font-bold text-slate-900">2,99€</span>
          <span className="text-slate-500 ml-2">pago único</span>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={handlePayment}
            className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg"
          >
            Pagar ahora
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
