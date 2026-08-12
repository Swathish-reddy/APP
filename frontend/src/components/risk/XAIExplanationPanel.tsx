"use client";
import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Info, TrendingDown, TrendingUp } from "lucide-react";
interface XAIExplanationPanelProps {
  prediction: {
    disease: string;
    risk_score: number;
    xai: { feature_importance: Record<string, number>; interpretation: string };
  };
};
export default function XAIExplanationPanel({
  prediction,
}: XAIExplanationPanelProps) {
  const { feature_importance, interpretation } = prediction.xai;
  const features = Object.entries(feature_importance);
  return (
    <div className="dark relative overflow-hidden bg-gradient-to-br from-slate-900 to-cyan-950 rounded-3xl p-4 md:p-4 md:p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-xl">
      <div className="absolute top-0 right-0 w-full md:w-full md:w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-full md:w-full md:w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="relative z-10 flex items-center gap-4 mb-6 border-b border-cyan-500/20 pb-4">
        <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/30 shadow-inner">
          <BrainCircuit className="w-6 h-6 text-cyan-300 drop-shadow-md" />
        </div>
        <div>
          <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 flex items-center gap-2 drop-shadow-sm">
            AI Explanation
            <Info className="w-5 h-5 text-cyan-400/70" />
          </h3>
          <p className="text-sm font-bold text-cyan-100/70 tracking-wide mt-1">
            Why {prediction.disease} risk is <span className="text-cyan-300">{prediction.risk_score}%</span>
          </p>
        </div>
      </div>
      
      <div className="relative z-10 mb-8 bg-card/5 p-5 rounded-2xl text-base text-cyan-50 font-medium leading-relaxed border border-white/10 shadow-lg backdrop-blur-sm">
        {interpretation}
      </div>
      
      <div className="relative z-10">
        <h4 className="text-sm font-black text-cyan-300/80 mb-4 uppercase tracking-widest drop-shadow-sm">
          Feature Importance (SHAP)
        </h4>
        <div className="space-y-4">
          {features.map(([feature, val], idx) => {
            const isRisk = val > 0;
            const absVal = Math.abs(val);
            const maxVal = Math.max(...features.map((f) => Math.abs(f[1])));
            const widthPercent = (absVal / (maxVal || 1)) * 100;
            return (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={feature}
                className="flex items-center gap-4 bg-card/5 p-3 rounded-xl border border-white/5 hover:bg-card/10 transition-colors"
              >
                <div
                  className="w-40 text-sm font-bold text-cyan-50 truncate drop-shadow-sm"
                  title={feature}
                >
                  {feature}
                </div>
                <div className="flex-1 flex items-center h-2.5 bg-background/40 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full shadow-lg ${isRisk ? "bg-gradient-to-r from-rose-500 to-rose-400" : "bg-gradient-to-r from-emerald-500 to-emerald-400"}`}
                    style={{ width: `${Math.max(widthPercent, 2)}%` }}
                  />
                </div>
                <div
                  className={`w-20 text-right text-sm font-black font-mono flex justify-end items-center gap-1 drop-shadow-sm ${isRisk ? "text-rose-300" : "text-emerald-300"}`}
                >
                  {isRisk ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {val > 0 ? "+" : ""}
                  {val.toFixed(1)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
