type ExtractedPDFRecord = {
  Vendor?: string;

  Amount?: number;

  Currency?: string;

  Date?: string;

  Description?: string;
};

function extractVendor(text: string): string {
  const vendorPatterns = [
    /Vendor:\s*(.+)/i,
    /Merchant:\s*(.+)/i,
    /Supplier:\s*(.+)/i,
  ];

  for (const pattern of vendorPatterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return "Unknown Vendor";
}

function extractAmount(text: string): number {
  const amountPatterns = [
    /Amount:\s*[$€£₹]?\s*([0-9,.]+)/i,
    /Total:\s*[$€£₹]?\s*([0-9,.]+)/i,
    /Total Due:\s*[$€£₹]?\s*([0-9,.]+)/i,
    /Price:\s*[$€£₹]?\s*([0-9,.]+)/i,
    /Cost:\s*[$€£₹]?\s*([0-9,.]+)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      const cleanedAmount = match[1].replace(/,/g, "").trim();
      const numAmount = Number(cleanedAmount);
      if (!isNaN(numAmount) && numAmount > 0) {
        return numAmount;
      }
    }
  }

  return 0;
}

function extractCurrency(text: string): string {
  if (text.includes("₹") || text.includes("INR")) {
    return "INR";
  }

  if (text.includes("$") || text.includes("USD")) {
    return "USD";
  }

  return "UNKNOWN";
}

function extractDate(text: string): string {
  const datePattern = /\d{4}-\d{2}-\d{2}/;

  const match = text.match(datePattern);

  return match?.[0] || "";
}

export function extractPDFInvoice(text: string): ExtractedPDFRecord {
  return {
    Vendor: extractVendor(text),

    Amount: extractAmount(text),

    Currency: extractCurrency(text),

    Date: extractDate(text),

    Description: text.slice(0, 300),
  };
}
