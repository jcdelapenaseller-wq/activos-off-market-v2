import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Shield, ArrowRight, AlertTriangle, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import LoadAnalysisBlock from './LoadAnalysisBlock';
import PaymentModal from './PaymentModal';
import { extractId } from '../utils/extractId';

const AnalisisCargasPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [boeId, setBoeId] = useState('');
  const [processedId, setProcessedId] = useState('');
  const [isIdealista, setIsIdealista] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaidState, setIsPaidState] = useState(false);
  const [initialAnalysisData, setInitialAnalysisData] = useState<any>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  const isReportReady = searchParams.get('report') === 'ready';

  useEffect(() => {
    const idParam = searchParams.get('id');
    const cargasStatus = searchParams.get('cargas');
    const reportReady = searchParams.get('report') === 'ready';

    // Check if we have data passed from the auction page
    if (location.state?.analysisResult) {
      setInitialAnalysisData(location.state.analysisResult);
    } else if (reportReady && idParam) {
      // Try to recover from session storage on reload
      const stored = sessionStorage.getItem(`analysisResult_${idParam}`);
      if (stored) {
        try {
          setInitialAnalysisData(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing stored analysis result", e);
        }
      }
    }

    if (idParam) {
      setBoeId(idParam);
      const result = extractId(idParam);
      if (result.type === 'idealista') {
        setIsIdealista(true);
        setProcessedId('');
        setShowPaymentModal(false);
      } else {
        setIsIdealista(false);
        setProcessedId(result.value);
        
        // Check if paid
        let isPaid = cargasStatus === 'paid' || reportReady;
        if (!isPaid) {
          const paid = sessionStorage.getItem(`cargasPaid_${result.value}`);
          const timestamp = sessionStorage.getItem(`cargasPaid_${result.value}_time`);
          if (paid === 'true' && timestamp) {
            const hours = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
            if (hours < 24) isPaid = true;
          }
        }
        
        if (isPaid) {
          setIsPaidState(true);
          if (cargasStatus === 'paid') {
            sessionStorage.setItem(`cargasPaid_${result.value}`, 'true');
            sessionStorage.setItem(`cargasPaid_${result.value}_time`, Date.now().toString());
            // Clean URL
            const url = new URL(window.location.href);
            url.searchParams.delete('cargas');
            window.history.replaceState({}, '', url);
          }
          setShowPaymentModal(false);
          
          if (reportReady) {
            setTimeout(() => {
              analysisRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        } else if (!reportReady) {
          setIsPaidState(false);
          setShowPaymentModal(true);
        }
      }
    }
  }, [searchParams, location.state]);

  const handleAnalyze = () => {
    const result = extractId(boeId);
    if (result.type === 'idealista') {
      setIsIdealista(true);
      setProcessedId('');
      setShowPaymentModal(false);
    } else {
      setIsIdealista(false);
      setProcessedId(result.value);
      
      let isPaid = false;
      const paid = sessionStorage.getItem(`cargasPaid_${result.value}`);
      const timestamp = sessionStorage.getItem(`cargasPaid_${result.value}_time`);
      if (paid === 'true' && timestamp) {
        const hours = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
        if (hours < 24) isPaid = true;
      }

      if (isPaid) {
        setIsPaidState(true);
        setShowPaymentModal(false);
        setTimeout(() => {
          analysisRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setIsPaidState(false);
        setShowPaymentModal(true);
      }
    }
  };

  return (
    <div className={`mx-auto px-4 py-12 ${isReportReady ? 'max-w-7xl' : 'max-w-4xl'}`}>
      {!isReportReady && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-16 text-center">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Pega el enlace de una subasta del BOE y analiza antes de pujar</h2>
          <p className="text-lg text-slate-600 mb-8">Detecta cargas, riesgos y rentabilidad en menos de 30 segundos</p>
          
          <div className="flex gap-4 max-w-lg mx-auto mb-2">
            <input
              type="text"
              placeholder="Pega aquí el enlace del BOE o ID de subasta"
              value={boeId}
              onChange={(e) => setBoeId(e.target.value)}
              className="flex-1 p-4 rounded-xl border border-slate-300"
            />
            <button
              onClick={handleAnalyze}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl transition-all"
            >
              Analizar esta subasta
            </button>
          </div>
          <p className="text-sm text-slate-500 text-left max-w-lg mx-auto mb-4">
            Ejemplo: https://subastas.boe.es/detalle_subasta.php?idSub=...
          </p>
          <p className="text-sm text-slate-600">
            También puedes pegar: <span className="font-bold">enlace Idealista, enlace BOE, ID subasta</span>
          </p>
        </div>
      )}

      {isReportReady && (
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold uppercase tracking-wider mb-6 border border-emerald-100">
            <ShieldCheck size={18} />
            Análisis Finalizado con Éxito
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">Informe de Cargas Registrales</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Revisión técnica detallada del expediente {processedId} realizada por nuestra IA especializada.
          </p>
        </div>
      )}

      {!isReportReady && (
        <div className="mb-16">
          <h3 className="text-3xl font-serif font-bold text-center text-slate-900 mb-8">Así es tu análisis de cargas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Hipotecas detectadas</h4>
              <p className="text-sm text-slate-600">Revisión de hipotecas previas y posteriores a la subasta.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Embargos y deudas</h4>
              <p className="text-sm text-slate-600">Identificación de embargos, deudas con la comunidad e IBI.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Riesgos ocupación</h4>
              <p className="text-sm text-slate-600">Análisis de la situación posesoria y posibles okupas o inquilinos.</p>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl max-w-3xl mx-auto relative overflow-hidden mb-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 opacity-10 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 opacity-10 rounded-tr-full"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8 border-b border-slate-700 pb-4">
                <h4 className="text-xl font-serif font-bold">Resumen de Cargas</h4>
                <span className="bg-brand-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">CONFIDENCIAL</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Cargas detectadas</p>
                  <p className="text-2xl font-bold text-red-400">2</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Deuda estimada</p>
                  <p className="text-2xl font-bold text-white">12.500 €</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Riesgo legal</p>
                  <p className="text-lg font-bold text-amber-400 mt-1">Medio</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Recomendación</p>
                  <p className="text-lg font-bold text-brand-400 mt-1">Pujar con descuento</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">¿Quieres revisar esta subasta?</h3>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                document.querySelector('input')?.focus();
              }}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl mb-3"
            >
              Analizar cargas ahora
            </button>
            <p className="text-slate-500 font-medium mb-4">Desde 2,99€</p>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-600 mb-10">
              <span className="flex items-center gap-1"><ArrowRight className="w-4 h-4 text-brand-600" /> Entrega inmediata</span>
              <span className="flex items-center gap-1"><ArrowRight className="w-4 h-4 text-brand-600" /> Sin suscripción</span>
              <span className="flex items-center gap-1"><ArrowRight className="w-4 h-4 text-brand-600" /> Informe en PDF</span>
            </div>
          </div>
        </div>
      )}

      {isIdealista && (
        <div className="bg-amber-50 p-8 rounded-3xl border border-amber-200 shadow-sm mb-12 text-center">
          <h3 className="text-xl font-bold text-amber-900 mb-4">No encontramos subasta</h3>
          <p className="text-amber-800 mb-6">¿Quieres análisis manual?</p>
          <a 
            href="https://calendly.com/activosoffmarket" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Solicitar análisis
          </a>
        </div>
      )}

      {processedId && !isIdealista && (
        <div ref={analysisRef} className={`bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-12 ${isReportReady ? 'shadow-xl' : ''}`}>
          <LoadAnalysisBlock 
            boeId={processedId} 
            initialStep={isReportReady ? 'result' : 'upload'} 
            isPaid={isPaidState}
            initialData={initialAnalysisData}
          />
        </div>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        type="cargas"
        auctionId={processedId}
      />
    </div>
  );
};

export default AnalisisCargasPage;
