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
      
      // Dynamic Title by Status
      const isFinishedStatus = auction.status === 'closed' || isAuctionFinished(auction.auctionDate);
      const isSuspendedStatus = auction.status === 'suspended';
      
      let title = '';
      if (isFinishedStatus) {
        const hasResult = !!(auction.auctionResultStatus || auction.finalPrice);
        const suffix = hasResult ? 'Resultado subasta BOE' : 'Subasta BOE finalizada';
        title = `${propertyType} subastado en ${cityName} | ${suffix}`;
      } else if (isSuspendedStatus) {
        title = `Subasta suspendida en ${cityName} | ${propertyType} en análisis BOE`;
      } else {
        // Active or Upcoming
        title = `${propertyType} en subasta judicial en ${cityName} | Análisis BOE y cargas`;
      }
      
      document.title = title;

      // Meta Description - Dynamic by Status
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        const isFinishedStatus = auction.status === 'closed' || isAuctionFinished(auction.auctionDate);
        const isSuspendedStatus = auction.status === 'suspended';
        
        let desc = '';
        const appraisalStr = auction.appraisalValue ? `${auction.appraisalValue.toLocaleString('es-ES')}€` : 'consultar';

        if (isFinishedStatus) {
          desc = `Subasta BOE finalizada en ${cityName}. ${propertyType} adjudicado. Consulta cargas, riesgos y resultado de esta subasta judicial.`;
        } else if (isSuspendedStatus) {
          desc = `Subasta judicial suspendida en ${cityName}. ${propertyType}. Analizamos cargas, riesgos legales y posibles escenarios del expediente.`;
        } else {
          // Active or Upcoming
          desc = `Subasta judicial de ${propertyType} en ${cityName}. Tasación: ${appraisalStr}. Análisis técnico del expediente BOE: revisión de cargas, deudas y riesgos.`;
        }
        
        metaDesc.setAttribute('content', desc);
      }

      // Canonical Link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `https://activosoffmarket.es/subasta/${cleanSlug}`);

      // Social SEO - Open Graph
      const ogTitle = `${propertyType} en subasta en ${cityName} | Análisis y cargas`;
      const ogDesc = `Análisis técnico de subasta en ${cityName}. Tasación ${auction.appraisalValue?.toLocaleString('es-ES')}€. Deuda ${auction.claimedDebt?.toLocaleString('es-ES')}€. Riesgos y estrategia.`;
      const ogImage = auction.imageUrl || 'https://activosoffmarket.es/og-image-subastas.jpg';
      const ogUrl = `https://activosoffmarket.es/subasta/${cleanSlug}`;

      const setMetaTag = (property: string, content: string, attr: 'property' | 'name' = 'property') => {
        let tag = document.querySelector(`meta[${attr}="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute(attr, property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      setMetaTag('og:title', ogTitle);
      setMetaTag('og:description', ogDesc);
      setMetaTag('og:type', 'article');
      setMetaTag('og:url', ogUrl);
      setMetaTag('og:image', ogImage);

      // Social SEO - Twitter
      setMetaTag('twitter:card', 'summary_large_image', 'name');
      setMetaTag('twitter:title', ogTitle, 'name');
      setMetaTag('twitter:description', ogDesc, 'name');
      setMetaTag('twitter:image', ogImage, 'name');
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

  const statusMessage = useMemo(() => {
    const now = new Date();
    const auctionDate = auction.auctionDate ? new Date(auction.auctionDate) : null;
    const diffTime = auctionDate ? auctionDate.getTime() - now.getTime() : null;
    const diffDays = diffTime !== null ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : null;
    const formattedDate = auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('es-ES') : '---';

    if (isFinished) {
      return {
        title: "⏱️ Demasiado tarde",
        description: (
          <>
            Esta subasta fue adjudicada el {formattedDate}. Oportunidades similares aparecen cada semana.{" "}
            <Link to="/subastas-recientes" className="text-slate-900 font-bold hover:underline ml-1">→ Ver subastas activas</Link>
          </>
        ),
        icon: Clock,
        bgColor: "bg-slate-50",
        borderColor: "border-slate-200",
        iconBgColor: "bg-slate-100",
        iconColor: "text-slate-400",
        titleColor: "text-slate-600",
        descColor: "text-slate-500",
        opacity: "opacity-80"
      };
    }

    if (isSuspended) {
      return {
        title: "⚠️ Procedimiento pausado",
        description: "La subasta ha sido suspendida. Puede reactivarse en cualquier momento. Activa alertas para no perderla.",
        icon: AlertCircle,
        bgColor: "bg-amber-50/50",
        borderColor: "border-amber-100",
        iconBgColor: "bg-amber-100",
        iconColor: "text-amber-600",
        titleColor: "text-amber-900",
        descColor: "text-amber-800/70"
      };
    }

    if (diffDays !== null && diffDays >= 0 && diffDays <= 3) {
      return {
        title: "🔥 Cierre inminente",
        description: "Últimas horas para participar. Revisa cargas y estrategia antes del cierre.",
        icon: Clock,
        bgColor: "bg-red-50/50",
        borderColor: "border-red-100",
        iconBgColor: "bg-red-100",
        iconColor: "text-red-600",
        titleColor: "text-red-900",
        descColor: "text-red-800/70"
      };
    }

    if (diffDays !== null && diffDays >= 0 && diffDays <= 7) {
      return {
        title: "⏳ Cierre próximo",
        description: `Finaliza en pocos días. Asegura tu participación antes del ${formattedDate}.`,
        icon: Clock,
        bgColor: "bg-orange-50/50",
        borderColor: "border-orange-100",
        iconBgColor: "bg-orange-100",
        iconColor: "text-orange-600",
        titleColor: "text-orange-900",
        descColor: "text-orange-800/70"
      };
    }

    if (opportunityRatio && opportunityRatio > 0.35) {
      return {
        title: "💎 Subasta Muy interesante",
        description: "Descuento significativo frente a tasación. Revisa cargas antes de pujar.",
        icon: TrendingUp,
        bgColor: "bg-brand-50/50",
        borderColor: "border-brand-100",
        iconBgColor: "bg-brand-100",
        iconColor: "text-brand-600",
        titleColor: "text-brand-900",
        descColor: "text-brand-800/70"
      };
    }

    if (isUpcoming) {
      return {
        title: "🕓 Apertura próxima",
        description: "Las pujas aún no han comenzado. Tiempo ideal para analizar sin presión.",
        icon: Calendar,
        bgColor: "bg-blue-50/50",
        borderColor: "border-blue-100",
        iconBgColor: "bg-blue-100",
        iconColor: "text-blue-600",
        titleColor: "text-blue-900",
        descColor: "text-blue-800/70"
      };
    }

    // Default: ACTIVA
    return {
      title: "📊 Subasta en curso",
      description: "Periodo de pujas abierto. Analiza bien antes de participar.",
      icon: TrendingUp,
      bgColor: "bg-emerald-50/50",
      borderColor: "border-emerald-100",
      iconBgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-900",
      descColor: "text-emerald-800/70"
    };
  }, [auction, isFinished, isSuspended, isUpcoming, opportunityRatio]);

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

    // Calculate dateModified for SEO freshness
    const dateCandidates = [
      auction.lastCheckedAt,
      auction.resultCheckedAt,
      auction.publishedAt
    ].filter(Boolean) as string[];

    const dateModified = dateCandidates.length > 0 
      ? new Date(Math.max(...dateCandidates.map(d => new Date(d).getTime()))).toISOString()
      : publishedDate.toISOString();

    const availability = isFinished ? "https://schema.org/OutOfStock" : "https://schema.org/InStock";

    const realEstateListing: any = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": finalTitle,
      "description": description,
      "url": url,
      "datePosted": publishedDate.toISOString().split('T')[0],
      "dateModified": dateModified,
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
      "dateModified": dateModified,
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

    const isSuspended = auction.status === 'suspended';

    if (isFinished) {
      faqPage.mainEntity = [
        {
          "@type": "Question",
          "name": "¿A qué precio se adjudicó esta subasta?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Cuando el BOE publica el resultado mostramos la adjudicación real."
          }
        },
        {
          "@type": "Question",
          "name": "¿Se puede comprar después de una subasta finalizada?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "En algunos casos sí, mediante cesión de remate o negociación posterior."
          }
        },
        {
          "@type": "Question",
          "name": "¿Esta subasta ya no es una oportunidad?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Aunque finalizada, sirve como referencia real de mercado."
          }
        }
      ];
    } else if (isSuspended) {
      faqPage.mainEntity = [
        {
          "@type": "Question",
          "name": "¿Por qué se suspende una subasta judicial?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Puede deberse a pago de deuda, recurso o error procesal."
          }
        },
        {
          "@type": "Question",
          "name": "¿Puede reactivarse una subasta suspendida?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sí, muchas subastas BOE se reactivan posteriormente."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué significa suspensión para el inversor?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Indica incertidumbre legal que requiere análisis del expediente."
          }
        }
      ];
    } else {
      // Active or Upcoming
      faqPage.mainEntity = [
        {
          "@type": "Question",
          "name": "¿Esta subasta judicial tiene cargas?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Analizamos el expediente BOE para detectar cargas, deudas y riesgos antes de pujar."
          }
        },
        {
          "@type": "Question",
          "name": "¿Se puede visitar el inmueble antes de la subasta?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Depende del procedimiento. Muchas subastas BOE no permiten visita previa."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué riesgos tiene esta subasta?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ocupación, cargas ocultas o deuda superior. El análisis revisa estos puntos."
          }
        }
      ];
    }

    const breadcrumbList: any = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": "https://activosoffmarket.es"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": `Subastas ${provinceName}`,
          "item": `https://activosoffmarket.es/subastas/${provinceName.toLowerCase()}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": `Subastas ${cityName}`,
          "item": `https://activosoffmarket.es/subastas/${cityName.toLowerCase()}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": `${propertyType} en ${cityName}`,
          "item": url
        }
      ]
    };

    return [realEstateListing, product, faqPage, breadcrumbList];
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

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-2 md:pt-4">
        {/* Breadcrumbs - TOP LEVEL */}
        <nav className="flex items-center text-[9px] md:text-[10px] text-slate-400 mb-3 md:mb-4 font-bold uppercase tracking-widest" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
          <ChevronRight size={8} className="mx-1.5 md:mx-2" />
          <Link to={`/subastas/${provinceName.toLowerCase()}`} className="hover:text-brand-600 transition-colors">Subastas en {provinceName}</Link>
          <ChevronRight size={8} className="mx-1.5 md:mx-2" />
          <span className="text-slate-300">Ficha</span>
        </nav>

        {/* HEADER SECTION */}
        <section className="mb-4 md:mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {isActive && <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[8px] md:text-[9px] font-bold uppercase tracking-widest border border-emerald-200/60 hover:bg-emerald-100 transition-all cursor-default shadow-sm shadow-emerald-100/50">Activa</span>}
            {urgencyBadge && urgencyBadge.text.includes('Cierre') && <span className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 text-[8px] md:text-[9px] font-bold uppercase tracking-widest border border-orange-200/60 flex items-center gap-1.5 hover:bg-orange-100 transition-all cursor-default shadow-sm shadow-orange-100/50"><Clock size={10} /> {urgencyBadge.text}</span>}
            {isFinished && <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[8px] md:text-[9px] font-bold uppercase tracking-widest border border-slate-200/60 hover:bg-slate-200 transition-all cursor-default shadow-sm shadow-slate-100/50">Finalizada</span>}
            {opportunityRatio && opportunityRatio > 0.35 && <span className="px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 text-[8px] md:text-[9px] font-bold uppercase tracking-widest border border-brand-200/60 hover:bg-brand-100 transition-all cursor-default shadow-sm shadow-brand-100/50">Alta oportunidad</span>}
          </div>

          <h1 className="text-[clamp(1.25rem,5vw,2.75rem)] font-serif font-bold text-slate-900 mb-4 md:mb-8 tracking-tighter leading-tight">
            {propertyType} en subasta en {cityName}
          </h1>

          {/* Dynamic SEO Intro */}
          <p className="text-slate-600 text-xs md:text-base leading-relaxed mb-4 md:mb-6 text-justify">
            {opportunityRatio && opportunityRatio > 0.4 
              ? `Esta subasta en ${cityName} presenta un margen excepcional del ${Math.round(opportunityRatio * 100)}% frente a la tasación oficial. Una oportunidad estratégica tanto para inversores profesionales como para familias y pequeños ahorradores que buscan su primera vivienda con un ahorro sustancial.`
              : `Oportunidad de adquisición de ${propertyType.toLowerCase()} en ${cityName} mediante procedimiento ${getAuctionType(auction.boeId).toLowerCase()}. Un activo ideal para particulares que desean capitalizar su ahorro o inversores que buscan rentabilidad con garantías jurídicas.`}
            {" "}El análisis de cargas es el paso crítico para asegurar el éxito de la operación.
          </p>
          
          {/* Address and Share Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10 pb-4 md:pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3 text-lg md:text-2xl text-slate-900 font-bold group cursor-default">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                <MapPin size={20} className="text-brand-600 md:hidden" />
                <MapPin size={24} className="text-brand-600 hidden md:block group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="group-hover:text-brand-700 transition-colors leading-tight">
                {formatAddress(auction.address) || locationLabel}
              </span>
            </div>

            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Compartir:</span>
              <div className="flex items-center gap-2.5 md:gap-3">
                <a href={`https://wa.me/?text=${encodeURIComponent(document.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full text-[#25D366] bg-[#25D366]/5 hover:bg-[#25D366]/10 transition-all hover:scale-110" title="WhatsApp">
                  <MessageCircle size={16} className="md:hidden" />
                  <MessageCircle size={18} className="hidden md:block" />
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(document.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full text-[#000000] bg-[#000000]/5 hover:bg-[#000000]/10 transition-all hover:scale-110" title="X (Twitter)">
                  <Twitter size={16} className="md:hidden" />
                  <Twitter size={18} className="hidden md:block" />
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full text-[#0077B5] bg-[#0077B5]/5 hover:bg-[#0077B5]/10 transition-all hover:scale-110" title="LinkedIn">
                  <Linkedin size={16} className="md:hidden" />
                  <Linkedin size={18} className="hidden md:block" />
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(document.title)}&body=${encodeURIComponent(window.location.href)}`} className="p-1.5 rounded-full text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all hover:scale-110" title="Email">
                  <Mail size={16} className="md:hidden" />
                  <Mail size={18} className="hidden md:block" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN ASSET DATA BLOCK - PREMIUM STYLE */}
        <motion.section 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-[20px] md:rounded-[24px] border border-slate-200 shadow-sm overflow-hidden mb-6 md:mb-8 group"
        >
          {/* Dark Header */}
          <div className="bg-[#151921] px-4 md:px-6 py-3 md:py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white/60 transition-colors">
                <Scale size={14} className="md:hidden" />
                <Scale size={16} className="hidden md:block" />
              </div>
              <div>
                <p className="text-[7px] md:text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Expediente</p>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] md:text-xs font-bold text-white/90">{auction.boeId}</p>
                  <div className="w-px h-3 bg-white/10" />
                  <a 
                    href={auction.boeUrl || `https://subastas.boe.es/detalle_subasta.php?idSub=${auction.boeId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] md:text-[10px] text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1.5 font-bold group/link"
                  >
                    BOE <ExternalLink size={8} className="group-hover/link:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
              <div className="text-right">
                <p className="text-[7px] md:text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Estado</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isSuspended ? 'bg-amber-500' : 'bg-slate-500'}`} />
                  <p className="text-[10px] md:text-xs font-bold text-white/90">
                    {isSuspended ? 'Pausada' : isUpcoming ? 'Próxima' : isFinished ? 'Finalizada' : 'Activa'}
                  </p>
                </div>
              </div>
              <div className="text-right border-l border-white/10 pl-4 md:pl-6">
                <p className="text-[7px] md:text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Tipo</p>
                <p className="text-[10px] md:text-xs font-bold text-white/90">{getAuctionType(auction.boeId)}</p>
              </div>
            </div>
          </div>

          {/* White Lower Card */}
          <div className="p-5 md:py-6 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-center">
            <div className="md:col-span-3 space-y-3 md:space-y-4">
              <div className="space-y-1">
                <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Activo</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <Home size={16} className="md:hidden" />
                    <Home size={18} className="hidden md:block" />
                  </div>
                  <p className="text-lg md:text-xl font-serif font-bold text-slate-900">{propertyType}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ubicación</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <MapPin size={16} className="md:hidden" />
                    <MapPin size={18} className="hidden md:block" />
                  </div>
                  <p className="text-sm md:text-base font-bold text-slate-700 leading-snug">{locationLabel}</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-8 flex items-center justify-between gap-4">
              <div className="flex flex-col justify-center gap-y-3 md:gap-y-4">
                <div className="space-y-0.5">
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tasación</p>
                  <p className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight">
                    {auction.appraisalValue ? auction.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : '---'}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Deuda</p>
                  <p className="text-xl md:text-3xl font-bold text-slate-600 tracking-tight">
                    {auction.claimedDebt ? auction.claimedDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : '---'}
                  </p>
                </div>
              </div>
              
              {opportunityRatio !== null && (
                <div className="flex flex-col items-end justify-center">
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Margen</p>
                  <p className="text-3xl md:text-5xl font-bold text-emerald-600 tracking-tighter leading-none">
                    {Math.round(opportunityRatio * 100)}%
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-3 bg-slate-50/80 rounded-2xl p-5 md:p-6 border border-slate-100 text-center space-y-2 md:space-y-3 group-hover:bg-white transition-colors">
              <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cierre</p>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition-colors">
                  <Calendar size={20} className="md:hidden" />
                  <Calendar size={22} className="hidden md:block" />
                </div>
                <div>
                  <p className="text-lg md:text-xl font-bold text-slate-900">
                    {auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('es-ES') : 'Pendiente'}
                  </p>
                  <p className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest">Fecha límite BOE</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* DYNAMIC AUCTION STATUS BLOCK */}
        <section className="mb-6 md:mb-8">
          <div className={`${statusMessage.bgColor} border ${statusMessage.borderColor} rounded-[24px] md:rounded-[32px] p-4 md:p-6 flex items-center gap-4 md:gap-6 ${statusMessage.opacity || ''}`}>
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${statusMessage.iconBgColor} ${statusMessage.iconColor} flex items-center justify-center shrink-0`}>
              <statusMessage.icon size={24} className="md:hidden" />
              <statusMessage.icon size={28} className="hidden md:block" />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className={`text-lg md:text-xl font-serif font-bold ${statusMessage.titleColor} leading-tight`}>
                {statusMessage.title}
              </h3>
              <p className={`${statusMessage.descColor} text-xs md:text-base leading-tight mt-1`}>
                {statusMessage.description}
              </p>
            </div>
          </div>
        </section>

        {/* DARK VISUAL SUMMARY - COMPACT DYNAMIC BLOCK */}
        <section className="bg-[#151921] rounded-2xl px-4 md:px-6 py-3.5 md:py-5 mb-6 md:mb-8 shadow-xl shadow-slate-200/40 border border-white/5 overflow-hidden">
          {/* Mobile View: High Conversion Compact Stack */}
          <div className="flex md:hidden flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <TrendingUp size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Margen Estimado</span>
                  <span className="text-white text-xs font-bold tracking-tight">{analysisInsights?.summaryLabels.margenLabel}</span>
                </div>
              </div>
              <a 
                href="#analisis-tecnico" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('analisis-tecnico')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1 text-brand-400 text-[10px] font-bold uppercase tracking-wider"
              >
                Ver análisis <ArrowUpRight size={12} />
              </a>
            </div>
            
            <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg border border-white/5">
              <AlertTriangle size={12} className="text-amber-400 shrink-0" />
              <p className="text-[9px] text-white/70 font-medium leading-tight">
                <span className="text-amber-400 font-bold uppercase mr-1">Atención:</span>
                {analysisInsights?.summaryLabels.atencionLabel}
              </p>
            </div>
          </div>

          {/* Desktop View: Original Layout */}
          <div className="hidden md:flex flex-nowrap items-center justify-between gap-x-6 md:gap-x-8 whitespace-nowrap overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
                <TrendingUp size={18} className="md:hidden" />
                <TrendingUp size={20} className="hidden md:block" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Margen</span>
                <span className="text-white text-xs md:text-[14px] font-bold tracking-tight">{analysisInsights?.summaryLabels.margenLabel}</span>
              </div>
            </div>
            
            <div className="w-px h-8 md:h-10 bg-white/10 shrink-0" />

            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20">
                <AlertTriangle size={18} className="md:hidden" />
                <AlertTriangle size={20} className="hidden md:block" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Atención</span>
                <span className="text-white text-xs md:text-[14px] font-bold tracking-tight">{analysisInsights?.summaryLabels.atencionLabel}</span>
              </div>
            </div>

            <div className="w-px h-8 md:h-10 bg-white/10 shrink-0" />

            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">
                <Search size={18} className="md:hidden" />
                <Search size={20} className="hidden md:block" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Lectura</span>
                <span className="text-white text-xs md:text-[14px] font-bold tracking-tight">{analysisInsights?.summaryLabels.lecturaLabel}</span>
              </div>
            </div>
          </div>
        </section>

        <div id="analisis-tecnico" className="space-y-8 md:space-y-12 mb-12 md:mb-20">
          {/* MAIN ANALYSIS BLOCK */}
          <section className="bg-slate-50 border-2 border-slate-200 rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
              <Lock size={120} className="md:hidden" />
              <Lock size={160} className="hidden md:block" />
            </div>
            
            <div className="relative z-10">
              <LoadAnalysisBlock 
                boeId={auction.boeId || ''} 
                boeUrl={auction.boeUrl}
                isIntegrated={true} 
              />
            </div>
          </section>

          {/* SECONDARY CTA ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <motion.a 
              whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              transition={{ duration: 0.2 }}
              href="https://calendly.com/activosoffmarket" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white border border-slate-200 p-5 md:p-7 rounded-[20px] md:rounded-[24px] hover:border-brand-200 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <Calendar size={20} className="md:hidden" />
                    <Calendar size={24} className="hidden md:block" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base md:text-lg">Agendar Consulta</h4>
                    <p className="text-[8px] md:text-[9px] font-bold text-brand-600 uppercase tracking-widest">Consultoría Premium</p>
                  </div>
                </div>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
                  ¿Dudas con el expediente? Analizamos nota simple, edicto y riesgos reales antes de pujar.
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-[10px] md:text-xs group-hover:translate-x-1 transition-transform">
                Reservar sesión <ArrowRight size={14} className="md:hidden" />
                <ArrowRight size={16} className="hidden md:block" />
              </div>
            </motion.a>

            <motion.div
              whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <Link 
                to="/calculadora-subastas"
                target="_blank"
                className="bg-white border border-slate-200 p-5 md:p-7 rounded-[20px] md:rounded-[24px] hover:border-brand-200 transition-all duration-300 group flex flex-col h-full justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-3 md:mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                      <Calculator size={20} className="md:hidden" />
                      <Calculator size={24} className="hidden md:block" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base md:text-lg">Calcular Puja Máxima</h4>
                      <p className="text-[8px] md:text-[9px] font-bold text-brand-600 uppercase tracking-widest">Herramienta de Análisis</p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
                    Ahorra tiempo y decide con ventaja calculando tu margen real de beneficio.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-bold text-[10px] md:text-xs group-hover:translate-x-1 transition-transform">
                  Ir a la calculadora <ArrowRight size={14} className="md:hidden" />
                  <ArrowRight size={16} className="hidden md:block" />
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
          to="/calculadora-subastas"
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
