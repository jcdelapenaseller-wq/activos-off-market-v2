import React, { useEffect, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { AUCTIONS } from '../data/auctions';
import { getFilteredAuctions } from '../utils/auctionHelpers';
import { Calendar, ChevronRight, TrendingUp, MapPin, ArrowRight, Star, Zap } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { isAuctionFinished, sortActiveFirst } from '../utils/auctionHelpers';
import { normalizeProvince, normalizePropertyType, normalizeLocationLabel } from '../utils/auctionNormalizer';
import { trackConversion } from '../utils/tracking';
import { AuctionCard } from './AuctionCard';
import PremiumValueBlock from './PremiumValueBlock';
import { ShareButtons } from './ShareButtons';
import { getImageForPropertyType } from '../constants/auctionImages';

import { getAllowedProvincesForToday, isProvinceEligible, isHighQualityProvinceArticle } from '../utils/discoverLimits';

const DiscoverProvinceArticle: React.FC = () => {
  const { province } = useParams<{ province: string }>();
  
  const isEligible = useMemo(() => {
    if (!province) return false;
    return isProvinceEligible(province, AUCTIONS);
  }, [province]);

  const isHighQuality = useMemo(() => {
    if (!province) return false;
    return isHighQualityProvinceArticle(province, AUCTIONS);
  }, [province]);

  const allowedProvinces = useMemo(() => getAllowedProvincesForToday(), []);
  const normalizedProvinceParam = useMemo(() => {
    if (!province) return '';
    return normalizeProvince(province.replace(/-/g, ' ')).toLowerCase();
  }, [province]);

  const isAllowed = useMemo(() => {
    if (!province || !isEligible) return false;
    return allowedProvinces.some(allowed => normalizeProvince(allowed).toLowerCase() === normalizedProvinceParam);
  }, [normalizedProvinceParam, allowedProvinces, isEligible]);

  if (!isAllowed) {
    return <Navigate to="/noticias-subastas" replace />;
  }

  const provinceAuctions = useMemo(() => {
    if (!province) return [];
    const filtered = Object.entries(AUCTIONS).filter(([_, a]) => {
      const p = normalizeProvince(a.province || a.city).toLowerCase();
      return p === normalizedProvinceParam || p.includes(normalizedProvinceParam) || normalizedProvinceParam.includes(p);
    });
    return sortActiveFirst(filtered, (item) => item[1].auctionDate);
  }, [province, normalizedProvinceParam]);

  const provinceName = useMemo(() => {
    if (provinceAuctions.length > 0) {
      return normalizeProvince(provinceAuctions[0][1].province || provinceAuctions[0][1].city);
    }
    if (!province) return '';
    return province.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, [provinceAuctions, province]);

  const sortedProvinceAuctions = useMemo(() => {
    if (provinceAuctions.length === 0) return [];

    // 1. Filter active auctions first
    const active = provinceAuctions.filter(([_, a]) => !isAuctionFinished(a.auctionDate));
    
    // 2. Preferred: NEW (published < 48h) or ENDING_SOON (closing < 3 days)
    const now = new Date().getTime();
    const preferred = active.filter(([_, a]) => {
      const isNew = a.publishedAt ? (now - new Date(a.publishedAt).getTime()) < (48 * 60 * 60 * 1000) : false;
      const isEndingSoon = a.auctionDate ? (new Date(a.auctionDate).getTime() - now) < (3 * 24 * 60 * 60 * 1000) && (new Date(a.auctionDate).getTime() - now) > 0 : false;
      return isNew || isEndingSoon;
    });

    const pool = preferred.length > 0 ? preferred : (active.length > 0 ? active : provinceAuctions);

    // 3. Sort by criteria: Housing > Opportunity Score > Date
    return [...pool].sort((a, b) => {
      const aData = a[1];
      const bData = b[1];

      // Housing priority
      const aIsHousing = normalizePropertyType(aData.propertyType).toLowerCase().includes('vivienda');
      const bIsHousing = normalizePropertyType(bData.propertyType).toLowerCase().includes('vivienda');
      if (aIsHousing && !bIsHousing) return -1;
      if (!aIsHousing && bIsHousing) return 1;

      // Opportunity Score priority (if exists)
      const aScore = (aData as any).opportunityScore || 0;
      const bScore = (bData as any).opportunityScore || 0;
      if (aScore !== bScore) return bScore - aScore;

      // Date priority (closer to now)
      const aTime = aData.auctionDate ? new Date(aData.auctionDate).getTime() : 0;
      const bTime = bData.auctionDate ? new Date(bData.auctionDate).getTime() : 0;
      return aTime - bTime;
    });
  }, [provinceAuctions]);

  const featuredAuction = useMemo(() => sortedProvinceAuctions[0] || null, [sortedProvinceAuctions]);
  
  const activeAuctions = useMemo(() => {
    return provinceAuctions.filter(([_, data]) => !isAuctionFinished(data.auctionDate));
  }, [provinceAuctions]);

  const recentlyAdjudicated = useMemo(() => {
    if (provinceAuctions.length === 0) return [];
    return provinceAuctions
      .filter(([_, a]) => a.auctionResultStatus === 'adjudicated' && a.finalPrice)
      .sort((a, b) => {
        const aTime = a[1].resultCheckedAt ? new Date(a[1].resultCheckedAt).getTime() : 0;
        const bTime = b[1].resultCheckedAt ? new Date(b[1].resultCheckedAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 3);
  }, [provinceAuctions]);

  const featuredOpportunity = useMemo(() => {
    if (activeAuctions.length === 0) return null;
    
    const now = new Date().getTime();
    const urgent = activeAuctions.filter(([_, a]) => {
      const isNew = a.publishedAt ? (now - new Date(a.publishedAt).getTime()) < (48 * 60 * 60 * 1000) : false;
      const isEndingSoon = a.auctionDate ? (new Date(a.auctionDate).getTime() - now) < (3 * 24 * 60 * 60 * 1000) && (new Date(a.auctionDate).getTime() - now) > 0 : false;
      return isNew || isEndingSoon;
    });

    const pool = urgent.length > 0 ? urgent : activeAuctions;

    return [...pool].sort((a, b) => {
      const aScore = (a[1] as any).opportunityScore || 0;
      const bScore = (b[1] as any).opportunityScore || 0;
      return bScore - aScore;
    })[0];
  }, [activeAuctions]);
  
  const topExamples = useMemo(() => 
    sortedProvinceAuctions.slice(0, 3).map(([id, data]) => ({ id, data })), 
    [sortedProvinceAuctions]
  );

  const stats = useMemo(() => {
    if (activeAuctions.length === 0) return null;
    
    let maxDiscount = 0;
    
    activeAuctions.forEach(([_, a]) => {
      if (a.appraisalValue && a.claimedDebt !== undefined && a.claimedDebt !== null && a.appraisalValue > a.claimedDebt) {
        const discount = Math.round((1 - a.claimedDebt / a.appraisalValue) * 100);
        if (a.claimedDebt !== 0 && discount <= 85 && discount > maxDiscount) {
          maxDiscount = discount;
        }
      }
    });
    
    return {
      totalActive: activeAuctions.length,
      maxDiscount
    };
  }, [activeAuctions]);

  const housingPercentage = useMemo(() => {
    const provinceAuctions = Object.values(AUCTIONS).filter(a => a.province === provinceName);
    if (provinceAuctions.length === 0) return 0;
    const housing = provinceAuctions.filter(a => a.propertyType === 'VIVIENDA').length;
    return Math.round((housing / provinceAuctions.length) * 100);
  }, [provinceName]);

  const getStatus = (date?: string) => {
    if (!date) return { label: 'Desconocido', sentence: 'Estado no disponible.' };
    const d = new Date(date);
    const today = new Date();
    if (isAuctionFinished(date)) return { label: 'Finalizada', sentence: 'Resumen de resultados de la subasta.' };
    if (d > today) return { label: 'Próximamente', sentence: 'Análisis previo a la apertura.' };
    return { label: 'Activa', sentence: 'Análisis de la oportunidad actual.' };
  };

  // Seeded PRNG for consistency
  const getSeededRandom = (seedStr: string) => {
    let h = 0;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
    }
    const s = Math.abs(h) / 2147483647;
    return () => s;
  };

  const pickRandom = <T,>(arr: T[], randomFn: () => number): T => {
    return arr[Math.floor(randomFn() * arr.length)];
  };

  const shuffleArray = <T,>(array: T[], randomFn: () => number): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(randomFn() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const content = useMemo(() => {
    const total = stats?.totalActive || 0;
    const maxDesc = stats?.maxDiscount || 0;
    const bestDeal = featuredAuction?.[1];
    const bestType = bestDeal ? normalizePropertyType(bestDeal.propertyType).toLowerCase() : 'inmueble';
    const bestCity = bestDeal ? (bestDeal.city || provinceName) : provinceName;
    const slugBase = provinceName.toLowerCase().replace(/\s+/g, '-');
    const dynamicImage = getImageForPropertyType('default', `${slugBase}-0-${provinceName}`);

    const random = getSeededRandom(provinceName);

    // Dynamic Theme Selection
    const themes = ['RISKS', 'FAMILIES', 'LOCAL_MARKET', 'NO_BID', 'MYTHS', 'OPPORTUNITY'];
    const selectedTheme = pickRandom(themes, random);

    const titleVariants = [
      `Ojo a estas subastas en ${provinceName}: hay descuentos poco habituales`,
      `Este inmueble en ${provinceName} podría venderse muy por debajo de su valor`,
      `Lo que está pasando con estas subastas en ${provinceName} no es normal`,
      `Detectada oportunidad en ${provinceName} con un ${maxDesc}% de descuento`,
      `Análisis del mercado de subastas en ${provinceName}: nuevas entradas`,
      `¿Oportunidad real? Desgranamos las subastas activas en ${provinceName}`,
      `Guía para comprar en subasta en ${provinceName}: lo que nadie te cuenta`,
      `Subastas judiciales en ${provinceName}: mitos y realidades del mercado`
    ];

    const imageTitleVariants = [
      `Subastas Interesantes en ${provinceName}`,
      `Oportunidades en ${provinceName}`,
      `Mercado subastas ${provinceName}`,
      `Viviendas en subasta en ${provinceName}`,
      `Gran Oportunidad en ${provinceName}`
    ];

    const leadVariants = {
      'RISKS': `¿Es realmente seguro comprar una vivienda en subasta judicial en ${provinceName}? Muchos creen que es un terreno minado, pero la realidad es que el sistema del BOE es hoy más transparente que nunca. Sin embargo, existen ${total} activos que esconden detalles que solo un ojo experto detecta. No se trata de suerte, sino de saber leer lo que el edicto no dice a simple vista.`,
      'FAMILIES': `¿Sabías que el ahorro medio en las subastas de ${provinceName} permite a muchas familias saltarse la hipoteca de por vida? Con los precios del mercado libre por las nubes, el BOE se ha convertido en el "outlet" inmobiliario secreto de la provincia. Actualmente hay ${total} oportunidades que podrían cambiar el futuro financiero de quienes se atrevan a mirar más allá de lo convencional.`,
      'LOCAL_MARKET': `La demanda de vivienda en ${provinceName} está rompiendo récords, pero hay un mercado paralelo que pocos están mirando. Mientras la mayoría compite por las mismas sobras en portales inmobiliarios, en los juzgados de ${provinceName} se están gestionando ${total} activos con precios de otra época. La pregunta no es si hay chollos, sino por qué nadie está pujando por ellos.`,
      'NO_BID': `¿Por qué un porcentaje tan alto de las subastas en ${provinceName} terminan sin una sola puja? No es por falta de calidad de los inmuebles, sino por un miedo irracional al proceso judicial. Esta parálisis del comprador medio es la mayor oportunidad para el inversor inteligente. Hoy analizamos por qué ${total} activos en la provincia están pasando desapercibidos bajo el radar comercial.`,
      'MYTHS': `Olvídate de lo que has oído sobre los "subasteros" de antaño en ${provinceName}. Ese mundo ya no existe. El portal del BOE ha democratizado el acceso a la propiedad, permitiendo que cualquier persona con un certificado digital compita por los ${total} activos disponibles. El mayor mito hoy no es la mafia, sino creer que necesitas millones para empezar a invertir aquí.`,
      'OPPORTUNITY': `Nuestro radar acaba de detectar una anomalía en el mercado de ${provinceName}: descuentos que superan el ${maxDesc}%. No es un error tipográfico, es la cruda realidad de las ejecuciones hipotecarias actuales. Con ${total} entradas nuevas en el sistema, estamos ante una ventana de oportunidad que rara vez se repite con esta intensidad en la provincia.`
    };

    const educationalBlocks = [
      {
        id: 'myth-reality',
        title: "💡 Mito vs Realidad: La verdad sobre el BOE",
        content: `Uno de los grandes mitos en ${provinceName} es que el banco siempre se queda con lo mejor. La realidad es mucho más interesante. Las entidades financieras a menudo prefieren recuperar la liquidez de forma inmediata que gestionar el activo. Esto deja un margen inmenso para que el postor particular se adjudique el inmueble por un precio muy competitivo. Otro error común es pensar que es imposible saber si hay okupas. Aunque no existe una visita oficial, una investigación de campo diligente en ${bestCity} suele revelar la situación real. Hablar con vecinos o porteros aporta información valiosa mucho antes de que se cierre la subasta. La información está ahí fuera. Solo hay que saber cómo recolectarla y validarla para reducir la incertidumbre al mínimo posible.`
      },
      {
        id: 'legal-safety',
        title: "⚖️ Seguridad Jurídica y Gestión de Plazos",
        content: `Muchos compradores potenciales en ${provinceName} temen la supuesta inseguridad del proceso judicial. Es importante recalcar que una adjudicación judicial es uno de los títulos de propiedad más firmes que existen. Viene avalado por un decreto de un Letrado de la Administración de Justicia. Este ordena la cancelación de todas las cargas posteriores. Lo que sí debe tenerse en cuenta son los plazos administrativos. Desde que ganas la subasta hasta que tienes las llaves, pueden transcurrir varios meses. El tiempo depende de la carga de trabajo del juzgado específico en ${provinceName}. La paciencia no es solo una virtud, sino el precio que pagas a cambio del descuento masivo que obtienes respecto al mercado libre.`
      },
      {
        id: 'financing',
        title: "💰 El reto de la liquidez y la financiación",
        content: `A diferencia de una compra convencional en ${provinceName}, en las subastas necesitas capital disponible de forma ágil. Para empezar, debes depositar el 5% del valor de tasación para participar. Si ganas, tendrás un plazo de 40 días hábiles para consignar el resto del precio. Conseguir una hipoteca para una subasta en ${bestCity} es perfectamente posible. Requiere una gestión previa muy fina con entidades que comprendan el proceso judicial. La tasación hipotecaria definitiva se realiza una vez que tienes el testimonio del decreto de adjudicación. Por esta razón, las subastas en ${provinceName} premian a quien cuenta con liquidez inmediata. Permiten capturar oportunidades que otros pierden por falta de agilidad financiera.`
      }
    ];

    const middleBlocks = [
      { 
        id: 'analysis',
        title: "🔍 Análisis técnico y saneamiento de cargas", 
        content: `Al observar los ${total} activos disponibles en ${provinceName}, vemos patrones que el ojo no entrenado pasa por alto. Los inmuebles de tipo ${bestType} suelen presentar expedientes más estandarizados. Sin embargo, requieren una verificación exhaustiva de las cuotas de comunidad e IBI pendiente. En España, estas deudas tienen una afección real sobre el inmueble. El nuevo propietario en ${provinceName} deberá hacerse cargo de los años corriente y los tres anteriores. En municipios como ${bestCity}, las tasaciones judiciales a menudo están desactualizadas. No reflejan la subida reciente de precios de la zona. Esto hace que el precio de salida sea todavía más atractivo de lo que indican las cifras oficiales del BOE.` 
      },
      { 
        id: 'strategy',
        title: "🛠️ Estrategia de puja y psicología del postor", 
        content: `No pujes nunca por impulso. En ${provinceName}, la estrategia ganadora es puramente matemática. Consiste en fijar un precio máximo basado en el valor real de mercado actual menos un 30% de margen de seguridad. Este margen debe cubrir gastos, impuestos e imprevistos. Si la subasta en ${bestCity} supera ese límite, lo más inteligente es retirarse. Hay ${total} oportunidades más en el horizonte. La disciplina férrea separa al inversor que construye patrimonio del que compra un problema. Recuerda que en ${provinceName} cada juzgado tiene sus ritmos. Entender la idiosincrasia de la oficina judicial local puede darte una ventaja competitiva determinante.` 
      },
      { 
        id: 'occupancy',
        title: "🏠 El factor determinante de la posesión", 
        content: `La gran pregunta sobre ${provinceName} es cómo saber si la casa está vacía. El edicto de subasta suele mencionar si el inmueble está ocupado o si se desconoce la situación. Si en ${bestCity} confirmas que el activo está vacío, el valor de tu inversión se dispara tras la adjudicación. Por el contrario, si hay inquilinos con un contrato legal anterior a la hipoteca, deberás respetar sus derechos. Esto no tiene por qué ser negativo. Puede ser la base de una inversión de rentabilidad por alquiler inmediata en ${provinceName}. Te ahorras la búsqueda de nuevos arrendatarios y posibles reformas profundas.` 
      },
      { 
        id: 'taxes',
        title: "💸 Impuestos y gastos post-subasta",
        content: `Mucha gente olvida que el precio de adjudicación en ${provinceName} no es el coste final. Debes sumar el Impuesto de Transmisiones Patrimoniales (ITP). Esta comunidad tiene sus propios tipos y bonificaciones según el perfil del comprador. También están los gastos de registro y posibles honorarios legales. Al analizar las ${total} subastas de ${provinceName}, recomendamos reservar entre un 10% y un 15% adicional. En ${bestCity}, una planificación fiscal adecuada puede ahorrarte miles de euros. Es especialmente útil si puedes acogerte a tipos reducidos por vivienda habitual.`
      }
    ];

    const contextBlock = {
      id: 'province-context',
      title: `📍 El panorama inmobiliario en ${provinceName}`,
      content: `Entender el mercado de subastas en ${provinceName} requiere mirar más allá de los números. La provincia vive un momento de transformación. Zonas consolidadas como ${bestCity} conviven con municipios en expansión. Estos últimos ofrecen rentabilidades por alquiler muy interesantes. Las subastas judiciales actúan como un termómetro de la salud financiera de la región. El hecho de que existan ${total} expedientes activos indica un flujo constante de activos. Para un comprador en ${provinceName}, esto significa no depender de la voluntad de un vendedor particular. Es un proceso reglado donde el mercado dicta el valor final de forma transparente.`
    };

    const methodologyBlock = {
      id: 'methodology',
      title: "📋 Nuestra metodología de análisis",
      content: `En Activos Off-Market no nos limitamos a listar subastas. Nuestra metodología en ${provinceName} se basa en tres pilares: validación de deuda, comprobación de cargas y estimación de valor real. De los ${total} activos que ves hoy, solo una pequeña fracción cumple nuestros estándares. Al analizar un ${bestType} en ${bestCity}, cruzamos datos de transacciones recientes y ofertas activas. Nos aseguramos de que el descuento es real y no una ilusión por una tasación inflada. La transparencia es nuestra divisa en ${provinceName}. El rigor técnico es nuestra herramienta de trabajo diaria para encontrar valor real.`
    };

    const selectedMiddle = shuffleArray(middleBlocks, random).slice(0, 3);
    const selectedEdu = shuffleArray(educationalBlocks, random).slice(0, 1);
    
    const intro = leadVariants[selectedTheme as keyof typeof leadVariants] || leadVariants['OPPORTUNITY'];
    const imageTitle = pickRandom(imageTitleVariants, random);
    const discountText = maxDesc > 0 ? `Hasta ${maxDesc}% dto.` : 'Oportunidades';
    const selectedSources = [
      { label: 'Portal de Subastas BOE', url: 'https://subastas.boe.es/' },
      { label: `Juzgados de ${provinceName}`, url: '#' }
    ];

    // Narrative order:
    // 1. Hook (Intro)
    // 2. Market Context (contextBlock)
    // 3. Educational Block (selectedEdu[0])
    // 4. Relevant Data (methodologyBlock)
    // 5. Auction Card (Handled in JSX)
    // 6. Key Info (selectedMiddle)
    // 7. Conclusion
    const allSections = [
      contextBlock, 
      selectedEdu[0], 
      methodologyBlock, 
      ...selectedMiddle
    ];
    
    const conclusionVariants = [
      `En definitiva, ${provinceName} ofrece un ecosistema de subastas judiciales vibrante y lleno de matices. La clave para el éxito no es la suerte, sino el acceso a información técnica de calidad y la capacidad de actuar con rapidez cuando el radar detecta una anomalía de precio real.`,
      `Como hemos visto, el mercado de ${provinceName} tiene sus propias reglas. Participar en las subastas del BOE es una de las formas más inteligentes de construir patrimonio hoy en día, siempre que se haga bajo un prisma de seguridad jurídica y análisis de riesgos riguroso.`,
      `La oportunidad en ${provinceName} es clara, pero la ventana de tiempo es limitada. Con ${total} activos en juego, el momento de empezar a monitorizar el mercado es ahora, antes de que la competencia profesional sature los expedientes más rentables de la provincia.`,
      `No dejes que el miedo al proceso judicial te impida acceder a los precios de ${provinceName}. Con la formación adecuada y un enfoque metódico, las subastas judiciales pueden ser tu mejor herramienta para conseguir la vivienda que buscas a un precio imbatible.`,
      `El análisis de hoy en ${provinceName} confirma que el sector de las subastas sigue siendo el último refugio de las rentabilidades de dos dígitos. Mantenerse informado y ser disciplinado con los números es la única estrategia que garantiza resultados a largo plazo.`,
      `Concluimos nuestro repaso por ${provinceName} con una nota de optimismo: el sistema es más accesible que nunca. Si buscas valor real y estás dispuesto a hacer el trabajo de campo necesario, los juzgados de la provincia tienen mucho que ofrecerte este trimestre.`,
      `La transparencia del portal del BOE en ${provinceName} ha abierto puertas que antes estaban cerradas. Aprovechar estas ${total} oportunidades requiere visión, pero sobre todo, una ejecución impecable basada en datos reales y no en suposiciones.`,
      `Si tu objetivo es la inversión inmobiliaria en ${provinceName}, las subastas judiciales deben estar en tu radar. El descuento medio detectado justifica con creces el esfuerzo de aprendizaje y la gestión de los tiempos judiciales que conlleva el proceso.`,
      `Finalizamos este análisis recordando que en ${provinceName} el conocimiento es poder. Cuanto más profundo sea tu análisis técnico de las cargas y la posesión, menor será tu riesgo y mayor tu beneficio potencial en el mercado de subastas.`,
      `El mercado de ${provinceName} no espera a nadie. Con una oferta de ${total} activos, la diversificación y el análisis comparativo de mercado son tus mejores aliados para identificar la verdadera oportunidad entre el ruido de los edictos judiciales.`
    ];

    const conclusion = pickRandom(conclusionVariants, random);

    const title = `Subastas en ${provinceName}: oportunidades activas | BOE`;
    const meta = `Subastas activas en ${provinceName}. Viviendas y activos judiciales con descuento.`;

    return {
      title,
      meta,
      intro,
      sections: allSections,
      conclusion,
      imageTitle,
      sources: selectedSources,
      cta: `Ver oportunidades en ${provinceName}`,
      image: dynamicImage,
      discountText
    };
  }, [provinceName, stats, featuredAuction]);

  const jsonLd = useMemo(() => {
    if (!provinceName || !content) return null;
    
    const now = new Date();
    let latestDate = topExamples[0]?.data.lastCheckedAt ? new Date(topExamples[0].data.lastCheckedAt) : now;
    if (latestDate > now) latestDate = now;
    
    let publishedDate = topExamples[0]?.data.publishedAt ? new Date(topExamples[0].data.publishedAt) : now;
    if (publishedDate > now) publishedDate = now;
    
    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": content.title,
      "description": content.meta,
      "image": [content.image],
      "datePublished": publishedDate.toISOString().split('T')[0],
      "dateModified": latestDate.toISOString().split('T')[0],
      "author": [{
        "@type": "Organization",
        "name": "Equipo Activos Off-Market",
        "url": "https://activosoffmarket.es"
      }],
      "publisher": {
        "@type": "Organization",
        "name": "Activos Off-Market",
        "logo": {
          "@type": "ImageObject",
          "url": "https://activosoffmarket.es/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      },
      "isHighQualityProvinceArticle": isHighQuality
    };
  }, [provinceName, content, topExamples, isHighQuality]);

  const formattedDate = useMemo(() => {
    const now = new Date();
    let date = topExamples[0]?.data.lastCheckedAt ? new Date(topExamples[0].data.lastCheckedAt) : now;
    if (date > now) date = now;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [topExamples]);
  
  const updateText = useMemo(() => {
    const now = new Date();
    let date = topExamples[0]?.data.lastCheckedAt ? new Date(topExamples[0].data.lastCheckedAt) : now;
    if (date > now) date = now;
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours === 0 
      ? 'Publicado hoy'
      : diffHours < 24 && diffHours > 0
        ? `Actualizado hace ${diffHours} horas`
        : `Última actualización: ${formattedDate}`;
  }, [topExamples, formattedDate]);

  useEffect(() => {
    if (provinceName) {
      document.title = `${content.title} | Activos Off-Market`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', content.meta);
      }
      
      // SEO Quality Control
      let robotsMeta = document.querySelector('meta[name="robots"]');
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      
      if (!isHighQuality) {
        robotsMeta.setAttribute('content', 'noindex, follow');
      } else {
        robotsMeta.setAttribute('content', 'index, follow');
      }
    }
    window.scrollTo(0, 0);
  }, [provinceName, content, isHighQuality]);

  const renderFormattedText = (text: string, type: 'intro' | 'body' | 'conclusion' = 'body') => {
    if (!text) return null;
    
    // Split by sentences
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    const paragraphs = [];
    let currentParagraph: string[] = [];
    
    sentences.forEach((sentence) => {
      currentParagraph.push(sentence);
      // Group 1-2 sentences per paragraph for maximum "breathability"
      // 1 sentence if it's long (> 120 chars), or 2 if they are short
      const currentLength = currentParagraph.join(' ').length;
      if (currentParagraph.length >= 2 || currentLength > 120) {
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    });
    
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '));
    }
    
    return paragraphs.map((p, idx) => {
      let className = "mb-6 leading-relaxed text-justify ";
      
      if (type === 'intro') {
        className += idx === 0 
          ? "lead text-xl text-slate-700 font-medium" 
          : "text-lg text-slate-600";
      } else if (type === 'conclusion') {
        className = "italic text-lg font-serif text-slate-700 border-l-4 border-brand-200 pl-6 py-2 mb-6";
      } else {
        className += "text-slate-600";
      }
      
      return <p key={idx} className={className}>{p}</p>;
    });
  };

  if (!province) return <Navigate to={ROUTES.HOME} replace />;

  return (
    <>
      {content && <link rel="preload" as="image" href={content.image} />}
      
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
      
      <div className="flex-grow max-w-3xl mx-auto px-6 py-12 w-full">
        <nav className="flex items-center text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME} className="hover:text-brand-600 transition-colors">Inicio</Link>
          <ChevronRight size={14} className="mx-2" />
          <Link to={ROUTES.NOTICIAS_SUBASTAS_INDEX} className="hover:text-brand-600 transition-colors">Noticias</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-brand-700 bg-brand-50 px-2 py-1 rounded-md capitalize">{provinceName}</span>
        </nav>

        <article className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
              <div className="flex items-center gap-1.5 text-brand-700 bg-brand-50 px-3 py-1 rounded-full font-bold">
                <Calendar size={14} />
                <time dateTime={topExamples[0]?.data.lastCheckedAt || new Date().toISOString()}>
                  {updateText}
                </time>
              </div>
              {stats && stats.totalActive > 0 && (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {stats.totalActive} activos detectados
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              {content.title}
            </h1>

            <ShareButtons 
              title={content.title} 
              className="mb-8 -mt-2" 
              province={provinceName}
              origin="discover"
            />

            {/* Imagen principal grande para Discover */}
            <figure className="mb-10 -mx-6 md:-mx-10 relative group">
              <img 
                src={content.image} 
                alt={`Subastas inmobiliarias en ${provinceName}`}
                className="w-full h-[300px] md:h-[450px] object-cover md:rounded-none"
                referrerPolicy="no-referrer"
                width="1200"
                height="675"
                fetchPriority="high"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40"></div>
              <figcaption className="absolute bottom-6 left-6 md:left-10 text-white">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1 opacity-80">Análisis de Mercado</p>
                <p className="text-lg md:text-xl font-serif italic">{content.imageTitle}</p>
              </figcaption>
            </figure>
            
            <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
              <img 
                src="https://activosoffmarket.es/logo.png" 
                alt="Activos Off-Market" 
                className="w-12 h-12 rounded-full bg-slate-900 object-cover border-2 border-white shadow-sm"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Activos+OffMarket&background=0f172a&color=fff';
                }}
              />
              <div>
                <p className="font-bold text-slate-900">Equipo Activos Off-Market</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Especialistas en subastas judiciales</p>
              </div>
            </div>
          </header>

          <div className="prose prose-lg prose-slate max-w-none">
            <div className="mb-4">
              {renderFormattedText(content.intro, 'intro')}
            </div>

            <div className="border-t border-slate-100 my-3" />

            {/* Tarjeta destacada arriba */}
            {featuredOpportunity && (
              <div className="mb-6 not-prose">
                <p className="text-xs mb-1 text-slate-500 font-medium">Oportunidad destacada en esta provincia</p>
                <div className="max-w-md">
                  <AuctionCard 
                    slug={featuredOpportunity[0]} 
                    data={featuredOpportunity[1]} 
                  />
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 my-3" />

            {/* Bloque resumen chips */}
            <div className="flex flex-nowrap overflow-x-auto pb-2 items-center gap-1 mb-6 not-prose scrollbar-hide">
              <div className="bg-slate-100 border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0">
                <span className="text-[11px]">📍</span>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{provinceName}</span>
              </div>
              <div className="bg-brand-50 border border-brand-100 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0">
                <span className="text-[11px]">🏠</span>
                <span className="text-[11px] font-bold text-brand-700 uppercase tracking-tight">
                  {featuredOpportunity ? normalizePropertyType(featuredOpportunity[1].propertyType) : 'Inmueble'}
                </span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0">
                <span className="text-[11px]">📊</span>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-tight">{stats?.totalActive || 0} subastas</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0">
                <span className="text-[11px]">💰</span>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-tight">{content.discountText}</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0">
                <span className="text-[11px]">⏱</span>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-tight">Actualizadas</span>
              </div>
            </div>

            {/* Gráfico de mercado compacto */}
            <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100 not-prose">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
                    <span>Descuento medio</span>
                    <span className="text-brand-600">{content.discountText}</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 w-[75%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
                    <span>Subastas activas</span>
                    <span className="text-emerald-600">{stats?.totalActive || 0}</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[60%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
                    <span>% Viviendas</span>
                    <span className="text-amber-600">{housingPercentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[85%] rounded-full" style={{ width: `${housingPercentage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 my-3" />
            
            <div className="space-y-6 text-slate-600 leading-relaxed text-justify">
              {content.sections.map((section: { id: string; title: string; content: string }, idx: number) => (
                <div key={section.id} className="animate-fade-in">
                  <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-2">
                    {section.title}
                  </h2>
                  {renderFormattedText(section.content, 'body')}
                </div>
              ))}

              <div className="bg-brand-50/50 rounded-2xl p-6 border border-brand-100 not-prose">
                <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Fuentes y referencias</h3>
                <div className="flex flex-wrap gap-4">
                  {content.sources.map((source: { label: string; url: string }, idx: number) => (
                    <a 
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-brand-700 hover:text-brand-800 underline underline-offset-4 decoration-brand-200"
                    >
                      {source.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="animate-fade-in">
                {renderFormattedText(content.conclusion, 'conclusion')}
              </div>
            </div>

            <div className="my-8 not-prose">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-50 rounded-full -mr-10 -mt-10 opacity-40"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Star size={10} className="text-brand-600 fill-brand-600" />
                      <span className="text-[9px] font-bold text-brand-600 uppercase tracking-widest">Alertas Premium</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      ¿Quieres recibir alertas en {provinceName}?
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Te avisamos por WhatsApp antes que a nadie.
                    </p>
                  </div>

                  <div className="flex flex-col items-center md:items-end gap-1">
                    <Link 
                      to={ROUTES.ALERTAS}
                      className="bg-slate-900 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-all text-xs whitespace-nowrap"
                    >
                      PROBAR 7 DÍAS GRATIS
                    </Link>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Después 5€/mes · Cancela en 1 clic</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Últimas subastas adjudicadas */}
            {recentlyAdjudicated.length > 0 && (
              <div className="my-10 not-prose bg-emerald-50/30 border border-emerald-100 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <Star size={20} className="fill-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-emerald-900">Últimas subastas adjudicadas</h3>
                    <p className="text-xs text-emerald-700 font-medium">Resultados reales detectados en {provinceName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentlyAdjudicated.map(([id, data]) => (
                    <Link 
                      key={id} 
                      to={ROUTES.NOTICIAS_SUBASTAS_RESULT.replace(':slug', id)}
                      className="bg-white border border-emerald-100 rounded-xl p-4 hover:shadow-md transition-all group"
                    >
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Adjudicada</p>
                      <h4 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
                        {normalizePropertyType(data.propertyType)} en {data.city || data.province}
                      </h4>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                        <span className="text-xs font-bold text-emerald-700">{data.finalPrice?.toLocaleString('es-ES')} €</span>
                        <ArrowRight size={12} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen técnico para E-E-A-T */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-10 border border-slate-200 not-prose grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Oportunidades</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalActive || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Ahorro Máximo</p>
                <p className="text-2xl font-bold text-brand-600">{content.discountText}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Activo Top</p>
                <p className="text-sm font-bold text-slate-900 capitalize leading-tight">
                  {featuredAuction ? normalizePropertyType(featuredAuction[1].propertyType) : 'Inmueble'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Ubicación</p>
                <p className="text-sm font-bold text-slate-900 truncate leading-tight">
                  {featuredAuction?.[1].city || provinceName}
                </p>
              </div>
            </div>

            <div className="my-8 flex flex-col sm:flex-row gap-4 w-full border-t border-slate-200 pt-8">
              <Link 
                to={featuredAuction ? `/subasta/${featuredAuction[0]}` : `/subastas/${provinceName.toLowerCase().replace(/\s+/g, '-')}`} className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-bold px-8 py-2 rounded-md hover:bg-brand-700 transition-colors shadow-sm text-center text-sm"
              >
                Ver análisis técnico <ArrowRight size={16} />
              </Link>
              <Link 
                to={`/subastas/${provinceName.toLowerCase().replace(/\s+/g, '-')}`} className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold px-8 py-2 rounded-md hover:bg-slate-200 transition-colors text-center text-sm"
              >
                Más subastas
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default DiscoverProvinceArticle;
