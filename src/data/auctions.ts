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
  publishedAt?: string; // ISO date string
  slug?: string;
  auctionDate?: string;
  discount?: number;
  pricePerM2?: number;
}

export const AUCTIONS: Record<string, AuctionData> = {
  'subasta-sub-ja-2023-223768': {
    propertyType: "URBANA Planta baja compuesta de tres habitaciones, cocina, coedor y aseo. Superifice aproximada 81 metros cuadrados",
    address: "Carrer de Salvat Papasseït, 70",
    appraisalValue: 343500,
    procedureType: "JUZGADO 1ª INST E INSTRUCC. 6",
    surface: undefined,
    description: "(Referencia SUB-JA-2023-223768) | Depósito: 17175€",
    boeId: "SUB-JA-2023-223768",
    boeUrl: "https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2023-223768&idBus=NW5oQ0dSSTlWYUJKVDJzSHZKbFlKZmp4RHZhcVYzZzlkaTV2STZORmpNNmNyZnV5ZkxZTkJISTR1TjNIMENoSGdQSHlNRkErRm52aG1xMkFVNjFBbEZ4QXc4eTJQck9PL2NEUHNuRktHRFAyc0Z2cFdOam4xWUxsUGYyTE9CRlZ0TkduRTN0MURqamZWVGhMcHVhK2FMQU1iWGoxQzF1RHNyS05UNytQT2xOcVcyelNYbm9QTXlkKzlCc242cXVQbmd2Q0lTTVRtQ0VtQmVvVjhPVXVIcDBFcGRSRFhEVDFwc1VHTWNsTm5CNENnbDJLS3RpNy90bDRIY2o2cUw1U1F0RUx2cGJjMEhPWnZsQU9ETVR0WlJWK0dnaXpGL0ZUN1lzT1BtQ0tKUmlmWEo3ZlpiM2Vuc1A4V0NWQ0U3TW5TS2YzMTRzY0JtcUNiei9YaDZYZFNaOG1qUnJFYlhRL1MzdEFiVTBWVGFRPQ,,--50",
    publishedAt: "2026-03-16T20:00:25.949Z",
    auctionDate: "2026-04-02"
  },
  'subasta-sub-ja-2025-243347': {
    propertyType: "Inmueble",
    description: "(Referencia SUB-JA-2025-243347)",
    appraisalValue: 13588.61,
    procedureType: "JUZGADO 1 INSTANCIA 7",
    boeId: "SUB-JA-2025-243347",
    boeUrl: "https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2025-243347&idBus=NW5oQ0dSSTlWYUJKVDJzSHZKbFlKZmp4RHZhcVYzZzlkaTV2STZORmpNNmNyZnV5ZkxZTkJISTR1TjNIMENoSGdQSHlNRkErRm52aG1xMkFVNjFBbEZ4QXc4eTJQck9PL2NEUHNuRktHRFAyc0Z2cFdOam4xWUxsUGYyTE9CRlZ0TkduRTN0MURqamZWVGhMcHVhK2FMQU1iWGoxQzF1RHNyS05UNytQT2xOcVcyelNYbm9QTXlkKzlCc242cXVQbmd2Q0lTTVRtQ0VtQmVvVjhPVXVIcDBFcGRSRFhEVDFwc1VHTWNsTm5CNENnbDJLS3RpNy90bDRIY2o2cUw1U1F0RUx2cGJjMEhPWnZsQU9ETVR0WlJWK0dnaXpGL0ZUN1lzT1BtQ0tKUmlmWEo3ZlpiM2Vuc1A4V0NWQ0U3TW5TS2YzMTRzY0JtcUNiei9YaDZYZFNaOG1qUnJFYlhRL1MzdEFiVTBWVGFRPQ,,--50",
    publishedAt: "2026-03-16T19:45:19.473Z",
    auctionDate: "2026-04-02"
  },
  'subasta-sub-ja-2025-249469': {
    propertyType: "Inmueble",
    description: "(Referencia SUB-JA-2025-249469)",
    appraisalValue: 3148541.76,
    procedureType: "JUZGADO 1 INSTANCIA 1",
    boeId: "SUB-JA-2025-249469",
    boeUrl: "https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2025-249469&idBus=NW5oQ0dSSTlWYUJKVDJzSHZKbFlKZmp4RHZhcVYzZzlkaTV2STZORmpNNmNyZnV5ZkxZTkJISTR1TjNIMENoSGdQSHlNRkErRm52aG1xMkFVNjFBbEZ4QXc4eTJQck9PL2NEUHNuRktHRFAyc0Z2cFdOam4xWUxsUGYyTE9CRlZ0TkduRTN0MURqamZWVGhMcHVhK2FMQU1iWGoxQzF1RHNyS05UNytQT2xOcVcyelNYbm9QTXlkKzlCc242cXVQbmd2Q0lTTVRtQ0VtQmVvVjhPVXVIcDBFcGRSRFhEVDFwc1VHTWNsTm5CNENnbDJLS3RpNy90bDRIY2o2cUw1U1F0RUx2cGJjMEhPWnZsQU9ETVR0WlJWK0dnaXpGL0ZUN1lzT1BtQ0tKUmlmWEo3ZlpiM2Vuc1A4V0NWQ0U3TW5TS2YzMTRzY0JtcUNiei9YaDZYZFNaOG1qUnJFYlhRL1MzdEFiVTBWVGFRPQ,,--50",
    publishedAt: "2026-03-16T19:45:19.473Z",
    auctionDate: "2026-04-02"
  },
  'subasta-sub-ja-2025-252973': {
    propertyType: "Inmueble",
    description: "(Referencia SUB-JA-2025-252973)",
    appraisalValue: 168270.38,
    procedureType: "JUZGADO 1 INSTANCIA 8",
    boeId: "SUB-JA-2025-252973",
    boeUrl: "https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2025-252973&idBus=NW5oQ0dSSTlWYUJKVDJzSHZKbFlKZmp4RHZhcVYzZzlkaTV2STZORmpNNmNyZnV5ZkxZTkJISTR1TjNIMENoSGdQSHlNRkErRm52aG1xMkFVNjFBbEZ4QXc4eTJQck9PL2NEUHNuRktHRFAyc0Z2cFdOam4xWUxsUGYyTE9CRlZ0TkduRTN0MURqamZWVGhMcHVhK2FMQU1iWGoxQzF1RHNyS05UNytQT2xOcVcyelNYbm9QTXlkKzlCc242cXVQbmd2Q0lTTVRtQ0VtQmVvVjhPVXVIcDBFcGRSRFhEVDFwc1VHTWNsTm5CNENnbDJLS3RpNy90bDRIY2o2cUw1U1F0RUx2cGJjMEhPWnZsQU9ETVR0WlJWK0dnaXpGL0ZUN1lzT1BtQ0tKUmlmWEo3ZlpiM2Vuc1A4V0NWQ0U3TW5TS2YzMTRzY0JtcUNiei9YaDZYZFNaOG1qUnJFYlhRL1MzdEFiVTBWVGFRPQ,,--50",
    publishedAt: "2026-03-16T19:45:19.473Z",
    auctionDate: "2026-04-02"
  },
  'subasta-sub-ja-2025-255215': {
    propertyType: "Inmueble",
    description: "(Referencia SUB-JA-2025-255215)",
    appraisalValue: 112276.38,
    procedureType: "JUZGADO 1 INSTANCIA 48",
    boeId: "SUB-JA-2025-255215",
    boeUrl: "https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2025-255215&idBus=NW5oQ0dSSTlWYUJKVDJzSHZKbFlKZmp4RHZhcVYzZzlkaTV2STZORmpNNmNyZnV5ZkxZTkJISTR1TjNIMENoSGdQSHlNRkErRm52aG1xMkFVNjFBbEZ4QXc4eTJQck9PL2NEUHNuRktHRFAyc0Z2cFdOam4xWUxsUGYyTE9CRlZ0TkduRTN0MURqamZWVGhMcHVhK2FMQU1iWGoxQzF1RHNyS05UNytQT2xOcVcyelNYbm9QTXlkKzlCc242cXVQbmd2Q0lTTVRtQ0VtQmVvVjhPVXVIcDBFcGRSRFhEVDFwc1VHTWNsTm5CNENnbDJLS3RpNy90bDRIY2o2cUw1U1F0RUx2cGJjMEhPWnZsQU9ETVR0WlJWK0dnaXpGL0ZUN1lzT1BtQ0tKUmlmWEo3ZlpiM2Vuc1A4V0NWQ0U3TW5TS2YzMTRzY0JtcUNiei9YaDZYZFNaOG1qUnJFYlhRL1MzdEFiVTBWVGFRPQ,,--50",
    publishedAt: "2026-03-16T19:45:19.473Z",
    auctionDate: "2026-04-02"
  },
  'subasta-sub-ja-2026-258214': {
    propertyType: "Inmueble",
    description: "(Referencia SUB-JA-2026-258214)",
    appraisalValue: 178500,
    procedureType: "Sección Civil TI Sabadell. Plz.n 6",
    boeId: "SUB-JA-2026-258214",
    boeUrl: "https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2026-258214&idBus=NW5oQ0dSSTlWYUJKVDJzSHZKbFlKZmp4RHZhcVYzZzlkaTV2STZORmpNNmNyZnV5ZkxZTkJISTR1TjNIMENoSGdQSHlNRkErRm52aG1xMkFVNjFBbEZ4QXc4eTJQck9PL2NEUHNuRktHRFAyc0Z2cFdOam4xWUxsUGYyTE9CRlZ0TkduRTN0MURqamZWVGhMcHVhK2FMQU1iWGoxQzF1RHNyS05UNytQT2xOcVcyelNYbm9QTXlkKzlCc242cXVQbmd2Q0lTTVRtQ0VtQmVvVjhPVXVIcDBFcGRSRFhEVDFwc1VHTWNsTm5CNENnbDJLS3RpNy90bDRIY2o2cUw1U1F0RUx2cGJjMEhPWnZsQU9ETVR0WlJWK0dnaXpGL0ZUN1lzT1BtQ0tKUmlmWEo3ZlpiM2Vuc1A4V0NWQ0U3TW5TS2YzMTRzY0JtcUNiei9YaDZYZFNaOG1qUnJFYlhRL1MzdEFiVTBWVGFRPQ,,--50",
    publishedAt: "2026-03-16T19:45:19.473Z",
    auctionDate: "2026-04-02"
  },
  'subasta-sub-ja-2026-258618': {
    propertyType: "Inmueble",
    description: "(Referencia SUB-JA-2026-258618)",
    appraisalValue: 5290514.58,
    procedureType: "Sección Civil e Instruc TI Vilanova i la Geltrú. Plz.n 1",
    boeId: "SUB-JA-2026-258618",
    boeUrl: "https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2026-258618&idBus=NW5oQ0dSSTlWYUJKVDJzSHZKbFlKZmp4RHZhcVYzZzlkaTV2STZORmpNNmNyZnV5ZkxZTkJISTR1TjNIMENoSGdQSHlNRkErRm52aG1xMkFVNjFBbEZ4QXc4eTJQck9PL2NEUHNuRktHRFAyc0Z2cFdOam4xWUxsUGYyTE9CRlZ0TkduRTN0MURqamZWVGhMcHVhK2FMQU1iWGoxQzF1RHNyS05UNytQT2xOcVcyelNYbm9QTXlkKzlCc242cXVQbmd2Q0lTTVRtQ0VtQmVvVjhPVXVIcDBFcGRSRFhEVDFwc1VHTWNsTm5CNENnbDJLS3RpNy90bDRIY2o2cUw1U1F0RUx2cGJjMEhPWnZsQU9ETVR0WlJWK0dnaXpGL0ZUN1lzT1BtQ0tKUmlmWEo3ZlpiM2Vuc1A4V0NWQ0U3TW5TS2YzMTRzY0JtcUNiei9YaDZYZFNaOG1qUnJFYlhRL1MzdEFiVTBWVGFRPQ,,--50",
    publishedAt: "2026-03-16T19:45:19.473Z",
    auctionDate: "2026-04-02"
  },
  'subasta-sub-ja-2025-252655': {
    propertyType: "Inmueble",
    description: "(Referencia SUB-JA-2025-252655)",
    appraisalValue: 0,
    procedureType: "JUZGADO 1 INST E INSTRUCC. 4",
    boeId: "SUB-JA-2025-252655",
    boeUrl: "https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2025-252655&idBus=NW5oQ0dSSTlWYUJKVDJzSHZKbFlKZmp4RHZhcVYzZzlkaTV2STZORmpNNmNyZnV5ZkxZTkJISTR1TjNIMENoSGdQSHlNRkErRm52aG1xMkFVNjFBbEZ4QXc4eTJQck9PL2NEUHNuRktHRFAyc0Z2cFdOam4xWUxsUGYyTE9CRlZ0TkduRTN0MURqamZWVGhMcHVhK2FMQU1iWGoxQzF1RHNyS05UNytQT2xOcVcyelNYbm9QTXlkKzlCc242cXVQbmd2Q0lTTVRtQ0VtQmVvVjhPVXVIcDBFcGRSRFhEVDFwc1VHTWNsTm5CNENnbDJLS3RpNy90bDRIY2o2cUw1U1F0RUx2cGJjMEhPWnZsQU9ETVR0WlJWK0dnaXpGL0ZUN1lzT1BtQ0tKUmlmWEo3ZlpiM2Vuc1A4V0NWQ0U3TW5TS2YzMTRzY0JtcUNiei9YaDZYZFNaOG1qUnJFYlhRL1MzdEFiVTBWVGFRPQ,,--50",
    publishedAt: "2026-03-16T19:45:19.473Z",
    auctionDate: "2026-04-01"
  },
  'subasta-sub-ja-2026-252144': {
    propertyType: "Inmueble",
    description: "(Referencia SUB-JA-2026-252144)",
    appraisalValue: 327450,
    procedureType: "Sección Civil e Instrucción TI Martorell. Plz.n 1",
    boeId: "SUB-JA-2026-252144",
    boeUrl: "https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2026-252144&idBus=NW5oQ0dSSTlWYUJKVDJzSHZKbFlKZmp4RHZhcVYzZzlkaTV2STZORmpNNmNyZnV5ZkxZTkJISTR1TjNIMENoSGdQSHlNRkErRm52aG1xMkFVNjFBbEZ4QXc4eTJQck9PL2NEUHNuRktHRFAyc0Z2cFdOam4xWUxsUGYyTE9CRlZ0TkduRTN0MURqamZWVGhMcHVhK2FMQU1iWGoxQzF1RHNyS05UNytQT2xOcVcyelNYbm9QTXlkKzlCc242cXVQbmd2Q0lTTVRtQ0VtQmVvVjhPVXVIcDBFcGRSRFhEVDFwc1VHTWNsTm5CNENnbDJLS3RpNy90bDRIY2o2cUw1U1F0RUx2cGJjMEhPWnZsQU9ETVR0WlJWK0dnaXpGL0ZUN1lzT1BtQ0tKUmlmWEo3ZlpiM2Vuc1A4V0NWQ0U3TW5TS2YzMTRzY0JtcUNiei9YaDZYZFNaOG1qUnJFYlhRL1MzdEFiVTBWVGFRPQ,,--50",
    publishedAt: "2026-03-16T19:45:19.473Z",
    auctionDate: "2026-04-01"
  },
  'subasta-sub-ja-2026-258590': {
    propertyType: "Inmueble",
    description: "(Referencia SUB-JA-2026-258590)",
    appraisalValue: 0,
    procedureType: "Sección Civil e Instruc TI Vilanova i la Geltrú. Plz.n 1",
    boeId: "SUB-JA-2026-258590",
    boeUrl: "https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2026-258590&idBus=NW5oQ0dSSTlWYUJKVDJzSHZKbFlKZmp4RHZhcVYzZzlkaTV2STZORmpNNmNyZnV5ZkxZTkJISTR1TjNIMENoSGdQSHlNRkErRm52aG1xMkFVNjFBbEZ4QXc4eTJQck9PL2NEUHNuRktHRFAyc0Z2cFdOam4xWUxsUGYyTE9CRlZ0TkduRTN0MURqamZWVGhMcHVhK2FMQU1iWGoxQzF1RHNyS05UNytQT2xOcVcyelNYbm9QTXlkKzlCc242cXVQbmd2Q0lTTVRtQ0VtQmVvVjhPVXVIcDBFcGRSRFhEVDFwc1VHTWNsTm5CNENnbDJLS3RpNy90bDRIY2o2cUw1U1F0RUx2cGJjMEhPWnZsQU9ETVR0WlJWK0dnaXpGL0ZUN1lzT1BtQ0tKUmlmWEo3ZlpiM2Vuc1A4V0NWQ0U3TW5TS2YzMTRzY0JtcUNiei9YaDZYZFNaOG1qUnJFYlhRL1MzdEFiVTBWVGFRPQ,,--50",
    publishedAt: "2026-03-16T19:45:19.473Z",
    auctionDate: "2026-04-01"
  },
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
    boeUrl: "https://subastas.boe.es/detalle_subasta.php?idSub=SUB-JA-2024-123456",
    publishedAt: "2026-03-12T10:00:00Z"
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
    boeUrl: "https://subastas.boe.es/detalle_subasta.php?idSub=SUB-JA-2024-789012",
    publishedAt: "2026-03-11T15:30:00Z"
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
    boeUrl: "https://subastas.boe.es/detalle_subasta.php?idSub=SUB-JA-2024-345678",
    publishedAt: "2026-03-10T09:15:00Z"
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
    boeUrl: "https://subastas.boe.es/detalle_subasta.php?idSub=SUB-JA-2024-901234",
    publishedAt: "2026-03-08T12:00:00Z"
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
    boeUrl: "https://subastas.boe.es/reg/detalleSubasta.php?idSub=SUB-AT-2024-23R4586001244",
    publishedAt: "2026-03-05T17:45:00Z"
  },
  'vivienda-subasta-madrid-nuevos-ministerios-maria-de-guzman-45': {
    propertyType: "Vivienda",
    city: "Madrid",
    zone: "Nuevos Ministerios",
    address: "Calle de María de Guzmán, 45",
    appraisalValue: 200500,
    claimedDebt: 150750,
    procedureType: "Judicial vía de apremio",
    occupancy: "No consta",
    description: "Subasta judicial de vivienda en la calle María de Guzmán, zona de Nuevos Ministerios. El edicto no especifica la situación posesoria, lo cual es un factor de riesgo a considerar en la estrategia de puja. La deuda reclamada representa aproximadamente el 75% del valor de tasación. Se trata de una ubicación muy céntrica y demandada en Madrid, donde los valores de mercado suelen superar ampliamente los tipos de subasta. Se recomienda revisar posibles cargas preferentes y el estado real del inmueble.",
    boeId: "SUB-JA-2026-258334",
    boeUrl: "https://subastas.boe.es/reg/detalleSubasta.php?idSub=SUB-JA-2026-258334",
    publishedAt: "2026-03-13T18:52:47Z"
  },
  'test-subasta-madrid': {
    propertyType: "Pisos",
    city: "Madrid",
    zone: "Salamanca",
    address: "Calle Serrano 100",
    appraisalValue: 500000,
    claimedDebt: 200000,
    description: "Subasta de prueba para verificar generación de páginas.",
    boeUrl: "https://subastas.boe.es",
    publishedAt: "2026-03-16T00:00:00Z",
    slug: "test-subasta-madrid",
    auctionDate: "2026-04-15",
    discount: 60,
    pricePerM2: 5000
  }
};
