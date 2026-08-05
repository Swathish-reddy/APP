"use client";
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { Clock, FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";
export default function DocumentTimeline() {
  const params = useParams();
  const [documents, setDocuments] = useState<any[]>([]);
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/documents/patient/${(params?.id as string)?.replace("P", "")}`,
        );
        if (res.ok) {
          const data = await res.json();
          setDocuments(
            data.sort(
              (a: any, b: any) =>
                new Date(b.upload_date).getTime() -
                new Date(a.upload_date).getTime(),
            ),
          );
        }
      } catch (err) {
        console.error("Failed to fetch documents", err);
      }
    };
    fetchDocuments();
  }, [params.id]);
  return (
    <div className="py-4 md:py-6 max-w-4xl mx-auto">
      {" "}
      <div className="flex items-center gap-4 mb-8">
        {" "}
        <Link
          href={`/patients/${params.id}/documents`}
          className="dark p-2 bg-muted rounded-full hover:bg-slate-700 transition-colors"
        >
          {" "}
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />{" "}
        </Link>{" "}
        <div>
          {" "}
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            {" "}
            <Clock className="w-6 h-6 text-cyan-400" /> Document Timeline{" "}
          </h2>{" "}
          <p className="text-muted-foreground mt-1">
            Chronological history of all medical reports.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="relative border-l-2 border-border ml-4 space-y-8 pb-12">
        {" "}
        {documents.map((doc, index) => (
          <div key={doc.id} className="relative pl-8">
            {" "}
            <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-[#030712] bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>{" "}
            <div className="dark bg-card/50 border border-border rounded-2xl p-5 hover:border-border transition-colors">
              {" "}
              <div className="flex justify-between items-start mb-3">
                {" "}
                <div className="flex items-center gap-3">
                  {" "}
                  <div className="dark p-2 bg-muted rounded-lg text-cyan-400">
                    {" "}
                    <FileText className="w-5 h-5" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h3 className="text-md font-semibold text-foreground">
                      {doc.report_type || doc.category || "Document"}
                    </h3>{" "}
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.upload_date).toLocaleString()}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <span className="dark text-xs font-bold text-muted-foreground uppercase bg-card px-2 py-1 rounded-md border border-border">
                  {" "}
                  {doc.category}{" "}
                </span>{" "}
              </div>{" "}
              <div className="mt-4">
                {" "}
                <p className="text-sm text-muted-foreground">
                  File:{" "}
                  <span className="font-medium text-foreground">
                    {doc.file_name}
                  </span>
                </p>{" "}
                {doc.ai_summary && (
                  <div className="dark mt-3 bg-muted/40 p-3 rounded-xl border border-border/50">
                    {" "}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {doc.ai_summary}
                    </p>{" "}
                  </div>
                )}{" "}
              </div>{" "}
            </div>{" "}
          </div>
        ))}{" "}
        {documents.length === 0 && (
          <div className="pl-8 text-muted-foreground">No documents found.</div>
        )}{" "}
      </div>{" "}
    </div>
  );
}



