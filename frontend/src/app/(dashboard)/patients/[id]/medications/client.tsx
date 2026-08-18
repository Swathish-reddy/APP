"use client";
import { BASE_URL } from "../../../../../services/api";
import React, { useState, useEffect } from "react";
import { Pill, AlertTriangle, ShieldCheck, Activity, BrainCircuit, HeartPulse, Stethoscope, AlertCircle, TrendingDown, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";

export default function PatientMedications({ params, patientId: propPatientId }: { params?: any, patientId?: string }) {
  const [medData, setMedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string>("");

  useEffect(() => {
    Promise.resolve(params).then((resolvedParams: any) => {
      const id = propPatientId || resolvedParams?.id || "";
      setPatientId(id);
      const cleanId = id.replace("P", "");

      const token = localStorage.getItem("token");
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      fetch(
        `${BASE_URL}/medications/${cleanId}/intelligence`,
        { headers },
      )
        .then((res) => res.json())
        .then((data) => setMedData(data))
        .catch((err) =>
          console.error("Error fetching medication intelligence:", err),
        )
        .finally(() => setLoading(false));
    });
  }, [params]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
            <div className="absolute inset-0 border-t-4 border-rose-500 border-solid rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-t-4 border-indigo-500 border-solid rounded-full animate-spin opacity-70" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
          </div>
          <p className="text-rose-400 font-extrabold animate-pulse tracking-widest uppercase text-sm">Evaluating Pharmacotherapy...</p>
        </div>
      </div>
    );

  if (!medData)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <div className="bg-red-500/20 p-4 rounded-full mb-4 shadow-lg shadow-red-500/20">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl md:text-2xl md:text-2xl md:text-3xl font-extrabold text-foreground mb-2">No Medication Data</h2>
        <p className="text-red-200 font-bold max-w-md">Failed to retrieve AI medication intelligence. Ensure patient records are fully ingested.</p>
      </div>
    );

  const score = medData["10_medication_risk_score"]?.score ?? 100;
  const isHighRisk = score < 70;

  return (
    <motion.div 
      className="p-4 md:p-4 md:p-4 md:p-8 max-w-[1600px] mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-muted/80 border ${isHighRisk ? 'border-rose-500/50' : 'border-indigo-500/50'} p-4 md:p-4 md:p-4 md:p-6 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden`}>
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isHighRisk ? 'from-rose-500 via-orange-500 to-amber-500' : 'from-indigo-500 via-purple-500 to-pink-500'}`}></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-2xl md:text-3xl md:text-2xl md:text-3xl md:text-4xl md:text-2xl md:text-3xl md:text-4xl md:text-4xl md:text-5xl font-extrabold text-foreground flex items-center gap-3 drop-shadow-md">
            <Pill className={`w-12 h-12 ${isHighRisk ? 'text-rose-400' : 'text-indigo-400'} drop-shadow-lg`} /> 
            Medication Intelligence
          </h1>
          <p className={`${isHighRisk ? 'text-rose-100' : 'text-indigo-100'} mt-2 font-bold tracking-wide text-lg drop-shadow-sm`}>
            {medData["1_patient_medication_profile"]}
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className={`text-xs ${isHighRisk ? 'text-rose-200' : 'text-indigo-200'} uppercase font-extrabold tracking-wider mb-1`}>Pharmacotherapy Risk</span>
            <div className={`flex items-center gap-2 ${isHighRisk ? 'bg-rose-500/20 border-rose-400/30 shadow-rose-500/20' : 'bg-emerald-500/20 border-emerald-400/30 shadow-emerald-500/20'} border px-5 py-3 rounded-full shadow-lg`}>
              <div className={`w-3 h-3 rounded-full ${isHighRisk ? 'bg-rose-400' : 'bg-emerald-400'} animate-pulse`}></div>
              <span className={`text-base font-extrabold ${isHighRisk ? 'text-rose-300' : 'text-emerald-300'}`}>
                Score: {score} / 100 ({medData["10_medication_risk_score"]?.status})
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {}
        <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
          
          <div className="bg-muted/80 border border-border/80 rounded-3xl p-4 md:p-4 md:p-4 md:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
            <h3 className="text-2xl md:text-2xl md:text-2xl md:text-3xl font-extrabold text-foreground mb-6 flex items-center gap-3 drop-shadow-md">
              <AlertTriangle className="text-rose-400 w-8 h-8 drop-shadow-lg" /> Drug Interactions & Clearances
            </h3>
            
            <div className="space-y-6">
              {}
              <div>
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest mb-3 drop-shadow-sm">Critical Interactions</h4>
                {Array.isArray(medData["4_drug_interaction_analysis"]) ? (
                  <div className="space-y-3">
                    {medData["4_drug_interaction_analysis"].map((interaction: any, i: number) => (
                      <div key={i} className="bg-rose-500/20 border border-rose-500/40 p-5 rounded-2xl flex items-start gap-4 shadow-lg">
                        <AlertTriangle className="w-6 h-6 text-rose-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-rose-100 font-extrabold text-lg">{interaction.interaction}</p>
                          <p className="text-rose-200 font-bold text-sm mt-1 leading-relaxed">{interaction.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-emerald-500/20 border border-emerald-500/40 p-5 rounded-2xl flex items-start gap-4 shadow-lg">
                    <ShieldCheck className="w-6 h-6 text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-emerald-300 font-extrabold text-lg">{medData["4_drug_interaction_analysis"]}</p>
                  </div>
                )}
              </div>

              {}
              <div>
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest mb-3 drop-shadow-sm">Renal & Hepatic Contraindications</h4>
                {Array.isArray(medData["5_allergy_contraindication_review"]) ? (
                  <div className="space-y-3">
                    {medData["5_allergy_contraindication_review"].map((alert: any, i: number) => (
                      <div key={i} className="bg-orange-500/20 border border-orange-500/40 p-5 rounded-2xl flex items-start gap-4 shadow-lg">
                        <Activity className="w-6 h-6 text-orange-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-orange-100 font-extrabold text-lg">{alert.medication} - {alert.issue}</p>
                          <p className="text-orange-200 font-bold text-sm mt-1 leading-relaxed">{alert.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-700/60 border border-slate-600/50 p-5 rounded-2xl flex items-start gap-4 shadow-inner">
                    <p className="text-foreground font-bold">{medData["5_allergy_contraindication_review"]}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted/80 border border-indigo-500/30 rounded-3xl p-4 md:p-4 md:p-4 md:p-6 shadow-xl shadow-indigo-900/20">
              <h4 className="text-base font-black text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-sm">
                <Stethoscope className="w-5 h-5 text-indigo-400" /> Clinical Status
              </h4>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Effectiveness</span>
                  <p className="text-foreground font-bold text-base leading-relaxed mt-1">{medData["7_medication_effectiveness"]}</p>
                </div>
                <div>
                  <span className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Lab Correlation</span>
                  <p className="text-foreground font-bold text-base leading-relaxed mt-1">{medData["8_laboratory_correlation"]}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/80 border border-teal-500/30 rounded-3xl p-4 md:p-4 md:p-4 md:p-6 shadow-xl shadow-teal-900/20">
              <h4 className="text-base font-black text-teal-300 uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-sm">
                <TrendingDown className="w-5 h-5 text-teal-400" /> Predictions & Adherence
              </h4>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-teal-200 font-bold uppercase tracking-wider">Predictive Analytics</span>
                  <p className="text-foreground font-bold text-base leading-relaxed mt-1">{medData["11_predictive_analytics"]}</p>
                </div>
                <div>
                  <span className="text-xs text-teal-200 font-bold uppercase tracking-wider">Adherence Profile</span>
                  <p className="text-foreground font-bold text-base leading-relaxed mt-1">{medData["9_adherence_analysis"]}</p>
                </div>
              </div>
            </div>
          </div>

        </motion.div>

        {}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6 flex flex-col h-full">
          
          <div className="bg-gradient-to-b from-indigo-900/50 to-slate-800/90 border border-indigo-500/40 rounded-3xl p-4 md:p-4 md:p-4 md:p-8 backdrop-blur-xl flex-grow flex flex-col shadow-2xl">
            <h3 className="text-2xl font-extrabold text-foreground mb-6 flex items-center gap-3 drop-shadow-md">
              <BrainCircuit className="w-7 h-7 text-indigo-400 drop-shadow-lg" /> AI Recommendations
            </h3>
            
            <ul className="space-y-4 flex-grow">
              {Array.isArray(medData["13_ai_recommendations"]) &&
                medData["13_ai_recommendations"].map((rec: string, i: number) => {
                  const isHigh = rec.toLowerCase().includes("discontinue") || rec.toLowerCase().includes("adjust");
                  
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
                        {isHigh ? "ACTION REQUIRED" : "STRATEGIC"}
                      </div>
                      <p className={`text-base font-bold leading-relaxed drop-shadow-sm ${isHigh ? "text-amber-50" : "text-indigo-50"}`}>
                        {rec}
                      </p>
                    </li>
                  );
                })}
            </ul>

            <div className="mt-8 pt-6 border-t border-indigo-500/30">
              <h4 className="text-sm text-indigo-300 uppercase font-black mb-3 flex items-center gap-2 tracking-widest drop-shadow-sm">
                Explainable AI Rationale
              </h4>
              <p className="text-base text-foreground font-bold italic leading-relaxed">
                "{medData["14_explainable_ai"]}"
              </p>
            </div>
            
            <div className="mt-6 pt-5 border-t border-indigo-500/30 flex justify-between items-center">
              <span className="text-sm text-indigo-200 font-extrabold uppercase tracking-wider">Interaction Precision</span>
              <span className="text-xl font-black text-emerald-400 drop-shadow-md">
                {((medData["18_confidence_scores"]?.interaction_accuracy || 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="bg-muted/80 border border-cyan-500/30 rounded-3xl p-4 md:p-4 md:p-4 md:p-6 shadow-xl shadow-cyan-900/20">
            <h4 className="text-base font-black text-cyan-300 uppercase tracking-widest mb-3 flex items-center gap-2 drop-shadow-sm">
              <ClipboardList className="w-5 h-5 text-cyan-400" /> Executive Summary
            </h4>
            <p className="text-base text-foreground font-bold leading-relaxed">
              {medData["19_report_summary"]}
            </p>
          </div>

        </motion.div>

      </div>
    </motion.div>
  );
}



