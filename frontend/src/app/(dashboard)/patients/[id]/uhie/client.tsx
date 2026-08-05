"use client";
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Activity,
  HeartPulse,
  Zap,
  AlertTriangle,
  Network,
  Search,
  GitMerge,
} from "lucide-react";
export default function UnifiedHealthIntelligence() {
  const params = useParams();
  const [healthState, setHealthState] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [isFusing, setIsFusing] = useState(false);
  const fetchUHIEData = async () => {
    try {
      const pid = (params?.id as string)?.replace("P", "") || "";
      const stateRes = await fetch(
        `http://localhost:8000/api/v1/uhie/patient/${pid}/state`,
      );
      if (stateRes.ok) setHealthState(await stateRes.json());
      const eventsRes = await fetch(
        `http://localhost:8000/api/v1/uhie/patient/${pid}/events`,
      );
      if (eventsRes.ok) setEvents(await eventsRes.json());
      const corrRes = await fetch(
        `http://localhost:8000/api/v1/uhie/patient/${pid}/correlations`,
      );
      if (corrRes.ok) setCorrelations(await corrRes.json());
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchUHIEData();
  }, [params.id]);
  const triggerFusion = async () => {
    setIsFusing(true);
    try {
      const pid = (params?.id as string)?.replace("P", "") || "";
      await fetch(`http://localhost:8000/api/v1/uhie/patient/${pid}/fuse`, {
        method: "POST",
      });
      await fetchUHIEData();
    } catch (err) {
      console.error("Fusion failed", err);
    } finally {
      setIsFusing(false);
    }
  };
  return (
    <div className="py-4 md:py-6 space-y-6">
      {" "}
      {}{" "}
      <div className="flex justify-between items-end">
        {" "}
        <div>
          {" "}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            {" "}
            <BrainCircuit className="w-8 h-8 text-indigo-400" /> Unified Health
            Intelligence{" "}
          </h2>{" "}
          <p className="text-muted-foreground mt-1">
            Multi-modal data fusion and patient 360° analytics.
          </p>{" "}
        </div>{" "}
        <button
          onClick={triggerFusion}
          disabled={isFusing}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-foreground font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50"
        >
          {" "}
          {isFusing ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <GitMerge className="w-5 h-5" />
          )}{" "}
          Trigger Sync & Fusion{" "}
        </button>{" "}
      </div>{" "}
      {}{" "}
      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {" "}
        {}{" "}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-900/20 border border-indigo-500/30 rounded-2xl p-4 md:p-6 relative overflow-hidden">
          {" "}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl"></div>{" "}
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2">
            Unified Health Score
          </h3>{" "}
          <div className="flex items-end gap-4">
            {" "}
            <span className="text-4xl md:text-5xl font-black text-foreground">
              {healthState?.health_score || "--"}
            </span>{" "}
            <span className="text-sm text-muted-foreground mb-1">
              / 100
            </span>{" "}
          </div>{" "}
          <div className="mt-4 flex items-center gap-2 text-sm">
            {" "}
            <span
              className={`px-2.5 py-1 rounded-md font-semibold ${healthState?.overall_status === "Optimal" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}
            >
              {" "}
              {healthState?.overall_status || "Unknown"}{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
        {}{" "}
        <div className="dark bg-card/50 border border-border rounded-2xl p-4 md:p-6 relative">
          {" "}
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Biological Age
          </h3>{" "}
          <div className="flex items-end gap-3">
            {" "}
            <span className="text-2xl md:text-3xl md:text-4xl font-bold text-cyan-400">
              {healthState?.biological_age || "--"}
            </span>{" "}
            <span className="text-sm text-muted-foreground mb-1">
              Years Old
            </span>{" "}
          </div>{" "}
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            {" "}
            Calculated by fusing labs, vitals, medical history, and lifestyle
            metrics into our longevity model.{" "}
          </p>{" "}
        </div>{" "}
        {}{" "}
        <div className="dark bg-card/50 border border-border rounded-2xl p-4 md:p-6">
          {" "}
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
            Risk Factors
          </h3>{" "}
          <div className="space-y-3">
            {" "}
            <div className="flex justify-between items-center text-sm">
              {" "}
              <span className="text-muted-foreground">Diabetes Risk</span>{" "}
              <span className="text-amber-400 font-semibold">
                {healthState?.risk_scores?.diabetes_risk || "--"}%
              </span>{" "}
            </div>{" "}
            <div className="dark w-full bg-muted rounded-full h-1.5">
              {" "}
              <div
                className="bg-amber-400 h-1.5 rounded-full"
                style={{
                  width: `${healthState?.risk_scores?.diabetes_risk || 0}%`,
                }}
              ></div>{" "}
            </div>{" "}
            <div className="flex justify-between items-center text-sm pt-2">
              {" "}
              <span className="text-muted-foreground">Cardiac Risk</span>{" "}
              <span className="text-emerald-400 font-semibold">
                {healthState?.risk_scores?.cardiac_risk || "--"}%
              </span>{" "}
            </div>{" "}
            <div className="dark w-full bg-muted rounded-full h-1.5">
              {" "}
              <div
                className="bg-emerald-400 h-1.5 rounded-full"
                style={{
                  width: `${healthState?.risk_scores?.cardiac_risk || 0}%`,
                }}
              ></div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-2 gap-6">
        {" "}
        {}{" "}
        <div className="dark bg-card/50 border border-border rounded-2xl p-4 md:p-6 min-h-[400px] flex flex-col">
          {" "}
          <div className="flex justify-between items-center mb-6">
            {" "}
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              {" "}
              <Network className="w-5 h-5 text-indigo-400" /> Health Knowledge
              Graph{" "}
            </h3>{" "}
          </div>{" "}
          <div className="flex-1 bg-background/50 rounded-xl border border-border/80 flex items-center justify-center relative overflow-hidden">
            {" "}
            {}{" "}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, #4f46e5 0%, transparent 70%)",
              }}
            ></div>{" "}
            <div className="text-center z-10">
              {" "}
              <Network className="w-12 h-12 text-indigo-500/50 mx-auto mb-3" />{" "}
              <p className="text-muted-foreground font-medium">
                Interactive Graph Rendering Engine Active
              </p>{" "}
              <p className="text-xs text-muted-foreground mt-1">
                14 Nodes • 22 Semantic Edges
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {}{" "}
        <div className="space-y-6">
          {" "}
          {}{" "}
          <div className="dark bg-card/50 border border-border rounded-2xl p-4 md:p-6">
            {" "}
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              {" "}
              <Zap className="w-5 h-5 text-amber-400" /> AI Discovered
              Correlations{" "}
            </h3>{" "}
            <div className="space-y-3">
              {" "}
              {correlations.map((c) => (
                <div
                  key={c.id}
                  className="dark p-4 bg-muted/40 rounded-xl border border-border/50 hover:bg-muted transition-colors"
                >
                  {" "}
                  <div className="flex items-center gap-3 mb-2">
                    {" "}
                    <span className="dark px-2 py-1 bg-card rounded text-xs text-muted-foreground font-medium">
                      {c.source_factor}
                    </span>{" "}
                    <span className="text-muted-foreground text-xs">↔</span>{" "}
                    <span className="dark px-2 py-1 bg-card rounded text-xs text-muted-foreground font-medium">
                      {c.target_factor}
                    </span>{" "}
                    <span
                      className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${c.correlation_type === "POSITIVE" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}
                    >
                      {" "}
                      {c.correlation_type}{" "}
                    </span>{" "}
                  </div>{" "}
                  <p className="text-sm text-muted-foreground">
                    {c.description}
                  </p>{" "}
                </div>
              ))}{" "}
              {correlations.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No active correlations detected yet.
                </p>
              )}{" "}
            </div>{" "}
          </div>{" "}
          {}{" "}
          <div className="dark bg-card/50 border border-border rounded-2xl p-4 md:p-6">
            {" "}
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              {" "}
              <Activity className="w-5 h-5 text-cyan-400" /> Health Event
              Detection{" "}
            </h3>{" "}
            <div className="space-y-3">
              {" "}
              {events.map((e) => (
                <div
                  key={e.id}
                  className="dark flex gap-4 p-3 border-l-2 border-cyan-500 bg-muted/20"
                >
                  {" "}
                  <div>
                    {" "}
                    <h4 className="text-sm font-semibold text-foreground">
                      {e.event_type}
                    </h4>{" "}
                    <p className="text-xs text-muted-foreground mt-1">
                      {e.description}
                    </p>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
              {events.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No recent anomalies detected.
                </p>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
