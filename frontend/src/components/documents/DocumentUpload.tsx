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
    <div className="bg-card border border-border/80 rounded-3xl p-4 md:p-6 shadow-2xl backdrop-blur-xl w-full">
      <div
        className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group relative overflow-hidden"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <UploadCloud className="w-14 h-14 text-muted-foreground mb-4 group-hover:text-emerald-400 group-hover:-translate-y-1 transition-all" />
        <h3 className="text-xl font-bold text-foreground mb-2 relative z-10">
          Drop Medical Records Here
        </h3>
        <p className="text-sm text-muted-foreground mb-6 relative z-10">
          Supports securely encrypted PDF, DICOM, JPEG up to 20MB
        </p>
        <button className="px-4 md:px-6 py-2.5 bg-muted hover:bg-slate-700 border border-border hover:border-slate-600 text-foreground rounded-xl text-sm font-semibold transition-all relative z-10 shadow-lg">
          Browse Files
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
      </div>

      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Selected Documents
          </h4>
          <div className="space-y-3">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-background/50 p-4 rounded-2xl border border-border hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-muted border border-border">
                    <File className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-semibold mb-0.5">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mt-4">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="flex justify-end mt-6 pt-6 border-t border-border/80">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-4 md:px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  Uploading {uploadProgress}%
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" /> Upload {files.length} Files
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
