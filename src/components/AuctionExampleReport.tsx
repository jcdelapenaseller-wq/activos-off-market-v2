import React, { useMemo, useEffect } from 'react';
import { ChevronLeft, Calculator, TrendingUp, DollarSign, Target, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../routes';

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

const AuctionExampleReport: React.FC = () => {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const adjudicacion = Number(params.get('precio')) || 0;
  const valorMercado = Number(params.get('mercado')) || 0;
  const reforma = Number(params.get('reforma')) || 0;
  const comunidad = params.get('ccaa') || 'Madrid';
  const deudas = Number(params.get('deudas')) || 0;
  const otrosGastos = Number(params.get('otros')) || 0;

  const results = useMemo(() => {
    const itpRate = ITP_RATES[comunidad] || 0.08;
    const itp = adjudicacion * itpRate;
    const registroNotaria = adjudicacion * 0.012;
    const gestoria = 500;
    const costeTotalInversion = adjudicacion + itp + registroNotaria + gestoria + reforma + deudas + otrosGastos;
    const beneficio = valorMercado - costeTotalInversion;
    const roi = costeTotalInversion > 0 ? (beneficio / costeTotalInversion) * 100 : 0;
    const precioMaxPuja = (valorMercado * 0.7) - (itp + registroNotaria + gestoria + reforma + deudas + otrosGastos);

    return { itp, registroNotaria, gestoria, costeTotalInversion, beneficio, roi, precioMaxPuja };
  }, [adjudicacion, valorMercado, reforma, comunidad, deudas, otrosGastos]);

  useEffect(() => {
    document.title = "Ejemplo de cálculo de subasta inmobiliaria | Activos Off-Market";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to={ROUTES.CALCULATOR} className="inline-flex items-center gap-2 text-brand-600 font-bold mb-8 hover:text-brand-700 transition-colors">
          <ChevronLeft size={20} /> Volver a la calculadora
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-brand-900 text-white p-10 text-center">
            <Calculator className="mx-auto mb-4 text-brand-300" size={48} />
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Ejemplo de cálculo de subasta inmobiliaria</h1>
            <p className="text-brand-200">Análisis detallado de rentabilidad y costes estimados</p>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <DollarSign className="text-brand-600" size={20} /> Datos Principales
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Precio adjudicación:</span>
                    <span className="font-bold text-slate-900">{adjudicacion.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Valor de mercado:</span>
                    <span className="font-bold text-slate-900">{valorMercado.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Comunidad Autónoma:</span>
                    <span className="font-bold text-slate-900">{comunidad}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <TrendingUp className="text-brand-600" size={20} /> Resultados del Análisis
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coste total estimado:</span>
                    <span className="font-bold text-slate-900">{results.costeTotalInversion.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ROI estimado:</span>
                    <span className={`font-bold ${results.roi > 15 ? 'text-emerald-600' : 'text-amber-600'}`}>{results.roi.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Beneficio estimado:</span>
                    <span className="font-bold text-emerald-600">{results.beneficio.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 mb-12">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Target className="text-brand-600" size={20} /> Puja Máxima Recomendada
              </h2>
              <div className="text-center">
                <span className="text-4xl md:text-5xl font-serif font-bold text-brand-900">
                  {results.precioMaxPuja.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}
                </span>
                <p className="text-slate-500 mt-4 max-w-md mx-auto">
                  Este valor garantiza un margen de seguridad del 30% respecto al valor de mercado, incluyendo todos los gastos e impuestos calculados.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-10 text-center">
              <h3 className="font-bold text-slate-900 mb-4">¿Quieres realizar tu propio cálculo?</h3>
              <p className="text-slate-600 mb-8">Utiliza nuestra herramienta gratuita para analizar cualquier subasta del BOE o AEAT.</p>
              <Link to={ROUTES.CALCULATOR} className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-700 transition-all">
                Ir a la calculadora <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-400 text-sm">
          Este informe es una estimación basada en los datos introducidos. <br />
          Activos Off-Market no se hace responsable de las decisiones de inversión tomadas.
        </div>
      </div>
    </div>
  );
};

export default AuctionExampleReport;
