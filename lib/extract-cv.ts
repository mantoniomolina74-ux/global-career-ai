import pdfParse from "pdf-parse";

export async function extractCVText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);

    const text = data.text;

    if (!text || text.trim().length === 0) {
      throw new Error("PDF no contiene texto legible");
    }

    return text.trim();
  } catch (error: unknown) {
    console.error("PDF EXTRACT ERROR:", error);
    throw new Error("Error extrayendo texto del PDF");
  }
}