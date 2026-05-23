import * as XLSX from "xlsx";

export function parseExcel(buffer: Buffer) {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const sheetNames = workbook.SheetNames;

  const parsedSheets = sheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet);

    return {
      sheetName,
      data,
    };
  });

  return parsedSheets;
}
