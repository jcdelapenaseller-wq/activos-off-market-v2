import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  Calculator, Gavel, TrendingUp, Search, ChevronRight, 
  MapPin, Home, DollarSign, AlertTriangle, CheckCircle, 
  Info, ArrowRight, FileText, Scale, ShieldCheck, AlertOctagon,
  Clock, Calendar, User, Twitter, Linkedin, Mail, MessageCircle,
  ExternalLink, AlertCircle, Lock, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AUCTIONS } from '../data/auctions';
import { AUCTION_RESULTS } from '../data/auctionResults';
import { getFilteredAuctions, isAuctionFinished, getAuctionType, getProcedureType } from '../utils/auctionHelpers';
import { ROUTES } from '../constants/routes';
import { normalizePropertyType, normalizeCity, normalizeLocationLabel, normalizeProvince, formatAddress } from '../utils/auctionNormalizer';
import { trackConversion } from '../utils/tracking';
import FinishedAuctionBanner from './FinishedAuctionBanner';
import { ShareButtons } from './ShareButtons';
import ConversionBlock from './ConversionBlock';
import ConsultingCTA from './ConsultingCTA';
import RadarPremiumCTA from './RadarPremiumCTA';
import RelatedAuctions from './RelatedAuctions';
import LoadAnalysisBlock from './LoadAnalysisBlock';
import Header from './Header';
import Footer from './Footer';
import AuctionCalculator from './AuctionCalculator';

const AuctionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const cleanSlug = slug ? decodeURIComponent(slug).replace(/\/$/, '').toLowerCase() : '';
  const auction = cleanSlug ? AUCTIONS[cleanSlug] : null;

  // Calculator State
  const [valorMercado, setValorMercado] = useState<number | ''>('');
  const [deudas, setDeudas] = useState<number | ''>('');
  const [showCalculator, setShowCalculator] = useState(false);

  if (!auction) return <Navigate to={ROUTES.HOME} replace />;

  const isFinished = auction.status === 'closed' || isAuctionFinished(auction.auctionDate);
  const isSuspended = auction.status === 'suspended';
  const isUpcoming = auction.status === 'upcoming';
  const isActive = auction.status === 'active' || (!isFinished && !isSuspended && !isUpcoming);

  const cityName = normalizeCity(auction) || 'España';
  const provinceName = normalizeProvince(auction.province || cityName);
  const propertyType = normalizePropertyType(auction.propertyType);
  const locationLabel = normalizeLocationLabel(auction);

  const opportunityRatio = useMemo(() => {
    if (auction.appraisalValue && auction.claimedDebt !== undefined && auction.claimedDebt !== null) {
      const ratio = 1 - (auction.claimedDebt / auction.appraisalValue);
      if (auction.claimedDebt === 0 || ratio > 0.85) {
        return null;
      }
      return ratio;
    }
    return null;
  }, [auction]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (auction) {
      setValorMercado(auction.appraisalValue || '');
      setDeudas(auction.claimedDebt || '');
      
      const propertyType = normalizePropertyType(auction.propertyType);
      const cityName = normalizeCity(auction) || 'España';
      const discount = auction.appraisalValue && auction.claimedDebt 
        ? Math.round((1 - (auction.claimedDebt / auction.appraisalValue)) * 100) 
        : 0;
      
      const addressPart = formatAddress(auction.address);
      const streetPart = addressPart ? ` (${addressPart})` : '';
      
      let discountPart = '';
      if (auction.claimedDebt === 0) {
        discountPart = ' (Sin cargas declaradas)';
      } else if (discount > 85) {
        discountPart = ' (Oportunidad a analizar)';
      } else if (discount > 0) {
        discountPart = ` con ${discount}% de descuento`;
      }
      
      const title = `${propertyType} en subasta en ${cityName}${streetPart}${discountPart}`;
      
      document.title = title.length > 70 ? title.substring(0, 67) + '...' : title;

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        const desc = `Subasta de ${propertyType} en ${cityName}${streetPart}. Valor de tasación: ${auction.appraisalValue?.toLocaleString('es-ES')}€. Consulta cargas, deudas y rentabilidad.`;
        metaDesc.setAttribute('content', desc.length > 160 ? desc.substring(0, 157) + '...' : desc);
      }
    }
  }, [cleanSlug, auction]);

  const analysisInsights = useMemo(() => {
    if (!auction) return null;

    let discount = 0;
    if (auction.appraisalValue && auction.claimedDebt !== undefined && auction.claimedDebt !== null) {
      discount = Math.round((1 - (auction.claimedDebt / auction.appraisalValue)) * 100);
      if (auction.claimedDebt === 0 || discount > 85) {
        discount = 0;
      }
    }
    const isJudicial = auction.boeId?.startsWith('SUB-JA');
    
    // Interpretation Logic
    let interpretation = "";
    const debtToAppraisalRatio = auction.appraisalValue && auction.claimedDebt ? (auction.claimedDebt / auction.appraisalValue) * 100 : 0;
    const currentDiscount = auction.appraisalValue && auction.claimedDebt ? Math.round((1 - (auction.claimedDebt / auction.appraisalValue)) * 100) : 0;
    
    if (auction.appraisalValue && auction.claimedDebt) {
      if (currentDiscount > 50) {
        interpretation = `Este expediente destaca por un margen excepcional del ${currentDiscount}%, lo que lo posiciona como una oportunidad de alto impacto. La carga reclamada representa solo el ${debtToAppraisalRatio.toFixed(1)}% de la tasación oficial, generando un colchón de seguridad extraordinario para absorber cualquier contingencia procesal o de posesión.`;
      } else if (currentDiscount > 25) {
        interpretation = `La oportunidad en este activo reside en un equilibrio sólido entre riesgo y rentabilidad. Con un margen del ${currentDiscount}%, el inversor cuenta con margen suficiente para gestionar el lanzamiento y posibles deudas de comunidad o IBI sin comprometer el objetivo de rentabilidad neta de dos dígitos.`;
      } else {
        interpretation = `Se trata de un activo con margen ajustado (${currentDiscount}%), donde la clave del éxito reside en la ubicación estratégica o la tipología del inmueble. Es un expediente ideal para compradores finalistas o inversores patrimonialistas que priorizan la seguridad del activo sobre el descuento agresivo.`;
      }
    } else {
      interpretation = "La ausencia de desglose de deuda en el anuncio público exige un enfoque de máxima cautela. La oportunidad en este caso no es evidente por los números, sino que reside en la posible baja concurrencia de postores debido a la opacidad inicial, lo que requiere una investigación directa en el juzgado.";
    }

    // Investor Profile Logic
    let investorProfile = "";
    const notHabitual = isJudicial 
      ? "No es un activo apto para perfiles que dependan de financiación bancaria convencional o necesiten posesión inmediata." 
      : "No es recomendable para compradores que busquen la inmediatez de una compraventa tradicional.";
    
    if (discount > 45) {
      investorProfile = `Perfil ideal: Inversores especialistas en 'flipping' o gestión de activos complejos que buscan maximizar el retorno sobre capital. ${notHabitual}`;
    } else if (discount > 25) {
      investorProfile = `Perfil ideal: Inversores patrimonialistas (Buy-to-Rent) que buscan optimizar el flujo de caja mediante un coste de adquisición reducido. ${notHabitual}`;
    } else {
      investorProfile = `Perfil ideal: Compradores finalistas o inversores conservadores que buscan activos en ubicaciones consolidadas con un descuento moderado. ${notHabitual}`;
    }

    // Market Context Logic (Rule-based)
    const auctionsInCity = Object.values(AUCTIONS).filter(a => normalizeCity(a) === cityName).length;
    let marketContext = "";
    
    if (auctionsInCity > 5) {
      marketContext = `El mercado de subastas en ${cityName} presenta actualmente una alta actividad con ${auctionsInCity} expedientes activos. Esta competencia exige una especialización mayor en la fase de análisis para detectar el valor real frente a otros postores profesionales.`;
    } else {
      marketContext = `Detectamos un volumen bajo de subastas en ${cityName} (${auctionsInCity} activas), lo que convierte a este activo en una pieza de interés por su escasez en el canal de adjudicaciones públicas de la zona.`;
    }

    if (auction.appraisalValue) {
      marketContext += ` La tasación de ${auction.appraisalValue.toLocaleString()}€ se sitúa en rangos de mercado para ${propertyType.toLowerCase()}, validando la base de cálculo para el estudio de rentabilidad.`;
    }

    // Procedural Context Logic (Rule-based)
    let proceduralContext = "";
    const typeLabel = propertyType.toLowerCase();
    const isAEAT = auction.boeId?.startsWith('SUB-AT');

    if (isJudicial) {
      proceduralContext = `Este procedimiento judicial en ${cityName} se rige por la LEC, garantizando un marco jurídico estable. El éxito depende de la correcta interpretación de la certificación de cargas y la gestión del decreto de adjudicación.`;
    } else if (isAEAT) {
      proceduralContext = `Subasta administrativa vía AEAT en ${cityName}. Destaca por su agilidad procesal, aunque exige una revisión exhaustiva de cargas anteriores, ya que la responsabilidad de comprobación recae íntegramente en el postor.`;
    } else {
      proceduralContext = `Expediente administrativo en ${cityName}. Requiere validación técnica de plazos y revisión profunda del expediente para asegurar la liquidación correcta de deudas subsistentes.`;
    }

    // Appraisal warning logic integrated
    if (!auction.appraisalValue) {
      proceduralContext += ` Dada la falta de tasación oficial en el anuncio de ${cityName}, se aconseja realizar una investigación de campo para evitar el riesgo de sobrepuja en este ${typeLabel}.`;
    }

    // Soft FOMO Logic (Rule-based)
    const fomo = {
      interpretation: discount > 40 ? "Oportunidad con margen superior a la media en la zona." : "Activo con estructura de deuda clara para inversores.",
      market: auctionsInCity < 3 ? `Escasez de activos similares en ${cityName}.` : `Activo estratégico en mercado activo de ${cityName}.`,
      preCta: "Interés profesional previsible por ubicación y tipología.",
      timing: "Fase crítica de análisis antes del cierre de pujas."
    };

    // Summary Labels for the Dark Block
    const str = (auction.boeId || '') + cityName + propertyType + (auction.claimedDebt || 0);
    const seed = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // 1. Margen Estimado
    let margenLabels: string[] = [];
    if (opportunityRatio === null) {
      margenLabels = ['Análisis pendiente'];
    } else if (opportunityRatio > 0.4) {
      margenLabels = ['Alto potencial', 'Margen muy amplio', 'Descuento relevante', 'Oportunidad clara', 'Margen excepcional', 'Entrada favorable', 'Potencial elevado', 'Gran margen', 'Muy atractivo', 'Colchón amplio'];
    } else if (opportunityRatio > 0.25) {
      margenLabels = ['Buen margen', 'Potencial interesante', 'Margen atractivo', 'Entrada sólida', 'Oportunidad interesante', 'Descuento atractivo', 'Potencial claro', 'Margen favorable', 'Posición ventajosa'];
    } else if (opportunityRatio > 0.15) {
      margenLabels = ['Margen moderado', 'Potencial ajustado', 'Entrada selectiva', 'Margen limitado', 'Oportunidad medida', 'Descuento moderado', 'Potencial medio'];
    } else {
      margenLabels = ['Margen reducido', 'Potencial limitado', 'Entrada ajustada', 'Oportunidad táctica', 'Margen estrecho'];
    }
    const margenLabel = margenLabels[seed % margenLabels.length];

    // 2. Punto de Atención
    let atencionLabels: string[] = [];
    const hasDebt = !!auction.claimedDebt;
    const highDebt = auction.claimedDebt && auction.appraisalValue && (auction.claimedDebt > auction.appraisalValue * 0.4);
    
    // Logic for "Escenario limpio" vs "Cargas/Contexto"
    if (!isJudicial && hasDebt && !highDebt && opportunityRatio && opportunityRatio > 0.2) {
      atencionLabels = ['Expediente claro', 'Sin cargas visibles', 'Riesgo limitado', 'Situación favorable', 'Perfil sencillo', 'Documentación clara'];
    } else {
      atencionLabels = ['Cargas preferentes', 'Riesgo registral', 'Revisar expediente', 'Posibles cargas', 'Análisis necesario', 'Atención jurídica', 'Revisar documentación', 'Expediente complejo', 'Riesgo potencial', 'Ver cargas', 'Atención registral', 'Revisión recomendada', 'Posible afección', 'Cargas a validar', 'Riesgo oculto', 'Precaución jurídica', 'Verificación previa', 'Comprobación necesaria'];
    }
    const atencionLabel = atencionLabels[seed % atencionLabels.length];

    // 3. Lectura General
    const lecturaLabels = ['Inversión interesante', 'Oportunidad inversor', 'Perfil inversor', 'Potencial flip', 'Estrategia flexible', 'Activo atractivo', 'Oportunidad selectiva', 'Inversión táctica', 'Perfil conservador', 'Inversión moderada', 'Potencial revalorización', 'Entrada estratégica', 'Oportunidad mercado', 'Inversión viable', 'Activo interesante', 'Estrategia inversión', 'Perfil oportunista', 'Oportunidad puntual', 'Potencial alquiler', 'Potencial rotación', 'Inversión analizable', 'Estrategia abierta', 'Oportunidad técnica', 'Activo analizable'];
    const lecturaLabel = lecturaLabels[seed % lecturaLabels.length];

    const summaryLabels = { margenLabel, atencionLabel, lecturaLabel };

    return { marketContext, investorProfile, interpretation, proceduralContext, fomo, summaryLabels };
  }, [auction, opportunityRatio, cityName, provinceName, propertyType]);

  const isCityCapital = cityName !== 'España' && cityName.toLowerCase() === provinceName.toLowerCase();

  const getOpportunityMessage = (ratio: number | null) => {
    if (ratio === null) return { text: "Análisis requerido", color: "bg-amber-100 text-amber-800 border-amber-200" };
    if (ratio >= 0.35 && isCityCapital) return { text: "Alta oportunidad", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
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

  const jsonLd = useMemo(() => {
    if (!auction || !cleanSlug) return null;

    const propertyType = normalizePropertyType(auction.propertyType);
    const cityName = normalizeCity(auction) || 'España';
    const discount = auction.appraisalValue && auction.claimedDebt 
      ? Math.round((1 - (auction.claimedDebt / auction.appraisalValue)) * 100) 
      : 0;
    
    const addressPart = formatAddress(auction.address);
    const streetPart = addressPart ? ` (${addressPart})` : '';
    
    let discountPart = '';
    if (auction.claimedDebt === 0) {
      discountPart = ' (Sin cargas declaradas)';
    } else if (discount > 85) {
      discountPart = ' (Oportunidad a analizar)';
    } else if (discount > 0) {
      discountPart = ` con ${discount}% de descuento`;
    }
    
    const title = `${propertyType} en subasta en ${cityName}${streetPart}${discountPart}`;
    const finalTitle = title.length > 70 ? title.substring(0, 67) + '...' : title;

    const description = analysisInsights 
      ? `${analysisInsights.marketContext} ${analysisInsights.investorProfile}`.substring(0, 160) + '...'
      : `Subasta de ${propertyType.toLowerCase()} en ${cityName}, ${provinceName}.`;

    const imageUrl = auction.imageUrl;
    const price = auction.claimedDebt ?? auction.appraisalValue ?? auction.valorSubasta ?? 0;
    const url = window.location.href;
    
    const now = new Date();
    let publishedDate = auction.publishedAt ? new Date(auction.publishedAt) : now;
    if (publishedDate > now) publishedDate = now;

    const availability = isFinished ? "https://schema.org/OutOfStock" : "https://schema.org/InStock";

    const realEstateListing: any = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": finalTitle,
      "description": description,
      "url": url,
      "datePosted": publishedDate.toISOString().split('T')[0],
      "category": propertyType,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": cityName,
        "addressRegion": provinceName,
        "addressCountry": "ES"
      }
    };

    if (imageUrl) {
      realEstateListing["image"] = imageUrl;
    }

    if (auction.auctionDate) {
      realEstateListing["availabilityEnds"] = new Date(auction.auctionDate).toISOString().split('T')[0];
    }

    const product: any = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": finalTitle,
      "description": description,
      "brand": {
        "@type": "Brand",
        "name": "Activos Off-Market"
      },
      "offers": {
        "@type": "Offer",
        "price": price,
        "priceCurrency": "EUR",
        "availability": availability,
        "url": url
      }
    };

    if (imageUrl) {
      product["image"] = imageUrl;
    }

    if (auction.auctionDate) {
      product.offers["validThrough"] = new Date(auction.auctionDate).toISOString().split('T')[0];
    }

    const faqPage: any = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": []
    };

    // 1. ¿Cuánto podría costar esta subasta en {ciudad}?
    const priceQuestions = [
      `¿Cuál es el valor de referencia para esta subasta de ${propertyType.toLowerCase()} en ${cityName}?`,
      `¿Cuánto es la tasación oficial de este activo en ${cityName}?`,
      `¿Qué precio base tiene este ${propertyType.toLowerCase()} en subasta?`
    ];
    const q1Index = (auction.boeId?.length || 0) % priceQuestions.length;
    faqPage.mainEntity.push({
      "@type": "Question",
      "name": priceQuestions[q1Index],
      "acceptedAnswer": {
        "@type": "Answer",
        "text": auction.appraisalValue 
          ? `La tasación oficial en ${cityName} asciende a ${auction.appraisalValue.toLocaleString('es-ES')}€. Este valor sirve de base para el cálculo de depósitos y tramos de puja según la LEC.`
          : `No se ha publicado una tasación oficial para este expediente en ${cityName}. En estos casos, el mercado local de ${provinceName} dicta el valor real de adjudicación.`
      }
    });

    // 2. ¿Está ocupada esta subasta?
    const occupancyStatus = auction.occupancy || 'No consta información registral sobre la ocupación';
    const occupancyQuestions = [
      `¿Cuál es el estado de ocupación de este ${propertyType.toLowerCase()}?`,
      `¿Se puede visitar la propiedad antes de la subasta?`,
      `¿Hay inquilinos en este activo de ${cityName}?`
    ];
    const q2Index = (auction.boeId?.length || 0) % occupancyQuestions.length;
    faqPage.mainEntity.push({
      "@type": "Question",
      "name": occupancyQuestions[q2Index],
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `El expediente indica: ${occupancyStatus}. Generalmente, las subastas judiciales en ${cityName} no permiten visitas interiores, por lo que el riesgo posesorio debe ser evaluado por un profesional.`
      }
    });

    // 3. ¿Qué deudas puede tener esta subasta?
    const debtQuestions = [
      `¿Qué cargas anteriores tiene esta subasta en ${cityName}?`,
      `¿De cuánto es la deuda reclamada en este expediente?`,
      `¿Existen deudas de comunidad o IBI pendientes?`
    ];
    const q3Index = (auction.boeId?.length || 0) % debtQuestions.length;
    faqPage.mainEntity.push({
      "@type": "Question",
      "name": debtQuestions[q3Index],
      "acceptedAnswer": {
        "@type": "Answer",
        "text": auction.claimedDebt !== undefined
          ? `La deuda que motiva la ejecución es de ${auction.claimedDebt.toLocaleString('es-ES')}€. El adjudicatario en ${cityName} debe prever además el pago de IBI de los últimos años y cuotas de comunidad pendientes.`
          : `La cantidad reclamada no es pública en este extracto. Es vital revisar la certificación de cargas en el Registro de la Propiedad de ${provinceName} para identificar deudas preferentes.`
      }
    });

    // 4. ¿Cuál es el depósito necesario?
    faqPage.mainEntity.push({
      "@type": "Question",
      "name": `¿Cuál es el depósito necesario para participar?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": auction.deposito
          ? `Para participar en esta subasta es necesario realizar un depósito previo de ${auction.deposito.toLocaleString('es-ES')}€ a través del Portal de Subastas del BOE.`
          : `El importe del depósito no está especificado en los datos básicos. Generalmente corresponde al 5% del valor de tasación de la propiedad.`
      }
    });

    // 5. ¿Es rentable esta subasta?
    faqPage.mainEntity.push({
      "@type": "Question",
      "name": `¿Es rentable invertir en esta subasta en ${cityName}?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": discount > 0
          ? `Esta subasta presenta un descuento teórico del ${discount}% respecto a su valor de tasación. La rentabilidad real dependerá de las cargas anteriores, el estado físico del inmueble, los costes de posesión y el precio final de adjudicación.`
          : `Para determinar la rentabilidad de esta subasta en ${cityName} es necesario realizar un estudio de mercado local, descontar las cargas anteriores y estimar los costes de adecuación y posesión del inmueble.`
      }
    });

    return [realEstateListing, product, faqPage];
  }, [auction, slug, cityName, provinceName, isFinished, analysisInsights]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600 pb-20">
      {jsonLd && (
        <>
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
          {jsonLd[0].image && <link rel="preload" as="image" href={jsonLd[0].image} />}
        </>
      )}
      
      <Header />

      <main className="max-w-4xl mx-auto px-6 pt-4">
        {/* Breadcrumbs - TOP LEVEL */}
        <nav className="flex items-center text-[10px] text-slate-400 mb-4 font-bold uppercase tracking-widest" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
          <ChevronRight size={8} className="mx-2" />
          <Link to={`/subastas/${provinceName.toLowerCase()}`} className="hover:text-brand-600 transition-colors">Subastas en {provinceName}</Link>
          <ChevronRight size={8} className="mx-2" />
          <span className="text-slate-300">Ficha de activo</span>
        </nav>

        {/* HEADER SECTION */}
        <section className="mb-6">
          <div className="flex flex-wrap gap-2.5 mb-3">
            {isActive && <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-widest border border-emerald-200/60 hover:bg-emerald-100 transition-all cursor-default shadow-sm shadow-emerald-100/50">Activa</span>}
            {urgencyBadge && urgencyBadge.text.includes('Cierre') && <span className="px-3 py-1 rounded-md bg-orange-50 text-orange-700 text-[9px] font-bold uppercase tracking-widest border border-orange-200/60 flex items-center gap-2 hover:bg-orange-100 transition-all cursor-default shadow-sm shadow-orange-100/50"><Clock size={10} /> {urgencyBadge.text}</span>}
            {isFinished && <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-widest border border-slate-200/60 hover:bg-slate-200 transition-all cursor-default shadow-sm shadow-slate-100/50">Finalizada</span>}
            {opportunityRatio && opportunityRatio > 0.35 && <span className="px-3 py-1 rounded-md bg-brand-50 text-brand-700 text-[9px] font-bold uppercase tracking-widest border border-brand-200/60 hover:bg-brand-100 transition-all cursor-default shadow-sm shadow-brand-100/50">Alta oportunidad</span>}
          </div>

          <h1 className="text-[clamp(1rem,3.6vw,2.75rem)] font-serif font-bold text-slate-900 mb-8 tracking-tighter leading-tight whitespace-nowrap overflow-visible">
            {propertyType} en subasta en {cityName}
          </h1>

          {/* Dynamic SEO Intro */}
          <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 text-justify">
            {opportunityRatio && opportunityRatio > 0.4 
              ? `Esta subasta en ${cityName} presenta un margen excepcional del ${Math.round(opportunityRatio * 100)}% frente a la tasación oficial. Una oportunidad estratégica tanto para inversores profesionales como para familias y pequeños ahorradores que buscan su primera vivienda con un ahorro sustancial.`
              : `Oportunidad de adquisición de ${propertyType.toLowerCase()} en ${cityName} mediante procedimiento ${getAuctionType(auction.boeId).toLowerCase()}. Un activo ideal para particulares que desean capitalizar su ahorro o inversores que buscan rentabilidad con garantías jurídicas.`}
            {" "}El análisis de cargas es el paso crítico para asegurar el éxito de la operación.
          </p>
          
          {/* Address and Share Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3 text-xl md:text-2xl text-slate-900 font-bold group cursor-default">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                <MapPin size={24} className="text-brand-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="group-hover:text-brand-700 transition-colors leading-tight">
                {formatAddress(auction.address) || locationLabel}
              </span>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Compartir:</span>
              <div className="flex items-center gap-3">
                <a href={`https://wa.me/?text=${encodeURIComponent(document.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full text-[#25D366] bg-[#25D366]/5 hover:bg-[#25D366]/10 transition-all hover:scale-110" title="WhatsApp">
                  <MessageCircle size={18} />
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(document.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full text-[#000000] bg-[#000000]/5 hover:bg-[#000000]/10 transition-all hover:scale-110" title="X (Twitter)">
                  <Twitter size={18} />
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full text-[#0077B5] bg-[#0077B5]/5 hover:bg-[#0077B5]/10 transition-all hover:scale-110" title="LinkedIn">
                  <Linkedin size={18} />
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(document.title)}&body=${encodeURIComponent(window.location.href)}`} className="p-1.5 rounded-full text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all hover:scale-110" title="Email">
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN ASSET DATA BLOCK - PREMIUM STYLE */}
        <motion.section 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden mb-8 group"
        >
          {/* Dark Header */}
          <div className="bg-[#151921] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white/60 transition-colors">
                <Scale size={16} />
              </div>
              <div>
                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Expediente</p>
                <div className="flex items-center gap-3">
                  <p className="text-xs font-bold text-white/90">{auction.boeId}</p>
                  <div className="w-px h-3 bg-white/10" />
                  <a 
                    href={`https://subastas.boe.es/detalle_subasta.php?idSub=${auction.boeId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1.5 font-bold group/link"
                  >
                    Ver subasta en el BOE <ExternalLink size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Estado</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isSuspended ? 'bg-amber-500' : 'bg-slate-500'}`} />
                  <p className="text-xs font-bold text-white/90">
                    {isSuspended ? 'Pausada' : isUpcoming ? 'Próxima' : isFinished ? 'Finalizada' : 'Activa'}
                  </p>
                </div>
              </div>
              <div className="text-right border-l border-white/10 pl-6">
                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Tipo</p>
                <p className="text-xs font-bold text-white/90">{getAuctionType(auction.boeId)}</p>
              </div>
            </div>
          </div>

          {/* White Lower Card */}
          <div className="p-6 md:py-6 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-3 space-y-4">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Activo</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <Home size={18} />
                  </div>
                  <p className="text-xl font-serif font-bold text-slate-900">{propertyType}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ubicación</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <MapPin size={18} />
                  </div>
                  <p className="text-base font-bold text-slate-700 leading-snug">{locationLabel}</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 border-l border-slate-100 pl-8 flex items-center justify-between gap-4">
              <div className="flex flex-col justify-center gap-y-4">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tasación</p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                    {auction.appraisalValue ? auction.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : '---'}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Deuda</p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-600 tracking-tight">
                    {auction.claimedDebt ? auction.claimedDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : '---'}
                  </p>
                </div>
              </div>
              
              {opportunityRatio !== null && (
                <div className="flex flex-col items-end justify-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Margen Potencial</p>
                  <p className="text-4xl md:text-5xl font-bold text-emerald-600 tracking-tighter leading-none">
                    {Math.round(opportunityRatio * 100)}%
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-3 bg-slate-50/80 rounded-2xl p-6 border border-slate-100 text-center space-y-3 group-hover:bg-white transition-colors">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cierre</p>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition-colors">
                  <Calendar size={22} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('es-ES') : 'Pendiente'}
                  </p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Fecha límite BOE</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* DYNAMIC AUCTION STATUS BLOCK */}
        <section className="mb-8">
          {isFinished ? (
            <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-6 flex items-center gap-6 opacity-80">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                <Gavel size={28} />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-xl font-serif font-bold text-slate-600 leading-tight">Subasta finalizada</h3>
                <p className="text-slate-500 text-base leading-tight mt-1">
                  El periodo de pujas ha concluido. El activo ya no está disponible para nuevas ofertas.
                </p>
              </div>
            </div>
          ) : isSuspended ? (
            <div className="bg-slate-100/50 border border-slate-200 rounded-[32px] p-6 flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                <AlertCircle size={28} />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-xl font-serif font-bold text-slate-700 leading-tight">Subasta pausada</h3>
                <p className="text-slate-500 text-base leading-tight mt-1">
                  Procedimiento suspendido temporalmente. Activa alertas para recibir notificaciones de reanudación.
                </p>
              </div>
            </div>
          ) : urgencyBadge && urgencyBadge.text.includes('Cierre') ? (
            <div className="bg-amber-50/50 border border-amber-100 rounded-[32px] p-6 flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={28} />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-xl font-serif font-bold text-amber-900 leading-tight">Cierre próximo</h3>
                <p className="text-amber-800/70 text-base leading-tight mt-1">
                  Finaliza en pocos días. Asegura tu participación antes del <strong className="text-amber-900">{auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('es-ES') : 'Pendiente'}</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-[32px] p-6 flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp size={28} />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-xl font-serif font-bold text-emerald-900 leading-tight">Subasta en curso</h3>
                <p className="text-emerald-800/70 text-base leading-tight mt-1">
                  Periodo de pujas activo. Fecha límite: <strong className="text-emerald-900">{auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('es-ES') : 'Pendiente'}</strong>.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* DARK VISUAL SUMMARY - COMPACT DYNAMIC BLOCK */}
        <section className="bg-[#151921] rounded-2xl px-6 py-5 mb-8 shadow-xl shadow-slate-200/40 border border-white/5 overflow-hidden">
          <div className="flex flex-nowrap items-center justify-between gap-x-8 whitespace-nowrap overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
                <TrendingUp size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Margen estimado</span>
                <span className="text-white text-[14px] font-bold tracking-tight">{analysisInsights?.summaryLabels.margenLabel}</span>
              </div>
            </div>
            
            <div className="w-px h-10 bg-white/10 shrink-0" />

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20">
                <AlertTriangle size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Punto de atención</span>
                <span className="text-white text-[14px] font-bold tracking-tight">{analysisInsights?.summaryLabels.atencionLabel}</span>
              </div>
            </div>

            <div className="w-px h-10 bg-white/10 shrink-0" />

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">
                <Search size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Lectura general</span>
                <span className="text-white text-[14px] font-bold tracking-tight">{analysisInsights?.summaryLabels.lecturaLabel}</span>
              </div>
            </div>
          </div>
        </section>

        <div id="analisis-tecnico" className="space-y-12 mb-20">
          {/* MAIN ANALYSIS BLOCK */}
          <section className="bg-slate-50 border-2 border-slate-200 rounded-[40px] p-10 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
              <Lock size={160} />
            </div>
            
            <div className="relative z-10">
              <LoadAnalysisBlock boeId={auction.boeId || ''} isIntegrated={true} />
            </div>
          </section>

          {/* SECONDARY CTA ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.a 
              whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              transition={{ duration: 0.2 }}
              href="https://calendly.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white border border-slate-200 p-7 rounded-[24px] hover:border-brand-200 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Agendar Consulta</h4>
                    <p className="text-[9px] font-bold text-brand-600 uppercase tracking-widest">Consultoría Premium</p>
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  ¿Dudas con el expediente? Analizamos nota simple, edicto y riesgos reales antes de pujar.
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs group-hover:translate-x-1 transition-transform">
                Reservar sesión <ArrowRight size={16} />
              </div>
            </motion.a>

            <motion.div
              whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <Link 
                to={ROUTES.CALCULATOR_SLUG.replace(':slug', cleanSlug)}
                target="_blank"
                className="bg-white border border-slate-200 p-7 rounded-[24px] hover:border-brand-200 transition-all duration-300 group flex flex-col h-full justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                      <Calculator size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">Calcular Puja Máxima</h4>
                      <p className="text-[9px] font-bold text-brand-600 uppercase tracking-widest">Herramienta de Análisis</p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Ahorra tiempo y decide con ventaja calculando tu margen real de beneficio.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs group-hover:translate-x-1 transition-transform">
                  Ir a la calculadora <ArrowRight size={16} />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="space-y-8">
          {/* LONG-TAIL SEO CONTENT */}
          <section className="space-y-16 pb-20">
            <div className="prose prose-slate max-w-none">
              <h2 className="text-4xl font-serif font-bold text-slate-900 mb-8">Análisis del Activo</h2>
              

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={16} className="text-brand-500" />
                    Contexto de Mercado
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{analysisInsights?.marketContext}</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Search size={16} className="text-brand-500" />
                    Interpretación Técnica
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{analysisInsights?.interpretation}</p>
                </div>
              </div>

              <div className="text-slate-600 leading-relaxed text-lg space-y-6">
                <p>{auction.description}</p>
                <p>
                  Esta subasta se tramita bajo el número de expediente <strong className="text-slate-900">{auction.boeId}</strong>. 
                  El procedimiento es de tipo <strong className="text-slate-900">{getAuctionType(auction.boeId)}</strong>, lo que implica unas reglas específicas de participación y plazos de consignación definidos por la Ley de Enjuiciamiento Civil.
                </p>
              </div>

              <h3 className="text-3xl font-serif font-bold text-slate-900 mt-16 mb-8">¿Cómo participar en esta subasta en {cityName}?</h3>
              <div className="text-slate-600 leading-relaxed text-lg space-y-6">
                <p>
                  Para participar en la subasta de este {propertyType.toLowerCase()}, es necesario realizar un depósito (consignación) del 5% del valor de tasación. 
                  En este caso, el depósito requerido es de <strong className="text-slate-900">{auction.appraisalValue ? (auction.appraisalValue * 0.05).toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) : '---'}</strong>.
                </p>
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 my-8">
                  <ul className="list-none p-0 m-0 space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-1" />
                      <span><strong>Registro:</strong> Es obligatorio estar registrado en el Portal de Subastas del BOE.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-1" />
                      <span><strong>Depósito:</strong> Se realiza de forma telemática a través de la pasarela de pagos de la AEAT.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-1" />
                      <span><strong>Puja:</strong> Las pujas se realizan en tramos definidos por el juzgado.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <h3 className="text-3xl font-serif font-bold text-slate-900 mt-16 mb-8">Preguntas Frecuentes</h3>
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-bold text-slate-900 text-xl mb-3">¿Cuál es el descuento teórico respecto a tasación?</p>
                  <p className="text-slate-600 text-lg">
                    En esta subasta en {cityName}, la deuda es de {auction.claimedDebt?.toLocaleString('es-ES')}€ frente a una tasación de {auction.appraisalValue?.toLocaleString('es-ES')}€, 
                    lo que implica un descuento teórico del {auction.appraisalValue && auction.claimedDebt ? Math.round((1 - (auction.claimedDebt / auction.appraisalValue)) * 100) : '---'}%. 
                    Esto representa un margen potencial de {auction.appraisalValue && auction.claimedDebt ? (auction.appraisalValue - auction.claimedDebt).toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : '---'} sobre el valor oficial.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-bold text-slate-900 text-xl mb-3">¿Qué cargas tiene este inmueble en {cityName}?</p>
                  <p className="text-slate-600 text-lg">
                    Según el edicto del expediente {auction.boeId}, la deuda reclamada asciende a {auction.claimedDebt ? auction.claimedDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : '---'}. 
                    Para este {propertyType.toLowerCase()}, es fundamental analizar si existen cargas anteriores en el Registro de la Propiedad de {cityName} que subsistan tras la adjudicación.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RELATED AUCTIONS */}
        {cleanSlug && (
          <div className="mt-24">
            <RelatedAuctions currentAuctionSlug={cleanSlug} currentAuctionData={auction} />
          </div>
        )}
      </main>

      <Footer />

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-40">
        <Link 
          to={ROUTES.CALCULATOR_SLUG.replace(':slug', cleanSlug)}
          target="_blank"
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-2xl flex items-center justify-center gap-3 transform active:scale-95"
        >
          <Calculator size={20} />
          Calcular Puja Máxima
        </Link>
      </div>
    </div>
  );
};

export default AuctionPage;
