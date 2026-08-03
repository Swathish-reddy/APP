"use client";
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import DocumentUpload from "@/components/documents/DocumentUpload";
import DocumentInsights from "@/components/documents/DocumentInsights";
export default function DocumentCenter({
  params,
  patientId: propPatientId,
}: {
  params?: { id: string };
  patientId?: string;
}) {
  const patientId = propPatientId || params?.id;
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
        `http://localhost:8000/api/v1/documents/patient/${patientId?.replace("P", "")}`,
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
  }, [patientId]);
  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/api/v1/documents/${docId}`,
        {
          method: "DELETE",
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
    <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden">
      {" "}
      {}{" "}
      <div className="w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        {" "}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          {" "}
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Categories
          </h3>{" "}
          <div className="space-y-1">
            {" "}
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat ? "bg-blue-50 text-blue-700" : "text-foreground hover:bg-slate-50 hover:text-slate-900"}`}
              >
                {" "}
                {cat}{" "}
                <span className="float-right text-xs opacity-50">
                  {" "}
                  {cat === "All"
                    ? documents.length
                    : documents.filter((d) => d.category === cat).length}{" "}
                </span>{" "}
              </button>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        <div className="dark bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mt-auto">
          {" "}
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Analysis
          </h3>{" "}
          <div className="space-y-1">
            {" "}
            <a
              href={`/patients/${patientId}/documents/timeline`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              {" "}
              <Clock className="w-4 h-4" /> Document Timeline{" "}
            </a>{" "}
            <a
              href={`/patients/${patientId}/documents/compare`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              {" "}
              <Activity className="w-4 h-4" /> Compare Reports{" "}
            </a>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {}{" "}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {" "}
        <div className="flex justify-between items-center">
          {" "}
          <div className="relative flex-1 max-w-md">
            {" "}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />{" "}
            <input
              type="text"
              placeholder="Search documents, tests, values..."
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm"
            />{" "}
          </div>{" "}
          <button
            onClick={() => setIsUploading(!isUploading)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            {" "}
            <Upload className="w-4 h-4" />{" "}
            {isUploading ? "Cancel Upload" : "Upload Document"}{" "}
          </button>{" "}
        </div>{" "}
        {isUploading && (
          <DocumentUpload
            patientId={patientId || ""}
            onUploadComplete={() => {
              setIsUploading(false);
              fetchDocuments();
            }}
          />
        )}{" "}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {" "}
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all shadow-sm group ${selectedDoc?.id === doc.id ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200 hover:border-blue-300 hover:shadow-md"}`}
              >
                {" "}
                <div className="flex items-start justify-between mb-3">
                  {" "}
                  <div
                    className={`p-2.5 rounded-xl ${selectedDoc?.id === doc.id ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-muted-foreground group-hover:text-blue-500"}`}
                  >
                    {" "}
                    {getIconForType(doc.file_type)}{" "}
                  </div>{" "}
                  <div className="flex flex-col items-end gap-2">
                    {" "}
                    <span className="text-[10px] font-bold text-foreground uppercase bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                      {" "}
                      {doc.report_type || "Unknown"}{" "}
                    </span>{" "}
                    {doc.status === "Processing" && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        {" "}
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>{" "}
                        Processing{" "}
                      </span>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
                <h4
                  className="text-sm font-semibold text-foreground mb-1 truncate"
                  title={doc.file_name}
                >
                  {" "}
                  {doc.file_name}{" "}
                </h4>{" "}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  {" "}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {" "}
                    <Calendar className="w-3 h-3" />{" "}
                    {new Date(doc.upload_date).toLocaleDateString()}{" "}
                  </span>{" "}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {" "}
                    <button className="p-1.5 hover:bg-slate-50 rounded-md text-muted-foreground hover:text-blue-600 transition-colors">
                      {" "}
                      <Eye className="w-3.5 h-3.5" />{" "}
                    </button>{" "}
                    <button
                      onClick={(e) => handleDelete(e, doc.id)}
                      className="p-1.5 hover:bg-red-50 rounded-md text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      {" "}
                      <Trash2 className="w-3.5 h-3.5" />{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            ))}{" "}
            {filteredDocs.length === 0 && !isUploading && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl">
                {" "}
                <FileText className="w-12 h-12 text-foreground mb-4" />{" "}
                <h3 className="text-muted-foreground font-medium">
                  No documents found
                </h3>{" "}
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Upload lab reports, prescriptions, or clinical notes.
                </p>{" "}
                <button
                  onClick={() => setIsUploading(true)}
                  className="dark px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors"
                >
                  {" "}
                  Upload First Document{" "}
                </button>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {}{" "}
      <div className="w-80 flex-shrink-0">
        {" "}
        <DocumentInsights document={selectedDoc} />{" "}
      </div>{" "}
    </div>
  );
}
