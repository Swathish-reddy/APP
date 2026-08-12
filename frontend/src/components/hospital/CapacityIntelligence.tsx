import React from 'react';
import { Database, Zap, MoveRight } from "lucide-react";

export default function CapacityIntelligence({ data }: { data: any }) {
  if (!data?.capacity_intelligence) return null;
  const ci = data.capacity_intelligence;
  return (
    <div className="bg-gradient-to-b from-indigo-900/40 to-slate-900/80 border border-indigo-500/30 p-4 md:p-4 md:p-4 md:p-6 rounded-3xl backdrop-blur-xl shadow-xl h-full">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-bold text-foreground">Capacity Intelligence</h2>
      </div>
      <div className="space-y-6">
        <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <h4 className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> AI Prediction</h4>
          <p className="text-foreground font-medium text-sm">Peak predicted at <span className="font-bold text-indigo-300">{ci.predicted_peak_occupancy_time}</span>.</p>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground font-medium">Bed Shortage Risk</span><span className={`font-bold ${ci.bed_shortage_risk === 'High' ? 'text-red-400' : 'text-emerald-400'}`}>{ci.bed_shortage_risk}</span></div>
          <div className="w-full bg-muted rounded-full h-2"><div className={`h-2 rounded-full ${ci.bed_shortage_risk === 'High' ? 'bg-red-500 w-4/5' : 'bg-emerald-500 w-1/5'}`}></div></div>
        </div>
      </div>
    </div>
  );
}
