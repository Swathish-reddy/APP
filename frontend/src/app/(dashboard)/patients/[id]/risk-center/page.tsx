"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  AlertTriangle,
  BrainCircuit,
  ActivitySquare,
} from "lucide-react";
import RiskRadar from "@/components/risk/RiskRadar";
import XAIExplanationPanel from "@/components/risk/XAIExplanationPanel";
export default function RiskCenterPage({
  patientId: propPatientId,
}: {
  patientId?: string;
}) {
  const params = useParams() as { id?: string };
  const patientId = propPatientId || params?.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const pid = patientId?.replace("P", "") || "101";
        const response = await axios.get(
          `http://localhost:8000/api/v1/risk/${pid}/fusion`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        setData(response.data);
        if (response.data?.predictions?.length > 0) {
          setSelectedPrediction(response.data.predictions[0]);
        }
      } catch (error) {
        console.error("Error fetching risk data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {" "}
        <div className="flex flex-col items-center gap-4">
          {" "}
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />{" "}
          <p className="text-cyan-500 font-medium">
            Running Multi-Model AI Fusion...
          </p>{" "}
        </div>{" "}
      </div>
    );
  }
  if (!data)
    return <div className="text-white">Failed to load risk intelligence.</div>;
  return (
    <div className="space-y-6">
      {" "}
      {}{" "}
      {data.risk_category === "Critical" || data.risk_category === "High" ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-500/10 border border-rose-500/50 rounded-2xl p-4 flex items-start gap-4 shadow-lg shadow-rose-500/5"
        >
          {" "}
          <div className="p-3 bg-rose-500/20 rounded-xl">
            {" "}
            <AlertTriangle className="w-6 h-6 text-rose-500" />{" "}
          </div>{" "}
          <div>
            {" "}
            <h2 className="text-rose-400 font-bold text-lg">
              EARLY WARNING: {data.risk_category.toUpperCase()} RISK DETECTED
            </h2>{" "}
            <p className="text-rose-200/80 text-sm mt-1">
              {" "}
              AI Fusion engine indicates elevated risk markers. Immediate
              clinical review recommended.{" "}
            </p>{" "}
          </div>{" "}
        </motion.div>
      ) : null}{" "}
      {}{" "}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {" "}
        <div className="dark bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-center items-center relative overflow-hidden">
          {" "}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />{" "}
          <h3 className="text-muted-foreground text-sm font-medium mb-2">
            Overall AI Risk Score
          </h3>{" "}
          <div className="text-6xl font-black text-white bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-500">
            {" "}
            {data.overall_risk_score}{" "}
          </div>{" "}
          <div className="dark mt-4 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-sm font-medium text-muted-foreground">
            {" "}
            Category:{" "}
            <span
              className={
                data.risk_category === "Critical"
                  ? "text-rose-500"
                  : data.risk_category === "High"
                    ? "text-orange-500"
                    : data.risk_category === "Moderate"
                      ? "text-yellow-500"
                      : "text-emerald-500"
              }
            >
              {data.risk_category}
            </span>{" "}
          </div>{" "}
        </div>{" "}
        <div className="dark md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          {" "}
          <div className="flex items-center gap-3 mb-4">
            {" "}
            <BrainCircuit className="w-5 h-5 text-fuchsia-500" />{" "}
            <h3 className="text-foreground font-medium">
              Multi-Model Fusion Engine
            </h3>{" "}
          </div>{" "}
          <div className="grid grid-cols-2 gap-4">
            {" "}
            <div className="dark bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              {" "}
              <div className="text-muted-foreground text-xs mb-1 uppercase tracking-wider">
                Fusion Method
              </div>{" "}
              <div className="text-slate-200 font-medium">
                {data.fusion_method}
              </div>{" "}
            </div>{" "}
            <div className="dark bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              {" "}
              <div className="text-muted-foreground text-xs mb-1 uppercase tracking-wider">
                Overall Confidence
              </div>{" "}
              <div className="text-slate-200 font-medium flex items-baseline gap-1">
                {" "}
                {data.overall_confidence}%{" "}
                <span className="text-[10px] text-emerald-500">High</span>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {" "}
        {}{" "}
        <div className="dark lg:col-span-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          {" "}
          <div className="flex items-center gap-3 mb-6">
            {" "}
            <ActivitySquare className="w-5 h-5 text-indigo-400" />{" "}
            <h3 className="text-foreground font-medium">Disease Predictions</h3>{" "}
          </div>{" "}
          <div className="space-y-3">
            {" "}
            {data.predictions?.map((pred: any, idx: number) => (
              <div
                key={pred.disease}
                onClick={() => setSelectedPrediction(pred)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedPrediction?.disease === pred.disease ? "bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/60"}`}
              >
                {" "}
                <div className="flex justify-between items-start mb-2">
                  {" "}
                  <h4 className="text-slate-200 font-medium text-sm">
                    {pred.disease}
                  </h4>{" "}
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded-md ${pred.risk_percent > 75 ? "bg-rose-500/20 text-rose-400" : pred.risk_percent > 40 ? "bg-orange-500/20 text-orange-400" : "bg-emerald-500/20 text-emerald-400"}`}
                  >
                    {" "}
                    {pred.risk_percent}%{" "}
                  </div>{" "}
                </div>{" "}
                <div className="dark w-full bg-slate-900 rounded-full h-1.5 mt-2">
                  {" "}
                  <div
                    className={`h-1.5 rounded-full ${pred.risk_percent > 75 ? "bg-rose-500" : pred.risk_percent > 40 ? "bg-orange-500" : "bg-emerald-500"}`}
                    style={{ width: `${pred.risk_percent}%` }}
                  />{" "}
                </div>{" "}
                <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
                  {" "}
                  <span>Confidence: {pred.confidence_score}%</span>{" "}
                  <span>Timeline: {pred.timeframe}</span>{" "}
                </div>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        {}{" "}
        <div className="dark lg:col-span-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col">
          {" "}
          <div className="flex items-center gap-3 mb-2">
            {" "}
            <ShieldAlert className="w-5 h-5 text-pink-500" />{" "}
            <h3 className="text-foreground font-medium">Organ Risk Radar</h3>{" "}
          </div>{" "}
          <p className="text-xs text-muted-foreground mb-4">
            Multi-system risk vulnerability mapping
          </p>{" "}
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            {" "}
            <RiskRadar data={data.organ_risks || {}} />{" "}
          </div>{" "}
        </div>{" "}
        {}{" "}
        <div className="lg:col-span-4">
          {" "}
          {selectedPrediction ? (
            <XAIExplanationPanel prediction={selectedPrediction} />
          ) : (
            <div className="dark h-full bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-center p-6 text-center text-muted-foreground">
              {" "}
              Select a disease prediction to view Explainable AI insights.{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
