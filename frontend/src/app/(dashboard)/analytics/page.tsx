"use client";
import React, { useState, useEffect } from "react";
import { 
  BarChart3, TrendingUp, TrendingDown, FileText, 
  Activity, Users, DollarSign, BrainCircuit,
  ShieldAlert, Target, LineChart, PieChart, FlaskConical,
  Pill, ActivitySquare, HeartPulse
} from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    fetch("http://localhost:8000/api/v1/analytics/executive", { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-t-4 border-emerald-500 border-solid rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-t-4 border-indigo-500 border-solid rounded-full animate-spin opacity-70" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
          </div>
          <p className="text-emerald-400 font-extrabold animate-pulse tracking-widest uppercase text-sm">Aggregating Population Data...</p>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <div className="bg-red-500/20 p-4 rounded-full mb-4 shadow-lg shadow-red-500/20">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-2">System Disconnected</h2>
        <p className="text-red-200 font-bold max-w-md">Failed to retrieve executive analytics. Please check data warehouse connectivity.</p>
      </div>
    );

  return (
    <motion.div 
      className="p-8 max-w-[1600px] mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/60 p-6 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold text-white flex items-center gap-3 drop-shadow-md">
            <BarChart3 className="w-12 h-12 text-emerald-400 drop-shadow-lg" /> Executive Analytics
          </h1>
          <p className="text-emerald-100 mt-2 font-bold tracking-wide text-lg drop-shadow-sm">Business Intelligence & Population Health Forecasting</p>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-emerald-200 uppercase font-extrabold tracking-wider mb-1">Health Index</span>
            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-5 py-3 rounded-full shadow-lg shadow-emerald-500/20">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-base font-extrabold text-emerald-300">
                {data["2_analytics_overview"].split("Index: ")[1] || "Active"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(data["12_kpi_dashboard"] || {}).map(([key, value]: [string, any], index) => {
          const colors = [
            "text-indigo-300", "text-emerald-300", "text-amber-300"
          ];
          const bgColors = [
            "bg-indigo-600/20", "bg-emerald-600/20", "bg-amber-600/20"
          ];
          const borderColors = [
            "border-indigo-500/30", "border-emerald-500/30", "border-amber-500/30"
          ];
          const hoverColors = [
            "hover:bg-indigo-600/30", "hover:bg-emerald-600/30", "hover:bg-amber-600/30"
          ];
          const icons = [<ActivitySquare key={1}/>, <HeartPulse key={2}/>, <Target key={3}/>];

          return (
            <motion.div variants={itemVariants} key={key} className={`group relative ${bgColors[index % 3]} border ${borderColors[index % 3]} p-6 rounded-3xl backdrop-blur-md overflow-hidden ${hoverColors[index % 3]} transition-all duration-300 shadow-xl`}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${bgColors[index % 3]} rounded-full blur-3xl -mr-10 -mt-10 transition-all`}></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${bgColors[index % 3]} p-3 rounded-2xl shadow-inner`}>
                    {React.cloneElement(icons[index % 3] as React.ReactElement<{ className?: string }>, { className: `w-7 h-7 ${colors[index % 3]}` })}
                  </div>
                  <LineChart className={`w-6 h-6 ${colors[index % 3]} opacity-80 drop-shadow-sm`} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-extrabold uppercase tracking-widest mb-1 drop-shadow-sm">
                    {key.replace(/_/g, " ")}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className={`font-black text-5xl leading-tight ${colors[index % 3]} drop-shadow-md`}>
                      {value}
                    </p>
                    <span className="text-white text-lg font-bold">/ 100</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Financial & Population (Spans 8 columns) */}
        <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
          
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
            <h3 className="text-3xl font-extrabold text-white mb-6 flex items-center gap-3 drop-shadow-md">
              <DollarSign className="text-emerald-400 w-8 h-8 drop-shadow-lg" /> Executive Financial Overview
            </h3>
            <div className="space-y-4">
              <p className="text-white text-xl font-semibold leading-relaxed drop-shadow-sm">
                {data["1_executive_summary"]}
              </p>
              <div className="mt-6 p-6 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl shadow-inner">
                <p className="text-emerald-200 font-extrabold text-lg drop-shadow-sm">
                  {data["7_financial_analytics"]}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-700/60 p-5 rounded-2xl border border-slate-600 shadow-md">
                  <span className="text-sm text-indigo-300 font-black uppercase tracking-wider drop-shadow-sm">Strategic Insights</span>
                  <p className="text-base text-white font-bold mt-2 leading-relaxed">{data["18_strategic_insights"]}</p>
                </div>
                <div className="bg-slate-700/60 p-5 rounded-2xl border border-slate-600 shadow-md">
                  <span className="text-sm text-teal-300 font-black uppercase tracking-wider drop-shadow-sm">Benchmark Analysis</span>
                  <p className="text-base text-white font-bold mt-2 leading-relaxed">{data["14_benchmark_analysis"]}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/80 border border-indigo-500/30 rounded-3xl p-6 shadow-xl shadow-indigo-900/20">
              <h4 className="text-base font-black text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-sm">
                <Users className="w-5 h-5 text-indigo-400" /> Population Health
              </h4>
              <p className="text-white font-bold mb-4 text-base leading-relaxed">{data["6_population_health_analytics"]}</p>
              <div className="bg-indigo-600/30 p-4 rounded-xl border border-indigo-500/40 text-indigo-100 font-bold text-sm mt-4 shadow-inner">
                {data["3_patient_analytics"]}
              </div>
            </div>
            
            <div className="bg-slate-800/80 border border-teal-500/30 rounded-3xl p-6 shadow-xl shadow-teal-900/20">
              <h4 className="text-base font-black text-teal-300 uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-sm">
                <TrendingUp className="w-5 h-5 text-teal-400" /> Predictive Forecasting
              </h4>
              <ul className="space-y-4">
                {Array.isArray(data["11_predictive_analytics"]) ? (
                  data["11_predictive_analytics"].map((pred: string, i: number) => (
                    <li key={i} className="flex gap-3 text-base font-semibold text-white leading-relaxed">
                      <div className="w-2 h-2 rounded-full bg-teal-400 mt-2 shrink-0 shadow-sm shadow-teal-400" />
                      {pred}
                    </li>
                  ))
                ) : (
                  <p className="text-base font-semibold text-white">{data["11_predictive_analytics"]}</p>
                )}
              </ul>
              <p className="text-sm text-teal-200 font-bold mt-5 italic border-t border-teal-500/30 pt-4 drop-shadow-sm">
                {data["13_trend_analysis"]}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 border border-blue-500/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-xl shadow-blue-900/20">
              <Activity className="w-10 h-10 text-blue-400 mb-3 drop-shadow-md" />
              <span className="text-xs uppercase font-black text-blue-300 mb-2 tracking-widest">Clinical</span>
              <p className="text-sm text-white font-bold">{data["4_clinical_analytics"]}</p>
            </div>
            <div className="bg-slate-800/80 border border-purple-500/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-xl shadow-purple-900/20">
              <Pill className="w-10 h-10 text-purple-400 mb-3 drop-shadow-md" />
              <span className="text-xs uppercase font-black text-purple-300 mb-2 tracking-widest">Medication</span>
              <p className="text-sm text-white font-bold">{data["9_medication_analytics"]}</p>
            </div>
            <div className="bg-slate-800/80 border border-pink-500/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-xl shadow-pink-900/20">
              <FlaskConical className="w-10 h-10 text-pink-400 mb-3 drop-shadow-md" />
              <span className="text-xs uppercase font-black text-pink-300 mb-2 tracking-widest">Laboratory</span>
              <p className="text-sm text-white font-bold">{data["10_laboratory_analytics"]}</p>
            </div>
          </div>

        </motion.div>

        {/* Right Column - Recommendations & Explainable AI (Spans 4 columns) */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6 flex flex-col h-full">
          
          <div className="bg-gradient-to-b from-indigo-900/50 to-slate-800/90 border border-indigo-500/40 rounded-3xl p-8 backdrop-blur-xl flex-grow flex flex-col shadow-2xl">
            <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3 drop-shadow-md">
              <BrainCircuit className="w-7 h-7 text-indigo-400 drop-shadow-lg" /> AI Recommendations
            </h3>
            
            <ul className="space-y-5 flex-grow">
              {Array.isArray(data["15_ai_recommendations"]) &&
                data["15_ai_recommendations"].map((rec: string, i: number) => {
                  const isHigh = rec.includes("[High]") || rec.includes("[Critical]");
                  
                  return (
                    <li
                      key={i}
                      className={`p-5 rounded-2xl border transition-all shadow-lg ${
                        isHigh 
                          ? "bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30" 
                          : "bg-indigo-500/20 border-indigo-500/40 hover:bg-indigo-500/30"
                      }`}
                    >
                      <div className={`inline-block px-3 py-1.5 rounded text-xs font-black uppercase tracking-widest mb-3 shadow-sm ${
                        isHigh ? "bg-amber-500/30 text-amber-200" : "bg-indigo-500/30 text-indigo-200"
                      }`}>
                        {isHigh ? "HIGH PRIORITY" : "STRATEGIC"}
                      </div>
                      <p className={`text-base font-bold leading-relaxed drop-shadow-sm ${isHigh ? "text-amber-50" : "text-indigo-50"}`}>
                        {rec.replace(/\[.*?\]/, "").trim()}
                      </p>
                    </li>
                  );
                })}
            </ul>

            <div className="mt-8 pt-6 border-t border-indigo-500/30">
              <h4 className="text-sm text-indigo-300 uppercase font-black mb-3 flex items-center gap-2 tracking-widest drop-shadow-sm">
                Explainable AI Rationale
              </h4>
              <p className="text-base text-white font-bold italic leading-relaxed">
                "{data["16_explainable_ai"]}"
              </p>
            </div>
            
            <div className="mt-6 pt-5 border-t border-indigo-500/30 flex justify-between items-center">
              <span className="text-sm text-indigo-200 font-extrabold uppercase tracking-wider">Confidence Score</span>
              <span className="text-xl font-black text-emerald-400 drop-shadow-md">
                {((data["17_confidence_scores"]?.financial_forecast || 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-cyan-500/30 rounded-3xl p-6 shadow-xl shadow-cyan-900/20">
            <h4 className="text-base font-black text-cyan-300 uppercase tracking-widest mb-3 flex items-center gap-2 drop-shadow-sm">
              <Activity className="w-5 h-5 text-cyan-400" /> Hospital Analytics
            </h4>
            <p className="text-base text-white font-bold leading-relaxed">
              {data["5_hospital_analytics"]}
            </p>
          </div>

        </motion.div>

      </div>
    </motion.div>
  );
}
