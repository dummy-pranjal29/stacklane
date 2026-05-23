"use client";
import { useState } from "react";
import axios from "axios";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");

      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {
      const response = await axios.post("/api/upload", formData);

      console.log(response.data);

      alert("File uploaded successfully!");
    } catch (error) {
      console.error(error);

      alert("Upload failed");
    }
  };
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
        className="mt-6 bg-black text-white px-6 py-3 rounded"
      >
        Upload File
      </button>
    </div>
  );
}
