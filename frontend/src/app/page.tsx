"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Center } from "@react-three/drei";
import {
  HeartPulse,
  Activity,
  AlertTriangle,
  ChevronRight,
  Brain,
  Droplets,
  Moon,
  Apple,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { api, PatientSummary, PatientDetails } from "../services/api";
import DashboardLayout from "../components/layout/DashboardLayout";
import DataFusionCenter from "../components/dashboard/DataFusionCenter";
import PatientDigitalTwin from "./(dashboard)/patients/[id]/twin/client";
import RiskCenterPage from "./(dashboard)/patients/[id]/risk-center/client";
import HealthSimulationStudio from "./(dashboard)/patients/[id]/simulator/client";
import DocumentCenter from "./(dashboard)/patients/[id]/documents/client";
import XAIModule from "../components/dashboard/XAIModule";
import LiveMonitor from "./(dashboard)/patients/[id]/live-monitor/client";
import DietIntelligence from "./(dashboard)/patients/[id]/nutrition/client";
import DoctorIntelligence from "./(dashboard)/patients/[id]/cdss/client";
import MedicationCenter from "./(dashboard)/patients/[id]/medications/client";
import AnalyticsDashboard from "./(dashboard)/analytics/page";
import EmergencyCenter from "./(dashboard)/emergency/page";
import HospitalIntelligence from "./(dashboard)/hospital/page";
import SettingsDashboard from "./(dashboard)/settings/page";

function HumanoidPlaceholder() {
  return (
    <group position={[0, -1, 0]}>
      {" "}
      {}{" "}
      <mesh position={[0, 2.5, 0]}>
        {" "}
        <sphereGeometry args={[0.4, 32, 32]} />{" "}
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} />{" "}
      </mesh>{" "}
      {}{" "}
      <mesh position={[0, 1, 0]}>
        {" "}
        <cylinderGeometry args={[0.5, 0.4, 2, 32]} />{" "}
        <meshStandardMaterial color="#94a3b8" roughness={0.4} />{" "}
      </mesh>{" "}
      {}{" "}
      <mesh position={[0.15, 1.3, 0.35]}>
        {" "}
        <sphereGeometry args={[0.15, 16, 16]} />{" "}
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.5}
        />{" "}
      </mesh>{" "}
    </group>
  );
};
export default function Home() {
  const [patients, setPatients] = React.useState<PatientSummary[]>([]);
  const [selectedPatientId, setSelectedPatientId] = React.useState<string>("1");
  const [patientDetails, setPatientDetails] = React.useState<PatientDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("overview");
  const router = useRouter();

  React.useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("token");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setIsCheckingAuth(false);
    
    async function init() {
      try {
        const list = await api.getPatients();
        setPatients(list);
        if (list.length > 0) setSelectedPatientId(list[0].id);
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  React.useEffect(() => {
    if (!selectedPatientId) return;
    async function load() {
      setIsLoading(true);
      try {
        const details = await api.getPatientDetails(selectedPatientId);
        setPatientDetails(details);
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedPatientId]);

  const radarData = patientDetails?.ai_fusion?.predictions
    ? Object.entries(patientDetails.ai_fusion.predictions)
        .slice(0, 6)
        .map(([key, val]: any) => ({
          subject: key,
          A: val.risk_percent,
          fullMark: 100,
        }))
    : [];

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
          <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
          <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (isLoading && !patientDetails) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading CogniVueX Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      patients={patients}
      selectedPatientId={selectedPatientId}
      onSelectPatient={setSelectedPatientId}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {" "}
      <div className="space-y-6 h-full">
        {" "}
        {activeTab === "fusion" && (
          <DataFusionCenter patientId={selectedPatientId} />
        )}{" "}
        {activeTab === "digital-twin" && (
          <PatientDigitalTwin patientId={selectedPatientId} />
        )}{" "}
        {activeTab === "risk-center" && (
          <RiskCenterPage patientId={selectedPatientId} />
        )}{" "}
        {activeTab === "simulator" && (
          <HealthSimulationStudio patientId={selectedPatientId} />
        )}{" "}
        {activeTab === "labs" && (
          <DocumentCenter patientId={selectedPatientId} />
        )}{" "}
        {activeTab === "xai" && <XAIModule patientId={selectedPatientId} />}
        {activeTab === "monitoring" && (
          <LiveMonitor patientId={selectedPatientId} />
        )}{" "}
        {activeTab === "diet" && (
          <DietIntelligence patientId={selectedPatientId} />
        )}{" "}
        {activeTab === "doctors" && (
          <DoctorIntelligence patientId={selectedPatientId} />
        )}{" "}
        {activeTab === "medication" && (
          <MedicationCenter patientId={selectedPatientId} />
        )}{" "}
        {activeTab === "analytics" && <AnalyticsDashboard />}{" "}
        {activeTab === "emergency" && <EmergencyCenter />}
        {activeTab === "hospitals" && <HospitalIntelligence />}
        {activeTab === "settings" && <SettingsDashboard />}
        {activeTab === "overview" && (
          <>
            {" "}
            {}{" "}
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-1 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {" "}
              {}{" "}
              <div className="bg-card rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                {" "}
                <div className="flex justify-between items-start mb-4">
                  {" "}
                  <span className="text-sm font-semibold text-muted-foreground">
                    Health Score
                  </span>{" "}
                  <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">
                    +2.4%
                  </span>{" "}
                </div>{" "}
                <div className="flex items-center space-x-4">
                  {" "}
                  <div className="relative h-16 w-16">
                    {" "}
                    <svg className="w-full h-full transform -rotate-90">
                      {" "}
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-slate-100"
                      />{" "}
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray="175"
                        strokeDashoffset="14"
                        className="text-emerald-500 drop-shadow-md"
                        strokeLinecap="round"
                      />{" "}
                    </svg>{" "}
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-foreground">
                      {" "}
                      {patientDetails?.metrics?.overall_health_score || "--"}{" "}
                    </div>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <p className="text-xs text-muted-foreground">
                      Target: 100
                    </p>{" "}
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      Optimal Range
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>{" "}
              </div>{" "}
              {}{" "}
              <div className="bg-card rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                {" "}
                <div className="flex justify-between items-start mb-4">
                  {" "}
                  <span className="text-sm font-semibold text-muted-foreground">
                    Biological Age
                  </span>{" "}
                  <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded text-xs font-bold">
                    Excellent
                  </span>{" "}
                </div>{" "}
                <div className="flex items-end space-x-2">
                  {" "}
                  <span className="text-2xl md:text-2xl md:text-2xl md:text-3xl font-extrabold text-foreground">
                    {patientDetails?.metrics?.biological_age || "--"}
                  </span>{" "}
                  <span className="text-sm text-muted-foreground mb-1">
                    years
                  </span>{" "}
                </div>{" "}
                <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  {" "}
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: "42%" }}
                  ></div>{" "}
                  <div className="bg-slate-300 h-full w-0.5"></div>{" "}
                  <div
                    className="bg-slate-200 h-full"
                    style={{ width: "58%" }}
                  ></div>{" "}
                </div>{" "}
                <p className="text-xs text-muted-foreground mt-2">
                  Actual age: {patientDetails?.demographics?.age || "--"}{" "}
                  (Difference: -3y)
                </p>{" "}
              </div>{" "}
              {}{" "}
              <div className="bg-card rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                {" "}
                <div className="flex justify-between items-start mb-4">
                  {" "}
                  <span className="text-sm font-semibold text-muted-foreground">
                    Life Expectancy
                  </span>{" "}
                  <span className="text-muted-foreground bg-slate-100 px-2 py-0.5 rounded text-xs font-bold">
                    94% Conf.
                  </span>{" "}
                </div>{" "}
                <div className="flex items-end space-x-2">
                  {" "}
                  <span className="text-2xl md:text-2xl md:text-2xl md:text-3xl font-extrabold text-foreground">
                    {patientDetails?.metrics?.life_expectancy || "--"}
                  </span>{" "}
                  <span className="text-sm text-muted-foreground mb-1">
                    years
                  </span>{" "}
                </div>{" "}
                <div className="mt-4 flex items-center space-x-1">
                  {" "}
                  <div className="flex-1 h-8 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-lg relative overflow-hidden">
                    {" "}
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-emerald-400 w-3/4"></div>{" "}
                  </div>{" "}
                </div>{" "}
                <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center">
                  <Activity className="h-3 w-3 mr-1" /> +1.2y trend
                </p>{" "}
              </div>{" "}
              {}{" "}
              <div className="bg-card rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                {" "}
                <span className="text-sm font-semibold text-muted-foreground mb-2 block">
                  Wellness Index
                </span>{" "}
                <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-2">
                  {" "}
                  <div className="bg-slate-50 p-2 rounded-lg flex items-center space-x-2">
                    {" "}
                    <Moon className="h-4 w-4 text-indigo-500" />{" "}
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        Sleep
                      </p>
                      <p className="text-xs font-bold text-foreground">7.2h</p>
                    </div>{" "}
                  </div>{" "}
                  <div className="bg-slate-50 p-2 rounded-lg flex items-center space-x-2">
                    {" "}
                    <Activity className="h-4 w-4 text-orange-500" />{" "}
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        Activity
                      </p>
                      <p className="text-xs font-bold text-foreground">8.5k</p>
                    </div>{" "}
                  </div>{" "}
                  <div className="bg-slate-50 p-2 rounded-lg flex items-center space-x-2">
                    {" "}
                    <Apple className="h-4 w-4 text-emerald-500" />{" "}
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        Diet
                      </p>
                      <p className="text-xs font-bold text-foreground">Good</p>
                    </div>{" "}
                  </div>{" "}
                  <div className="bg-slate-50 p-2 rounded-lg flex items-center space-x-2">
                    {" "}
                    <Droplets className="h-4 w-4 text-blue-500" />{" "}
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        Hydration
                      </p>
                      <p className="text-xs font-bold text-foreground">2.1L</p>
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {}{" "}
            <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {" "}
              {}{" "}
              <div className="lg:col-span-2 bg-card rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                {" "}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  {" "}
                  <div>
                    {" "}
                    <h2 className="font-bold text-foreground text-lg">
                      Digital Twin Snapshot
                    </h2>{" "}
                    <p className="text-xs text-muted-foreground">
                      Interactive 3D representation of current physiological
                      state
                    </p>{" "}
                  </div>{" "}
                  <button className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center">
                    {" "}
                    Open Control Center{" "}
                    <ChevronRight className="h-4 w-4 ml-1" />{" "}
                  </button>{" "}
                </div>{" "}
                <div className="flex-1 relative bg-gradient-to-b from-slate-50 to-slate-100/50">
                  {" "}
                  {}{" "}
                  <div className="absolute inset-0">
                    {" "}
                    <React.Suspense
                      fallback={
                        <div className="h-full w-full flex items-center justify-center">
                          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                      }
                    >
                      {" "}
                      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
                        <ambientLight intensity={0.8} />
                        <directionalLight position={[10, 10, 5]} intensity={1} />
                        <Stage intensity={0.5} environment={null}>
                          <Center>
                            <HumanoidPlaceholder />
                          </Center>
                        </Stage>
                        <OrbitControls
                          autoRotate
                          autoRotateSpeed={1}
                          enableZoom={false}
                        />{" "}
                      </Canvas>{" "}
                    </React.Suspense>{" "}
                  </div>{" "}
                  {}{" "}
                  <div className="absolute top-6 right-6 space-y-3">
                    {" "}
                    <div className="bg-card/90 backdrop-blur border border-slate-200 px-3 py-2 rounded-lg shadow-sm flex items-center space-x-2">
                      {" "}
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>{" "}
                      <span className="text-xs font-semibold text-foreground">
                        Heart (Elevated Risk)
                      </span>{" "}
                    </div>{" "}
                    <div className="bg-card/90 backdrop-blur border border-slate-200 px-3 py-2 rounded-lg shadow-sm flex items-center space-x-2">
                      {" "}
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>{" "}
                      <span className="text-xs font-semibold text-foreground">
                        Kidney (Optimal)
                      </span>{" "}
                    </div>{" "}
                    <div className="bg-card/90 backdrop-blur border border-slate-200 px-3 py-2 rounded-lg shadow-sm flex items-center space-x-2">
                      {" "}
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>{" "}
                      <span className="text-xs font-semibold text-foreground">
                        Lungs (Optimal)
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {}{" "}
              <div className="space-y-6 flex flex-col h-[500px]">
                {" "}
                {}{" "}
                <div className="bg-card rounded-2xl border border-slate-200 shadow-sm p-5 flex-1 flex flex-col">
                  {" "}
                  <h3 className="font-bold text-foreground mb-1">
                    Disease Risk Radar
                  </h3>{" "}
                  <p className="text-xs text-muted-foreground mb-4">
                    Multi-vector analysis model
                  </p>{" "}
                  <div className="flex-1 -mx-4 -mt-4">
                    {" "}
                    <ResponsiveContainer width="100%" height="100%">
                      {" "}
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        data={radarData}
                      >
                        {" "}
                        <PolarGrid stroke="#e2e8f0" />{" "}
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{
                            fill: "#64748b",
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        />{" "}
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          tick={false}
                          axisLine={false}
                        />{" "}
                        <Radar
                          name="Risk Level"
                          dataKey="A"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          fill="#0ea5e9"
                          fillOpacity={0.2}
                        />{" "}
                      </RadarChart>{" "}
                    </ResponsiveContainer>{" "}
                  </div>{" "}
                </div>{" "}
                {}{" "}
                <div className="bg-card rounded-2xl border border-slate-200 shadow-sm p-5 flex-1 flex flex-col overflow-hidden">
                  {" "}
                  <h3 className="font-bold text-foreground mb-1 flex items-center">
                    {" "}
                    <Brain className="h-4 w-4 mr-2 text-indigo-500" /> AI
                    Insights (SHAP){" "}
                  </h3>{" "}
                  <p className="text-xs text-muted-foreground mb-4">
                    Actionable intelligence from XAI
                  </p>{" "}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                    {" "}
                    {patientDetails?.ai_fusion?.xai_shap?.map(
                      (insight: any, i: number) => (
                        <div
                          key={i}
                          className="bg-slate-50 border border-slate-200 p-3 rounded-xl hover:border-blue-300 transition-colors cursor-pointer group"
                        >
                          {" "}
                          <div className="flex justify-between items-start mb-1">
                            {" "}
                            <span className="font-semibold text-sm text-foreground group-hover:text-blue-700">
                              {insight.reason}
                            </span>{" "}
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${insight.impact > 0.5 ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"}`}
                            >
                              {" "}
                              {insight.impact > 0.5
                                ? "High Impact"
                                : "Med Impact"}{" "}
                            </span>{" "}
                          </div>{" "}
                          <p className="text-xs text-muted-foreground">
                            Feature: {insight.name} ({insight.value})
                          </p>{" "}
                        </div>
                      ),
                    )}{" "}
                    {!patientDetails?.ai_fusion?.xai_shap?.length && (
                      <div className="text-xs text-muted-foreground p-3 text-center">
                        No AI insights available.
                      </div>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </>
        )}{" "}
      </div>{" "}
    </DashboardLayout>
  );
}
