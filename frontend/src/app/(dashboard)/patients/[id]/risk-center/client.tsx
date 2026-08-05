"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  AlertTriangle,
  BrainCircuit,
  ActivitySquare,
} from "lucide-react";
import RiskRadar from "@/components/risk/RiskRadar";
import XAIExplanationPanel from "@/components/risk/XAIExplanationPanel";
export default function RiskCenterPage({
  patientId: propPatientId,
}: {
  patientId?: string;
}) {
  const params = useParams() as { id?: string };
  const patientId = propPatientId || params?.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const pid = patientId?.replace("P", "") || "101";
        const response = await axios.get(
          `http://localhost:8000/api/v1/risk/${pid}/fusion`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        setData(response.data);
        if (response.data?.predictions?.length > 0) {
          setSelectedPrediction(response.data.predictions[0]);
        }
      } catch (error) {
        console.warn("Error fetching risk data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {" "}
        <div className="flex flex-col items-center gap-4">
          {" "}
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />{" "}
          <p className="text-cyan-500 font-medium">
            Running Multi-Model AI Fusion...
          </p>{" "}
        </div>{" "}
      </div>
    );
  }
  if (!data)
    return <div className="text-foreground">Failed to load risk intelligence.</div>;
  return (
    <div className="space-y-6">
      {" "}
      {}{" "}
      {data.risk_category === "Critical" || data.risk_category === "High" ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-500/10 border border-rose-500/50 rounded-2xl p-4 flex items-start gap-4 shadow-lg shadow-rose-500/5"
        >
          {" "}
          <div className="p-3 bg-rose-500/20 rounded-xl">
            {" "}
            <AlertTriangle className="w-6 h-6 text-rose-500" />{" "}
          </div>{" "}
          <div>
            {" "}
            <h2 className="text-rose-400 font-bold text-lg">
              EARLY WARNING: {data.risk_category.toUpperCase()} RISK DETECTED
            </h2>{" "}
            <p className="text-rose-200/80 text-sm mt-1">
              {" "}
              AI Fusion engine indicates elevated risk markers. Immediate
              clinical review recommended.{" "}
            </p>{" "}
          </div>{" "}
        </motion.div>
      ) : null}{" "}
      {}{" "}
      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="dark bg-gradient-to-br from-slate-900 to-violet-950 border border-violet-500/20 rounded-3xl p-4 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl pointer-events-none -ml-10 -mb-10"></div>
          <h3 className="text-violet-300/80 text-sm font-black uppercase tracking-widest mb-3 drop-shadow-sm z-10">
            Overall AI Risk Score
          </h3>
          <div className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-fuchsia-300 drop-shadow-md z-10 mb-2">
            {data.overall_risk_score}
          </div>
          <div className="mt-2 px-5 py-2 rounded-full bg-black/30 border border-violet-500/30 text-sm font-black tracking-widest uppercase z-10 shadow-inner">
            Category:{" "}
            <span
              className={
                data.risk_category === "Critical"
                  ? "text-rose-400 drop-shadow-sm"
                  : data.risk_category === "High"
                    ? "text-orange-400 drop-shadow-sm"
                    : data.risk_category === "Moderate"
                      ? "text-amber-400 drop-shadow-sm"
                      : "text-emerald-400 drop-shadow-sm"
              }
            >
              {data.risk_category}
            </span>
          </div>
        </div>
        
        <div className="dark md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mt-20"></div>
          
          <div className="relative z-10 flex items-center gap-4 mb-6 border-b border-indigo-500/20 pb-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 shadow-inner">
              <BrainCircuit className="w-6 h-6 text-indigo-300 drop-shadow-md" />
            </div>
            <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-violet-300 drop-shadow-sm">
              Multi-Model Fusion Engine
            </h3>
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-inner hover:bg-white/10 transition-colors">
              <div className="text-indigo-300/80 text-xs font-black mb-2 uppercase tracking-widest drop-shadow-sm">
                Fusion Method
              </div>
              <div className="text-indigo-50 font-bold text-lg drop-shadow-sm">
                {data.fusion_method}
              </div>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-inner hover:bg-white/10 transition-colors">
              <div className="text-indigo-300/80 text-xs font-black mb-2 uppercase tracking-widest drop-shadow-sm">
                Overall Confidence
              </div>
              <div className="text-indigo-50 font-bold text-2xl flex items-baseline gap-2 drop-shadow-sm">
                {data.overall_confidence}%
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/30">High</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="dark lg:col-span-4 bg-gradient-to-b from-slate-900 to-purple-950 border border-purple-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex items-center gap-4 mb-6 border-b border-purple-500/20 pb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30 shadow-inner">
              <ActivitySquare className="w-6 h-6 text-purple-300 drop-shadow-md" />
            </div>
            <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-fuchsia-300 drop-shadow-sm">Disease Predictions</h3>
          </div>
          <div className="relative z-10 space-y-4">
            {data.predictions?.map((pred: any, idx: number) => (
              <div
                key={pred.disease}
                onClick={() => setSelectedPrediction(pred)}
                className={`p-5 rounded-2xl cursor-pointer transition-all border shadow-lg ${selectedPrediction?.disease === pred.disease ? "bg-fuchsia-500/15 border-fuchsia-400/50 shadow-[0_0_20px_rgba(217,70,239,0.15)]" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-purple-50 font-bold text-base drop-shadow-sm">
                    {pred.disease}
                  </h4>
                  <div
                    className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border shadow-inner ${pred.risk_percent > 75 ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : pred.risk_percent > 40 ? "bg-orange-500/20 text-orange-300 border-orange-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}`}
                  >
                    {pred.risk_percent}%
                  </div>
                </div>
                <div className="w-full bg-black/40 rounded-full h-2 mt-3 shadow-inner">
                  <div
                    className={`h-2 rounded-full shadow-lg ${pred.risk_percent > 75 ? "bg-gradient-to-r from-rose-500 to-rose-400" : pred.risk_percent > 40 ? "bg-gradient-to-r from-orange-500 to-orange-400" : "bg-gradient-to-r from-emerald-500 to-emerald-400"}`}
                    style={{ width: `${pred.risk_percent}%` }}
                  />
                </div>
                <div className="mt-4 flex justify-between text-xs font-bold text-purple-200/70 uppercase tracking-wider">
                  <span>Confidence: {pred.confidence_score}%</span>
                  <span>Timeline: {pred.timeframe}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dark lg:col-span-4 bg-gradient-to-b from-slate-900 to-fuchsia-950 border border-fuchsia-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mb-20"></div>

          <div className="relative z-10 flex items-center gap-4 mb-2">
            <div className="p-3 bg-fuchsia-500/20 rounded-xl border border-fuchsia-500/30 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-fuchsia-300 drop-shadow-md" />
            </div>
            <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 to-pink-300 drop-shadow-sm">Organ Risk Radar</h3>
          </div>
          <p className="relative z-10 text-xs font-bold text-fuchsia-200/70 mb-6 uppercase tracking-widest pb-4 border-b border-fuchsia-500/20">
            Multi-system risk vulnerability mapping
          </p>
          <div className="relative z-10 flex-1 flex items-center justify-center min-h-[300px] bg-white/5 rounded-2xl border border-white/10 shadow-inner p-4">
            <RiskRadar data={data.organ_risks || {}} />
          </div>
        </div>{" "}
        {}{" "}
        <div className="lg:col-span-4">
          {" "}
          {selectedPrediction ? (
            <XAIExplanationPanel prediction={selectedPrediction} />
          ) : (
            <div className="dark h-full bg-card/50 border border-border rounded-2xl flex items-center justify-center p-4 md:p-6 text-center text-muted-foreground">
              {" "}
              Select a disease prediction to view Explainable AI insights.{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
