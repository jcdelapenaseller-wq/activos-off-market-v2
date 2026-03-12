import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle, Info, ArrowRight, BookOpen, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import LeadMagnetBlock from './LeadMagnetBlock';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

const AuctionCalculator: React.FC = () => {
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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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

  const handlePremiumAction = (action: () => void) => {
    if (isUnlocked) {
      action();
    } else {
      setIsModalOpen(true);
    }
  };

  const shareCalculation = () => {
    const params = new URLSearchParams({
      precio: adjudicacion.toString(),
      mercado: valorMercado.toString(),
      tasacion: tasacionBOE.toString(),
      reforma: reforma.toString(),
      ccaa: comunidad,
      deudas: deudas.toString(),
      otros: otrosGastos.toString(),
    });
    const url = `${window.location.origin}${ROUTES.CALCULATOR}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    alert('Enlace de cálculo copiado al portapapeles');
  };

  const copyReport = () => {
    const text = `Análisis de subasta:
Precio adjudicación: ${adjudicacion.toLocaleString('es-ES')} €
Valor mercado: ${valorMercado.toLocaleString('es-ES')} €
Coste total estimado: ${results.costeTotalInversion.toLocaleString('es-ES')} €
ROI estimado: ${results.roi.toFixed(2)}%
Beneficio estimado: ${results.beneficio.toLocaleString('es-ES')} €
Puja máxima recomendada: ${results.precioMaxPuja.toLocaleString('es-ES')} €

Calculado con la herramienta de Activos Off-Market.`;
    navigator.clipboard.writeText(text);
    alert('Resumen de inversión copiado al portapapeles');
  };

  const createPublicLink = () => {
    const params = new URLSearchParams({
      precio: adjudicacion.toString(),
      mercado: valorMercado.toString(),
      tasacion: tasacionBOE.toString(),
      reforma: reforma.toString(),
      ccaa: comunidad,
      deudas: deudas.toString(),
      otros: otrosGastos.toString(),
    });
    // Generate a slug-like part for the URL
    const slug = `${comunidad.toLowerCase().replace(/\s+/g, '-')}-${Math.round(adjudicacion/1000)}k`;
    const url = `${window.location.origin}/ejemplo-subasta/${slug}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    alert('Enlace público generado y copiado al portapapeles');
  };

  const results = useMemo(() => {
    const itpRate = ITP_RATES[comunidad] || 0.08;
    const itp = adjudicacion * itpRate;
    const registroNotaria = adjudicacion * 0.012;
    const gestoria = 500;
    const costeTotalInversion = adjudicacion + itp + registroNotaria + gestoria + reforma + deudas + otrosGastos;
    const beneficio = valorMercado - costeTotalInversion;
    const roi = costeTotalInversion > 0 ? (beneficio / costeTotalInversion) * 100 : 0;
    const precioMaxPuja = (valorMercado * 0.7) - (itp + registroNotaria + gestoria + reforma + deudas + otrosGastos);
    const margenSeguridad = valorMercado * 0.3; // Assuming 30% margin
    const escenarioConservador = beneficio * 0.8;
    const escenarioOptimista = beneficio * 1.2;

    return { itp, registroNotaria, gestoria, costeTotalInversion, beneficio, roi, precioMaxPuja, margenSeguridad, escenarioConservador, escenarioOptimista };
  }, [adjudicacion, valorMercado, reforma, comunidad, deudas, otrosGastos]);

  const hasData = adjudicacion > 0 || valorMercado > 0 || tasacionBOE > 0 || reforma > 0 || deudas > 0;

  const getRoiStatus = (roi: number) => {
    if (!hasData) return { label: 'Introduce los datos de la subasta para calcular el riesgo de la inversión.', traffic: 'bg-slate-200' };
    if (roi > 20) return { color: 'text-green-600', label: 'Excelente', bg: 'bg-green-100', traffic: 'bg-green-500' };
    if (roi >= 10) return { color: 'text-yellow-600', label: 'Aceptable', bg: 'bg-yellow-100', traffic: 'bg-yellow-500' };
    return { color: 'text-red-600', label: 'Arriesgado', bg: 'bg-red-100', traffic: 'bg-red-500' };
  };

  const roiStatus = getRoiStatus(results.roi);

  const chartData = [
    { name: 'Coste Total', value: results.costeTotalInversion },
    { name: 'Valor Mercado', value: valorMercado },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'calculadora',
          fields: {
            precio_maximo_puja: results.precioMaxPuja,
            roi_estimado: results.roi,
            margen_seguridad: results.margenSeguridad
          }
        }),
      });
      if (response.ok) {
        setStatus('success');
        setIsUnlocked(true);
        setTimeout(() => setIsModalOpen(false), 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-12">
      <div className="mb-12">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-6">Calculadora de Rentabilidad para Subastas Judiciales</h1>
        <p className="text-lg text-slate-600">Herramienta gratuita para calcular rentabilidad, ITP, costes y precio máximo de puja en subastas judiciales en España.</p>
      </div>

      {/* Step-by-Step Guide */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          { step: "Paso 1", title: "Introduce los datos de la subasta" },
          { step: "Paso 2", title: "La calculadora estima rentabilidad y riesgo" },
          { step: "Paso 3", title: "Introduce tu email para desbloquear el informe completo de inversión" }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-brand-600 font-bold text-sm uppercase tracking-wider">{item.step}</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{item.title}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Datos de la Subasta</h2>
          <p className="text-slate-600 mb-6">Introduce los datos de la subasta para estimar la rentabilidad y calcular la puja máxima recomendada.</p>
          {[
            { label: 'Precio adjudicación (€)', value: adjudicacion, setter: setAdjudicacion },
            { label: 'Valor mercado estimado (€)', value: valorMercado, setter: setValorMercado },
            { label: 'Valor de tasación BOE (€)', value: tasacionBOE, setter: setTasacionBOE },
            { label: 'Coste reforma (€)', value: reforma, setter: setReforma },
            { label: 'Deudas heredadas (€)', value: deudas, setter: setDeudas },
            { label: 'Otros gastos (€)', value: otrosGastos, setter: setOtrosGastos },
          ].map((input, i) => (
            <div key={i}>
              <label className="block text-sm font-bold text-slate-700 mb-2">{input.label}</label>
              <input type="number" value={input.value || ''} onChange={(e) => input.setter(Number(e.target.value))} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Comunidad Autónoma</label>
            <select value={comunidad} onChange={(e) => setComunidad(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500">
              {Object.keys(ITP_RATES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className={`w-16 h-16 rounded-full ${roiStatus.traffic}`}></div>
            <div>
                <h3 className="text-xl font-bold text-slate-900">{hasData ? `Estado: ${roiStatus.label}` : 'Estado de la inversión'}</h3>
                <p className="text-slate-600">{hasData ? `Tu inversión parece ${roiStatus.label.toLowerCase()}.` : roiStatus.label}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="block text-sm text-slate-500 mb-1">Precio máximo estimado de puja</span>
            <span className="text-2xl font-bold text-slate-900">{results.precioMaxPuja.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              {!isUnlocked && <Lock size={20} className="text-slate-400" />} Análisis completo de inversión
            </h3>
            
            <div className={`space-y-4 ${!isUnlocked ? 'blur-sm select-none pointer-events-none' : ''}`}>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <span className="block text-xs text-slate-500 uppercase">ROI estimado</span>
                  <span className="text-lg font-bold text-slate-900">{results.roi.toFixed(2)}%</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <span className="block text-xs text-slate-500 uppercase">Margen seguridad</span>
                  <span className="text-lg font-bold text-slate-900">{results.margenSeguridad.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <span className="block text-xs text-slate-500 uppercase">Rentabilidad estimada</span>
                <span className="text-lg font-bold text-slate-900">{results.beneficio.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <span className="block text-xs text-slate-500 uppercase">Escenario conservador</span>
                  <span className="text-lg font-bold text-slate-900">{results.escenarioConservador.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <span className="block text-xs text-slate-500 uppercase">Escenario optimista</span>
                  <span className="text-lg font-bold text-slate-900">{results.escenarioOptimista.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                </div>
              </div>
            </div>

            {!isUnlocked && (
              <div className="mt-8 bg-brand-50 p-6 rounded-2xl border border-brand-100 text-center">
                <p className="text-slate-700 mb-4">Introduce tu email para desbloquear el análisis completo de esta subasta.</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {status === 'success' ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-center gap-3 text-emerald-700 font-bold">
                        <CheckCircle size={20} /> ✔ Análisis desbloqueado. También te hemos enviado el resumen por email.
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="Tu mejor email" 
                          required 
                          className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={status === 'loading'} 
                        className="w-full bg-brand-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-700 transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        {status === 'loading' ? 'Desbloqueando...' : 'Desbloquear análisis completo'}
                      </button>
                      {status === 'error' && <p className="text-red-600 text-sm font-bold">Hubo un error, inténtalo de nuevo.</p>}
                    </>
                  )}
                </form>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => typeof value === 'number' ? value.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : value}/>
                    <Bar dataKey="value">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#426385' : '#324e6b'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Informe de inversión</h2>
            <div className={`space-y-4 text-slate-700 ${!isUnlocked ? 'blur-sm select-none pointer-events-none' : ''}`}>
                <p className="flex justify-between border-b border-slate-100 pb-2">
                    <span>Precio de adjudicación:</span> 
                    <span className="font-bold">{adjudicacion.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-2">
                    <span>Valor de mercado:</span> 
                    <span className="font-bold">{valorMercado.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-2">
                    <span>Coste total:</span> 
                    <span className="font-bold">{results.costeTotalInversion.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-2">
                    <span>Beneficio estimado:</span> 
                    <span className="font-bold">{results.beneficio.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-2">
                    <span>ROI:</span> 
                    <span className="font-bold">{results.roi.toFixed(2)}%</span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-2">
                    <span>Puja máxima recomendada:</span> 
                    <span className="font-bold">{results.precioMaxPuja.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                </p>
            </div>
            
            {!isUnlocked && (
                <div className="bg-white border-2 border-brand-100 p-8 rounded-3xl mt-8 shadow-md">
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className="w-full max-w-lg">
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">
                                Ver la puja máxima recomendada y el informe completo de inversión
                            </h2>
                            <p className="text-slate-600 mb-6 text-base">
                                Introduce tu email para ver el informe completo de esta subasta, incluyendo:
                            </p>
                            <ul className="grid grid-cols-2 gap-3 text-slate-700 font-medium text-sm text-left">
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-brand-600" />
                                    <span>Puja máxima recomendada</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-brand-600" />
                                    <span>Margen de seguridad</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-brand-600" />
                                    <span>ROI estimado completo</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-brand-600" />
                                    <span>Informe profesional</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="w-full max-w-sm">
                            <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(true); }} className="space-y-3">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        placeholder="Tu mejor email" 
                                        required 
                                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-base" 
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="w-full bg-brand-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 text-base"
                                >
                                    Desbloquear puja máxima recomendada <ArrowRight size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <button onClick={() => handlePremiumAction(copyReport)} className="bg-white border border-slate-200 text-slate-600 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm">
                    Copiar resumen
                </button>
                <button onClick={() => handlePremiumAction(shareCalculation)} className="bg-white border border-slate-200 text-slate-600 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm">
                    Compartir cálculo
                </button>
                <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Guardar este análisis como ejemplo de inversión</p>
                    <button onClick={() => handlePremiumAction(createPublicLink)} className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm">
                        Crear enlace público
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONVERSION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-300">
                <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <ArrowRight className="rotate-180" size={24} />
                </button>
                
                <div className="text-center">
                    <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <TrendingUp className="text-brand-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Ver puja máxima recomendada</h2>
                    <p className="text-slate-600 mb-8">Introduce tu email para ver el informe completo de inversión generado por la calculadora.</p>
                    
                    {status === 'success' ? (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-center gap-3 text-emerald-700 font-bold">
                            <CheckCircle size={20} /> ✔ Análisis desbloqueado. También te hemos enviado el resumen por email.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="Tu mejor email" 
                                    required 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-500 outline-none" 
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={status === 'loading'} 
                                className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50 shadow-lg shadow-brand-500/20"
                            >
                                {status === 'loading' ? 'Desbloqueando...' : 'Desbloquear puja máxima'}
                            </button>
                            {status === 'error' && <p className="text-red-600 text-sm font-bold">Hubo un error, inténtalo de nuevo.</p>}
                        </form>
                    )}
                </div>
            </div>
        </div>
      )}

      <article className="prose prose-slate max-w-none mt-20">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                    <Calculator className="text-brand-600" /> Cómo usar esta calculadora
                </h2>
                <p className="text-slate-600">Introduce los datos de la subasta (precio de adjudicación, valor de mercado, tasación BOE, reforma, deudas heredadas y otros gastos) y selecciona tu Comunidad Autónoma para calcular automáticamente el ITP, los gastos de gestión, el ROI y el precio máximo recomendado para tu puja.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                    <AlertTriangle className="text-amber-600" /> Errores comunes
                </h2>
                <p className="text-slate-600">El error más frecuente es no incluir todos los costes asociados (IBI, comunidad, desalojo, reformas inesperadas) o utilizar el valor de tasación del BOE como valor de mercado real. Utiliza siempre comparables de mercado actualizados para una valoración precisa.</p>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm col-span-2">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                    <TrendingUp className="text-brand-600" /> Cómo calcular si una subasta es rentable
                </h2>
                <p className="text-slate-600">La rentabilidad en subastas judiciales no es solo la diferencia entre el precio de adjudicación y el valor de mercado. Debes considerar todos los costes asociados, el tiempo de espera y el riesgo de ocupación.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                    <Info className="text-brand-600" /> Qué costes incluir
                </h2>
                <p className="text-slate-600 text-sm">ITP, Registro, Notaría, Gestoría, deudas de comunidad e IBI, costes de desalojo y posibles reformas.</p>
            </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Calculator className="text-brand-400" /> Cómo calcular la puja máxima según Art 670 LEC
            </h2>
            <p className="text-slate-300">La puja máxima debe garantizar que, tras todos los gastos, el ROI sea atractivo. No pujes por encima del 70% del valor de mercado si no tienes un margen de seguridad claro.</p>
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-6">Ejemplos reales de cálculo en subastas judiciales</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
                { title: "Piso en Madrid", mercado: 250000, adjudicacion: 180000, reforma: 30000, itp: 10800, gastos: 5000 },
                { title: "Apartamento Costa", mercado: 150000, adjudicacion: 90000, reforma: 15000, itp: 6300, gastos: 3000 },
                { title: "Local Comercial", mercado: 300000, adjudicacion: 200000, reforma: 50000, itp: 20000, gastos: 8000 }
            ].map((ej, i) => {
                const total = ej.adjudicacion + ej.reforma + ej.itp + ej.gastos;
                const beneficio = ej.mercado - total;
                const roi = (beneficio / total) * 100;
                return (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-4">{ej.title}</h3>
                        <p className="text-sm text-slate-500">Mercado: {ej.mercado.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</p>
                        <p className="text-sm text-slate-500">Adjudicación: {ej.adjudicacion.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</p>
                        <p className="text-sm font-bold mt-4 text-brand-700">ROI: {roi.toFixed(1)}%</p>
                    </div>
                )
            })}
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-6">Preguntas frecuentes sobre calcular la rentabilidad de una subasta judicial</h2>
        <div className="space-y-6">
            {[
                { q: "¿Cómo calcular la rentabilidad de una subasta judicial?", a: "Para calcular la rentabilidad real debes comparar el valor de mercado actual del inmueble con el coste total de la inversión. Este coste incluye el precio de adjudicación, el ITP (que varía según la comunidad autónoma), gastos de reforma, notaría, registro y posibles cargas anteriores o deudas de comunidad. Nuestra calculadora de subastas te permite estimar todos estos valores automáticamente." },
                { q: "¿Cuánto dinero necesito para participar en una subasta judicial?", a: "Para participar necesitas inicialmente el 5% del valor de tasación del bien en concepto de consignación o depósito. Si resultas adjudicatario, deberás abonar el resto del precio de adjudicación en el plazo legal (normalmente 40 días hábiles en subastas judiciales) más los impuestos y gastos asociados." },
                { q: "¿Qué impuestos se pagan al comprar en una subasta judicial?", a: "El principal es el ITP (Impuesto de Transmisiones Patrimoniales). El tipo impositivo depende de la Comunidad Autónoma donde se encuentre el inmueble, oscilando generalmente entre el 4% y el 10%. En subastas judiciales no se suele pagar IVA, salvo en casos muy específicos de ejecuciones entre empresas." },
                { q: "¿Cómo calcular la puja máxima en una subasta?", a: "La puja máxima se calcula restando del valor de mercado real todos los costes previstos (impuestos, reformas, cargas, gastos) y aplicando un margen de seguridad mínimo (beneficio deseado). Una regla común es no superar el 70% del valor de mercado tras descontar todos los gastos." }
            ].map((faq, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                    <p className="text-slate-600 text-sm">{faq.a}</p>
                </div>
            ))}
        </div>

        <div className="my-12 p-8 bg-slate-50 rounded-3xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Más información</h3>
            <nav className="grid md:grid-cols-2 gap-4">
                <Link to={ROUTES.RULE_70} className="text-brand-700 hover:underline">Regla del 70% en subastas</Link>
                <Link to={ROUTES.CHARGES} className="text-brand-700 hover:underline">Cargas en subastas</Link>
                <Link to={ROUTES.OCCUPIED} className="text-brand-700 hover:underline">Vivienda ocupada</Link>
                <Link to={ROUTES.ANALYSIS} className="text-brand-700 hover:underline">Cómo analizar subastas</Link>
            </nav>
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-6">Calculadora de subastas judiciales por ciudad</h2>
        <nav className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            {[
                { name: "Madrid", path: "/calculadora-subastas?ciudad=madrid" },
                { name: "Barcelona", path: "/calculadora-subastas?ciudad=barcelona" },
                { name: "Valencia", path: "/calculadora-subastas?ciudad=valencia" },
                { name: "Sevilla", path: "/calculadora-subastas?ciudad=sevilla" },
                { name: "Málaga", path: "/calculadora-subastas?ciudad=malaga" }
            ].map((city) => (
                <Link key={city.name} to={city.path} className="bg-white p-4 rounded-xl border border-slate-200 text-center font-bold text-brand-700 hover:bg-brand-50 transition-all">
                    {city.name}
                </Link>
            ))}
        </nav>
      </article>
      
      <div className="mt-12">
        <LeadMagnetBlock />
      </div>
    </div>
  );
};

export default AuctionCalculator;
