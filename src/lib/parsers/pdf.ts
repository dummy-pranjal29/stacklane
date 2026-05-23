import pdfParse from "pdf-parse";

export async function parsePDF(buffer: Buffer) {
  const data = await pdfParse(buffer);

  return data.text;
}
