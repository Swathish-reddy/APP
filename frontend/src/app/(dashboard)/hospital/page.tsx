"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ActivitySquare, ShieldAlert, Zap, AlertTriangle
} from "lucide-react";
import TopKPIDashboard from "@/components/hospital/TopKPIDashboard";
import LivePatientFlow from "@/components/hospital/LivePatientFlow";
import CapacityIntelligence from "@/components/hospital/CapacityIntelligence";
import WorkforceIntelligence from "@/components/hospital/WorkforceIntelligence";
import ResourceManagement from "@/components/hospital/ResourceManagement";
import AIRecommendations from "@/components/hospital/AIRecommendations";
import HospitalMap from "@/components/hospital/HospitalMap";
import ExecutiveSummary from "@/components/hospital/ExecutiveSummary";
import EmergencyIntegration from "@/components/hospital/EmergencyIntegration";

export default function HospitalCommandCenter() {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const hospitalId = 1;

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      setConnectionStatus("connecting");
      ws = new WebSocket(`ws://localhost:8000/ws/hospital/${hospitalId}`);

      ws.onopen = () => setConnectionStatus("connected");

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        const metrics = payload.metrics;
        setData(metrics);
        
        setHistory(prev => {
          const newPoint = {
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
            admissions: metrics.flow_stats?.admissions_hr || 0,
            discharges: metrics.flow_stats?.discharges_hr || 0,
            transfers: metrics.flow_stats?.transfers_hr || 0,
            icu: metrics.icu_occupancy_percent || 0,
          };
          const newHistory = [...prev, newPoint];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        });
        
        setLoading(false);
      };

      ws.onclose = () => {
        setConnectionStatus("disconnected");
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh] w-full">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-t-4 border-cyan-500 border-solid rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-t-4 border-indigo-500 border-solid rounded-full animate-spin opacity-70" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
            <div className="absolute inset-4 border-t-4 border-purple-500 border-solid rounded-full animate-spin opacity-50" style={{ animationDuration: "2s" }}></div>
          </div>
          <p className="text-cyan-400 font-extrabold animate-pulse tracking-widest uppercase text-sm">
            Initializing Operations Core...
          </p>
        </div>
      </div>
    );
  }

  const isEmergency = data?.emergency_status === "Elevated" || data?.emergency_status === "Critical";

  return (
    <motion.div 
      className="max-w-[2000px] mx-auto space-y-6 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* HEADER SECTION (NASA/Tesla Mission Control Style) */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 bg-slate-900/80 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <ActivitySquare className="w-10 h-10 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight flex items-center gap-4">
              Operations Command Center
              {connectionStatus === "connected" ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Offline</span>
                </div>
              )}
            </h1>
            <p className="text-slate-400 mt-1.5 font-medium text-sm tracking-wide">
              CognivueX Real-Time Hospital Intelligence • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-4 xl:gap-8 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1.5">Emergency Status</span>
            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border shadow-lg backdrop-blur-md transition-colors ${isEmergency ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
              {isEmergency ? <AlertTriangle className="w-4 h-4 animate-pulse" /> : <ShieldAlert className="w-4 h-4" />}
              <span className="text-sm font-bold tracking-widest uppercase">{data?.emergency_status}</span>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-700/50 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1.5">Global AI Confidence</span>
            <div className="flex items-center gap-2.5 bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-xl shadow-lg backdrop-blur-md">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-indigo-300">
                {data?.ai_confidence_percent}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* TOP KPI DASHBOARD */}
      <motion.div variants={itemVariants}>
        <TopKPIDashboard data={data} />
      </motion.div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Flow & Capacity (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          <motion.div variants={itemVariants}>
            <LivePatientFlow data={data} history={history} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <CapacityIntelligence data={data} />
          </motion.div>
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WorkforceIntelligence data={data} />
            <ResourceManagement data={data} />
          </motion.div>
        </div>

        {/* RIGHT COLUMN: AI, Emergency, Summary (5 cols) */}
        <div className="xl:col-span-5 space-y-6 flex flex-col">
          <motion.div variants={itemVariants}>
            <EmergencyIntegration data={data} />
          </motion.div>
          <motion.div variants={itemVariants} className="flex-grow">
            <AIRecommendations data={data} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <ExecutiveSummary data={data} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <HospitalMap data={data} />
          </motion.div>
        </div>
        
      </div>
    </motion.div>
  );
}
