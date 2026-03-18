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
      
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-20">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-slate-500 mb-10 font-medium" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
          <ChevronRight size={14} className="mx-2" />
          <Link to={`/subastas/${provinceName.toLowerCase()}`} className="hover:text-brand-600 transition-colors capitalize">Subastas en {provinceName}</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md">Ficha de activo</span>
        </nav>

        <div className="space-y-20">
          {/* Main Content */}
          <div className="w-full">
            {isFinished && auction.auctionDate && (
              <FinishedAuctionBanner auctionDate={auction.auctionDate} />
            )}

            <header className="mb-24">
              <div className="flex items-center gap-3 mb-10">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${oppMessage.color}`}>
                  {oppMessage.text}
                </span>
                {isFinished ? (
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold border bg-slate-100 text-slate-600 border-slate-200">
                    Subasta Finalizada
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold border bg-brand-50 text-brand-700 border-brand-200">
                    Subasta Activa
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-8 leading-tight">
                {propertyType} en subasta en {cityName}
              </h1>
              
              <div className="flex flex-wrap items-center gap-8 text-slate-500 text-base mb-12">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-brand-500" />
                  <span>{locationLabel}</span>
                </div>
                {auction.auctionDate && (
                  <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-brand-500" />
                    <span>Finaliza: {new Date(auction.auctionDate).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>

              {/* Quick Data Grid (Technical Block) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-2">Valor Tasación</span>
                  <span className="text-2xl font-bold text-slate-900">
                    {auction.appraisalValue ? auction.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : 'Sin datos'}
                  </span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-2">Deuda Reclamada</span>
                  <span className="text-2xl font-bold text-slate-900">
                    {auction.claimedDebt ? auction.claimedDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : 'Sin datos'}
                  </span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-2">Descuento Bruto</span>
                  <span className={`text-2xl font-bold ${opportunityRatio && opportunityRatio > 0.4 ? 'text-emerald-600' : 'text-brand-600'}`}>
                    {opportunityRatio ? `${(opportunityRatio * 100).toFixed(1)}%` : '---'}
                  </span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-2">Tipo de Activo</span>
                  <span className="text-xl font-bold text-slate-900 truncate" title={propertyType}>{propertyType}</span>
                </div>
              </div>
            </header>

            {/* Analysis Block */}
            <section className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm mb-16">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <h2 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
                  <FileText className="text-brand-600" /> Análisis del Activo
                </h2>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                      Metodología propia
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Análisis basado en datos oficiales del BOE
                    </p>
                  </div>
                  {auction.boeUrl && (
                    <a 
                      href={auction.boeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 mt-1"
                    >
                      Ver edicto original <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              </div>
              
              <div className="prose prose-slate max-w-none mb-12">
                {auction.appraisalValue && auction.claimedDebt ? (
                  <>
                    <p className="text-xl leading-relaxed text-slate-700">
                      Este activo presenta un <strong>descuento bruto del {(opportunityRatio! * 100).toFixed(1)}%</strong> respecto a su valor de tasación ({auction.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}). La deuda reclamada por el ejecutante asciende a {auction.claimedDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}.
                    </p>
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 mt-10">
                      <p className="text-slate-700 mb-4 text-lg">
                        <strong className="text-emerald-700 flex items-center gap-2 mb-2"><TrendingUp size={20}/> Potencial:</strong> 
                        Existe un margen de seguridad amplio para cubrir gastos de ITP, notaría y posibles reformas, manteniendo rentabilidad.
                      </p>
                      <p className="text-slate-700 text-lg">
                        <strong className="text-amber-700 flex items-center gap-2 mb-2"><AlertTriangle size={20}/> Riesgo:</strong> 
                        Es imprescindible solicitar la certificación de cargas para descartar anotaciones preventivas o hipotecas preferentes no incluidas en la deuda reclamada, así como verificar el estado posesorio del inmueble.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-amber-800">
                    <div className="flex items-start gap-4">
                      <AlertTriangle className="shrink-0 mt-1" size={28} />
                      <div>
                        <h3 className="font-bold text-xl mb-3">Información incompleta en el edicto</h3>
                        <p className="mb-6 text-amber-900/80 text-lg leading-relaxed">
                          El expediente judicial publicado no detalla la deuda reclamada o el valor de tasación. <strong>Es necesario revisar la certificación de cargas y el edicto completo</strong> para calcular la viabilidad de esta inversión y evitar adjudicaciones con deudas ocultas.
                        </p>
                        <a 
                          href="https://calendly.com/activosoffmarket" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={() => trackConversion(provinceName, 'ficha', 'consultoria')}
                          className="inline-flex items-center gap-2 bg-amber-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-900 transition-colors shadow-md"
                        >
                          Solicitar análisis <ChevronRight size={18} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic SEO Block */}
              <div className="mt-12 pt-10 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Scale size={20} className="text-brand-600" /> 
                  Contexto del procedimiento
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {auction.boeId?.startsWith('SUB-JA') || auction.boeUrl?.includes('subastas.boe.es') ? (
                    "Las subastas judiciales suelen derivar de ejecuciones hipotecarias o títulos judiciales. Implican una revisión exhaustiva del decreto de adjudicación y la cancelación de cargas posteriores. El riesgo principal reside en las cargas preferentes que no se extinguen con la subasta."
                  ) : auction.boeId?.startsWith('SUB-AT') ? (
                    "Las subastas de la Agencia Tributaria tienen procedimientos específicos de adjudicación y plazos de depósito distintos. Es vital verificar si existen cargas anteriores en el registro de la propiedad, ya que la AEAT no siempre las detalla en el edicto inicial."
                  ) : (
                    "Este procedimiento administrativo requiere una validación técnica de los plazos y la documentación aportada. Cada organismo (Seguridad Social, Ayuntamientos, etc.) tiene sus propias reglas de puja y adjudicación."
                  )}
                </p>
                {!auction.appraisalValue && (
                  <p className="mt-4 text-slate-500 italic text-sm">
                    * La falta de datos en el anuncio inicial suele indicar la necesidad de una investigación directa en el juzgado o administración correspondiente antes de realizar cualquier depósito.
                  </p>
                )}
              </div>

              {/* Auction Timeline */}
              <div className="border-t border-slate-100 pt-10 mt-12">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                  <Clock size={14} /> Estado de la subasta
                </h3>
                <div className="relative max-w-2xl mx-auto">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2"></div>
                  <div className="relative flex justify-between">
                    <div className="bg-white pr-4 relative z-10">
                      <div className="w-5 h-5 rounded-full bg-brand-600 border-4 border-brand-100 mb-3"></div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Publicación</p>
                    </div>
                    <div className="bg-white px-4 relative z-10 text-center">
                      <div className="w-5 h-5 rounded-full bg-brand-600 border-4 border-brand-100 mb-3 mx-auto"></div>
                      <p className="text-xs font-bold text-brand-600 uppercase">En curso</p>
                    </div>
                    <div className="bg-white pl-4 relative z-10 text-right">
                      <div className={`w-5 h-5 rounded-full mb-3 ml-auto ${isFinished ? 'bg-slate-300' : 'bg-slate-100 border-2 border-slate-200'}`}></div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Finalización</p>
                      <p className="text-xs text-slate-400 mt-1">{auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('es-ES') : 'Pendiente'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <ConsultingCTA 
              isHighUrgency={opportunityRatio === null} 
              province={provinceName} 
            />

            {slug && <div className="mt-32"><RelatedAuctions currentAuctionSlug={slug} currentAuctionData={auction} /></div>}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AuctionPage;
