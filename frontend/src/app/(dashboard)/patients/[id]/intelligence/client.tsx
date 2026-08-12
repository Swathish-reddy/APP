"use client";
import React from "react";
import { AIIntelligenceDashboard } from "@/components/intelligence/AIIntelligenceDashboard";

export default function IntelligencePage({ 
  params,
  patientId: propPatientId,
}: { 
  params?: any;
  patientId?: string;
}) {
  // Safe unwrap for Next.js 15+ route params, while supporting direct prop injection
  const resolvedParams = params ? React.use(params as Promise<any>) : null;
  const patientId = propPatientId || resolvedParams?.id;

  return (
    <div className="p-4 md:p-4 md:p-4 md:p-6">
      {patientId ? <AIIntelligenceDashboard patientId={patientId} /> : <div>Loading...</div>}
    </div>
  );
}
