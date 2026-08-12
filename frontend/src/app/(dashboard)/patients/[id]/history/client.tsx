"use client";
import React, { useState, useEffect } from "react";
import { History, Activity, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PatientHistory({ params, patientId: propPatientId }: { params?: any, patientId?: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(params).then((resolvedParams: any) => {
      const id = propPatientId || resolvedParams?.id || "";
      const cleanId = id.replace("P", "");
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      fetch(`http://localhost:8000/api/v1/patients/${cleanId}`, { headers })
        .then(res => res.json())
        .then(data => {
          if (data && data.medical_history) {
            setHistory(data.medical_history);
          }
        })
        .catch(err => console.error("Error fetching history:", err))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-4 md:p-4 md:p-8 max-w-[1200px] mx-auto space-y-8">
      <div className="flex items-center gap-4 bg-muted/80 border border-indigo-500/50 p-4 md:p-4 md:p-6 rounded-3xl backdrop-blur-xl shadow-xl">
        <History className="w-10 h-10 text-indigo-400" />
        <div>
          <h2 className="text-2xl md:text-2xl md:text-3xl font-extrabold text-foreground">Medical History</h2>
          <p className="text-indigo-200 mt-1 font-medium">Chronological health record extracted from medical reports.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card/40 border border-border rounded-3xl text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold text-foreground">No History Found</h3>
          <p className="text-muted-foreground mt-2">Upload medical reports to automatically populate this patient's history.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-muted/50 border border-border rounded-2xl p-4 md:p-4 md:p-6 shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <Activity className="w-6 h-6 text-rose-400 shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">{item.disease_name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">Status: {item.status || "Unknown"}</p>
                  <p className="text-muted-foreground text-sm">Diagnosis Date: {item.diagnosis_date || "Not specified"}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}



