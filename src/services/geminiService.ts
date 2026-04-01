export const analyzeDocumentWithAI = async (files: File[]) => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  if (!files || files.length === 0) {
    throw new Error("No se han proporcionado archivos para analizar.");
  }

  // Convert all Files to base64 parts
  const pdfParts = await Promise.all(files.map(async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64EncodeString = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      console.log(`[GeminiService] Preparando archivo: ${file.name} (${file.size} bytes)`);
      
      return {
        inlineData: {
          data: base64EncodeString,
          mimeType: "application/pdf"
        }
      };
    } catch (err) {
      console.error(`[GeminiService] Error al procesar el archivo ${file.name}:`, err);
      throw new Error(`Error al leer el archivo ${file.name}. Asegúrate de que es un PDF válido.`);
    }
  }));

  console.log(`[GeminiService] --- INICIANDO ANÁLISIS CON PROXY SERVIDOR (${files.length} archivos) ---`);

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfParts,
        currentDate
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error en el servidor: ${response.status}`);
    }

    const result = await response.json();
    console.log("[GeminiService] --- ANÁLISIS COMPLETADO ---");
    console.log("[GeminiService] Documentos detectados por IA:", result.documentos_detectados);
    console.log("[GeminiService] Nivel de confianza:", result.nivel_confianza_global);
    return result;
  } catch (error: any) {
    console.error("[GeminiService] Error calling Proxy API:", error);
    const errorMessage = error.message || "Error desconocido en el servicio de IA.";
    throw new Error(errorMessage);
  }
};
