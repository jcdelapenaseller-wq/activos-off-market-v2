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

  useEffect(() => {
    window.scrollTo(0, 0);
    if (auction) {
      setValorMercado(auction.appraisalValue || '');
      setDeudas(auction.claimedDebt || '');
      setComunidad(auction.city || 'Madrid');
      
      // DEBUG: Address field analysis
      console.log('DEBUG - Auction Address Field:', {
        raw: auction.address,
        exists: !!auction.address,
        type: typeof auction.address
      });
      
      const propertyType = normalizePropertyType(auction.propertyType);
      const cityName = normalizeCity(auction);
      const discount = auction.appraisalValue && auction.claimedDebt 
        ? Math.round((1 - (auction.claimedDebt / auction.appraisalValue)) * 100) 
        : 0;
      
      let addressPart = '';
      if (auction.address) {
        // Extract street and number more precisely
        const cleanAddress = auction.address.split(',')[0].trim();
        const words = cleanAddress.split(' ');
        addressPart = words.slice(0, 4).join(' ');
      }
      
      const streetPart = addressPart ? ` (${addressPart})` : '';
      const discountPart = discount > 0 ? ` con ${discount}% de descuento` : '';
      const title = `${propertyType} en subasta en ${cityName}${streetPart}${discountPart}`;
      
      document.title = title.length > 70 ? title.substring(0, 67) + '...' : title;
    }
  }, [slug, auction]);

  const analysisInsights = useMemo(() => {
    if (!auction) return null;

    const discount = opportunityRatio ? Math.round(opportunityRatio * 100) : 0;
    const isJudicial = auction.boeId?.startsWith('SUB-JA');
    
    // Market Context Logic
    let marketContext = "";
    if (auction.appraisalValue) {
      const minRange = Math.round(auction.appraisalValue * 0.85 / 1000) * 1000;
      const maxRange = Math.round(auction.appraisalValue * 1.05 / 1000) * 1000;
      marketContext = `El valor de mercado en esta zona de ${cityName} para activos de tipología ${propertyType.toLowerCase()} oscila entre los ${minRange.toLocaleString('es-ES')}€ y ${maxRange.toLocaleString('es-ES')}€. La tasación oficial de ${auction.appraisalValue.toLocaleString('es-ES')}€ parece estar alineada con los precios de cierre recientes en el barrio.`;
    } else {
      marketContext = `Dada la falta de tasación oficial, el valor debe estimarse por comparación directa en ${provinceName}. Los precios medios en la zona sugieren una demanda estable, lo que reduce el riesgo de liquidez tras la adjudicación.`;
    }

    // Investor Profile Logic
    let investorProfile = "";
    if (discount > 45) {
      investorProfile = "Inversores oportunistas y especialistas en 'flipping'. Este nivel de descuento permite absorber costes de desahucio y reformas integrales manteniendo una rentabilidad de doble dígito.";
    } else if (discount > 25) {
      investorProfile = "Inversores de rentabilidad (Buy-to-Rent). El margen es ideal para patrimonialistas que buscan un coste de adquisición inferior al mercado para maximizar el 'yield' por alquiler.";
    } else {
      investorProfile = "Perfil conservador o finalista. Con un margen inferior al 25%, esta subasta es atractiva principalmente para quien busca su vivienda habitual a un precio competitivo, asumiendo los tiempos del juzgado.";
    }

    // Interpretation Logic
    let interpretation = "";
    if (auction.appraisalValue && auction.claimedDebt) {
      const ratio = (auction.claimedDebt / auction.appraisalValue) * 100;
      interpretation = `La oportunidad nace de una deuda que solo representa el ${ratio.toFixed(1)}% del valor del activo. Esto indica que el acreedor (probablemente una entidad financiera) tiene un incentivo alto para cerrar el proceso rápido, permitiendo que el mercado capture el valor restante como beneficio.`;
    } else {
      interpretation = "La ausencia de datos de deuda en el edicto sugiere un proceso administrativo o judicial donde el interés no es puramente monetario, o bien una falta de transparencia que requiere una personación física en el juzgado para validar el expediente.";
    }

    // Practical Implications
    const practicalImplications = isJudicial 
      ? "El adjudicatario deberá solicitar el testimonio del decreto de adjudicación y el mandamiento de cancelación de cargas. Es fundamental verificar si existe derecho de retracto por parte de inquilinos o de la administración pública (especialmente en zonas tensionadas)."
      : "Al ser una subasta administrativa (AEAT/SS), el proceso de toma de posesión suele ser más directo, pero la responsabilidad de verificar cargas anteriores recae totalmente en el postor, ya que la administración no garantiza la libertad de cargas.";

    // Scenarios
    const bestCase = "Adjudicación por el 50-60% del valor, inmueble en buen estado y posesión obtenida en menos de 6 meses mediante entrega voluntaria de llaves.";
    const worstCase = "Necesidad de lanzar un proceso de desahucio (12-18 meses), existencia de deudas de IBI/Comunidad de los últimos 4 años y necesidad de reforma estructural.";

    // Sense Logic
    const hasSense = discount > 25 && auction.claimedDebt;
    const senseText = hasSense 
      ? "El margen bruto permite cubrir con seguridad el ITP, gastos de registro y una reforma media sin comprometer el capital principal."
      : "El interés de esta subasta no es el precio de derribo, sino la exclusividad del activo o su ubicación estratégica en una zona sin stock disponible.";
    
    const cautionText = !auction.claimedDebt 
      ? "Incertidumbre total sobre el precio de salida real y las cargas que se mantienen."
      : isJudicial 
        ? "El expediente no aclara la situación posesoria; debe asumirse que el inmueble está ocupado a efectos de cálculo de rentabilidad."
        : "Las subastas administrativas requieren depósito inmediato y tienen plazos de pago más estrictos que las judiciales.";

    return { marketContext, investorProfile, senseText, cautionText, interpretation, practicalImplications, bestCase, worstCase };
  }, [auction, opportunityRatio, cityName, provinceName, propertyType]);

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

  const getOpportunityMessage = (ratio: number | null) => {
    if (ratio === null) return { text: "Análisis requerido", color: "bg-amber-100 text-amber-800 border-amber-200" };
    if (ratio > 0.4) return { text: "Alta oportunidad", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    if (ratio >= 0.2) return { text: "Oportunidad interesante", color: "bg-blue-100 text-blue-800 border-blue-200" };
    return { text: "Margen ajustado", color: "bg-slate-100 text-slate-800 border-slate-200" };
  };

  const oppMessage = getOpportunityMessage(opportunityRatio);

  const getUrgencyBadge = (date: string | undefined) => {
    if (!date) return null;
    const now = new Date();
    const auctionDate = new Date(date);
    const diffTime = auctionDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null; // Finished
    if (diffDays <= 3) return { text: `Cierra en ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`, color: "bg-red-500 text-white border-red-600" };
    if (diffDays <= 7) return { text: "Cierre próximo", color: "bg-orange-500 text-white border-orange-600" };
    return { text: "Cierre estándar", color: "bg-slate-200 text-slate-700 border-slate-300" };
  };

  const urgencyBadge = getUrgencyBadge(auction.auctionDate);

  const getAuctionType = (boeId?: string) => {
    if (!boeId) return 'Administrativa';
    if (boeId.startsWith('SUB-JA')) return 'Judicial';
    if (boeId.startsWith('SUB-AT')) return 'AEAT';
    if (boeId.startsWith('SUB-NV')) return 'Notarial';
    return 'Administrativa';
  };

  const auctionType = getAuctionType(auction.boeId);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600">
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
              <div className="flex flex-wrap items-center gap-3 mb-10">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${oppMessage.color}`}>
                  {oppMessage.text}
                </span>
                {urgencyBadge && (
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm flex items-center gap-1.5 ${urgencyBadge.color}`}>
                    <Clock size={12} /> {urgencyBadge.text}
                  </span>
                )}
                {isFinished && (
                  <span className="px-4 py-1.5 rounded-full text-sm font-bold border bg-slate-100 text-slate-600 border-slate-200">
                    Subasta Finalizada
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
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center h-32">
                  <span className="text-sm text-slate-400 uppercase tracking-wider font-bold block mb-2">Descuento Bruto</span>
                  <span className={`text-4xl font-black ${opportunityRatio && opportunityRatio > 0.4 ? 'text-emerald-700' : 'text-brand-700'}`}>
                    {opportunityRatio ? `${(opportunityRatio * 100).toFixed(0)}%` : '---'}
                  </span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center h-32">
                  <span className="text-sm text-slate-400 uppercase tracking-wider font-bold block mb-2">Valor Referencia</span>
                  <span className="text-xl font-bold text-slate-900">
                    {(auction.appraisalValue || auction.valorSubasta) ? (auction.appraisalValue || auction.valorSubasta)!.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : 'Sin datos'}
                  </span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center h-32">
                  <span className="text-sm text-slate-400 uppercase tracking-wider font-bold block mb-2">Deuda Reclamada</span>
                  <span className="text-xl font-bold text-slate-900">
                    {auction.claimedDebt ? auction.claimedDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : 'Sin datos'}
                  </span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center h-32">
                  <span className="text-sm text-slate-400 uppercase tracking-wider font-bold block mb-2">Tipo de Subasta</span>
                  <span className="text-xl font-bold text-slate-900">{auctionType}</span>
                  {auction.procedureType && (
                    <span className="text-[10px] text-slate-400 uppercase font-bold mt-1 truncate" title={auction.procedureType}>
                      {auction.procedureType.includes('JUZGADO') || auction.procedureType.includes('Civil') ? 'Vía de apremio' : 'Adm. Pública'}
                    </span>
                  )}
                </div>
              </div>
            </header>

            {/* Quick Summary Block */}
            <div className="bg-brand-900 text-white rounded-3xl p-6 mb-16 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <TrendingUp size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-300 uppercase font-bold tracking-widest">Margen Estimado</p>
                    <p className="font-bold">{opportunityRatio && opportunityRatio > 0.4 ? 'Alto' : opportunityRatio && opportunityRatio > 0.2 ? 'Medio' : 'Bajo / Análisis'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <AlertTriangle size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-300 uppercase font-bold tracking-widest">Riesgo Principal</p>
                    <p className="font-bold">{auction.claimedDebt ? 'Cargas preferentes' : 'Falta de datos oficiales'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <Search size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-300 uppercase font-bold tracking-widest">Lectura General</p>
                    <p className="font-bold">{opportunityRatio && opportunityRatio > 0.3 ? 'Oportunidad para inversión' : 'Perfil conservador / Uso propio'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Block */}
            <section className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm mb-16">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <h2 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
                  <FileText className="text-brand-600" /> Análisis del Activo
                </h2>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                      Metodología propia
                    </span>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
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
                  <div className="space-y-12">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Search size={20} className="text-brand-600" /> Interpretación del expediente
                      </h3>
                      <p className="text-lg leading-relaxed text-slate-700">
                        {analysisInsights?.interpretation}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Scale size={20} className="text-brand-600" /> Implicaciones prácticas
                      </h3>
                      <p className="text-slate-700 leading-relaxed mb-6">
                        {analysisInsights?.practicalImplications}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                          <p className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                            <CheckCircle size={18} /> Escenario Optimista
                          </p>
                          <p className="text-sm text-slate-600">{analysisInsights?.bestCase}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                          <p className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                            <AlertTriangle size={18} /> Escenario de Riesgo
                          </p>
                          <p className="text-sm text-slate-600">{analysisInsights?.worstCase}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <p className="text-slate-700 text-lg">
                        <strong className="text-emerald-700 flex items-center gap-2 mb-2"><TrendingUp size={20}/> Potencial:</strong> 
                        Existe un margen de seguridad para cubrir gastos de ITP, notaría y posibles reformas, manteniendo rentabilidad.
                      </p>
                      <p className="text-slate-700 text-lg">
                        <strong className="text-amber-700 flex items-center gap-2 mb-2"><AlertTriangle size={20}/> Riesgo:</strong> 
                        Es imprescindible solicitar la certificación de cargas para descartar anotaciones preventivas o hipotecas preferentes no incluidas.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <MapPin size={18} className="text-brand-600" /> Contexto de mercado
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {analysisInsights?.marketContext}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <User size={18} className="text-brand-600" /> Perfil inversor habitual
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {analysisInsights?.investorProfile}
                        </p>
                      </div>
                    </div>

                    <div className="bg-brand-50/50 p-8 rounded-2xl border border-brand-100">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <CheckCircle size={20} className="text-brand-600" /> ¿Tiene sentido esta subasta?
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 bg-emerald-100 p-1 rounded-full">
                            <CheckCircle size={14} className="text-emerald-700" />
                          </div>
                          <p className="text-slate-700">
                            <strong>Tiene sentido si:</strong> {analysisInsights?.senseText}
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-1 bg-amber-100 p-1 rounded-full">
                            <AlertOctagon size={14} className="text-amber-700" />
                          </div>
                          <p className="text-slate-700">
                            <strong>Requiere precaución si:</strong> {analysisInsights?.cautionText}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-500 italic text-sm mt-8">
                      Este tipo de expedientes suele requerir revisión completa del expediente judicial y de las cargas registrales antes de tomar una decisión.
                    </p>
                  </div>
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
                <div className="text-slate-600 leading-relaxed text-lg space-y-4">
                  {auction.boeId?.startsWith('SUB-JA') || auction.boeUrl?.includes('subastas.boe.es') ? (
                    <p>
                      Las subastas judiciales suelen derivar de ejecuciones hipotecarias o títulos judiciales. Implican una revisión exhaustiva del decreto de adjudicación y la cancelación de cargas posteriores. El riesgo principal reside en las cargas preferentes que no se extinguen con la subasta, por lo que es vital analizar la certificación de cargas del registro.
                    </p>
                  ) : auction.boeId?.startsWith('SUB-AT') ? (
                    <p>
                      Las subastas de la Agencia Tributaria tienen procedimientos específicos de adjudicación y plazos de depósito distintos. Es vital verificar si existen cargas anteriores en el registro de la propiedad, ya que la AEAT no siempre las detalla en el edicto inicial. Además, el proceso de adjudicación directa puede ser una alternativa si la subasta queda desierta.
                    </p>
                  ) : (
                    <p>
                      Este procedimiento administrativo requiere una validación técnica de los plazos y la documentación aportada. Cada organismo (Seguridad Social, Ayuntamientos, etc.) tiene sus propias reglas de puja y adjudicación. La clave en estos casos es la revisión del expediente administrativo completo.
                    </p>
                  )}
                  
                  {!auction.appraisalValue && (
                    <p className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm italic">
                      * La falta de datos en el anuncio inicial suele indicar la necesidad de una investigación directa en el juzgado o administración correspondiente antes de realizar cualquier depósito. Sin estos valores, el riesgo de sobrepuja es elevado.
                    </p>
                  )}
                </div>
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

            <section className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm mb-16">
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8 flex items-center gap-3">
                <Calculator className="text-brand-600" /> Calculadora de Puja Máxima
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Valor de Mercado Estimado</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={valorMercado} 
                        onChange={(e) => setValorMercado(e.target.value ? Number(e.target.value) : '')}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                        placeholder="Ej: 250000"
                      />
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Deudas y Cargas (IBI, Comunidad...)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={deudas} 
                        onChange={(e) => setDeudas(e.target.value ? Number(e.target.value) : '')}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                        placeholder="Ej: 5000"
                      />
                      <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </div>
                </div>
                <div className="bg-brand-50 p-8 rounded-2xl border border-brand-100 flex flex-col justify-center">
                  <div className="mb-6">
                    <p className="text-sm font-bold text-brand-700 uppercase tracking-widest mb-2">Puja Máxima Recomendada (70%)</p>
                    <p className="text-4xl font-black text-brand-900">
                      {results.precioMaxPuja ? results.precioMaxPuja.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : '---'}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-brand-200">
                    <p className="text-sm font-bold text-brand-700 uppercase tracking-widest mb-2">Margen Estimado tras Gastos</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {results.precioMaxPuja ? (Number(valorMercado) - results.precioMaxPuja - results.totalExpenses).toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : '---'}
                    </p>
                  </div>
                  <p className="text-xs text-brand-600 mt-6 leading-relaxed">
                    * Cálculo basado en el 70% del valor de mercado menos gastos e impuestos estimados. Este es un valor orientativo.
                  </p>
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
    </div>
  );
};

export default AuctionPage;
