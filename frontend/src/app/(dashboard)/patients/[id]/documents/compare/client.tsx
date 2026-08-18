"use client";
import { BASE_URL } from "../../../../../../services/api";
import React, { useState, useEffect } from "react";
import {
  Activity,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useParams } from 'next/navigation';
export default function DocumentCompare() {
  const params = useParams();
  const patientId = (params?.id as string) || "";
  
  const [documents, setDocuments] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (!patientId) return;
        const res = await fetch(
          `${BASE_URL}/documents/patient/${patientId.replace("P", "")}`,
        );
        if (res.ok) {
          const data = await res.json();
          const validDocs = data
            .filter(
              (d: any) =>
                d.structured_data && Object.keys(d.structured_data).length > 0,
            )
            .sort(
              (a: any, b: any) =>
                new Date(a.upload_date).getTime() -
                new Date(b.upload_date).getTime(),
            );
          setDocuments(validDocs);
          const allMetrics = new Set<string>();
          validDocs.forEach((d: any) => {
            Object.keys(d.structured_data).forEach((k) => allMetrics.add(k));
          });
          const metricsList = Array.from(allMetrics);
          setMetrics(metricsList);
          if (metricsList.length > 0) setSelectedMetric(metricsList[0]);
        }
      } catch (err) {
        console.error("Failed to fetch documents", err);
      }
    };
    fetchDocuments();
  }, [patientId]);

  useEffect(() => {
    if (!selectedMetric) return;
    const data = documents
      .map((doc) => ({
        date: new Date(doc.upload_date).toLocaleDateString(),
        value: doc.structured_data[selectedMetric] || null,
        fullDate: doc.upload_date,
      }))
      .filter((item) => item.value !== null);
    setChartData(data);
  }, [selectedMetric, documents]);

  return (
    <div className="py-4 md:py-4 md:py-4 md:py-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link
            href={`/patients/${patientId}/documents`}
            className="dark p-2 bg-muted rounded-full hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-indigo-400" /> Report Comparison
            </h2>
            <p className="text-muted-foreground mt-1">
              Track extracted laboratory metrics across time.
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-1 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {" "}
        <div className="dark lg:col-span-1 bg-card/50 border border-border rounded-2xl p-5">
          {" "}
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
            Select Metric
          </h3>{" "}
          <div className="space-y-2">
            {" "}
            {metrics.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${selectedMetric === m ? "bg-indigo-500/20 text-indigo-400" : "text-muted-foreground hover:bg-muted"}`}
              >
                {" "}
                {m.replace("_", " ")}{" "}
              </button>
            ))}{" "}
            {metrics.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No structured metrics found across documents.
              </p>
            )}{" "}
          </div>{" "}
        </div>{" "}
        <div className="dark lg:col-span-3 bg-card/50 border border-border rounded-2xl p-4 md:p-4 md:p-4 md:p-6 flex flex-col min-h-[400px]">
          {" "}
          {selectedMetric ? (
            <>
              {" "}
              <div className="flex justify-between items-end mb-6">
                {" "}
                <div>
                  {" "}
                  <h3 className="text-xl font-bold text-foreground capitalize">
                    {selectedMetric.replace("_", " ")} Trend
                  </h3>{" "}
                  <p className="text-sm text-muted-foreground">
                    Values extracted automatically via AI.
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex-1 min-h-[300px]">
                {" "}
                <ResponsiveContainer width="100%" height="100%">
                  {" "}
                  <LineChart data={chartData}>
                    {" "}
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                      vertical={false}
                    />{" "}
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />{" "}
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      domain={["auto", "auto"]}
                    />{" "}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#1e293b",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#818cf8", fontWeight: 600 }}
                    />{" "}
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#818cf8"
                      strokeWidth={3}
                      activeDot={{ r: 8, fill: "#818cf8" }}
                    />{" "}
                  </LineChart>{" "}
                </ResponsiveContainer>{" "}
              </div>{" "}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              {" "}
              Select a metric to view its trend.{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}



