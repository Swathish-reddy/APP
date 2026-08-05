"use client";
import React from "react";
import { Brain, Activity, AlertTriangle, FileCheck, Sparkles, ChevronRight } from "lucide-react";

export default function DocumentInsights({ document }: { document: any }) {
  if (!document) {
    return (
      <div className="bg-background/80 border border-border/80 rounded-3xl p-4 md:p-8 h-full flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5">
          <Brain className="w-48 h-48 text-indigo-400" />
        </div>
        <div className="relative z-10 bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 mb-5 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
          <Brain className="w-10 h-10 text-indigo-400 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">AI Analysis Pending</h3>
        <p className="text-sm text-muted-foreground max-w-[250px] leading-relaxed">
          Select a medical document from the list to view autonomous diagnostic insights.
        </p>
      </div>
    );
  }

  const { ai_summary, abnormalities, structured_data, status } = document;

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-4 md:p-6 h-full flex flex-col shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-border/60 pb-5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30 shadow-lg relative group cursor-default">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-md group-hover:bg-indigo-500/30 transition-all"></div>
            <Brain className="w-6 h-6 text-indigo-300 relative z-10" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center">
              AI Document Intelligence
              <Sparkles className="w-3.5 h-3.5 text-amber-400 ml-2" />
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest mt-1">
              Autonomous Extraction Engine
            </p>
          </div>
        </div>
        {status === "Processing" && (
          <span className="flex items-center gap-2 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full uppercase tracking-wider shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></div>
            Analyzing
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
        
        {/* Clinical Summary Section */}
        {ai_summary && (
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2 bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/10 w-fit">
              <FileCheck className="w-3.5 h-3.5" /> Clinical Summary
            </h4>
            <div className="bg-background/50 p-5 rounded-2xl border border-border shadow-inner relative group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-2xl"></div>
              <p className="text-sm text-foreground leading-loose font-medium ml-2">
                {ai_summary}
              </p>
            </div>
          </div>
        )}

        {/* Detected Abnormalities Section */}
        {abnormalities && Object.keys(abnormalities).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2 bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/10 w-fit">
              <AlertTriangle className="w-3.5 h-3.5" /> Critical Abnormalities
            </h4>
            <div className="space-y-2.5">
              {Object.entries(abnormalities).map(([key, value]: any) => (
                <div
                  key={key}
                  className="flex justify-between items-center bg-muted/60 hover:bg-muted border border-border/50 p-3.5 rounded-2xl transition-all shadow-sm group cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-6 rounded-full ${value === "High" ? "bg-red-500" : "bg-amber-500"}`}></div>
                    <span className="text-sm font-semibold text-foreground capitalize tracking-wide">
                      {key.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider border shadow-inner ${
                      value === "High" 
                        ? "bg-red-500/10 text-red-400 border-red-500/30" 
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted Lab Values Section */}
        {structured_data && Object.keys(structured_data).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-2 bg-cyan-500/5 px-3 py-1.5 rounded-lg border border-cyan-500/10 w-fit">
              <Activity className="w-3.5 h-3.5" /> Extracted Parameters
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(structured_data).map(([key, value]: any) => (
                <div
                  key={key}
                  className="bg-muted/40 p-4 rounded-2xl border border-border/50 flex flex-col justify-between hover:border-cyan-500/30 transition-colors group"
                >
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2 group-hover:text-cyan-400 transition-colors">
                    {key.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-bold text-foreground">
                      {value}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
