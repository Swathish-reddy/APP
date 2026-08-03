"use client";
import React, { useState, useRef } from "react";
import { UploadCloud, File, X, CheckCircle, AlertCircle } from "lucide-react";
export default function DocumentUpload({
  patientId,
  onUploadComplete,
}: {
  patientId: string;
  onUploadComplete: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setError("");
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("patient_id", patientId.replace("P", ""));
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/api/v1/documents/upload`, {
          method: "POST",
          headers: (token
            ? { Authorization: `Bearer ${token}` }
            : {}) as Record<string, string>,
          body: formData,
        });
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error("Session expired. Redirecting to login...");
        }
        if (!res.ok) throw new Error("Upload failed");
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
      onUploadComplete();
      setFiles([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {" "}
      <div
        className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {" "}
        <UploadCloud className="w-12 h-12 text-blue-500 mb-4" />{" "}
        <h3 className="text-lg font-medium text-foreground mb-1">
          Drag & Drop Documents
        </h3>{" "}
        <p className="text-sm text-muted-foreground mb-4">
          Support for any file format up to 20MB
        </p>{" "}
        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-foreground rounded-lg text-sm font-medium transition-colors">
          {" "}
          Browse Files{" "}
        </button>{" "}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />{" "}
      </div>{" "}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          {" "}
          <h4 className="text-sm font-medium text-foreground">
            Selected Files
          </h4>{" "}
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200"
            >
              {" "}
              <div className="flex items-center gap-3">
                {" "}
                <File className="w-5 h-5 text-blue-500" />{" "}
                <div>
                  {" "}
                  <p className="text-sm text-foreground font-medium">
                    {file.name}
                  </p>{" "}
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <button
                onClick={() => removeFile(i)}
                className="text-muted-foreground hover:text-red-500 transition-colors"
              >
                {" "}
                <X className="w-4 h-4" />{" "}
              </button>{" "}
            </div>
          ))}{" "}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
              {" "}
              <AlertCircle className="w-4 h-4" /> {error}{" "}
            </div>
          )}{" "}
          <div className="flex justify-end mt-4">
            {" "}
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors shadow-md"
            >
              {" "}
              {isUploading ? (
                <>
                  {" "}
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>{" "}
                  Uploading {uploadProgress}%{" "}
                </>
              ) : (
                <>
                  {" "}
                  <UploadCloud className="w-4 h-4" /> Upload {files.length}{" "}
                  Files{" "}
                </>
              )}{" "}
            </button>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
}
