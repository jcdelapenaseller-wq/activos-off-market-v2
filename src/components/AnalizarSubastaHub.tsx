import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, LineChart, ArrowRight, Check } from 'lucide-react';
import { extractId } from '../utils/extractId';
import { useUser } from '../contexts/UserContext';

const AnalizarSubastaHub: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const { plan } = useUser();

  const handleAction = (type: 'cargas' | 'inversion') => {
    if (!inputValue.trim()) return;
    
    const result = extractId(inputValue);
    const id = result.value;
    
    if (type === 'cargas') {
      navigate(`/analisis-cargas?id=${id}`);
    } else {
      navigate(`/analisis-inversion?id=${id}`);
    }
  };

  const setExample = (val: string) => {
    setInputValue(val);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
          Analiza cualquier subasta antes de pujar
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Pega el enlace de la subasta y elige el nivel de profundidad que necesitas para tomar tu decisión de inversión.
        </p>
        
        <div className="max-w-2xl mx-auto relative group">
          <div className="relative flex items-center">
            <Search className="absolute left-5 text-slate-400 w-5 h-5 group-focus-within:text-brand-500 transition-colors" />
            <input
              type="text"
              placeholder="Pega enlace del BOE, Idealista o ID de subasta…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full h-16 pl-14 pr-36 rounded-2xl border-2 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 bg-white text-base md:text-lg shadow-sm transition-all placeholder:text-slate-400"
            />
            <button
              onClick={() => handleAction('inversion')}
              disabled={!inputValue.trim()}
              className="absolute right-2 h-12 px-6 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              Analizar
            </button>
          </div>

          {/* Micro confianza */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-[11px] md:text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Compatible con BOE
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Idealista
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Enlaces judiciales
            </span>
          </div>

          {/* Ejemplos */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
            <span className="text-sm text-slate-400">Ejemplos:</span>
            <button 
              onClick={() => setExample('https://subastas.boe.es/detalle_subasta.php?idSub=SUB-JA-2024-12345')}
              className="text-xs px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-full transition-colors border border-slate-200 shadow-sm"
            >
              BOE
            </button>
            <button 
              onClick={() => setExample('https://www.idealista.com/inmueble/12345678/')}
              className="text-xs px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-full transition-colors border border-slate-200 shadow-sm"
            >
              Idealista
            </button>
            <button 
              onClick={() => setExample('SUB-JA-2024-12345')}
              className="text-xs px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-full transition-colors border border-slate-200 shadow-sm"
            >
              ID: SUB-JA-2024-12345
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Análisis de Cargas */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
          <div className="mb-6">
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Análisis de cargas</h3>
            <p className="text-slate-600">Revisión legal para evitar sorpresas y deudas ocultas antes de participar.</p>
          </div>
          
          <div className="mb-8">
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-slate-900">
                {plan === 'free' ? '2,99€' : 'Incluido'}
              </span>
              {plan !== 'free' && (
                <span className="text-sm text-slate-500 font-medium">/ Crédito</span>
              )}
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-700">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Detección de hipotecas</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Embargos y deudas</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Riesgos de ocupación</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Recomendación legal</span>
              </li>
            </ul>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => handleAction('cargas')}
              disabled={!inputValue.trim()}
              className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group"
            >
              Analizar cargas
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Análisis Completo */}
        <div className="bg-slate-50 border-2 border-slate-900 rounded-3xl p-8 shadow-md hover:shadow-lg transition-all flex flex-col h-full relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-900 text-white text-xs font-bold rounded-full uppercase tracking-widest">
            Recomendado
          </div>
          
          <div className="mb-6">
            <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mb-4">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Análisis completo</h3>
            <p className="text-slate-600">La decisión inteligente. Rentabilidad, estrategia de puja y riesgos legales.</p>
          </div>
          
          <div className="mb-8">
            <div className="flex flex-col mb-4">
              <span className="text-sm text-slate-400 line-through font-medium mb-1">
                Valor estimado {plan === 'pro' ? '9,99€' : plan === 'basic' ? '19€' : '29€'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-brand-600">
                  {plan === 'pro' ? '0,99€' : plan === 'basic' ? '2,99€' : '4,99€'}
                </span>
              </div>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-700">
                <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <span className="font-medium">Todo lo del análisis de cargas</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <span>Rentabilidad estimada (ROI)</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <span>Estrategia de puja máxima</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <span>Comparables de mercado</span>
              </li>
            </ul>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => handleAction('inversion')}
              disabled={!inputValue.trim()}
              className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl"
            >
              Generar informe completo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalizarSubastaHub;
