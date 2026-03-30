import React, { useState } from 'react';
import { Shield, ArrowRight } from 'lucide-react';
import LoadAnalysisBlock from './LoadAnalysisBlock';

const AnalisisCargasPage: React.FC = () => {
  const [boeId, setBoeId] = useState('');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Análisis de cargas antes de pujar en subastas</h1>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Qué incluye</h2>
          <ul className="grid grid-cols-2 gap-4 text-sm text-slate-700">
            <li>✓ Hipotecas</li>
            <li>✓ Embargos</li>
            <li>✓ Ocupación</li>
            <li>✓ Riesgos registrales</li>
          </ul>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-12">
        <h3 className="text-xl font-bold mb-4">Analizar una subasta</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="URL BOE o ID subasta"
            value={boeId}
            onChange={(e) => setBoeId(e.target.value)}
            className="flex-1 p-4 rounded-xl border border-slate-300"
          />
        </div>
        {boeId && (
          <div className="mt-8">
            <LoadAnalysisBlock boeId={boeId} initialStep="upload" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalisisCargasPage;
