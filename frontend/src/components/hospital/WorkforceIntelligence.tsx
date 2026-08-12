import React from 'react';
import { UserCheck, AlertTriangle, Zap } from "lucide-react";

export default function WorkforceIntelligence({ data }: { data: any }) {
  if (!data?.workforce_intelligence) return null;
  const wi = data.workforce_intelligence;
  return (
    <div className="bg-card/60 border border-border/50 p-4 md:p-4 md:p-4 md:p-6 rounded-3xl backdrop-blur-xl shadow-xl h-full">
      <div className="flex items-center gap-3 mb-6">
        <UserCheck className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-bold text-foreground">Workforce Intelligence</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/60 border border-border p-4 rounded-2xl flex items-center justify-between">
          <div><h4 className="text-muted-foreground text-xs font-bold uppercase mb-1">Burnout Alerts</h4><p className="text-2xl md:text-2xl md:text-2xl md:text-3xl font-black text-red-400">{wi.burnout_risk_count}</p></div>
          <AlertTriangle className="w-8 h-8 text-red-500/50" />
        </div>
        <div className="bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-2xl">
          <h4 className="text-indigo-300 text-xs font-bold uppercase mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> AI Staffing</h4>
          <p className="text-foreground text-sm font-medium">{wi.ai_reassignment_recommendation}</p>
        </div>
      </div>
    </div>
  );
}
