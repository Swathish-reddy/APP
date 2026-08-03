"use client";
import React, { useState, useEffect } from "react";
import {
  Beaker,
  Play,
  Save,
  Activity,
  Brain,
  Heart,
  ArrowRight,
  Zap,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
export default function HealthSimulationStudio({
  params,
  patientId: propPatientId,
}: {
  params?: { id: string };
  patientId?: string;
}) {
  const patientId = propPatientId || params?.id;
  const [modifiers, setModifiers] = useState({
    weight_change: 0,
    exercise_increase: 0,
    sleep_change: 0,
  });
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);
  const fetchHistory = async () => {
    try {
      const pid = patientId?.replace("P", "");
      const res = await fetch(
        `http://localhost:8000/api/v1/simulator/patient/${pid}/history`,
      );
      if (res.ok) setSavedScenarios(await res.json());
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    fetchHistory();
  }, [patientId]);
  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const pid = patientId?.replace("P", "");
      const res = await fetch(
        `http://localhost:8000/api/v1/simulator/patient/${pid}/run`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modifiers),
        },
      );
      if (res.ok) {
        setSimulationResult(await res.json());
      }
    } catch (e) {
      console.error("Simulation failed", e);
    } finally {
      setIsSimulating(false);
    }
  };
  const saveScenario = async () => {
    if (!simulationResult) return;
    setIsSaving(true);
    try {
      const pid = patientId?.replace("P", "");
      const payload = {
        scenario_name: `Sim: ${modifiers.weight_change}kg, +${modifiers.exercise_increase}min Ex`,
        modifiers: modifiers,
        projected_health_score: simulationResult.projected.health_score,
        projected_biological_age: simulationResult.projected.biological_age,
        xai_insights: simulationResult.xai_insights,
      };
      await fetch(
        `http://localhost:8000/api/v1/simulator/patient/${pid}/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      await fetchHistory();
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setIsSaving(false);
    }
  };
  const chartData = simulationResult
    ? [
        {
          name: "Health Score",
          Current: simulationResult.current.health_score,
          Projected: simulationResult.projected.health_score,
        },
        {
          name: "Cardiac",
          Current: simulationResult.current.organs.cardiac,
          Projected: simulationResult.projected.organs.cardiac,
        },
        {
          name: "Metabolic",
          Current: simulationResult.current.organs.metabolic,
          Projected: simulationResult.projected.organs.metabolic,
        },
        {
          name: "Brain",
          Current: simulationResult.current.organs.brain,
          Projected: simulationResult.projected.organs.brain,
        },
      ]
    : [];
  return (
    <div className="py-6 h-[calc(100vh-80px)] flex flex-col">
      {" "}
      {}{" "}
      <div className="flex justify-between items-end mb-6 flex-shrink-0">
        {" "}
        <div>
          {" "}
          <h2 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            {" "}
            <Beaker className="w-8 h-8 text-fuchsia-400" /> Health Simulation
            Studio{" "}
          </h2>{" "}
          <p className="text-muted-foreground mt-1">
            Test lifestyle and clinical interventions against the Digital Twin.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {" "}
        {}{" "}
        <div className="dark lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col overflow-y-auto custom-scrollbar">
          {" "}
          <h3 className="text-lg font-bold text-slate-200 mb-6">
            Intervention Modifiers
          </h3>{" "}
          <div className="space-y-6 flex-1">
            {" "}
            {}{" "}
            <div>
              {" "}
              <div className="flex justify-between text-sm mb-2">
                {" "}
                <span className="text-muted-foreground">
                  Weight Change (kg)
                </span>{" "}
                <span className="text-foreground font-bold">
                  {modifiers.weight_change > 0 ? "+" : ""}
                  {modifiers.weight_change} kg
                </span>{" "}
              </div>{" "}
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={modifiers.weight_change}
                onChange={(e) =>
                  setModifiers({
                    ...modifiers,
                    weight_change: parseInt(e.target.value),
                  })
                }
                className="w-full accent-fuchsia-500"
              />{" "}
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>-30 Loss</span>
                <span>+30 Gain</span>
              </div>{" "}
            </div>{" "}
            {}{" "}
            <div>
              {" "}
              <div className="flex justify-between text-sm mb-2">
                {" "}
                <span className="text-muted-foreground">
                  Added Exercise (mins/day)
                </span>{" "}
                <span className="text-foreground font-bold">
                  +{modifiers.exercise_increase} min
                </span>{" "}
              </div>{" "}
              <input
                type="range"
                min="0"
                max="120"
                step="10"
                value={modifiers.exercise_increase}
                onChange={(e) =>
                  setModifiers({
                    ...modifiers,
                    exercise_increase: parseInt(e.target.value),
                  })
                }
                className="w-full accent-fuchsia-500"
              />{" "}
            </div>{" "}
            {}{" "}
            <div>
              {" "}
              <div className="flex justify-between text-sm mb-2">
                {" "}
                <span className="text-muted-foreground">
                  Sleep Adjustment (hrs)
                </span>{" "}
                <span className="text-foreground font-bold">
                  {modifiers.sleep_change > 0 ? "+" : ""}
                  {modifiers.sleep_change} hrs
                </span>{" "}
              </div>{" "}
              <input
                type="range"
                min="-3"
                max="3"
                step="0.5"
                value={modifiers.sleep_change}
                onChange={(e) =>
                  setModifiers({
                    ...modifiers,
                    sleep_change: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-fuchsia-500"
              />{" "}
            </div>{" "}
          </div>{" "}
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="w-full mt-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(192,38,211,0.3)] transition-all flex justify-center items-center gap-2"
          >
            {" "}
            {isSimulating ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}{" "}
            Run Simulation{" "}
          </button>{" "}
        </div>{" "}
        {}{" "}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {" "}
          <div className="dark bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col">
            {" "}
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center justify-between">
              {" "}
              Twin State Comparison{" "}
              {simulationResult && (
                <button
                  onClick={saveScenario}
                  disabled={isSaving}
                  className="dark text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-muted-foreground rounded-lg flex items-center gap-2"
                >
                  {" "}
                  <Save className="w-4 h-4" /> Save Scenario{" "}
                </button>
              )}{" "}
            </h3>{" "}
            {!simulationResult ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-slate-800 rounded-xl">
                {" "}
                <Beaker className="w-12 h-12 mb-4 text-foreground" />{" "}
                <p>
                  Adjust variables and run a simulation to see the projected
                  impact.
                </p>{" "}
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {" "}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {" "}
                  <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex justify-between items-center">
                    {" "}
                    <div>
                      {" "}
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">
                        Health Score
                      </p>{" "}
                      <div className="flex items-baseline gap-2">
                        {" "}
                        <span className="text-2xl font-bold text-muted-foreground">
                          {simulationResult.current.health_score}
                        </span>{" "}
                        <ArrowRight className="w-4 h-4 text-foreground" />{" "}
                        <span className="text-3xl font-black text-fuchsia-400">
                          {simulationResult.projected.health_score}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex justify-between items-center">
                    {" "}
                    <div>
                      {" "}
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">
                        Biological Age
                      </p>{" "}
                      <div className="flex items-baseline gap-2">
                        {" "}
                        <span className="text-2xl font-bold text-muted-foreground">
                          {simulationResult.current.biological_age}
                        </span>{" "}
                        <ArrowRight className="w-4 h-4 text-foreground" />{" "}
                        <span className="text-3xl font-black text-emerald-400">
                          {simulationResult.projected.biological_age}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex-1 min-h-[250px]">
                  {" "}
                  <ResponsiveContainer width="100%" height="100%">
                    {" "}
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      {" "}
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1e293b"
                        vertical={false}
                      />{" "}
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                      />{" "}
                      <YAxis
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                        domain={[0, 100]}
                      />{" "}
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#1e293b",
                        }}
                      />{" "}
                      <Legend />{" "}
                      <Bar
                        dataKey="Current"
                        fill="#334155"
                        radius={[4, 4, 0, 0]}
                      />{" "}
                      <Bar
                        dataKey="Projected"
                        fill="#c026d3"
                        radius={[4, 4, 0, 0]}
                      />{" "}
                    </BarChart>{" "}
                  </ResponsiveContainer>{" "}
                </div>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
        {}{" "}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {" "}
          <div className="dark bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex-1 overflow-y-auto custom-scrollbar">
            {" "}
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              {" "}
              <Brain className="w-4 h-4" /> Explainable AI (XAI){" "}
            </h3>{" "}
            {!simulationResult ? (
              <p className="text-sm text-foreground italic">
                No simulation running.
              </p>
            ) : (
              <div className="space-y-3">
                {" "}
                {simulationResult.xai_insights.map(
                  (insight: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-fuchsia-500/10 border-l-2 border-fuchsia-500 text-sm text-muted-foreground"
                    >
                      {" "}
                      {insight}{" "}
                    </div>
                  ),
                )}{" "}
                {simulationResult.xai_insights.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No significant physiological deviations detected based on
                    these modifiers.
                  </p>
                )}{" "}
              </div>
            )}{" "}
          </div>{" "}
          <div className="dark bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-[200px] overflow-y-auto custom-scrollbar">
            {" "}
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
              Saved Scenarios
            </h3>{" "}
            <div className="space-y-2">
              {" "}
              {savedScenarios.map((s: any) => (
                <div
                  key={s.id}
                  className="dark p-2.5 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center"
                >
                  {" "}
                  <span className="text-xs text-muted-foreground font-medium truncate pr-2">
                    {s.scenario_name}
                  </span>{" "}
                  <span className="text-xs font-bold text-fuchsia-400 bg-fuchsia-500/20 px-2 py-0.5 rounded">
                    Score: {s.projected_health_score}
                  </span>{" "}
                </div>
              ))}{" "}
              {savedScenarios.length === 0 && (
                <p className="text-xs text-foreground">
                  No saved scenarios yet.
                </p>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
