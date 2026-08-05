import React from 'react';
import { Package, Beaker, Syringe, ShieldCheck } from 'lucide-react';

export default function ResourceManagement({ data }: { data: any }) {
  if (!data) return null;
  
  return (
    <div className="bg-card/60 border border-border/50 p-4 md:p-6 rounded-3xl backdrop-blur-xl shadow-xl h-full flex flex-col">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
        <Package className="w-5 h-5 mr-2 text-cyan-400" />
        Resource Inventory
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-grow">
        <div className="bg-muted/40 rounded-2xl p-4 border border-border/50 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <Beaker className="w-5 h-5 text-purple-400" />
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 rounded-full">Optimal</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">1,245</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Blood Units</p>
          </div>
        </div>
        
        <div className="bg-muted/40 rounded-2xl p-4 border border-border/50 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <Syringe className="w-5 h-5 text-cyan-400" />
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 rounded-full">Optimal</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">8,500</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Surgical Kits</p>
          </div>
        </div>
        
        <div className="col-span-2 bg-indigo-500/10 rounded-2xl p-3 border border-indigo-500/20 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          <div>
            <p className="text-sm font-bold text-indigo-200">Supply Chain Active</p>
            <p className="text-xs text-indigo-300/70">No critical shortages projected.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
