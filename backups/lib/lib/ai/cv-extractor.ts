export async function extractCVText(fileUrl: string): Promise<string> {
  try {
    // 1. Descargar archivo desde Supabase Storage
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error("No se pudo descargar el CV");
    }

    const arrayBuffer = await response.arrayBuffer();

    // 2. Convertir a texto básico (MVP)
    // ⚠️ Esto es versión inicial, luego lo mejoramos con pdf-parse
    const text = Buffer.from(arrayBuffer).toString("utf-8");

    // 3. Limpieza básica
    const cleanedText = text
      .replace(/[^\x20-\x7E\n]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return cleanedText;
  } catch (error: any) {
    console.error("CV EXTRACTION ERROR:", error);
    return "";
  }
}