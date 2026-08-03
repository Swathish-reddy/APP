"use client";
import React, { useState, useEffect } from "react";
import { UserCircle2, RefreshCw } from "lucide-react";
import Twin3DViewer from "@/components/twin/Twin3DViewer";
import OrganAnalyticsPanel from "@/components/twin/OrganAnalyticsPanel";
export default function PatientDigitalTwin({
  params,
  patientId: propPatientId,
}: {
  params?: { id: string };
  patientId?: string;
}) {
  const [twinState, setTwinState] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const patientId = propPatientId || params?.id;
  const fetchTwinData = async () => {
    try {
      const pid = patientId?.replace("P", "");
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const stateRes = await fetch(
        `http://localhost:8000/api/v1/twin/patient/${pid}`,
        { headers },
      );
      if (stateRes.ok) setTwinState(await stateRes.json());
      const predRes = await fetch(
        `http://localhost:8000/api/v1/twin/patient/${pid}/predictions`,
        { headers },
      );
      if (predRes.ok) setPredictions(await predRes.json());
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchTwinData();
  }, [patientId]);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const pid = patientId?.replace("P", "");
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      await fetch(`http://localhost:8000/api/v1/twin/patient/${pid}/refresh`, {
        method: "POST",
        headers,
      });
      await fetchTwinData();
    } catch (err) {
      console.error("Refresh failed", err);
    } finally {
      setIsRefreshing(false);
    }
  };
  return (
    <div className="py-6 h-[calc(100vh-80px)] flex flex-col">
      {" "}
      {}{" "}
      <div className="flex justify-between items-end mb-6 flex-shrink-0">
        {" "}
        <div>
          {" "}
          <h2 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            {" "}
            <UserCircle2 className="w-8 h-8 text-cyan-400" /> Digital Twin
            Center{" "}
          </h2>{" "}
          <p className="text-muted-foreground mt-1">
            Interactive 3D physiological simulation and predictive forecasting.
          </p>{" "}
        </div>{" "}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="dark flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all border border-slate-700 disabled:opacity-50"
        >
          {" "}
          <RefreshCw
            className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
          />{" "}
          Refresh Twin State{" "}
        </button>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {" "}
        {}{" "}
        <div className="lg:col-span-2 flex flex-col min-h-[500px]">
          {" "}
          <Twin3DViewer
            twinState={twinState}
            selectedOrgan={selectedOrgan}
            onSelectOrgan={setSelectedOrgan}
          />{" "}
        </div>{" "}
        {}{" "}
        <div className="lg:col-span-1 overflow-y-auto pr-2 custom-scrollbar">
          {" "}
          <OrganAnalyticsPanel
            organName={selectedOrgan}
            twinState={twinState}
            predictions={predictions}
          />{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
