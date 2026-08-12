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
        <h2 className="text-2xl md:text-2xl md:text-2xl md:text-3xl font-extrabold text-foreground mb-2">System Disconnected</h2>
        <p className="text-red-200 font-bold max-w-md">Failed to retrieve executive analytics. Please check data warehouse connectivity.</p>
      </div>
    );

  return (
    <motion.div 
      className="dark p-4 md:p-4 md:p-4 md:p-8 max-w-[1600px] mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 to-emerald-950 border border-emerald-500/20 p-4 md:p-4 md:p-4 md:p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500"></div>
        <div className="absolute top-0 right-0 w-full md:w-full md:w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-2xl md:text-3xl md:text-2xl md:text-3xl md:text-4xl md:text-2xl md:text-3xl md:text-4xl md:text-4xl md:text-5xl font-black text-emerald-50 flex items-center gap-3 drop-shadow-md">
            <BarChart3 className="w-12 h-12 text-emerald-400 drop-shadow-lg" /> Executive Analytics
          </h1>
          <p className="text-emerald-200 mt-2 font-bold tracking-widest uppercase text-sm drop-shadow-sm">Business Intelligence & Population Health Forecasting</p>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-emerald-300 uppercase font-black tracking-widest mb-2 drop-shadow-sm">Health Index</span>
            <div className="flex items-center gap-3 bg-emerald-500/20 border border-emerald-400/30 px-4 md:px-4 md:px-6 py-3 rounded-2xl shadow-inner">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
              <span className="text-xl font-black text-emerald-100 drop-shadow-sm">
                {data["2_analytics_overview"].split("Index: ")[1] || "Active"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(data["12_kpi_dashboard"] || {}).map(([key, value]: [string, any], index) => {
          const colors = [
            "text-indigo-300", "text-emerald-300", "text-amber-300"
          ];
          const bgColors = [
            "bg-indigo-500/20", "bg-emerald-500/20", "bg-amber-500/20"
          ];
          const borderColors = [
            "border-indigo-500/30", "border-emerald-500/30", "border-amber-500/30"
          ];
          const gradients = [
            "from-slate-900 to-indigo-950", "from-slate-900 to-emerald-950", "from-slate-900 to-amber-950"
          ];
          const icons = [<ActivitySquare key={1}/>, <HeartPulse key={2}/>, <Target key={3}/>];

          return (
            <motion.div variants={itemVariants} key={key} className={`group relative bg-gradient-to-br ${gradients[index % 3]} border ${borderColors[index % 3]} p-5 md:p-4 md:p-4 md:p-6 rounded-3xl backdrop-blur-xl overflow-hidden transition-all duration-300 shadow-2xl`}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${bgColors[index % 3]} rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none`}></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${bgColors[index % 3]} p-3 rounded-2xl shadow-inner border border-white/5`}>
                    {React.cloneElement(icons[index % 3] as React.ReactElement<{ className?: string }>, { className: `w-7 h-7 ${colors[index % 3]} drop-shadow-md` })}
                  </div>
                  <LineChart className={`w-6 h-6 ${colors[index % 3]} opacity-60 drop-shadow-sm`} />
                </div>
                <div>
                  <h3 className="text-foreground text-xs font-black uppercase tracking-widest mb-1 drop-shadow-sm">
                    {key.replace(/_/g, " ")}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className={`font-black text-2xl md:text-3xl md:text-4xl md:text-4xl md:text-5xl md:text-6xl leading-tight ${colors[index % 3]} drop-shadow-lg`}>
                      {value}
                    </p>
                    <span className="text-muted-foreground text-lg font-bold">/ 100</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {}
        <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
          
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 border border-emerald-500/20 rounded-3xl p-5 md:p-4 md:p-4 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
            <div className="absolute bottom-0 right-0 w-full md:w-full md:w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mb-20"></div>
            
            <h3 className="text-2xl md:text-2xl md:text-2xl md:text-3xl font-black text-emerald-50 mb-6 flex items-center gap-3 drop-shadow-md relative z-10">
              <DollarSign className="text-emerald-400 w-8 h-8 drop-shadow-lg" /> Executive Financial Overview
            </h3>
            <div className="space-y-6 relative z-10">
              <p className="text-emerald-100 text-lg font-bold leading-relaxed drop-shadow-sm bg-background/20 p-5 rounded-2xl border border-emerald-500/10 shadow-inner">
                {data["1_executive_summary"]}
              </p>
              <div className="p-5 md:p-4 md:p-4 md:p-6 bg-emerald-500/15 border border-emerald-400/30 rounded-2xl shadow-inner">
                <p className="text-emerald-300 font-black text-lg drop-shadow-sm uppercase tracking-wider">
                  {data["7_financial_analytics"]}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-card/5 p-4 md:p-4 md:p-6 rounded-2xl border border-white/10 shadow-inner hover:bg-card/10 transition-colors">
                  <span className="text-xs text-emerald-300 font-black uppercase tracking-widest drop-shadow-sm">Strategic Insights</span>
                  <p className="text-base text-emerald-50 font-bold mt-3 leading-relaxed">{data["18_strategic_insights"]}</p>
                </div>
                <div className="bg-card/5 p-4 md:p-4 md:p-6 rounded-2xl border border-white/10 shadow-inner hover:bg-card/10 transition-colors">
                  <span className="text-xs text-teal-300 font-black uppercase tracking-widest drop-shadow-sm">Benchmark Analysis</span>
                  <p className="text-base text-teal-50 font-bold mt-3 leading-relaxed">{data["14_benchmark_analysis"]}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-b from-slate-900 to-indigo-950 border border-indigo-500/20 rounded-3xl p-5 md:p-4 md:p-4 md:p-6 shadow-2xl relative overflow-hidden">
              <h4 className="text-sm font-black text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-sm relative z-10">
                <Users className="w-5 h-5 text-indigo-400" /> Population Health
              </h4>
              <p className="text-indigo-50 font-bold mb-4 text-base leading-relaxed relative z-10 bg-background/20 p-4 rounded-xl border border-white/5">{data["6_population_health_analytics"]}</p>
              <div className="bg-indigo-500/20 p-4 rounded-xl border border-indigo-500/30 text-indigo-200 font-black text-sm mt-4 shadow-inner relative z-10">
                {data["3_patient_analytics"]}
              </div>
            </div>
            
            <div className="bg-gradient-to-b from-slate-900 to-teal-950 border border-teal-500/20 rounded-3xl p-5 md:p-4 md:p-4 md:p-6 shadow-2xl relative overflow-hidden">
              <h4 className="text-sm font-black text-teal-300 uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-sm relative z-10">
                <TrendingUp className="w-5 h-5 text-teal-400" /> Predictive Forecasting
              </h4>
              <ul className="space-y-4 relative z-10 bg-background/20 p-4 rounded-xl border border-white/5">
                {Array.isArray(data["11_predictive_analytics"]) ? (
                  data["11_predictive_analytics"].map((pred: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm font-bold text-teal-50 leading-relaxed">
                      <div className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
                      {pred}
                    </li>
                  ))
                ) : (
                  <p className="text-sm font-bold text-teal-50">{data["11_predictive_analytics"]}</p>
                )}
              </ul>
              <p className="text-xs text-teal-300 font-black uppercase tracking-widest mt-5 pt-4 border-t border-teal-500/20 drop-shadow-sm relative z-10">
                {data["13_trend_analysis"]}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-b from-slate-900 to-blue-950 border border-blue-500/20 rounded-3xl p-5 md:p-4 md:p-4 md:p-6 flex flex-col justify-center items-center text-center shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="p-3 bg-blue-500/20 rounded-xl mb-4 border border-blue-500/30 shadow-inner">
                <Activity className="w-8 h-8 text-blue-400 drop-shadow-md" />
              </div>
              <span className="text-xs uppercase font-black text-blue-300 mb-2 tracking-widest">Clinical</span>
              <p className="text-sm text-blue-50 font-bold">{data["4_clinical_analytics"]}</p>
            </div>
            <div className="bg-gradient-to-b from-slate-900 to-purple-950 border border-purple-500/20 rounded-3xl p-5 md:p-4 md:p-4 md:p-6 flex flex-col justify-center items-center text-center shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="p-3 bg-purple-500/20 rounded-xl mb-4 border border-purple-500/30 shadow-inner">
                <Pill className="w-8 h-8 text-purple-400 drop-shadow-md" />
              </div>
              <span className="text-xs uppercase font-black text-purple-300 mb-2 tracking-widest">Medication</span>
              <p className="text-sm text-purple-50 font-bold">{data["9_medication_analytics"]}</p>
            </div>
            <div className="bg-gradient-to-b from-slate-900 to-pink-950 border border-pink-500/20 rounded-3xl p-5 md:p-4 md:p-4 md:p-6 flex flex-col justify-center items-center text-center shadow-2xl hover:-translate-y-1 transition-transform">
              <div className="p-3 bg-pink-500/20 rounded-xl mb-4 border border-pink-500/30 shadow-inner">
                <FlaskConical className="w-8 h-8 text-pink-400 drop-shadow-md" />
              </div>
              <span className="text-xs uppercase font-black text-pink-300 mb-2 tracking-widest">Laboratory</span>
              <p className="text-sm text-pink-50 font-bold">{data["10_laboratory_analytics"]}</p>
            </div>
          </div>

        </motion.div>

        {}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6 flex flex-col h-full">
          
          <div className="bg-gradient-to-b from-slate-900 to-indigo-950 border border-indigo-500/20 rounded-3xl p-5 md:p-4 md:p-4 md:p-8 backdrop-blur-xl flex-grow flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <h3 className="text-2xl font-black text-indigo-50 mb-8 flex items-center gap-3 drop-shadow-md relative z-10">
              <BrainCircuit className="w-8 h-8 text-indigo-400 drop-shadow-lg" /> AI Recommendations
            </h3>
            
            <ul className="space-y-5 flex-grow relative z-10">
              {Array.isArray(data["15_ai_recommendations"]) &&
                data["15_ai_recommendations"].map((rec: string, i: number) => {
                  const isHigh = rec.includes("[High]") || rec.includes("[Critical]");
                  
                  return (
                    <li
                      key={i}
                      className={`p-5 rounded-2xl border transition-all shadow-lg ${
                        isHigh 
                          ? "bg-amber-500/15 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]" 
                          : "bg-indigo-500/15 border-indigo-500/30 shadow-inner"
                      }`}
                    >
                      <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest mb-3 border ${
                        isHigh ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      }`}>
                        {isHigh ? "HIGH PRIORITY" : "STRATEGIC"}
                      </div>
                      <p className={`text-sm font-bold leading-relaxed drop-shadow-sm ${isHigh ? "text-amber-50" : "text-indigo-50"}`}>
                        {rec.replace(/\[.*?\]/, "").trim()}
                      </p>
                    </li>
                  );
                })}
            </ul>

            <div className="mt-8 pt-6 border-t border-indigo-500/20 relative z-10">
              <h4 className="text-xs text-indigo-300 uppercase font-black mb-3 flex items-center gap-2 tracking-widest drop-shadow-sm">
                Explainable AI Rationale
              </h4>
              <p className="text-sm text-indigo-100 font-bold italic leading-relaxed bg-background/20 p-4 rounded-xl border border-white/5">
                "{data["16_explainable_ai"]}"
              </p>
            </div>
            
            <div className="mt-6 pt-5 border-t border-indigo-500/20 flex justify-between items-center relative z-10 bg-indigo-500/10 p-4 rounded-2xl shadow-inner border border-indigo-500/10">
              <span className="text-xs text-indigo-300 font-black uppercase tracking-widest">Confidence Score</span>
              <span className="text-2xl font-black text-emerald-400 drop-shadow-md">
                {((data["17_confidence_scores"]?.financial_forecast || 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-b from-slate-900 to-cyan-950 border border-cyan-500/20 rounded-3xl p-5 md:p-4 md:p-4 md:p-6 shadow-2xl relative overflow-hidden">
            <h4 className="text-sm font-black text-cyan-300 uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-sm relative z-10">
              <Activity className="w-5 h-5 text-cyan-400" /> Hospital Analytics
            </h4>
            <p className="text-sm text-cyan-50 font-bold leading-relaxed relative z-10 bg-background/20 p-4 rounded-xl border border-white/5">
              {data["5_hospital_analytics"]}
            </p>
          </div>

        </motion.div>

      </div>
    </motion.div>
  );
}
