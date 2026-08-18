"use client";
import { BASE_URL } from "../../services/api";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network,
  Activity,
  Droplet,
  Flame,
  FileText,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Brain,
  Info
} from "lucide-react";
import { api } from "@/services/api";

export default function DataFusionCenter({ patientId }: { patientId: string }) {
  const [activeNode, setActiveNode] = useState<string | null>("core");
  const [isFusing, setIsFusing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [fusionData, setFusionData] = useState<any>(null);

  const fetchFusionData = async () => {
    try {
      setIsFusing(true);
      const pid = patientId?.replace("P", "") || "101";
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${BASE_URL}/twin/patient/${pid}/fusion`, {
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setFusionData(data);
      }
    } catch (err) {
      console.error(`Failed to fetch fusion data:", err);
    } finally {
      setIsFusing(false);
    }
  };

  useEffect(() => {
    fetchFusionData();
  }, [patientId]);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const pid = patientId?.replace("P", "") || "101";
    const formData = new FormData();
    formData.append("patient_id", pid);
    formData.append("file", file);
    setUploadStatus("Uploading & Analyzing...");
    setIsFusing(true);
    setActiveNode("core");
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${BASE_URL}/documents/upload`, {
        method: `POST",
        headers: headers,
        body: formData,
      });
      if (res.ok) {
        setUploadStatus("Analysis Complete!");
        // Fetch new data after upload
        setTimeout(fetchFusionData, 1000);
      } else {
        setUploadStatus("Upload Failed.");
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("Error uploading document.");
    } finally {
      setTimeout(() => {
        setIsFusing(false);
        setUploadStatus(null);
      }, 3000);
    }
  };
  const triggerFusion = () => {
    setActiveNode("core");
    fetchFusionData();
  };
  const getIconForId = (id: string) => {
    if (id === "cbc") return Droplet;
    if (id === "lipid") return Flame;
    if (id === "metabolic") return FileText;
    if (id === "renal") return Activity;
    return Activity;
  };

  const nodes = fusionData?.panels?.map((p: any) => ({
    ...p,
    icon: getIconForId(p.id)
  })) || [];
  return (
    <div className="h-full flex flex-col space-y-6">
      {" "}
      <div className="flex justify-between items-end">
        {" "}
        <div>
          {" "}
          <h2 className="text-xl font-bold text-foreground flex items-center">
            {" "}
            <Network className="mr-2 h-6 w-6 text-indigo-600" /> Multi-Modal
            Data Fusion Center{" "}
          </h2>{" "}
          <p className="text-sm text-muted-foreground mt-1">
            Unified correlation engine synthesizing all lab streams into a
            single intelligence model.
          </p>{" "}
        </div>{" "}
        <div className="flex items-center space-x-3">
          {" "}
          <label className="flex items-center space-x-2 bg-card border border-slate-300 hover:bg-slate-50 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-70">
            {" "}
            <UploadCloud className="h-4 w-4" />
            <span>Upload Report</span>{" "}
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg"
              disabled={isFusing}
            />{" "}
          </label>{" "}
          <button
            onClick={triggerFusion}
            disabled={isFusing}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
          >
            {" "}
            {isFusing && !uploadStatus ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Fusing Streams...</span>
              </>
            ) : (
              <>
                <Network className="h-4 w-4" />
                <span>Force Resync</span>
              </>
            )}{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {" "}
        {}{" "}
        <div className="lg:col-span-2 bg-card border border-slate-200 rounded-2xl shadow-sm p-4 md:p-4 md:p-4 md:p-8 relative flex items-center justify-center overflow-hidden">
          {" "}
          {}{" "}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=')] opacity-50"></div>{" "}
          <div className="relative w-full max-w-lg aspect-square">
            {" "}
            {}{" "}
            <motion.div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 flex items-center justify-center z-20 cursor-pointer transition-colors ${activeNode === "core" ? "border-indigo-500 bg-indigo-50 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)]" : "border-slate-300 bg-card hover:border-indigo-400"}`}
              animate={{ scale: isFusing ? [1, 1.1, 1] : 1 }}
              transition={{ repeat: isFusing ? Infinity : 0, duration: 1 }}
              onClick={() => setActiveNode("core")}
            >
              {" "}
              <Brain
                className={`h-12 w-12 ${activeNode === "core" ? "text-indigo-600" : "text-muted-foreground"}`}
              />{" "}
            </motion.div>{" "}
            {}{" "}
            {nodes.map((node: any, i: number) => {
              const angle = (i * Math.PI * 2) / nodes.length - Math.PI / 4;
              const radius = 120;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const isActive = activeNode === node.id;
              return (
                <React.Fragment key={node.id}>
                  {" "}
                  {}{" "}
                  <svg className="absolute top-1/2 left-1/2 overflow-visible pointer-events-none -translate-x-1/2 -translate-y-1/2 w-full h-full z-0">
                    {" "}
                    <line
                      x1="0"
                      y1="0"
                      x2={x}
                      y2={y}
                      stroke={isActive || isFusing ? "#818cf8" : "#e2e8f0"}
                      strokeWidth={isActive || isFusing ? 3 : 2}
                      strokeDasharray={isFusing ? "6 6" : "0"}
                      className={
                        isFusing ? "animate-[dash_1s_linear_infinite]" : ""
                      }
                    />{" "}
                  </svg>{" "}
                  {}{" "}
                  <motion.div
                    className={`absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer bg-card z-10 transition-all ${isActive ? `border-${node.color.split("-")[1]}-500 shadow-md scale-110` : "border-slate-200 hover:border-slate-400"}`}
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => setActiveNode(node.id)}
                    whileHover={{ scale: 1.05 }}
                  >
                    {" "}
                    <node.icon
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? node.color : "text-muted-foreground"}`}
                    />{" "}
                    <span className="text-[8px] sm:text-[9px] font-bold text-foreground mt-1 truncate w-14 sm:w-16 text-center">
                      {node.label}
                    </span>{" "}
                  </motion.div>{" "}
                </React.Fragment>
              );
            })}{" "}
          </div>{" "}
          <style
            dangerouslySetInnerHTML={{
              __html: ` @keyframes dash { to { stroke-dashoffset: -12; } } `,
            }}
          />{" "}
        </div>{" "}
        {}{" "}
        <div className="bg-card border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {" "}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            {" "}
            <h3 className="font-bold text-foreground">
              {" "}
              {activeNode === "core"
                ? "Synthesized Intelligence"
                : nodes.find((n: any) => n.id === activeNode)?.label + " Data"}{" "}
            </h3>{" "}
          </div>{" "}
          <div className="p-5 flex-1 overflow-y-auto">
            {" "}
            <AnimatePresence mode="wait">
              {" "}
              {isFusing ? (
                <motion.div
                  key="fusing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-muted-foreground"
                >
                  {" "}
                  <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>{" "}
                  <p className="text-sm font-medium">
                    {uploadStatus || "Correlating multi-modal streams..."}
                  </p>{" "}
                </motion.div>
              ) : activeNode === "core" ? (
                <motion.div
                  key="core"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {" "}
                  {fusionData?.has_data ? (
                    <>
                      {fusionData.insights.map((insight: any, idx: number) => {
                        const Icon = insight.type === "warning" ? AlertTriangle : insight.type === "success" ? CheckCircle2 : Info;
                        const bgClass = insight.type === "warning" ? "bg-amber-50 border-amber-200" : insight.type === "success" ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200";
                        const textClass = insight.type === "warning" ? "text-amber-900" : insight.type === "success" ? "text-emerald-900" : "text-blue-900";
                        const descClass = insight.type === "warning" ? "text-amber-800" : insight.type === "success" ? "text-emerald-800" : "text-blue-800";
                        
                        return (
                          <div key={idx} className={`border p-4 rounded-xl ${bgClass}`}>
                            <div className="flex items-center mb-2">
                              <Icon className={`h-4 w-4 mr-2 ${textClass}`} />
                              <span className={`font-bold text-sm ${textClass}`}>
                                {insight.title}
                              </span>
                            </div>
                            <p className={`text-xs leading-relaxed ${descClass}`}>
                              {insight.description}
                            </p>
                          </div>
                        );
                      })}
                      
                      {fusionData.action_plan && fusionData.action_plan.length > 0 && (
                        <div className="pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3">
                            AI Action Plan
                          </h4>
                          <ul className="space-y-2 text-sm text-foreground">
                            {fusionData.action_plan.map((action: string, idx: number) => (
                              <li key={idx} className="flex items-start">
                                <ChevronRight className="h-4 w-4 text-indigo-500 mr-1 shrink-0 mt-0.5" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-4 md:p-4 md:p-4 md:p-6 text-muted-foreground">
                      <p>No lab data found for this patient.</p>
                      <p className="text-sm mt-2">Upload a medical report to generate insights.</p>
                    </div>
                  )}
                  {" "}

                </motion.div>
              ) : (
                <motion.div
                  key={activeNode}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {" "}
                  <p className="text-xs text-muted-foreground mb-4">
                    Raw extracted parameters awaiting fusion:
                  </p>{" "}
                  <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-3">
                    {" "}
                    {Object.entries(
                      nodes.find((n: any) => n.id === activeNode)?.data || {},
                    ).map(([key, val]: [string, any]) => (
                      <div
                        key={key}
                        className="bg-slate-50 border border-slate-200 p-3 rounded-lg"
                      >
                        {" "}
                        <span className="text-[10px] text-muted-foreground uppercase block font-bold mb-1">
                          {key}
                        </span>{" "}
                        <span className="text-sm font-semibold text-foreground">
                          {val}
                        </span>{" "}
                      </div>
                    ))}{" "}
                  </div>{" "}
                </motion.div>
              )}{" "}
            </AnimatePresence>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
