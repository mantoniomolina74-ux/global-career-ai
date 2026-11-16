import pdfParse from "pdf-parse";

export async function extractCVText(
  fileUrl: string
): Promise<string> {
  try {
    // 1. Descargar archivo desde Supabase Storage
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(
        `No se pudo descargar el CV: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer =
      await response.arrayBuffer();

    // 2. Extraer texto real del PDF
    const pdfBuffer =
      Buffer.from(arrayBuffer);

    const parsed =
      await pdfParse(pdfBuffer);

    // 3. Limpieza básica del texto extraído
    const cleanedText =
      parsed.text
        .replace(/\s+/g, " ")
        .trim();

    return cleanedText;
  } catch (error: unknown) {
    console.error(
      "CV EXTRACTION ERROR:",
      error
    );

    return "";
  }
}