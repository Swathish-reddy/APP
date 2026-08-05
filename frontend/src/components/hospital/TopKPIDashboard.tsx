import React from 'react';
import { Users, AlertTriangle, Clock, Activity, CheckCircle, Bed, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopKPIDashboard({ data }: { data: any }) {
  if (!data) return null;
  const kpis = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 lg:grid-cols-8 gap-3">
      {/* Total Patients */}
      <div className="bg-card/60 border border-border/50 rounded-xl p-3 flex flex-col justify-between shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Census</span>
        </div>
        <div className="text-2xl font-black text-foreground">{kpis.total_patients}</div>
      </div>

      {/* Emergency */}
      <div className="bg-card/60 border border-border/50 rounded-xl p-3 flex flex-col justify-between shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Emergency</span>
        </div>
        <div className="text-2xl font-black text-foreground">{kpis.emergency_patients}</div>
      </div>

      {/* ER Wait Time */}
      <div className="bg-card/60 border border-border/50 rounded-xl p-3 flex flex-col justify-between shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">ER Wait</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-foreground">{kpis.er_wait_time_mins}</span>
          <span className="text-xs text-muted-foreground">m</span>
        </div>
      </div>

      {/* Admissions */}
      <div className="bg-card/60 border border-border/50 rounded-xl p-3 flex flex-col justify-between shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Admissions</span>
        </div>
        <div className="text-2xl font-black text-foreground">+{kpis.admissions_today}</div>
      </div>

      {/* ICU Occupancy */}
      <div className="bg-card/60 border border-border/50 rounded-xl p-3 flex flex-col justify-between shadow-lg backdrop-blur-sm relative overflow-hidden">
        <div className={`absolute bottom-0 left-0 h-1 transition-all ${kpis.icu_occupancy_pct > 90 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${kpis.icu_occupancy_pct}%` }}></div>
        <div className="flex items-center justify-between mb-2">
          <Bed className="w-4 h-4 text-red-400" />
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">ICU Load</span>
        </div>
        <div className="flex items-baseline gap-1 relative z-10">
          <span className={`text-2xl font-black ${kpis.icu_occupancy_pct > 90 ? 'text-red-400' : 'text-foreground'}`}>{kpis.icu_occupancy_pct}</span>
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      </div>

      {/* Available Beds */}
      <div className="bg-card/60 border border-border/50 rounded-xl p-3 flex flex-col justify-between shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <CheckCircle className="w-4 h-4 text-teal-400" />
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Open Beds</span>
        </div>
        <div className="text-2xl font-black text-foreground">{kpis.available_beds}</div>
      </div>

      {/* Critical Alerts */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex flex-col justify-between shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="text-[10px] text-red-400 uppercase font-bold tracking-widest">Alerts</span>
        </div>
        <div className="text-2xl font-black text-red-400">{kpis.critical_alerts}</div>
      </div>

      {/* AI Confidence */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 flex flex-col justify-between shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest">AI Score</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-indigo-300">{kpis.ai_confidence_pct}</span>
          <span className="text-xs text-indigo-400/70">%</span>
        </div>
      </div>
      
    </div>
  );
}
