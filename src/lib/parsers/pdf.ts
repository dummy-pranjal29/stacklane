import PDFParser from "pdf2json";

export async function parsePDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser(undefined, true);

      pdfParser.on("pdfParser_dataError", (error: unknown) => {
        console.error("PDF2JSON parsing error:", error);

        try {
          const text = buffer.toString(
            "utf-8",
            0,
            Math.min(buffer.length, 10000),
          );
          const readableText = text.replace(/[^\x20-\x7E\n\r]/g, " ");
          if (readableText.trim().length > 0) {
            console.warn("Using fallback text extraction from PDF buffer");
            resolve(readableText);
          } else {
            console.warn("Could not parse PDF, returning empty text");
            resolve("");
          }
        } catch (fallbackError) {
          console.error("Fallback extraction failed:", fallbackError);
          resolve("");
        }
      });

      pdfParser.on("pdfParser_dataReady", () => {
        try {
          const text = pdfParser.getRawTextContent();
          resolve(text || "");
        } catch (error) {
          console.error("Error extracting text from parsed PDF:", error);
          resolve("");
        }
      });

      pdfParser.parseBuffer(buffer);
    } catch (error) {
      console.error("PDF parsing exception:", error);
      reject(error);
    }
  });
}
