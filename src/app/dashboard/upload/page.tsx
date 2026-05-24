"use client";
import { useState } from "react";
import axios from "axios";

type UploadResult = {
  normalizedRecords: unknown[];

  rejectedRecords: unknown[];

  subscriptionSignals: unknown[];
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a file.");

      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {
      setUploading(true);
      setErrorMessage("");

      const response = await axios.post<UploadResult>("/api/upload", formData);

      console.log(response.data);

      setUploadResult(response.data);
    } catch (error) {
      console.error(error);

      setErrorMessage("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const rejectedCount = uploadResult?.rejectedRecords.length ?? 0;
  const normalizedCount = uploadResult?.normalizedRecords.length ?? 0;
  const persistedCount = normalizedCount - rejectedCount;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Upload Files</h1>
      <p className="mt-4">Upload your invoices, PDFs, or CSV reports here.</p>
      <div className="mt-8 border-2 border-dashed p-10 rounded-lg">
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setFile(e.target.files[0]);
            }
          }}
        />
        {file && <p className="mt-4">Selected File: {file.name}</p>}
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-6 bg-black text-white px-6 py-3 rounded"
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>

      {errorMessage && <p className="mt-4 text-sm text-red-600">{errorMessage}</p>}

      {uploadResult && (
        <div className="mt-6 border rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span>Normalized records</span>

            <span>{normalizedCount}</span>
          </div>

          <div className="flex justify-between">
            <span>Persisted records</span>

            <span>{persistedCount}</span>
          </div>

          <div className="flex justify-between">
            <span>Rejected records</span>

            <span>{rejectedCount}</span>
          </div>

          <div className="flex justify-between">
            <span>Subscription signals</span>

            <span>{uploadResult.subscriptionSignals.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
