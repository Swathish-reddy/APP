import React from 'react';
import { Briefcase, TrendingUp } from 'lucide-react';

export default function ExecutiveSummary({ data }: { data: any }) {
  if (!data) return null;
  
  return (
    <div className="bg-card/60 border border-border/50 p-4 md:p-6 rounded-3xl backdrop-blur-xl shadow-xl h-full flex flex-col">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
        <Briefcase className="w-5 h-5 mr-2 text-emerald-400" />
        Executive Summary
      </h2>
      
      <div className="space-y-4 flex-grow">
        <div>
          <div className="flex justify-between text-sm font-medium mb-1">
            <span className="text-foreground">Hospital Performance Score</span>
            <span className="text-emerald-400 font-bold">{data.hospital_performance_score}/100</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-2 rounded-full" style={{ width: `${data.hospital_performance_score}%` }}></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Admissions</p>
            <p className="text-xl font-bold text-foreground flex items-center">
              {data.admissions_today}
              <TrendingUp className="w-3 h-3 text-emerald-500 ml-1" />
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Discharges</p>
            <p className="text-xl font-bold text-foreground flex items-center">
              {data.discharges_today}
              <TrendingUp className="w-3 h-3 text-emerald-500 ml-1" />
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-xl border border-border/50">
          <p className="text-xs text-foreground leading-relaxed">
            Operations are running efficiently. AI predicts a <span className="text-cyan-400 font-bold">12% decrease</span> in LOS (Length of Stay) over the next quarter.
          </p>
        </div>
      </div>
    </div>
  );
}
