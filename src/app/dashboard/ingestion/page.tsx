"use client";

import axios from "axios";
import { useEffect, useState } from "react";

type IngestionBatch = {
  id: string;

  fileName: string;

  fileType: string;

  fileSize: number;

  parserType?: string;

  status: "processing" | "completed" | "failed";

  totalRecordCount: number;

  acceptedRecordCount: number;

  rejectedRecordCount: number;

  subscriptionSignalCount: number;

  durationMs?: number;

  errorMessage?: string;

  createdAt: string;
};

export default function IngestionAuditPage() {
  const [batches, setBatches] = useState<IngestionBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchBatches() {
      try {
        const response = await axios.get<{ batches: IngestionBatch[] }>(
          "/api/ingestion-batches",
        );

        setBatches(response.data.batches);
      } catch (error) {
        console.error(error);

        setErrorMessage("Failed to load ingestion batches.");
      } finally {
        setLoading(false);
      }
    }

    fetchBatches();
  }, []);

  if (loading) {
    return <div className="p-6">Loading ingestion audit...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Ingestion Audit</h1>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-gray-50 text-left">
            <tr>
              <th className="p-3 font-medium">Uploaded</th>

              <th className="p-3 font-medium">File</th>

              <th className="p-3 font-medium">Parser</th>

              <th className="p-3 font-medium">Status</th>

              <th className="p-3 font-medium">Accepted</th>

              <th className="p-3 font-medium">Rejected</th>

              <th className="p-3 font-medium">Signals</th>

              <th className="p-3 font-medium">Duration</th>
            </tr>
          </thead>

          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id} className="border-b last:border-b-0">
                <td className="p-3 whitespace-nowrap">
                  {new Date(batch.createdAt).toLocaleString()}
                </td>

                <td className="p-3">
                  <div>{batch.fileName}</div>

                  <div className="text-xs text-gray-500">
                    {batch.fileType} - {batch.fileSize} bytes
                  </div>
                </td>

                <td className="p-3">{batch.parserType || "Unknown"}</td>

                <td className="p-3">
                  <span>{batch.status}</span>

                  {batch.errorMessage && (
                    <div className="mt-1 text-xs text-red-600">
                      {batch.errorMessage}
                    </div>
                  )}
                </td>

                <td className="p-3">{batch.acceptedRecordCount}</td>

                <td className="p-3">{batch.rejectedRecordCount}</td>

                <td className="p-3">{batch.subscriptionSignalCount}</td>

                <td className="p-3">
                  {typeof batch.durationMs === "number"
                    ? `${batch.durationMs}ms`
                    : "Pending"}
                </td>
              </tr>
            ))}

            {batches.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={8}>
                  No ingestion batches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
