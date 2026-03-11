import React, { useMemo, useEffect } from 'react';
import { ChevronLeft, Calculator, TrendingUp, DollarSign, Target, ArrowRight, ShieldCheck, Search, AlertOctagon, MapPin, Home, FileText, Scale, Gavel } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
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

interface AuctionData {
  propertyType?: string;
  city?: string;
  zone?: string;
  appraisalValue?: number;
  claimedDebt?: number;
  procedureType?: string;
  surface?: number;
  occupancy?: string;
}

const MOCK_AUCTIONS: Record<string, AuctionData> = {
  'piso-subasta-madrid-centro': {
    propertyType: "Piso",
    city: "Madrid",
    zone: "Centro",
    appraisalValue: 180000,
    claimedDebt: 90000,
    procedureType: "Ejecución hipotecaria",
    surface: 75,
    occupancy: "Desconocido"
  }
};

const parseSlug = (slug: string = '') => {
  const parts = slug.split('-');
  const subastaIndex = parts.findIndex(p => p === 'subasta' || p === 'subastas');
  
  let tipoInmueble = 'Inmueble';
  let ciudadRaw = 'España';
  
  if (subastaIndex > 0) {
    tipoInmueble = parts.slice(0, subastaIndex).join(' ');
  } else if (subastaIndex === 0 && parts.length > 1) {
    tipoInmueble = parts[1];
    if (parts.length > 2) {
      ciudadRaw = parts.slice(2).join(' ');
    }
  } else if (parts.length > 0) {
    tipoInmueble = parts[0];
  }
  
  if (subastaIndex > 0 && subastaIndex < parts.length - 1) {
    ciudadRaw = parts.slice(subastaIndex + 1).join(' ');
  }
  
  // Capitalize
  tipoInmueble = tipoInmueble.charAt(0).toUpperCase() + tipoInmueble.slice(1);
  const ciudad = ciudadRaw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return { tipoInmueble, ciudad, ciudadRaw };
};

const getCityRoute = (ciudadRaw: string) => {
  const normalized = ciudadRaw.toLowerCase();
  if (normalized.includes('madrid')) return ROUTES.MADRID;
  if (normalized.includes('barcelona')) return ROUTES.BARCELONA;
  if (normalized.includes('valencia')) return ROUTES.VALENCIA;
  if (normalized.includes('sevilla')) return ROUTES.SEVILLA;
  return null;
};

