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
}
export default function OrganAnalyticsPanel({
  organName,
  twinState,
  predictions,
}: OrganAnalyticsPanelProps) {
  if (!organName || !twinState) {
    return (
      <div className="dark h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
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
    <div className="dark h-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col">
      {" "}
      {}{" "}
      <div className="flex justify-between items-start mb-8">
        {" "}
        <div>
          {" "}
          <h2 className="text-2xl font-bold text-white mb-1">
            {organName} Analytics
          </h2>{" "}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
          >
            {" "}
            {status.text}{" "}
          </span>{" "}
        </div>{" "}
        <div className="text-right">
          {" "}
          <div className="text-4xl font-black text-white">{score}</div>{" "}
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-bold">
            Health Score
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {}{" "}
      <div className="mb-8">
        {" "}
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          {" "}
          <TrendingUp className="w-4 h-4" /> 12-Month Trajectory{" "}
        </h3>{" "}
        {relevantPredictions.length > 0 ? (
          <div className="space-y-4">
            {" "}
            {relevantPredictions.map((p, idx) => {
              const isIncreasing = p.projected_value > p.current_value;
              return (
                <div
                  key={idx}
                  className="dark bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                >
                  {" "}
                  <div className="flex justify-between items-center mb-2">
                    {" "}
                    <span className="text-muted-foreground font-medium">
                      {p.metric_name}
                    </span>{" "}
                    <span className="text-xs text-muted-foreground">
                      Confidence: {(p.confidence_level * 100).toFixed(0)}%
                    </span>{" "}
                  </div>{" "}
                  <div className="flex items-center gap-4">
                    {" "}
                    <div className="flex-1">
                      {" "}
                      <div className="text-xs text-muted-foreground">
                        Current
                      </div>{" "}
                      <div className="text-lg font-bold text-white">
                        {p.current_value}
                      </div>{" "}
                    </div>{" "}
                    <div className="flex-shrink-0 text-foreground">
                      {" "}
                      {isIncreasing ? (
                        <ArrowUpRight className="w-5 h-5 text-amber-500" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-emerald-500" />
                      )}{" "}
                    </div>{" "}
                    <div className="flex-1 text-right">
                      {" "}
                      <div className="text-xs text-muted-foreground">
                        Projected (+{p.timeframe_months}mo)
                      </div>{" "}
                      <div
                        className={`text-lg font-bold ${isIncreasing ? "text-amber-400" : "text-emerald-400"}`}
                      >
                        {" "}
                        {p.projected_value}{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>
              );
            })}{" "}
          </div>
        ) : (
          <div className="dark bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 text-center">
            {" "}
            <Minus className="w-5 h-5 text-foreground mx-auto mb-2" />{" "}
            <p className="text-sm text-muted-foreground">
              Stable trajectory. No critical shifts projected for this system.
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {}{" "}
      <div className="mt-auto">
        {" "}
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
          AI Insights
        </h3>{" "}
        <div
          className={`p-4 rounded-xl border ${score < 60 ? "bg-red-500/10 border-red-500/20" : "bg-slate-800/50 border-slate-700/50"}`}
        >
          {" "}
          <div className="flex gap-3">
            {" "}
            <AlertTriangle
              className={`w-5 h-5 flex-shrink-0 ${score < 60 ? "text-red-400" : "text-muted-foreground"}`}
            />{" "}
            <p className="text-sm text-muted-foreground">
              {" "}
              {score < 60
                ? `Critical intervention recommended. ${organName} markers show significant deterioration correlated with metabolic and lifestyle vectors.`
                : `${organName} functionality is within expected parameters based on the current health snapshot.`}{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
