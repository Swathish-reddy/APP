import { BASE_URL } from "../../../../../services/api";
"use client";
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import {
  Watch,
  Activity,
  Moon,
  Footprints,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
export default function PatientDevices() {
  const params = useParams();
  const [wearables, setWearables] = useState<any[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const fetchWearables = async () => {
    try {
      const pid = (params?.id as string)?.replace("P", "");
      const res = await fetch(
        `${BASE_URL}/wearables/patient/${pid}`,
      );
      if (res.ok) {
        setWearables(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchWearables();
  }, [params.id]);
  const handleConnect = async (deviceType: string) => {
    setIsConnecting(true);
    try {
      const pid = (params?.id as string)?.replace(`P", "");
      await fetch(
        `${BASE_URL}/wearables/connect?patient_id=${pid}&device_type=${deviceType}`,
        { method: `POST" },
      );
      await fetchWearables();
    } catch (err) {
      console.error("Connect failed", err);
    } finally {
      setIsConnecting(false);
    }
  };
  const handleSync = async (deviceId: string) => {
    setIsSyncing(deviceId);
    try {
      await fetch(`${BASE_URL}/wearables/${deviceId}/sync`, {
        method: `POST",
      });
      await fetchWearables();
    } catch (err) {
      console.error("Sync failed", err);
    } finally {
      setIsSyncing(null);
    }
  };
  return (
    <div className="py-4 md:py-4 md:py-4 md:py-6 space-y-6 max-w-6xl mx-auto">
      {" "}
      {}{" "}
      <div className="flex justify-between items-end mb-8">
        {" "}
        <div>
          {" "}
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            {" "}
            <Watch className="w-6 h-6 text-emerald-400" /> Connected
            Devices{" "}
          </h2>{" "}
          <p className="text-muted-foreground mt-1">
            Manage smartwatches and view continuous vital streams.
          </p>{" "}
        </div>{" "}
        <div className="flex gap-2">
          {" "}
          {["Apple Watch", "Garmin", "Fitbit"].map((brand) => (
            <button
              key={brand}
              onClick={() => handleConnect(brand)}
              disabled={isConnecting}
              className="dark px-4 py-2 bg-muted hover:bg-slate-700 text-foreground text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              {" "}
              <Plus className="w-4 h-4" /> Connect {brand}{" "}
            </button>
          ))}{" "}
        </div>{" "}
      </div>{" "}
      {wearables.length === 0 ? (
        <div className="dark py-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl bg-card/30">
          {" "}
          <Watch className="w-16 h-16 text-foreground mb-4" />{" "}
          <h3 className="text-lg font-medium text-muted-foreground">
            No Devices Connected
          </h3>{" "}
          <p className="text-muted-foreground mt-2 max-w-md text-center">
            Connect a smartwatch or fitness tracker to enable continuous vital
            monitoring and advanced UHIE correlations.
          </p>{" "}
        </div>
      ) : (
        <div className="space-y-12">
          {" "}
          {wearables.map(({ device, data }) => {
            const hrData = data
              .filter((d: any) => d.metric_type === "HeartRate")
              .map((d: any) => ({
                time: new Date(d.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                value: d.value,
              }));
            const spo2Data = data
              .filter((d: any) => d.metric_type === "SpO2")
              .map((d: any) => ({
                time: new Date(d.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                value: d.value,
              }));
            const latestSteps =
              data.filter((d: any) => d.metric_type === "Steps").pop()?.value ||
              0;
            const latestSleep =
              data.filter((d: any) => d.metric_type === "Sleep").pop()?.value ||
              0;
            return (
              <div
                key={device.id}
                className="dark bg-card/50 border border-border rounded-3xl p-4 md:p-4 md:p-4 md:p-6"
              >
                {" "}
                <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                  {" "}
                  <div className="flex items-center gap-4">
                    {" "}
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      {" "}
                      <Watch className="w-6 h-6 text-emerald-400" />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h3 className="text-xl font-bold text-foreground">
                        {device.device_type}
                      </h3>{" "}
                      <p className="text-sm text-emerald-400 flex items-center gap-2">
                        {" "}
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
                        Active Connection{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex items-center gap-4">
                    {" "}
                    <span className="text-sm text-muted-foreground">
                      {" "}
                      Last Sync:{" "}
                      {device.last_sync
                        ? new Date(device.last_sync).toLocaleString()
                        : "Never"}{" "}
                    </span>{" "}
                    <button
                      onClick={() => handleSync(device.id)}
                      disabled={isSyncing === device.id}
                      className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
                    >
                      {" "}
                      <RefreshCw
                        className={`w-4 h-4 ${isSyncing === device.id ? "animate-spin" : ""}`}
                      />{" "}
                      Sync Data{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
                {data.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    Click"Sync Data" to simulate a 24-hour vital stream pull.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6">
                    {" "}
                    {}{" "}
                    <div className="bg-background/50 border border-border/80 rounded-2xl p-5">
                      {" "}
                      <div className="flex items-center justify-between mb-4">
                        {" "}
                        <h4 className="text-muted-foreground font-medium flex items-center gap-2">
                          <Activity className="w-4 h-4 text-rose-400" /> Heart
                          Rate (24h)
                        </h4>{" "}
                        <span className="text-xl font-bold text-rose-400">
                          {hrData[hrData.length - 1]?.value}{" "}
                          <span className="text-xs text-muted-foreground">
                            BPM
                          </span>
                        </span>{" "}
                      </div>{" "}
                      <div className="h-48">
                        {" "}
                        <ResponsiveContainer width="100%" height="100%">
                          {" "}
                          <AreaChart data={hrData}>
                            {" "}
                            <defs>
                              {" "}
                              <linearGradient
                                id="colorHr"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                {" "}
                                <stop
                                  offset="5%"
                                  stopColor="#fb7185"
                                  stopOpacity={0.3}
                                />{" "}
                                <stop
                                  offset="95%"
                                  stopColor="#fb7185"
                                  stopOpacity={0}
                                />{" "}
                              </linearGradient>{" "}
                            </defs>{" "}
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#1e293b"
                              vertical={false}
                            />{" "}
                            <XAxis
                              dataKey="time"
                              stroke="#64748b"
                              tick={{ fontSize: 10 }}
                            />{" "}
                            <YAxis
                              stroke="#64748b"
                              tick={{ fontSize: 10 }}
                              domain={["dataMin - 10", "dataMax + 10"]}
                            />{" "}
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                borderColor: "#1e293b",
                              }}
                            />{" "}
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#fb7185"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorHr)"
                            />{" "}
                          </AreaChart>{" "}
                        </ResponsiveContainer>{" "}
                      </div>{" "}
                    </div>{" "}
                    {}{" "}
                    <div className="bg-background/50 border border-border/80 rounded-2xl p-5">
                      {" "}
                      <div className="flex items-center justify-between mb-4">
                        {" "}
                        <h4 className="text-muted-foreground font-medium flex items-center gap-2">
                          <Activity className="w-4 h-4 text-cyan-400" /> Blood
                          Oxygen (24h)
                        </h4>{" "}
                        <span className="text-xl font-bold text-cyan-400">
                          {spo2Data[spo2Data.length - 1]?.value}{" "}
                          <span className="text-xs text-muted-foreground">
                            %
                          </span>
                        </span>{" "}
                      </div>{" "}
                      <div className="h-48">
                        {" "}
                        <ResponsiveContainer width="100%" height="100%">
                          {" "}
                          <LineChart data={spo2Data}>
                            {" "}
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#1e293b"
                              vertical={false}
                            />{" "}
                            <XAxis
                              dataKey="time"
                              stroke="#64748b"
                              tick={{ fontSize: 10 }}
                            />{" "}
                            <YAxis
                              stroke="#64748b"
                              tick={{ fontSize: 10 }}
                              domain={[85, 100]}
                            />{" "}
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                borderColor: "#1e293b",
                              }}
                            />{" "}
                            <Line
                              type="step"
                              dataKey="value"
                              stroke="#22d3ee"
                              strokeWidth={2}
                              dot={false}
                            />{" "}
                          </LineChart>{" "}
                        </ResponsiveContainer>{" "}
                      </div>{" "}
                    </div>{" "}
                    {}{" "}
                    <div className="bg-background/50 border border-border/80 rounded-2xl p-5 flex items-center justify-between">
                      {" "}
                      <div className="flex items-center gap-4">
                        {" "}
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                          <Footprints className="w-6 h-6 text-amber-400" />
                        </div>{" "}
                        <div>
                          {" "}
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            Daily Steps
                          </p>{" "}
                          <p className="text-2xl font-bold text-foreground">
                            {latestSteps}
                          </p>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="bg-background/50 border border-border/80 rounded-2xl p-5 flex items-center justify-between">
                      {" "}
                      <div className="flex items-center gap-4">
                        {" "}
                        <div className="p-3 bg-indigo-500/10 rounded-xl">
                          <Moon className="w-6 h-6 text-indigo-400" />
                        </div>{" "}
                        <div>
                          {" "}
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            Sleep Duration
                          </p>{" "}
                          <p className="text-2xl font-bold text-foreground">
                            {latestSleep}{" "}
                            <span className="text-sm font-medium text-muted-foreground">
                              hrs
                            </span>
                          </p>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>
                )}{" "}
              </div>
            );
          })}{" "}
        </div>
      )}{" "}
    </div>
  );
}
