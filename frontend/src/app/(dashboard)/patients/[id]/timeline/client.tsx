"use client";
import { BASE_URL } from "../../../../../services/api";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Activity,
  FileText,
  Stethoscope,
  FileImage,
  ShieldAlert,
} from "lucide-react";
export default function PatientTimeline({
  params,
  patientId: propPatientId,
}: {
  params?: { id: string };
  patientId?: string;
}) {
  const patientId = propPatientId || params?.id;
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    if (!patientId) return;
    const fetchTimeline = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${BASE_URL}/patients/${patientId.replace("P", "")}/timeline`,
          {
            headers: (token
              ? { Authorization: `Bearer ${token}` }
              : {}) as Record<string, string>,
          },
        );
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error("Failed to fetch timeline", err);
      }
    };
    fetchTimeline();
  }, [patientId]);
  const getIcon = (type: string) => {
    if (type.includes("metric_abnormal"))
      return { icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50" };
    if (type.includes("report_uploaded"))
      return { icon: FileText, color: "text-blue-600", bg: "bg-blue-50" };
    if (type.includes("ai_analysis"))
      return { icon: Activity, color: "text-purple-600", bg: "bg-purple-50" };
    return { icon: Clock, color: "text-foreground", bg: "bg-slate-100" };
  };
  return (
    <div className="max-w-4xl mx-auto py-8">
      {" "}
      <div className="mb-8">
        {" "}
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Health Timeline
        </h2>{" "}
        <p className="text-muted-foreground mt-1">
          Chronological history of patient interactions and clinical events.
        </p>{" "}
      </div>{" "}
      {events.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border border-slate-200 rounded-2xl shadow-sm">
          {" "}
          No timeline events found. Upload a report to generate events.{" "}
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 ml-6 pl-8 space-y-8">
          {" "}
          {events.map((event, i) => {
            const style = getIcon(event.event_type);
            const Icon = style.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {" "}
                {}{" "}
                <div
                  className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-white ${style.bg.replace("bg-", "bg-").replace("50", "400")} z-10 flex items-center justify-center`}
                />{" "}
                <div className="bg-card border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  {" "}
                  <div className="flex items-start justify-between mb-2">
                    {" "}
                    <div className="flex items-center gap-3">
                      {" "}
                      <div
                        className={`p-2 rounded-lg ${style.bg} ${style.color}`}
                      >
                        {" "}
                        <Icon className="w-5 h-5" />{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {event.event_type.replace("_", " ")}
                        </p>{" "}
                        <h4 className="text-lg font-semibold text-foreground mt-0.5">
                          {event.title}
                        </h4>{" "}
                      </div>{" "}
                    </div>{" "}
                    <time className="text-sm font-medium text-muted-foreground font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      {" "}
                      {new Date(event.event_date).toLocaleString()}{" "}
                    </time>{" "}
                  </div>{" "}
                  <p className="mt-3 text-foreground text-sm">
                    {" "}
                    {event.description}{" "}
                  </p>{" "}
                </div>{" "}
              </motion.div>
            );
          })}{" "}
        </div>
      )}{" "}
    </div>
  );
}



