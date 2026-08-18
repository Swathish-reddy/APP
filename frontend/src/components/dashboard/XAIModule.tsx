"use client";
import React, { useState, useEffect } from "react";
import { Brain, Activity, Target, ShieldAlert, FileText, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import { BASE_URL } from "../../services/api";
import XAIExplanationPanel from "../risk/XAIExplanationPanel";
import Link from "next/link";

export default function XAIModule({ patientId }: { patientId: string }) {
  const [predictionData, setPredictionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading patient clinical data...");
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    setPredictionData(null);
    try {
      setLoadingText("Loading patient clinical data...");
      const token = localStorage.getItem("token");
      const pid = patientId?.replace("P", "");
      
      setTimeout(() => setLoadingText("Analyzing uploaded reports..."), 800);
      setTimeout(() => setLoadingText("Generating explainable AI insights..."), 1600);
      
      const res = await fetch(
          `${BASE_URL}/risk/patient/${pid}/predict?disease=cardiovascular_disease`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (res.ok) {
          const data = await res.json();
          setPredictionData(data);
        } else {
          console.error("Failed to fetch XAI data:", res.statusText);
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (patientId) fetchData();
  }, [patientId]);

  return (
    <div className="h-full flex flex-col space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center">
            <Brain className="mr-2 h-6 w-6 text-indigo-600" /> Explainable AI (XAI)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Transparent insights into how the AI model calculates clinical risks.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
        <h3 className="font-bold text-lg text-foreground mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-rose-500" /> Primary Risk Prediction: Cardiovascular Disease
        </h3>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground mt-4 text-sm font-medium">{loadingText}</p>
          </div>
        ) : error ? (
          <div className="py-12 flex flex-col items-center justify-center bg-rose-50 rounded-xl border border-rose-100">
            <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
            <h4 className="text-rose-900 font-bold mb-2">Unable to generate XAI insights right now.</h4>
            <p className="text-rose-700 text-sm mb-4">An error occurred while communicating with the risk model.</p>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
            >
              Retry Analysis
            </button>
          </div>
        ) : predictionData ? (
          <div className="space-y-6">
            
            {}
            <div className="flex flex-wrap gap-4 mb-4">
               <div className="flex-1 min-w-[200px] bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center space-x-3">
                 <Database className="w-8 h-8 text-blue-500" />
                 <div>
                   <p className="text-xs font-semibold text-blue-600 uppercase">Data Quality</p>
                   <p className="text-sm text-blue-900 font-medium">
                     {predictionData.xai?.available_count || 0} / {predictionData.xai?.required_count || 0} Required Features Available
                   </p>
                 </div>
               </div>
            </div>

            {predictionData.xai?.status === "INCOMPLETE_DATA" ? (
              predictionData.xai.total_documents === 0 ? (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
                  <h4 className="text-lg font-bold text-amber-900 mb-2">No clinical reports are available.</h4>
                  <p className="text-sm text-amber-800 mb-4">Upload and ingest reports from the Lab Reports module to generate patient-specific XAI insights.</p>
                  <Link href={`/patients/${patientId}/documents`} className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    <FileText className="w-4 h-4 mr-2" />
                    Go to Lab Reports
                  </Link>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
                  <h4 className="text-lg font-bold text-amber-900 mb-2">Additional clinical data is required to generate this XAI result.</h4>
                  <div className="bg-white p-4 rounded-lg border border-amber-100 w-full max-w-md text-left mb-4 shadow-sm">
                    <p className="text-sm font-semibold text-blue-800 mb-2">Available: {predictionData.xai.available_count} / {predictionData.xai.required_count}</p>
                    <p className="text-sm font-semibold text-amber-800 mb-2 mt-4">Missing:</p>
                    <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
                      {predictionData.xai.missing_features?.map((f: string, i: number) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-sm text-amber-800 mb-4">These values were not found in the currently ingested patient reports.</p>
                  <Link href={`/patients/${patientId}/documents`} className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    <FileText className="w-4 h-4 mr-2" />
                    View Lab Reports
                  </Link>
                </div>
              )
            ) : (
              <>
                <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Calculated Risk Score
                    </span>
                    <span className="text-3xl font-black text-rose-600">
                      {predictionData.risk_score?.toFixed(1) || "N/A"}%
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Confidence
                    </span>
                    <span className="text-xl font-bold text-foreground">
                      {predictionData.confidence || "N/A"}%
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-sm text-foreground mb-4 flex items-center">
                    <ShieldAlert className="w-4 h-4 mr-2 text-indigo-500" /> Feature Contributions (SHAP Values)
                  </h4>
                  <XAIExplanationPanel prediction={predictionData} />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground italic">
            XAI analysis could not be completed.
          </div>
        )}
      </div>
    </div>
  );
}
