import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Radio, AlertTriangle, HeartPulse } from "lucide-react";
interface MonitorTopSectionProps {
  stream: any;
  alerts: any[];
};
export const MonitorTopSection: React.FC<MonitorTopSectionProps> = ({
  stream,
  alerts,
}) => {
  const hasEmergency = alerts
    ?.slice(0, 5)
    .some((a: any) => a.severity === "Emergency" || a.severity === "Critical");
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-1 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {" "}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
            Live Telemetry
          </CardTitle>{" "}
          <Radio className="h-4 w-4 text-blue-500 animate-pulse" />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-xl font-bold">Active</div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            Streaming at 50Hz
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Health State
          </CardTitle>{" "}
          <HeartPulse className="h-4 w-4 text-emerald-500" />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-2xl font-bold">
            {stream?.vitals?.heart_rate || "--"}{" "}
            <span className="text-sm font-normal">BPM</span>
          </div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            Current Heart Rate
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card
        className={`bg-gradient-to-br border ${hasEmergency ? "from-red-500/10 to-red-600/5 border-red-500/20 animate-pulse" : "from-slate-500/10 to-slate-600/5 border-slate-500/20"}`}
      >
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle
            className={`text-sm font-medium ${hasEmergency ? "text-red-700 dark:text-red-400" : "text-foreground dark:text-muted-foreground"}`}
          >
            Emergency Status
          </CardTitle>{" "}
          <AlertTriangle
            className={`h-4 w-4 ${hasEmergency ? "text-red-500" : "text-muted-foreground"}`}
          />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div
            className={`text-xl font-bold ${hasEmergency ? "text-red-600" : ""}`}
          >
            {hasEmergency ? "CRITICAL ALERT" : "Stable"}
          </div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            Based on Live Twin Sync
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
            Twin Sync
          </CardTitle>{" "}
          <Activity className="h-4 w-4 text-purple-500" />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-lg font-bold truncate">Real-Time</div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            Models updating...
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
};
