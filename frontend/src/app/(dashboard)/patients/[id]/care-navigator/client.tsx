"use client";
import { useParams } from 'next/navigation';
import React from "react";
import { CareNavigatorDashboard } from "@/components/navigator/CareNavigatorDashboard";
export default function CareNavigatorPage() {
  const params = useParams();
  return (
    <div className="p-4 md:p-4 md:p-4 md:p-6">
      {" "}
      <CareNavigatorDashboard patientId={params.id as string} />{" "}
    </div>
  );
}



