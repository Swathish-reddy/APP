import React from 'react';
import { Map, Layers } from 'lucide-react';

export default function HospitalMap({ data }: { data: any }) {
  if (!data) return null;
  
  return (
    <div className="bg-card/60 border border-border/50 p-4 md:p-6 rounded-3xl backdrop-blur-xl shadow-xl h-full flex flex-col relative overflow-hidden">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center relative z-10">
        <Map className="w-5 h-5 mr-2 text-cyan-400" />
        Digital Floor Plan
      </h2>
      
      <div className="flex-grow bg-muted/30 rounded-2xl border border-border/50 relative overflow-hidden flex items-center justify-center min-h-[150px]">
        {/* Abstract Blueprint background */}
        <div className="absolute inset-0 opacity-20" style={{ 
          backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }}></div>
        
        <div className="relative z-10 text-center">
          <Layers className="w-10 h-10 text-cyan-500/50 mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">3D Interactive Map</p>
          <p className="text-xs text-muted-foreground mt-1">Live tracking enabled across 4 floors</p>
          
          <div className="mt-4 flex gap-2 justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse delay-75"></span>
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse delay-150"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
