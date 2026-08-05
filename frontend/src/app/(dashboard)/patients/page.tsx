"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Filter,
  Activity,
  Users,
  AlertCircle,
} from "lucide-react";
import RiskBadge from "@/components/patients/RiskBadge";
import { motion } from "framer-motion";
interface Patient {
  patient_id: number;
  unique_patient_code: string;
  full_name: string;
  age: number;
  gender: string;
  blood_group: string;
  updated_at: string;
}
export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setPatients([
        {
          patient_id: 1,
          unique_patient_code: "PAT-A1B2C3",
          full_name: "Eleanor Vance",
          age: 64,
          gender: "Female",
          blood_group: "O+",
          updated_at: new Date().toISOString(),
        },
        {
          patient_id: 2,
          unique_patient_code: "PAT-X9Y8Z7",
          full_name: "Marcus Aurelius",
          age: 45,
          gender: "Male",
          blood_group: "A-",
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          patient_id: 3,
          unique_patient_code: "PAT-J5K4L3",
          full_name: "Sarah Connor",
          age: 32,
          gender: "Female",
          blood_group: "AB+",
          updated_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
      setLoading(false);
    }, 1000);
  }, [search]);
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {" "}
      {}{" "}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {" "}
            <Users className="w-8 h-8 text-cyan-400" /> Patient Intelligence
            Center{" "}
          </h1>{" "}
          <p className="text-muted-foreground mt-1">
            Manage and monitor digital twins across your care network.
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-3">
          {" "}
          <button className="dark inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-slate-700 text-foreground text-sm font-medium rounded-xl transition-colors border border-border">
            {" "}
            <Filter className="w-4 h-4" /> Filter{" "}
          </button>{" "}
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]">
            {" "}
            <Plus className="w-4 h-4" /> New Patient{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {}{" "}
      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {" "}
        {[
          {
            label: "Total Patients",
            value: "1,248",
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Critical Risk",
            value: "24",
            icon: AlertCircle,
            color: "text-red-400",
            bg: "bg-red-500/10",
          },
          {
            label: "Active Monitoring",
            value: "892",
            icon: Activity,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="dark bg-card/50 border border-border p-4 md:p-6 rounded-2xl backdrop-blur-sm flex items-center gap-4"
          >
            {" "}
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              {" "}
              <stat.icon className="w-6 h-6" />{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-muted-foreground text-sm font-medium">
                {stat.label}
              </p>{" "}
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
      {}{" "}
      <div className="dark bg-card/40 border border-border rounded-3xl overflow-hidden backdrop-blur-md">
        {" "}
        <div className="dark p-4 border-b border-border bg-card/60 flex items-center gap-3">
          {" "}
          <Search className="w-5 h-5 text-muted-foreground ml-2" />{" "}
          <input
            type="text"
            placeholder="Search by name, ID, or phone..."
            className="bg-transparent border-none outline-none text-foreground placeholder-slate-500 w-full text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />{" "}
        </div>{" "}
        <div className="overflow-x-auto">
          {" "}
          <table className="w-full text-left border-collapse">
            {" "}
            <thead>
              {" "}
              <tr className="dark bg-card/40 text-muted-foreground text-xs uppercase tracking-wider">
                {" "}
                <th className="p-4 font-semibold">Patient Info</th>{" "}
                <th className="p-4 font-semibold">Risk Level</th>{" "}
                <th className="p-4 font-semibold">Demographics</th>{" "}
                <th className="p-4 font-semibold">Last Updated</th>{" "}
                <th className="p-4 font-semibold text-right">Actions</th>{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody className="divide-y divide-slate-800/50">
              {" "}
              {loading ? (
                <tr>
                  {" "}
                  <td
                    colSpan={5}
                    className="p-4 md:p-8 text-center text-muted-foreground"
                  >
                    Loading patients...
                  </td>{" "}
                </tr>
              ) : (
                patients.map((patient, i) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={patient.patient_id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {" "}
                    <td className="p-4">
                      {" "}
                      <Link
                        href={`/patients/${patient.patient_id}`}
                        className="block"
                      >
                        {" "}
                        <p className="font-semibold text-foreground group-hover:text-cyan-400 transition-colors">
                          {patient.full_name}
                        </p>{" "}
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {patient.unique_patient_code}
                        </p>{" "}
                      </Link>{" "}
                    </td>{" "}
                    <td className="p-4">
                      {" "}
                      {}{" "}
                      <RiskBadge
                        score={
                          patient.patient_id === 1
                            ? 30
                            : patient.patient_id === 2
                              ? 65
                              : 95
                        }
                      />{" "}
                    </td>{" "}
                    <td className="p-4">
                      {" "}
                      <p className="text-sm text-muted-foreground">
                        {patient.age} yrs • {patient.gender}
                      </p>{" "}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Blood: {patient.blood_group}
                      </p>{" "}
                    </td>{" "}
                    <td className="p-4">
                      {" "}
                      <p className="text-sm text-muted-foreground">
                        {new Date(patient.updated_at).toLocaleDateString()}
                      </p>{" "}
                    </td>{" "}
                    <td className="p-4 text-right">
                      {" "}
                      <Link
                        href={`/patients/${patient.patient_id}`}
                        className="dark inline-flex px-3 py-1.5 bg-muted hover:bg-slate-700 text-muted-foreground text-xs font-medium rounded-lg transition-colors border border-border"
                      >
                        {" "}
                        View Twin{" "}
                      </Link>{" "}
                    </td>{" "}
                  </motion.tr>
                ))
              )}{" "}
            </tbody>{" "}
          </table>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
