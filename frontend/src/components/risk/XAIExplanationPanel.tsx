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
}
export default function XAIExplanationPanel({
  prediction,
}: XAIExplanationPanelProps) {
  const { feature_importance, interpretation } = prediction.xai;
  const features = Object.entries(feature_importance);
  return (
    <div className="dark bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50 shadow-xl backdrop-blur-md">
      {" "}
      <div className="flex items-center gap-3 mb-4 border-b border-slate-700/50 pb-3">
        {" "}
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          {" "}
          <BrainCircuit className="w-5 h-5 text-indigo-400" />{" "}
        </div>{" "}
        <div>
          {" "}
          <h3 className="text-white font-semibold flex items-center gap-2">
            {" "}
            AI Explanation{" "}
            <Info className="w-4 h-4 text-muted-foreground" />{" "}
          </h3>{" "}
          <p className="text-sm text-muted-foreground">
            Why {prediction.disease} risk is {prediction.risk_score}%
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="dark mb-6 bg-slate-800/50 p-4 rounded-xl text-sm text-muted-foreground leading-relaxed border border-slate-700/50">
        {" "}
        {interpretation}{" "}
      </div>{" "}
      <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
        Feature Importance (SHAP)
      </h4>{" "}
      <div className="space-y-3">
        {" "}
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
              className="flex items-center gap-3"
            >
              {" "}
              <div
                className="w-32 text-xs font-medium text-muted-foreground truncate"
                title={feature}
              >
                {" "}
                {feature}{" "}
              </div>{" "}
              <div className="dark flex-1 flex items-center h-2 bg-slate-800 rounded-full overflow-hidden">
                {" "}
                <div
                  className={`h-full rounded-full ${isRisk ? "bg-rose-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.max(widthPercent, 2)}%` }}
                />{" "}
              </div>{" "}
              <div
                className={`w-16 text-right text-xs font-mono flex justify-end items-center gap-1 ${isRisk ? "text-rose-400" : "text-emerald-400"}`}
              >
                {" "}
                {isRisk ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}{" "}
                {val > 0 ? "+" : ""}
                {val.toFixed(1)}{" "}
              </div>{" "}
            </motion.div>
          );
        })}{" "}
      </div>{" "}
    </div>
  );
}
