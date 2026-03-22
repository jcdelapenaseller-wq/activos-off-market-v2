import { AuctionData } from '../data/auctions';
import { calculateDiscount, isAuctionFinished } from './auctionHelpers';
import { normalizeCity, normalizePropertyType } from './auctionNormalizer';

export type EditorialPhase = 'NEW' | 'ENDING_SOON' | 'SUSPENDED' | 'CLOSED';

export interface EditorialArticle {
  phase: EditorialPhase;
  dateModified: Date;
  title: string;
  excerpt: string;
  content: string[];
  tag: string;
  tagColor: string;
}

// Seeded PRNG
function cyrb128(str: string) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

function sfc32(a: number, b: number, c: number, d: number) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

function getSeededRandom(seedStr: string) {
  const seed = cyrb128(seedStr);
  return sfc32(seed[0], seed[1], seed[2], seed[3]);
}

function pickRandom<T>(arr: T[], randomFn: () => number): T {
  return arr[Math.floor(randomFn() * arr.length)];
}

export function detectPhase(auction: AuctionData): EditorialPhase {
  if (auction.status === 'suspended') return 'SUSPENDED';
  if (auction.status === 'closed' || isAuctionFinished(auction.auctionDate)) return 'CLOSED';
  
  if (auction.auctionDate) {
    const endDate = new Date(auction.auctionDate.includes('T') ? auction.auctionDate : `${auction.auctionDate}T00:00:00Z`);
    const now = new Date();
    const hoursLeft = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursLeft > 0 && hoursLeft <= 48) return 'ENDING_SOON';
  }
  return 'NEW';
}

export function getEditorialDate(auction: AuctionData, phase: EditorialPhase): Date {
  const now = new Date();
  
  const published = auction.publishedAt ? new Date(auction.publishedAt) : now;
  const checked = auction.lastCheckedAt ? new Date(auction.lastCheckedAt) : now;
  const end = auction.auctionDate ? new Date(auction.auctionDate.includes('T') ? auction.auctionDate : `${auction.auctionDate}T00:00:00Z`) : now;
  
  let dateModified: Date;

  switch (phase) {
    case 'NEW': 
      dateModified = published;
      break;
    case 'ENDING_SOON': 
      dateModified = checked;
      break;
    case 'SUSPENDED': 
      dateModified = checked;
      break;
    case 'CLOSED': 
      dateModified = end < now ? end : checked;
      break;
    default:
      dateModified = now;
  }

  if (dateModified > now) {
    return now;
  }

  return dateModified;
}

export function shouldGenerateDiscoverArticle(auction: AuctionData): boolean {
  const city = normalizeCity(auction)?.toLowerCase() || '';
  const province = auction.province?.toLowerCase() || '';
  const isCapital = city === province && city !== '';
  const appraisal = auction.appraisalValue || auction.valorTasacion || auction.valorSubasta || 0;
  const isHighValue = appraisal > 220000;
  const isNew = detectPhase(auction) === 'NEW';
  const isDeserted = auction.auctionResultStatus === 'deserted';
  
  return isCapital || isHighValue || isNew || isDeserted;
}

const formatCurrency = (num: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);

