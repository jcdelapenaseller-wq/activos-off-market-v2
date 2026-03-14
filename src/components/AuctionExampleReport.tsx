import React, { useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calculator, TrendingUp, DollarSign, Target, ArrowRight, ShieldCheck, Search, AlertOctagon, MapPin, Home, FileText, Scale, Gavel, Send, HelpCircle } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ROUTES } from '../routes';
import { AUCTIONS, AuctionData } from '../data/auctions';
import RelatedAuctions from './RelatedAuctions';
import { isAuctionFinished } from '../utils/auctionHelpers';
import FinishedAuctionBanner from './FinishedAuctionBanner';

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

  const auctionData = slug ? AUCTIONS[slug] : undefined;

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
  const marketPriceM2 = auctionData?.marketPriceM2;
  const marketPriceM2Min = auctionData?.marketPriceM2Min;
  const marketPriceM2Max = auctionData?.marketPriceM2Max;
  const description = auctionData?.description;

  const address = auctionData?.address || '';
  const displayTitle = useMemo(() => {
    if (address) return `Análisis de subasta en ${address} (${ciudad})`;
    if (zona) return `Análisis de subasta en ${zona} (${ciudad})`;
    return `Análisis de subasta inmobiliaria en ${ciudad}`;
  }, [address, zona, ciudad]);

  const isFinished = isAuctionFinished(auctionData?.auctionDate);

  const results = useMemo(() => {
    const itpRate = ITP_RATES[comunidad] || 0.08;
    const itp = adjudicacion * itpRate;
    const registroNotaria = adjudicacion * 0.012;
    const gestoria = 500;
    const costeTotalInversion = adjudicacion + itp + registroNotaria + gestoria + reforma + deudas + otrosGastos;
    
    // Use average market price if range is provided
    let effectiveMarketValue = valorMercado;
    if (surface && (marketPriceM2 || (marketPriceM2Min && marketPriceM2Max))) {
      const priceM2 = marketPriceM2 || ((marketPriceM2Min! + marketPriceM2Max!) / 2);
      effectiveMarketValue = surface * priceM2;
    }

    const beneficio = effectiveMarketValue - costeTotalInversion;
    const roi = costeTotalInversion > 0 ? (beneficio / costeTotalInversion) * 100 : 0;
    const precioMaxPuja = (effectiveMarketValue * 0.7) - (itp + registroNotaria + gestoria + reforma + deudas + otrosGastos);

    return { itp, registroNotaria, gestoria, costeTotalInversion, beneficio, roi, precioMaxPuja, effectiveMarketValue };
  }, [adjudicacion, valorMercado, reforma, comunidad, deudas, otrosGastos, surface, marketPriceM2, marketPriceM2Min, marketPriceM2Max]);

  // Removed old relatedAuctions logic

  useEffect(() => {
    document.title = `${displayTitle} | Análisis y Rentabilidad`;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `${displayTitle}. Revisa riesgos, rentabilidad y cálculo previo antes de pujar en esta subasta del BOE.`);
    }

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": "https://activosoffmarket.es/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": `Subastas en ${ciudad}`,
          "item": `https://activosoffmarket.es/subastas-${ciudad.toLowerCase().replace(/\s+/g, '-')}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Ejemplo de subasta",
          "item": `https://activosoffmarket.es/ejemplo-subasta/${slug}`
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);
    
    window.scrollTo(0, 0);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [tipoInmueble, ciudad, slug]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-6 pt-10">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs SEO */}
        <nav className="flex items-center text-sm text-slate-500 mb-6 font-medium" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-600 transition-colors">Inicio</Link>
          <ChevronRight size={14} className="mx-2 text-slate-300" />
          <Link to={cityRoute || `/subastas-${ciudad.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-brand-600 transition-colors">
            Subastas en {ciudad}
          </Link>
          <ChevronRight size={14} className="mx-2 text-slate-300" />
          <span className="text-slate-400">Ejemplo de subasta</span>
        </nav>

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

        {isFinished && auctionData?.auctionDate && (
          <div className="mb-8">
            <FinishedAuctionBanner auctionDate={auctionData.auctionDate} />
            <div className="bg-white border border-slate-200 rounded-2xl p-8 mt-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Subastas similares en esta zona</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to={`/subastas-${ciudadRaw.toLowerCase().replace(' ', '-')}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-brand-50 transition-colors group">
                  <span className="font-medium text-slate-700 group-hover:text-brand-700">Subastas similares en {ciudad}</span>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-brand-600" />
                </Link>
                {zona && (
                  <Link to={`/subastas/${ciudadRaw.toLowerCase().replace(' ', '-')}/${zona.toLowerCase().replace(' ', '-')}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-brand-50 transition-colors group">
                    <span className="font-medium text-slate-700 group-hover:text-brand-700">Subastas en {zona}</span>
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-brand-600" />
                  </Link>
                )}
                <Link to="/subastas-descuento-50" className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-brand-50 transition-colors group">
                  <span className="font-medium text-slate-700 group-hover:text-brand-700">Subastas con descuento &gt; 50%</span>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-brand-600" />
                </Link>
                <Link to="/subastas-recientes" className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-brand-50 transition-colors group">
                  <span className="font-medium text-slate-700 group-hover:text-brand-700">Subastas recientes</span>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-brand-600" />
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-12">
          <div className="bg-brand-900 text-white p-10 text-center">
            <Calculator className="mx-auto mb-4 text-brand-300" size={48} />
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">{displayTitle}</h1>
            <p className="text-brand-200 text-lg">Revisión de rentabilidad, riesgos y costes estimados para este {tipoInmueble.toLowerCase()}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-6 mx-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">¿Cuánto deberías pujar realmente por esta subasta?</h2>
            <p className="text-slate-700 mb-4">Muchos inversores pierden dinero porque calculan mal la puja máxima teniendo en cuenta cargas, costes y margen de seguridad.</p>
            <Link to={`/calcular-puja-subasta/${slug}`} className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
              Calcular puja máxima
            </Link>
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

            {/* H2: Datos de la subasta */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                <FileText className="text-brand-600" size={24} /> Datos de la subasta
              </h2>
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-slate-100">
                    {zona && (
                      <tr className="bg-white">
                        <td className="px-6 py-4 font-bold text-slate-900 w-1/3">Dirección o zona</td>
                        <td className="px-6 py-4 text-slate-600">{zona}</td>
                      </tr>
                    )}
                    {ciudad && (
                      <tr className="bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-slate-900">Ciudad</td>
                        <td className="px-6 py-4 text-slate-600">{ciudad}</td>
                      </tr>
                    )}
                    {procedureType && (
                      <tr className="bg-white">
                        <td className="px-6 py-4 font-bold text-slate-900">Tipo de procedimiento</td>
                        <td className="px-6 py-4 text-slate-600">{procedureType}</td>
                      </tr>
                    )}
                    {valorMercado > 0 && (
                      <tr className="bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-slate-900">Valor de tasación</td>
                        <td className="px-6 py-4 text-slate-600">{valorMercado.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</td>
                      </tr>
                    )}
                    {deudas > 0 && (
                      <tr className="bg-white">
                        <td className="px-6 py-4 font-bold text-slate-900">Deuda reclamada</td>
                        <td className="px-6 py-4 text-slate-600">{deudas.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</td>
                      </tr>
                    )}
                    {surface && (
                      <tr className="bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-slate-900">Superficie</td>
                        <td className="px-6 py-4 text-slate-600">{surface} m²</td>
                      </tr>
                    )}
                    {auctionData?.boeId && (
                      <tr className="bg-white">
                        <td className="px-6 py-4 font-bold text-slate-900">Identificador BOE</td>
                        <td className="px-6 py-4 text-slate-600 font-mono">{auctionData.boeId}</td>
                      </tr>
                    )}
                    {auctionData?.boeUrl && (
                      <tr className="bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-slate-900">Enlace al BOE</td>
                        <td className="px-6 py-4">
                          <a 
                            href={auctionData.boeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-brand-600 font-bold hover:underline inline-flex items-center gap-1"
                          >
                            Ver en portal oficial <ArrowRight size={14} />
                          </a>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* H2: Análisis técnico y observaciones */}
            {description && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                  <Search className="text-brand-600" size={24} /> Análisis técnico y observaciones
                </h2>
                <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-6 text-slate-700 leading-relaxed">
                  <p className="whitespace-pre-line">{description}</p>
                </div>
              </div>
            )}

            {/* BLOQUE DE CONVERSIÓN 1: CALENDLY */}
            <div className="bg-brand-50 border border-brand-100 rounded-2xl p-8 my-10 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">¿Quieres el análisis completo del expediente?</h3>
                  <p className="text-slate-700 mb-4">El análisis público resume los datos principales de la subasta.</p>
                  <p className="text-slate-700 mb-4">Antes de pujar muchos inversores solicitan una revisión completa del expediente:</p>
                  <ul className="space-y-2 text-slate-700 mb-6">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-brand-600 rounded-full"></div>
                      revisión de cargas registrales
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-brand-600 rounded-full"></div>
                      análisis de la situación posesoria
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-brand-600 rounded-full"></div>
                      estrategia de puja recomendada
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-brand-600 rounded-full"></div>
                      estimación de valor real del activo
                    </li>
                  </ul>
                  <a 
                    href="https://calendly.com/activosoffmarket" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-brand-700 text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-800 transition-all shadow-md"
                  >
                    Solicitar análisis completo <ArrowRight size={20} />
                  </a>
                </div>
                <div className="hidden md:block w-1/3">
                  <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-inner">
                    <FileText className="text-brand-600 w-12 h-12 mb-4" />
                    <div className="h-2 w-full bg-slate-100 rounded mb-2"></div>
                    <div className="h-2 w-3/4 bg-slate-100 rounded mb-2"></div>
                    <div className="h-2 w-full bg-slate-100 rounded mb-4"></div>
                    <div className="h-8 w-full bg-brand-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* H2: Precio de mercado del inmueble en la zona */}
            {surface && (marketPriceM2 || (marketPriceM2Min && marketPriceM2Max)) && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                  <TrendingUp className="text-brand-600" size={24} /> Precio de mercado del inmueble en la zona
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 mb-6">
                  <p>
                    En la zona de <strong>{ciudad}{zona ? ` / ${zona}` : ''}</strong>, el precio de la vivienda se sitúa 
                    {marketPriceM2 ? (
                      <> aproximadamente en <strong>{marketPriceM2.toLocaleString('es-ES')} €/m²</strong> </>
                    ) : (
                      <> en un rango de entre <strong>{marketPriceM2Min?.toLocaleString('es-ES')} €/m²</strong> y <strong>{marketPriceM2Max?.toLocaleString('es-ES')} €/m²</strong> </>
                    )}
                    según portales inmobiliarios y testigos de la zona.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Cálculo de mercado</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Superficie:</span>
                        <span className="font-medium text-slate-900">{surface} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Precio estimado:</span>
                        <span className="font-medium text-slate-900">
                          {marketPriceM2 ? (
                            `${marketPriceM2.toLocaleString('es-ES')} €/m²`
                          ) : (
                            `${marketPriceM2Min?.toLocaleString('es-ES')} - ${marketPriceM2Max?.toLocaleString('es-ES')} €/m²`
                          )}
                        </span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center">
                        <span className="font-bold text-slate-900">Valor estimado de mercado:</span>
                        <span className="text-xl font-bold text-emerald-600">
                          {results.effectiveMarketValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100">
                    <h3 className="text-sm font-bold text-brand-700 uppercase tracking-wider mb-4">Comparativa subasta</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-brand-800">Valor de tasación en la subasta:</span>
                        <span className="font-medium text-brand-900">{valorMercado > 0 ? valorMercado.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : 'No especificado'}</span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-brand-200">
                        <p className="text-sm text-brand-800">
                          Esto permite entender rápidamente el posible margen de inversión comparando el valor real de mercado con el valor de tasación oficial del juzgado.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* H2: Primer análisis de la oportunidad */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                <Search className="text-brand-600" size={24} /> Primer análisis de la oportunidad
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  Analizando este <strong>{tipoInmueble.toLowerCase()} en {ciudad}{zona ? ` / ${zona}` : ''}</strong>, encontramos una posible oportunidad de inversión a través de subasta judicial.
                </p>
                
                {valorMercado > 0 && (
                  <p>
                    El valor de tasación publicado es de <strong>{valorMercado.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</strong>.
                  </p>
                )}

                {surface && marketPriceM2 ? (
                  <p>
                    Si estimamos el precio medio de mercado en aproximadamente <strong>{marketPriceM2.toLocaleString('es-ES')} €/m²</strong> y consideramos una superficie de <strong>{surface} m²</strong>, el valor de mercado aproximado podría situarse en torno a <strong>{(surface * marketPriceM2).toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</strong>.
                  </p>
                ) : (
                  <p>
                    El éxito de esta operación dependerá de la correcta evaluación de los costes ocultos y del margen de seguridad entre el valor de adjudicación y el valor real de mercado.
                  </p>
                )}

                <p>
                  Esto permite evaluar si existe margen suficiente para una inversión con seguridad. Antes de participar, es fundamental revisar la certificación de cargas, el estado posesorio del inmueble y calcular con precisión los impuestos (ITP en {comunidad}), gastos de registro, notaría y posibles reformas.
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

            {/* H2: Ver más subastas inmobiliarias como esta */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                <Send className="text-brand-600" size={24} /> Ver más subastas inmobiliarias como esta
              </h2>
              
              <div className="bg-brand-50 rounded-2xl p-8 border border-brand-100 text-center shadow-sm">
                <p className="text-slate-700 mb-4 font-medium">
                  La mayoría de oportunidades de inversión en subastas no se publican en abierto.
                </p>
                <p className="text-slate-600 mb-8">
                  En el canal de Telegram de Activos Off-Market publico regularmente análisis de subastas activas, oportunidades detectadas en el BOE y comentarios sobre riesgos y rentabilidad.
                </p>
                <a 
                  href="https://t.me/activosOffmarket" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#0088cc] text-white font-bold py-4 px-8 rounded-xl hover:bg-[#0077b3] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 w-full sm:w-auto"
                >
                  <Send size={20} /> Unirme al canal de subastas
                </a>
              </div>
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

            {/* BLOQUE DE CONVERSIÓN 2: TELEGRAM PREMIUM */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 my-10 shadow-sm text-center">
              <Send className="text-brand-600 mx-auto mb-4" size={40} />
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">Más subastas analizadas cada semana</h3>
              <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                En el canal premium publico más activos detectados y explico el contexto jurídico y la estrategia posible en muchas subastas que no aparecen en el canal gratuito.
              </p>
              <a 
                href="https://sublaunch.com/activosoffmarket" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold py-4 px-10 rounded-xl hover:bg-brand-700 transition-all shadow-md"
              >
                Ver canal premium <ArrowRight size={20} />
              </a>
            </div>

            {/* H2: Subastas inmobiliarias en {city} */}
            <div className="mt-12 pt-12 border-t border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                <MapPin className="text-brand-600" size={24} /> Subastas inmobiliarias en {ciudad}
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  Las subastas inmobiliarias en <strong>{ciudad}</strong> incluyen viviendas, locales y otros activos procedentes de ejecuciones hipotecarias y procedimientos judiciales. En esta ciudad se publican regularmente oportunidades en el BOE y en diversos juzgados que pueden representar una excelente inversión si se analizan correctamente.
                </p>
                <p>
                  Antes de pujar en una subasta en <strong>{ciudad}</strong> es importante analizar correctamente las cargas, la ocupación del inmueble y el valor real de mercado. Puedes consultar nuestra <Link to={cityRoute || `/subastas-${ciudad.toLowerCase().replace(/\s+/g, '-')}`} className="text-brand-600 font-bold hover:underline">guía específica de subastas en {ciudad}</Link> para conocer mejor el mercado local.
                </p>
                <p>
                  Si necesitas ayuda para calcular los números de tu próxima operación, utiliza nuestra <Link to={ROUTES.CALCULATOR} className="text-brand-600 font-bold hover:underline">calculadora de subastas</Link> para obtener un desglose detallado de impuestos y rentabilidad.
                </p>
              </div>
            </div>

            {/* H2: Preguntas frecuentes sobre subastas inmobiliarias */}
            <div className="mt-12 pt-12 border-t border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                <HelpCircle className="text-brand-600" size={24} /> Preguntas frecuentes sobre subastas inmobiliarias
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">¿Puede estar ocupado un inmueble comprado en subasta?</h3>
                  <p className="text-slate-600">
                    Sí, es una de las situaciones más comunes. Un inmueble en subasta puede estar ocupado por el anterior propietario, por inquilinos con contrato en vigor o incluso por ocupantes sin título legal. Es fundamental analizar la situación posesoria en el edicto y la certificación de cargas antes de pujar, ya que esto determinará el tiempo y el coste necesario para tomar posesión del activo.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">¿Qué impuestos se pagan al adjudicarse una subasta?</h3>
                  <p className="text-slate-600">
                    Al adquirir un inmueble en subasta, el adjudicatario debe liquidar normalmente el Impuesto de Transmisiones Patrimoniales (ITP), cuyo tipo varía según la Comunidad Autónoma (generalmente entre el 4% y el 10%). Además, se deben considerar los gastos de inscripción en el Registro de la Propiedad y, en algunos casos, gastos de comunidad o IBI pendientes que la ley obliga a asumir al nuevo propietario.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">¿Qué ocurre si nadie puja en una subasta judicial?</h3>
                  <p className="text-slate-600">
                    Si una subasta queda desierta (sin postores), el acreedor ejecutante tiene el derecho de solicitar la adjudicación del bien. Según la Ley de Enjuiciamiento Civil (LEC), los porcentajes y condiciones de esta adjudicación dependen de si el inmueble es la vivienda habitual del deudor o no, y de la cuantía de la deuda reclamada.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">¿Cómo calcular la puja máxima en una subasta?</h3>
                  <p className="text-slate-600">
                    Para calcular tu puja máxima, debes restar al valor real de mercado todos los costes asociados: impuestos (ITP), gastos de registro, deudas preferentes (comunidad e IBI), posibles reformas y el margen de beneficio que desees obtener. Una herramienta útil para este cálculo es nuestra <Link to={ROUTES.CALCULATOR} className="text-brand-600 font-bold hover:underline">calculadora de subastas</Link>, que te ayudará a no sobrepujar y asegurar tu rentabilidad.
                  </p>
                </div>
              </div>
            </div>

            {/* H2: Otras subastas inmobiliarias analizadas */}
            {slug && auctionData && (
              <RelatedAuctions currentAuctionSlug={slug} currentAuctionData={auctionData} />
            )}
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

