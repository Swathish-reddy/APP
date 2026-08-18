import { BASE_URL } from "../../../../services/api";
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Heart,
  Activity,
  AlertCircle,
  Phone,
  MapPin,
  Briefcase,
  BrainCircuit,
} from "lucide-react";
import HealthScoreWidget from "@/components/patients/HealthScoreWidget";
import RiskBadge from "@/components/patients/RiskBadge";
import { useParams } from 'next/navigation';
export default function PatientOverview() {
  const params = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string>("");
  const [overviewData, setOverviewData] = useState<any>(null);
  
  useEffect(() => {
    const id = (params?.id as string) || "";
    setPatientId(id);
    
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Fetch real patient data
        const patientRes = await fetch(`${BASE_URL}/patients/${id}`, { headers });
        if (patientRes.ok) {
          const patientData = await patientRes.json();
          // Map real DB fields to the expected format
          setPatient({
            patient_id: patientData.patient_id,
            unique_patient_code: patientData.unique_patient_code,
            full_name: patientData.full_name,
            age: patientData.age || 0,
            gender: patientData.gender || `Unknown",
            blood_group: patientData.blood_group || "Unknown",
            height: patientData.height || 0,
            weight: patientData.weight || 0,
            bmi: patientData.bmi || 0,
            marital_status: patientData.marital_status || "Unknown",
            occupation: patientData.occupation || "Unknown",
            address: patientData.address || "Unknown",
            emergency_contact: patientData.emergency_contact || "Unknown",
            health_score: 65, // Will be updated by overviewData
            active_conditions: patientData.medical_history?.map((h: any) => h.disease_name) || [],
            current_medications: patientData.medications?.map((m: any) => m.medicine_name) || [],
            allergies: patientData.allergies?.map((a: any) => a.allergen) || [],
            assigned_doctor: "Unassigned", // Can be extended later
            health_metrics: patientData.health_metrics || [],
          });
        }
        
        // Fetch overview data
        const overviewRes = await fetch(`${BASE_URL}/overview/patient/${id}`, { headers });
        if (overviewRes.ok) {
          const ovData = await overviewRes.json();
          setOverviewData(ovData);
          if (ovData[`10_patient_health_score"]) {
             setPatient((prev: any) => ({ ...prev, health_score: parseInt(ovData["10_patient_health_score"].split('/')[0]) || prev?.health_score }));
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [params]);

  if (loading)
    return (
      <div className="text-muted-foreground p-4 md:p-4 md:p-4 md:p-8 text-center animate-pulse">
        Loading patient profile...
      </div>
    );
  if (!patient)
    return (
      <div className="text-muted-foreground p-4 md:p-4 md:p-4 md:p-8 text-center">
        Patient not found or no data available.
      </div>
    );

  // Derive latest vitals from health_metrics
  const getLatestMetric = (metricName: string) => {
    if (!patient.health_metrics) return null;
    const metrics = patient.health_metrics.filter((m: any) => m.metric_name.toLowerCase() === metricName.toLowerCase());
    if (metrics.length === 0) return null;
    return metrics.sort((a: any, b: any) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
  };

  const heartRate = getLatestMetric("heart_rate");
  const bp = getLatestMetric("blood_pressure");
  const spo2 = getLatestMetric("spo2");
  const glucose = getLatestMetric("glucose");

  const vitalsToDisplay = [
    { label: "Heart Rate", value: heartRate ? `${heartRate.value} bpm` : "N/A", status: heartRate?.status?.toLowerCase() === "normal" ? "normal" : "warning" },
    { label: "Blood Pressure", value: bp ? bp.value : "N/A", status: bp?.status?.toLowerCase() === "normal" ? "normal" : "warning" },
    { label: "SpO2", value: spo2 ? `${spo2.value}%` : "N/A", status: spo2?.status?.toLowerCase() === "normal" ? "normal" : "warning" },
    { label: "Glucose", value: glucose ? `${glucose.value} ${glucose.unit || 'mg/dL'}` : "N/A", status: glucose?.status?.toLowerCase() === "normal" ? "normal" : "warning" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {" "}
      {}{" "}
      <div className="lg:col-span-1 space-y-6">
        {" "}
        {}{" "}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dark bg-card/50 border border-border rounded-3xl p-4 md:p-4 md:p-4 md:p-6 backdrop-blur-md shadow-lg"
        >
          {" "}
          <div className="flex justify-between items-start mb-6">
            {" "}
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-foreground text-2xl md:text-2xl md:text-2xl md:text-3xl font-bold shadow-lg shadow-cyan-500/20">
              {" "}
              {patient.full_name.charAt(0)}{" "}
            </div>{" "}
            <RiskBadge score={patient.health_score} />{" "}
          </div>{" "}
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {patient.full_name}
          </h2>{" "}
          <p className="text-cyan-400 font-mono text-sm mt-1">
            {patient.unique_patient_code}
          </p>{" "}
          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {" "}
            <div>
              {" "}
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                Age
              </p>{" "}
              <p className="text-foreground font-medium">
                {patient.age} yrs
              </p>{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                Gender
              </p>{" "}
              <p className="text-foreground font-medium">
                {patient.gender}
              </p>{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                Blood
              </p>{" "}
              <p className="text-foreground font-medium">
                {patient.blood_group}
              </p>{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                BMI
              </p>{" "}
              <p className="text-foreground font-medium">{patient.bmi}</p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="dark h-px bg-muted my-6" />{" "}
          <div className="space-y-4">
            {" "}
            <div className="flex items-center gap-3 text-muted-foreground">
              {" "}
              <Phone className="w-4 h-4 text-muted-foreground" />{" "}
              <span className="text-sm">{patient.emergency_contact}</span>{" "}
            </div>{" "}
            <div className="flex items-center gap-3 text-muted-foreground">
              {" "}
              <MapPin className="w-4 h-4 text-muted-foreground" />{" "}
              <span className="text-sm">{patient.address}</span>{" "}
            </div>{" "}
            <div className="flex items-center gap-3 text-muted-foreground">
              {" "}
              <Briefcase className="w-4 h-4 text-muted-foreground" />{" "}
              <span className="text-sm">{patient.occupation}</span>{" "}
            </div>{" "}
            <div className="flex items-center gap-3 text-muted-foreground">
              {" "}
              <User className="w-4 h-4 text-muted-foreground" />{" "}
              <span className="text-sm">
                Assigned: {patient.assigned_doctor}
              </span>{" "}
            </div>{" "}
          </div>{" "}
        </motion.div>{" "}
        {}{" "}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {" "}
          <HealthScoreWidget score={patient.health_score} />{" "}
        </motion.div>{" "}
      </div>{" "}
      {}{" "}
      <div className="lg:col-span-2 space-y-6">
        {" "}
        {}{" "}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-1 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {" "}
          {vitalsToDisplay.map((vital, i) => (
            <div
              key={i}
              className="dark bg-card/40 border border-border p-4 rounded-2xl flex flex-col justify-center items-center text-center"
            >
              {" "}
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                {vital.label}
              </p>{" "}
              <p
                className={`text-xl font-bold mt-2 ${vital.status === "warning" ? "text-amber-400" : "text-foreground"}`}
              >
                {" "}
                {vital.value}{" "}
              </p>{" "}
            </div>
          ))}{" "}
        </motion.div>{" "}
        {}{" "}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6"
        >
          {" "}
          {}{" "}
          <div className="dark bg-card/40 border border-border rounded-3xl p-4 md:p-4 md:p-4 md:p-6">
            {" "}
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              {" "}
              <Activity className="w-5 h-5 text-rose-400" /> Active
              Conditions{" "}
            </h3>{" "}
            <ul className="space-y-3">
              {" "}
              {patient.active_conditions.map((cond: string, i: number) => (
                <li
                  key={i}
                  className="dark bg-muted/50 p-3 rounded-xl text-muted-foreground text-sm font-medium border border-border/50"
                >
                  {" "}
                  {cond}{" "}
                </li>
              ))}{" "}
            </ul>{" "}
          </div>{" "}
          {}{" "}
          <div className="dark bg-card/40 border border-border rounded-3xl p-4 md:p-4 md:p-4 md:p-6">
            {" "}
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              {" "}
              <Heart className="w-5 h-5 text-indigo-400" /> Current
              Medications{" "}
            </h3>{" "}
            <ul className="space-y-3">
              {" "}
              {patient.current_medications.map((med: string, i: number) => (
                <li
                  key={i}
                  className="dark bg-muted/50 p-3 rounded-xl text-muted-foreground text-sm font-medium border border-border/50"
                >
                  {" "}
                  {med}{" "}
                </li>
              ))}{" "}
            </ul>{" "}
          </div>{" "}
          {}{" "}
          <div className="dark bg-card/40 border border-border rounded-3xl p-4 md:p-4 md:p-4 md:p-6 md:col-span-2">
            {" "}
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              {" "}
              <AlertCircle className="w-5 h-5 text-amber-400" /> Allergies{" "}
            </h3>{" "}
            <div className="flex flex-wrap gap-2">
              {" "}
              {patient.allergies.map((allergy: string, i: number) => (
                <span
                  key={i}
                  className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-lg text-sm font-medium"
                >
                  {" "}
                  {allergy}{" "}
                </span>
              ))}{" "}
            </div>{" "}
          </div>{" "}
          {}{" "}
          {overviewData && (
            <div className="dark bg-card/40 border border-border rounded-3xl p-4 md:p-4 md:p-4 md:p-6 md:col-span-2">
              {" "}
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                {" "}
                <BrainCircuit className="w-5 h-5 text-cyan-400" /> CogniVueX
                Global Overview{" "}
              </h3>{" "}
              <div className="space-y-4">
                {" "}
                {overviewData["2_active_critical_alerts"] &&
                  overviewData["2_active_critical_alerts"].includes("🔴") && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                      {" "}
                      <p className="text-red-400 text-sm font-medium">
                        {overviewData["2_active_critical_alerts"]}
                      </p>{" "}
                    </div>
                  )}{" "}
                <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
                  {" "}
                  <div className="dark bg-muted/50 p-4 rounded-xl">
                    {" "}
                    <p className="text-muted-foreground text-xs uppercase mb-1">
                      Medication Summary
                    </p>{" "}
                    <p className="text-foreground text-sm">
                      {overviewData["7_medication_pharmacy_summary"]}
                    </p>{" "}
                  </div>{" "}
                  <div className="dark bg-muted/50 p-4 rounded-xl">
                    {" "}
                    <p className="text-muted-foreground text-xs uppercase mb-1">
                      Dietary Summary
                    </p>{" "}
                    <p className="text-foreground text-sm">
                      {overviewData["8_dietary_nutrition_summary"]}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl mt-4">
                  {" "}
                  <p className="text-cyan-400 text-xs uppercase mb-2 font-semibold">
                    Top AI Recommendations
                  </p>{" "}
                  <ul className="space-y-2">
                    {" "}
                    {Array.isArray(overviewData["12_top_ai_recommendations"]) &&
                      overviewData["12_top_ai_recommendations"].map(
                        (rec: string, i: number) => (
                          <li
                            key={i}
                            className="text-muted-foreground text-sm flex items-start gap-2"
                          >
                            {" "}
                            <span className="text-cyan-500 mt-0.5">•</span>{" "}
                            {rec}{" "}
                          </li>
                        ),
                      )}{" "}
                  </ul>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          )}{" "}
        </motion.div>{" "}
      </div>{" "}
    </div>
  );
}



