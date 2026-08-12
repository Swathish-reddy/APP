import React from 'react';
import { AlertCircle, Ambulance, Activity } from 'lucide-react';

export default function EmergencyIntegration({ data }: { data: any }) {
  if (!data) return null;
  const isHigh = data.emergency_patients > 30;

  return (
    <div className="bg-card/60 border border-border/50 p-4 md:p-4 md:p-4 md:p-6 rounded-3xl backdrop-blur-xl shadow-xl h-full flex flex-col relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-full h-1 ${isHigh ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
        <Ambulance className={`w-5 h-5 mr-2 ${isHigh ? 'text-red-400' : 'text-emerald-400'}`} />
        Emergency Dept Integration
      </h2>
      
      <div className="flex-grow space-y-4">
        <div className="flex justify-between items-center bg-muted/50 p-4 rounded-2xl border border-border/50">
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Active Cases</p>
            <p className="text-2xl font-black text-foreground">{data.emergency_patients || 0}</p>
          </div>
          <Activity className="w-8 h-8 text-indigo-400 opacity-50" />
        </div>
        
        <div className="flex justify-between items-center bg-muted/50 p-4 rounded-2xl border border-border/50">
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Avg Wait Time</p>
            <div className="flex items-end gap-1">
              <p className="text-2xl font-black text-amber-400">{data.emergency_wait_time_mins || 0}</p>
              <span className="text-sm text-muted-foreground mb-1">mins</span>
            </div>
          </div>
        </div>
        
        {isHigh && (
          <div className="flex items-start gap-3 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">Surge detected. ER capacity is nearing threshold limits. Initiate diversion protocols if wait times exceed 30 mins.</p>
          </div>
        )}
      </div>
    </div>
  );
}
