"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  Activity,
  Globe,
  FlaskConical,
  BrainCircuit,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DISEASE_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
];
export default function PopulationPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [surveillance, setSurveillance] = useState<any>(null);
  const [operations, setOperations] = useState<any>(null);
  const [outcomes, setOutcomes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [a, s, o, out] = await Promise.all([
          fetch(`${API}/api/v1/population/analytics`).then((r) => r.json()),
          fetch(`${API}/api/v1/population/surveillance`).then((r) => r.json()),
          fetch(`${API}/api/v1/population/operations`).then((r) => r.json()),
          fetch(`${API}/api/v1/population/outcomes`).then((r) => r.json()),
        ]);
        setAnalytics(a);
        setSurveillance(s);
        setOperations(o);
        setOutcomes(out);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);
  if (loading)
    return (
      <div className="flex h-[500px] items-center justify-center gap-3 bg-[#030712]">
        {" "}
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />{" "}
        <span className="text-muted-foreground">
          Loading Population Intelligence...
        </span>{" "}
      </div>
    );
  const tabs = [
    {
      id: "overview",
      label: "Population Overview",
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: "surveillance",
      label: "Disease Surveillance",
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: "operations",
      label: "Hospital Operations",
      icon: <FlaskConical className="w-4 h-4" />,
    },
    {
      id: "outcomes",
      label: "Outcome Analytics",
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ];
  const prevalenceData =
    analytics?.disease_prevalence?.map((d: any) => ({
      name: d.disease,
      risk: d.avg_risk,
      count: d.count,
    })) || [];
  const ageData = Object.entries(analytics?.age_distribution || {}).map(
    ([k, v]) => ({ name: k, value: v as number }),
  );
  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 p-6 space-y-6">
      {" "}
      {}{" "}
      <div className="flex items-end justify-between">
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {" "}
            <BrainCircuit className="w-8 h-8 text-cyan-400" /> Health
            Intelligence & Research Command Center{" "}
          </h1>{" "}
          <p className="text-muted-foreground mt-1">
            Population health analytics, surveillance, research, and operations.
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-3">
          {" "}
          <div className="dark bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-center">
            {" "}
            <p className="text-2xl font-bold text-cyan-400">
              {analytics?.population_size}
            </p>{" "}
            <p className="text-xs text-muted-foreground">
              Active Patients
            </p>{" "}
          </div>{" "}
          <div className="dark bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-center">
            {" "}
            <p className="text-2xl font-bold text-emerald-400">
              {analytics?.population_health_score}
            </p>{" "}
            <p className="text-xs text-muted-foreground">
              Pop. Health Score
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {}{" "}
      <div className="dark flex gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1 w-fit">
        {" "}
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-muted-foreground hover:text-slate-200"}`}
          >
            {" "}
            {t.icon} {t.label}{" "}
          </button>
        ))}{" "}
      </div>{" "}
      {}{" "}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {" "}
          {}{" "}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {" "}
            {[
              {
                label: "Avg Steps/Day",
                value:
                  analytics?.lifestyle_trends?.avg_daily_steps?.toLocaleString(),
                color: "text-blue-400",
              },
              {
                label: "Avg Sleep",
                value: `${analytics?.lifestyle_trends?.avg_sleep_hours}h`,
                color: "text-indigo-400",
              },
              {
                label: "Smoker Rate",
                value: `${analytics?.lifestyle_trends?.smoker_percent}%`,
                color: "text-red-400",
              },
              {
                label: "High Stress",
                value: `${analytics?.lifestyle_trends?.high_stress_percent}%`,
                color: "text-amber-400",
              },
            ].map((k, i) => (
              <div
                key={i}
                className="dark bg-slate-900 border border-slate-800 rounded-xl p-4"
              >
                {" "}
                <p className="text-xs text-muted-foreground mb-1">
                  {k.label}
                </p>{" "}
                <p className={`text-2xl font-bold ${k.color}`}>
                  {k.value}
                </p>{" "}
              </div>
            ))}{" "}
          </div>{" "}
          {}{" "}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {" "}
            {}{" "}
            <div className="dark bg-slate-900 border border-slate-800 rounded-2xl p-5">
              {" "}
              <h3 className="font-semibold text-slate-200 mb-4">
                Disease Risk Distribution
              </h3>{" "}
              <ResponsiveContainer width="100%" height={260}>
                {" "}
                <BarChart data={prevalenceData}>
                  {" "}
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />{" "}
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />{" "}
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 8,
                    }}
                  />{" "}
                  <Bar dataKey="risk" radius={[6, 6, 0, 0]}>
                    {" "}
                    {prevalenceData.map((_: any, i: number) => (
                      <Cell
                        key={i}
                        fill={DISEASE_COLORS[i % DISEASE_COLORS.length]}
                      />
                    ))}{" "}
                  </Bar>{" "}
                </BarChart>{" "}
              </ResponsiveContainer>{" "}
            </div>{" "}
            {}{" "}
            <div className="dark bg-slate-900 border border-slate-800 rounded-2xl p-5">
              {" "}
              <h3 className="font-semibold text-slate-200 mb-4">
                Population Age Distribution
              </h3>{" "}
              <ResponsiveContainer width="100%" height={260}>
                {" "}
                <PieChart>
                  {" "}
                  <Pie
                    data={ageData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {" "}
                    {ageData.map((_: any, i: number) => (
                      <Cell
                        key={i}
                        fill={DISEASE_COLORS[i % DISEASE_COLORS.length]}
                      />
                    ))}{" "}
                  </Pie>{" "}
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 8,
                    }}
                  />{" "}
                </PieChart>{" "}
              </ResponsiveContainer>{" "}
            </div>{" "}
          </div>{" "}
          {}{" "}
          <div className="dark bg-slate-900 border border-slate-800 rounded-2xl p-5">
            {" "}
            <h3 className="font-semibold text-slate-200 mb-4">
              Regional Health Breakdown
            </h3>{" "}
            <div className="overflow-x-auto">
              {" "}
              <table className="w-full text-sm">
                {" "}
                <thead>
                  {" "}
                  <tr className="text-muted-foreground text-xs uppercase border-b border-slate-800">
                    {" "}
                    <th className="text-left pb-3">Region</th>{" "}
                    <th className="text-center pb-3">Patients</th>{" "}
                    <th className="text-center pb-3">Avg BMI</th>{" "}
                    <th className="text-center pb-3">High Risk Count</th>{" "}
                  </tr>{" "}
                </thead>{" "}
                <tbody>
                  {" "}
                  {Object.entries(analytics?.regional_breakdown || {}).map(
                    ([region, data]: any, i: number) => (
                      <tr
                        key={i}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        {" "}
                        <td className="py-3 font-medium text-muted-foreground">
                          {region}
                        </td>{" "}
                        <td className="py-3 text-center text-cyan-400 font-mono">
                          {data.count}
                        </td>{" "}
                        <td className="py-3 text-center text-muted-foreground">
                          {data.avg_bmi}
                        </td>{" "}
                        <td className="py-3 text-center">
                          {" "}
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${data.high_risk > 0 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}
                          >
                            {" "}
                            {data.high_risk}{" "}
                          </span>{" "}
                        </td>{" "}
                      </tr>
                    ),
                  )}{" "}
                </tbody>{" "}
              </table>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {}{" "}
      {activeTab === "surveillance" && (
        <div className="space-y-6">
          {" "}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {" "}
            {surveillance?.signals?.map((sig: any, i: number) => (
              <div
                key={i}
                className={`bg-slate-900 border rounded-2xl p-4 ${sig.severity.includes("🔴") ? "border-red-500/30" : sig.severity.includes("🟡") ? "border-amber-500/30" : "border-emerald-500/30"}`}
              >
                {" "}
                <div className="flex justify-between items-start mb-2">
                  {" "}
                  <h4 className="font-semibold text-slate-200">
                    {sig.disease}
                  </h4>{" "}
                  <span className="text-xs">{sig.severity}</span>{" "}
                </div>{" "}
                <p className="text-2xl font-bold text-cyan-400 mb-1">
                  {sig.population_risk_avg}%
                </p>{" "}
                <p className="text-xs text-muted-foreground mb-3">
                  Average population risk
                </p>{" "}
                <div
                  className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${sig.trend === "Increasing" ? "bg-red-500/20 text-red-400" : sig.trend === "Stable" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}
                >
                  {" "}
                  {sig.trend} Trend{" "}
                </div>{" "}
                <p className="text-xs text-muted-foreground mt-2">
                  {sig.signal}
                </p>{" "}
              </div>
            ))}{" "}
          </div>{" "}
          {}{" "}
          <div className="dark bg-slate-900 border border-slate-800 rounded-2xl p-5">
            {" "}
            <h3 className="font-semibold text-slate-200 mb-4">
              7-Week Disease Trend Tracking
            </h3>{" "}
            <ResponsiveContainer width="100%" height={300}>
              {" "}
              <LineChart
                data={surveillance?.weeks?.map((w: string, i: number) => {
                  const pt: any = { week: w };
                  Object.entries(surveillance?.trend_series || {}).forEach(
                    ([d, vals]: any) => {
                      pt[d] = vals[i];
                    },
                  );
                  return pt;
                })}
              >
                {" "}
                <XAxis
                  dataKey="week"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />{" "}
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  domain={[0, 100]}
                />{" "}
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: 8,
                  }}
                />{" "}
                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />{" "}
                {Object.keys(surveillance?.trend_series || {}).map(
                  (disease, i) => (
                    <Line
                      key={disease}
                      type="monotone"
                      dataKey={disease}
                      stroke={DISEASE_COLORS[i % DISEASE_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ),
                )}{" "}
              </LineChart>{" "}
            </ResponsiveContainer>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {}{" "}
      {activeTab === "operations" && (
        <div className="space-y-6">
          {" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {" "}
            {operations?.hospitals?.map((h: any, i: number) => (
              <div
                key={i}
                className="dark bg-slate-900 border border-slate-800 rounded-2xl p-5"
              >
                {" "}
                <h4 className="font-semibold text-slate-200 mb-4">
                  {h.hospital}
                </h4>{" "}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {" "}
                  {[
                    {
                      label: "Bed Utilization",
                      value: `${h.bed_utilization_pct}%`,
                      color:
                        h.bed_utilization_pct > 85
                          ? "text-red-400"
                          : "text-emerald-400",
                    },
                    {
                      label: "ICU Available",
                      value: h.icu_available,
                      color:
                        h.icu_available < 3 ? "text-red-400" : "text-cyan-400",
                    },
                    {
                      label: "Daily Admissions",
                      value: h.daily_admissions,
                      color: "text-muted-foreground",
                    },
                    {
                      label: "Avg Wait (min)",
                      value: h.avg_wait_minutes,
                      color:
                        h.avg_wait_minutes > 60
                          ? "text-amber-400"
                          : "text-emerald-400",
                    },
                  ].map((kpi, j) => (
                    <div key={j} className="dark bg-slate-800/50 rounded-xl p-3">
                      {" "}
                      <p className="text-xs text-muted-foreground">
                        {kpi.label}
                      </p>{" "}
                      <p className={`text-xl font-bold ${kpi.color}`}>
                        {kpi.value}
                      </p>{" "}
                    </div>
                  ))}{" "}
                </div>{" "}
                <div>
                  {" "}
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    {" "}
                    <span>Bed Utilization</span>
                    <span>{h.bed_utilization_pct}%</span>{" "}
                  </div>{" "}
                  <div className="dark h-2 bg-slate-800 rounded-full overflow-hidden">
                    {" "}
                    <div
                      className={`h-full rounded-full transition-all ${h.bed_utilization_pct > 85 ? "bg-red-500" : "bg-emerald-500"}`}
                      style={{ width: `${h.bed_utilization_pct}%` }}
                    />{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>
      )}{" "}
      {}{" "}
      {activeTab === "outcomes" && (
        <div className="space-y-6">
          {" "}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {" "}
            {[
              {
                label: "Avg Health Score",
                value: outcomes?.avg_health_score,
                color: "text-emerald-400",
                suffix: "",
              },
              {
                label: "Readmission Risk",
                value: `${outcomes?.avg_readmission_risk_pct}%`,
                color: "text-amber-400",
                suffix: "",
              },
              {
                label: "Tx Adherence",
                value: `${outcomes?.treatment_adherence_pct}%`,
                color: "text-cyan-400",
                suffix: "",
              },
              {
                label: "30-Day Readmit",
                value: `${outcomes?.avg_30day_readmission_rate}%`,
                color: "text-red-400",
                suffix: "",
              },
            ].map((k, i) => (
              <div
                key={i}
                className="dark bg-slate-900 border border-slate-800 rounded-xl p-4"
              >
                {" "}
                <p className="text-xs text-muted-foreground mb-1">
                  {k.label}
                </p>{" "}
                <p className={`text-2xl font-bold ${k.color}`}>
                  {k.value}
                </p>{" "}
              </div>
            ))}{" "}
          </div>{" "}
          {}{" "}
          <div className="dark bg-slate-900 border border-slate-800 rounded-2xl p-5">
            {" "}
            <h3 className="font-semibold text-slate-200 mb-4">
              Medication Effectiveness Analysis
            </h3>{" "}
            <div className="space-y-4">
              {" "}
              {Object.entries(outcomes?.medication_effectiveness || {}).map(
                ([med, data]: any, i) => (
                  <div
                    key={i}
                    className="border border-slate-800 rounded-xl p-4"
                  >
                    {" "}
                    <div className="flex justify-between items-center mb-2">
                      {" "}
                      <h4 className="font-medium text-muted-foreground">
                        {med}
                      </h4>{" "}
                      <span className="text-xs text-muted-foreground">
                        Adherence:{" "}
                        <span className="text-cyan-400 font-bold">
                          {data.adherence}%
                        </span>
                      </span>{" "}
                    </div>{" "}
                    <div className="dark h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                      {" "}
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        style={{ width: `${data.adherence}%` }}
                      />{" "}
                    </div>{" "}
                    <p className="text-xs text-muted-foreground">
                      {" "}
                      {data.hba1c_reduction_avg &&
                        `Avg HbA1c reduction: ${data.hba1c_reduction_avg}%`}{" "}
                      {data.bp_reduction_avg &&
                        `Avg systolic BP reduction: ${data.bp_reduction_avg} mmHg`}{" "}
                      {data.ldl_reduction_avg &&
                        `Avg LDL reduction: ${data.ldl_reduction_avg} mg/dL`}{" "}
                    </p>{" "}
                  </div>
                ),
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
}
