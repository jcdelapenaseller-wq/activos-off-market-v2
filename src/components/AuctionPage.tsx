import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  Calculator, Gavel, TrendingUp, Search, ChevronRight, 
  MapPin, Home, DollarSign, AlertTriangle, CheckCircle, 
  Info, ArrowRight, FileText, Scale, ShieldCheck, AlertOctagon,
  Clock, Calendar, User, Share2, Printer
} from 'lucide-react';
import { AUCTIONS } from '../data/auctions';
import { ROUTES } from '../constants/routes';
import { isAuctionFinished } from '../utils/auctionHelpers';
import { normalizePropertyType, normalizeCity, normalizeLocationLabel, normalizeProvince } from '../utils/auctionNormalizer';
import { trackConversion } from '../utils/tracking';
import FinishedAuctionBanner from './FinishedAuctionBanner';
import ConversionBlock from './ConversionBlock';
import PremiumValueBlock from './PremiumValueBlock';
import ConsultingCTA from './ConsultingCTA';
import RelatedAuctions from './RelatedAuctions';
import Header from './Header';
import Footer from './Footer';

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

const AuctionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const auction = slug ? AUCTIONS[slug] : null;

  // Calculator State
  const [valorMercado, setValorMercado] = useState<number | ''>('');
  const [reforma, setReforma] = useState<number | ''>('');
  const [deudas, setDeudas] = useState<number | ''>('');
  const [otrosGastos, setOtrosGastos] = useState<number | ''>('');
  const [comunidad, setComunidad] = useState<string>('Madrid');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (auction) {
      setValorMercado(auction.appraisalValue || '');
      setDeudas(auction.claimedDebt || '');
      setComunidad(auction.city || 'Madrid');
      document.title = `Subasta de ${normalizePropertyType(auction.propertyType)} en ${normalizeCity(auction)} | Activos Off-Market`;
    }
  }, [slug, auction]);

  const results = useMemo(() => {
    const vm = Number(valorMercado) || 0;
    const ref = Number(reforma) || 0;
    const deu = Number(deudas) || 0;
    const og = Number(otrosGastos) || 0;

    if (vm === 0) return { precioMaxPuja: null, totalExpenses: 0 };

    const itpRate = ITP_RATES[comunidad] || 0.08;
    const baseBid = vm * 0.7;
    const itp = baseBid * itpRate;
    const registroNotaria = baseBid * 0.012;
    const gestoria = 500;
    
    const totalExpenses = itp + registroNotaria + gestoria + ref + deu + og;
    const precioMaxPuja = baseBid - totalExpenses;
    
    return { precioMaxPuja, totalExpenses };
  }, [valorMercado, reforma, deudas, otrosGastos, comunidad]);

  if (!auction) return <Navigate to={ROUTES.HOME} replace />;

  const isFinished = isAuctionFinished(auction.auctionDate);
  const cityName = normalizeCity(auction);
  const provinceName = normalizeProvince(auction.province || auction.city);
  const propertyType = normalizePropertyType(auction.propertyType);
  const locationLabel = normalizeLocationLabel(auction);

  const opportunityRatio = useMemo(() => {
    if (auction.appraisalValue && auction.claimedDebt) {
      return 1 - (auction.claimedDebt / auction.appraisalValue);
    }
    return null;
  }, [auction]);

  const getOpportunityMessage = (ratio: number | null) => {
    if (ratio === null) return { text: "Análisis requerido", color: "bg-amber-100 text-amber-800 border-amber-200" };
    if (ratio > 0.4) return { text: "Alta oportunidad", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    if (ratio >= 0.2) return { text: "Oportunidad interesante", color: "bg-blue-100 text-blue-800 border-blue-200" };
    return { text: "Margen ajustado", color: "bg-slate-100 text-slate-800 border-slate-200" };
  };

  const oppMessage = getOpportunityMessage(opportunityRatio);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
          <ChevronRight size={14} className="mx-2" />
          <Link to={`/subastas/${provinceName.toLowerCase()}`} className="hover:text-brand-600 transition-colors capitalize">Subastas en {provinceName}</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md">Ficha de activo</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <main className="lg:col-span-8">
            {isFinished && auction.auctionDate && (
              <FinishedAuctionBanner auctionDate={auction.auctionDate} />
            )}

            <header className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${oppMessage.color}`}>
                  {oppMessage.text}
                </span>
                {isFinished ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold border bg-slate-100 text-slate-600 border-slate-200">
                    Subasta Finalizada
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold border bg-brand-50 text-brand-700 border-brand-200">
                    Subasta Activa
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6 leading-tight">
                {propertyType} en subasta en {cityName}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm mb-8">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-brand-500" />
                  <span>{locationLabel}</span>
                </div>
                {auction.auctionDate && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-brand-500" />
                    <span>Finaliza: {new Date(auction.auctionDate).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>

              {/* Quick Data Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Valor Tasación</span>
                  <span className="text-xl font-bold text-slate-900">
                    {auction.appraisalValue ? auction.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : 'Sin datos'}
                  </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Deuda Reclamada</span>
                  <span className="text-xl font-bold text-slate-900">
                    {auction.claimedDebt ? auction.claimedDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : 'Sin datos'}
                  </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Descuento Bruto</span>
                  <span className={`text-xl font-bold ${opportunityRatio && opportunityRatio > 0.4 ? 'text-emerald-600' : 'text-brand-600'}`}>
                    {opportunityRatio ? `${(opportunityRatio * 100).toFixed(1)}%` : '---'}
                  </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Tipo de Activo</span>
                  <span className="text-lg font-bold text-slate-900 truncate" title={propertyType}>{propertyType}</span>
                </div>
              </div>

              {/* CTAs Above the Fold */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-brand-100 shadow-md mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">¿Te interesa esta subasta?</h3>
                    <p className="text-amber-700 font-medium flex items-center gap-2">
                      <Clock size={18} /> Este tipo de oportunidades no duran mucho
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <a 
                        href="https://calendly.com/activosoffmarket" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={() => trackConversion(provinceName, 'ficha', 'premium')}
                        className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors text-center flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                      >
                        🔒 Ver análisis completo (premium)
                      </a>
                      <p className="text-[10px] text-slate-500 text-center font-medium">
                        Nuevas oportunidades cada día que no se publican en el canal gratuito
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <a 
                        href="https://calendly.com/activosoffmarket" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={() => trackConversion(provinceName, 'ficha', 'consultoria')}
                        className="bg-brand-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-brand-700 transition-colors text-center flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                      >
                        📞 Analizar conmigo esta subasta
                      </a>
                      <p className="text-[10px] text-slate-500 text-center font-medium">
                        Incluye: análisis, riesgos reales y estrategia de puja
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500" /> Inversores ya usan este análisis para decidir antes de pujar
                  </p>
                </div>
              </div>
            </header>

            {/* Analysis Block */}
            <section className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm mb-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
                  <FileText className="text-brand-600" /> Análisis Técnico
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Análisis basado en datos oficiales del BOE
                </p>
                {auction.boeUrl && (
                  <a 
                    href={auction.boeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    Ver edicto BOE <ArrowRight size={14} />
                  </a>
                )}
              </div>
              
              <div className="prose prose-slate max-w-none mb-10">
                {auction.appraisalValue && auction.claimedDebt ? (
                  <>
                    <p className="text-lg leading-relaxed text-slate-700">
                      Este activo presenta un <strong>descuento bruto del {(opportunityRatio! * 100).toFixed(1)}%</strong> respecto a su valor de tasación ({auction.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}). La deuda reclamada por el ejecutante asciende a {auction.claimedDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}.
                    </p>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-6">
                      <p className="text-slate-700 mb-3">
                        <strong className="text-emerald-700 flex items-center gap-2 mb-1"><TrendingUp size={18}/> Potencial:</strong> 
                        Existe un margen de seguridad amplio para cubrir gastos de ITP, notaría y posibles reformas, manteniendo rentabilidad.
                      </p>
                      <p className="text-slate-700">
                        <strong className="text-amber-700 flex items-center gap-2 mb-1"><AlertTriangle size={18}/> Riesgo:</strong> 
                        Es imprescindible solicitar la certificación de cargas para descartar anotaciones preventivas o hipotecas preferentes no incluidas en la deuda reclamada, así como verificar el estado posesorio del inmueble.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="shrink-0 mt-1" size={24} />
                      <div>
                        <h3 className="font-bold text-lg mb-2">Información incompleta en el edicto</h3>
                        <p className="mb-4 text-amber-900/80">
                          El expediente judicial publicado no detalla la deuda reclamada o el valor de tasación. <strong>Es necesario revisar la certificación de cargas y el edicto completo</strong> para calcular la viabilidad de esta inversión y evitar adjudicaciones con deudas ocultas.
                        </p>
                        <a 
                          href="https://calendly.com/activosoffmarket" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={() => trackConversion(provinceName, 'ficha', 'consultoria')}
                          className="inline-flex items-center gap-2 bg-amber-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-900 transition-colors shadow-sm"
                        >
                          Solicitar revisión del expediente <ChevronRight size={16} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Auction Timeline */}
              <div className="border-t border-slate-100 pt-10">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Clock size={14} /> Estado de la subasta
                </h3>
                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2"></div>
                  <div className="relative flex justify-between">
                    <div className="bg-white pr-4 relative z-10">
                      <div className="w-4 h-4 rounded-full bg-brand-600 border-4 border-brand-100 mb-2"></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Publicación</p>
                    </div>
                    <div className="bg-white px-4 relative z-10 text-center">
                      <div className="w-4 h-4 rounded-full bg-brand-600 border-4 border-brand-100 mb-2 mx-auto"></div>
                      <p className="text-[10px] font-bold text-brand-600 uppercase">En curso</p>
                    </div>
                    <div className="bg-white pl-4 relative z-10 text-right">
                      <div className={`w-4 h-4 rounded-full mb-2 ml-auto ${isFinished ? 'bg-slate-300' : 'bg-slate-100 border-2 border-slate-200'}`}></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Finalización</p>
                      <p className="text-[10px] text-slate-400">{auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('es-ES') : 'Pendiente'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <ConsultingCTA 
              isHighUrgency={opportunityRatio === null} 
              province={provinceName} 
            />

            <PremiumValueBlock />

            {/* Calculator Section */}
            {auction.appraisalValue && (
              <section id="calculadora" className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-12">
                <div className="bg-brand-900 text-white p-8">
                  <div className="flex items-center gap-4">
                    <Calculator className="text-brand-300" size={32} />
                    <div>
                      <h2 className="text-xl font-bold">Calculadora de puja máxima</h2>
                      <p className="text-brand-200 text-sm">Ajusta los valores para este activo en {cityName}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-8 md:p-10 grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <DollarSign size={16} className="text-brand-600" /> Valor de tasación estimado (€)
                      </label>
                      <input 
                        type="number" 
                        value={valorMercado} 
                        onChange={(e) => setValorMercado(e.target.value === '' ? '' : Number(e.target.value))} 
                        className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        placeholder="Ej: 250000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <AlertOctagon size={16} className="text-brand-600" /> Deudas y cargas anteriores (€)
                      </label>
                      <input 
                        type="number" 
                        value={deudas} 
                        onChange={(e) => setDeudas(e.target.value === '' ? '' : Number(e.target.value))} 
                        className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        placeholder="Ej: 15000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <TrendingUp size={16} className="text-brand-600" /> Reforma estimada (€)
                      </label>
                      <input 
                        type="number" 
                        value={reforma} 
                        onChange={(e) => setReforma(e.target.value === '' ? '' : Number(e.target.value))} 
                        className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        placeholder="Ej: 30000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Comunidad Autónoma (para ITP)</label>
                      <select 
                        value={comunidad} 
                        onChange={(e) => setComunidad(e.target.value)} 
                        className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                      >
                        {Object.keys(ITP_RATES).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-8 flex flex-col justify-center items-center text-center border border-slate-100">
                    <span className="text-slate-500 font-medium uppercase tracking-wider text-xs mb-2">Puja máxima recomendada</span>
                    <span className="text-4xl md:text-5xl font-bold text-brand-900 mb-4">
                      {results.precioMaxPuja === null 
                        ? <span className="text-2xl text-slate-400 font-normal">Introduce valores</span>
                        : results.precioMaxPuja > 0 
                          ? results.precioMaxPuja.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})
                          : <span className="text-red-500">Inviable</span>}
                    </span>
                    <div className="bg-emerald-100 text-emerald-800 px-4 py-1 rounded-full text-sm font-bold mb-6 flex items-center gap-1">
                      <CheckCircle size={14} /> Margen de seguridad del 30%
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Este cálculo incluye una estimación de ITP ({ITP_RATES[comunidad] * 100}%), gastos de registro, notaría y gestoría.
                    </p>
                  </div>
                </div>
              </section>
            )}

            <ConversionBlock />
            
            {slug && <div className="mt-16"><RelatedAuctions currentAuctionSlug={slug} currentAuctionData={auction} /></div>}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 block">Asesoría Premium</span>
                <h3 className="font-serif text-2xl font-bold mb-4">¿Quieres pujar con seguridad?</h3>
                <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                  Analizamos el expediente judicial completo y la certificación de cargas para que no asumas riesgos innecesarios.
                </p>
                <a 
                  href="https://calendly.com/activosoffmarket" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => trackConversion(provinceName, 'ficha', 'consultoria')}
                  className="block w-full bg-white text-slate-900 font-bold py-4 px-4 rounded-xl text-center hover:bg-brand-50 transition-all flex items-center justify-center gap-2"
                >
                  Solicitar análisis <ArrowRight size={16}/>
                </a>
              </div>

              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Info size={18} className="text-brand-600"/>
                  Datos de la subasta
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">BOE ID:</span>
                    <span className="font-mono text-slate-900">{auction.boeId || 'Consultar'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estado:</span>
                    <span className={`font-bold ${isFinished ? 'text-slate-400' : 'text-emerald-600'}`}>{isFinished ? 'Finalizada' : 'Activa'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Provincia:</span>
                    <span className="text-slate-900">{cityName}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AuctionPage;
