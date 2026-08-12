"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SHAPPanel } from "./SHAPPanel";
import { ReasoningPanel } from "./ReasoningPanel";
import { CounterfactualPanel } from "./CounterfactualPanel";
import { ChatAssistant } from "./ChatAssistant";
import { ReportPanel } from "./ReportPanel";
import {
  BrainCircuit,
  GitBranch,
  Wand2,
  MessageCircle,
  FileText,
  Stethoscope,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
interface AIIntelligenceDashboardProps {
  patientId: string;
};
export const AIIntelligenceDashboard: React.FC<
  AIIntelligenceDashboardProps
> = ({ patientId }) => {
  const [xaiData, setXaiData] = useState<any>(null);
  const [reasoningData, setReasoningData] = useState<any[]>([]);
  const [counterfactual, setCounterfactual] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [reportType, setReportType] = useState("patient");
  const [loading, setLoading] = useState(true);
  const [selectedDisease, setSelectedDisease] = useState("Cardiovascular");
  const [activeTab, setActiveTab] = useState("xai");
  const API = process.env.NEXT_PUBLIC_API_URL;
  const fetchReport = async (type: string) => {
    const token = localStorage.getItem("token");
    const pid = patientId || "P101";
    const res = await fetch(
      `${API}/api/v1/intelligence/patients/${pid}/report?report_type=${type}`,
      {
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
      },
    );
    setReport(await res.json());
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        const pid = patientId || "P101";
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [xaiRes, reasonRes, cfRes] = await Promise.all([
          fetch(
            `${API}/api/v1/intelligence/patients/${pid}/xai?disease=${selectedDisease}`,
            { headers },
          ),
          fetch(`${API}/api/v1/intelligence/patients/${pid}/reasoning`, { headers }),
          fetch(`${API}/api/v1/intelligence/patients/${pid}/counterfactual`, {
            headers,
          }),
        ]);
        const [xai, reason, cf] = await Promise.all([
          xaiRes.json(),
          reasonRes.json(),
          cfRes.json(),
        ]);
        setXaiData(xai.shap_analysis);
        setReasoningData(reason.reasoning_chain || []);
        setCounterfactual(cf);
        await fetchReport("patient");
      } catch (e) {
        console.error("Failed to load intelligence data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [patientId, selectedDisease]);
  const handleChangeReportType = async (type: string) => {
    setReportType(type);
    await fetchReport(type);
  };
  if (loading) {
    return (
      <div className="flex h-[500px] items-center justify-center gap-3">
        {" "}
        <Loader2 className="w-6 h-6 animate-spin text-primary" />{" "}
        <span className="text-muted-foreground">
          Initializing AI Medical Intelligence Center...
        </span>{" "}
      </div>
    );
  }
  const diseases = [
    "Cardiovascular",
    "Diabetes",
    "Kidney",
    "Respiratory",
    "Liver",
  ];
  return (
    <div className="space-y-6">
      {" "}
      {}{" "}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl md:text-2xl md:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            {" "}
            <BrainCircuit className="w-8 h-8 text-primary" /> AI Medical
            Intelligence Center{" "}
          </h1>{" "}
          <p className="text-muted-foreground mt-1">
            {" "}
            Explainable predictions, medical reasoning, counterfactual analysis,
            and intelligent assistant.{" "}
          </p>{" "}
        </div>{" "}
        {}{" "}
        <div className="flex items-center gap-2 flex-wrap">
          {" "}
          <span className="text-xs text-muted-foreground">Analyzing:</span>{" "}
          {diseases.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDisease(d)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${selectedDisease === d ? "bg-primary text-primary-foreground border-transparent shadow-sm" : "border-muted-foreground/20 hover:bg-muted text-muted-foreground"}`}
            >
              {" "}
              {d}{" "}
            </button>
          ))}{" "}
        </div>{" "}
      </div>{" "}
      {}{" "}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {" "}
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 md:grid-cols-3 xl:grid-cols-5 h-12">
          {" "}
          <TabsTrigger value="xai" className="gap-2 text-xs">
            {" "}
            <BrainCircuit className="w-4 h-4" /> SHAP Analysis{" "}
          </TabsTrigger>{" "}
          <TabsTrigger value="reasoning" className="gap-2 text-xs">
            {" "}
            <GitBranch className="w-4 h-4" /> Reasoning{" "}
          </TabsTrigger>{" "}
          <TabsTrigger value="counterfactual" className="gap-2 text-xs">
            {" "}
            <Wand2 className="w-4 h-4" /> What-If{" "}
          </TabsTrigger>{" "}
          <TabsTrigger value="assistant" className="gap-2 text-xs">
            {" "}
            <MessageCircle className="w-4 h-4" /> AI Assistant{" "}
          </TabsTrigger>{" "}
          <TabsTrigger value="reports" className="gap-2 text-xs">
            {" "}
            <FileText className="w-4 h-4" /> Reports{" "}
          </TabsTrigger>{" "}
        </TabsList>{" "}
        {}{" "}
        <TabsContent value="xai" className="mt-6">
          {" "}
          <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6 min-h-[700px]">
            {" "}
            <div className="bg-background border rounded-xl p-5 shadow-sm">
              {" "}
              <SHAPPanel shap={xaiData} />{" "}
            </div>{" "}
            <div className="bg-background border rounded-xl p-5 shadow-sm">
              {" "}
              <ReasoningPanel chain={reasoningData} />{" "}
            </div>{" "}
          </div>{" "}
        </TabsContent>{" "}
        {}{" "}
        <TabsContent value="reasoning" className="mt-6">
          {" "}
          <div className="bg-background border rounded-xl p-5 shadow-sm min-h-[700px]">
            {" "}
            <ReasoningPanel chain={reasoningData} />{" "}
          </div>{" "}
        </TabsContent>{" "}
        {}{" "}
        <TabsContent value="counterfactual" className="mt-6">
          {" "}
          <div className="bg-background border rounded-xl p-5 shadow-sm min-h-[700px]">
            {" "}
            <CounterfactualPanel counterfactual={counterfactual} />{" "}
          </div>{" "}
        </TabsContent>{" "}
        {}{" "}
        <TabsContent value="assistant" className="mt-6">
          {" "}
          <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6 min-h-[700px]">
            {" "}
            <div className="bg-background border rounded-xl overflow-hidden shadow-sm h-[700px] flex flex-col">
              {" "}
              <ChatAssistant patientId={patientId} mode="patient" />{" "}
            </div>{" "}
            <div className="bg-background border rounded-xl overflow-hidden shadow-sm h-[700px] flex flex-col">
              {" "}
              <ChatAssistant patientId={patientId} mode="clinician" />{" "}
            </div>{" "}
          </div>{" "}
        </TabsContent>{" "}
        {}{" "}
        <TabsContent value="reports" className="mt-6">
          {" "}
          <div className="bg-background border rounded-xl p-5 shadow-sm min-h-[700px]">
            {" "}
            <ReportPanel
              report={report}
              reportType={reportType}
              onChangeType={handleChangeReportType}
            />{" "}
          </div>{" "}
        </TabsContent>{" "}
      </Tabs>{" "}
    </div>
  );
};
