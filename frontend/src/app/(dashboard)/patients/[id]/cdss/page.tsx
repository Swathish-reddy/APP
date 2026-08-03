"use client";
import React, { useState, useEffect } from "react";
import { DecisionDashboard } from "@/components/cdss/DecisionDashboard";
import { CDSSIntelligenceReport } from "@/components/cdss/CDSSIntelligenceReport";

export default function CDSSPage({ 
  params,
  patientId: propPatientId 
}: { 
  params?: any;
  patientId?: string;
}) {
  const [id, setId] = useState<string | null>(propPatientId || null);

  useEffect(() => {
    if (propPatientId) {
      setId(propPatientId);
    } else if (params) {
      if (typeof params.then === 'function') {
        params.then((p: any) => setId(p.id));
      } else {
        setId(params.id);
      }
    }
  }, [propPatientId, params]);

  if (!id) return <div className="p-6 text-muted-foreground animate-pulse">Loading CDSS...</div>;

  return (
    <div className="p-6">
      <CDSSIntelligenceReport patientId={id} />
      <DecisionDashboard patientId={id} />
    </div>
  );
}
