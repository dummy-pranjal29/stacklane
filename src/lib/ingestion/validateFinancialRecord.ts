import type { FinancialRecord } from "./types";

export type RejectedFinancialRecord = {
  record: FinancialRecord;

  reason: string;
};

type PartitionedFinancialRecords = {
  acceptedRecords: FinancialRecord[];

  rejectedRecords: RejectedFinancialRecord[];
};

function hasReliableVendor(record: FinancialRecord): boolean {
  const vendor = record.vendor.trim().toLowerCase();

  return vendor.length > 0 && vendor !== "unknown vendor";
}

function hasPositiveAmount(record: FinancialRecord): boolean {
  return Number.isFinite(record.amount) && record.amount > 0;
}

export function partitionPersistableFinancialRecords(
  records: FinancialRecord[],
): PartitionedFinancialRecords {
  const acceptedRecords: FinancialRecord[] = [];
  const rejectedRecords: RejectedFinancialRecord[] = [];

  for (const record of records) {
    if (!hasReliableVendor(record)) {
      rejectedRecords.push({
        record,
        reason: "Missing reliable vendor",
      });
      continue;
    }

    if (!hasPositiveAmount(record)) {
      rejectedRecords.push({
        record,
        reason: "Missing positive amount",
      });
      continue;
    }

    acceptedRecords.push(record);
  }

  return {
    acceptedRecords,
    rejectedRecords,
  };
}
