"use client";

export default function UploadPage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Upload Files</h1>

      <p className="mt-4">Upload your invoices, PDFs, or CSV reports here.</p>

      <div className="mt-8 border-2 border-dashed p-10 rounded-lg">
        <input type="file" />
      </div>
    </div>
  );
}
