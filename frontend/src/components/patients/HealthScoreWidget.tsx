"use client";
import React from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
interface HealthScoreWidgetProps {
  score: number;
  className?: string;
}
export default function HealthScoreWidget({
  score,
  className,
}: HealthScoreWidgetProps) {
  let color = "#ef4444";
  let status = "Critical";
  if (score >= 90) {
    color = "#10b981";
  } else if (score >= 70) {
    color = "#f59e0b";
  } else if (score >= 50) {
    color = "#f97316";
  } else if (score >= 30) {
    color = "#ef4444";
  }
  const data = [{ name: "Score", value: score, fill: color }];
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-6 bg-slate-900/50 border border-slate-800 rounded-3xl shadow-xl backdrop-blur-xl",
        className,
      )}
    >
      {" "}
      <h3 className="text-sm font-medium text-slate-400 mb-2 tracking-wide uppercase">
        Health Score
      </h3>{" "}
      <div className="relative h-48 w-48">
        {" "}
        <ResponsiveContainer width="100%" height="100%">
          {" "}
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="80%"
            outerRadius="100%"
            barSize={12}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            {" "}
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />{" "}
            <RadialBar
              background={{ fill: "#1e293b" }}
              dataKey="value"
              cornerRadius={10}
            />{" "}
          </RadialBarChart>{" "}
        </ResponsiveContainer>{" "}
        {}{" "}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {" "}
          <span className="text-5xl font-bold tracking-tight text-white">
            {score}
          </span>{" "}
          <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">
            {status}
          </span>{" "}
        </div>{" "}
      </div>{" "}
      <p className="text-xs text-slate-400 mt-4 text-center max-w-[200px]">
        {" "}
        Based on vitals, lifestyle, and medical history{" "}
      </p>{" "}
    </div>
  );
}
