import { BASE_URL } from "../../../../../services/api";
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Eye,
  Upload,
  Filter,
  Search,
  Tag,
  Trash2,
  Calendar,
  FileImage,
  File,
  Activity,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useParams } from "next/navigation";
import DocumentUpload from "@/components/documents/DocumentUpload";
import DocumentInsights from "@/components/documents/DocumentInsights";
export default function DocumentCenter({
  patientId: propPatientId,
  params: propParams,
}: {
  patientId?: string;
  params?: { id?: string };
}) {
  const hookParams = useParams();
  let patientId = propPatientId || propParams?.id || (hookParams?.id as string);
  if (!patientId || patientId === "undefined") {
    patientId = "1";
  }
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = [
    "All",
    "Lab Reports",
    "Radiology",
    "Cardiology",
    "Prescriptions",
    "Clinical Notes",
    "Other",
  ];
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/documents/patient/${patientId?.replace(`P", "")}`,
        {
          headers: (token
            ? { Authorization: `Bearer ${token}` }
            : {}) as Record<string, string>,
        },
      );
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
        if (data.length > 0 && !selectedDoc) {
          setSelectedDoc(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(() => {
      setDocuments((docs) => {
        if (docs.some((d) => d.status === "Processing")) {
          fetchDocuments();
        }
        return docs;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [patientId, refreshKey]);
  const [autoOpenPicker, setAutoOpenPicker] = useState(false);
  useEffect(() => {
    const handleOpenUpload = () => setIsUploading(true);
    const handleOpenFilePicker = () => {
      setIsUploading(true);
      setAutoOpenPicker(true);
    };
    const handleDocumentUploaded = () => setRefreshKey((k) => k + 1);
    window.addEventListener("openUpload", handleOpenUpload);
    window.addEventListener("openFilePicker", handleOpenFilePicker);
    window.addEventListener("documentUploaded", handleDocumentUploaded);
    return () => {
      window.removeEventListener("openUpload", handleOpenUpload);
      window.removeEventListener("openFilePicker", handleOpenFilePicker);
      window.removeEventListener("documentUploaded", handleDocumentUploaded);
    };
  }, []);
  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/documents/${docId}`,
        {
          method: `DELETE",
          headers: (token
            ? { Authorization: `Bearer ${token}` }
            : {}) as Record<string, string>,
        },
      );
      if (res.ok) {
        if (selectedDoc?.id === docId) setSelectedDoc(null);
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete ALL documents? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      await Promise.all(documents.map(doc => 
        fetch(`${BASE_URL}/documents/${doc.id}`, {
          method: `DELETE",
          headers: (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
        })
      ));
      setSelectedDoc(null);
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDocs =
    activeCategory === "All"
      ? documents
      : documents.filter((d) => d.category === activeCategory);
  const getIconForType = (type: string) => {
    if (type?.includes("pdf")) return <FileText className="w-6 h-6" />;
    if (type?.includes("image")) return <FileImage className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 overflow-hidden p-2">
      
      {}
      <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
        
        {}
        <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-50"></div>
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-2 text-blue-400" /> Report Types
          </h3>
          <div className="space-y-1.5 relative z-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                  activeCategory === cat 
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-inner" 
                    : "text-foreground border border-transparent hover:bg-muted/80 hover:border-border/50"
                }`}
              >
                {cat}
                <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                  activeCategory === cat ? "bg-blue-500/20 text-blue-300" : "bg-muted text-muted-foreground"
                }`}>
                  {cat === "All" ? documents.length : documents.filter((d) => d.category === cat).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        
        {}
        <button
          onClick={handleClearAll}
          disabled={documents.length === 0}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-bold rounded-xl transition-all border border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete All Reports"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Clear All Reports</span>
        </button>
      </div>

      {}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {}
        <div className="flex justify-between items-center bg-card border border-border/80 rounded-3xl p-4 shadow-xl backdrop-blur-xl">
          <div className="relative flex-1 max-w-xl ml-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reports, lab metrics, imaging studies..."
              className="w-full bg-background/50 border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>
          <button
            onClick={() => setIsUploading(!isUploading)}
            className="mr-2 flex items-center gap-2 px-4 md:px-4 md:px-4 md:px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Cancel Upload" : "Upload Lab Report"}
          </button>
        </div>

        {isUploading && (
          <div className="bg-card border border-border/80 rounded-3xl p-4 md:p-4 md:p-4 md:p-6 shadow-2xl backdrop-blur-xl">
            <DocumentUpload
              patientId={patientId || ""}
              autoOpenPicker={autoOpenPicker}
              onUploadComplete={() => {
                setIsUploading(false);
                setAutoOpenPicker(false);
                fetchDocuments();
              }}
            />
          </div>
        )}

        {}
        <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
          <div className="grid grid-cols-1 xl:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`bg-card border rounded-3xl p-5 cursor-pointer transition-all shadow-xl group relative overflow-hidden ${
                  selectedDoc?.id === doc.id 
                    ? "border-emerald-500/50 ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                    : "border-border/80 hover:border-slate-600 hover:shadow-2xl"
                }`}
              >
                {selectedDoc?.id === doc.id && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${
                      selectedDoc?.id === doc.id 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-muted/80 text-muted-foreground border border-border/50 group-hover:bg-muted group-hover:text-foreground"
                    }`}
                  >
                    {getIconForType(doc.file_type)}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-widest bg-muted/80 px-3 py-1.5 rounded-lg border border-border/50 shadow-inner">
                      {doc.report_type || "Unknown"}
                    </span>
                    {doc.status === "Processing" && (
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 flex items-center gap-2 shadow-inner">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                        Processing
                      </span>
                    )}
                    {doc.status === "Unsupported" && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-500/10 px-3 py-1.5 rounded-lg border border-slate-500/20 flex items-center gap-2 shadow-inner">
                        Unsupported Format
                      </span>
                    )}
                    {doc.status === "Completed" && (
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-2 shadow-inner">
                        Ingested
                      </span>
                    )}
                  </div>
                </div>
                
                <h4 className="text-base font-bold text-foreground mb-2 truncate group-hover:text-emerald-300 transition-colors" title={doc.file_name}>
                  {doc.file_name}
                </h4>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {new Date(doc.upload_date).toLocaleDateString()}
                  </span>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-200">
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const token = localStorage.getItem("token");
                          const res = await fetch(`${BASE_URL}/documents/${doc.id}/download`, {
                            headers: (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
                          });
                          if (!res.ok) throw new Error(`Failed to download");
                          const blob = await res.blob();
                          const url = window.URL.createObjectURL(blob);
                          window.open(url, '_blank');
                          setTimeout(() => window.URL.revokeObjectURL(url), 10000);
                        } catch (err) {
                          console.error("Error inspecting file", err);
                          alert("Could not inspect the file.");
                        }
                      }}
                      className="p-2 hover:bg-indigo-500/10 rounded-xl text-muted-foreground hover:text-indigo-400 transition-colors border border-transparent hover:border-indigo-500/20"
                      title="Inspect Original Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, doc.id)}
                      className="p-2 hover:bg-red-500/10 rounded-xl text-muted-foreground hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredDocs.length === 0 && !isUploading && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl bg-card/50 backdrop-blur-sm">
                <div className="p-4 bg-muted rounded-2xl mb-5">
                  <FileText className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">No lab reports found</h3>
                <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                  Upload lab reports, prescriptions, or clinical notes for autonomous AI processing and insight extraction.
                </p>
                <button
                  onClick={() => setIsUploading(true)}
                  className="px-4 md:px-4 md:px-4 md:px-6 py-3 bg-muted hover:bg-slate-700 border border-border hover:border-slate-600 text-foreground text-sm font-bold rounded-xl transition-all shadow-lg"
                >
                  Upload First Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="w-full md:w-full md:w-full md:w-80 flex-shrink-0">
        <DocumentInsights document={selectedDoc} />
      </div>
    </div>
  );
}



