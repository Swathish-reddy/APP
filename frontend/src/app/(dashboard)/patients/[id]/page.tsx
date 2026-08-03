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
export default function PatientOverview({ params }: { params: any }) {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string>("");
  const [overviewData, setOverviewData] = useState<any>(null);
  useEffect(() => {
    const id = params?.id || "";
    setPatientId(id);
    setTimeout(() => {
      setPatient({
        patient_id: id,
        unique_patient_code: `PAT-${String(id).padStart(6, "0")}`,
        full_name: "Eleanor Vance",
        age: 64,
        gender: "Female",
        blood_group: "O+",
        height: 165,
        weight: 70,
        bmi: 25.7,
        marital_status: "Married",
        occupation: "Retired Teacher",
        address: "123 Maple Street, Springfield",
        emergency_contact: "+1 (555) 019-8234",
        health_score: 65,
        active_conditions: ["Hypertension", "Type 2 Diabetes"],
        current_medications: ["Lisinopril 10mg", "Metformin 500mg"],
        allergies: ["Penicillin"],
        assigned_doctor: "Dr. Gregory House",
      });
    }, 600);
    fetch(`http://localhost:8000/api/overview/patient/${id}`)
      .then((res) => res.json())
      .then((data) => setOverviewData(data))
      .catch((err) => console.error("Error fetching overview data:", err))
      .finally(() => setLoading(false));
  }, [params]);
  if (loading)
    return (
      <div className="text-muted-foreground p-8 text-center animate-pulse">
        Loading patient profile...
      </div>
    );
  if (!patient)
    return (
      <div className="text-muted-foreground p-8 text-center">
        Patient not found
      </div>
    );
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {" "}
      {}{" "}
      <div className="lg:col-span-1 space-y-6">
        {" "}
        {}{" "}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dark bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-lg"
        >
          {" "}
          <div className="flex justify-between items-start mb-6">
            {" "}
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-cyan-500/20">
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
          <div className="grid grid-cols-2 gap-4 mt-6">
            {" "}
            <div>
              {" "}
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                Age
              </p>{" "}
              <p className="text-slate-200 font-medium">
                {patient.age} yrs
              </p>{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                Gender
              </p>{" "}
              <p className="text-slate-200 font-medium">
                {patient.gender}
              </p>{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                Blood
              </p>{" "}
              <p className="text-slate-200 font-medium">
                {patient.blood_group}
              </p>{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                BMI
              </p>{" "}
              <p className="text-slate-200 font-medium">{patient.bmi}</p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="dark h-px bg-slate-800 my-6" />{" "}
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
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {" "}
          {[
            { label: "Heart Rate", value: "72 bpm", status: "normal" },
            { label: "Blood Pressure", value: "125/82", status: "normal" },
            { label: "SpO2", value: "98%", status: "normal" },
            { label: "Glucose", value: "115 mg/dL", status: "warning" },
          ].map((vital, i) => (
            <div
              key={i}
              className="dark bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col justify-center items-center text-center"
            >
              {" "}
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                {vital.label}
              </p>{" "}
              <p
                className={`text-xl font-bold mt-2 ${vital.status === "warning" ? "text-amber-400" : "text-slate-200"}`}
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
          className="grid md:grid-cols-2 gap-6"
        >
          {" "}
          {}{" "}
          <div className="dark bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
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
                  className="dark bg-slate-800/50 p-3 rounded-xl text-muted-foreground text-sm font-medium border border-slate-700/50"
                >
                  {" "}
                  {cond}{" "}
                </li>
              ))}{" "}
            </ul>{" "}
          </div>{" "}
          {}{" "}
          <div className="dark bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
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
                  className="dark bg-slate-800/50 p-3 rounded-xl text-muted-foreground text-sm font-medium border border-slate-700/50"
                >
                  {" "}
                  {med}{" "}
                </li>
              ))}{" "}
            </ul>{" "}
          </div>{" "}
          {}{" "}
          <div className="dark bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:col-span-2">
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
            <div className="dark bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:col-span-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {" "}
                  <div className="dark bg-slate-800/50 p-4 rounded-xl">
                    {" "}
                    <p className="text-muted-foreground text-xs uppercase mb-1">
                      Medication Summary
                    </p>{" "}
                    <p className="text-slate-200 text-sm">
                      {overviewData["7_medication_pharmacy_summary"]}
                    </p>{" "}
                  </div>{" "}
                  <div className="dark bg-slate-800/50 p-4 rounded-xl">
                    {" "}
                    <p className="text-muted-foreground text-xs uppercase mb-1">
                      Dietary Summary
                    </p>{" "}
                    <p className="text-slate-200 text-sm">
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
