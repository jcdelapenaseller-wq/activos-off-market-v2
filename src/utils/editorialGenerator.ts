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

  // Final safety check: never return a future date
  if (dateModified > now) {
    return now;
  }

  return dateModified;
}

const formatCurrency = (num: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);

export function generateEditorialArticle(slug: string, auction: AuctionData): EditorialArticle {
  const phase = detectPhase(auction);
  const dateModified = getEditorialDate(auction, phase);
  const random = getSeededRandom(`${slug}-${phase}`);

  const city = normalizeCity(auction) || 'España';
  const type = normalizePropertyType(auction.propertyType).toLowerCase();
  const appraisal = auction.valorTasacion || auction.valorSubasta || 0;
  const debt = auction.claimedDebt;
  const discount = calculateDiscount(appraisal, auction.valorSubasta, debt) || 0;

  const vars = {
    city,
    type,
    appraisal: formatCurrency(appraisal),
    debt: debt !== undefined ? formatCurrency(debt) : 'desconocida',
    discount: `${discount}%`
  };

  const replaceVars = (str: string) => {
    return str.replace(/{(\w+)}/g, (_, k) => (vars as any)[k] || '');
  };

  // Templates
  const templates = {
    NEW: {
      tag: 'Nueva Oportunidad',
      tagColor: 'bg-emerald-600',
      titles: [
        "Sale a subasta un {type} en {city} que está llamando la atención del mercado",
        "Oportunidad detectada: {type} en {city} con un escenario financiero inusual",
        "El BOE publica la subasta de este {type} en {city}: analizamos los números",
        "¿Merece la pena este {type} en {city}? Primer vistazo a la nueva subasta",
        "Alerta de subasta: {type} en {city} con potencial de inversión",
        "Nuevo expediente en {city}: un {type} entra en fase de ejecución judicial"
      ],
      excerpts: [
        "El mercado inmobiliario de {city} suma un nuevo activo procedente de ejecución. Analizamos si los números reales justifican una puja.",
        "Acaba de abrirse el plazo para este inmueble en {city}. Revisamos la tasación y la deuda reclamada para encontrar el margen real.",
        "Una nueva oportunidad aparece en el radar de {city}. Desgranamos los detalles técnicos de este {type} recién publicado.",
        "Primer análisis de este {type} en {city}. Descubre si el descuento teórico se traduce en una rentabilidad real para el inversor.",
        "El BOE acaba de liberar la información sobre este {type} en {city}. Te contamos lo que no se ve a simple vista en el edicto."
      ],
      paragraphs: [
        [
          "El panorama de las subastas públicas en {city} acaba de actualizarse con la entrada de un nuevo activo que está generando movimiento entre los inversores especializados. Se trata de un {type} que ha llegado a fase de ejecución y cuyo expediente ya es público.",
          "La aparición de este tipo de inmuebles en {city} siempre requiere un análisis pausado. No todas las subastas son rentables, y el primer paso es entender de dónde viene la ejecución y qué características tiene el activo sobre el papel.",
          "Un nuevo {type} ha sido publicado en el portal de subastas del BOE, sumándose a la oferta de {city}. Este tipo de activos suele atraer tanto a inversores locales como a fondos especializados.",
          "El mercado de {city} recibe hoy una nueva oportunidad de inversión. Este {type} acaba de iniciar su periodo de subasta, abriendo una ventana de tiempo limitada para su análisis.",
          "La ejecución judicial de este {type} en {city} ya es una realidad. Con el expediente abierto, los postores comienzan a evaluar si las condiciones justifican inmovilizar el capital."
        ],
        [
          debt !== undefined 
            ? `Los números oficiales muestran un valor de tasación fijado en ${vars.appraisal}, mientras que la cantidad reclamada que origina la ejecución asciende a ${vars.debt}. Esto nos deja un descuento teórico del ${vars.discount}, un margen que a priori resulta atractivo pero que debe ser contrastado.`
            : `El valor de tasación oficial se ha fijado en ${vars.appraisal}. Sin embargo, en este expediente la cantidad reclamada no es pública o requiere una revisión manual del edicto, un factor de riesgo que todo inversor debe despejar antes de avanzar.`,
          "Es fundamental recordar que la tasación judicial no siempre refleja el valor de mercado actual. A menudo, estas valoraciones tienen años de antigüedad o se hicieron bajo premisas que hoy han cambiado.",
          debt !== undefined 
            ? `Partimos de una base clara: tasación de ${vars.appraisal} frente a una deuda de ${vars.debt}. Ese ${vars.discount} de diferencia es el colchón de seguridad inicial, pero la rentabilidad final dependerá de las cargas ocultas.`
            : `Con una tasación de ${vars.appraisal} sobre la mesa, la gran incógnita sigue siendo la deuda reclamada. Entrar a ciegas en este aspecto reduce drásticamente las probabilidades de éxito.`,
          "El análisis financiero preliminar debe tomar estos valores con cautela. La tasación es solo un punto de partida legal, no una garantía de precio de reventa en el mercado libre.",
          debt !== undefined
            ? `El expediente revela una deuda de ${vars.debt} para un activo valorado en ${vars.appraisal}. Este escenario de ${vars.discount} de descuento aparente es exactamente lo que buscan los analistas de subastas.`
            : `Aunque conocemos la tasación de ${vars.appraisal}, la opacidad sobre la deuda reclamada obliga a realizar una investigación registral exhaustiva antes de plantear cualquier puja.`
        ],
        [
          "Más allá del precio, el verdadero riesgo de adquirir un {type} por esta vía reside en los 'detalles invisibles'. La situación posesoria (si está ocupado, alquilado o vacío) y las posibles cargas registrales anteriores son los elementos que pueden arruinar la rentabilidad de la operación.",
          "Por ello, antes de inmovilizar el depósito del 5% requerido para participar, es imperativo realizar un estudio completo de la certificación de cargas y contactar con la comunidad de propietarios si procede.",
          "El éxito en esta operación no dependerá de quién puje más alto, sino de quién haya investigado mejor. Conocer el estado de ocupación y las deudas con la comunidad o el IBI es innegociable.",
          "Recomendamos encarecidamente solicitar una nota simple actualizada. Las cargas anteriores al embargo que origina esta subasta deberán ser asumidas por el adjudicatario, alterando por completo los números.",
          "Como siempre en este sector, la prudencia es la mejor aliada. Visitar el exterior del inmueble, hablar con los vecinos y revisar minuciosamente el edicto son pasos obligatorios antes de transferir el depósito."
        ]
      ]
    },
    ENDING_SOON: {
      tag: 'Cierre Inminente',
      tagColor: 'bg-red-600',
      titles: [
        "Últimas horas para pujar por el {type} de {city}: ¿hay margen real?",
        "Cierre inminente: la subasta del {type} en {city} entra en su recta final",
        "Cuenta atrás en {city}: el {type} con {discount} de descuento teórico a punto de adjudicarse",
        "Alerta de cierre: finaliza el plazo para este {type} en {city}",
        "Decisión final: ¿pujar o dejar pasar este {type} en {city}?",
        "Recta final para la subasta de {city}: el {type} busca adjudicatario"
      ],
      excerpts: [
        "El plazo de la subasta para este {type} en {city} está a punto de concluir. Repasamos los números clave antes del cierre.",
        "Entramos en las últimas 48 horas de puja para este inmueble en {city}. ¿Es realmente una oportunidad o esconde riesgos?",
        "La ventana de oportunidad para este {type} en {city} se cierra pronto. Análisis de última hora sobre su viabilidad.",
        "Queda muy poco tiempo para que el BOE cierre la recepción de posturas. Revisamos si los números de este {type} cuadran.",
        "Momento crítico para los inversores interesados en este {type} de {city}. Repasamos la estrategia a seguir en las últimas horas."
      ],
      paragraphs: [
        [
          "El reloj corre para una de las subastas más seguidas en {city}. El plazo para presentar posturas por este {type} está a punto de expirar, entrando en la fase crítica donde los inversores profesionales suelen mostrar sus cartas.",
          "Durante los últimos días de una subasta es cuando se define realmente el precio de mercado del activo. Las pujas tempranas rara vez reflejan el valor final de adjudicación.",
          "La tensión aumenta en el portal del BOE a medida que se acerca el cierre de este expediente en {city}. Es ahora cuando los verdaderos interesados en este {type} comienzan a posicionarse.",
          "A pocas horas del cierre, el escenario para este {type} en {city} se vuelve decisivo. Los inversores que han hecho los deberes están listos para ejecutar su estrategia.",
          "El periodo de investigación ha terminado. Con el cierre inminente de esta subasta en {city}, solo queda decidir si el retorno esperado justifica el riesgo asumido."
        ],
        [
          debt !== undefined 
            ? `Recordemos los datos base: el activo parte con una tasación de ${vars.appraisal} y una deuda reclamada de ${vars.debt}. El descuento del ${vars.discount} ha sido el principal atractivo para los postores que han seguido el expediente.`
            : `El activo, tasado en ${vars.appraisal}, se enfrenta a sus últimas horas sin que la cantidad reclamada sea un dato trivial. Los postores han tenido que hacer sus propios cálculos de riesgo.`,
          "A estas alturas, quien decida entrar debe tener sus números completamente cerrados, incluyendo la provisión para el ITP, gastos de adjudicación y posibles derramas.",
          debt !== undefined 
            ? `Con una deuda de ${vars.debt} frente a una tasación de ${vars.appraisal}, el margen del ${vars.discount} es el límite superior teórico. La puja ganadora determinará el beneficio real.`
            : `La falta de información sobre la deuda reclamada, frente a una tasación de ${vars.appraisal}, ha obligado a los interesados a ser extremadamente conservadores en sus cálculos.`,
          "El cálculo de rentabilidad ya no admite estimaciones. Los costes de saneamiento, impuestos y adecuación del inmueble deben estar cuantificados al milímetro.",
          debt !== undefined
            ? `El atractivo descuento del ${vars.discount} (basado en la deuda de ${vars.debt} y tasación de ${vars.appraisal}) es el motivo por el que esta subasta ha captado tanta atención en sus últimas horas.`
            : `Sin el dato de la deuda reclamada, la tasación de ${vars.appraisal} es la única brújula oficial. Los inversores más experimentados ya habrán estimado el pasivo real del inmueble.`
        ],
        [
          "Entrar en el último minuto requiere tener la certeza absoluta sobre la situación posesoria y las cargas. Un error de cálculo ahora, con el depósito ya retenido, puede resultar muy costoso.",
          "La estrategia en estas últimas horas suele ser de observación, esperando a los últimos minutos para lanzar la puja máxima calculada, siempre respetando el límite de rentabilidad predefinido.",
          "Es vital no dejarse llevar por la 'fiebre de la subasta'. Si las pujas superan el límite máximo que te habías marcado en tu Excel, la mejor decisión es retirarse.",
          "Los postores profesionales saben que el verdadero beneficio se hace en la compra. Mantener la disciplina financiera en estos momentos finales es lo que separa el éxito del fracaso.",
          "Recuerda que si el portal del BOE recibe una puja en los últimos minutos, el plazo se ampliará automáticamente. Mantén la calma y cíñete a tu plan de inversión."
        ]
      ]
    },
    SUSPENDED: {
      tag: 'Suspendida',
      tagColor: 'bg-amber-500',
      titles: [
        "Giro inesperado: paralizada la subasta del {type} en {city}",
        "El juzgado suspende la ejecución del {type} en {city}",
        "Subasta cancelada en {city}: qué ha pasado con este {type}",
        "Freno a la subasta: el {type} de {city} queda en el aire",
        "Por qué se ha suspendido la subasta de este {type} en {city}",
        "Actualización: el BOE retira temporalmente el {type} en {city}"
      ],
      excerpts: [
        "La subasta de este {type} en {city} ha sido suspendida oficialmente. Analizamos las causas más comunes de esta paralización.",
        "Freno judicial a la subasta del inmueble en {city}. El expediente queda en pausa hasta nuevo aviso.",
        "Cambio de estado: el {type} de {city} ya no admite pujas por suspensión del procedimiento.",
        "El juzgado ha dictado la suspensión de esta ejecución en {city}. Explicamos qué implica esto para los postores.",
        "Una suspensión de última hora paraliza la venta de este {type} en {city}. Conoce los motivos detrás de esta decisión."
      ],
      paragraphs: [
        [
          "Cambio de guion en el procedimiento de ejecución en {city}. La autoridad competente ha decretado la suspensión oficial de la subasta de este {type}, paralizando temporalmente cualquier posibilidad de adjudicación.",
          "Las suspensiones son un escenario habitual en el mundo de las subastas públicas y forman parte del riesgo temporal que asumen los inversores que inmovilizan capital en los depósitos.",
          "El portal del BOE ha actualizado el estado de este {type} en {city} a 'Suspendida'. Esta notificación interrumpe el reloj de la subasta y deja el activo en un limbo legal temporal.",
          "Quienes seguían de cerca este {type} en {city} se han encontrado con una suspensión judicial. Este tipo de giros procesales requieren paciencia por parte del inversor.",
          "La ejecución de este inmueble en {city} ha sufrido un revés. El juzgado ha ordenado la paralización del proceso, impidiendo que se registren nuevas posturas."
        ],
        [
          "Existen múltiples razones jurídicas que pueden forzar esta paralización. Las más comunes incluyen el pago de la deuda por parte del ejecutado en el último momento, la presentación de un incidente de nulidad, o la solicitud de concurso de acreedores.",
          "En ocasiones, también puede deberse a defectos de forma en la notificación o a la aparición de terceros ocupantes que hacen valer sus derechos ante el juzgado.",
          "La paralización puede originarse por un acuerdo extrajudicial in extremis entre el banco y el deudor, logrando frenar la pérdida del {type} en el último momento.",
          "Otra causa frecuente de suspensión en {city} es la presentación de recursos por parte de acreedores posteriores que detectan irregularidades en el procedimiento de apremio.",
          "No es descartable que el propio juzgado haya detectado un error material en el edicto de este {type}, obligando a suspender para subsanar y evitar futuras nulidades."
        ],
        [
          "Para los inversores que ya habían depositado el 5% para participar, esta suspensión implica la devolución íntegra de los fondos, aunque el proceso puede demorarse unos días dependiendo de la agilidad del juzgado.",
          "El activo podría volver a salir a subasta en el futuro si la causa de la suspensión se resuelve a favor del ejecutante, por lo que conviene mantener el expediente en el radar.",
          "Si tenías este {type} en tu radar, lo ideal es archivar el estudio realizado. Muchas subastas suspendidas en {city} vuelven a activarse meses después con las mismas condiciones.",
          "El capital retenido en el depósito será liberado por el Tesoro Público, permitiendo a los postores redirigir su liquidez hacia otras oportunidades activas.",
          "La lección aquí es clara: nunca des por cerrada una compra hasta tener el decreto de adjudicación. Las suspensiones son el recordatorio de que estamos ante un proceso judicial vivo."
        ]
      ]
    },
    CLOSED: {
      tag: 'Finalizada',
      tagColor: 'bg-slate-600',
      titles: [
        "Resolución: así cerró la subasta del {type} en {city}",
        "Finaliza la puja por el {type} en {city}: análisis post-subasta",
        "Caso de estudio: el desenlace de la subasta del {type} en {city}",
        "Adjudicado: fin del proceso para este {type} en {city}",
        "Cierre de expediente: lo que nos enseña la subasta de este {type} en {city}",
        "Subasta concluida: el mercado dicta sentencia sobre el {type} en {city}"
      ],
      excerpts: [
        "El plazo de pujas ha concluido para este inmueble en {city}. Repasamos los datos de este expediente finalizado como caso de estudio.",
        "Subasta cerrada en {city}. Analizamos a posteriori los números de este {type} para entender la dinámica del mercado local.",
        "Fin del procedimiento para el {type} en {city}. Lecciones y métricas que deja esta ejecución hipotecaria.",
        "El BOE ha cerrado la recepción de posturas para este {type}. Revisamos cómo ha quedado el escenario tras el cierre.",
        "Con la subasta finalizada, este {type} en {city} pasa a la fase de adjudicación judicial. Analizamos el resultado."
      ],
      paragraphs: [
        [
          "El martillo virtual ha caído. La subasta de este {type} en {city} ha finalizado oficialmente, cerrando el periodo de recepción de pujas y pasando a la fase de resolución judicial.",
          "Analizar subastas ya concluidas es una de las mejores formas de entender la temperatura real del mercado inmobiliario de inversión en la zona, más allá de los precios teóricos de los portales inmobiliarios.",
          "El periodo de pujas para este {type} en {city} ha llegado a su fin. Ahora, el expediente entra en la fase burocrática donde el juzgado deberá validar la postura ganadora.",
          "La subasta de este {type} ya es historia. Con el cierre del plazo en el BOE, los inversores de {city} ya pueden añadir este caso a sus bases de datos de comparables.",
          "Se acabó el tiempo. La ejecución de este {type} en {city} ha cerrado su ventana pública, dejando tras de sí datos muy valiosos para futuros análisis de mercado."
        ],
        [
          debt !== undefined 
            ? `El expediente partía con una tasación de ${vars.appraisal} y una deuda de ${vars.debt}. El margen teórico inicial era del ${vars.discount}, un colchón que los postores han tenido que ajustar en base a sus investigaciones.`
            : `Con una tasación de ${vars.appraisal}, los inversores han tenido que pujar a ciegas respecto a la deuda reclamada, un factor que suele deprimir las pujas máximas por prudencia.`,
          "Ahora, el Letrado de la Administración de Justicia (LAJ) deberá dictar el decreto de aprobación del remate a favor de la mejor postura, siempre que esta cumpla con los porcentajes legales exigidos respecto al valor de tasación.",
          debt !== undefined 
            ? `Recordando los números: tasación de ${vars.appraisal} y deuda de ${vars.debt}. Quien haya logrado adjudicarse el bien por debajo de ese ${vars.discount} de descuento teórico, habrá firmado una buena operación.`
            : `El riesgo de no conocer la deuda reclamada (frente a la tasación de ${vars.appraisal}) seguramente haya filtrado a los postores menos experimentados, dejando la puja a los profesionales.`,
          "La fase actual es de espera. El mejor postor deberá consignar el resto del precio ofrecido (descontando el depósito) en el plazo legalmente establecido, normalmente 40 días.",
          debt !== undefined
            ? `Este {type} atrajo miradas por su descuento aparente del ${vars.discount} (deuda de ${vars.debt} vs tasación de ${vars.appraisal}). Ahora veremos si las cargas ocultas permitieron mantener ese margen.`
            : `La tasación de ${vars.appraisal} fue el único faro para los inversores. La ausencia del dato de deuda reclamada convirtió esta subasta en un ejercicio de investigación registral avanzada.`
        ],
        [
          "Si la puja ganadora no alcanza el 70% del valor de tasación (en caso de vivienda habitual) o el 50% (en otros inmuebles), se abre un periodo donde el deudor o el acreedor pueden presentar a un tercero que mejore la postura.",
          "Este caso en {city} se suma al histórico de adjudicaciones, sirviendo como referencia valiosa para futuras oportunidades de características similares en la misma provincia.",
          "Para el adjudicatario, el trabajo no termina aquí. Ahora comienza el proceso de toma de posesión, que puede ser rápido si el inmueble está vacío, o requerir un lanzamiento si está ocupado.",
          "Estudiar los resultados de estas subastas cerradas en {city} es el mejor entrenamiento para afinar los números en futuras pujas. El mercado secundario de ejecuciones tiene sus propias reglas.",
          "Una vez dictado el decreto de adjudicación y canceladas las cargas posteriores, el nuevo propietario podrá inscribir el {type} a su nombre en el Registro de la Propiedad, culminando así la inversión."
        ]
      ]
    }
  };

  const tpl = templates[phase];
  const title = replaceVars(pickRandom(tpl.titles, random));
  const excerpt = replaceVars(pickRandom(tpl.excerpts, random));
  
  const content = tpl.paragraphs.map(pGroup => {
    return replaceVars(pickRandom(pGroup, random));
  });

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

