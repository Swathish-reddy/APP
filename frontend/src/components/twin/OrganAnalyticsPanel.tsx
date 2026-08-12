"use client";
import React from "react";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { TwinState, Prediction } from "@/types";

interface OrganAnalyticsPanelProps {
  organName: string | null;
  twinState: TwinState | null;
  predictions: Prediction[];
};
export default function OrganAnalyticsPanel({
  organName,
  twinState,
  predictions,
}: OrganAnalyticsPanelProps) {
  if (!organName || !twinState) {
    return (
      <div className="dark h-full min-h-[500px] flex flex-col items-center justify-center bg-card/50 border border-border rounded-2xl p-4 md:p-4 md:p-4 md:p-6 text-center">
        {" "}
        <Activity className="w-12 h-12 text-foreground mb-4" />{" "}
        <h3 className="text-lg font-medium text-muted-foreground">
          Select an Organ
        </h3>{" "}
        <p className="text-muted-foreground mt-2">
          Click on an organ in the 3D model to view detailed physiological
          analytics, risk factors, and AI projections.
        </p>{" "}
      </div>
    );
  }
  const scoreMap: Record<string, number> = {
    Heart: twinState.cardiac_health,
    Brain: twinState.brain_health,
    Lungs: twinState.lung_health,
    Liver: twinState.liver_health,
    Kidneys: twinState.renal_health,
    Metabolic: twinState.metabolic_health,
  };
  const score = scoreMap[organName] || 0;
  const getStatusText = (s: number) => {
    if (s >= 80)
      return {
        text: "Optimal",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
      };
    if (s >= 60)
      return {
        text: "Mild Risk",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
      };
    if (s >= 40)
      return {
        text: "Moderate Risk",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
      };
    return { text: "Critical", color: "text-red-400", bg: "bg-red-500/10" };
  };
  const status = getStatusText(score);
  const relevantPredictions = predictions.filter((p) => {
    if (organName === "Metabolic")
      return (
        p.metric_name.includes("HbA1c") ||
        p.metric_name.includes("Weight") ||
        p.metric_name.includes("BMI")
      );
    if (organName === "Heart")
      return p.metric_name.includes("Weight") || p.metric_name.includes("BMI");
    return false;
  });
  return (
    <div className="dark h-full bg-gradient-to-br from-slate-900/90 to-slate-800/95 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-4 md:p-4 md:p-6 flex flex-col shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full md:w-full md:w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-full md:w-full md:w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
      
      <div className="relative z-10 flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl md:text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 mb-1 drop-shadow-lg">
            {organName} Analytics
          </h2>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-md ${status.bg} ${status.color} border border-current/20`}
          >
            {status.text}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl md:text-2xl md:text-3xl md:text-2xl md:text-3xl md:text-4xl md:text-2xl md:text-3xl md:text-4xl md:text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-300 drop-shadow-md">
            {score}
          </div>
          <div className="text-xs text-indigo-200/80 uppercase tracking-widest font-black mt-1">
            Health Score
          </div>
        </div>
      </div>

      <div className="relative z-10 mb-8">
        <h3 className="text-sm font-black text-indigo-300/80 uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-sm">
          <TrendingUp className="w-5 h-5 text-indigo-400" /> 12-Month Trajectory
        </h3>
        {relevantPredictions.length > 0 ? (
          <div className="space-y-4">
            {relevantPredictions.map((p, idx) => {
              const isIncreasing = p.projected_value > p.current_value;
              return (
                <div
                  key={idx}
                  className="bg-card/5 rounded-2xl p-5 border border-white/10 shadow-lg backdrop-blur-sm transition-all hover:bg-card/10"
                >
                  <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                    <span className="text-indigo-100 font-bold text-lg drop-shadow-sm">
                      {p.metric_name}
                    </span>
                    <span className="text-xs font-bold text-indigo-300/70 uppercase tracking-wider">
                      Confidence: {(p.confidence_level * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-xs text-indigo-200/70 font-bold uppercase tracking-wider mb-1">
                        Current
                      </div>
                      <div className="text-2xl font-black text-foreground drop-shadow-sm">
                        {p.current_value}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isIncreasing ? (
                        <div className="bg-amber-500/20 p-2 rounded-full border border-amber-500/30">
                          <ArrowUpRight className="w-6 h-6 text-amber-400 drop-shadow-md" />
                        </div>
                      ) : (
                        <div className="bg-emerald-500/20 p-2 rounded-full border border-emerald-500/30">
                          <ArrowDownRight className="w-6 h-6 text-emerald-400 drop-shadow-md" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-xs text-indigo-200/70 font-bold uppercase tracking-wider mb-1">
                        Projected (+{p.timeframe_months}mo)
                      </div>
                      <div
                        className={`text-2xl font-black drop-shadow-sm ${isIncreasing ? "text-amber-400" : "text-emerald-400"}`}
                      >
                        {p.projected_value}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card/5 rounded-2xl p-4 md:p-4 md:p-6 border border-white/10 text-center shadow-inner">
            <Minus className="w-8 h-8 text-indigo-400/50 mx-auto mb-3" />
            <p className="text-base text-indigo-100/90 font-bold leading-relaxed">
              Stable trajectory. No critical shifts projected for this system.
            </p>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-auto">
        <h3 className="text-sm font-black text-indigo-300/80 uppercase tracking-widest mb-3 drop-shadow-sm">
          AI Insights
        </h3>
        <div
          className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg ${score < 60 ? "bg-rose-500/15 border-rose-500/30" : "bg-emerald-500/15 border-emerald-500/30"}`}
        >
          <div className="flex gap-4">
            <AlertTriangle
              className={`w-7 h-7 flex-shrink-0 drop-shadow-md ${score < 60 ? "text-rose-400" : "text-emerald-400"}`}
            />
            <p className={`text-base font-bold leading-relaxed ${score < 60 ? "text-rose-100" : "text-emerald-100"} drop-shadow-sm`}>
              {score < 60
                ? `Critical intervention recommended. ${organName} markers show significant deterioration correlated with metabolic and lifestyle vectors.`
                : `${organName} functionality is within expected parameters based on the current health snapshot.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
