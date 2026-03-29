import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle, Info, ArrowRight, BookOpen, Mail, Lock, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { trackConversion } from '../utils/tracking';
import { subscribeToMailerLite } from '../utils/mailerlite';
import { useUser } from '../contexts/UserContext';

const ITP_RATES: Record<string, number> = {
  'Madrid': 0.06,
  'Andalucía': 0.07,
  'Cataluña': 0.10,
  'Valencia': 0.10,
  'Castilla y León': 0.08,
  'Galicia': 0.10,
  'País Vasco': 0.04,
  'Baleares': 0.08,
  'Canarias': 0.065,
  'Murcia': 0.08,
  'Aragón': 0.08,
  'Castilla La Mancha': 0.09,
  'Extremadura': 0.08,
  'Asturias': 0.08,
  'Cantabria': 0.09,
  'Navarra': 0.06,
  'La Rioja': 0.07,
};

interface AuctionCalculatorProps {
  appraisalValue?: number;
  claimedDebt?: number;
  surface?: number;
  city?: string;
  onClose?: () => void;
}

const AuctionCalculator: React.FC<AuctionCalculatorProps> = ({ 
  appraisalValue, 
  claimedDebt, 
  surface, 
  city,
  onClose 
}) => {
  useEffect(() => {
    if (appraisalValue) setTasacionBOE(appraisalValue);
    if (claimedDebt) setDeudas(claimedDebt);
    if (city) {
      // Find matching community if possible
      const match = Object.keys(ITP_RATES).find(c => city.toLowerCase().includes(c.toLowerCase()));
      if (match) setComunidad(match);
    }
  }, [appraisalValue, claimedDebt, city]);

  useEffect(() => {
    document.title = "Calculadora de Rentabilidad en Subastas Judiciales | ROI e ITP";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Calcula la rentabilidad real de una subasta judicial: ITP por comunidad autónoma, costes ocultos, ROI y precio máximo de puja según la regla del 70%.");

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "name": "Calculadora de Rentabilidad para Subastas Judiciales",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "description": "Herramienta para calcular rentabilidad, ITP, ROI y precio máximo de puja en subastas judiciales en España.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
          }
        },
        {
          "@type": "Article",
          "headline": "Calculadora de Rentabilidad para Subastas Judiciales",
          "description": "Calcula el ROI, beneficio neto y puja máxima recomendada para tus inversiones en subastas del BOE.",
          "image": ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200&h=630"],
          "datePublished": "2024-01-15T09:00:00+01:00",
          "dateModified": new Date().toISOString(),
          "author": {
            "@type": "Person",
            "name": "José de la Peña",
            "url": "https://activosoffmarket.es/quien-soy"
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://activosoffmarket.es/calculadora-subastas"
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "¿Cómo calcular la rentabilidad de una subasta judicial?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Para calcular la rentabilidad real debes comparar el valor de mercado actual del inmueble con el coste total de la inversión. Este coste incluye el precio de adjudicación, el ITP (que varía según la comunidad autónoma), gastos de reforma, notaría, registro y posibles cargas anteriores o deudas de comunidad. Nuestra calculadora de subastas te permite estimar todos estos valores automáticamente."
              }
            },
            {
              "@type": "Question",
              "name": "¿Cuánto dinero necesito para participar en una subasta judicial?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Para participar necesitas inicialmente el 5% del valor de tasación del bien en concepto de consignación o depósito. Si resultas adjudicatario, deberás abonar el resto del precio de adjudicación en el plazo legal (normalmente 40 días hábiles en subastas judiciales) más los impuestos y gastos asociados."
              }
            },
            {
              "@type": "Question",
              "name": "¿Qué impuestos se pagan al comprar en una subasta judicial?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "El impuesto principal es el ITP (Impuesto de Transmisiones Patrimoniales). El tipo impositivo depende de la Comunidad Autónoma donde se encuentre el inmueble, oscilando generalmente entre el 4% y el 10%. En subastas judiciales no se suele pagar IVA, salvo en casos muy específicos de ejecuciones entre empresas."
              }
            },
            {
              "@type": "Question",
              "name": "¿Cómo calcular la puja máxima en una subasta?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "La puja máxima se calcula restando del valor de mercado real todos los costes previstos (impuestos, reformas, cargas, gastos) y aplicando un margen de seguridad mínimo (beneficio deseado). Una regla común es no superar el 70% del valor de mercado tras descontar todos los gastos."
              }
            }
          ]
        }
      ]
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  const [adjudicacion, setAdjudicacion] = useState<number>(0);
  const [valorMercado, setValorMercado] = useState<number>(0);
  const [tasacionBOE, setTasacionBOE] = useState<number>(0);
  const [reforma, setReforma] = useState<number>(0);
  const [comunidad, setComunidad] = useState<string>('Madrid');
  const [deudas, setDeudas] = useState<number>(0);
  const [otrosGastos, setOtrosGastos] = useState<number>(0);
  const [ibi, setIbi] = useState<number>(0);
  const [deudaComunidad, setDeudaComunidad] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const { plan: currentPlan, isBasicUser, isProUser } = useUser();
  const navigate = useNavigate();
  
  const isPro = isBasicUser() || isProUser();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Load from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('precio')) setAdjudicacion(Number(params.get('precio')));
    if (params.get('mercado')) setValorMercado(Number(params.get('mercado')));
    if (params.get('tasacion')) setTasacionBOE(Number(params.get('tasacion')));
    if (params.get('reforma')) setReforma(Number(params.get('reforma')));
    
    // New params
    if (params.get('appraisalValue')) setTasacionBOE(Number(params.get('appraisalValue')));
    if (params.get('city')) setComunidad(params.get('city') || 'Madrid');
    if (params.get('marketPrice')) setValorMercado(Number(params.get('marketPrice')));
    
    if (params.get('ccaa')) setComunidad(params.get('ccaa') || 'Madrid');
    else if (params.get('comunidad')) setComunidad(params.get('comunidad') || 'Madrid');
    if (params.get('deudas')) setDeudas(Number(params.get('deudas')));
    if (params.get('otros')) setOtrosGastos(Number(params.get('otros')));
  }, []);

  const results = useMemo(() => {
    const n = (val: number) => isNaN(val) ? 0 : val;
    const adj = n(adjudicacion);
    const mkt = n(valorMercado);
    const ref = n(reforma);
    const dbt = n(deudas);
    const oth = n(otrosGastos);
    const i = n(ibi);
    const dc = n(deudaComunidad);

    const itpRate = ITP_RATES[comunidad] || 0.08;
    const itp = adj * itpRate;
    const registroNotaria = adj * 0.012;
    const gestoria = 500;
    const costeTotalInversion = adj + itp + registroNotaria + gestoria + ref + dbt + oth + i + dc;
    const beneficio = mkt - costeTotalInversion;
    const roi = costeTotalInversion > 0 ? (beneficio / costeTotalInversion) * 100 : 0;
    const precioMaxPuja = (mkt * 0.7) - (itp + registroNotaria + gestoria + ref + dbt + oth + i + dc);
    const margenSeguridad = mkt * 0.3;
    const escenarioConservador = beneficio - (ref * 0.2) - (costeTotalInversion * 0.03);
    const escenarioOptimista = beneficio + (ref * 0.1);
    
    return { itp, registroNotaria, gestoria, costeTotalInversion, beneficio, roi, precioMaxPuja, margenSeguridad, escenarioConservador, escenarioOptimista };
  }, [adjudicacion, valorMercado, reforma, comunidad, deudas, otrosGastos, ibi, deudaComunidad]);

  const hasData = adjudicacion > 0 || valorMercado > 0 || tasacionBOE > 0 || reforma > 0 || deudas > 0;
  const isDataIncoherent = hasData && valorMercado > 0 && (
    reforma >= valorMercado ||
    adjudicacion >= valorMercado * 2 ||
    deudas >= valorMercado
  );

  const getRoiStatus = (roi: number, beneficio: number) => {
    if (!hasData) return { label: 'Introduce los datos de la subasta para calcular el margen de seguridad de la inversión.', traffic: 'bg-slate-200', alert: '' };
    if (beneficio < 0) return { color: 'text-red-600', label: 'Pérdida estimada', bg: 'bg-red-100', traffic: 'bg-red-600', alert: 'Estás pagando de más. Operación en pérdidas.' };
    if (roi > 20) return { color: 'text-emerald-600', label: 'Alto margen de seguridad', bg: 'bg-emerald-100', traffic: 'bg-emerald-500', alert: 'Operación sólida. Tienes margen para imprevistos.' };
    if (roi >= 10) return { color: 'text-amber-600', label: 'Margen ajustado', bg: 'bg-amber-100', traffic: 'bg-amber-500', alert: 'Margen muy ajustado. Cualquier desvío en la reforma puede eliminar tu beneficio.' };
    return { color: 'text-red-600', label: 'Margen bajo', bg: 'bg-red-100', traffic: 'bg-red-500', alert: 'Riesgo alto. El beneficio no justifica la inmovilización del capital.' };
  };

  const getProBadgeText = () => {
    if (currentPlan === 'pro') return 'Plan PRO activo';
    if (currentPlan === 'basic') return 'Plan BASIC activo';
    return '';
  };

  const roiStatus = getRoiStatus(results.roi, results.beneficio);

  const chartData = useMemo(() => {
    if (isMobile) {
      return [
        { 
          name: 'Coste Total', 
          Total: results.costeTotalInversion,
          Adjudicación: 0,
          Impuestos: 0,
          Reforma: 0,
          Deudas: 0,
          Otros: 0,
          'Valor Mercado': 0
        },
        { 
          name: 'Valor Mercado', 
          Total: 0,
          Adjudicación: 0,
          Impuestos: 0,
          Reforma: 0,
          Deudas: 0,
          Otros: 0,
          'Valor Mercado': valorMercado
        },
      ];
    }
    return [
      { 
        name: 'Tu Inversión', 
        Total: 0,
        Adjudicación: adjudicacion,
        Impuestos: results.itp + results.registroNotaria + results.gestoria,
        Reforma: reforma,
        Deudas: deudas + ibi + deudaComunidad,
        Otros: otrosGastos,
        Beneficio: results.beneficio > 0 ? results.beneficio : 0,
        Pérdida: 0,
        'Valor Mercado': 0
      },
      { 
        name: 'Valor Mercado', 
        Total: 0,
        Adjudicación: 0,
        Impuestos: 0,
        Reforma: 0,
        Deudas: 0,
        Otros: 0,
        Beneficio: 0,
        'Valor Mercado': valorMercado,
        Pérdida: results.beneficio < 0 ? Math.abs(results.beneficio) : 0,
      },
    ];
  }, [adjudicacion, valorMercado, reforma, deudas, ibi, deudaComunidad, otrosGastos, results, isMobile]);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-12 pt-12">
      <div className="mb-12">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-6">
          {hasData ? "Estás analizando esta subasta. Ajusta tu rentabilidad" : "Calculadora de Rentabilidad para Subastas Judiciales"}
        </h1>
        <p className="text-lg text-slate-600">Herramienta gratuita para calcular rentabilidad, ITP, costes y precio máximo de puja en subastas judiciales en España.</p>
      </div>

      {/* Main Result Highlight - High Visibility */}
      {isDataIncoherent && (
        <div className="mb-8 bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start gap-4 text-red-700 shadow-sm">
          <AlertTriangle className="shrink-0 mt-0.5" size={24} />
          <div>
            <p className="font-bold text-lg">Revisa los valores introducidos</p>
            <p className="opacity-90 mt-1">Los datos actuales (reforma, deudas o adjudicación muy superiores al valor de mercado) generan resultados irreales.</p>
          </div>
        </div>
      )}

      {hasData && (
        <div className="mb-12 bg-gradient-to-br from-brand-900 to-slate-900 text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-brand-800/50">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px] opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px] opacity-20"></div>
          
          {isPro && (
            <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1.5 rounded-full font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
              <CheckCircle size={14} /> {getProBadgeText()}
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center text-center mb-10 border-b border-white/10 pb-10">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 text-slate-200 rounded-full text-sm font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Lock size={14} className="text-amber-400" /> Puja Máxima Recomendada (PMR)
            </span>
            {isPro ? (
              <>
                <div className="text-6xl md:text-7xl font-bold mb-4 text-emerald-400 tracking-tighter drop-shadow-lg">
                  {results.precioMaxPuja.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}
                </div>
                <p className="text-slate-300 text-lg font-medium">Este número decide si ganas o pierdes.</p>
                <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">Por encima de este precio empiezas a perder dinero.</p>
              </>
            ) : (
              <div id="pro-plans-block" className="flex flex-col items-center w-full max-w-4xl mx-auto">
                <div className="text-6xl md:text-7xl font-bold mb-4 text-white/20 tracking-tighter blur-[8px] select-none">
                  € 145.000
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">Aquí ves si esta subasta tiene margen real</h3>
                <p className="text-slate-300 text-lg mb-10 text-center">Tu resultado real depende de tu puja. Desbloquea el escenario completo.</p>
                
                <button 
                  onClick={() => navigate('/pro')}
                  className="bg-brand-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-brand-500 transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2 w-full max-w-md text-lg"
                >
                  <Lock size={20} />
                  Desbloquear calculadora completa
                </button>
                
                <div className="mt-6 flex flex-col items-center gap-3">
                  <p className="text-slate-300 text-sm font-bold uppercase tracking-widest">Con BASIC verás:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full border border-white/20">ROI estimado</span>
                    <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full border border-white/20">Margen de seguridad</span>
                    <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full border border-white/20">Costes reales</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-2">
                  <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    Usado por inversores para evitar pagar de más en subastas
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center text-center">
            <div className="md:col-span-1 md:border-r md:border-white/10">
              <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 text-brand-100 rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                Beneficio Neto
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-1 tracking-tight">
                {results.beneficio.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}
              </h2>
            </div>
            
            <div className="md:col-span-1 flex flex-col items-center">
              <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 text-brand-100 rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                ROI Estimado
              </span>
              <div className="text-3xl md:text-4xl font-bold mb-1 tracking-tighter drop-shadow-lg flex items-center gap-3">
                {results.roi.toFixed(1)}<span className="text-xl md:text-2xl opacity-60 font-medium">%</span>
                <div className={`w-3 h-3 rounded-full ${roiStatus.traffic} shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-pulse`}></div>
              </div>
              <div className="mt-4 flex flex-col items-center gap-1">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  Estimación — el resultado real depende de tu puja y estrategia
                </p>
                {!isPro && (
                  <p className="text-[10px] text-brand-400 uppercase tracking-widest font-bold">
                    Versión PRO muestra el cálculo real con todos los costes
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intro Banner */}
      {!hasData && (
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-3">
            Analiza esta subasta en segundos
          </h2>
          <p className="text-lg text-slate-600 mb-6">
            Calcula rentabilidad, costes reales y tu puja máxima antes de decidir.
          </p>
          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full text-sm font-medium text-slate-500">
            <CheckCircle size={16} className="text-emerald-500" />
            Sin registro · Resultado inmediato
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Datos de la Subasta</h2>
                <p className="text-slate-600">Ajusta los valores para ver cómo cambia tu rentabilidad.</p>
              </div>
              <div className="bg-brand-50 p-3 rounded-2xl">
                <Calculator className="text-brand-600" size={24} />
              </div>
            </div>

            {/* Juega con los números block */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-dashed border-slate-300 mb-6">
              <p className="text-slate-900 font-bold flex items-center gap-2">
                <TrendingUp size={18} className="text-brand-600" />
                ¿Y si la reforma cambia? ¿Y si pujas más?
              </p>
              <p className="text-sm text-slate-600 mt-1">Modifica los inputs de abajo para ver el impacto real en tu margen.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: 'Precio adjudicación', value: adjudicacion, setter: setAdjudicacion },
                { label: 'Valor mercado estimado', value: valorMercado, setter: setValorMercado },
                { label: 'Valor de tasación BOE', value: tasacionBOE, setter: setTasacionBOE },
                { label: 'Coste reforma', value: reforma, setter: setReforma },
                { label: 'Deuda IBI (4 años)', value: ibi, setter: setIbi, isProOnly: true },
                { label: 'Deuda Comunidad (3 años)', value: deudaComunidad, setter: setDeudaComunidad, isProOnly: true },
                { label: 'Deudas heredadas', value: deudas, setter: setDeudas },
                { label: 'Otros gastos', value: otrosGastos, setter: setOtrosGastos },
              ].map((input, i) => (
                <div key={i} className="relative">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    {input.label}
                    {input.isProOnly && !isPro && <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">PRO</span>}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={input.value || ''} 
                      onChange={(e) => input.setter(Number(e.target.value))} 
                      disabled={input.isProOnly && !isPro}
                      className={`w-full p-3 pl-4 pr-10 rounded-xl border transition-all outline-none text-slate-900 font-medium ${input.isProOnly && !isPro ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-200 hover:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500'}`} 
                      placeholder="0"
                    />
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-medium ${input.isProOnly && !isPro ? 'text-slate-300' : 'text-slate-400'}`}>€</span>
                    {input.isProOnly && !isPro && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          const plansBlock = document.getElementById('pro-plans-block');
                          if (plansBlock) {
                            plansBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className="absolute inset-0 z-10 flex items-center justify-center opacity-0 hover:opacity-100 bg-white/60 backdrop-blur-[1px] rounded-xl transition-opacity w-full h-full"
                      >
                        <span className="bg-white text-brand-600 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">👉 Ver mi límite de puja</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Comunidad Autónoma (Cálculo de ITP)</label>
                <select value={comunidad} onChange={(e) => setComunidad(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none text-slate-900 font-medium cursor-pointer">
                  {Object.keys(ITP_RATES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Simulador de Puja */}
            {hasData && (
              <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <TrendingUp className="text-brand-600" size={20} />
                  Simulador de Puja
                </h3>
                <p className="text-sm text-slate-500 mb-4 font-medium">Aquí es donde la mayoría se equivoca.</p>
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                    <span>0 €</span>
                    <span className="text-brand-700 font-bold">{adjudicacion.toLocaleString('es-ES')} €</span>
                    <span>{valorMercado > 0 ? valorMercado.toLocaleString('es-ES') : '1.000.000'} €</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={valorMercado > 0 ? valorMercado : 1000000} 
                    step="1000"
                    value={adjudicacion}
                    onChange={(e) => setAdjudicacion(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Beneficio</div>
                    <div className={`font-bold ${results.beneficio > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {results.beneficio.toLocaleString('es-ES', {maximumFractionDigits: 0})} €
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">ROI</div>
                    <div className={`font-bold ${results.roi >= 10 ? 'text-emerald-600' : results.roi > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                      {results.roi.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Margen</div>
                    <div className={`font-bold ${results.beneficio > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {valorMercado > 0 ? ((results.beneficio / valorMercado) * 100).toFixed(1) : '0.0'}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`flex items-center gap-5 p-6 rounded-3xl border ${hasData ? roiStatus.bg + ' border-transparent' : 'bg-white border-slate-200'} shadow-sm transition-colors duration-300`}>
            <div className={`relative flex items-center justify-center w-16 h-16 rounded-full ${roiStatus.traffic} shrink-0 shadow-inner`}>
              {hasData && (
                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white"></div>
              )}
              <div className="w-6 h-6 bg-white rounded-full opacity-90 shadow-sm"></div>
            </div>
            <div>
                <h3 className={`text-xl font-bold ${roiStatus.color || 'text-slate-900'}`}>
                  {roiStatus.label}
                </h3>
                <p className={`text-sm mt-1 ${roiStatus.color ? roiStatus.color + ' opacity-80' : 'text-slate-600'}`}>
                  {roiStatus.alert || 'Basado en el ROI estimado y el margen de seguridad de la operación.'}
                </p>
                {hasData && (roiStatus.label === 'Margen bajo' || roiStatus.label === 'Pérdida estimada') && (
                  <Link 
                    to={ROUTES.CONSULTORIA} 
                    onClick={() => trackConversion(comunidad, 'calculator', 'consultoria', { roi: results.roi.toFixed(1), precio: adjudicacion, tipo_subasta: 'Judicial' })}
                    className="mt-4 inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 gap-2 w-full sm:w-auto"
                  >
                    Validar esta oportunidad con un experto
                  </Link>
                )}
            </div>
          </div>



          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorBeneficio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.4}/>
                      </linearGradient>
                      <linearGradient id="colorMercado" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                      </linearGradient>
                      <linearGradient id="colorPerdida" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{fontSize: isMobile ? 12 : 14}} />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} tick={{fontSize: isMobile ? 10 : 12}} />
                    <Tooltip formatter={(value: any) => typeof value === 'number' ? value.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : value}/>
                    {!isMobile && <Legend />}
                    {!isMobile ? (
                      <>
                        <Bar dataKey="Adjudicación" stackId="a" fill="#0f172a" animationDuration={1000} />
                        <Bar dataKey="Impuestos" stackId="a" fill="#334155" animationDuration={1000} />
                        <Bar dataKey="Reforma" stackId="a" fill="#475569" animationDuration={1000} />
                        <Bar dataKey="Deudas" stackId="a" fill="#64748b" animationDuration={1000} />
                        <Bar dataKey="Otros" stackId="a" fill="#94a3b8" animationDuration={1000} />
                        <Bar dataKey="Beneficio" stackId="a" fill="url(#colorBeneficio)" animationDuration={1000} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Valor Mercado" stackId="b" fill="url(#colorMercado)" animationDuration={1000} radius={results.beneficio < 0 ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
                        <Bar dataKey="Pérdida" stackId="b" fill="url(#colorPerdida)" animationDuration={1000} radius={[4, 4, 0, 0]} />
                      </>
                    ) : (
                      <>
                        <Bar dataKey="Total" fill="#0f172a" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Valor Mercado" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={1000} />
                      </>
                    )}
                </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ESCENARIOS PRO */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  Escenarios de Rentabilidad 
                  {!isPro ? (
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-md uppercase font-bold tracking-wider">PRO</span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md uppercase font-bold tracking-wider">{getProBadgeText()}</span>
                  )}
                </h2>
                <p className="text-slate-600 text-sm mt-1">Proyección de riesgo según tiempo de posesión y desvíos de reforma.</p>
              </div>
            </div>

            <div className={`grid md:grid-cols-3 gap-4 ${!isPro ? 'blur-[6px] select-none pointer-events-none opacity-60' : ''}`}>
              {/* Conservador */}
              <div className="p-5 rounded-2xl border border-red-100 bg-red-50/50">
                <h4 className="text-red-800 font-bold mb-1">Conservador</h4>
                <p className="text-xs text-red-600/80 mb-3">+20% reforma, +6 meses</p>
                <div className="text-2xl font-bold text-red-700">{results.escenarioConservador.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}</div>
              </div>
              {/* Realista */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                <h4 className="text-slate-800 font-bold mb-1">Realista</h4>
                <p className="text-xs text-slate-500 mb-3">Cálculo base actual</p>
                <div className="text-2xl font-bold text-slate-700">{results.beneficio.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}</div>
              </div>
              {/* Optimista */}
              <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/50">
                <h4 className="text-emerald-800 font-bold mb-1">Optimista</h4>
                <p className="text-xs text-emerald-600/80 mb-3">Venta rápida, sin desvíos</p>
                <div className="text-2xl font-bold text-emerald-700">{results.escenarioOptimista.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})}</div>
              </div>
            </div>

            {!isPro && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[3px]">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center max-w-sm mx-auto">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="text-slate-400" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Escenarios de rentabilidad</h3>
                  <p className="text-brand-600 font-bold text-sm bg-brand-50 py-1.5 px-3 rounded-lg inline-block mb-2">Así varía tu beneficio según tu puja</p>
                  <p className="text-slate-500 text-xs mb-6 font-medium italic">Aquí es donde se ve el margen real de la operación</p>
                  
                  <button 
                    onClick={() => {
                      const plansBlock = document.getElementById('pro-plans-block');
                      if (plansBlock) {
                        plansBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className="bg-brand-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-500 transition-all shadow-md flex items-center justify-center gap-2 w-full mb-3"
                  >
                    Ver mi análisis completo
                  </button>
                  <p className="text-xs text-slate-500 font-medium">Acceso inmediato tras el pago</p>
                </div>
              </div>
            )}
          </div>

          {/* EMAIL CAPTURE */}
          {hasData && (
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl mt-8 text-white">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-brand-500/20 p-3 rounded-2xl">
                  <Mail className="text-brand-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">¿No tienes claro si es buena oportunidad?</h3>
                  <p className="text-slate-400 text-sm">Te explicamos cómo interpretar este resultado antes de pujar</p>
                </div>
              </div>
              
              {isSubscribed ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-emerald-400">
                  <CheckCircle size={20} />
                  <span className="font-medium">¡Análisis enviado correctamente! Revisa tu bandeja de entrada.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!email) return;
                      setIsSubmitting(true);
                      
                      // Save email to localStorage for PRO unlock later
                      localStorage.setItem('aom_user_email', email);
                      
                      const result = await subscribeToMailerLite({
                        email,
                        source: 'calculadora_free',
                        groups: ['182569815674717523'],
                        fields: {
                          source: 'calculadora_free'
                        }
                      });
                      
                      trackConversion(comunidad, 'calculator', 'email_submit', { 
                        roi: results.roi.toFixed(1), 
                        precio: adjudicacion, 
                        tipo_subasta: 'Judicial' 
                      });
                      
                      setIsSubmitting(false);
                      if (result.success) {
                        setIsSubscribed(true);
                      } else {
                        alert(result.error || 'Hubo un error al enviar el análisis.');
                      }
                    }}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <input 
                      type="email" 
                      placeholder="Tu mejor email..." 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Enviando...' : 'Recibir recomendaciones'}
                    </button>
                  </form>
                  <p className="text-[10px] text-slate-500 text-center sm:text-left px-1">
                    Sin spam · solo contenido útil para tomar decisiones
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionCalculator;