const AuctionExampleReport: React.FC = () => {
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const auctionData = slug ? MOCK_AUCTIONS[slug] : undefined;

  const { tipoInmueble: fallbackTipo, ciudad: fallbackCiudad, ciudadRaw: fallbackCiudadRaw } = useMemo(() => parseSlug(slug), [slug]);
  
  const tipoInmueble = auctionData?.propertyType || fallbackTipo;
  const ciudad = auctionData?.city || fallbackCiudad;
  const zona = auctionData?.zone || '';
  const ciudadRaw = auctionData?.city || fallbackCiudadRaw;
  const cityRoute = getCityRoute(ciudadRaw);

  const adjudicacion = Number(params.get('precio')) || 0;
  const valorMercado = auctionData?.appraisalValue || Number(params.get('mercado')) || 0;
  const reforma = Number(params.get('reforma')) || 0;
  const comunidad = params.get('ccaa') || 'Madrid';
  const deudas = auctionData?.claimedDebt ?? (Number(params.get('deudas')) || 0);
  const otrosGastos = Number(params.get('otros')) || 0;
  const procedureType = auctionData?.procedureType || 'Subasta Judicial / Administrativa (Verificar en portal oficial)';
  const surface = auctionData?.surface;
  const occupancy = auctionData?.occupancy;

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
    document.title = `${tipoInmueble} en subasta judicial en ${ciudad} | análisis y rentabilidad`;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `Análisis de subasta inmobiliaria en ${ciudad}. Revisa riesgos, rentabilidad y cálculo previo antes de pujar.`);
    }
    
    window.scrollTo(0, 0);
  }, [tipoInmueble, ciudad]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm md:text-base">
          <Link to={ROUTES.CALCULATOR} className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
            <ChevronLeft size={20} /> Volver a la calculadora
          </Link>
          <span className="text-slate-300">|</span>
          <Link to={ROUTES.GUIDE_PILLAR} className="inline-flex items-center gap-2 text-slate-600 font-medium hover:text-brand-600 transition-colors">
            Subastas Judiciales en España
          </Link>
          {cityRoute && (
            <>
              <span className="text-slate-300">|</span>
              <Link to={cityRoute} className="inline-flex items-center gap-2 text-slate-600 font-medium hover:text-brand-600 transition-colors">
                Subastas en {ciudad}
              </Link>
            </>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-12">
          <div className="bg-brand-900 text-white p-10 text-center">
            <Calculator className="mx-auto mb-4 text-brand-300" size={48} />
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Análisis de subasta inmobiliaria en {ciudad}</h1>
            <p className="text-brand-200 text-lg">Revisión de rentabilidad, riesgos y costes estimados para este {tipoInmueble.toLowerCase()}</p>
          </div>

          <div className="p-8 md:p-12">
            {/* H2: Resumen de la subasta */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                <FileText className="text-brand-600" size={24} /> Resumen de la subasta
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <Home className="text-brand-500 mt-1" size={20} />
                  <div>
                    <span className="block text-sm text-slate-500 font-medium">Tipo de inmueble</span>
                    <span className="font-bold text-slate-900">{tipoInmueble}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-brand-500 mt-1" size={20} />
                  <div>
                    <span className="block text-sm text-slate-500 font-medium">Ciudad / Zona</span>
                    <span className="font-bold text-slate-900">{ciudad}{zona ? ` / ${zona}` : ''}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="text-brand-500 mt-1" size={20} />
                  <div>
                    <span className="block text-sm text-slate-500 font-medium">Valor de tasación (Mercado)</span>
                    <span className="font-bold text-slate-900">{valorMercado > 0 ? valorMercado.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : 'No especificado'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Scale className="text-brand-500 mt-1" size={20} />
                  <div>
                    <span className="block text-sm text-slate-500 font-medium">Deuda reclamada / Cargas</span>
                    <span className="font-bold text-slate-900">{deudas > 0 ? deudas.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : 'A consultar en edicto'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <Gavel className="text-brand-500 mt-1" size={20} />
                  <div>
                    <span className="block text-sm text-slate-500 font-medium">Tipo de procedimiento</span>
                    <span className="font-bold text-slate-900">{procedureType}</span>
                  </div>
                </div>
                {surface && (
                  <div className="flex items-start gap-3">
                    <Home className="text-brand-500 mt-1" size={20} />
                    <div>
                      <span className="block text-sm text-slate-500 font-medium">Superficie</span>
                      <span className="font-bold text-slate-900">{surface} m²</span>
                    </div>
                  </div>
                )}
                {occupancy && (
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="text-brand-500 mt-1" size={20} />
                    <div>
                      <span className="block text-sm text-slate-500 font-medium">Ocupación</span>
                      <span className="font-bold text-slate-900">{occupancy}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* H2: Primer análisis de la oportunidad */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                <Search className="text-brand-600" size={24} /> Primer análisis de la oportunidad
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  Analizando este <strong>{tipoInmueble.toLowerCase()} en {ciudad}</strong>, nos encontramos ante una oportunidad de inversión inmobiliaria a través de subasta pública. 
                  El éxito de esta operación dependerá de la correcta evaluación de los costes ocultos y del margen de seguridad entre el valor de adjudicación y el valor real de mercado.
                </p>
                <p>
                  Antes de participar, es fundamental revisar la certificación de cargas, el estado posesorio del inmueble y calcular con precisión los impuestos (ITP en {comunidad}), 
                  gastos de registro, notaría y posibles reformas necesarias para su posterior venta o alquiler.
                </p>
              </div>
            </div>

            {/* H2: Riesgos a comprobar antes de pujar */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                <AlertOctagon className="text-brand-600" size={24} /> Riesgos a comprobar antes de pujar
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <strong className="text-slate-900 block">Ocupación y estado posesorio</strong>
                      <span className="text-slate-700 text-sm">Verificar si el inmueble está vacío, alquilado o ocupado ilegalmente. Esto afectará a los plazos y costes de toma de posesión.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <strong className="text-slate-900 block">Cargas anteriores</strong>
                      <span className="text-slate-700 text-sm">Revisar la nota simple y certificación de cargas para identificar hipotecas previas o embargos que el adjudicatario deba asumir.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <strong className="text-slate-900 block">Estado físico del inmueble</strong>
                      <span className="text-slate-700 text-sm">Al no poder visitar el interior en la mayoría de los casos, se debe estimar un presupuesto de reforma conservador.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <strong className="text-slate-900 block">Deudas de comunidad e IBI</strong>
                      <span className="text-slate-700 text-sm">El nuevo propietario responde de las deudas del año en curso y los tres anteriores en la comunidad de propietarios, así como del IBI pendiente.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* H2: Cómo calcular la rentabilidad de esta subasta */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                <TrendingUp className="text-brand-600" size={24} /> Cómo calcular la rentabilidad de esta subasta
              </h2>
              
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center shadow-sm mb-8">
                <p className="text-slate-600 mb-6">
                  Para evitar sorpresas, es imprescindible realizar una simulación financiera completa antes de depositar la fianza. 
                  Nuestra calculadora gratuita te permite estimar todos los gastos, impuestos y el ROI potencial.
                </p>
                <Link to={ROUTES.CALCULATOR} className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 w-full sm:w-auto">
                  Calcular rentabilidad de esta subasta <ArrowRight size={20} />
                </Link>
              </div>

              {/* Muestra de resultados si hay datos en la URL */}
              {(adjudicacion > 0 || valorMercado > 0) && (
                <div className="mt-8 border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800">Simulación basada en los datos actuales</h3>
                  </div>
                  <div className="p-6 grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Precio adjudicación:</span>
                        <span className="font-bold text-slate-900">{adjudicacion.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Valor de mercado:</span>
                        <span className="font-bold text-slate-900">{valorMercado.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Coste total estimado:</span>
                        <span className="font-bold text-slate-900">{results.costeTotalInversion.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                      </div>
                    </div>
                    <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Beneficio estimado:</span>
                        <span className="font-bold text-emerald-600">{results.beneficio.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">ROI estimado:</span>
                        <span className={`font-bold ${results.roi > 15 ? 'text-emerald-600' : 'text-amber-600'}`}>{results.roi.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2 pt-2 border-t border-slate-100">
                        <span className="text-slate-700 font-medium">Puja Máxima Recomendada:</span>
                        <span className="font-bold text-brand-700">{results.precioMaxPuja.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* H2: Cómo analizar una subasta inmobiliaria paso a paso */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                <Target className="text-brand-600" size={24} /> Cómo analizar una subasta inmobiliaria paso a paso
              </h2>
              <p className="text-slate-600 mb-6">
                Si es tu primera vez participando en una subasta del BOE, te recomendamos leer nuestra guía completa donde explicamos 
                la metodología exacta para analizar edictos, certificaciones de cargas y calcular pujas ganadoras con margen de seguridad.
              </p>
              <Link to={ROUTES.ANALYSIS} className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-800 transition-colors group">
                Leer guía paso a paso <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>

        <div className="mt-8 text-center text-slate-400 text-sm">
          Este informe es una plantilla de análisis basada en los datos de la URL. <br />
          Activos Off-Market no se hace responsable de las decisiones de inversión tomadas.
        </div>
      </div>
    </div>
  );
};

export default AuctionExampleReport;

