import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const CancelPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} />
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4">
          Pago cancelado
        </h1>
        <p className="text-slate-600 mb-8">
          El proceso de pago ha sido cancelado. No se ha realizado ningún cargo.
        </p>
        <Link 
          to="/pro"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={18} /> Volver a planes
        </Link>
      </div>
    </div>
  );
};

export default CancelPage;
