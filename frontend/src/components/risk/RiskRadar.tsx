"use client";
import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
interface RiskRadarProps {
  data: Record<string, number>;
};
export default function RiskRadar({ data }: RiskRadarProps) {
  const chartData = Object.entries(data).map(([subject, A]) => ({
    subject,
    A,
    fullMark: 100,
  }));
  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center p-4 bg-card/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-lg">
      {" "}
      <ResponsiveContainer width="100%" height={300}>
        {" "}
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          {" "}
          <PolarGrid stroke="rgba(255,255,255,0.2)" />{" "}
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
          />{" "}
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
          />{" "}
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              color: "#fff",
            }}
            itemStyle={{ color: "#ec4899" }}
          />{" "}
          <Radar
            name="Risk Level"
            dataKey="A"
            stroke="#ec4899"
            fill="#ec4899"
            fillOpacity={0.4}
          />{" "}
        </RadarChart>{" "}
      </ResponsiveContainer>{" "}
    </div>
  );
}
