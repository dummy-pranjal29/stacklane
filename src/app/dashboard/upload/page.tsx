"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus("Uploading file...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed. Please check your authentication.");
      }

      setStatus("File uploaded and processed successfully.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "An error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-8 flex flex-col items-center">
      <main className="max-w-2xl w-full bg-white dark:bg-zinc-900 rounded-2xl shadow p-8 border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold mb-2">Upload Financial Records</h1>
        <p className="text-zinc-900 dark:text-zinc-100 font-medium mb-8">
          Upload your invoices (PDF, CSV, XLSX) for automated spend ingestion.
        </p>

        <form onSubmit={handleUpload} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-lg">Select File</label>
            <input
              type="file"
              accept=".pdf,.csv,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-zinc-800 dark:file:text-blue-400 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={!file}
            className="bg-blue-600 text-white font-bold text-lg py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Upload & Process
          </button>
        </form>

        {status && (
          <div className="mt-8 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-bold text-center">
            {status}
          </div>
        )}
      </main>
    </div>
  );
}
