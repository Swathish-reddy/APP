import React from 'react';
import { Sparkles, BrainCircuit, ArrowRight } from 'lucide-react';

export default function AIRecommendations({ data }: { data: any }) {
  if (!data) return null;
  
  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 p-4 md:p-6 rounded-3xl backdrop-blur-xl shadow-xl h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <BrainCircuit className="w-32 h-32 text-indigo-400" />
      </div>
      
      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-indigo-400" />
        Autonomous Actions
      </h2>
      
      <div className="space-y-3 flex-grow z-10">
        <div className="bg-card/60 hover:bg-muted/80 transition-colors border border-indigo-500/20 p-4 rounded-2xl flex items-center justify-between cursor-pointer group">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full mb-2 inline-block">High Confidence (98%)</span>
            <p className="text-sm text-foreground font-medium">Reallocate 4 ICU nurses to ER triage to mitigate wait time surge.</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/40 transition-colors shrink-0 ml-4">
            <ArrowRight className="w-4 h-4 text-indigo-300" />
          </div>
        </div>
        
        <div className="bg-card/60 hover:bg-muted/80 transition-colors border border-indigo-500/20 p-4 rounded-2xl flex items-center justify-between cursor-pointer group">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-400 tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full mb-2 inline-block">Moderate Confidence (85%)</span>
            <p className="text-sm text-foreground font-medium">Postpone 2 elective surgeries to free up priority OR availability.</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/40 transition-colors shrink-0 ml-4">
            <ArrowRight className="w-4 h-4 text-indigo-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