export function generateEditorialArticle(slug: string, auction: AuctionData): EditorialArticle {
  const phase = detectPhase(auction);
  const dateModified = getEditorialDate(auction, phase);
  const random = getSeededRandom(`${slug}-${phase}`);

  const city = normalizeCity(auction) || 'España';
  const province = auction.province || city;
  const type = normalizePropertyType(auction.propertyType).toLowerCase();
  const appraisalValue = auction.appraisalValue || auction.valorTasacion || auction.valorSubasta || 0;
  const appraisal = formatCurrency(appraisalValue);
  const debtValue = auction.claimedDebt;
  const debt = debtValue !== undefined ? formatCurrency(debtValue) : 'desconocida';
  const discountValue = calculateDiscount(appraisalValue, auction.valorSubasta, debtValue) || 0;
  const discount = `${discountValue}%`;
  const procedureType = auction.procedureType || 'Ejecución';
  const occupancy = auction.occupancy || 'No consta';

  const vars = {
    city,
    province,
    type,
    appraisal,
    debt,
    discount,
    procedureType,
    occupancy
  };

  const replaceVars = (str: string) => {
    return str.replace(/{(\w+)}/g, (_, k) => (vars as any)[k] || '');
  };

  const introTemplates = [
    `## El contexto inmobiliario en {city}
El mercado de inversión en **{province}** continúa mostrando un dinamismo particular, especialmente en el segmento de las subastas públicas.
En el caso concreto de **{city}**, la demanda de **{type}s** mantiene una tendencia al alza.
Esto obliga a los inversores a buscar vías alternativas de adquisición para asegurar márgenes de rentabilidad viables.
La adjudicación directa a través del Boletín Oficial del Estado (BOE) se ha consolidado como una de las herramientas más eficaces.
Permite esquivar la inflación de precios del mercado tradicional y acceder a activos *off-market*.
Es en este escenario donde la reciente publicación de este expediente cobra especial relevancia para los analistas locales.`,

    `## Oportunidades de inversión en {city}
La provincia de **{province}** sigue atrayendo capital especializado.
Dentro de este mapa, **{city}** destaca como uno de los focos de atención para la adquisición de activos singulares.
Actualmente, el acceso a **{type}s** con descuentos reales sobre el valor de mercado es complejo a través de los canales convencionales.
Por ello, la vía ejecutiva y los procedimientos de apremio representan una bolsa de oportunidades ocultas.
La aparición de este nuevo activo altera el mapa de inversión local.
Ofrece una ventana de entrada con condiciones financieras que merecen un escrutinio detallado.`,

    `## Análisis del mercado en {city}
Operar en el sector inmobiliario de **{city}** exige hoy en día una estrategia basada en la anticipación.
El acceso a fuentes de activos *off-market* es fundamental para superar la media del mercado.
Dentro de **{province}**, la tipología de **{type}** presenta una liquidez muy interesante si se adquiere en el precio correcto.
Las subastas judiciales y administrativas proporcionan exactamente ese mecanismo de ajuste de precios.
Permiten a los postores profesionales adquirir inmuebles por debajo de su valor de reposición.
Este expediente recién abierto es un claro ejemplo de cómo el mercado de deuda genera oportunidades tangibles.`
  ];

  const analysisTemplates = [
    `### 📈 Por qué destaca esta subasta
Entrando en los datos duros del expediente, nos encontramos ante un **{type}** que sale a subasta con un valor de tasación oficial fijado en **{appraisal}**.
Este dato es el ancla financiera sobre la que pivota toda la operación.
Frente a esta valoración, la cantidad reclamada que origina el procedimiento asciende a **{debt}**.
Esta asimetría entre el valor del activo y el pasivo exigido genera un descuento teórico inicial del **{discount}**.
CARD_OPPORTUNITY: Para un inversor patrimonial, este diferencial del {discount} representa el margen bruto de seguridad antes de descontar impuestos, costes de saneamiento jurídico y adecuación física del inmueble.`,

    `### 📈 Desglose financiero del expediente
La viabilidad de esta operación se sustenta en la relación entre el valor del activo y la carga que lo lleva a subasta.
El juzgado ha establecido el valor de subasta de este **{type}** en **{appraisal}**.
Paralelamente, la deuda que motiva la ejecución se sitúa en **{debt}**.
Matemáticamente, esto nos sitúa ante un escenario con un **{discount}** de descuento aparente.
CARD_OPPORTUNITY: El análisis experto exige no quedarse en la superficie: este margen del {discount} es el punto de partida para calcular la puja máxima admisible, garantizando que la rentabilidad neta final supere los umbrales mínimos exigidos.`,

    `### 📈 Evaluación del margen de descuento
Desde una perspectiva estrictamente financiera, el atractivo de este **{type}** reside en su estructura de costes.
Con una tasación certificada de **{appraisal}** y una reclamación principal de **{debt}**, el expediente dibuja un descuento del **{discount}** sobre el papel.
Este gap financiero es el terreno de juego del adjudicatario.
CARD_OPPORTUNITY: La clave del éxito radicará en afinar la postura para no erosionar este margen del {discount}, teniendo en cuenta que el precio de adjudicación final deberá absorber el ITP correspondiente en {province} y los gastos derivados de la toma de posesión.`
  ];

  const riskTemplates = [
    `### ⚠️ Riesgos principales
Toda inversión en subastas conlleva un riesgo inherente al tipo de procedimiento.
Al tratarse de un expediente clasificado como '**{procedureType}**', es imperativo realizar un barrido registral exhaustivo.
El adjudicatario recibirá el inmueble libre de las cargas posteriores a la anotación de embargo que se ejecuta.
Sin embargo, deberá subrogarse y asumir cualquier carga anterior si existiera.
Además, el estado posesorio actual se define como '**{occupancy}**'.
CARD_RISK: Esta variable es crítica: si el inmueble no está libre de ocupantes, el inversor deberá contemplar los plazos y costes de un procedimiento de lanzamiento o desahucio, lo cual impacta directamente en la TIR del proyecto.`,

    `### ⚠️ Due Diligence y situación posesoria
El marco jurídico de esta subasta, definida como '**{procedureType}**', dicta las reglas de juego para la adjudicación.
El riesgo principal en este tipo de ejecuciones radica en las deudas ocultas no reflejadas en el edicto.
Recibos pendientes del IBI o deudas con la comunidad de propietarios recaerán sobre el nuevo titular.
Por otro lado, la situación posesoria ('**{occupancy}**') determina la liquidez inmediata del activo.
CARD_RISK: Un estado posesorio complejo puede retrasar la monetización de la inversión entre 6 y 12 meses. Es un factor de iliquidez que debe ser penalizado severamente en el modelo de valoración a la hora de calcular la puja máxima.`,

    `### ⚠️ Alertas legales y cargas registrales
La naturaleza de este procedimiento ('**{procedureType}**') exige una *Due Diligence* rigurosa antes de inmovilizar el depósito.
El riesgo de quiebra en la rentabilidad suele esconderse en la certificación de dominio y cargas.
Es vital comprobar la inexistencia de hipotecas previas o embargos preferentes.
Simultáneamente, el dato de ocupación ('**{occupancy}**') actúa como un termómetro del riesgo operativo.
CARD_RISK: La gestión de la posesión es a menudo el mayor desafío post-adjudicación. Ignorar este factor o subestimar los tiempos judiciales para obtener la posesión efectiva es el error más común entre los postores no profesionales.`
  ];

  const investmentTemplates = [
    `### 🎯 Perfil inversor
Para un perfil de inversor *Value* o *Flipping*, este **{type}** en **{city}** presenta un lienzo interesante.
Si la adquisición se logra consolidar manteniendo un descuento cercano al **{discount}**, el activo ofrece dos vías de monetización claras.
La primera es la reforma y venta rápida (Fix & Flip), aprovechando el margen de compra para absorber los costes de obra y comercialización.
La segunda es la aportación al mercado de alquiler.
CARD_PROFILE: El bajo coste de adquisición dispararía la rentabilidad bruta por dividendo muy por encima de la media de {province}. La elección dependerá del coste de capital del inversor y su horizonte temporal.`,

    `### 📊 Escenario posible
Modelizando la operación, la adquisición de este **{type}** tiene sentido estratégico si se logra proteger el margen inicial.
Asumiendo una compra exitosa basada en la deuda de **{debt}**, el inversor se posiciona con una ventaja competitiva insalvable para el comprador minorista tradicional.
El escenario óptimo pasa por una adjudicación rápida y una toma de posesión pacífica.
A partir de ahí, la inyección de capex para actualizar el inmueble permitiría reposicionarlo en el cuartil superior de precios de **{city}**.
CARD_PROFILE: Este movimiento estratégico tiene el potencial de maximizar el retorno sobre el capital invertido (ROIC) en un plazo estimado de 8 a 14 meses, dependiendo de la agilidad del juzgado.`,

    `### 🎯 Perfil inversor
Este expediente no es apto para capital conservador sin experiencia jurídica.
El perfil ideal para atacar este **{type}** es un inversor patrimonialista o un *family office*.
Se requiere capacidad para gestionar la incertidumbre temporal y resolver la situación posesoria ('**{occupancy}**').
La recompensa por asumir esta complejidad es el acceso a un activo con un descuento del **{discount}** sobre su valor de tasación de **{appraisal}**.
CARD_PROFILE: En el actual ciclo inmobiliario de {province}, donde la compresión de *yields* es evidente, este tipo de operaciones estructuradas son la única vía para alcanzar rentabilidades de doble dígito.`
  ];

  const conclusionTemplates = [
    `### 🚀 Conclusión
En definitiva, la subasta de este **{type}** en **{city}** es una oportunidad tangible que requiere profesionalidad.
El descuento teórico es el cebo, pero la rentabilidad real solo se materializará si se ejecuta una investigación registral impecable.
Es fundamental calcular la puja con frialdad matemática y no dejarse llevar por el calor de la subasta.`,

    `### 🚀 Veredicto final
Como conclusión, estamos ante un expediente con un potencial de revalorización evidente.
Sin embargo, el éxito de la inversión en este **{type}** dependerá exclusivamente de la capacidad del postor para despejar las incógnitas jurídicas.
Será vital no sobrepasar el límite de puja preestablecido en el modelo financiero.`,

    `### 🚀 Resumen operativo
En resumen, este **{type}** representa una de las opciones más destacadas actualmente en **{city}**.
La clave para el inversor será aislar el ruido y centrarse en la certificación de cargas.
Utilizar el margen del **{discount}** como escudo protector contra los imprevistos del procedimiento será la mejor garantía de éxito.`
  ];

  const phaseTemplates = {
    NEW: {
      tag: 'Nueva Oportunidad',
      tagColor: 'bg-emerald-600',
      titles: [
        "Sale a subasta un {type} en {city} que está llamando la atención del mercado",
        "Oportunidad detectada: {type} en {city} con un escenario financiero inusual",
        "El BOE publica la subasta de este {type} en {city}: analizamos los números"
      ],
      excerpts: [
        "El mercado inmobiliario de {city} suma un nuevo activo procedente de ejecución. Analizamos si los números reales justifican una puja.",
        "Acaba de abrirse el plazo para este inmueble en {city}. Revisamos la tasación y la deuda reclamada para encontrar el margen real.",
        "Una nueva oportunidad aparece en el radar de {city}. Desgranamos los detalles técnicos de este {type} recién publicado."
      ]
    },
    ENDING_SOON: {
      tag: 'Cierre Inminente',
      tagColor: 'bg-red-600',
      titles: [
        "Últimas horas para pujar por el {type} de {city}: ¿hay margen real?",
        "Cierre inminente: la subasta del {type} en {city} entra en su recta final",
        "Cuenta atrás en {city}: el {type} con {discount} de descuento teórico a punto de adjudicarse"
      ],
      excerpts: [
        "El plazo de la subasta para este {type} en {city} está a punto de concluir. Repasamos los números clave antes del cierre.",
        "Entramos en las últimas 48 horas de puja para este inmueble en {city}. ¿Es realmente una oportunidad o esconde riesgos?",
        "La ventana de oportunidad para este {type} en {city} se cierra pronto. Análisis de última hora sobre su viabilidad."
      ]
    },
    SUSPENDED: {
      tag: 'Suspendida',
      tagColor: 'bg-amber-500',
      titles: [
        "Giro inesperado: paralizada la subasta del {type} en {city}",
        "El juzgado suspende la ejecución del {type} en {city}",
        "Subasta cancelada en {city}: qué ha pasado con este {type}"
      ],
      excerpts: [
        "La subasta de este {type} en {city} ha sido suspendida oficialmente. Analizamos las causas más comunes de esta paralización.",
        "Freno judicial a la subasta del inmueble en {city}. El expediente queda en pausa hasta nuevo aviso.",
        "Cambio de estado: el {type} de {city} ya no admite pujas por suspensión del procedimiento."
      ]
    },
    CLOSED: {
      tag: 'Finalizada',
      tagColor: 'bg-slate-600',
      titles: [
        "Resolución: así cerró la subasta del {type} en {city}",
        "Finaliza la puja por el {type} en {city}: análisis post-subasta",
        "Caso de estudio: el desenlace de la subasta del {type} en {city}"
      ],
      excerpts: [
        "El plazo de pujas ha concluido para este inmueble en {city}. Repasamos los datos de este expediente finalizado como caso de estudio.",
        "Subasta cerrada en {city}. Analizamos a posteriori los números de este {type} para entender la dinámica del mercado local.",
        "Fin del procedimiento para el {type} en {city}. Lecciones y métricas que deja esta ejecución hipotecaria."
      ]
    }
  };

  const tpl = phaseTemplates[phase];
  const title = replaceVars(pickRandom(tpl.titles, random));
  const excerpt = replaceVars(pickRandom(tpl.excerpts, random));
  
  // Build the content array by picking one template from each section and splitting by \n
  const rawContent = [
    pickRandom(introTemplates, random),
    pickRandom(analysisTemplates, random),
    pickRandom(riskTemplates, random),
    pickRandom(investmentTemplates, random),
    pickRandom(conclusionTemplates, random)
  ];

  // Flatten the paragraphs and replace variables
  const content = rawContent.flatMap(section => 
    section.split('\n').map(p => replaceVars(p)).filter(p => p.trim() !== '')
  );

  return {
    phase,
    dateModified,
    title,
    excerpt,
    content,
    tag: tpl.tag,
    tagColor: tpl.tagColor
  };
}


