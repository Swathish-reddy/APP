"use client";
import React, { use } from "react";
import { NutritionDashboard } from "@/components/nutrition/NutritionDashboard";
import { DietIntelligenceReport } from "@/components/nutrition/DietIntelligenceReport";

export default function NutritionPage({ params, patientId: propPatientId }: { params?: any; patientId?: string }) {
  const unwrappedParams = params ? (use(params) as any) : {};
  const patientId = propPatientId || unwrappedParams.id;
  
  if (!patientId) return null;

  return (
    <div className="p-4 md:p-4 md:p-4 md:p-6">
      <DietIntelligenceReport patientId={patientId} />
      <NutritionDashboard patientId={patientId} />
    </div>
  );
}



