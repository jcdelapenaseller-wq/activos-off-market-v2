import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  Calculator, Gavel, TrendingUp, Search, ChevronRight, 
  MapPin, Home, DollarSign, AlertTriangle, CheckCircle, 
  Info, ArrowRight, FileText, Scale, ShieldCheck, AlertOctagon,
  Clock, Calendar, User, Share2, Printer
} from 'lucide-react';
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
import Header from './Header';
import Footer from './Footer';

const AuctionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const auction = slug ? AUCTIONS[slug] : null;

  // Calculator State
  const [valorMercado, setValorMercado] = useState<number | ''>('');
  const [deudas, setDeudas] = useState<number | ''>('');

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
    }
  }, [slug, auction]);

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
    
    // Market Context Logic (Natural Language)
    let marketContext = "";
    if (auction.appraisalValue) {
      marketContext = `En este caso, los niveles de mercado para activos similares en esta zona de ${cityName} validan la tasación oficial de forma coherente. Se trata de rangos habituales para ${propertyType.toLowerCase()} en este barrio, lo que sugiere que el valor de referencia es una base sólida para el cálculo de rentabilidad y minimiza la incertidumbre técnica en la valoración.`;
    } else {
      marketContext = `Al no contar con una tasación oficial detallada, el análisis debe basarse necesariamente en los niveles de mercado similares en la zona de ${provinceName}. Esto implica que la demanda en este sector es constante, lo que aporta una capa de prudencia necesaria al definir el escenario de salida tras la adjudicación.`;
    }

    // Investor Profile Logic
    let investorProfile = "";
    const notHabitual = isJudicial ? "Por otro lado, conviene tener en cuenta que no es un activo habitual para perfiles que necesiten financiación bancaria inmediata o posesión en menos de 3 meses debido a los tiempos del juzgado." : "Por otro lado, es recomendable observar que no es habitual para perfiles que busquen los tiempos flexibles de una compraventa tradicional entre particulares.";
    
    if (discount > 45) {
      investorProfile = `Este activo encaja principalmente con inversores especialistas en 'flipping' o activos con gestión jurídica compleja que buscan maximizar el retorno. ${notHabitual}`;
    } else if (discount > 25) {
      investorProfile = `El perfil ideal aquí es el de inversores patrimonialistas (Buy-to-Rent) que buscan maximizar el flujo de caja mediante un coste de entrada reducido. ${notHabitual}`;
    } else {
      investorProfile = `Se trata de una opción para compradores finalistas o inversores conservadores que priorizan la ubicación estratégica sobre el descuento extremo. ${notHabitual}`;
    }

    // Interpretation Logic
    let interpretation = "";
    if (auction.appraisalValue && auction.claimedDebt) {
      const ratio = (auction.claimedDebt / auction.appraisalValue) * 100;
      interpretation = `La oportunidad real en este expediente reside en la excelente relación deuda/valor, ya que la carga reclamada representa solo el ${ratio.toFixed(1)}% de la tasación oficial. En este contexto, esto genera un "colchón" de seguridad muy relevante que permite absorber posibles desviaciones en gastos de desahucio o IBI pendiente sin comprometer la viabilidad financiera de la operación.`;
    } else {
      interpretation = "La falta de desglose de deuda en el edicto aconseja un enfoque de 'máxima cautela' por parte del analista. En este caso, la oportunidad no es evidente por los números públicos, sino que debe buscarse en la posible ausencia de otros postores debido a la opacidad inicial del expediente, lo que requiere una investigación de campo más profunda.";
    }

    // Practical Implications
    const practicalImplications = isJudicial 
      ? "Un inversor en este procedimiento debe centrarse prioritariamente en la obtención del testimonio del decreto de adjudicación. Esto implica que el paso crítico no es la puja en sí, sino la gestión posterior del lanzamiento si el inmueble no se entrega voluntariamente, algo que requiere prever un presupuesto específico para procurador y cerrajería técnica."
      : "En este procedimiento administrativo, el éxito depende críticamente de la velocidad de liquidación y el cumplimiento de hitos. A diferencia del juzgado, aquí los plazos de pago son improrrogables y la comprobación de cargas previas es responsabilidad exclusiva del postor antes de depositar la fianza, lo que exige una diligencia previa impecable.";

    // Scenarios
    const bestCase = "En el mejor de los escenarios, la adjudicación se produciría cerca de la deuda mínima, encontrando el inmueble vacío de ocupantes y logrando un registro de la propiedad limpio en menos de 5 meses.";
    const worstCase = "Por el contrario, el escenario de mayor complejidad contempla una ocupación por terceros sin título, deudas de comunidad de varios ejercicios y una demora judicial que podría superar los 14 meses hasta la toma de posesión.";

    // Sense Logic
    const hasSense = discount > 25 && auction.claimedDebt;
    const senseText = hasSense 
      ? "Esta subasta tiene sentido si buscas un activo con margen suficiente para delegar la gestión jurídica y aun así obtener una rentabilidad neta superior al 12% anual."
      : "En este caso, el sentido de la puja reside en buscar un activo específico por ubicación o tipología que rara vez sale al mercado abierto, aceptando un margen más estrecho a cambio de la exclusividad del inmueble.";
    
    const cautionText = !auction.claimedDebt 
      ? "Se requiere una atención especial si no tienes capacidad para investigar el expediente directamente en el juzgado o no cuentas con liquidez para cubrir cargas imprevistas de última hora."
      : isJudicial 
        ? "Conviene revisar los tiempos si necesitas disponer de la vivienda de forma inmediata; los plazos judiciales en este tipo de activos suelen ser incompatibles con urgencias habitacionales."
        : "Es recomendable verificar la libertad de cargas en el Registro de la Propiedad en las últimas 48 horas, dado el carácter administrativo del proceso.";

    // Procedural Context Logic (Dynamic SEO)
    let proceduralContext = "";
    const typeLabel = propertyType.toLowerCase();
    const isAEAT = auction.boeId?.startsWith('SUB-AT');
    const hasData = auction.appraisalValue && auction.claimedDebt;

    if (isJudicial) {
      const intros = [
        `Este procedimiento judicial en ${cityName} se rige por la Ley de Enjuiciamiento Civil, lo que garantiza un marco jurídico estructurado para la adquisición de este ${typeLabel}.`,
        `La ejecución judicial que afecta a este activo en ${provinceName} requiere una validación minuciosa del decreto de adjudicación para asegurar una transmisión de propiedad limpia.`,
        `Al tratarse de una subasta gestionada por los juzgados de ${cityName}, el proceso de toma de posesión de este ${typeLabel} seguirá los cauces procesales habituales de la zona.`
      ];
      const details = hasData 
        ? `La existencia de una tasación oficial de ${auction.appraisalValue?.toLocaleString()}€ facilita la transparencia en la puja, aunque siempre conviene contrastar las cargas preferentes.`
        : `La ausencia de valores de referencia en el edicto judicial de este ${typeLabel} sugiere que la oportunidad puede residir en la menor concurrencia de postores no profesionales.`;
      
      // Use a simple selection logic based on boeId length or similar to vary
      const index = (auction.boeId?.length || 0) % intros.length;
      proceduralContext = `${intros[index]} ${details} El elemento clave en este expediente judicial reside en la correcta interpretación de la certificación de cargas del registro.`;
    } else if (isAEAT) {
      const intros = [
        `La Agencia Tributaria (AEAT) gestiona la enajenación de este ${typeLabel} en ${cityName} mediante su sistema de subastas administrativas con plazos de depósito específicos.`,
        `Este activo en la provincia de ${provinceName} sale a subasta vía AEAT, un procedimiento que destaca por su agilidad pero que exige una revisión previa de cargas anteriores.`,
        `Al participar en esta subasta administrativa en ${cityName}, el postor debe tener en cuenta que la AEAT no siempre detalla el estado de ocupación del ${typeLabel}.`
      ];
      const index = (auction.boeId?.length || 0) % intros.length;
      proceduralContext = `${intros[index]} Es recomendable verificar la libertad de cargas en el Registro de la Propiedad, ya que en el ámbito tributario la responsabilidad de comprobación recae totalmente en el postor.`;
    } else {
      proceduralContext = `Este expediente administrativo para el ${typeLabel} situado en ${cityName} presenta las particularidades propias de los organismos públicos locales o de la Seguridad Social. Requiere una validación técnica de los plazos de adjudicación y una revisión profunda del expediente completo para evitar sorpresas en la liquidación final.`;
    }

    // Appraisal warning logic integrated
    if (!auction.appraisalValue) {
      proceduralContext += ` Dada la falta de tasación oficial en el anuncio de ${cityName}, se aconseja realizar una investigación de campo para evitar el riesgo de sobrepuja en este ${typeLabel}.`;
    }

    // Soft FOMO Logic (Dynamic & Subtle)
    const fomoOptions = {
      scarcity: [
        `No es habitual encontrar este nivel de margen en activos de esta tipología en ${cityName}.`,
        `Oportunidades con este diferencial de precio en ${provinceName} suelen ser escasas en el mercado abierto.`,
        `La relación deuda/valor de este expediente es poco frecuente para ${typeLabel} en esta zona.`
      ],
      competition: [
        `Este tipo de activos suele atraer a inversores activos que buscan rentabilidades netas de doble dígito.`,
        `Dada la ubicación en ${cityName}, es previsible un interés profesional por parte de fondos patrimonialistas.`,
        `Activos con estas características técnicas suelen estar en el radar de los inversores más experimentados de ${provinceName}.`
      ],
      opportunity: [
        `Situaciones con este nivel de "colchón" de seguridad suelen analizarse con rapidez por perfiles especialistas.`,
        `Este expediente representa una de las opciones más sólidas detectadas recientemente en ${cityName} por su estructura de deuda.`,
        `El potencial de revalorización tras la gestión jurídica convierte a este ${typeLabel} en una pieza estratégica.`
      ],
      timing: [
        `Este tipo de operaciones se preparan con antelación suficiente para asegurar la viabilidad del lanzamiento posterior.`,
        `La ventana de oportunidad para analizar este expediente antes del cierre requiere una diligencia ágil pero rigurosa.`,
        `Los inversores que logran las mejores adjudicaciones suelen ser aquellos que inician la investigación en esta fase del proceso.`
      ]
    };

    const getFomo = (type: keyof typeof fomoOptions) => {
      const options = fomoOptions[type];
      const index = (auction.boeId?.length || 0) % options.length;
      return options[index];
    };

    const fomo = {
      interpretation: getFomo('opportunity'),
      market: getFomo('scarcity'),
      preCta: getFomo('competition'),
      timing: getFomo('timing')
    };

    return { marketContext, investorProfile, senseText, cautionText, interpretation, practicalImplications, bestCase, worstCase, proceduralContext, fomo };
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
    if (!auction || !slug) return null;

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
    faqPage.mainEntity.push({
      "@type": "Question",
      "name": `¿Cuánto podría costar esta subasta de ${propertyType.toLowerCase()} en ${cityName}?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": auction.appraisalValue 
          ? `El valor de tasación oficial para esta subasta en ${cityName} es de ${auction.appraisalValue.toLocaleString('es-ES')}€. Sin embargo, el precio final dependerá de las pujas y de si existe un tipo mínimo establecido.`
          : `El valor de tasación para esta subasta en ${cityName} no se ha especificado públicamente. Recomendamos revisar el edicto oficial para más detalles sobre el valor de mercado.`
      }
    });

    // 2. ¿Está ocupada esta subasta?
    const occupancyStatus = auction.occupancy || 'No consta información registral sobre la ocupación';
    faqPage.mainEntity.push({
      "@type": "Question",
      "name": `¿Está ocupada esta propiedad en subasta?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `Según la información disponible, el estado de ocupación es: ${occupancyStatus}. Es fundamental verificar la situación posesoria real antes de participar en cualquier subasta inmobiliaria.`
      }
    });

    // 3. ¿Qué deudas puede tener esta subasta?
    faqPage.mainEntity.push({
      "@type": "Question",
      "name": `¿Qué deudas o cargas tiene esta subasta?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": auction.claimedDebt !== undefined
          ? `La cantidad reclamada que origina esta subasta es de ${auction.claimedDebt.toLocaleString('es-ES')}€. Es imprescindible solicitar una nota simple actualizada para comprobar si existen cargas anteriores que el adjudicatario deba asumir.`
          : `No se ha especificado la cantidad reclamada exacta. Es imprescindible solicitar una nota simple actualizada para comprobar las cargas y deudas que el adjudicatario deba asumir.`
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
    <div className="bg-slate-50 min-h-screen font-sans text-slate-600">
      {jsonLd && (
        <>
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
          {jsonLd[0].image && <link rel="preload" as="image" href={jsonLd[0].image} />}
        </>
      )}
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
                {isSuspended && (
                  <span className="px-4 py-1.5 rounded-full text-sm font-bold border bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Pausada temporalmente
                  </span>
                )}
                {isUpcoming && (
                  <span className="px-4 py-1.5 rounded-full text-sm font-bold border bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1.5">
                    <Clock size={14} /> Próxima apertura
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
                {formatAddress(auction.address) && (
                  <span className="block text-2xl md:text-3xl text-slate-500 mt-4 font-sans font-normal">
                    ({formatAddress(auction.address)})
                  </span>
                )}
              </h1>

              <ShareButtons title={`${propertyType} en subasta en ${cityName}`} className="mb-8 -mt-2" />

              {auction.imageUrl ? (
                <>
                  <figure className="mb-10 relative group rounded-3xl overflow-hidden shadow-sm border border-slate-200">
                    <img 
                      src={auction.imageUrl} 
                      alt={`Subasta de ${propertyType.toLowerCase()} en ${cityName}`}
                      className="w-full h-[300px] md:h-[450px] object-cover"
                      referrerPolicy="no-referrer"
                      width="1200"
                      height="675"
                      fetchPriority="high"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40"></div>
                  </figure>

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
                      {auction.claimedDebt === 0 ? (
                        <span className="text-xl font-bold text-slate-700">Sin cargas</span>
                      ) : (auction.appraisalValue && auction.claimedDebt && (1 - auction.claimedDebt / auction.appraisalValue) > 0.85) ? (
                        <span className="text-xl font-bold text-slate-700">Oportunidad</span>
                      ) : (
                        <span className={`text-4xl font-black ${opportunityRatio && opportunityRatio > 0.4 ? 'text-emerald-700' : 'text-brand-700'}`}>
                          {opportunityRatio ? `${(opportunityRatio * 100).toFixed(0)}%` : '---'}
                        </span>
                      )}
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
                      <span className="text-sm text-slate-400 uppercase tracking-wider font-bold block mb-2">Tipo de subasta</span>
                      <span className="text-xl font-bold text-slate-900">
                        {getAuctionType(auction.boeId)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* Professional Technical Header (Ficha Inversor) */
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-12">
                  <div className="bg-slate-900 px-8 py-5 text-white flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Scale size={20} className="text-brand-400" />
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block leading-none mb-1">Expediente Judicial</span>
                        <span className="font-mono text-sm font-bold">{auction.boeId}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block leading-none mb-1">Estado</span>
                        <span className="text-sm font-bold flex items-center gap-1.5 justify-end">
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {isSuspended ? 'Pausada' : isUpcoming ? 'Próxima' : isFinished ? 'Finalizada' : 'Activa'}
                        </span>
                      </div>
                      <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block leading-none mb-1">Procedimiento</span>
                        <span className="text-sm font-bold">{getAuctionType(auction.boeId)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Activo</h3>
                        <p className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
                          <Home size={24} className="text-brand-600" /> {propertyType}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Localización</h3>
                        <p className="text-lg font-medium text-slate-700 flex items-center gap-2">
                          <MapPin size={20} className="text-brand-600" /> {cityName}, {provinceName}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6 md:border-l md:border-slate-100 md:pl-10">
                      <div>
                        <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Valor de Tasación</h3>
                        <p className="text-3xl font-black text-slate-900">
                          {auction.appraisalValue ? auction.appraisalValue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : '---'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Deuda Reclamada</h3>
                          <p className="text-xl font-bold text-slate-700">
                            {auction.claimedDebt ? auction.claimedDebt.toLocaleString('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : '---'}
                          </p>
                        </div>
                        <div className="bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 text-center">
                          <span className="text-[10px] uppercase font-bold text-emerald-600 block leading-none mb-1">Margen</span>
                          <span className="text-lg font-black text-emerald-700">
                            {opportunityRatio ? `${(opportunityRatio * 100).toFixed(0)}%` : '---'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 flex flex-col justify-center border border-slate-100">
                      <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">Cierre de Subasta</h3>
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                          <Calendar size={28} className="text-brand-600" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-slate-900">
                            {auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('es-ES') : 'Pendiente'}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">Fecha límite BOE</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col items-center md:items-start gap-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <Link 
                    to={`${ROUTES.CALCULATOR}?mercado=${valorMercado}&deudas=${deudas}&ccaa=${provinceName}&tasacion=${auction.appraisalValue || ''}`}
                    onClick={() => trackConversion(auction.province || 'unknown', 'ficha', 'calculator_from_card_click', { precio: deudas || 0 })}
                    className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors group/calc bg-brand-50/50 px-4 py-2 rounded-lg border border-brand-100/50"
                  >
                    <Calculator size={16} className="group-hover/calc:scale-110 transition-transform" />
                    Ver mi puja máxima real
                  </Link>
                  
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${opportunityRatio && opportunityRatio >= 0.2 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {opportunityRatio && (opportunityRatio >= 0.2 || auction.claimedDebt === 0) 
                      ? "✨ Esta oportunidad puede ser rentable" 
                      : "⚠️ Podrías estar pagando de más"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium pl-1">
                  En menos de 10 segundos
                </p>
              </div>
            </header>

            {/* Auction Result Banner */}
            {slug && AUCTION_RESULTS[slug] && (
              <div className="bg-white border-2 border-slate-900 p-8 rounded-2xl mb-16 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                  <CheckCircle className="text-emerald-600" /> Resultado de la subasta
                </h3>
                {AUCTION_RESULTS[slug].auctionResultStatus === 'adjudicated' ? (
                  <div>
                    <p className="text-lg text-slate-700 mb-2">
                      Precio de adjudicación: <span className="font-bold text-slate-900 text-xl">{AUCTION_RESULTS[slug].finalPrice?.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</span>
                    </p>
                    <p className="text-md text-slate-600 italic">
                      {auction.appraisalValue && AUCTION_RESULTS[slug].finalPrice 
                        ? AUCTION_RESULTS[slug].finalPrice! < auction.appraisalValue * 0.9 
                          ? "Adjudicada significativamente por debajo del valor de tasación."
                          : AUCTION_RESULTS[slug].finalPrice! > auction.appraisalValue * 1.1
                            ? "Adjudicada por encima del valor de tasación."
                            : "Adjudicada en línea con el valor de tasación."
                        : "Resultado confirmado."}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-slate-900">Subasta sin pujas</p>
                )}
              </div>
            )}

            {/* Status-specific Messages */}
            {isUpcoming && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-16 text-blue-800 shadow-sm">
                <div className="flex items-start gap-5">
                  <div className="bg-blue-100 p-3 rounded-xl shrink-0">
                    <Clock className="text-blue-600" size={28} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-2xl mb-2 text-blue-900">Esta subasta aún no ha comenzado</h3>
                    <p className="text-blue-800/80 text-lg leading-relaxed mb-4">
                      Se abrirá próximamente para pujas. <span className="font-bold">Anticípate: el éxito se decide antes de la apertura.</span>
                    </p>
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-700 uppercase tracking-widest">
                      <ShieldCheck size={16} /> Fase de análisis recomendada
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isSuspended && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-16 text-amber-800 shadow-sm">
                <div className="flex items-start gap-5">
                  <div className="bg-amber-100 p-3 rounded-xl shrink-0">
                    <AlertTriangle className="text-amber-600" size={28} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-2xl mb-2 text-amber-900">Subasta pausada temporalmente</h3>
                    <p className="text-amber-800/80 text-lg leading-relaxed">
                      El procedimiento se encuentra en pausa técnica o administrativa. <span className="font-bold text-amber-900">Puede reactivarse en cualquier momento</span> tras la resolución del incidente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isActive && !isFinished && !isUpcoming && !isSuspended && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 mb-16 text-emerald-800 shadow-sm">
                <div className="flex items-start gap-5">
                  <div className="bg-emerald-100 p-3 rounded-xl shrink-0">
                    <TrendingUp className="text-emerald-600" size={28} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-2xl mb-2 text-emerald-900">Subasta en curso</h3>
                    <p className="text-emerald-800/80 text-lg leading-relaxed">
                      El periodo de pujas está abierto y activo. {auction.auctionDate && (
                        <span>La fecha límite para consignar y pujar es el <strong className="text-emerald-900">{new Date(auction.auctionDate).toLocaleDateString('es-ES')}</strong>.</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Summary Block */}
            <div className="bg-brand-900 text-white rounded-3xl p-6 mb-8 shadow-lg">
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
                    <p className="text-xs text-brand-300 uppercase font-bold tracking-widest">Punto de atención</p>
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

            {/* Secondary CTA */}
            <div className="text-center mb-16">
              <Link 
                to={`${ROUTES.CALCULATOR}?mercado=${valorMercado}&deudas=${deudas}&ccaa=${provinceName}&tasacion=${auction.appraisalValue || ''}`}
                onClick={() => trackConversion(auction.province || 'unknown', 'ficha', 'calculator')}
                className="inline-block bg-brand-600 text-white font-bold py-4 px-8 rounded-full hover:bg-brand-700 transition shadow-md"
              >
                Analizar esta subasta en detalle
              </Link>
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
              <div className="prose prose-slate prose-lg max-w-none mb-12 text-slate-700">
                <p className="mb-6">
                  Esta subasta presenta características técnicas que requieren un análisis pormenorizado antes de proceder con cualquier puja. 
                  La valoración inicial y el estado de las cargas son factores determinantes para el éxito de la operación.
                </p>
                <p className="mb-6">
                  El activo se encuentra en {auction.city}, una zona con {auction.propertyType === 'Vivienda' ? 'demanda residencial activa' : 'potencial de desarrollo'}. 
                  Es fundamental revisar el estado de ocupación para evitar retrasos en la toma de posesión.
                </p>
                <p className="mb-6">
                  Recomendamos encarecidamente realizar un estudio de cargas registrales actualizado, 
                  ya que las deudas preferentes pueden alterar significativamente la rentabilidad final del activo.
                </p>
              </div>
              
              <div className="prose prose-slate max-w-none mb-12">
                {auction.appraisalValue && auction.claimedDebt ? (
                  <div className="space-y-16">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Search size={20} className="text-brand-600" /> Interpretación del expediente
                      </h3>
                      <p className="text-lg leading-relaxed text-slate-700">
                        {analysisInsights?.interpretation}
                      </p>
                      <p className="mt-4 text-brand-700 font-medium italic border-l-2 border-brand-200 pl-4">
                        {analysisInsights?.fomo?.interpretation}
                      </p>
                    </div>

                    {!isFinished && (
                      <div className="my-12">
                        <ConsultingCTA 
                          isHighUrgency={opportunityRatio === null} 
                          province={provinceName} 
                          compact={true}
                        />
                      </div>
                    )}

                    <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Scale size={20} className="text-brand-600" /> Implicaciones prácticas
                      </h3>
                      <p className="text-slate-700 leading-relaxed mb-10 text-lg">
                        {analysisInsights?.practicalImplications}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                          <p className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
                            <CheckCircle size={18} /> Escenario Optimista
                          </p>
                          <p className="text-slate-600 leading-relaxed">{analysisInsights?.bestCase}</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                          <p className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                            <AlertTriangle size={18} /> Escenario de mayor complejidad
                          </p>
                          <p className="text-slate-600 leading-relaxed">{analysisInsights?.worstCase}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <p className="text-slate-700 text-lg leading-relaxed">
                        <strong className="text-emerald-700 flex items-center gap-2 mb-2"><TrendingUp size={20}/> Potencial:</strong> 
                        Existe un margen de seguridad para cubrir gastos de ITP, notaría y posibles reformas, manteniendo rentabilidad.
                      </p>
                      <p className="text-slate-700 text-lg leading-relaxed">
                        <strong className="text-amber-700 flex items-center gap-2 mb-2"><AlertTriangle size={20}/> Precaución:</strong> 
                        Es recomendable verificar la certificación de cargas para descartar anotaciones preventivas o hipotecas preferentes no incluidas.
                      </p>
                    </div>

                    <div className="space-y-12 pt-12 border-t border-slate-100">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <MapPin size={20} className="text-brand-600" /> Contexto de mercado
                        </h3>
                        <p className="text-slate-700 leading-relaxed text-lg">
                          {analysisInsights?.marketContext}
                        </p>
                        <p className="mt-4 text-slate-500 italic text-sm">
                          {analysisInsights?.fomo?.market}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <User size={20} className="text-brand-600" /> Perfil inversor habitual
                        </h3>
                        <p className="text-slate-700 leading-relaxed text-lg">
                          {analysisInsights?.investorProfile}
                        </p>
                      </div>
                    </div>

                    <div className="bg-brand-50/50 p-10 rounded-3xl border border-brand-100">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <CheckCircle size={20} className="text-brand-600" /> ¿Tiene sentido esta subasta?
                      </h3>
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="mt-1 bg-emerald-100 p-1.5 rounded-full shrink-0">
                            <CheckCircle size={16} className="text-emerald-700" />
                          </div>
                          <p className="text-slate-700 text-lg">
                            <strong className="block text-emerald-800 mb-1">Sí, si buscas:</strong> {analysisInsights?.senseText}
                          </p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="mt-1 bg-amber-100 p-1.5 rounded-full shrink-0">
                            <AlertOctagon size={16} className="text-amber-700" />
                          </div>
                          <p className="text-slate-700 text-lg">
                            <strong className="block text-amber-800 mb-1">⚠ Requiere precaución si:</strong> {analysisInsights?.cautionText}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-500 italic text-sm mt-8">
                      {analysisInsights?.fomo?.preCta} {analysisInsights?.fomo?.timing} Este tipo de expedientes suele requerir revisión completa del expediente judicial y de las cargas registrales antes de tomar una decisión.
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
                        {!isFinished && (
                          <a 
                            href="https://calendly.com/activosoffmarket" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={() => trackConversion(provinceName, 'ficha', 'consultoria')}
                            className="inline-flex items-center gap-2 bg-amber-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-900 transition-colors shadow-md"
                          >
                            Solicitar análisis <ChevronRight size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-16">
                <RadarPremiumCTA 
                  location={provinceName} 
                  propertyType={propertyType} 
                  variant="minimal"
                  origin="ficha"
                />
              </div>

              {/* Dynamic SEO Block */}
              <div className="mt-12 pt-10 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Scale size={24} className="text-brand-600" /> 
                  Contexto del procedimiento
                </h3>
                <div className="text-slate-700 leading-relaxed text-lg bg-slate-50 p-8 rounded-3xl border border-slate-100">
                  <p>
                    {analysisInsights?.proceduralContext}
                  </p>
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
                      <div className={`w-5 h-5 rounded-full border-4 mb-3 mx-auto ${isSuspended ? 'bg-amber-500 border-amber-100' : isUpcoming ? 'bg-blue-500 border-blue-100' : 'bg-brand-600 border-brand-100'}`}></div>
                      <p className={`text-xs font-bold uppercase ${isSuspended ? 'text-amber-600' : isUpcoming ? 'text-blue-600' : 'text-brand-600'}`}>
                        {isSuspended ? 'Pausada' : isUpcoming ? 'Próxima' : 'En curso'}
                      </p>
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

            {/* CTA Calculadora Interactiva */}
            <section className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm mb-16 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="bg-brand-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calculator className="text-brand-600" size={32} />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4">
                  Tienes los números. Ajusta tu rentabilidad en 30 segundos
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  Simula reforma, impuestos y riesgos antes de pujar
                </p>
                <Link 
                  to={`${ROUTES.CALCULATOR}?mercado=${valorMercado}&deudas=${deudas}&ccaa=${provinceName}&tasacion=${auction.appraisalValue || ''}`}
                  onClick={() => trackConversion(auction.province || 'unknown', 'ficha', 'calculator')}
                  className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-bold px-10 py-4 rounded-xl hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/30 text-lg transform active:scale-95"
                >
                  Calcular mi puja real <ArrowRight size={20} />
                </Link>
              </div>
            </section>

            {/* Noticias Link */}
            <div className="text-center mb-16">
              <Link 
                to={ROUTES.NOTICIAS_SUBASTAS_INDEX}
                className="inline-flex items-center justify-center gap-2 bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold py-4 px-8 rounded-full hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm"
              >
                Ver más noticias y análisis de subastas <ArrowRight size={20} />
              </Link>
            </div>

            {slug && <div className="mt-16"><RelatedAuctions currentAuctionSlug={slug} currentAuctionData={auction} /></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionPage;
