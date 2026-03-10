import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle, Info, ArrowRight, BookOpen, Mail } from 'lucide-react';
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
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Load from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('precio')) setAdjudicacion(Number(params.get('precio')));
    if (params.get('mercado')) setValorMercado(Number(params.get('mercado')));
    if (params.get('tasacion')) setTasacionBOE(Number(params.get('tasacion')));
    if (params.get('reforma')) setReforma(Number(params.get('reforma')));
    if (params.get('comunidad')) setComunidad(params.get('comunidad') || 'Madrid');
    if (params.get('deudas')) setDeudas(Number(params.get('deudas')));
    if (params.get('otros')) setOtrosGastos(Number(params.get('otros')));
  }, []);

  const shareCalculation = () => {
    const params = new URLSearchParams({
      precio: adjudicacion.toString(),
      mercado: valorMercado.toString(),
      tasacion: tasacionBOE.toString(),
      reforma: reforma.toString(),
      comunidad: comunidad,
      deudas: deudas.toString(),
      otros: otrosGastos.toString(),
    });
    const url = `${window.location.origin}${ROUTES.CALCULATOR}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    alert('Enlace copiado al portapapeles');
  };

  const copyReport = () => {
    const text = `Informe de inversión:
- Precio de adjudicación: ${adjudicacion.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}
- Valor de mercado: ${valorMercado.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}
- Coste total: ${results.costeTotalInversion.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}
- Beneficio estimado: ${isUnlocked ? results.beneficio.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : 'XXXX'}
- ROI: ${isUnlocked ? results.roi.toFixed(2) + '%' : 'XXXX'}
- Puja máxima recomendada: ${isUnlocked ? results.precioMaxPuja.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : 'XXXX'}`;
    navigator.clipboard.writeText(text);
    alert('Resumen copiado al portapapeles');
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

    return { itp, registroNotaria, gestoria, costeTotalInversion, beneficio, roi, precioMaxPuja, margenSeguridad };
  }, [adjudicacion, valorMercado, reforma, comunidad, deudas, otrosGastos]);

  const getRoiStatus = (roi: number) => {
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
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setStatus('success');
        setIsUnlocked(true);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-6">Calculadora de Rentabilidad para Subastas Judiciales</h1>
          <p className="text-lg text-slate-600">Herramienta gratuita para calcular rentabilidad, ITP, costes y precio máximo de puja en subastas judiciales en España.</p>
        </div>
        <button onClick={shareCalculation} className="bg-slate-100 text-slate-700 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-all">Compartir cálculo</button>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Datos de la Subasta</h2>
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
                <h3 className="text-xl font-bold text-slate-900">Estado: {roiStatus.label}</h3>
                <p className="text-slate-600">Tu inversión parece {roiStatus.label.toLowerCase()}.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
                { label: 'Coste total inversión', value: results.costeTotalInversion, basic: true },
                { label: 'ROI', value: `${results.roi.toFixed(2)}%`, basic: true },
                { label: 'Beneficio estimado', value: results.beneficio, basic: false },
                { label: 'Puja máxima recomendada', value: results.precioMaxPuja, basic: false },
                { label: 'Margen de seguridad', value: results.margenSeguridad, basic: false },
            ].map((card, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <span className="block text-sm text-slate-500 mb-1">{card.label}</span>
                    {card.basic || isUnlocked ? (
                        <span className="text-2xl font-bold text-slate-900">{typeof card.value === 'number' ? card.value.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : card.value}</span>
                    ) : (
                        <span className="text-2xl font-bold text-slate-900 blur-sm select-none">XXXX</span>
                    )}
                </div>
            ))}
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

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            {!isUnlocked ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="font-bold text-slate-900 text-center">Desbloquea el informe completo de inversión</p>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu mejor email" required className="w-full bg-slate-100 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-500 outline-none" />
                    </div>
                    <button type="submit" disabled={status === 'loading'} className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50">{status === 'loading' ? 'Enviando...' : 'Desbloquear resultados'}</button>
                    {status === 'error' && <p className="text-red-600 font-bold text-center">Hubo un error, inténtalo de nuevo.</p>}
                </form>
            ) : (
                <p className="text-emerald-600 font-bold text-center">¡Resultados desbloqueados!</p>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Informe de inversión</h2>
            <div className="space-y-4 text-slate-700">
                <p>Precio de adjudicación: {adjudicacion.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</p>
                <p>Valor de mercado: {valorMercado.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</p>
                <p>Coste total: {results.costeTotalInversion.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</p>
                <p className={!isUnlocked ? "blur-sm select-none" : ""}>Beneficio estimado: {results.beneficio.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</p>
                <p className={!isUnlocked ? "blur-sm select-none" : ""}>ROI: {results.roi.toFixed(2)}%</p>
                <p className={!isUnlocked ? "blur-sm select-none" : ""}>Puja máxima recomendada: {results.precioMaxPuja.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</p>
            </div>
            <button onClick={copyReport} className="mt-6 w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all">
                Copiar resumen de inversión
            </button>
          </div>
        </div>
      </div>

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

        <h2 className="text-3xl font-bold text-slate-900 mb-6">Preguntas frecuentes sobre rentabilidad en subastas judiciales</h2>
        <div className="space-y-6">
            {[
                { q: "¿Cómo calcular si una subasta es rentable?", a: "Debes restar al valor de mercado todos los costes: adjudicación, impuestos (ITP), gastos de registro/notaría, reformas necesarias, deudas heredadas y costes de desalojo. Si el beneficio neto tras todo esto ofrece un ROI superior al 15-20%, suele ser una buena operación." },
                { q: "¿Qué impuestos se pagan en una subasta judicial?", a: "El principal es el ITP (Impuesto de Transmisiones Patrimoniales), cuyo tipo varía según la Comunidad Autónoma (entre el 4% y el 10%). No se paga IVA en subastas judiciales salvo excepciones muy específicas." },
                { q: "¿Cómo calcular la puja máxima?", a: "Calcula el valor de mercado y aplica tu margen de seguridad (ej. 70%). Resta de esa cifra todos los costes previstos (ITP, reforma, gastos). El resultado es tu puja máxima para obtener la rentabilidad deseada." },
                { q: "¿Cuánto dinero necesito para participar en una subasta?", a: "Necesitas el 5% del valor de tasación del bien para constituir el depósito. Además, debes tener liquidez suficiente para pagar el resto del precio de adjudicación en 40 días (judicial) o 20 días (administrativa) tras la subasta." }
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
