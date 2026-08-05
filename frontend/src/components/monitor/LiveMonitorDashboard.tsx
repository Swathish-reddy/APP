"use client";
import React, { useState, useEffect, useRef } from "react";
import { MonitorTopSection } from "./MonitorTopSection";
import { DevicePanel } from "./DevicePanel";
import { VitalStreamsPanel } from "./VitalStreamsPanel";
import { AlertsPanel } from "./AlertsPanel";
import { AIPredictionsPanel } from "./AIPredictionsPanel";
import { Button } from "@/components/ui/button";
import { AlertOctagon, CloudOff, Activity } from "lucide-react";
interface LiveMonitorDashboardProps {
  patientId: string;
}
export const LiveMonitorDashboard: React.FC<LiveMonitorDashboardProps> = ({
  patientId,
}) => {
  const [stream, setStream] = useState<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>(null);
  const [ecgHistory, setEcgHistory] = useState<number[]>(Array(100).fill(0));
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [simulationEvent, setSimulationEvent] = useState<string | null>(null);
  const offlineTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchStatic = async () => {
      try {
        const [devRes, predRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/monitor/patients/${patientId}/devices`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/monitor/patients/${patientId}/predictions`)
        ]);
        setDevices(await devRes.json());
        setPredictions(await predRes.json());
      } catch (e) {
        console.error("Static data fetch failed:", e);
      }
    };
    fetchStatic();
  }, [patientId]);
  useEffect(() => {
    let isSubscribed = true;
    let errorCount = 0;

    const pollStream = async () => {
      if (!isSubscribed) return;
      try {
        const url = simulationEvent
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/monitor/patients/${patientId}/stream?event=${simulationEvent}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/monitor/patients/${patientId}/stream`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("Stream connection lost");
        const data = await res.json();
        
        if (isSubscribed && data && data.vitals) {
          setStream(data);
          setEcgHistory((prev) => {
            const newArr = [...prev, ...(data.ecg || [])];
            return newArr.slice(-100);
          });
          
          const alertRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/monitor/patients/${patientId}/alerts`,
          );
          setAlerts(await alertRes.json());
          
          if (offlineTimeoutRef.current) {
            clearTimeout(offlineTimeoutRef.current);
            offlineTimeoutRef.current = null;
          }
          
          setIsOffline(false);
          setLoading(false);
          errorCount = 0;
        }
      } catch (err) {
        console.error("Stream error", err);
        errorCount++;
        if (errorCount > 2 && !offlineTimeoutRef.current) {
            offlineTimeoutRef.current = setTimeout(() => setIsOffline(true), 3000);
        }
      }
    };
    const interval = setInterval(pollStream, 1000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
      if (offlineTimeoutRef.current) clearTimeout(offlineTimeoutRef.current);
    };
  }, [patientId, simulationEvent]);
  const triggerEmergency = async (eventType: string) => {
    setSimulationEvent(eventType);
    setTimeout(() => setSimulationEvent(null), 5000);
  };
  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        Initializing Live Stream...
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {" "}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Live Health Command Center
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">
              Real-time telemetry and emergency intelligence.
            </p>
            {isOffline ? (
              <span className="flex items-center text-xs font-semibold px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/20">
                <CloudOff className="w-3 h-3 mr-1" /> Offline - Local Sync
              </span>
            ) : (
              <span className="flex items-center text-xs font-semibold px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20">
                <Activity className="w-3 h-3 mr-1 animate-pulse" /> Live Monitoring Active
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50"
            onClick={() => triggerEmergency("Heart Attack")}
          >
            <AlertOctagon className="w-4 h-4 mr-2" /> Sim Heart Attack
          </Button>
          <Button
            variant="outline"
            className="border-orange-500 text-orange-500 hover:bg-orange-50"
            onClick={() => triggerEmergency("Fall Detected")}
          >
            <AlertOctagon className="w-4 h-4 mr-2" /> Sim Fall
          </Button>
          <Button
            variant="outline"
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-50"
            onClick={() => triggerEmergency("Severe Hypoglycemia")}
          >
            <AlertOctagon className="w-4 h-4 mr-2" /> Sim Hypoglycemia
          </Button>
        </div>
      </div>
      <MonitorTopSection stream={stream} alerts={alerts} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-4 h-[350px]">
          <DevicePanel 
            devices={devices} 
            patientId={patientId}
            onDeviceAdded={(newDev) => setDevices(prev => [newDev, ...prev])}
          />
        </div>
        <div className="lg:col-span-8 h-[350px]">
          <VitalStreamsPanel stream={stream} ecgHistory={ecgHistory} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[400px]">
        <div className="lg:col-span-8 h-[400px]">
          <AlertsPanel alerts={alerts} />
        </div>
        <div className="lg:col-span-4 h-[400px]">
          <AIPredictionsPanel predictions={predictions} />
        </div>
      </div>
    </div>
  );
};
