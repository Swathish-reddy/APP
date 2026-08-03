import React from "react";
import { CareNavigatorDashboard } from "@/components/navigator/CareNavigatorDashboard";
export default async function CareNavigatorPage({ params }: { params: any }) {
  return (
    <div className="p-6">
      {" "}
      <CareNavigatorDashboard patientId={(await params).id} />{" "}
    </div>
  );
}
