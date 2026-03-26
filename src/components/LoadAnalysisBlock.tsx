import React, { useState, useRef } from 'react';
import { ShieldAlert, UploadCloud, FileText, CheckCircle, AlertTriangle, Lock, Loader2, ArrowRight, ShieldCheck, FileWarning, Download, Info, Calculator, Calendar, Scale, ExternalLink, X, HelpCircle, FileSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { analyzeDocumentWithAI } from '../services/geminiService';

interface CargaDetectada {
  identificador_registral: string;
  tipo: string;
  fuente_textual: string;
  desglose: {
    principal: number;
    intereses: number;
    costas: number;
    total: number;
  };
  titular: string;
  rango: string;
  resultado: string;
  estado_carga: string;
  vigente: boolean;
  confianza: string;
}

interface AnalysisResult {
  razonamiento_juridico: string;
  fuente_documento: string;
  nivel_confianza_global: string;
  riesgo_global: 'BAJO' | 'MEDIO' | 'ALTO' | string;
  cargas_detectadas: CargaDetectada[];
  incoherencias_detectadas: string[];
  ocupacion_detectada: boolean;
  nivel_riesgo_ocupacion: string;
  peor_escenario: {
    principal: number;
    intereses: number;
    costas: number;
    total: number;
  };
  impacto_economico: {
    coste_estimado: number;
    nivel: string;
  };
  alertas: string[];
  recomendacion: string;
  // Datos de mercado opcionales
  ciudad?: string | null;
  codigo_postal?: string | null;
  superficie_m2?: number | null;
  valor_subasta?: number | null;
  valor_tasacion?: number | null;
  tipo_inmueble?: string | null;
  marketDataReady?: boolean;
}

interface LoadAnalysisBlockProps {
  boeId: string;
  boeUrl?: string;
  isIntegrated?: boolean;
}

const LoadAnalysisBlock: React.FC<LoadAnalysisBlockProps> = ({ boeId, boeUrl, isIntegrated = false }) => {
  const [step, setStep] = useState<'locked' | 'upload' | 'loading' | 'result'>('locked');
  const [files, setFiles] = useState<File[]>([]);
  const [resultData, setResultData] = useState<AnalysisResult | null>(null);
  const [showHowToModal, setShowHowToModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const finalBoeUrl = boeUrl || `https://subastas.boe.es/detalle_subasta.php?idSub=${boeId}`;

  const handleUnlock = () => {
    setStep('upload');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files!)]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAnalyze = () => {
    if (files.length === 0) return;
    window.location.href = 'https://buy.stripe.com/aFa14p7avcGl6dLa8MdjO04';
  };

  const getConfianzaExplanation = (nivel: string) => {
    if (nivel.includes('MUY ALTA')) return 'Basado en Certificación de Cargas reciente y Edicto.';
    if (nivel.includes('ALTA')) return 'Basado en Certificación de Cargas reciente.';
    if (nivel.includes('MEDIA')) return 'Basado en Nota Simple y Edicto. Faltan datos fehacientes de deuda.';
    if (nivel.includes('MUY BAJA')) return 'Basado solo en Edicto. Análisis ciego, alto riesgo.';
    if (nivel.includes('BAJA')) return 'Basado solo en Nota Simple. Riesgo de cargas ocultas o desactualizadas.';
    return 'Evaluación basada en los documentos aportados.';
  };

  return (
    <div className={`${isIntegrated ? '' : 'my-12 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden'}`}>
      {!isIntegrated && (
        <div className="bg-slate-900 px-8 py-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-brand-400" />
            <h2 className="font-serif font-bold text-lg">Análisis IA de Cargas Registrales</h2>
          </div>
          {step === 'locked' && (
            <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Premium
            </span>
          )}
        </div>
      )}

      <div className={`${isIntegrated ? 'p-0' : 'p-6 md:p-8'}`}>
        {step === 'locked' && (
          <div className="group/card cursor-pointer" onClick={handleUnlock}>
            <div className="flex flex-col md:flex-row gap-8 items-center py-1">
              {/* Left Side (70%) */}
              <div className="flex-[0.7] space-y-4">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100 group-hover/card:border-brand-200 group-hover/card:text-brand-500 transition-all duration-500">
                    <Scale size={26} strokeWidth={1.2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-slate-900 mb-0.5 tracking-tight">Análisis de cargas registrales</h3>
                    <p className="text-slate-500 text-sm font-medium leading-tight">Detecta hipotecas, embargos y riesgos ocultos antes de pujar</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Análisis conforme a normativa registral española vigente</p>
                    
                    <div className="flex items-center gap-2 mt-4 flex-wrap md:flex-nowrap">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/50 border border-emerald-100/50 text-[10px] font-bold text-emerald-600 uppercase tracking-wider whitespace-nowrap">
                        Nota simple <span className="opacity-60 font-medium text-[9px] lowercase italic ml-1">✓ recomendado</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/50 border border-emerald-100/50 text-[10px] font-bold text-emerald-600 uppercase tracking-wider whitespace-nowrap">
                        Certificación <span className="opacity-60 font-medium text-[9px] lowercase italic ml-1">✓ recomendado</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50/50 border border-slate-100/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        Edicto <span className="opacity-60 font-medium text-[9px] lowercase italic ml-1">opcional</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Side (30%) */}
              <div className="flex-[0.3] w-full md:w-auto flex flex-col items-center md:items-end gap-2.5">
                <div className="text-center md:text-right">
                  <div className="flex items-baseline justify-center md:justify-end gap-1.5">
                    <span className="text-xl font-bold text-slate-900 tracking-tight">2,99€</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">pago único</span>
                  </div>
                  <p className="text-[9px] text-slate-300 font-medium mt-0.5">Expediente {boeId}</p>
                </div>
                <button 
                  onClick={handleUnlock}
                  className="w-full bg-slate-900 text-white font-bold py-2 px-6 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 group/btn text-sm whitespace-nowrap"
                >
                  Analizar cargas →
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'upload' && (
          <div className="max-w-[980px] mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-1">Análisis de cargas registrales</h3>
              <p className="text-slate-500 text-base max-w-2xl mx-auto leading-tight mb-3">
                Detecta hipotecas, embargos y riesgos ocultos antes de pujar
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Basado en normativa registral española vigente</p>
              
              <p className="text-xs text-slate-600 mt-6 max-w-2xl mx-auto leading-relaxed font-medium">
                Recomendamos adjuntar Nota Simple o Certificación de cargas.<br />
                Opcionalmente puedes añadir el edicto para completar el análisis.<br />
                <span className="text-[10px] text-slate-400 uppercase tracking-tight">Máximo 2 documentos.</span>
              </p>

              <div className="flex justify-center gap-10 mt-10">
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50">
                    <FileText size={28} strokeWidth={1.5} />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Nota simple</p>
                    <p className="text-[10px] font-medium text-emerald-600 italic">Recomendado</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50">
                    <Scale size={28} strokeWidth={1.5} />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Certificación</p>
                    <p className="text-[10px] font-medium text-emerald-600 italic">Recomendado</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <FileWarning size={28} strokeWidth={1.5} />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Edicto</p>
                    <p className="text-[10px] font-medium text-slate-400 italic">Opcional</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Price Badge on Uploader - REMOVED FOR CLEANLINESS */}
              <div 
                className={`border-2 border-dashed rounded-[28px] p-10 transition-all duration-300 ${files.length > 0 ? 'border-brand-500 bg-brand-50/30' : 'border-slate-300 hover:border-brand-400 bg-white shadow-sm'}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  accept=".pdf" 
                  multiple
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {files.length > 0 ? (
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-600">
                        <FileText size={28} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-lg font-bold text-slate-900">{files.length} documento(s) listos</h4>
                        <p className="text-slate-500 text-xs">Preparados para el análisis jurídico</p>
                      </div>
                    </div>
                    
                    <div className="w-full max-w-md space-y-2 mb-6">
                      {files.map((f, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={idx} 
                          className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText size={14} className="text-brand-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-700 truncate">{f.name}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[9px] font-bold text-slate-400">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                              className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-brand-600 font-bold hover:text-brand-700 transition-colors flex items-center gap-2"
                    >
                      <UploadCloud size={14} /> Añadir más documentos
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center mb-4 text-slate-300 group-hover:bg-brand-50 group-hover:text-brand-500 transition-all duration-500 group-hover:scale-110">
                      <UploadCloud size={32} />
                    </div>
                    <p className="text-lg font-bold text-slate-900 mb-1">Haz clic o arrastra tus PDFs aquí</p>
                    <p className="text-xs text-slate-600 font-bold">Sube la Nota Simple, Certificación o Edicto</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Por solo</span>
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">2,99€</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest">Pago único por expediente</p>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={files.length === 0}
                className={`
                  w-full max-w-lg py-4 px-12 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-4 shadow-xl
                  ${files.length > 0 
                    ? 'bg-slate-900 text-white hover:bg-black shadow-slate-200 hover:-translate-y-0.5' 
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'}
                `}
              >
                Analizar cargas del inmueble <ArrowRight size={20} />
              </button>

              {/* Help Block */}
              <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center justify-center md:justify-start gap-2">
                    <HelpCircle size={16} className="text-brand-600" />
                    ¿No tienes la Nota Simple o Certificación?
                  </h4>
                  <p className="text-slate-600 text-xs font-medium">
                    Puedes descargarla desde la subasta del BOE con DNI o Cl@ve
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 shrink-0">
                  <a 
                    href={finalBoeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    Ver subasta en BOE <ExternalLink size={12} />
                  </a>
                  <button 
                    onClick={() => setShowHowToModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-md"
                  >
                    Cómo obtenerla <FileSearch size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="py-16 flex flex-col items-center text-center">
            <Loader2 size={48} className="text-brand-600 animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Procesando documento...</h3>
            <p className="text-slate-500 text-lg max-w-md">
              Nuestra IA está extrayendo el texto legal, cruzando datos y evaluando las cargas registrales.
            </p>
          </div>
        )}

        {step === 'result' && resultData && (
          <div className="space-y-8">
            {/* CTAs Section */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => alert("Abriendo calculadora de puja máxima...")}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-3 text-lg"
              >
                <Calculator size={24} />
                Calcular puja máxima segura
              </button>

              {(() => {
                const hasSubsistingCharges = resultData.cargas_detectadas.some(c => c.estado_carga === 'SUBSISTE');
                const isLowConfidence = resultData.nivel_confianza_global.includes('BAJA');
                const isHighRisk = resultData.riesgo_global === 'ALTO';
                const hasOccupancy = resultData.ocupacion_detectada;
                const uniqueProperties = new Set(resultData.cargas_detectadas.map(c => c.identificador_registral)).size;
                const hasMultipleProperties = uniqueProperties > 1;
                
                const shouldShowConsultingCta = hasOccupancy || hasSubsistingCharges || isLowConfidence || isHighRisk || hasMultipleProperties;

                if (!shouldShowConsultingCta) return null;

                return (
                  <a 
                    href="https://calendly.com/activosoffmarket" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold py-3 px-6 rounded-xl transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <div className="flex items-center gap-2 text-base">
                      <Calendar size={20} className="text-brand-600" />
                      Analizar esta subasta conmigo
                    </div>
                    <span className="text-xs text-slate-500 font-normal">Revisión jurídica y estrategia de puja</span>
                  </a>
                );
              })()}
            </div>

            {/* Context Header */}
            <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FileText size={16} className="text-slate-400" />
                <span>Fuente: <strong className="text-slate-900">{resultData.fuente_documento}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 group relative">
                <ShieldCheck size={16} className={resultData.nivel_confianza_global.includes('ALTA') ? 'text-emerald-500' : resultData.nivel_confianza_global.includes('MEDIA') ? 'text-amber-500' : 'text-orange-500'} />
                <span className="cursor-help border-b border-dashed border-slate-400">
                  Confianza IA: <strong className="text-slate-900">{resultData.nivel_confianza_global}</strong>
                </span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                  {getConfianzaExplanation(resultData.nivel_confianza_global)}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
            </div>

            {/* Incoherencias Críticas */}
            {resultData.incoherencias_detectadas && resultData.incoherencias_detectadas.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={20} className="text-amber-600" />
                  <h4 className="font-bold text-amber-900">Discrepancias en la documentación</h4>
                </div>
                <ul className="space-y-2">
                  {resultData.incoherencias_detectadas.map((incoherencia, idx) => (
                    <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="mt-1 text-amber-500">•</span>
                      <span>{incoherencia}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ocupación del Inmueble */}
            {resultData.ocupacion_detectada && (
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={20} className="text-slate-600" />
                  <h4 className="font-bold text-slate-900">Situación de posesión a revisar</h4>
                </div>
                <p className="text-sm text-slate-700 mb-2">
                  Se han encontrado indicios en la documentación de que el inmueble podría estar ocupado. En estos casos puede ser necesario gestionar la posesión tras la adjudicación.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Nivel de Riesgo:</span>
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    resultData.nivel_riesgo_ocupacion === 'ALTO' ? 'bg-amber-100 text-amber-700' :
                    resultData.nivel_riesgo_ocupacion === 'MEDIO' ? 'bg-slate-200 text-slate-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {resultData.nivel_riesgo_ocupacion}
                  </span>
                </div>
              </div>
            )}

            {/* Razonamiento Jurídico (Chain of Thought) */}
            {resultData.razonamiento_juridico && (
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={20} className="text-slate-600" />
                  <h4 className="font-bold text-slate-900">Razonamiento Jurídico (IA)</h4>
                </div>
                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {resultData.razonamiento_juridico}
                </div>
              </div>
            )}

            {/* Semaphore Header */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-6 ${
              resultData.riesgo_global === 'ALTO' ? 'bg-orange-50 border-orange-200 text-orange-900' :
              resultData.riesgo_global === 'MEDIO' ? 'bg-amber-50 border-amber-200 text-amber-900' :
              'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className={`p-4 rounded-full ${
                resultData.riesgo_global === 'ALTO' ? 'bg-orange-100 text-orange-600' :
                resultData.riesgo_global === 'MEDIO' ? 'bg-amber-100 text-amber-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
                {resultData.riesgo_global === 'ALTO' ? <ShieldAlert size={32} /> :
                 resultData.riesgo_global === 'MEDIO' ? <AlertTriangle size={32} /> :
                 <ShieldCheck size={32} />}
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-sm uppercase tracking-wider font-bold opacity-80 mb-1">Riesgo Global de la Operación</h3>
                <p className="text-3xl font-black">{resultData.riesgo_global}</p>
              </div>
              <div className="md:ml-auto text-center md:text-right w-full md:w-auto border-t md:border-t-0 md:border-l border-current/20 pt-4 md:pt-0 md:pl-6 mt-2 md:mt-0">
                <h3 className="text-sm uppercase tracking-wider font-bold opacity-80 mb-1">Peor Escenario Registral</h3>
                <p className="text-3xl font-black">{resultData.peor_escenario.total.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</p>
                <p className="text-xs opacity-80 mt-1 font-medium">Impacto: {resultData.impacto_economico.nivel}</p>
              </div>
            </div>

            {/* Cargas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Subsisting Charges (Bad) */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-2">
                  <FileWarning className="text-amber-600" size={20} />
                  <h4 className="font-bold text-amber-900">Cargas que SUBSISTEN</h4>
                </div>
                <div className="p-6">
                  {resultData.cargas_detectadas.filter(c => c.resultado.toUpperCase() === 'SUBSISTE').length > 0 ? (
                    <ul className="space-y-6">
                      {resultData.cargas_detectadas.filter(c => c.resultado.toUpperCase() === 'SUBSISTE').map((carga, idx) => (
                        <li key={idx} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-slate-900">{carga.identificador_registral} - {carga.tipo}</p>
                              <p className="text-sm text-slate-500">{carga.titular}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                  Rango: {carga.rango}
                                </span>
                                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  carga.confianza === 'ALTA' ? 'bg-emerald-100 text-emerald-700' :
                                  carga.confianza === 'MEDIA' ? 'bg-amber-100 text-amber-700' :
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                  Confianza: {carga.confianza}
                                </span>
                                {carga.estado_carga && (
                                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                    carga.estado_carga === 'SUBSISTE' ? 'bg-amber-100 text-amber-700' :
                                    carga.estado_carga === 'SE_CANCELA_EN_SUBASTA' ? 'bg-emerald-100 text-emerald-700' :
                                    carga.estado_carga === 'CANCELADA_REGISTRAL' ? 'bg-slate-200 text-slate-600' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {carga.estado_carga.replace(/_/g, ' ')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-black text-lg text-amber-700">{carga.desglose.total.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                          </div>
                          
                          {/* Desglose */}
                          <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-100">
                            <div className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                              <span className="text-slate-500">Principal:</span>
                              <span className="font-medium text-slate-700">{carga.desglose.principal.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                              <span className="text-slate-500">Intereses (est.):</span>
                              <span className="font-medium text-slate-700">{carga.desglose.intereses.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                              <span className="text-slate-500">Costas:</span>
                              <span className="font-medium text-slate-700">{carga.desglose.costas.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                            </div>
                          </div>
                          
                          {/* Fuente Textual */}
                          <div className="mt-3 bg-slate-100/50 rounded p-2 text-[10px] text-slate-500 italic border-l-2 border-slate-300">
                            "{carga.fuente_textual}"
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">No se han detectado cargas subsistentes.</p>
                  )}
                </div>
              </div>

              {/* Purged Charges (Good/Neutral) */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center gap-2">
                  <CheckCircle className="text-emerald-600" size={20} />
                  <h4 className="font-bold text-emerald-900">Cargas que se PURGAN, REEMPLAZAN o CANCELAN</h4>
                </div>
                <div className="p-6">
                  {resultData.cargas_detectadas.filter(c => c.resultado.toUpperCase() === 'SE PURGA' || c.resultado.toUpperCase() === 'REEMPLAZADA' || c.resultado.toUpperCase() === 'CANCELADA').length > 0 ? (
                    <ul className="space-y-6">
                      {resultData.cargas_detectadas.filter(c => c.resultado.toUpperCase() === 'SE PURGA' || c.resultado.toUpperCase() === 'REEMPLAZADA' || c.resultado.toUpperCase() === 'CANCELADA').map((carga, idx) => (
                        <li key={idx} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-slate-900">{carga.identificador_registral} - {carga.tipo}</p>
                              <p className="text-sm text-slate-500">{carga.titular}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                  Rango: {carga.rango}
                                </span>
                                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  carga.confianza === 'ALTA' ? 'bg-emerald-100 text-emerald-700' :
                                  carga.confianza === 'MEDIA' ? 'bg-amber-100 text-amber-700' :
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                  Confianza: {carga.confianza}
                                </span>
                                {carga.estado_carga && (
                                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                    carga.estado_carga === 'SUBSISTE' ? 'bg-amber-100 text-amber-700' :
                                    carga.estado_carga === 'SE_CANCELA_EN_SUBASTA' ? 'bg-emerald-100 text-emerald-700' :
                                    carga.estado_carga === 'CANCELADA_REGISTRAL' ? 'bg-slate-200 text-slate-600' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {carga.estado_carga.replace(/_/g, ' ')}
                                  </span>
                                )}
                                {carga.resultado.toUpperCase() === 'REEMPLAZADA' && (
                                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                    REEMPLAZADA
                                  </span>
                                )}
                                {carga.resultado.toUpperCase() === 'CANCELADA' && (
                                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                    CANCELADA
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-bold text-slate-400 line-through">{carga.desglose.total.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                          </div>
                          
                          {/* Desglose */}
                          <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-100 opacity-60">
                            <div className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                              <span className="text-slate-500">Principal:</span>
                              <span className="font-medium text-slate-700">{carga.desglose.principal.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                              <span className="text-slate-500">Intereses (est.):</span>
                              <span className="font-medium text-slate-700">{carga.desglose.intereses.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                              <span className="text-slate-500">Costas:</span>
                              <span className="font-medium text-slate-700">{carga.desglose.costas.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                            </div>
                          </div>
                          
                          {/* Fuente Textual */}
                          <div className="mt-3 bg-slate-100/50 rounded p-2 text-[10px] text-slate-500 italic border-l-2 border-slate-300 opacity-60">
                            "{carga.fuente_textual}"
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">No se han detectado cargas a purgar.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Unknown Charges (Critical) */}
            {resultData.cargas_detectadas.filter(c => c.resultado.toUpperCase() === 'DESCONOCIDO').length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mt-8">
                <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-2">
                  <AlertTriangle className="text-amber-600" size={20} />
                  <h4 className="font-bold text-amber-900">Cargas de Estado DESCONOCIDO (Requieren Revisión Manual)</h4>
                </div>
                <div className="p-6">
                  <ul className="space-y-6">
                    {resultData.cargas_detectadas.filter(c => c.resultado.toUpperCase() === 'DESCONOCIDO').map((carga, idx) => (
                      <li key={idx} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-slate-900">{carga.identificador_registral} - {carga.tipo}</p>
                            <p className="text-sm text-slate-500">{carga.titular}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                Rango: {carga.rango}
                              </span>
                              <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                carga.confianza === 'ALTA' ? 'bg-emerald-100 text-emerald-700' :
                                carga.confianza === 'MEDIA' ? 'bg-amber-100 text-amber-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                Confianza: {carga.confianza}
                              </span>
                              {carga.estado_carga && (
                                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  carga.estado_carga === 'SUBSISTE' ? 'bg-amber-100 text-amber-700' :
                                  carga.estado_carga === 'SE_CANCELA_EN_SUBASTA' ? 'bg-emerald-100 text-emerald-700' :
                                  carga.estado_carga === 'CANCELADA_REGISTRAL' ? 'bg-slate-200 text-slate-600' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {carga.estado_carga.replace(/_/g, ' ')}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-black text-lg text-amber-600">{carga.desglose.total.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                        </div>
                        
                        {/* Desglose */}
                        <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-100">
                          <div className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                            <span className="text-slate-500">Principal:</span>
                            <span className="font-medium text-slate-700">{carga.desglose.principal.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                            <span className="text-slate-500">Intereses (est.):</span>
                            <span className="font-medium text-slate-700">{carga.desglose.intereses.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                            <span className="text-slate-500">Costas:</span>
                            <span className="font-medium text-slate-700">{carga.desglose.costas.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                          </div>
                        </div>
                        
                        {/* Fuente Textual */}
                        <div className="mt-3 bg-amber-50/50 rounded p-2 text-[10px] text-amber-700 italic border-l-2 border-amber-300">
                          "{carga.fuente_textual}"
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Alerts & Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {resultData.alertas.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} /> Advertencias Jurídicas
                  </h4>
                  <ul className="space-y-3">
                    {resultData.alertas.map((adv, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-amber-800 text-sm leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {resultData.recomendacion && (
                <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6">
                  <h4 className="font-bold text-brand-900 mb-4 flex items-center gap-2">
                    <Info size={20} /> Recomendación del Analista IA
                  </h4>
                  <p className="text-brand-800 text-sm leading-relaxed italic border-l-2 border-brand-300 pl-4 whitespace-pre-line">
                    "{resultData.recomendacion}"
                  </p>
                </div>
              )}
            </div>

            {/* Download Action */}
            <div className="flex justify-center pt-4">
              <button className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2">
                <Download size={20} /> Descargar Informe PDF
              </button>
            </div>
          </div>
        )}
      </div>
      {/* How to Obtain Modal */}
      <AnimatePresence>
        {showHowToModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHowToModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                    <Download size={24} />
                  </div>
                  <button 
                    onClick={() => setShowHowToModal(false)}
                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Cómo obtener la documentación</h3>
                <p className="text-slate-500 text-sm mb-8">Sigue estos pasos para descargar los documentos oficiales desde el Portal de Subastas del BOE.</p>

                <div className="space-y-6">
                  {[
                    { step: 1, title: 'Entrar en subasta BOE', desc: 'Accede al enlace oficial de la subasta desde esta ficha.', link: true },
                    { step: 2, title: 'Identificarse', desc: 'Utiliza tu certificado digital, DNI electrónico o Cl@ve.' },
                    { step: 3, title: 'Pestaña Documentación', desc: 'Busca la pestaña de documentos en el menú lateral o superior.' },
                    { step: 4, title: 'Descargar archivos', desc: 'Descarga la Nota Simple, Certificación de Cargas o el Edicto.' },
                    { step: 5, title: 'Subir aquí', desc: 'Vuelve a esta pantalla y arrastra los archivos descargados.' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900 mb-0.5">{item.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mb-1">{item.desc}</p>
                        {item.link && (
                          <a 
                            href={finalBoeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-600 hover:text-brand-700 transition-colors"
                          >
                            Abrir subasta en BOE <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col gap-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">¿Tienes dudas?</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a 
                      href="mailto:contacto@activosoffmarket.es" 
                      className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"
                    >
                      <X size={14} className="rotate-45" /> contacto@activosoffmarket.es
                    </a>
                    <a 
                      href="https://t.me/activosOffmarket" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-white bg-[#0088cc] hover:bg-[#0077b5] px-4 py-2 rounded-xl transition-colors"
                    >
                      Telegram
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadAnalysisBlock;
