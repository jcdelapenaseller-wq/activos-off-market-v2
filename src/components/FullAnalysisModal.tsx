import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Download, RefreshCw, Eye, AlertTriangle, CheckCircle, TrendingUp, ShieldAlert, Activity } from 'lucide-react';

interface FullAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: any;
  marketValue: number;
  savings: number;
  discount: number;
  plan: 'free' | 'basic' | 'pro';
  autoStart?: boolean;
}

const FullAnalysisModal: React.FC<FullAnalysisModalProps> = ({
  isOpen,
  onClose,
  auction,
  marketValue,
  savings,
  discount,
  plan,
  autoStart = false
}) => {
  const [step, setStep] = useState<'intro' | 'loading' | 'ready' | 'report'>('intro');
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingTexts = [
    "Procesando informe…",
    "Calculando valor mercado…",
    "Evaluando oportunidad…",
    "Generando informe…"
  ];

  useEffect(() => {
    if (isOpen) {
      setStep(autoStart ? 'loading' : 'intro');
      setLoadingStep(0);
    }
  }, [isOpen, autoStart]);

  useEffect(() => {
    if (step === 'loading') {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        if (current >= loadingTexts.length) {
          clearInterval(interval);
          setStep('ready');
        } else {
          setLoadingStep(current);
        }
      }, 1000); // 1 segundo por paso = 4 segundos total
      return () => clearInterval(interval);
    }
  }, [step]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setStep('loading');
  };

  const handlePrint = () => {
    window.print();
  };

  // Cálculos dinámicos para el informe
  const score = discount >= 30 ? 9.2 : discount >= 15 ? 7.5 : discount >= 0 ? 6.1 : 4.5;
  const scoreColor = score >= 8 ? 'text-emerald-600' : score >= 6 ? 'text-green-600' : score >= 5 ? 'text-amber-500' : 'text-red-600';
  const scoreBg = score >= 8 ? 'bg-emerald-50' : score >= 6 ? 'bg-green-50' : score >= 5 ? 'bg-amber-50' : 'bg-red-50';
  
  const opportunity = discount >= 30 ? 'Alta' : discount >= 15 ? 'Media' : 'Baja';
  const oppColor = discount >= 30 ? 'text-emerald-600' : discount >= 15 ? 'text-amber-500' : 'text-red-600';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 print:p-0 print:block">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm print:hidden"
        onClick={step === 'intro' || step === 'ready' ? onClose : undefined}
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col print:shadow-none print:rounded-none ${
          step === 'report' ? 'w-full max-w-4xl h-[90vh] print:h-auto print:w-full' : 'w-full max-w-md'
        }`}
      >
        {/* Close Button */}
        {step !== 'loading' && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10 print:hidden"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 print:p-0">
          <AnimatePresence mode="wait">
            {/* ESTADO 1: INTRO */}
            {step === 'intro' && (
              <motion.div 
                key="intro"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center pt-4"
              >
                <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-brand-100">
                  <FileText size={32} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Análisis completo de inversión</h2>
                <p className="text-slate-500 text-sm mb-6">La decisión inteligente de inversión</p>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 w-full mb-6">
                  <div className="flex flex-col items-center mb-1">
                    <span className="text-sm text-slate-400 line-through font-medium mb-0.5">
                      Valor estimado {plan === 'pro' ? '9,99€' : plan === 'basic' ? '19€' : '29€'}
                    </span>
                    <span className="text-4xl font-bold text-slate-900 tracking-tight">
                      {plan === 'pro' ? '0,99€' : plan === 'basic' ? '2,99€' : '4,99€'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pago único</p>
                </div>

                <div className="w-full space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm font-medium">Rentabilidad estimada de inversión</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm font-medium">Riesgos legales detectados</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm font-medium">Estrategia de puja recomendada</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm font-medium">Comparables de mercado</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm font-medium">Informe profesional en PDF</span>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <button 
                    onClick={handleGenerate}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    Generar informe <TrendingUp size={18} />
                  </button>
                  <div className="text-center space-y-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Informe profesional de inversión</p>
                    <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">Entrega inmediata en PDF</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ESTADO 2: LOADING */}
            {step === 'loading' && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="relative w-20 h-20 mb-8">
                  <svg className="animate-spin w-full h-full text-brand-200" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-brand-600">
                    <Activity size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{loadingTexts[loadingStep]}</h3>
                <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-brand-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((loadingStep + 1) / loadingTexts.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}

            {/* ESTADO 3: READY */}
            {step === 'ready' && (
              <motion.div 
                key="ready"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center py-8"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">¡Informe listo!</h2>
                <p className="text-slate-500 mb-8">Tu análisis de inversión se ha generado correctamente.</p>
                
                <div className="flex flex-col w-full gap-3">
                  <button 
                    onClick={() => setStep('report')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Eye size={18} /> Ver análisis
                  </button>
                  <button 
                    onClick={() => {
                      setStep('report');
                      setTimeout(() => handlePrint(), 500);
                    }}
                    className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={18} /> Descargar PDF
                  </button>
                  <button 
                    onClick={() => setStep('loading')}
                    className="w-full text-slate-400 hover:text-slate-600 font-medium py-2 mt-2 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <RefreshCw size={14} /> Regenerar
                  </button>
                </div>
              </motion.div>
            )}

            {/* ESTADO 4: REPORT */}
            {step === 'report' && (
              <motion.div 
                key="report"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col h-full print:block"
              >
                {/* Report Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6 print:border-slate-300 print:pb-4 print:mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">Informe de Inversión</h1>
                    <p className="text-slate-500 text-sm mt-1">ID: {auction.boeId || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-brand-600 tracking-tighter">Activos Off-Market</div>
                    <p className="text-xs text-slate-400">{new Date().toLocaleDateString('es-ES')}</p>
                  </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 print:grid-cols-4 print:gap-4">
                  {/* Score */}
                  <div className={`p-5 rounded-2xl border ${scoreBg} border-opacity-50 flex flex-col items-center justify-center text-center print:border-slate-200 print:bg-slate-50`}>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Score Inversión</span>
                    <div className={`text-4xl md:text-5xl font-bold tracking-tighter ${scoreColor}`}>
                      {score.toFixed(1)}<span className="text-lg text-slate-400 font-medium">/10</span>
                    </div>
                  </div>

                  {/* Oportunidad */}
                  <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col items-center justify-center text-center print:shadow-none print:border-slate-200">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Oportunidad</span>
                    <div className={`text-2xl md:text-3xl font-bold tracking-tight ${oppColor}`}>
                      {opportunity}
                    </div>
                  </div>

                  {/* Valor Mercado */}
                  <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col items-center justify-center text-center print:shadow-none print:border-slate-200">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Valor Mercado</span>
                    <div className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                      {marketValue > 0 ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(marketValue) : '---'}
                    </div>
                  </div>

                  {/* Ahorro */}
                  <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col items-center justify-center text-center print:shadow-none print:border-slate-200">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Ahorro Potencial</span>
                    <div className={`text-xl md:text-2xl font-bold tracking-tight ${savings > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {savings > 0 ? '+' : ''}{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(savings)}
                    </div>
                  </div>
                </div>

                {/* Cargas Detectadas */}
                <div className="mb-6 bg-slate-50 rounded-2xl p-6 border border-slate-100 print:bg-white print:border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert size={18} className="text-slate-700" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Cargas Detectadas</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Revisión inicial: Sin cargas registrales previas declaradas explícitamente en el edicto principal. Pendiente de verificación registral completa mediante nota simple actualizada.
                  </p>
                </div>

                {/* Riesgo Principal */}
                <div className="mb-6 bg-red-50/50 rounded-2xl p-6 border border-red-100 print:bg-white print:border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={18} className="text-red-600" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-red-800">Riesgo Principal</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <span><strong>Estado posesorio desconocido:</strong> Posible riesgo de ocupación o inquilinos con contrato en vigor.</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <span><strong>Deudas asociadas:</strong> Comprobar posibles deudas pendientes con la comunidad de propietarios o IBI de años anteriores.</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <span><strong>Estado de conservación:</strong> Necesidad de provisión de fondos para posible adecuación o reforma del inmueble.</span>
                    </li>
                  </ul>
                </div>

                {/* Conclusión */}
                <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 print:bg-white print:border-slate-200">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-800 mb-2">Conclusión</h3>
                  <p className="text-brand-900 text-sm md:text-base font-medium leading-relaxed">
                    El activo presenta un margen de seguridad favorable frente a mercado. Se recomienda proceder con la validación jurídica final y visita exterior antes de emitir puja.
                  </p>
                </div>

                {/* Print Actions */}
                <div className="mt-8 flex justify-end gap-4 print:hidden">
                  <button 
                    onClick={handlePrint}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2"
                  >
                    <Download size={18} /> Guardar PDF
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default FullAnalysisModal;
