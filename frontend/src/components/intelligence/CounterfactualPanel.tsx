import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, ArrowRight, TrendingDown, BookOpen } from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
interface CounterfactualPanelProps {
  counterfactual: any;
}
export const CounterfactualPanel: React.FC<CounterfactualPanelProps> = ({
  counterfactual,
}) => {
  if (!counterfactual) return null;
  const current = counterfactual.current_risk_percent || 0;
  const projected = counterfactual.projected_risk_percent || 0;
  const reduction = counterfactual.total_reduction_possible || 0;
  const gaugeData = [{ name: "Projected", value: projected, fill: "#10b981" }];
  const currentData = [{ name: "Current", value: current, fill: "#ef4444" }];
  return (
    <Card className="h-full border-none shadow-none flex flex-col">
      {" "}
      <CardHeader className="px-0 pt-0">
        {" "}
        <CardTitle className="flex items-center gap-2 text-base">
          {" "}
          <Wand2 className="w-5 h-5 text-primary" /> Counterfactual
          Analysis{" "}
        </CardTitle>{" "}
        <p className="text-xs text-muted-foreground">
          What changes would reduce your risk the most?
        </p>{" "}
      </CardHeader>{" "}
      <CardContent className="px-0 flex-1 flex flex-col gap-5">
        {" "}
        {}{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {" "}
          <div className="flex flex-col items-center">
            {" "}
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              CURRENT RISK
            </p>{" "}
            <div className="h-[120px] w-full">
              {" "}
              <ResponsiveContainer width="100%" height="100%">
                {" "}
                <RadialBarChart
                  cx="50%"
                  cy="80%"
                  innerRadius="60%"
                  outerRadius="100%"
                  startAngle={180}
                  endAngle={0}
                  data={currentData}
                  barSize={14}
                >
                  {" "}
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />{" "}
                  <RadialBar dataKey="value" cornerRadius={6} />{" "}
                </RadialBarChart>{" "}
              </ResponsiveContainer>{" "}
            </div>{" "}
            <p className="text-2xl font-bold text-red-500 -mt-6">
              {current}%
            </p>{" "}
          </div>{" "}
          <div className="flex flex-col items-center">
            {" "}
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              PROJECTED RISK
            </p>{" "}
            <div className="h-[120px] w-full">
              {" "}
              <ResponsiveContainer width="100%" height="100%">
                {" "}
                <RadialBarChart
                  cx="50%"
                  cy="80%"
                  innerRadius="60%"
                  outerRadius="100%"
                  startAngle={180}
                  endAngle={0}
                  data={gaugeData}
                  barSize={14}
                >
                  {" "}
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />{" "}
                  <RadialBar dataKey="value" cornerRadius={6} />{" "}
                </RadialBarChart>{" "}
              </ResponsiveContainer>{" "}
            </div>{" "}
            <p className="text-2xl font-bold text-emerald-500 -mt-6">
              {projected}%
            </p>{" "}
          </div>{" "}
        </div>{" "}
        {}{" "}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-center gap-3">
          {" "}
          <TrendingDown className="w-5 h-5 text-emerald-500 flex-shrink-0" />{" "}
          <span className="text-sm font-semibold">
            {" "}
            Potential risk reduction:{" "}
            <span className="text-emerald-600 text-lg font-bold">
              {reduction}%
            </span>{" "}
            with full intervention{" "}
          </span>{" "}
        </div>{" "}
        {}{" "}
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[280px] pr-1">
          {" "}
          {counterfactual.interventions?.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-3 rounded-xl border bg-card hover:bg-muted/40 transition-colors"
            >
              {" "}
              <div className="flex items-start gap-2 mb-2">
                {" "}
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {" "}
                  {idx + 1}{" "}
                </div>{" "}
                <div className="flex-1">
                  {" "}
                  <p className="text-sm font-semibold">{item.action}</p>{" "}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.feasibility}
                  </p>{" "}
                </div>{" "}
                <span className="text-sm font-bold text-emerald-500 flex-shrink-0">
                  {" "}
                  -{item.risk_reduction_percent}%{" "}
                </span>{" "}
              </div>{" "}
              <div className="flex items-center gap-1.5 mt-2 ml-7">
                {" "}
                <BookOpen className="w-3 h-3 text-muted-foreground flex-shrink-0" />{" "}
                <p className="text-[10px] text-muted-foreground italic">
                  {item.evidence}
                </p>{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </CardContent>{" "}
    </Card>
  );
};
