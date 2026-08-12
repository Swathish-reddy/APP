"use client";
import React, { useState, useEffect } from "react";
import { Brain, Activity, Target, ShieldAlert } from "lucide-react";
import { BASE_URL } from "../../services/api";
import XAIExplanationPanel from "../risk/XAIExplanationPanel";
export default function XAIModule({ patientId }: { patientId: string }) {
  const [predictionData, setPredictionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const pid = patientId?.replace("P", "");
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
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchData();
  }, [patientId]);
  return (
    <div className="h-full flex flex-col space-y-6 max-w-5xl mx-auto">
      {" "}
      <div className="flex justify-between items-end">
        {" "}
        <div>
          {" "}
          <h2 className="text-xl font-bold text-foreground flex items-center">
            {" "}
            <Brain className="mr-2 h-6 w-6 text-indigo-600" /> Explainable AI
            (XAI){" "}
          </h2>{" "}
          <p className="text-sm text-muted-foreground mt-1">
            {" "}
            Transparent insights into how the AI model calculates clinical
            risks.{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="bg-card rounded-2xl border border-slate-200 shadow-sm p-4 md:p-4 md:p-4 md:p-6">
        {" "}
        <h3 className="font-bold text-lg text-foreground mb-4 flex items-center">
          {" "}
          <Target className="w-5 h-5 mr-2 text-rose-500" /> Primary Risk
          Prediction: Cardiovascular Disease{" "}
        </h3>{" "}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            {" "}
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>{" "}
            <p className="text-muted-foreground mt-4 text-sm font-medium">
              Generating Explanations...
            </p>{" "}
          </div>
        ) : predictionData ? (
          <div className="space-y-6">
            {" "}
            <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {" "}
              <div className="flex-1">
                {" "}
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Calculated Risk Score
                </span>{" "}
                <span className="text-2xl md:text-2xl md:text-2xl md:text-3xl font-black text-rose-600">
                  {predictionData.risk_score.toFixed(1)}%
                </span>{" "}
              </div>{" "}
              <div className="flex-1">
                {" "}
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Confidence
                </span>{" "}
                <span className="text-xl font-bold text-foreground">
                  {predictionData.confidence}%
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <div className="pt-4 border-t border-slate-100">
              {" "}
              <h4 className="font-bold text-sm text-foreground mb-4 flex items-center">
                {" "}
                <ShieldAlert className="w-4 h-4 mr-2 text-indigo-500" /> Feature
                Contributions (SHAP Values){" "}
              </h4>{" "}
              <XAIExplanationPanel prediction={predictionData} />{" "}
            </div>{" "}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground italic">
            {" "}
            Unable to generate XAI insights for this patient.{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
}
