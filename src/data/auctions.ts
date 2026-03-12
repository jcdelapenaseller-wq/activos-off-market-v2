export interface AuctionData {
  propertyType?: string;
  city?: string;
  zone?: string;
  address?: string;
  appraisalValue?: number;
  claimedDebt?: number;
  procedureType?: string;
  surface?: number;
  occupancy?: string;
  marketPriceM2?: number;
  marketPriceM2Min?: number;
  marketPriceM2Max?: number;
  description?: string;
  boeId?: string;
  boeUrl?: string;
}

export const AUCTIONS: Record<string, AuctionData> = {
  'piso-subasta-madrid-centro': {
    propertyType: "Piso",
    city: "Madrid",
    zone: "Centro",
    address: "Centro",
    appraisalValue: 180000,
    claimedDebt: 90000,
    procedureType: "Ejecución hipotecaria",
    surface: 75,
    occupancy: "Desconocido",
    marketPriceM2: 4200,
    boeId: "SUB-JA-2024-123456",
    boeUrl: "https://subastas.boe.es/detalle_subasta.php?idSub=SUB-JA-2024-123456"
  },
  'piso-subasta-valencia-poeta-mas-y-ros': {
    propertyType: "Piso",
    city: "Valencia",
    zone: "Poeta Mas y Ros",
    address: "Poeta Mas y Ros",
    appraisalValue: 174435,
    claimedDebt: 184767,
    procedureType: "Ejecución hipotecaria",
    occupancy: "No indicada",
    marketPriceM2Min: 2800,
    marketPriceM2Max: 3500,
    description: "Ubicación estratégica cerca de la zona universitaria y las playas. El edicto indica que no es la vivienda habitual del ejecutado. Umbrales de adjudicación estimados: 50% (~87.000€) y 70% (~122.000€). Activo muy interesante por el dinámico mercado de alquiler de la zona y perfil inversor.",
    boeId: "SUB-JA-2024-789012",
    boeUrl: "https://subastas.boe.es/detalle_subasta.php?idSub=SUB-JA-2024-789012"
  },
  'apartamento-subasta-madrid-chamberi-breton-de-los-herreros': {
    propertyType: "Apartamento",
    city: "Madrid",
    zone: "Chamberí",
    address: "Bretón de los Herreros",
    appraisalValue: 368220,
    claimedDebt: 129963,
    procedureType: "Ejecución hipotecaria",
    surface: 41,
    occupancy: "No indicada",
    marketPriceM2Min: 7000,
    marketPriceM2Max: 9000,
    description: "Excelente ubicación en la calle Bretón de los Herreros, en pleno corazón de Chamberí, entre Ríos Rosas y Nuevos Ministerios. Zona de altísima liquidez inmobiliaria. Presenta una estructura de cargas particular con un acreedor no típico bancario. Subasta abierta hasta el 23 de marzo.",
    boeId: "SUB-JA-2024-345678",
    boeUrl: "https://subastas.boe.es/detalle_subasta.php?idSub=SUB-JA-2024-345678"
  },
  'piso-subasta-madrid-chamartin-costa-rica-28': {
    propertyType: "Piso",
    city: "Madrid",
    zone: "Chamartín",
    address: "Costa Rica 28",
    appraisalValue: 286886,
    claimedDebt: 78196,
    procedureType: "Ejecución hipotecaria AEAT",
    surface: 82,
    occupancy: "No indicada",
    marketPriceM2Min: 5500,
    marketPriceM2Max: 7000,
    description: "Inmueble situado en la Calle Costa Rica 28, en una zona muy líquida de Chamartín. El rango de mercado estimado para pisos similares en la zona oscila entre 450.000€ y 550.000€ dependiendo del estado de reforma. Situación posesoria no indicada. Se recomienda revisar el comportamiento del ejecutante. La subasta finaliza el 12 de marzo a las 18:00.",
    boeId: "SUB-JA-2024-901234",
    boeUrl: "https://subastas.boe.es/detalle_subasta.php?idSub=SUB-JA-2024-901234"
  },
  'vivienda-subasta-madrid-doctor-esquerdo': {
    propertyType: "Vivienda",
    city: "Madrid",
    zone: "Doctor Esquerdo",
    address: "Doctor Esquerdo",
    appraisalValue: 358000,
    procedureType: "AEAT Apremio",
    description: "Subasta de la Agencia Tributaria (AEAT) por apremio. Se trata de una vivienda en la zona consolidada de Doctor Esquerdo (6ª planta). En subastas AEAT, si la mejor oferta es ≥ 50% del tipo, la adjudicación es automática; de lo contrario, decide la Mesa. El análisis destaca la presencia de una hipoteca anterior en la nota simple: la rentabilidad real depende críticamente de si esta carga está económicamente cancelada o no. Valor de mercado estimado en la zona para pisos similares reformados: entre 400.000€ y 460.000€.",
    boeId: "SUB-AT-2024-23R4586001244",
    boeUrl: "https://subastas.boe.es/reg/detalleSubasta.php?idSub=SUB-AT-2024-23R4586001244"
  }
};
