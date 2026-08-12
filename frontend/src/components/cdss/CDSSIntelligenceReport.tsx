"use client";
import React, { useState, useEffect } from "react";
import { FlaskConical } from "lucide-react";
export const CDSSIntelligenceReport = ({
  patientId,
}: {
  patientId: string;
}) => {
  const [cdssData, setCdssData] = useState<any>(null);
  useEffect(() => {
    const id = patientId.replace("P", "");
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`http://localhost:8000/api/v1/cdss/${id}/intelligence`, { headers })
      .then((res) => res.json())
      .then((data) => setCdssData(data))
      .catch((err) => console.error("Error fetching CDSS intelligence:", err));
  }, [patientId]);
  if (!cdssData) return null;
  return (
    <div className="dark bg-card/40 border border-border rounded-3xl p-4 md:p-4 md:p-4 md:p-6 mb-6">
      {" "}
      <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
        {" "}
        <FlaskConical className="w-6 h-6 text-indigo-400" /> AI Doctor
        Intelligence (20-Point Report){" "}
      </h3>{" "}
      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
        {" "}
        <div className="dark bg-muted/50 p-4 rounded-xl border border-border/50">
          {" "}
          <p className="text-muted-foreground text-xs uppercase mb-1 font-semibold">
            Differential Diagnosis
          </p>{" "}
          <p className="text-foreground text-sm whitespace-pre-wrap">
            {cdssData["4_differential_diagnosis"]}
          </p>{" "}
        </div>{" "}
        <div className="dark bg-muted/50 p-4 rounded-xl border border-border/50">
          {" "}
          <p className="text-muted-foreground text-xs uppercase mb-1 font-semibold">
            Treatment Plan
          </p>{" "}
          <p className="text-foreground text-sm whitespace-pre-wrap">
            {cdssData["5_treatment_plan"]}
          </p>{" "}
        </div>{" "}
        <div className="dark bg-muted/50 p-4 rounded-xl border border-border/50 md:col-span-2">
          {" "}
          <p className="text-muted-foreground text-xs uppercase mb-1 font-semibold">
            SOAP Note
          </p>{" "}
          <p className="text-foreground text-sm whitespace-pre-wrap">
            {cdssData["9_soap_note"]}
          </p>{" "}
        </div>{" "}
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl md:col-span-2">
          {" "}
          <p className="text-indigo-400 text-xs uppercase mb-2 font-semibold">
            Top CDSS Recommendations
          </p>{" "}
          <ul className="space-y-2">
            {" "}
            {Array.isArray(cdssData["10_cdss_recommendations"]) ? (
              cdssData["10_cdss_recommendations"].map(
                (rec: string, i: number) => (
                  <li
                    key={i}
                    className="text-muted-foreground text-sm flex items-start gap-2"
                  >
                    {" "}
                    <span className="text-indigo-500 mt-0.5">•</span> {rec}{" "}
                  </li>
                ),
              )
            ) : (
              <li className="text-muted-foreground text-sm">
                {cdssData["10_cdss_recommendations"]}
              </li>
            )}{" "}
          </ul>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
