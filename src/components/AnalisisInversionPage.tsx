import React, { useState } from 'react';
import { LineChart, ArrowRight } from 'lucide-react';
import FullAnalysisModal from './FullAnalysisModal';

const AnalisisInversionPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Análisis completo de inversión en subastas</h1>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Qué incluye</h2>
          <ul className="grid grid-cols-2 gap-4 text-sm text-slate-700">
            <li>✓ Rentabilidad</li>
            <li>✓ Comparables</li>
            <li>✓ Estrategia puja</li>
            <li>✓ Riesgos</li>
            <li>✓ Informe PDF</li>
          </ul>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-brand-700 text-white font-bold py-5 px-10 rounded-2xl transition-all text-lg shadow-lg"
        >
          Generar informe
        </button>
      </div>

      <FullAnalysisModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        auction={{ boeId: 'Dummy ID' }}
        marketValue={200000}
        savings={50000}
        discount={25}
        plan="pro"
      />
    </div>
  );
};

export default AnalisisInversionPage;
