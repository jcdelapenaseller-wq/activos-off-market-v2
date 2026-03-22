export interface DiscoverReportAuctionDetail {
  slug: string;
  subtitle: string;
  analysis: string;
  risks: string;
  investorProfile: string;
}

export interface DiscoverReport {
  id: string;
  title: string;
  intro: string;
  auctionDetails: DiscoverReportAuctionDetail[];
  conclusion: string;
  publishDate: string;
  image: string;
}

export const DISCOVER_REPORTS: Record<string, DiscoverReport> = {
  'top-3-subastas-mayor-descuento-semana': {
    id: 'top-3-subastas-mayor-descuento-semana',
    title: 'Las 3 subastas con mayor descuento esta semana',
    intro: 'El contexto macroeconómico actual en España, marcado por una estabilización de los tipos de interés en niveles todavía restrictivos, ha generado una ventana de oportunidad sin precedentes en el mercado de subastas judiciales. Mientras el mercado minorista tradicional sufre un estancamiento en el volumen de transacciones debido al encarecimiento de la financiación, el mercado "off-market" de adjudicaciones directas está experimentando un repunte en la calidad de los activos disponibles. Muchos inversores cualificados están pivotando sus estrategias desde los portales inmobiliarios clásicos hacia la adquisición de deuda y la participación en subastas públicas, buscando maximizar el margen de seguridad en cada operación.\n\nEsta semana, nuestro equipo de analistas ha monitorizado y filtrado más de 400 expedientes activos en todo el territorio nacional. El objetivo: identificar aquellas "joyas ocultas" donde la asimetría entre el valor de tasación oficial y la cantidad reclamada por el acreedor es extrema. Esta discrepancia es el santo grial de las subastas, ya que permite plantear posturas agresivas con un riesgo de pérdida de capital prácticamente nulo, asumiendo que se realice una due diligence jurídica impecable.\n\nEn este reportaje en profundidad, desgranamos las tres propiedades que lideran nuestro ranking de descuentos esta semana. Hablamos de activos donde la deuda apenas representa el 20% o 25% del valor real del inmueble. Analizaremos no solo los números superficiales, sino los fundamentales subyacentes de cada zona, los posibles escollos legales (cargas posteriores, situaciones posesorias complejas) y la estrategia de salida más óptima para maximizar el ROI.',
    auctionDetails: [
      {
        slug: 'subasta-sub-ja-2024-232380',
        subtitle: 'Oportunidad de alto margen en el Bages (Manresa)',
        analysis: 'Manresa se ha consolidado como uno de los mercados secundarios más atractivos de la provincia de Barcelona para inversores que buscan yields superiores al 7% neto. Este inmueble en particular presenta una situación financiera atípica: una deuda reclamada de apenas 33.946€ frente a una tasación que roza los 170.000€. Esta brecha masiva proporciona un colchón de seguridad excepcional. La zona de Font dels Capellans, aunque requiere un análisis sociodemográfico detallado, mantiene una demanda de alquiler constante y robusta, lo que garantiza una rápida absorción si se opta por una estrategia de "Buy to Let" (comprar para alquilar). El bajo ticket de entrada permite además diversificar el riesgo sin necesidad de apalancamiento bancario, un factor crucial en el entorno de tipos actual.',
        risks: 'El principal riesgo en este tipo de adjudicaciones con tanto descuento suele ser el estado posesorio. Es imperativo verificar si existen ocupantes sin título justo o contratos de arrendamiento de renta antigua que puedan dilatar la toma de posesión. Además, se debe solicitar nota simple actualizada para descartar embargos de la Seguridad Social o Hacienda posteriores a la carga ejecutada.',
        investorProfile: 'Perfil Value / Patrimonialista. Ideal para inversores con liquidez que no dependen de financiación externa y tienen experiencia en la gestión de incidencias posesorias, buscando rentabilidades por alquiler de doble dígito.'
      },
      {
        slug: 'subasta-sub-ja-2026-258540',
        subtitle: 'Activo prime con descuento inusual en Barcelona Capital',
        analysis: 'Encontrar oportunidades con alto descuento dentro del término municipal de Barcelona es un evento anómalo en el mercado actual. Este activo, situado en la calle del Padre Manjón, sale a subasta con una deuda reclamada inferior a 40.000€, mientras que su tasación supera los 170.000€. La ubicación estratégica en la capital catalana asegura no solo una demanda de alquiler inmediata y solvente, sino también una apreciación del capital a medio y largo plazo. La escasez de oferta de vivienda en Barcelona actúa como un suelo de cristal para los precios, mitigando el riesgo de depreciación. Esta operación permite adquirir un activo líquido en un mercado tensionado a un precio de derribo, una oportunidad que rara vez llega al mercado minorista.',
        risks: 'La alta deseabilidad del activo garantiza una fuerte competencia en el portal del BOE. El riesgo principal es el sobreprecio por pujas irracionales de inversores noveles. Asimismo, las deudas con la comunidad de propietarios y el IBI (afecciones reales) en Barcelona pueden ser sustanciales y deben descontarse del precio máximo de puja.',
        investorProfile: 'Perfil Core Plus / Flipping. Inversores que buscan operaciones de "pase" rápido (comprar, reformar y vender) o patrimonialistas que desean incorporar un activo de alta calidad y bajo riesgo a su cartera a un precio inmejorable.'
      },
      {
        slug: 'subasta-sub-ja-2026-258242',
        subtitle: 'Inversión costera con alto potencial de revalorización',
        analysis: 'El mercado inmobiliario en la Costa Dorada, y específicamente en Calafell, ha demostrado una resiliencia notable, impulsado tanto por la demanda nacional como internacional. Este piso en la Carretera de Barcelona presenta una deuda irrisoria de 24.627€ frente a una tasación de más de 100.000€. La proximidad al mar y las excelentes conexiones con Barcelona y Tarragona lo convierten en un activo altamente versátil. Puede explotarse tanto en el mercado de alquiler residencial de larga estancia como en el mercado vacacional (sujeto a normativas locales), maximizando así la TIR de la operación. El bajo importe de la deuda reclamada sugiere que el acreedor principal podría conformarse con recuperar su capital, abriendo la puerta a adjudicaciones muy por debajo del valor de mercado.',
        risks: 'La estacionalidad del mercado costero puede afectar los flujos de caja si se destina a alquiler turístico. Además, las propiedades en zonas de playa a menudo requieren actualizaciones o reformas integrales debido a la humedad y el desgaste, lo que debe incluirse en el CAPEX inicial del proyecto.',
        investorProfile: 'Perfil Oportunista / Rentista Mixto. Adecuado para inversores que buscan diversificar geográficamente su cartera y tienen la capacidad de gestionar reformas a distancia o explotar el activo en régimen de temporada.'
      }
    ],
    conclusion: 'El análisis detallado de estas tres operaciones demuestra empíricamente que el mercado de subastas judiciales en España sigue albergando ineficiencias masivas que el inversor inteligente puede capitalizar. Sin embargo, es crucial recordar que un alto descuento teórico no equivale automáticamente a una operación exitosa. La clave del éxito en este sector no reside únicamente en identificar la brecha entre deuda y tasación, sino en la ejecución impecable de la due diligence legal, técnica y financiera.\n\nRecomendamos encarecidamente a nuestros lectores que, antes de consignar el depósito para cualquiera de estos expedientes, realicen un estudio exhaustivo de las cargas registrales, investiguen el estado de ocupación del inmueble y calculen con precisión todos los costes ocultos (ITP, registro, notaría, posibles derramas y deudas de IBI). La inversión en subastas es una disciplina de precisión, no de volumen. Utilice las herramientas adecuadas y apóyese en análisis expertos para transformar estos descuentos teóricos en rentabilidad real y tangible en su cuenta de resultados.',
    publishDate: '2026-03-22',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80'
  },
  '3-viviendas-subasta-menos-200k': {
    id: '3-viviendas-subasta-menos-200k',
    title: '3 viviendas en subasta por menos de 200.000€',
    intro: 'Adquirir una vivienda por debajo de la barrera psicológica de los 200.000 euros se ha convertido en una auténtica odisea en el mercado inmobiliario español tradicional. La escasez crónica de obra nueva, sumada a una demanda sostenida y al encarecimiento de los costes de construcción, ha expulsado a muchos pequeños y medianos inversores de las principales plazas. En este escenario de precios tensionados, el mercado de subastas públicas emerge no solo como una alternativa, sino como el canal principal para acceder a vivienda asequible con potencial de revalorización.\n\nLas ejecuciones hipotecarias y los embargos administrativos siguen inyectando liquidez al mercado secundario, ofreciendo activos residenciales a una fracción de su valor de reposición. Esta semana, nuestro equipo de investigación ha puesto el foco en el segmento de precios medios-bajos, rastreando el Boletín Oficial del Estado en busca de pisos e inmuebles residenciales cuyo valor de subasta se sitúe estrictamente entre los 100.000€ y los 200.000€.\n\nHemos seleccionado tres viviendas que cumplen con nuestros rigurosos criterios de inversión: ubicaciones con demanda de alquiler contrastada, valoraciones realistas y expedientes con un nivel de complejidad jurídica manejable. Estas operaciones están diseñadas para inversores que buscan construir patrimonio a largo plazo mediante la estrategia de "Buy and Hold", asegurando flujos de caja positivos desde el primer día gracias a un precio de adquisición imbatible. A continuación, desglosamos cada oportunidad, evaluando sus fortalezas, los riesgos inherentes al proceso y el perfil de inversor ideal para acometerlas.',
    auctionDetails: [
      {
        slug: 'subasta-sub-ja-2026-256456',
        subtitle: 'Rentabilidad sólida en el área metropolitana de Murcia',
        analysis: 'La pedanía de Torreagüera, a escasos minutos del centro de Murcia, representa un mercado de alquiler dinámico impulsado por familias y trabajadores que buscan precios más competitivos sin renunciar a la proximidad de la capital. Este piso sale a subasta con un valor de 106.894€ y una deuda reclamada de poco más de 54.000€. La relación entre el precio de adquisición potencial y las rentas de alquiler en la zona arroja proyecciones de rentabilidad bruta superiores al 8%. Es un activo de manual para la estrategia de generación de rentas, con un ticket de entrada muy accesible que permite a inversores primerizos entrar en el mercado sin necesidad de asumir un apalancamiento excesivo.',
        risks: 'Al tratarse de una pedanía, la liquidez del activo en caso de querer realizar una venta rápida (flipping) es menor que en el centro de la ciudad. Es fundamental comprobar el estado de conservación interior del inmueble, ya que las reformas estructurales podrían mermar significativamente el margen de beneficio esperado.',
        investorProfile: 'Perfil Conservador / Rentista. Ideal para inversores locales o nacionales que buscan construir una cartera de activos generadores de flujo de caja estable a largo plazo, priorizando la rentabilidad por dividendo (alquiler) frente a la apreciación especulativa del capital.'
      },
      {
        slug: 'subasta-sub-ja-2026-257355',
        subtitle: 'Vivienda familiar estratégica en el cinturón de Barcelona',
        analysis: 'El área metropolitana de Barcelona sufre una falta de oferta endémica. Municipios como Palau Solità i Plegamans absorben la demanda desplazada de la capital, garantizando una ocupación casi inmediata para cualquier inmueble en buen estado. Este activo, tasado y subastado por 118.884€, con una deuda de 82.933€, es una oportunidad excepcional para adquirir presencia en la provincia de Barcelona a un precio muy inferior a la media del mercado. La zona cuenta con excelentes comunicaciones y servicios, lo que asegura un perfil de inquilino estable y solvente. La operación permite capturar valor tanto por la vía del alquiler como por la apreciación natural del inmueble en un mercado con fuerte presión compradora.',
        risks: 'La deuda reclamada es relativamente alta respecto al valor de tasación (aprox. 70%), lo que significa que el margen para pujar a la baja es más estrecho. El acreedor defenderá su posición, por lo que la adjudicación requerirá una puja calculada y precisa, sin margen para errores en la estimación de costes adicionales.',
        investorProfile: 'Perfil Value / Estratégico. Inversores con conocimiento del mercado catalán que buscan activos defensivos. La alta demanda de la zona mitiga el riesgo de vacancia, haciéndolo ideal para estrategias patrimonialistas a largo plazo.'
      },
      {
        slug: 'subasta-sub-ja-2025-255645',
        subtitle: 'Activo refugio y versatilidad en el norte peninsular',
        analysis: 'Muriedas, en el municipio de Camargo, es una ubicación estratégica por su contigüidad con Santander y su excelente tejido industrial y comercial. Este piso en planta baja sale a subasta por 122.105€, con una deuda reclamada de solo 56.078€. La zona atrae a un perfil de residente trabajador y familiar, lo que se traduce en contratos de arrendamiento de larga duración y baja morosidad. Además, al ser una planta baja, podría tener atractivo para personas con movilidad reducida o incluso, dependiendo de la normativa municipal, potencial para cambio de uso. El amplio margen entre la deuda y la tasación ofrece un escudo protector contra posibles fluctuaciones del mercado inmobiliario local.',
        risks: 'Las plantas bajas a menudo presentan riesgos específicos como humedades por capilaridad o menor luminosidad, factores que deben evaluarse antes de pujar. Además, es crucial revisar los estatutos de la comunidad para confirmar que no existen restricciones severas sobre el uso del inmueble.',
        investorProfile: 'Perfil Diversificador / Rentista. Excelente oportunidad para inversores que buscan descorrelacionar sus carteras de los mercados más volátiles (Madrid/Barcelona) e invertir en zonas con fundamentales económicos sólidos y menor competencia en las subastas.'
      }
    ],
    conclusion: 'La adquisición de vivienda en la franja de los 100.000€ a 200.000€ a través de subastas públicas se confirma como una de las estrategias más sólidas para batir a la inflación y generar riqueza real en el entorno económico actual. Como hemos visto en estos tres ejemplos, el territorio nacional ofrece oportunidades diversificadas, desde el dinamismo metropolitano de Barcelona y Murcia hasta la estabilidad industrial de Cantabria.\n\nNo obstante, la democratización del acceso a la información ha incrementado la concurrencia en este segmento de precios. Para triunfar, el inversor debe abandonar la improvisación y adoptar un enfoque analítico y profesional. Esto implica dominar la lectura de edictos, comprender la prelación de cargas registrales y, sobre todo, establecer un límite de puja inamovible basado en números fríos y no en la emoción del momento. Le animamos a utilizar nuestras herramientas de cálculo de rentabilidad para simular diferentes escenarios de adjudicación y asegurar que su próxima inversión cumpla con sus objetivos financieros.',
    publishDate: '2026-03-22',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80'
  }
};
