"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Info, TrendingDown, TrendingUp, Search, Calendar, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface XAIExplanationPanelProps {
  prediction: {
    disease: string;
    risk_score: number;
    xai: { 
      feature_importance: Record<string, number>; 
      interpretation: string;
      all_features?: any[];
    };
  };
};
export default function XAIExplanationPanel({
  prediction,
}: XAIExplanationPanelProps) {
  const { feature_importance, interpretation, all_features } = prediction.xai;
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);

  // Transform data for Recharts
  const chartData = Object.entries(feature_importance).map(([name, impact]) => ({
    name,
    impact,
    isRisk: impact > 0,
    absImpact: Math.abs(impact)
  })).sort((a, b) => b.absImpact - a.absImpact).slice(0, 8); // Top 8 features

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-white z-50">
          <p className="font-bold text-sm mb-1">{label}</p>
          <p className={`text-xs font-mono font-bold ${data.isRisk ? "text-rose-400" : "text-emerald-400"}`}>
            Impact: {data.impact > 0 ? "+" : ""}{data.impact.toFixed(1)}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    if (!all_features) return;
    const feat = all_features.find((f) => f.feature === data.name);
    if (feat) {
      setSelectedFeature(feat);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {}
      <div className="lg:col-span-2 flex flex-col space-y-4">
        <div className="dark bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-700 pb-3">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">SHAP Feature Importance</h3>
          </div>
          
          <div className="h-64 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                onClick={(e) => {
                  if (e && e.activePayload) {
                    handleBarClick(e.activePayload[0].payload);
                  }
                }}
              >
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={150} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} />
                <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isRisk ? "#f43f5e" : "#10b981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">Click on a bar to view evidence.</p>
        </div>

        {}
        <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl">
           <h4 className="text-sm font-bold text-indigo-900 mb-2 flex items-center">
             <Info className="w-4 h-4 mr-2 text-indigo-600" /> Why is my risk {prediction.risk_score?.toFixed(1) || 0}%?
           </h4>
           <p className="text-sm text-indigo-800 leading-relaxed font-medium">
             {interpretation}
           </p>
        </div>
      </div>

      {}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md h-full flex flex-col">
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Report Evidence
          </h3>

          {selectedFeature ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col space-y-4"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Selected Feature</p>
                <p className="text-base font-bold text-slate-900">{selectedFeature.feature}</p>
                <p className="text-2xl font-black text-indigo-600 mt-1">{selectedFeature.value}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center"><Search className="w-3 h-3 mr-1"/> Source Document</p>
                <p className="text-sm font-medium text-slate-800 break-all flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-rose-500" />
                  {selectedFeature.source_document || "Clinical Input"}
                </p>
                {selectedFeature.source_date && (
                  <p className="text-xs text-slate-500 flex items-center mt-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(selectedFeature.source_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex-1">
                <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Clinical Guidelines</p>
                <p className="text-sm text-blue-900 leading-relaxed">
                  {selectedFeature.explanation}
                </p>
                <p className="text-xs text-blue-500 font-medium mt-2">Source: {selectedFeature.evidence}</p>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Search className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium text-center">Select a feature from the SHAP chart to trace its source.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
