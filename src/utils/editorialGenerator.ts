import { AuctionData } from '../data/auctions';
import { getComputedStatus, getAuctionType } from './auctionHelpers';
import { normalizeCity, normalizePropertyType } from './auctionNormalizer';

// Hash determinista simple para que el texto sea estable por cada subasta
function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(arr: T[], hash: number, offset: number = 0): T {
  return arr[(hash + offset) % arr.length];
}

export function generateEditorialContent(auction: AuctionData): string[] {
  const paragraphs: string[] = [];
  const hash = getHash(auction.boeId || 'default');
  
  const status = getComputedStatus(auction);
  const city = normalizeCity(auction) || 'España';
  const zone = auction.zone || city;
  const propType = normalizePropertyType(auction.propertyType).toLowerCase();
  const type = getAuctionType(auction.boeId);
  let procedure = 'subasta administrativa';
  if (type === 'Judicial') procedure = 'subasta judicial';
  if (type === 'AEAT') procedure = 'subasta de la AEAT';
  if (type === 'Seguridad Social') procedure = 'subasta de la Seguridad Social';
  if (type === 'Notarial') procedure = 'subasta notarial';
  
  const valorReferencia = auction.valorTasacion || auction.valorSubasta || auction.appraisalValue;
  const deuda = auction.claimedDebt;
  const discount = (valorReferencia && deuda !== undefined && deuda !== null) 
    ? Math.round((1 - deuda / valorReferencia) * 100) 
    : null;

  const auctionDate = auction.auctionDate ? new Date(auction.auctionDate) : null;
  const now = new Date();
  const diffHours = auctionDate ? (auctionDate.getTime() - now.getTime()) / (1000 * 60 * 60) : null;
  const isClosingSoon = diffHours !== null && diffHours > 0 && diffHours <= 72;

  // 1. INTRO & FOMO (Basado en estado)
  if (status === 'upcoming') {
    paragraphs.push(pick([
      `El BOE acaba de anunciar este expediente en ${city}, pero el plazo de pujas aún no se ha abierto. Estamos en la ventana ideal de anticipación para pedir notas simples y analizar la viabilidad sin presión de tiempo.`,
      `Nos encontramos en la fase previa para este activo en ${zone}. La subasta todavía no admite pujas, lo que proporciona una ventaja estratégica fundamental para investigar el estado posesorio y las cargas registrales con antelación.`,
      `Atención a este nuevo expediente en ${city}. Al estar en fase de "próxima apertura", los inversores más rápidos ya están solicitando la documentación en el registro antes de que el activo gane visibilidad general.`
    ], hash, 1));
  } else if (status === 'active') {
    if (isClosingSoon) {
      paragraphs.push(pick([
        `Cuenta atrás en ${city}. Quedan escasas horas para el cierre de esta subasta. Es el momento crítico donde se deciden las adjudicaciones y entran las pujas institucionales.`,
        `Entramos en la fase de resolución para este activo en ${zone}. Con el reloj en contra, las próximas horas determinarán el precio final de remate de esta oportunidad.`,
        `Última llamada para este expediente en ${city}. La subasta está a punto de concluir, un escenario donde la rapidez en el análisis de última hora marca la diferencia entre el éxito y dejar pasar la operación.`
      ], hash, 2));
    } else {
      paragraphs.push(pick([
        `Las pujas ya están abiertas para este activo en ${zone}. Los primeros inversores ya están posicionándose en un proceso que requiere tanto agilidad como rigor analítico.`,
        `El proceso de subasta se encuentra actualmente en curso en ${city}. Es el momento de monitorizar la evolución de las pujas mientras se completa la due diligence legal y técnica.`,
        `Oportunidad activa en ${zone}. El periodo de recepción de posturas está habilitado, abriendo la ventana de participación para adjudicarse este inmueble por debajo de su valor de mercado.`
      ], hash, 3));
    }
  } else if (status === 'suspended') {
    paragraphs.push(pick([
      `El juzgado ha pausado temporalmente este expediente en ${city}. Esto suele ocurrir por acuerdos extrajudiciales de última hora, defectos de forma o presentación de tercerías.`,
      `Subasta en standby. La ejecución de este activo en ${zone} ha sido suspendida. Mantenerlo en el radar es clave, ya que muchas de estas operaciones se reactivan de golpe semanas después.`,
      `Procedimiento paralizado temporalmente en ${city}. Aunque actualmente no admite pujas, los inversores experimentados mantienen el seguimiento de estos expedientes suspendidos ante posibles reanudaciones sorpresa.`
    ], hash, 4));
  } else {
    paragraphs.push(pick([
      `El plazo de pujas para este activo en ${city} ha concluido. El expediente se encuentra ahora en fase de resolución y adjudicación.`,
      `Subasta finalizada en ${zone}. El proceso ha cerrado la admisión de posturas y está pendiente de la emisión del decreto de remate por parte de la autoridad gestora.`,
      `Este proceso en ${city} ya no admite nuevas participaciones. Queda como referencia histórica para entender el comportamiento del mercado en esta zona.`
    ], hash, 5));
  }

  // 2. ASSET & PROCEDURE
  paragraphs.push(pick([
    `Se trata de un ${propType} gestionado mediante un procedimiento de ${procedure}. Para un inversor, este perfil de activos requiere entender bien los plazos procesales y la naturaleza de la deuda que origina la ejecución.`,
    `Este ${propType} sale al mercado a través de ${procedure}. La tipología del inmueble y la autoridad gestora determinan en gran medida la agilidad del proceso posterior a la adjudicación.`,
    `El activo, clasificado como ${propType}, está siendo liquidado por la vía de ${procedure}. Conocer el origen de la ejecución es el primer paso para anticipar posibles complicaciones posesorias.`
  ], hash, 6));

  // 3. FINANCIALS & DISCOUNT
  if (discount !== null) {
    if (discount > 60) {
      paragraphs.push(pick([
        `Con una deuda reclamada inusualmente baja frente a su tasación (descuento teórico del ${discount}%), nos encontramos ante un escenario de liquidación agresiva que exige revisar la nota simple con lupa para descartar cargas ocultas.`,
        `El diferencial entre el valor de subasta y la cantidad reclamada proyecta un margen bruto del ${discount}%. Estas cifras tan llamativas suelen esconder nudos propietarios o usufructos que deben ser despejados antes de pujar.`,
        `Destaca un gap financiero del ${discount}% a favor del inversor. Sin embargo, en el mercado de subastas, los grandes descuentos obligan a extremar la prudencia sobre el estado físico y legal del inmueble.`
      ], hash, 7));
    } else if (discount >= 20) {
      paragraphs.push(pick([
        `La ratio entre deuda y tasación sugiere un margen de maniobra interesante, rondando el ${discount}% de descuento inicial. Un punto de partida sólido para plantear una estrategia de flipping o rentabilidad por alquiler.`,
        `Financieramente, el expediente presenta un descuento base del ${discount}%. Si las cargas posteriores se limpian correctamente mediante el mandamiento de cancelación, los números encajan en los estándares de inversión profesional.`,
        `Con un ${discount}% de recorrido teórico, la viabilidad de la operación dependerá de afinar el coste de adecuación del inmueble y los tiempos de toma de posesión.`
      ], hash, 8));
    } else if (discount >= 0) {
      paragraphs.push(pick([
        `Una operación de margen ajustado (descuento del ${discount}%). Requerirá un análisis muy fino y pujar con estricta disciplina para no erosionar la rentabilidad esperada.`,
        `El escaso diferencial inicial (${discount}%) indica que el acreedor busca recuperar la práctica totalidad del valor. Aquí, la oportunidad reside en la posible falta de postores que dejen la subasta desierta.`,
        `Los números parten muy ajustados, con apenas un ${discount}% de margen teórico. Solo inversores patrimonialistas a largo plazo o vecinos de la zona suelen encontrar encaje en este perfil financiero.`
      ], hash, 9));
    }
  } else if (deuda === 0) {
    paragraphs.push(pick([
      `Un caso atípico: el expediente no declara cantidad reclamada inicial (0€). Esto es frecuente en divisiones de la cosa común o disoluciones de proindivisos, donde no hay un acreedor ejecutante al uso.`,
      `La ausencia de deuda reclamada en el edicto (0€) cambia las reglas del juego. Generalmente apunta a subastas voluntarias o extinciones de condominio, escenarios con dinámicas de puja muy particulares.`,
      `Al no constar cantidad reclamada, el análisis debe centrarse íntegramente en el valor de tasación y en las condiciones específicas estipuladas en el pliego de condiciones del juzgado.`
    ], hash, 10));
  } else {
    paragraphs.push(pick([
      `La falta de datos públicos sobre la cantidad reclamada añade una capa de opacidad al expediente. Es imperativo solicitar el expediente completo al juzgado para modelar financieramente la operación.`,
      `Sin visibilidad inmediata sobre la deuda exacta, el inversor debe basar sus cálculos preliminares exclusivamente en el valor de tasación y la investigación registral independiente.`,
      `El edicto omite la cantidad reclamada. Esta falta de información inicial filtra a los inversores menos experimentados, dejando el terreno libre a quienes saben cómo obtener el expediente judicial.`
    ], hash, 11));
  }

  // 4. MARKET CONTEXT
  paragraphs.push(pick([
    `El contexto actual del mercado en ${city} muestra una demanda sostenida, lo que hace que activos con este perfil sean especialmente atractivos para estrategias de comprar, reformar y vender.`,
    `La escasez de oferta tradicional en zonas como ${zone} provoca que el canal de subastas sea una de las pocas vías para adquirir patrimonio por debajo del precio de reposición.`,
    `En una plaza competitiva como ${city}, dominar la información de estos expedientes off-market es la única forma de generar alfa inmobiliario real en el ciclo actual.`
  ], hash, 12));

  return paragraphs;
}
