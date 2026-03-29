import { AuctionData, AUCTIONS } from '../data/auctions';
import { calculateDiscount, isAuctionFinished } from './auctionHelpers';
import { extractFinalPrice } from './auctionHelpers';
import { normalizeCity, normalizePropertyType } from './auctionNormalizer';
import { truncate } from './textUtils';

export type EditorialPhase = 'NEW' | 'ENDING_SOON' | 'SUSPENDED' | 'CLOSED' | 'ADJUDICATED';

export interface EditorialArticle {
  phase: EditorialPhase;
  dateModified: Date;
  title: string;
  excerpt: string;
  content: string[];
  tag: string;
  tagColor: string;
  data?: any;
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

function shuffleArray<T>(array: T[], randomFn: () => number): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function detectPhase(auction: AuctionData): EditorialPhase {
  if (auction.status === 'suspended') return 'SUSPENDED';
  if (auction.auctionResultStatus === 'adjudicated' && auction.finalPrice) return 'ADJUDICATED';
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
  const resultChecked = auction.resultCheckedAt ? new Date(auction.resultCheckedAt) : now;
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
    case 'ADJUDICATED':
      dateModified = resultChecked;
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
  const debt = debtValue !== undefined ? formatCurrency(debtValue) : null;
  const discountValue = debt !== null ? calculateDiscount(appraisalValue, auction.valorSubasta, debtValue) : null;
  const discount = discountValue !== null ? `${discountValue}%` : null;
  const procedureTypeRaw = auction.procedureType || 'Ejecución';
  // Clean procedure type if it contains court names or is too long
  const procedureType = procedureTypeRaw.length > 30 || procedureTypeRaw.includes('(') || procedureTypeRaw.includes('Juzgado') 
    ? 'procedimiento judicial' 
    : procedureTypeRaw;

  const occupancy = auction.occupancy || 'No consta';
  const opportunityScore = auction.opportunityScore || 0;

  const finalPriceValue = auction.finalPrice || (phase === 'ADJUDICATED' ? extractFinalPrice(auction.pujasText) : null);
  const finalPrice = finalPriceValue ? formatCurrency(finalPriceValue) : 'Dato no disponible';
  const savingsTasacion = finalPriceValue ? formatCurrency(Math.max(0, appraisalValue - finalPriceValue)) : '0 €';
  const savingsDebt = (finalPriceValue && debtValue) ? formatCurrency(Math.max(0, debtValue - finalPriceValue)) : '0 €';

  const vars = {
    city,
    province,
    type,
    appraisal,
    debt: debt || "Dato no publicado",
    discount: discount || "margen potencial",
    procedureType,
    occupancy: occupancy === 'No consta' ? 'Pendiente de análisis' : occupancy,
    // SEO Variations
    asset: pickRandom(['activo', 'inmueble', 'bien', 'propiedad', 'unidad'], random),
    opportunity: pickRandom(['oportunidad', 'ventana de inversión', 'opción estratégica', 'posibilidad de compra'], random),
    location: pickRandom([city, 'esta zona', 'este municipio', 'esta ubicación'], random),
    finalPrice: finalPrice,
    savingsTasacion: savingsTasacion,
    savingsDebt: savingsDebt
  };

  const replaceVars = (str: string) => {
    return str.replace(/{(\w+)}/g, (_, k) => (vars as any)[k] || '');
  };

  // --- PLANTILLAS (10 por bloque) ---
  const analysisTemplates = [
    `### 📈 Análisis del activo en {location}
Entrando en los detalles técnicos, nos encontramos ante un {type} que sale a subasta con un valor de tasación oficial fijado en {appraisal}.
Este dato es la referencia financiera sobre la que se apoya la operación.

Frente a esta valoración, la cantidad reclamada que origina el expediente asciende a {debt}.
Esta relación entre el valor del {asset} y el pasivo solicitado genera un margen teórico inicial del {discount}.

Para un inversor patrimonial, este diferencial representa el margen de seguridad antes de considerar impuestos, costes de adecuación jurídica y física del inmueble.
Es una {opportunity} que requiere agilidad pero también un análisis pausado para ajustar la postura.`,
    `### 📈 Desglose financiero del expediente
La viabilidad de esta operación se basa en la relación entre el valor del {asset} y la carga que lo lleva a subasta.
El juzgado ha establecido el valor de subasta de este {type} en {appraisal}.

Paralelamente, la deuda que motiva la ejecución se sitúa en {debt}.
Matemáticamente, esto nos sitúa ante un escenario con un {discount} de margen aparente.

El análisis profesional sugiere no quedarse en la superficie: este margen es el punto de partida para calcular la puja máxima adecuada.
Asegurar que la rentabilidad final sea positiva es la prioridad en el estudio del caso.`,
    `### 📈 Evaluación del margen de beneficio
Desde una perspectiva financiera, el interés de este {type} reside en su estructura de costes en {location}.
Con una tasación certificada de {appraisal} y una reclamación de {debt}, el expediente judicial dibuja un margen del {discount} sobre el papel.

Este espacio financiero es el terreno de juego del adjudicatario.
La clave del éxito radicará en afinar la propuesta para mantener este equilibrio.

Teniendo en cuenta que el precio final deberá absorber los gastos de transmisión en {province} y los derivados de la toma de posesión, cada detalle cuenta.`,
    `### 📈 Análisis de oportunidad
El valor de tasación de {appraisal} para este {type} en {city} marca la referencia principal.
Analizando la deuda de {debt}, observamos un potencial de ahorro que resulta interesante para el mercado actual.

Este {asset} es un ejemplo de las opciones que el mercado de subastas ofrece a inversores informados.
No se trata solo de adquirir a buen precio, sino de hacerlo con un margen de seguridad adecuado.`,
    `### 📈 Rentabilidad potencial
La relación entre el valor de tasación de {appraisal} y la deuda de {debt} sugiere un escenario de inversión a considerar.
El margen del {discount} es un punto de partida para cualquier estudio de viabilidad.

En {location}, un {asset} de este tipo suele tener una rotación fluida si el precio de entrada es el equilibrado.
Analizamos si este expediente cumple con los requisitos de rentabilidad buscados por los expertos.`,
    `### 📈 Valoración del activo
Este {type} en {city} presenta una tasación de {appraisal}.
Con una deuda de {debt}, el análisis financiero apunta a una situación de mercado que merece ser estudiada con detalle.

El margen del {discount} es clave para entender la rentabilidad esperada.
Sin embargo, la tasación es solo una parte de la historia; el estado real del {asset} es el factor a confirmar.`,
    `### 📈 Análisis de mercado
La subasta de este {type} en {city} con una tasación de {appraisal} es un caso de estudio para cualquier inversor.
La deuda de {debt} define el margen de maniobra de forma clara.

Analizamos el margen del {discount} para determinar su viabilidad técnica.
En el contexto actual de {province}, estos márgenes son cada vez más valorados.`,
    `### 📈 Potencial de inversión
Con una tasación de {appraisal} y una deuda de {debt}, este {type} en {city} destaca por su potencial.
El margen del {discount} es un factor a tener en cuenta para el inversor que busca activos con recorrido.

La ubicación en {location} añade un punto de seguridad a la inversión.
Analizamos si los costes asociados podrían influir en este margen inicial.`,
    `### 📈 Evaluación técnica
El valor de tasación de {appraisal} y la deuda de {debt} definen el perfil de esta subasta de {type} en {city}.
El margen del {discount} es el eje central de nuestra evaluación técnica.

No basta con ver el margen; hay que entender el origen del expediente judicial.
Este análisis desglosa los puntos fuertes y los aspectos a revisar en la operación.`,
    `### 📈 Análisis financiero equilibrado
Este {type} en {city} sale a subasta con una tasación de {appraisal}.
La deuda de {debt} permite un margen del {discount}, lo que lo hace interesante para el análisis financiero.

El mercado de {province} está muy activo, por lo que estas ventanas de entrada son importantes.
Estudiamos si la puja permite mantener un retorno de inversión equilibrado.`
  ];

  const adjudicatedAnalysisTemplates = [
    `### 🏁 Resultado de la adjudicación en {city}
El procedimiento ha concluido con una adjudicación final por un importe de {finalPrice}. 

Comparando este resultado con la tasación oficial de {appraisal}, el ahorro conseguido respecto a la valoración judicial asciende a {savingsTasacion}. 

En relación a la deuda reclamada ({debt}), el adjudicatario ha logrado cerrar la operación con un diferencial de {savingsDebt}. Este dato confirma la eficiencia del mercado de subastas en {province} para capturar activos con descuento real.`,
    `### 🏁 Cierre del expediente: Datos finales
Tras el cierre del portal de subastas del BOE, este {type} en {location} se ha adjudicado por {finalPrice}.

El análisis post-subasta revela un ahorro de {savingsTasacion} sobre el valor de tasación. 

Para el mercado de {city}, este precio final representa una validación de los márgenes que veníamos analizando. La operación se consolida como un caso de éxito en la gestión de activos judiciales en {province}.`,
    `### 🏁 Métricas de la subasta finalizada
El {asset} en {city} ya tiene un precio de cierre definitivo: {finalPrice}. 

Este importe supone un ahorro de {savingsTasacion} respecto a los {appraisal} de tasación inicial. 

Si analizamos la deuda de {debt}, el resultado final de {finalPrice} muestra un margen de {savingsDebt} a favor del adjudicatario. Un resultado que sitúa a esta subasta como una referencia para futuros expedientes en {province}.`
  ];


  const riskTemplates = [
    `### ⚠️ Puntos de atención principales
Toda inversión en subastas conlleva factores a considerar inherentes al procedimiento.
Al tratarse de un expediente de {procedureType}, es recomendable realizar un seguimiento registral.
El adjudicatario recibirá el inmueble libre de las cargas posteriores a la anotación que se ejecuta.
Sin embargo, conviene analizar cualquier carga anterior si existiera.
Además, el estado posesorio actual se define como {occupancy}.
Esta variable es un aspecto a revisar: si el inmueble no está libre de ocupantes, el inversor deberá contemplar los plazos de un procedimiento de toma de posesión, lo cual influye en la planificación del proyecto.`,
    `### ⚠️ Due Diligence y situación posesoria
El marco jurídico de esta subasta, definida como {procedureType}, marca las pautas para la adjudicación.
Un factor a considerar en este tipo de ejecuciones son los gastos pendientes no reflejados en el edicto.
Recibos del IBI o cuotas de comunidad podrían ser responsabilidad del nuevo titular.
Por otro lado, la situación posesoria ({occupancy}) determina la disponibilidad inmediata del activo.
Una situación posesoria a analizar puede influir en los plazos de la inversión. Es un factor que debe ser integrado en el modelo de valoración al calcular la puja adecuada.`,
    `### ⚠️ Aspectos legales y cargas registrales
La naturaleza de este procedimiento ({procedureType}) sugiere una revisión detallada antes de realizar el depósito.
Un aspecto a revisar en la rentabilidad suele estar en la certificación de cargas.
Es recomendable comprobar la situación de hipotecas previas o embargos.
Simultáneamente, el dato de ocupación ({occupancy}) actúa como un indicador del tiempo de gestión necesario.
La obtención de la posesión es a menudo el paso más importante tras la subasta. Considerar este factor y los tiempos habituales para obtener la posesión efectiva es fundamental para los postores.`,
    `### ⚠️ Consideraciones jurídicas
El procedimiento de {procedureType} requiere un análisis de las cargas registrales.
Es recomendable asegurar que no existan embargos preferentes que puedan influir en la inversión.
La situación de ocupación {occupancy} es un factor a considerar.`,
    `### ⚠️ Aspectos operativos
La inversión en este {type} bajo el procedimiento {procedureType} conlleva aspectos operativos a analizar.
La situación de ocupación {occupancy} puede influir en los tiempos de gestión.
Un análisis de las cargas es un paso recomendado.`,
    `### ⚠️ Análisis de factores a considerar
El procedimiento {procedureType} implica aspectos específicos que deben ser evaluados.
La situación de ocupación {occupancy} es un punto a revisar.
La revisión de cargas es una práctica recomendada para evitar sorpresas.`,
    `### ⚠️ Gestión de la inversión
Invertir en este {type} requiere analizar los factores del procedimiento {procedureType}.
La situación de ocupación {occupancy} influye en la estrategia de salida.
La revisión técnica es la mejor herramienta de análisis.`,
    `### ⚠️ Factores en subastas
El procedimiento {procedureType} tiene sus características propias.
La ocupación {occupancy} debe ser integrada en el análisis de la operación.
La revisión de cargas registrales es un paso que aporta seguridad.`,
    `### ⚠️ Puntos a analizar
La inversión en este {type} bajo el procedimiento {procedureType} requiere atención a los detalles.
La situación de ocupación {occupancy} es un factor a considerar.
El análisis previo es esencial para la buena marcha de la inversión.`,
    `### ⚠️ Factores del procedimiento
El procedimiento {procedureType} conlleva aspectos que deben ser gestionados.
La ocupación {occupancy} debe ser evaluada con atención.
La revisión de cargas es fundamental para la tranquilidad jurídica.`
  ];

  const investmentTemplates = [
    `### 🎯 Perfil inversor
Para un perfil de inversor *Value* o *Flipping*, este {type} en {city} presenta un lienzo interesante.
Si la adquisición se logra consolidar manteniendo un descuento cercano al {discount}, el activo ofrece dos vías de monetización claras.

La primera es la reforma y venta rápida (Fix & Flip), aprovechando el margen de compra para absorber los costes de obra y comercialización.
La segunda es la aportación al mercado de alquiler.

El bajo coste de adquisición dispararía la rentabilidad bruta por dividendo muy por encima de la media de {province}.
La elección dependerá del coste de capital del inversor y su horizonte temporal.`,
    `### 📊 Escenario posible
Modelizando la operación, la adquisición de este {type} tiene sentido estratégico si se logra proteger el margen inicial.
Asumiendo una compra exitosa basada en la deuda de {debt}, el inversor se posiciona con una ventaja competitiva insalvable.

El escenario óptimo pasa por una adjudicación rápida y una toma de posesión pacífica.
A partir de ahí, la inyección de capex para actualizar el inmueble permitiría reposicionarlo en el cuartil superior de precios de {city}.

Este movimiento estratégico tiene el potencial de maximizar el retorno sobre el capital invertido (ROIC) en un plazo estimado de 8 a 14 meses.`,
    `### 🎯 Perfil inversor ideal
Este expediente no es apto para capital conservador sin experiencia jurídica previa.
El perfil ideal para atacar este {type} es un inversor patrimonialista o un family office.

Se requiere capacidad para gestionar los tiempos judiciales y resolver la situación posesoria ({occupancy}).
La recompensa por asumir esta complejidad es el acceso a un activo con un descuento del {discount}.

En el actual ciclo inmobiliario de {province}, estas operaciones estructuradas son la única vía para alcanzar rentabilidades de doble dígito.`,
    `### 🎯 Estrategia de inversión
Este {type} en {city} es apto para inversores que buscan valor real.
La estrategia debe centrarse en maximizar el descuento del {discount} sin comprometer la seguridad.

La monetización puede ser vía alquiler o venta tras una reforma estratégica.
Analizamos cuál es el camino más corto hacia el beneficio en este expediente.`,
    `### 📊 Análisis de inversión detallado
La inversión en este {type} requiere un enfoque estratégico y disciplinado.
El margen del {discount} permite planificar una estrategia de valor añadido con garantías.

La rentabilidad dependerá de la ejecución de la reforma y la gestión de la ocupación.
Es una operación para quien sabe que el dinero se gana en la compra.`,
    `### 🎯 Perfil del inversor experto
Este activo es ideal para inversores con experiencia contrastada en subastas.
La clave es aprovechar el descuento del {discount} para asegurar la rentabilidad neta.

La estrategia de salida debe estar bien definida desde el minuto uno.
No hay espacio para la improvisación en un procedimiento judicial.`,
    `### 📊 Potencial de inversión real
La adquisición de este {type} en {city} ofrece un potencial de rentabilidad muy interesante.
El descuento del {discount} es el factor clave para el éxito de la operación.

Se requiere una planificación detallada de la estrategia de monetización posterior.
{city} sigue siendo un mercado con demanda, lo que facilita la salida.`,
    `### 🎯 Estrategia recomendada
Para este {type}, recomendamos una estrategia de valor añadido (Value-Add).
Aprovechar el descuento del {discount} es fundamental para absorber imprevistos.

La gestión de la ocupación es un factor crítico para la rentabilidad final.
Analizamos cómo optimizar los tiempos de posesión.`,
    `### 📊 Análisis de viabilidad técnica
La inversión en este {type} en {city} es viable si se gestionan correctamente los factores legales.
El descuento del {discount} proporciona un margen de seguridad cómodo.

La estrategia de salida debe ser clara, realista y basada en datos de mercado.
No se debe sobreestimar el precio de venta final.`,
    `### 🎯 Enfoque inversor patrimonial
Este {type} en {city} es una oportunidad para inversores que buscan rentabilidad a largo plazo.
El descuento del {discount} permite una estrategia de valor añadido muy potente.

La gestión de la ocupación es clave para el éxito de la inversión patrimonial.
Buscamos activos que generen flujo de caja desde el primer día de posesión.`
  ];

  const templatesByPhase = {
    NEW: {
      analysis: analysisTemplates,
      risk: riskTemplates,
      investment: investmentTemplates,
      conclusion: [
        "### 🚀 Conclusión\nEsta nueva {opportunity} en {city} es un excelente punto de partida para tu análisis. Al estar recién publicada, permite un margen de maniobra mayor para verificar cargas y posesión.",
        "### 🚀 Conclusión\nAcaba de publicarse este expediente y el interés inicial es alto. Recomendamos revisar el edicto cuanto antes para posicionarse con ventaja en {location}.",
        "### 🚀 Conclusión\nUna ventana de entrada que acaba de abrirse. Si los números de {appraisal} encajan en tu estrategia, este {asset} en {province} merece prioridad en tu agenda."
      ]
    },
    ENDING_SOON: {
      analysis: analysisTemplates,
      risk: riskTemplates,
      investment: investmentTemplates,
      conclusion: [
        "### 🚀 Conclusión\nEl tiempo apremia. Si los números encajan con tu estrategia, es el momento de actuar con decisión antes de que el portal del BOE cierre la recepción de pujas.",
        "### 🚀 Conclusión\nRecta final para este {type}. La ventana de oportunidad se cierra en {location}, por lo que la agilidad en la toma de decisiones será el factor determinante.",
        "### 🚀 Conclusión\nÚltimas horas para participar. Asegúrate de tener el depósito listo si este {asset} en {city} forma parte de tus objetivos de inversión."
      ]
    },
    CLOSED: {
      analysis: analysisTemplates,
      risk: riskTemplates,
      investment: investmentTemplates,
      conclusion: [
        "### 🚀 Conclusión\nLa subasta ha finalizado. Este caso de estudio nos muestra la dinámica real del mercado en {city} y cómo se comportan los precios en adjudicaciones judiciales.",
        "### 🚀 Conclusión\nExpediente cerrado. Analizar el resultado de este {type} ayuda a calibrar futuras pujas en {province} y entender el apetito del mercado actual.",
        "### 🚀 Conclusión\nCiclo completado. Los datos de este {asset} ya forman parte del histórico de {location}, sirviendo de referencia para valorar activos similares."
      ]
    },
    SUSPENDED: {
      analysis: analysisTemplates,
      risk: riskTemplates,
      investment: investmentTemplates,
      conclusion: [
        "### 🚀 Conclusión\nEl procedimiento ha sido suspendido. Analizaremos las causas para entender si es una pausa técnica o una retirada definitiva del {asset} del mercado.",
        "### 🚀 Conclusión\nSituación de espera en {location}. La suspensión de este {type} es un recordatorio de la importancia de monitorizar los expedientes hasta el último minuto.",
        "### 🚀 Conclusión\nProceso pausado. Estaremos atentos a la posible reanudación de esta subasta en {province} para informar sobre nuevas fechas de puja."
      ]
    },
    ADJUDICATED: {
      analysis: adjudicatedAnalysisTemplates,
      risk: riskTemplates,
      investment: investmentTemplates,
      conclusion: [
        "### 🚀 Conclusión\nOperación cerrada con éxito. El precio de {finalPrice} marca el nuevo valor de referencia para activos similares en {city}.",
        "### 🚀 Conclusión\nAdjudicación consolidada en {province}. El ahorro de {savingsTasacion} respecto a la tasación confirma el atractivo de este {type} en el mercado judicial.",
        "### 🚀 Conclusión\nFinal del proceso. Los datos de este expediente en {location} ya forman parte del histórico de adjudicaciones reales de {city}."
      ]
    }
  };

  const phaseTemplates = {
    NEW: {
      tag: 'Nueva Oportunidad',
      tagColor: 'bg-emerald-600',
      titles: [
        "Análisis subasta en {city}: ¿oportunidad o trampa legal?",
        "Oportunidad detectada en {city}: el {type} que el mercado está ignorando",
        "Vivienda en subasta {city}: desgranamos los números del BOE",
        "Activo judicial {city}: margen de seguridad y puntos de atención",
        "Caso real {city}: cómo un {type} puede cambiar tu cartera de inversión"
      ],
      excerpts: [
        "Acaba de publicarse esta subasta en {city} y el {discount} de descuento puede ser solo el principio. Analizamos este {type} en el radar judicial.",
        "Nueva subasta detectada en {location}. Este {type} en {city} acaba de aparecer y esconde una oportunidad que requiere lupa técnica.",
        "Recientemente publicada en {province}: analizamos este expediente de {type} que acaba de incorporarse oficialmente.",
        "Nuevo expediente en esta zona ({city}). Los números de esta subasta sugieren una ventana de entrada interesante hoy.",
        "Subasta recién incorporada: desgranamos los números de este {type} en {city} para ver si el descuento es real."
      ],
      intros: [
        "La publicación de una nueva subasta judicial en {city} siempre genera expectación entre los inversores locales. Este {type}, con una tasación de {appraisal}, se posiciona como un activo a seguir.",
        "Acaba de publicarse en el portal del BOE un nuevo expediente que afecta a un {type} en {location}. El margen teórico inicial es un factor a considerar.",
        "El circuito de subastas de {province} suma hoy un nuevo activo de interés. Se trata de un {type} en {city} que sale con una tasación oficial de {appraisal}."
      ]
    },
    ENDING_SOON: {
      tag: 'Cierre Inminente',
      tagColor: 'bg-red-600',
      titles: [
        "Última llamada en {city}: el {type} que cierra en 48 horas",
        "Recta final subasta {city}: ¿vale la pena la puja de última hora?",
        "Oportunidad al límite en {city}: análisis de cierre inminente",
        "Activo judicial {city}: cuenta atrás para una adjudicación estratégica",
        "Caso urgente {city}: por qué este {type} está en el radar de los expertos"
      ],
      excerpts: [
        "La subasta entra en su fase final en {city}. Quedan pocas horas para este {type} y la tensión en el portal de subastas aumenta.",
        "Última llamada para este {type} en {location}. La subasta entra en su fase final y el margen de {discount} justifica un análisis rápido.",
        "La ventana de oportunidad se cierra en {province}. Este expediente entra en su fase final y repasamos los datos críticos antes de que sea tarde.",
        "48 horas para el cierre. En {city}, este {type} entra en su fase final de subasta con un margen teórico muy atractivo.",
        "La subasta entra en su fase final para este {type} en {city}. Desgranamos la viabilidad a escasos momentos del cierre oficial."
      ],
      intros: [
        "Entramos en la recta final de la subasta de este {type} en {city}. Con el reloj en contra, el análisis de la deuda de {debt} se vuelve crítico para los postores.",
        "La subasta entra en su fase final y el interés por este {asset} en {location} se ha disparado en las últimas horas. Es el momento de las decisiones estratégicas.",
        "A pocas horas del cierre oficial en el BOE, este {type} en {province} se sitúa como una de las piezas más seguidas del periodo actual."
      ]
    },
    SUSPENDED: {
      tag: 'Suspendida',
      tagColor: 'bg-amber-500',
      titles: [
        "Giro inesperado en {city}: subasta suspendida del {type}",
        "Expediente paralizado {city}: qué significa para el inversor",
        "Análisis de suspensión {city}: el {type} que vuelve a la casilla de salida",
        "Activo judicial {city}: causas de la paralización de este {type}",
        "Caso suspendido {city}: lecciones de un procedimiento interrumpido"
      ],
      excerpts: [
        "El expediente ha sufrido una suspensión en {city}. Analizamos las causas detrás de la paralización de este {type} y qué esperar ahora.",
        "Giro en {location}: el expediente ha sufrido una suspensión técnica. Este {type} en {city} sale del circuito de pujas temporalmente.",
        "La situación jurídica manda: el expediente ha sufrido una suspensión en {province}. Te contamos los motivos de esta pausa.",
        "No siempre se llega a la adjudicación. El expediente ha sufrido una suspensión en {city} y este {type} queda en espera.",
        "El expediente ha sufrido una suspensión. Analizamos qué ha pasado con este {type} en {city} y cómo afecta a los postores interesados."
      ],
      intros: [
        "El expediente ha sufrido una suspensión inesperada por parte del juzgado encargado del procedimiento. Esta pausa en la subasta del {type} en {city} requiere un análisis de las causas.",
        "Noticia de última hora en {location}: el expediente ha sufrido una suspensión. Este {asset} judicial queda paralizado hasta nueva orden del tribunal.",
        "La subasta de este {type} en {province} ha sido interrumpida. El expediente ha sufrido una suspensión que altera los planes de los inversores que seguían el caso."
      ]
    },
    CLOSED: {
      tag: 'Finalizada',
      tagColor: 'bg-slate-600',
      titles: [
        "Desenlace en {city}: así cerró la subasta del {type}",
        "Análisis post-subasta {city}: ¿quién ganó con este {type}?",
        "Caso cerrado {city}: métricas finales de una adjudicación real",
        "Activo judicial {city}: el precio final vs la tasación oficial",
        "Lecciones de {city}: lo que aprendimos de esta subasta finalizada"
      ],
      excerpts: [
        "Esta subasta ya ha finalizado en {city}. Analizamos el cierre de este {type} como caso de estudio para futuros inversores.",
        "Ciclo completado: esta subasta ya ha finalizado en {location}. Repasamos los números finales de este {type} tras el cierre del BOE.",
        "El mercado ha hablado en {province}. Esta subasta ya ha finalizado y este {type} ya tiene adjudicatario con datos valiosos.",
        "Análisis forense: esta subasta ya ha finalizado en {city}. Desgranamos el final de este expediente para entender el mercado real.",
        "Cerrar el expediente: esta subasta ya ha finalizado para este {type} en {city}. Analizamos qué rentabilidad teórica se ha consolidado."
      ],
      intros: [
        "Esta subasta ya ha finalizado y los datos que deja el expediente son una mina de oro para el análisis inmobiliario en {city}. El {type} ha completado su ciclo judicial.",
        "Tras el cierre oficial en el portal del BOE, esta subasta ya ha finalizado. Es el momento de analizar si el {asset} en {location} cumplió con las expectativas de margen.",
        "Esta subasta ya ha finalizado en {province}. El resultado de este {type} nos permite calibrar la temperatura real del mercado de adjudicaciones hoy."
      ]
    },
    ADJUDICATED: {
      tag: 'Adjudicada',
      tagColor: 'bg-indigo-600',
      titles: [
        "Resultado subasta {city}: adjudicado por {finalPrice}",
        "Subasta finalizada en {city}: ahorro de {savingsTasacion} conseguido",
        "Éxito en {city}: el {type} se adjudica con un margen de {savingsTasacion}",
        "Crónica de una adjudicación en {city}: precio final {finalPrice}",
        "Análisis del resultado en {city}: el {type} ya tiene dueño"
      ],
      excerpts: [
        "¡Adjudicada! El {type} en {city} ya tiene precio final: {finalPrice}. Analizamos el ahorro conseguido respecto a la tasación oficial.",
        "Resultado oficial en {location}: este {type} se ha adjudicado por {finalPrice}, confirmando el interés del mercado en {province}.",
        "Subasta cerrada con éxito en {city}. El precio final de {finalPrice} supone un ahorro significativo para el adjudicatario.",
        "Ya conocemos el desenlace en {province}: el {type} en {city} se ha adjudicado por {finalPrice}. Repasamos las métricas finales.",
        "Fin del expediente en {city}: adjudicación por {finalPrice}. Un caso de estudio sobre rentabilidad real en subastas judiciales."
      ],
      intros: [
        "La subasta de este {type} en {city} ha llegado a su fin con una adjudicación por importe de {finalPrice}. El resultado marca un hito en el mercado local de {province}.",
        "Ya tenemos el precio de cierre para el expediente de {city}. El {asset} se ha adjudicado por {finalPrice}, lo que representa un ahorro de {savingsTasacion} sobre la tasación judicial.",
        "El portal de subastas del BOE confirma la adjudicación de este {type} en {location}. Con un precio final de {finalPrice}, la operación se consolida como una referencia de valor."
      ]
    }
  };

  const cityAuctions = Object.values(AUCTIONS).filter((a: AuctionData) => normalizeCity(a) === city);
  const cityDiscounts = cityAuctions
      .map((a: AuctionData) => {
          const appraisal = a.appraisalValue || a.valorTasacion || a.valorSubasta || 0;
          return a.claimedDebt !== undefined ? calculateDiscount(appraisal, a.valorSubasta, a.claimedDebt) : null;
      })
      .filter((d: number | null) => d !== null) as number[];
  const avgDiscount = cityDiscounts.length > 0 ? cityDiscounts.reduce((a, b) => a + b, 0) / cityDiscounts.length : 0;

  let opportunityLevel = 'Requiere análisis';
  if (discountValue && discountValue > 20 && opportunityScore > 70 && debtValue !== undefined) {
      opportunityLevel = 'Alta';
  } else if (discountValue && discountValue > 10 && opportunityScore > 40) {
      opportunityLevel = 'Media';
  }

  const investorProfile = type === 'vivienda' ? "Ideal para inversores que buscan primera vivienda o activos para reformar." : "Perfil enfocado a inversores patrimonialistas.";

  // --- NUEVA LÓGICA DE BLOQUES DINÁMICOS ---
  
  const blockTemplates = {
    marketContext: [
      { title: "Contexto del mercado en {city}", content: "La zona de {city} en {province} ha mostrado una resiliencia notable en el sector de {type}. Esta subasta se produce en un momento de consolidación de precios, donde los activos procedentes de ejecuciones judiciales actúan como indicadores de oportunidad.\n\nLa presión de la demanda en {province} hace que cualquier activo que salga con un margen potencial del {discount} sea analizado con atención por los inversores locales.\n\nEncontrar un {type} con una tasación de {appraisal} en el circuito de subastas permite entrar en el mercado con un margen que difícilmente se encuentra en el portal inmobiliario tradicional." },
      { title: "Situación inmobiliaria local", content: "Analizando el entorno de {city}, observamos que este {type} se sitúa en un enclave interesante para el inversor patrimonialista.\n\nEl mercado de {city} sigue siendo uno de los motores de {province}, con una rotación de activos constante.\n\nEsta subasta representa una ventana de entrada en un entorno consolidado, donde la oferta de {type} es limitada y los precios de mercado suelen estar por encima de la deuda reclamada." }
    ],
    warning: [
      { title: "⚠️ Nota: Datos en análisis", content: "Un factor a considerar en este expediente es que la deuda reclamada no consta de forma explícita en los registros simplificados.\n\nEsto sugiere una revisión del edicto y, preferiblemente, una consulta para confirmar la situación de cargas preferentes.\n\nLa ausencia de un dato de deuda definitivo en este {type} es un aspecto a analizar en la operación, por lo que recomendamos un estudio detallado." }
    ],
    opportunity: [
      { title: "🎯 Un activo de interés destacado", content: "Con una puntuación de oportunidad superior a la media, este {type} destaca en nuestro radar editorial de esta semana.\n\nEl margen del {discount} sobre una tasación de {appraisal} lo posiciona como uno de los activos a seguir en {province}.\n\nPara un inversor con liquidez, este {type} representa una opción de optimizar el retorno sobre el capital en un plazo razonable." }
    ],
    urgency: [
      { title: "⏰ Cierre próximo: Factor tiempo", content: "Esta subasta en {city} está entrando en sus últimas 48 horas de vida en el portal del BOE.\n\nLa ventana para realizar el análisis previo y depositar la fianza se está completando.\n\nLas subastas que llegan a su fin con una participación moderada suelen ser las que permiten capturar mejores márgenes respecto al valor de mercado real." }
    ],
    profile: [
      { title: "🏠 Perfil: Opción para familias", content: "Por su tipología de {type} y ubicación en {city}, este activo es una opción para familias que buscan su vivienda con un presupuesto ajustado.\n\nEl ahorro conseguido en la subasta puede destinarse a una adecuación personalizada, creando valor desde el inicio.\n\nEs una forma de acceder al mercado de {province} con un enfoque de ahorro respecto a los precios tradicionales." }
    ],
    scenario: [
      { title: "🔮 Escenario tras la adjudicación", content: "Tras la adjudicación de este {type}, el escenario habitual en {city} es una actualización del valor tras una puesta a punto.\n\nEl mercado en {province} absorbe con fluidez activos saneados procedentes de subasta judicial.\n\nUna vez el activo esté libre de cargas, su valor en {city} debería tender a alinearse con la tasación de {appraisal}." }
    ],
    legalRisk: [
      { title: "⚖️ Análisis de la situación legal", content: "El procedimiento judicial que sustenta esta subasta sugiere una lectura atenta de la certificación de cargas.\n\nEn {city}, los juzgados siguen sus cauces habituales, aunque siempre es bueno prever los tiempos de los trámites procesales.\n\nContar con apoyo técnico es un factor a considerar para navegar los pasos de este {type} en {province} con tranquilidad." }
    ],
    possession: [
      { title: "🔑 Situación de la posesión", content: "La variable de la ocupación ({occupancy}) es un aspecto a analizar en esta operación en {city}.\n\nSi el inmueble no está libre, el inversor debe prever el tiempo de los trámites de posesión y los costes asociados.\n\nEn {province}, estos procesos siguen unos plazos determinados, un factor que debe estar integrado en la puja para mantener el equilibrio de la inversión." }
    ]
  };

  const sources = [
    { name: "BOE (Boletín Oficial del Estado)", url: "https://www.boe.es" },
    { name: "CGPJ (Consejo General del Poder Judicial)", url: "https://www.poderjudicial.es" },
    { name: "Colegio de Registradores de España", url: "https://www.registradores.org" },
    { name: "INE (Instituto Nacional de Estadística)", url: "https://www.ine.es" },
    { name: "Ministerio de Vivienda y Agenda Urbana", url: "https://www.mivau.gob.es" }
  ];

  const selectedSources = shuffleArray(sources, random).slice(0, 3);

  const conclusionVariants = [
    "### 🚀 Conclusión\nEsta subasta en {city} representa un caso de estudio sobre cómo el mercado de ejecuciones puede ofrecer márgenes interesantes si se gestionan bien los factores de {occupancy}.",
    "### 🚀 Conclusión\nEn resumen, el {type} en {province} es un activo a considerar. La clave será mantener el equilibrio en las propuestas finales y respetar el límite marcado por la deuda de {debt}.",
    "### 🚀 Conclusión\nEstamos ante una operativa técnica. Si buscas un activo en {city} con un margen real del {discount}, este expediente merece tu atención antes de que cierre el plazo.",
    "### 🚀 Conclusión\nLa opción en {province} es clara, pero la prudencia debe mandar. Verifica el estado de {occupancy} antes de avanzar con este {type}.",
    "### 🚀 Conclusión\nFinalizamos el análisis destacando que subastas como esta en {city} son las que permiten diversificar carteras inmobiliarias con un enfoque de ahorro.",
    "### 🚀 Conclusión\nUna opción equilibrada. Sin factores excesivos, este {type} es para quien sabe analizar con detalle los datos del BOE.",
    "### 🚀 Conclusión\nSi los números de {appraisal} y {debt} encajan en tu análisis, {city} te ofrece hoy una de las mejores ventanas de entrada del periodo.",
    "### 🚀 Conclusión\nCerramos el reporte: este {type} es un activo a seguir. La subasta judicial es un camino para optimizar la inversión en {province}."
  ];

  // Construcción de secciones dinámicas
  const sections: { title: string; content: string | string[] }[] = [];

  // 1. Bloque de Análisis (Siempre primero)
  const analysisTpl = pickRandom((templatesByPhase as any)[phase].analysis, random) as string;
  sections.push({
    title: analysisTpl.split('\n')[0].replace('### ', '').trim(),
    content: replaceVars(analysisTpl.split('\n').slice(1).join('\n').trim())
  });

  // 2. Bloque de Riesgos (Siempre segundo)
  const riskTpl = pickRandom((templatesByPhase as any)[phase].risk, random) as string;
  sections.push({
    title: riskTpl.split('\n')[0].replace('### ', '').trim(),
    content: replaceVars(riskTpl.split('\n').slice(1).join('\n').trim()).split('.').filter(s => s.trim())
  });

  // 3. Bloques Contextuales (Orden variable)
  const middleBlocks: { title: string; content: string }[] = [];

  // Lógica contextual
  const isCapital = city.toLowerCase().includes('madrid') || city.toLowerCase().includes('barcelona') || city.toLowerCase().includes('valencia') || city.toLowerCase().includes('sevilla');
  if (isCapital) {
    const tpl = pickRandom(blockTemplates.marketContext, random);
    middleBlocks.push({ title: replaceVars(tpl.title), content: replaceVars(tpl.content) });
  }

  if (debtValue === undefined || debtValue === null) {
    const tpl = pickRandom(blockTemplates.warning, random);
    middleBlocks.push({ title: replaceVars(tpl.title), content: replaceVars(tpl.content) });
  }

  if (opportunityScore > 75) {
    const tpl = pickRandom(blockTemplates.opportunity, random);
    middleBlocks.push({ title: replaceVars(tpl.title), content: replaceVars(tpl.content) });
  }

  if (phase === 'ENDING_SOON') {
    const tpl = pickRandom(blockTemplates.urgency, random);
    middleBlocks.push({ title: replaceVars(tpl.title), content: replaceVars(tpl.content) });
  }

  // Añadir perfil, escenario, factor legal y posesión para dar cuerpo
  const profileTpl = pickRandom(blockTemplates.profile, random);
  middleBlocks.push({ title: replaceVars(profileTpl.title), content: replaceVars(profileTpl.content) });

  const scenarioTpl = pickRandom(blockTemplates.scenario, random);
  middleBlocks.push({ title: replaceVars(scenarioTpl.title), content: replaceVars(scenarioTpl.content) });

  const legalTpl = pickRandom(blockTemplates.legalRisk, random);
  middleBlocks.push({ title: replaceVars(legalTpl.title), content: replaceVars(legalTpl.content) });

  const possessionTpl = pickRandom(blockTemplates.possession, random);
  middleBlocks.push({ title: replaceVars(possessionTpl.title), content: replaceVars(possessionTpl.content) });

  // Mezclar bloques intermedios
  const shuffledMiddle = shuffleArray(middleBlocks, random);
  sections.push(...shuffledMiddle);

  const marketComparison = `El descuento de esta subasta (${discountValue ? discountValue + '%' : 'no disponible'}) se sitúa ${discountValue && discountValue > avgDiscount ? 'por encima' : 'por debajo'} de la media de la ciudad (${avgDiscount.toFixed(1)}%).`;
  const opportunityLevelText = `${opportunityLevel}: Este nivel se basa en el descuento, la puntuación de oportunidad y la disponibilidad de datos de deuda.`;

  // Añadir comparativa y oportunidad como bloques fijos pero con títulos variables
  sections.push({
    title: "Comparativa de mercado local",
    content: marketComparison
  });

  sections.push({
    title: "Evaluación de la oportunidad",
    content: opportunityLevelText
  });

  // 4. Conclusión (Siempre al final)
  const conclusionTpl = replaceVars(pickRandom((templatesByPhase as any)[phase].conclusion, random));
  sections.push({
    title: conclusionTpl.split('\n')[0].replace('### ', '').trim(),
    content: conclusionTpl.split('\n').slice(1).join('\n').trim()
  });

  // --- LÓGICA DE TÍTULOS Y META ---
  let title = "";
  let meta = "";

  if (phase === 'ADJUDICATED') {
    const hasDiscount = finalPriceValue && appraisalValue && discountValue && discountValue > 0;

    if (hasDiscount) {
      title = `Se adjudica en ${city} por ${finalPrice} € (-${discountValue}%)`;
      meta = `Resultado de subasta en ${city}. Adjudicada por ${finalPrice} €. Ahorro del ${discountValue}% sobre tasación.`;
    } else if (finalPriceValue) {
      title = `Subasta en ${city} se adjudica por ${finalPrice} €`;
      meta = `Finaliza la subasta en ${city} con puja ganadora de ${finalPrice} €. Resultado del procedimiento judicial.`;
    } else {
      title = `Resultado de subasta en ${city}`;
      meta = `Resultado final del procedimiento judicial en ${city}.`;
    }
  } else if (phase === 'NEW' || phase === 'ENDING_SOON') {
    if (discountValue && discountValue > 0) {
      title = `Subasta en ${city}: ${type} con ${discount} descuento`;
      meta = `Subasta en ${city}. Tasación ${appraisal}. Posible descuento del ${discount}. Análisis completo.`;
    } else if (!debtValue) {
      title = `Subasta en ${city} sin puja mínima`;
      meta = `Nueva subasta en ${city}. Sin deuda publicada. Puja abierta según edicto judicial.`;
    } else if (!appraisalValue) {
      title = `Subasta judicial en ${city} recién publicada`;
      meta = `Subasta en ${city} con condiciones abiertas. Consultar edicto para información completa.`;
    } else {
      title = `Subasta en ${city}: ${type}`;
      meta = `Subasta judicial en ${city}. Información del procedimiento y análisis del activo.`;
    }
  } else {
    title = `Subasta en ${city}: ${type}`;
    meta = `Subasta judicial en ${city}. Información del procedimiento y análisis del activo.`;
  }

  // Aplicar truncamiento y reglas
  title = truncate(title, 65);
  meta = truncate(meta, 155);

  const introParagraph = replaceVars(pickRandom(phaseTemplates[phase].intros, random));

  // Insertar introParagraph al principio de las secciones
  sections.unshift({
    title: "Análisis de situación",
    content: introParagraph
  });

  return {
    phase,
    dateModified,
    title,
    excerpt: meta,
    content: [], 
    tag: phaseTemplates[phase].tag,
    tagColor: phaseTemplates[phase].tagColor,
    data: {
      title,
      intro: meta,
      sections, // Nueva estructura dinámica
      marketComparison,
      opportunityLevel: opportunityLevelText,
      investorProfile,
      appraisalValue: appraisalValue,
      debtValue: debtValue || 0,
      boeUrl: auction.boeUrl,
      sources: selectedSources,
      chips: {
        city,
        type: normalizePropertyType(auction.propertyType),
        appraisal,
        debt: debt || "Ver BOE",
        closing: auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : 'Ver BOE',
        finalPrice: vars.finalPrice,
        savings: vars.savingsTasacion
      }
    }
  };
}
