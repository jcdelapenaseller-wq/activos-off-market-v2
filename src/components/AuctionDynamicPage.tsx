import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { ROUTES } from '../constants/routes';
import ConversionBlock from './ConversionBlock';
import RelatedAuctions from './RelatedAuctions';
import { 
  Calculator, Gavel, TrendingUp, Search, ChevronRight, 
  MapPin, Home, DollarSign, AlertTriangle, CheckCircle, 
  Info, ArrowRight, FileText, Scale, ShieldCheck, AlertOctagon
} from 'lucide-react';
import { isAuctionFinished } from '../utils/auctionHelpers';
import { normalizePropertyType, normalizeCity, normalizeLocationLabel } from '../utils/auctionNormalizer';
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

const AuctionDynamicPage: React.FC = () => {
  const { slug } = useParams();
  const location = useLocation();
  const auction = slug ? AUCTIONS[slug] : null;

  const isRentabilidad = location.pathname.includes('/rentabilidad-subasta/');
  const isCalcularPuja = location.pathname.includes('/calcular-puja-subasta/');
  const isAnalizar = location.pathname.includes('/analizar-subasta/');

  // Calculator State
  const [valorMercado, setValorMercado] = useState<number>(0);
  const [reforma, setReforma] = useState<number>(0);
  const [deudas, setDeudas] = useState<number>(0);
  const [otrosGastos, setOtrosGastos] = useState<number>(0);
  const [comunidad, setComunidad] = useState<string>('Madrid');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (auction) {
      setValorMercado(auction.appraisalValue || 0);
      setDeudas(auction.claimedDebt || 0);
      setComunidad(auction.city || 'Madrid');
    }
  }, [slug, auction]);

  const results = useMemo(() => {
    const itpRate = ITP_RATES[comunidad] || 0.08;
    // We calculate based on a target bid or just the max bid logic
    // For the "max bid" we want to find the bid that results in a 30% margin or similar
    // Max Bid = (Market Value * 0.7) - (Expenses)
    
    // Estimated expenses based on a hypothetical bid (let's use 70% of market as base for expenses)
    const baseBid = valorMercado * 0.7;
    const itp = baseBid * itpRate;
    const registroNotaria = baseBid * 0.012;
    const gestoria = 500;
    
    const totalExpenses = itp + registroNotaria + gestoria + reforma + deudas + otrosGastos;
    const precioMaxPuja = (valorMercado * 0.7) - (itp + registroNotaria + gestoria + reforma + deudas + otrosGastos);
    
    return { precioMaxPuja, totalExpenses };
  }, [valorMercado, reforma, deudas, otrosGastos, comunidad]);

  if (!auction) return <div className="max-w-4xl mx-auto px-6 py-16">Subasta no encontrada</div>;

  const isFinished = isAuctionFinished(auction.auctionDate);

  const cityName = normalizeCity(auction);
  const propertyType = normalizePropertyType(auction.propertyType);
  const locationLabel = normalizeLocationLabel(auction);

  const getTitle = () => {
    if (isRentabilidad) return `Rentabilidad estimada de esta subasta en ${cityName}`;
    if (isCalcularPuja) return `Cómo calcular la puja máxima en una subasta inmobiliaria`;
    return `Análisis detallado de esta subasta en ${cityName}`;
  };

  if (isCalcularPuja) {
    return (
      <div className="bg-slate-50 min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-6 pt-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium">
            <Link to="/" className="hover:text-brand-600 transition-colors">Inicio</Link>
            <ChevronRight size={14} className="mx-2 text-slate-300" />
            <Link to={`/ejemplo-subasta/${slug}`} className="hover:text-brand-600 transition-colors">Análisis de subasta</Link>
            <ChevronRight size={14} className="mx-2 text-slate-300" />
            <span className="text-slate-400">Calcular puja</span>
          </nav>

          <header className="mb-12">
            {isFinished && auction.auctionDate && (
              <FinishedAuctionBanner auctionDate={auction.auctionDate} />
            )}
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6 leading-tight">
              {getTitle()}
            </h1>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600">
              <p>
                Calcular la puja máxima en una subasta inmobiliaria es el paso más crítico para cualquier inversor. Muchos principiantes cometen el error de pensar que el valor de tasación que aparece en el BOE es el precio real del activo, cuando en realidad suele estar desactualizado o inflado. La tasación es solo una referencia administrativa para el juzgado.
              </p>
              <p>
                Para determinar cuánto pujar, es imprescindible realizar un análisis exhaustivo de las cargas registrales que permanecerán tras la subasta, así como las deudas de comunidad e IBI. El cálculo final depende directamente del riesgo detectado en el expediente judicial y de la situación posesoria del inmueble. Por ello, los inversores profesionales utilizan una estrategia conservadora, aplicando márgenes de seguridad amplios que garanticen la rentabilidad incluso si surgen imprevistos durante la toma de posesión o la reforma del activo.
              </p>
            </div>
          </header>

          {/* CALCULATOR CARD */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-12">
            <div className="bg-brand-900 text-white p-8">
              <div className="flex items-center gap-4">
                <Calculator className="text-brand-300" size={32} />
                <div>
                  <h2 className="text-xl font-bold">Calculadora de puja máxima</h2>
                  <p className="text-brand-200 text-sm">Ajusta los valores para este {propertyType.toLowerCase()} en {cityName}</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 md:p-10 grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <DollarSign size={16} className="text-brand-600" /> Valor de mercado real (€)
                  </label>
                  <input 
                    type="number" 
                    value={valorMercado || ''} 
                    onChange={(e) => setValorMercado(Number(e.target.value))} 
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="Ej: 250000"
                  />
                  <p className="text-xs text-slate-400 mt-1 italic">No uses la tasación del BOE si crees que no es real.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <AlertOctagon size={16} className="text-brand-600" /> Deudas y cargas anteriores (€)
                  </label>
                  <input 
                    type="number" 
                    value={deudas || ''} 
                    onChange={(e) => setDeudas(Number(e.target.value))} 
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1">IBI, Comunidad, Hipotecas anteriores...</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <TrendingUp size={16} className="text-brand-600" /> Reforma estimada (€)
                  </label>
                  <input 
                    type="number" 
                    value={reforma || ''} 
                    onChange={(e) => setReforma(Number(e.target.value))} 
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
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
                  {results.precioMaxPuja > 0 ? results.precioMaxPuja.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : '0,00 €'}
                </span>
                <div className="bg-emerald-100 text-emerald-800 px-4 py-1 rounded-full text-sm font-bold mb-6 flex items-center gap-1">
                  <CheckCircle size={14} /> Margen de seguridad del 30%
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Este cálculo incluye una estimación de ITP ({ITP_RATES[comunidad] * 100}%), gastos de registro, notaría y gestoría, además de las cargas y reformas introducidas.
                </p>
              </div>
            </div>
          </div>

          {/* FACTORS BLOCK */}
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Info className="text-brand-600" /> Factores que afectan a la puja máxima
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: "Cargas registrales", desc: "Hipotecas anteriores o embargos que no se cancelan con la subasta." },
                { title: "Situación posesoria", desc: "Si el inmueble está ocupado, el coste de desalojo y el tiempo de espera." },
                { title: "Deuda de comunidad", desc: "El nuevo propietario responde de la deuda del año en curso y los 3 anteriores." },
                { title: "IBI pendiente", desc: "Deudas tributarias locales que pueden recaer sobre el inmueble." },
                { title: "Costes judiciales", desc: "Abogados y procuradores si es necesario iniciar un desahucio." },
                { title: "Riesgo de ocupación", desc: "Posibles daños en el interior del inmueble no visibles desde fuera." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-brand-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-slate-900 block">{item.title}</strong>
                    <span className="text-slate-500 text-sm">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOMO TEXT */}
          <div className="mb-8 px-4">
            <p className="text-slate-600 text-lg leading-relaxed italic border-l-4 border-brand-200 pl-6">
              En muchas subastas el mayor riesgo no está en el precio, sino en las cargas registrales o en la situación posesoria. 
              <br /><br />
              Muchos inversores solicitan una revisión completa del expediente antes de presentar una puja para evitar errores costosos o sorpresas jurídicas después de la adjudicación.
            </p>
          </div>

          {/* CONSULTANCY BLOCK */}
          <div className="bg-brand-50 border border-brand-100 rounded-3xl p-10 mb-12 shadow-sm">
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1">
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Revisión completa del expediente antes de pujar</h2>
                <p className="text-slate-700 mb-4">El cálculo automático solo es una referencia inicial. En muchas subastas el factor decisivo está en el expediente judicial o en las cargas registrales.</p>
                <p className="text-slate-700 mb-8">Muchos inversores solicitan una revisión completa antes de pujar para evitar errores costosos.</p>
                <a 
                  href="https://calendly.com/activosoffmarket" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand-700 text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-800 transition-all shadow-md"
                >
                  Solicitar análisis completo de la subasta <ArrowRight size={20} />
                </a>
              </div>
              <div className="hidden md:block w-1/4">
                <ShieldCheck className="text-brand-600 w-full h-auto opacity-20" />
              </div>
            </div>
          </div>

          {/* INTERNAL LINKING */}
          <div className="bg-slate-900 text-white rounded-3xl p-10 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Ver el análisis completo de esta subasta</h2>
            <p className="text-slate-400 mb-8">Revisa los detalles técnicos, ubicación y observaciones de este activo antes de realizar tus cálculos.</p>
            <Link 
              to={`/ejemplo-subasta/${slug}`} 
              className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold py-3 px-10 rounded-xl hover:bg-brand-100 transition-all"
            >
              Leer análisis técnico <ArrowRight size={20} />
            </Link>
          </div>

          {/* FAQ SECTION */}
          <div className="mt-20">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-10 text-center">
              Preguntas frecuentes sobre la puja en subastas inmobiliarias
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "¿La puja máxima siempre es la tasación?",
                  a: "No. La tasación es solo una referencia inicial utilizada por el juzgado. El valor real de la subasta depende del mercado, de las cargas registrales y de la situación posesoria del inmueble."
                },
                {
                  q: "¿Qué ocurre si existen cargas registrales anteriores?",
                  a: "Las cargas anteriores pueden permanecer tras la adjudicación y afectar al valor real del activo. Por eso es fundamental revisar el Registro de la Propiedad antes de presentar una puja."
                },
                {
                  q: "¿Es recomendable analizar el expediente antes de pujar?",
                  a: "Sí. El expediente judicial puede contener información clave sobre ocupación, deudas o procedimientos en curso que no siempre aparecen en el anuncio inicial de la subasta."
                }
              ].map((faq, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-start gap-3">
                    <span className="text-brand-600 flex-shrink-0">{i + 1}️⃣</span>
                    {faq.q}
                  </h3>
                  <p className="text-slate-600 leading-relaxed pl-9">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {slug && <div className="mt-20"><RelatedAuctions currentAuctionSlug={slug} currentAuctionData={auction} /></div>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 prose prose-slate">
      {isFinished && auction.auctionDate && (
        <FinishedAuctionBanner auctionDate={auction.auctionDate} />
      )}
      <h1>{getTitle()}</h1>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">¿Cuánto deberías pujar realmente por esta subasta?</h2>
        <p className="text-slate-700 mb-4">Muchos inversores pierden dinero porque calculan mal la puja máxima teniendo en cuenta cargas, costes y margen de seguridad.</p>
        <Link to={`/calcular-puja-subasta/${slug}`} className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
          Calcular puja máxima
        </Link>
      </div>
      <p className="lead">
        Analizamos los datos de este {propertyType.toLowerCase()} en {locationLabel}, para ayudarte a tomar una decisión informada.
      </p>

      <div className="grid md:grid-cols-3 gap-6 my-8">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <Gavel className="text-brand-600 mb-2" />
          <h3>Tasación</h3>
          <p>{auction.appraisalValue?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <Search className="text-brand-600 mb-2" />
          <h3>Estimación mercado</h3>
          <p>{auction.marketPriceM2Min ? `${auction.marketPriceM2Min}€/m² - ${auction.marketPriceM2Max}€/m²` : 'Consultar'}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <TrendingUp className="text-brand-600 mb-2" />
          <h3>Rentabilidad</h3>
          <p>Análisis basado en mercado local</p>
        </div>
      </div>

      <p>
        Este {propertyType.toLowerCase()} ubicado en {locationLabel} presenta características particulares que deben ser analizadas frente a los precios de la zona en {cityName}.
      </p>

      <ConversionBlock />

      <h2>Enlaces de interés</h2>
      <ul className="list-none p-0">
        <li><Link to={`/ejemplo-subasta/${slug}`} className="text-brand-700 hover:underline">Ver detalles del ejemplo de subasta</Link></li>
        <li><Link to={`/subastas-${auction.city?.toLowerCase()}`} className="text-brand-700 hover:underline">Ver más subastas en {cityName}</Link></li>
        <li><Link to={ROUTES.CALCULATOR} className="text-brand-700 hover:underline">Ir a la calculadora de subastas</Link></li>
      </ul>

      {slug && <RelatedAuctions currentAuctionSlug={slug} currentAuctionData={auction} />}
    </div>
  );
};

export default AuctionDynamicPage;
