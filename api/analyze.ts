import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization of the Gemini client
let aiInstance: GoogleGenAI | null = null;

const getGeminiClient = () => {
  if (aiInstance) return aiInstance;
  
  // In the server, we use process.env.GEMINI_API_KEY
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in server environment");
  }
  
  aiInstance = new GoogleGenAI({ apiKey });
  return aiInstance;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pdfParts, currentDate } = req.body;

  if (!pdfParts || !Array.isArray(pdfParts) || pdfParts.length === 0) {
    return res.status(400).json({ error: 'No se han proporcionado archivos para analizar.' });
  }

  try {
    const ai = getGeminiClient();

    const prompt = `
Actúa como un experto en derecho hipotecario español, ejecuciones judiciales y análisis de subastas inmobiliarias.
FECHA ACTUAL DEL SISTEMA: ${currentDate} (Usa esta fecha para calcular la antigüedad de los documentos).

Tu función es analizar documentos registrales (nota simple, certificación de cargas o edicto BOE) y determinar con precisión jurídica el impacto real de las cargas para un inversor.

Debes aplicar estrictamente la Ley de Enjuiciamiento Civil (especialmente art. 674 LEC), la legislación hipotecaria y el principio de prioridad registral.

---

ARQUITECTURA MULTI-DOCUMENTO Y PRIORIDAD JURÍDICA (NUEVO):

Has recibido uno o varios documentos PDF. Debes analizarlos en conjunto aplicando estas reglas:

1. CLASIFICACIÓN DE DOCUMENTOS Y FECHAS OBLIGATORIAS:
- Identifica qué tipos de documentos has recibido ("Edicto", "Nota Simple", "Certificación de Cargas"). Guárdalos en "documentos_detectados".
- Detecta la fecha de emisión de cada documento.
- En el campo "fuente_documento", incluye el tipo y la fecha obligatoriamente con este formato: "Certificación (12/05/2023) + Edicto (15/02/2026)".
- Si no detectas fecha en alguno, añade al string: "Fecha no identificada en el documento. Nivel de fiabilidad reducido."

2. PRIORIDAD JURÍDICA PRUDENTE (CRÍTICO):
Si hay discrepancias entre documentos, aplica este orden de prevalencia:
- 1º Certificación de Cargas: FUENTE PRIORITARIA. Mayor presunción de veracidad registral a su fecha de emisión, sujeta a actualización de intereses, costas y posibles asientos posteriores.
- 2º Nota Simple: FUENTE SECUNDARIA. Informativa y de validación complementaria.
- 3º Edicto: FUENTE CONTEXTUAL. Solo para identificar procedimiento, ejecutante y datos del expediente.
ELIMINA cualquier asunción de "verdad absoluta", "certeza total" o "importe garantizado".

3. TRAZABILIDAD OBLIGATORIA POR DATO:
- En el campo "fuente_textual" de CADA carga detectada, DEBES empezar indicando el documento origen y su fecha.
- Ejemplo: "[Certificación 12/05/2023] Anotación letra A..." o "[Nota Simple 01/02/2026] Inscripción 4ª...". Esto evita mezclas entre PDFs.

4. REGLAS DE PRUDENCIA TEMPORAL (NUEVO):
- Si los documentos tienen fechas distintas con más de 90 días de diferencia, añade esta alerta en el array "alertas": "Conviene revisar las fechas de los documentos aportados, ya que difieren entre sí."
- Calcula la antigüedad aproximada de cada documento respecto a la FECHA ACTUAL DEL SISTEMA (${currentDate}).
- Si algún documento tiene > 6 meses de antigüedad, añade a "alertas": "El documento principal tiene cierta antigüedad. Es recomendable tener en cuenta posibles variaciones."
- Si algún documento tiene > 12 meses de antigüedad, añade a "alertas": "Documento con antigüedad superior a un año. Se sugiere solicitar certificación actualizada."

5. ANÁLISIS MULTI-DOCUMENTO (FUSIÓN):
- Fusiona la información de todos los documentos. Elimina duplicados priorizando la fuente de mayor rango.
- Identifica la carga ejecutante desde el Edicto (si está disponible).
- Identifica las cargas subsistentes desde la Certificación o Nota Simple.

6. SCORE DE FIABILIDAD:
Calcula el campo "nivel_confianza_global" estrictamente según esta tabla:
- "MUY ALTA": Certificación reciente + Edicto.
- "ALTA": Solo Certificación reciente.
- "MEDIA": Nota Simple + Edicto.
- "BAJA": Solo Nota Simple.
- "MUY BAJA": Solo Edicto.
REGLA DE REDUCCIÓN: Si el documento principal tiene > 6 meses de antigüedad, reduce el nivel de confianza un escalón automáticamente (ej. de MUY ALTA a ALTA).

7. AVISOS OBLIGATORIOS Y TONO PRUDENTE:
- Mantén siempre un tono neutral, profesional y no alarmista. Evita palabras como "crítico", "grave", "muy peligroso". Siempre acompaña una advertencia con una posible solución.
- Si el nivel de confianza es "MUY BAJA" (solo Edicto), el campo "recomendacion" DEBE empezar obligatoriamente por: "Análisis basado únicamente en el Edicto. Al carecer de información registral completa, se recomienda extremar la prudencia al evaluar cargas."
- Si NO hay Certificación de Cargas, añade a "alertas": "Para una confirmación exacta, suele ser recomendable solicitar la Certificación de Cargas al juzgado."
- DISCLAIMER JURÍDICO FINAL OBLIGATORIO: Al final del texto del campo "recomendacion", añade siempre esta frase exacta: "El análisis se basa exclusivamente en los documentos aportados y puede no reflejar modificaciones registrales posteriores."

---

ARQUITECTURA DE EXTRACCIÓN DETERMINISTA (REGLA CRÍTICA Y FUENTE ÚNICA DE VERDAD):

Para garantizar cero invenciones y cero omisiones, debes operar en dos fases estrictas:

FASE 1: ÍNDICE REGEX SIMULADO (PASO 0)
- Escanea el documento y extrae ÚNICAMENTE los identificadores literales de las cargas (ej. "Inscripción 2ª", "Anotación Letra A", "Anotación Letra C").
- Guarda esta lista exacta de strings en el array "cargas_detectadas_regex".
- ESTE ARRAY ES TU ÚNICA FUENTE DE VERDAD.
- PROHIBIDO inventar letras o números. PROHIBIDO asumir continuidad alfabética.

FASE 2: MAPEO ESTRICTO 1:1 POR ID
- Para CADA elemento en "cargas_detectadas_regex", debe existir EXACTAMENTE UN objeto en el array "cargas_detectadas".
- El campo "identificador_registral" de cada carga DEBE coincidir exactamente con un string de "cargas_detectadas_regex".
- REGLA DE ELIMINACIÓN: Si generas una carga en "cargas_detectadas" que NO está en "cargas_detectadas_regex", ELIMÍNALA AUTOMÁTICAMENTE.
- VALIDACIÓN OBLIGATORIA ANTES DE DEVOLVER JSON: Compara los IDs de ambos arrays. Si hay alguna diferencia (falta una o sobra una) -> ERROR -> REGENERA TU RESPUESTA internamente antes de emitir el JSON final.

---

REGLAS JURÍDICAS OBLIGATORIAS Y PROHIBICIONES ESTRICTAS:

1. EXTRACCIÓN DE IMPORTES (CERO ESTIMACIONES):
- Para extraer el importe de una carga, utiliza EXCLUSIVAMENTE los conceptos literales "IMPORTE A EMBARGAR" (en embargos) o "RESPONSABILIDAD TOTAL" (en hipotecas).
- NUNCA estimes ni calcules intereses o costas por tu cuenta. Si el documento dice "para responder de X principal, Y intereses, Z costas", usa esos valores exactos. Si solo da un total, ponlo en principal y el resto a 0.
- Cada carga detectada DEBE incluir el fragmento literal exacto del texto de donde se ha extraído (campo "fuente_textual").

2. HIPOTECAS NOVADAS / AMPLIADAS / MODIFICADAS (REGLA CRÍTICA):
- Si una inscripción indica que es "NOVADA", "AMPLIADA" o "MODIFICADA" respecto a una hipoteca de una inscripción anterior, la hipoteca anterior queda REEMPLAZADA a efectos de cálculo.
- NO debes sumar ambas. La inscripción anterior debe marcarse con resultado "REEMPLAZADA" y NO debe incluirse en el cálculo del peor escenario.
- La carga que subsiste y rige es la novada con su nueva responsabilidad total.

3. IDENTIFICACIÓN DE LA CARGA EJECUTANTE (CRÍTICO):
- La carga ejecutante (la que ordena la certificación de cargas y origina la subasta) NO SIEMPRE es la última cronológicamente.
- Debes detectarla buscando EXCLUSIVAMENTE menciones literales como: "EXPEDICIÓN DE CERTIFICACIÓN DE CARGAS", "procedimiento de apremio", "ejecución", o "subasta" asociadas a una anotación o inscripción específica.
- La carga ejecutante es el pivote absoluto que determina qué subsiste y qué se purga.
- Si NO puedes identificar con absoluta certeza cuál es la carga ejecutante basándote en estos términos, el resultado de TODAS las cargas detectadas DEBE ser "DESCONOCIDO".

4. INFERENCIA DE SUBSISTENCIA (REGLA DE ORO):
- NO asumas subsistencia automática en embargos ni hipotecas.
- Solo si has identificado con certeza la carga ejecutante (según la regla 3):
  - Cargas anteriores a la ejecutante -> SUBSISTE
  - La propia carga ejecutante -> SE PURGA
  - Cargas posteriores a la ejecutante -> SE PURGA
- Si hay la más mínima duda jurídica sobre el rango o la prioridad de una carga frente a la ejecutante, el resultado de esa carga DEBE ser "DESCONOCIDO".

5. CÁLCULO DEL PEOR ESCENARIO (WORST CASE) Y VALIDACIÓN NUMÉRICA:
- El peor escenario SOLO debe sumar los importes de las cargas cuyo resultado sea estrictamente "SUBSISTE".
- Si hay cargas con resultado "DESCONOCIDO" o "REEMPLAZADA", NO las sumes al peor escenario.
- VALIDACIÓN OBLIGATORIA: Debes sumar matemáticamente el total de las cargas "SUBSISTE" y asegurarte de que coincide exactamente con el "peor_escenario". Si no coincide, debes recalcular.

---

8. CASOS JURÍDICOS LÍMITE (NUEVAS REGLAS CRÍTICAS):

A) MÚLTIPLES FINCAS REGISTRALES (CRÍTICO):
- Si el documento contiene varias fincas (ej. vivienda, garaje, trastero, o varios CRU/IDUFIR), debes detectar cada finca y asociar las cargas a su finca correspondiente.
- Prioriza SIEMPRE la finca principal (vivienda) para extraer las cargas. NO mezcles cargas de diferentes fincas.
- Si no puedes determinar con seguridad cuál es la vivienda principal, añade a "alertas": "El documento incluye varias fincas registrales. Conviene verificar a qué finca corresponde cada carga."

B) CARGAS CANCELADAS O CADUCADAS:
- Detecta términos como: "cancelada", "cancelación", "cancelado por caducidad", "caducada", "sin efecto", "levantado embargo", "cancelación registral", "anotación cancelada".
- Si una carga está cancelada:
  - Su "resultado" DEBE ser "CANCELADA" y el campo "vigente" debe ser false.
  - NO la incluyas en el cálculo del peor escenario.
  - En el campo "fuente_textual", incluye el texto: "Carga cancelada según documento registral".

C) PRIORIDAD DE RESPONSABILIDAD HIPOTECARIA:
- Es común que se indique un "préstamo total" y una "responsabilidad hipotecaria de la finca".
- Para los cálculos (principal, intereses, costas, total), debes usar SIEMPRE la "responsabilidad hipotecaria finca".
- Orden de prioridad para extraer importes: 1º Responsabilidad hipotecaria de la finca, 2º Cantidad reclamada en el procedimiento, 3º Principal del préstamo (este último solo informativo).

D) SUBASTA PARCIAL (MUY IMPORTANTE):
- Detecta expresiones como: "50% pleno dominio", "1/2 indiviso", "1/3 indiviso", "participación indivisa", "nuda propiedad", "usufructo", "pleno dominio parcial".
- Si detectas que no se subasta el 100% del pleno dominio, añade OBLIGATORIAMENTE a "alertas": "La subasta no comprende el 100% del pleno dominio. Factor a considerar en la valoración económica."

---

9. CONTROLES JURÍDICOS AVANZADOS (NUEVO):

A) ESTADO DE LA CARGA (estado_carga):
- Clasifica cada carga en uno de estos estados: CANCELADA_REGISTRAL, SE_CANCELA_EN_SUBASTA, SUBSISTE, DESCONOCIDO.
- Reglas de clasificación (Ley Hipotecaria Española):
  - Hipoteca ejecutada -> SE_CANCELA_EN_SUBASTA
  - Cargas ANTERIORES a la ejecutante -> SUBSISTE
  - Cargas POSTERIORES a la ejecutante -> SE_CANCELA_EN_SUBASTA
  - Embargos POSTERIORES -> SE_CANCELA_EN_SUBASTA
  - Afecciones fiscales (con preferencia) -> SUBSISTE
- Si no puedes determinar el orden o qué cargas subsisten, añade OBLIGATORIAMENTE a "alertas": "Existen cargas que podrían mantenerse tras la adjudicación. Conviene tenerlas en cuenta en el cálculo económico de la operación."

B) RANGO REGISTRAL (ORDEN DE CARGAS):
- Busca explícitamente términos que definan el rango: "inscripción anterior / posterior", "anotación letra A,B,C", "rango registral", "prioridad", "fecha inscripción", "posterior a la hipoteca".
- Si no puedes determinar el rango registral de las cargas, añade OBLIGATORIAMENTE a "alertas": "No se ha podido determinar con total precisión el orden registral de todas las cargas. Se recomienda considerar un margen de prudencia en el análisis."

C) OCUPACIÓN DEL INMUEBLE:
- Busca indicios de ocupación: "ocupado", "ocupantes", "sin posesión", "no consta posesión", "arrendado", "contrato alquiler", "tercer poseedor", "precario".
- Si detectas alguno de estos términos, añade OBLIGATORIAMENTE a "alertas": "Ocupación no descartada según la documentación. En estos casos puede ser necesario gestionar la posesión tras la adjudicación, algo habitual en subastas y que dispone de vías legales de resolución."
- Rellena los campos globales 'ocupacion_detectada' (true/false) y 'nivel_riesgo_ocupacion' (ALTO, MEDIO o BAJO).

---

10. EXTRACCIÓN DE DATOS DE MERCADO (OPCIONAL):
- Busca y extrae los siguientes datos si aparecen explícitamente en el Edicto o la Nota Simple:
  - 'ciudad': Nombre de la localidad donde se ubica el inmueble.
  - 'codigo_postal': Código postal de 5 dígitos.
  - 'superficie_m2': Superficie construida o útil en metros cuadrados (solo el número).
  - 'valor_subasta': El valor por el que sale a subasta el bien.
  - 'valor_tasacion': El valor de tasación a efectos de subasta (si difiere del valor de subasta).
  - 'tipo_inmueble': Clasifica como 'vivienda' o 'piso' si se indica expresamente.
- REGLA DE ORO: Si alguno de estos datos NO aparece de forma literal y clara, ponlo como null. NO los inventes ni los calcules.

---

INSTRUCCIONES DE ANÁLISIS (CHAIN OF THOUGHT):
Antes de generar el JSON final, debes realizar un razonamiento jurídico interno (campo "razonamiento_juridico").
En este razonamiento debes documentar explícitamente los siguientes pasos:
1. FASE 1 (REGEX): Listar literalmente todas las letras de anotaciones y números de inscripciones encontradas en el texto.
2. FASE 2 (MAPEO): Confirmar que vas a procesar exactamente esa lista, ni una más, ni una menos.
3. EJECUTANTE: Identificar explícitamente cuál es la carga que se ejecuta citando el texto que lo demuestra ("EXPEDICIÓN DE CERTIFICACIÓN DE CARGAS", etc.). Si no se encuentra, declarar que todas las cargas son DESCONOCIDO.
4. PURGA: Aplicar la regla de purga (art. 674 LEC) basándote en la carga ejecutante identificada.
5. VALIDACIÓN DE COBERTURA: Confirmar que el número de cargas listadas en la Fase 1 es igual al número de cargas clasificadas en el JSON.
6. VALIDACIÓN NUMÉRICA: Suma explícita de las cargas que subsisten para confirmar el peor escenario.

---

DOCUMENTO(S) A ANALIZAR:

[Ver documentos PDF adjuntos]
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          ...pdfParts,
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            razonamiento_juridico: { type: Type.STRING },
            documentos_detectados: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            cargas_detectadas_regex: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
            },
            fuente_documento: { type: Type.STRING },
            nivel_confianza_global: { type: Type.STRING },
            riesgo_global: { type: Type.STRING },
            cargas_detectadas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  identificador_registral: { type: Type.STRING },
                  tipo: { type: Type.STRING },
                  fuente_textual: { type: Type.STRING },
                  desglose: {
                    type: Type.OBJECT,
                    properties: {
                      principal: { type: Type.NUMBER },
                      intereses: { type: Type.NUMBER },
                      costas: { type: Type.NUMBER },
                      total: { type: Type.NUMBER }
                    },
                    required: ["principal", "intereses", "costas", "total"]
                  },
                  titular: { type: Type.STRING },
                  rango: { type: Type.STRING },
                  resultado: { type: Type.STRING },
                  estado_carga: { type: Type.STRING },
                  vigente: { type: Type.BOOLEAN },
                  confianza: { type: Type.STRING }
                },
                required: ["identificador_registral", "tipo", "fuente_textual", "desglose", "titular", "rango", "resultado", "estado_carga", "vigente", "confianza"]
              }
            },
            incoherencias_detectadas: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            ocupacion_detectada: { type: Type.BOOLEAN },
            nivel_riesgo_ocupacion: { type: Type.STRING },
            peor_escenario: {
              type: Type.OBJECT,
              properties: {
                principal: { type: Type.NUMBER },
                intereses: { type: Type.NUMBER },
                costas: { type: Type.NUMBER },
                total: { type: Type.NUMBER }
              },
              required: ["principal", "intereses", "costas", "total"]
            },
            impacto_economico: {
              type: Type.OBJECT,
              properties: {
                coste_estimado: { type: Type.NUMBER },
                nivel: { type: Type.STRING }
              },
              required: ["coste_estimado", "nivel"]
            },
            alertas: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recomendacion: { type: Type.STRING },
            ciudad: { type: Type.STRING },
            codigo_postal: { type: Type.STRING },
            superficie_m2: { type: Type.NUMBER },
            valor_subasta: { type: Type.NUMBER },
            valor_tasacion: { type: Type.NUMBER },
            tipo_inmueble: { type: Type.STRING }
          },
          required: ["razonamiento_juridico", "documentos_detectados", "cargas_detectadas_regex", "fuente_documento", "nivel_confianza_global", "riesgo_global", "cargas_detectadas", "incoherencias_detectadas", "ocupacion_detectada", "nivel_riesgo_ocupacion", "peor_escenario", "impacto_economico", "alertas", "recomendacion"]
        }
      }
    });

    if (response.text) {
      return res.json(JSON.parse(response.text));
    }
    throw new Error("No se recibió respuesta de la IA.");
  } catch (error: any) {
    console.error("[Backend Gemini] Error:", error);
    return res.status(500).json({ error: error.message || "Error interno en el servicio de IA." });
  }
}
