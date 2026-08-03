"use client";
import React from "react";
import { LiveMonitorDashboard } from "@/components/monitor/LiveMonitorDashboard";
import { useParams } from "next/navigation";

export default function LiveMonitorPage({ patientId }: { patientId?: string } = {}) {
  const params = useParams();
  const id = patientId || (params?.id as string);
  return (
    <div className="p-6">
      <LiveMonitorDashboard patientId={id} />
    </div>
  );
}
