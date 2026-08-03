import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { BrainCircuit, TrendingUp, TrendingDown, BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
interface SHAPPanelProps {
  shap: any;
}
export const SHAPPanel: React.FC<SHAPPanelProps> = ({ shap }) => {
  if (!shap) return null;
  const features = shap.all_features || [];
  const chartData = features.slice(0, 8).map((f: any) => ({
    name: f.feature.length > 22 ? f.feature.substring(0, 22) + "…" : f.feature,
    fullName: f.feature,
    impact: f.impact,
    value: f.value,
    explanation: f.explanation,
    direction: f.direction,
  }));
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg max-w-xs text-sm">
          {" "}
          <p className="font-bold mb-1">{d.fullName}</p>{" "}
          <p className="text-muted-foreground mb-1">
            Value:{" "}
            <span className="font-medium text-foreground">{d.value}</span>
          </p>{" "}
          <p className="text-muted-foreground mb-2">
            Impact:{" "}
            <span
              className={`font-bold ${d.impact > 0 ? "text-red-500" : "text-emerald-500"}`}
            >
              {d.impact > 0 ? "+" : ""}
              {d.impact}
            </span>
          </p>{" "}
          <p className="text-xs text-muted-foreground italic">
            {d.explanation}
          </p>{" "}
        </div>
      );
    }
    return null;
  };
  return (
    <Card className="h-full border-none shadow-none flex flex-col">
      {" "}
      <CardHeader className="px-0 pt-0">
        {" "}
        <CardTitle className="flex items-center gap-2 text-base">
          {" "}
          <BrainCircuit className="w-5 h-5 text-primary" /> SHAP Feature
          Importance{" "}
        </CardTitle>{" "}
        <p className="text-xs text-muted-foreground">
          Patient-specific risk contribution of each biomarker
        </p>{" "}
      </CardHeader>{" "}
      <CardContent className="px-0 flex-1 flex flex-col gap-6">
        {" "}
        {}{" "}
        <div className="h-[260px] w-full">
          {" "}
          <ResponsiveContainer width="100%" height="100%">
            {" "}
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 8, right: 32 }}
            >
              {" "}
              <XAxis
                type="number"
                domain={["auto", "auto"]}
                tick={{ fontSize: 11 }}
              />{" "}
              <YAxis
                dataKey="name"
                type="category"
                width={140}
                tick={{ fontSize: 11 }}
              />{" "}
              <Tooltip content={<CustomTooltip />} />{" "}
              <ReferenceLine x={0} stroke="#6b7280" strokeWidth={1.5} />{" "}
              <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                {" "}
                {chartData.map((entry: any, index: number) => (
                  <Cell
                    key={index}
                    fill={entry.impact > 0 ? "#ef4444" : "#10b981"}
                  />
                ))}{" "}
              </Bar>{" "}
            </BarChart>{" "}
          </ResponsiveContainer>{" "}
        </div>{" "}
        {}{" "}
        <div className="grid grid-cols-2 gap-4">
          {" "}
          <div>
            {" "}
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-red-500 mb-2">
              {" "}
              <TrendingUp className="w-3.5 h-3.5" /> Risk Drivers{" "}
            </h4>{" "}
            <ScrollArea className="h-[140px]">
              {" "}
              <div className="space-y-2">
                {" "}
                {shap.risk_drivers?.slice(0, 5).map((d: any, i: number) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-red-500/5 border border-red-500/15 text-xs"
                  >
                    {" "}
                    <p className="font-semibold text-red-700 dark:text-red-400">
                      {d.feature}
                    </p>{" "}
                    <p className="text-muted-foreground">{d.value}</p>{" "}
                    <p className="text-[10px] mt-0.5 text-red-600/70">
                      {d.explanation}
                    </p>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
            </ScrollArea>{" "}
          </div>{" "}
          <div>
            {" "}
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-emerald-500 mb-2">
              {" "}
              <TrendingDown className="w-3.5 h-3.5" /> Protective Factors{" "}
            </h4>{" "}
            <ScrollArea className="h-[140px]">
              {" "}
              <div className="space-y-2">
                {" "}
                {shap.protective_factors
                  ?.slice(0, 5)
                  .map((d: any, i: number) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-xs"
                    >
                      {" "}
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {d.feature}
                      </p>{" "}
                      <p className="text-muted-foreground">{d.value}</p>{" "}
                      <p className="text-[10px] mt-0.5 text-emerald-600/70">
                        {d.explanation}
                      </p>{" "}
                    </div>
                  ))}{" "}
                {(!shap.protective_factors ||
                  shap.protective_factors.length === 0) && (
                  <p className="text-xs text-muted-foreground italic">
                    No strong protective factors detected.
                  </p>
                )}{" "}
              </div>{" "}
            </ScrollArea>{" "}
          </div>{" "}
        </div>{" "}
      </CardContent>{" "}
    </Card>
  );
};
