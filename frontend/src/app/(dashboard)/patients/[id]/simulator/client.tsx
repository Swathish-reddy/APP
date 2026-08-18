import { BASE_URL } from "../../../../../services/api";
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
        `${BASE_URL}/simulator/patient/${pid}/history`,
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
      const pid = patientId?.replace(`P", "");
      const res = await fetch(
        `${BASE_URL}/simulator/patient/${pid}/run`,
        {
          method: `POST",
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
        `${BASE_URL}/simulator/patient/${pid}/save`,
        {
          method: `POST",
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
    <div className="py-4 md:py-4 md:py-4 md:py-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-end mb-6 flex-shrink-0 relative z-10">
        <div>
          <h2 className="text-2xl md:text-2xl md:text-3xl md:text-2xl md:text-2xl md:text-3xl md:text-2xl md:text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400 tracking-tight flex items-center gap-3 drop-shadow-md">
            <Beaker className="w-10 h-10 text-teal-400 drop-shadow-lg" /> Health Simulation Studio
          </h2>
          <p className="text-teal-600 dark:text-teal-200/70 mt-2 font-bold tracking-wide">
            Test lifestyle and clinical interventions against the Digital Twin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-1 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1 min-h-0 relative z-10">
        <div className="dark lg:col-span-1 bg-gradient-to-br from-slate-900 to-teal-950 border border-teal-500/20 rounded-3xl p-4 md:p-4 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col overflow-y-auto custom-scrollbar relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
          
          <h3 className="text-xl font-black text-teal-300 drop-shadow-sm mb-6 relative z-10">
            Intervention Modifiers
          </h3>
          <div className="space-y-8 flex-1 relative z-10">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-teal-200/80 font-bold uppercase tracking-wider">
                  Weight Change (kg)
                </span>
                <span className="text-foreground font-black drop-shadow-sm text-base">
                  {modifiers.weight_change > 0 ? "+" : ""}
                  {modifiers.weight_change} kg
                </span>
              </div>
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
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs font-bold text-teal-400/50 mt-2 uppercase tracking-widest">
                <span>-30 Loss</span>
                <span>+30 Gain</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-teal-200/80 font-bold uppercase tracking-wider">
                  Added Exercise (min/d)
                </span>
                <span className="text-foreground font-black drop-shadow-sm text-base">
                  +{modifiers.exercise_increase} min
                </span>
              </div>
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
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-teal-200/80 font-bold uppercase tracking-wider">
                  Sleep Adj (hrs)
                </span>
                <span className="text-foreground font-black drop-shadow-sm text-base">
                  {modifiers.sleep_change > 0 ? "+" : ""}
                  {modifiers.sleep_change} hrs
                </span>
              </div>
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
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="w-full mt-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-900 font-black text-lg uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_25px_rgba(45,212,191,0.5)] transition-all flex justify-center items-center gap-3 relative z-10"
          >
            {isSimulating ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <Play className="w-6 h-6 fill-slate-900" />
            )}
            Run Simulation
          </button>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="dark bg-gradient-to-br from-slate-900 to-sky-950 border border-sky-500/20 rounded-3xl p-4 md:p-4 md:p-6 shadow-2xl backdrop-blur-xl flex-1 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full md:w-full md:w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mt-20"></div>
            
            <h3 className="text-2xl font-black text-sky-300 drop-shadow-sm mb-6 flex items-center justify-between relative z-10">
              Twin State Comparison
              {simulationResult && (
                <button
                  onClick={saveScenario}
                  disabled={isSaving}
                  className="text-xs px-4 py-2 bg-sky-500/20 hover:bg-sky-500/40 text-sky-200 border border-sky-500/40 uppercase tracking-widest font-black rounded-xl flex items-center gap-2 transition-all shadow-lg"
                >
                  <Save className="w-4 h-4" /> Save Scenario
                </button>
              )}
            </h3>

            {!simulationResult ? (
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-sky-300/50 border-2 border-dashed border-sky-500/20 rounded-2xl bg-card/5">
                <Beaker className="w-16 h-16 mb-4 text-sky-400/30" />
                <p className="font-bold text-lg max-w-xs text-center">
                  Adjust variables and run a simulation to see the projected impact.
                </p>
              </div>
            ) : (
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-card/5 rounded-2xl p-5 border border-white/10 flex justify-between items-center shadow-inner">
                    <div>
                      <p className="text-xs text-sky-200/70 uppercase tracking-widest font-black mb-2">
                        Health Score
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl md:text-2xl md:text-3xl font-black text-blue-400 drop-shadow-md">
                          {simulationResult.current.health_score}
                        </span>
                        <ArrowRight className="w-5 h-5 text-sky-200/50" />
                        <span className="text-2xl md:text-2xl md:text-3xl md:text-2xl md:text-3xl md:text-4xl md:text-2xl md:text-3xl md:text-4xl md:text-4xl md:text-5xl font-black text-orange-400 drop-shadow-lg">
                          {simulationResult.projected.health_score}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card/5 rounded-2xl p-5 border border-white/10 flex justify-between items-center shadow-inner">
                    <div>
                      <p className="text-xs text-sky-200/70 uppercase tracking-widest font-black mb-2">
                        Biological Age
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl md:text-2xl md:text-3xl font-black text-blue-400 drop-shadow-md">
                          {simulationResult.current.biological_age}
                        </span>
                        <ArrowRight className="w-5 h-5 text-sky-200/50" />
                        <span className="text-2xl md:text-2xl md:text-3xl md:text-2xl md:text-3xl md:text-4xl md:text-2xl md:text-3xl md:text-4xl md:text-4xl md:text-5xl font-black text-orange-400 drop-shadow-lg">
                          {simulationResult.projected.biological_age}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-h-[280px] bg-card/5 p-4 rounded-2xl border border-white/10 shadow-inner">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#7dd3fc"
                        tick={{ fill: "#bae6fd", fontWeight: "bold" }}
                      />
                      <YAxis
                        stroke="#7dd3fc"
                        tick={{ fill: "#bae6fd", fontWeight: "bold" }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.9)",
                          borderColor: "rgba(56, 189, 248, 0.3)",
                          borderRadius: "12px",
                          fontWeight: "bold",
                          color: "#fff"
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "20px", fontWeight: "bold", color: "#e0f2fe" }} />
                      <Bar
                        dataKey="Current"
                        fill="#3b82f6"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="Projected"
                        fill="#f97316"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="dark bg-gradient-to-b from-slate-900 to-indigo-950 border border-indigo-500/20 rounded-3xl p-4 md:p-4 md:p-6 shadow-2xl backdrop-blur-xl flex-1 overflow-y-auto custom-scrollbar relative overflow-hidden">
            <h3 className="text-sm font-black text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-sm relative z-10">
              <Brain className="w-5 h-5 text-indigo-400" /> Explainable AI (XAI)
            </h3>
            {!simulationResult ? (
              <p className="text-sm text-indigo-200/50 italic font-bold relative z-10">
                No simulation running.
              </p>
            ) : (
              <div className="space-y-3 relative z-10">
                {simulationResult.xai_insights.map(
                  (insight: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-indigo-500/10 border-l-4 border-indigo-400 text-sm font-bold text-indigo-50 shadow-inner rounded-r-xl leading-relaxed"
                    >
                      {insight}
                    </div>
                  ),
                )}
                {simulationResult.xai_insights.length === 0 && (
                  <p className="text-sm font-bold text-indigo-200/70 p-4 bg-card/5 rounded-xl border border-white/10">
                    No significant physiological deviations detected based on
                    these modifiers.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="dark bg-gradient-to-t from-slate-900 to-fuchsia-950 border border-fuchsia-500/20 rounded-3xl p-4 md:p-4 md:p-6 h-[220px] shadow-2xl backdrop-blur-xl overflow-y-auto custom-scrollbar relative overflow-hidden">
            <h3 className="text-sm font-black text-fuchsia-300 uppercase tracking-widest mb-4 drop-shadow-sm relative z-10">
              Saved Scenarios
            </h3>
            <div className="space-y-3 relative z-10">
              {savedScenarios.map((s: any) => (
                <div
                  key={s.id}
                  className="p-3 bg-card/5 rounded-xl border border-white/10 flex justify-between items-center shadow-inner hover:bg-card/10 transition-colors cursor-pointer"
                >
                  <span className="text-xs text-fuchsia-50 font-bold truncate pr-3">
                    {s.scenario_name}
                  </span>
                  <span className="text-xs font-black text-fuchsia-300 bg-fuchsia-500/20 px-3 py-1 rounded-lg border border-fuchsia-500/30">
                    Score: {s.projected_health_score}
                  </span>
                </div>
              ))}
              {savedScenarios.length === 0 && (
                <p className="text-xs font-bold text-fuchsia-200/50 p-4 bg-card/5 rounded-xl border border-white/10 text-center">
                  No saved scenarios yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



