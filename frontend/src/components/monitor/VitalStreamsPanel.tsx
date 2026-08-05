import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, YAxis, ResponsiveContainer } from "recharts";
import { Activity, Droplet, Wind, Thermometer } from "lucide-react";
import { StreamData } from "@/types";

interface VitalStreamsPanelProps {
  stream: StreamData | null;
  ecgHistory: number[];
}
export const VitalStreamsPanel: React.FC<VitalStreamsPanelProps> = ({
  stream,
  ecgHistory,
}) => {
  const vitals = stream?.vitals || {};
  const ecgChartData = useMemo(() => {
    return ecgHistory.map((val, idx) => ({ time: idx, value: val }));
  }, [ecgHistory]);
  const getStatusColor = (val: number | undefined, min: number, max: number) => {
    if (!val) return "text-foreground";
    if (val < min || val > max) return "text-red-500 animate-pulse";
    return "text-foreground";
  };
  return (
    <Card className="h-full border-none shadow-none flex flex-col bg-[#0f172a] text-foreground">
      {" "}
      <CardHeader className="px-4 py-3 border-b border-border">
        {" "}
        <CardTitle className="flex items-center justify-between text-slate-100">
          {" "}
          <span className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" /> Live Vitals
          </span>{" "}
          <span className="dark text-xs font-mono bg-muted px-2 py-1 rounded text-emerald-400">
            LIVE
          </span>{" "}
        </CardTitle>{" "}
      </CardHeader>{" "}
      <CardContent className="p-4 flex-1 flex flex-col gap-4">
        {" "}
        {}{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {" "}
          <div className="dark bg-card rounded-lg p-3 border border-border">
            {" "}
            <p className="text-xs text-muted-foreground font-semibold mb-1">
              HEART RATE
            </p>{" "}
            <div
              className={`text-2xl md:text-3xl font-bold font-mono ${getStatusColor(vitals.heart_rate, 50, 110)}`}
            >
              {" "}
              {vitals.heart_rate || "--"}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                bpm
              </span>{" "}
            </div>{" "}
          </div>{" "}
          <div className="dark bg-card rounded-lg p-3 border border-border">
            {" "}
            <p className="text-xs text-muted-foreground font-semibold mb-1">
              NIBP
            </p>{" "}
            <div
              className={`text-2xl md:text-3xl font-bold font-mono ${getStatusColor(vitals.systolic_bp, 90, 140)}`}
            >
              {" "}
              {vitals.systolic_bp || "--"}
              <span className="text-xl text-muted-foreground">
                /{vitals.diastolic_bp || "--"}
              </span>{" "}
            </div>{" "}
          </div>{" "}
          <div className="dark bg-card rounded-lg p-3 border border-border">
            {" "}
            <p className="text-xs text-blue-400 font-semibold mb-1 flex items-center gap-1">
              <Droplet className="w-3 h-3" /> SpO2
            </p>{" "}
            <div
              className={`text-2xl md:text-3xl font-bold font-mono ${getStatusColor(vitals.spo2, 92, 100)}`}
            >
              {" "}
              {vitals.spo2 || "--"}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                %
              </span>{" "}
            </div>{" "}
          </div>{" "}
          <div className="dark bg-card rounded-lg p-3 border border-border">
            {" "}
            <p className="text-xs text-amber-400 font-semibold mb-1">
              GLUCOSE (CGM)
            </p>{" "}
            <div
              className={`text-2xl md:text-3xl font-bold font-mono ${getStatusColor(vitals.glucose, 70, 180)}`}
            >
              {" "}
              {vitals.glucose || "--"}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                mg/dL
              </span>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {}{" "}
        <div className="dark flex-1 bg-card rounded-lg border border-border p-2 relative overflow-hidden flex flex-col">
          {" "}
          <div className="flex justify-between items-center mb-2 px-2">
            {" "}
            <span className="text-xs font-semibold text-emerald-400">
              ECG (Lead II)
            </span>{" "}
            <span className="text-xs text-muted-foreground font-mono">
              25 mm/s
            </span>{" "}
          </div>{" "}
          <div className="flex-1 w-full relative">
            {" "}
            {}{" "}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>{" "}
            {ecgHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {" "}
                <LineChart data={ecgChartData}>
                  {" "}
                  <YAxis domain={[-1.5, 3]} hide />{" "}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />{" "}
                </LineChart>{" "}
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground">
                Waiting for stream...
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </CardContent>{" "}
    </Card>
  );
};
