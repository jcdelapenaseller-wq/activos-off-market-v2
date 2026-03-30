import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LineChart, ArrowRight, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import FullAnalysisModal from './FullAnalysisModal';
import PaymentModal from './PaymentModal';
import { extractId } from '../utils/extractId';

const AnalisisInversionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [boeId, setBoeId] = useState('');
  const [processedId, setProcessedId] = useState('');
  const [isIdealista, setIsIdealista] = useState(false);

  const [autoStart, setAutoStart] = useState(false);

  useEffect(() => {
    const idParam = searchParams.get('id');
    const analysisStatus = searchParams.get('analysis');
    
    if (idParam) {
      setBoeId(idParam);
      const result = extractId(idParam);
      if (result.type === 'idealista') {
        setIsIdealista(true);
        setProcessedId('');
        setShowModal(false);
        setShowPaymentModal(false);
      } else {
        setIsIdealista(false);
        setProcessedId(result.value);
        
        // Check if paid
        let isPaid = analysisStatus === 'paid';
        if (!isPaid) {
          const paid = sessionStorage.getItem(`analysisPaid_${result.value}`);
          const timestamp = sessionStorage.getItem(`analysisPaid_${result.value}_time`);
          if (paid === 'true' && timestamp) {
            const hours = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
            if (hours < 24) isPaid = true;
          }
        }
        
        if (isPaid) {
          if (analysisStatus === 'paid') {
            sessionStorage.setItem(`analysisPaid_${result.value}`, 'true');
            sessionStorage.setItem(`analysisPaid_${result.value}_time`, Date.now().toString());
            // Clean URL
            const url = new URL(window.location.href);
            url.searchParams.delete('analysis');
            window.history.replaceState({}, '', url);
          }
          setAutoStart(true);
          setShowModal(true);
          setShowPaymentModal(false);
        } else {
          setShowPaymentModal(true);
          setShowModal(false);
        }
      }
    }
  }, [searchParams]);

  const handleAnalyze = () => {
    const result = extractId(boeId);
    if (result.type === 'idealista') {
      setIsIdealista(true);
      setProcessedId('');
      setShowModal(false);
      setShowPaymentModal(false);
    } else {
      setIsIdealista(false);
      setProcessedId(result.value);
      
      let isPaid = false;
      const paid = sessionStorage.getItem(`analysisPaid_${result.value}`);
      const timestamp = sessionStorage.getItem(`analysisPaid_${result.value}_time`);
      if (paid === 'true' && timestamp) {
        const hours = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
        if (hours < 24) isPaid = true;
      }

      if (isPaid) {
        setAutoStart(false);
        setShowModal(true);
        setShowPaymentModal(false);
      } else {
        setShowPaymentModal(true);
        setShowModal(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
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

      <div className="mb-16">
        <h3 className="text-3xl font-serif font-bold text-center text-slate-900 mb-8">Así es tu informe</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Rentabilidad estimada</h4>
            <p className="text-sm text-slate-600">Cálculo preciso del ROI y margen de beneficio esperado.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Riesgos detectados</h4>
            <p className="text-sm text-slate-600">Análisis de cargas, embargos y posibles problemas legales.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Estrategia de puja</h4>
            <p className="text-sm text-slate-600">Límites máximos recomendados para asegurar tu inversión.</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl max-w-3xl mx-auto relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 opacity-10 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 opacity-10 rounded-tr-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8 border-b border-slate-700 pb-4">
              <h4 className="text-xl font-serif font-bold">Resumen Ejecutivo</h4>
              <span className="bg-brand-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">CONFIDENCIAL</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Precio recomendado</p>
                <p className="text-2xl font-bold text-emerald-400">145.000 €</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Margen seguridad</p>
                <p className="text-2xl font-bold text-white">28%</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Cargas detectadas</p>
                <p className="text-lg font-bold text-red-400 mt-1">1 Hipoteca</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">ROI estimado</p>
                <p className="text-lg font-bold text-brand-400 mt-1">15.4% anual</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">¿Quieres este análisis para tu subasta?</h3>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              document.querySelector('input')?.focus();
            }}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl mb-3"
          >
            Generar análisis ahora
          </button>
          <p className="text-slate-500 font-medium mb-4">Desde 4,99€</p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-600 mb-10">
            <span className="flex items-center gap-1"><ArrowRight className="w-4 h-4 text-brand-600" /> Entrega inmediata</span>
            <span className="flex items-center gap-1"><ArrowRight className="w-4 h-4 text-brand-600" /> Sin suscripción</span>
            <span className="flex items-center gap-1"><ArrowRight className="w-4 h-4 text-brand-600" /> Informe en PDF</span>
          </div>

          <div className="pt-8 border-t border-slate-200 max-w-lg mx-auto">
            <p className="text-slate-700 font-medium mb-6">
              Usado por compradores e inversores para analizar subastas antes de pujar
            </p>
            <ul className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                Evita cargas ocultas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                Detecta riesgos legales
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                Decide tu puja con datos
              </li>
            </ul>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 max-w-md mx-auto">
            <p className="text-slate-500 text-sm mb-3">
              ¿Solo necesitas revisar cargas legales?
            </p>
            <Link 
              to="/analisis-cargas"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-all text-sm font-medium"
            >
              Solo análisis de cargas 2,99€
            </Link>
          </div>
        </div>
      </div>

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

      <FullAnalysisModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        auction={{ boeId: processedId || 'Dummy ID' }}
        marketValue={200000}
        savings={50000}
        discount={25}
        plan="pro"
        autoStart={autoStart}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        type="analysis"
        auctionId={processedId}
      />
    </div>
  );
};

export default AnalisisInversionPage;
