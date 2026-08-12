"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  Activity,
  Clock,
  FileText,
  Calendar,
  Pill,
  AlertTriangle,
  FileClock,
  ChevronLeft,
  BrainCircuit,
  Watch,
  UserCircle2,
  Beaker,
  ShieldAlert,
  Radio,
  Utensils,
  Navigation,
  FlaskConical,
  BrainCog,
} from "lucide-react";
import { motion } from "framer-motion";
export default function PatientProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const pathname = usePathname();
  const nextParams = useParams();
  const patientId = nextParams?.id || params?.id;
  const tabs = [
    {
      name: "Overview",
      href: `/patients/${patientId}`,
      icon: Activity,
      exact: true,
    },
    {
      name: "AI Intelligence",
      href: `/patients/${patientId}/intelligence`,
      icon: BrainCog,
    },
    {
      name: "Intelligence",
      href: `/patients/${patientId}/uhie`,
      icon: BrainCircuit,
    },
    {
      name: "Risk Center",
      href: `/patients/${patientId}/risk-center`,
      icon: ShieldAlert,
    },
    {
      name: "Digital Twin",
      href: `/patients/${patientId}/twin`,
      icon: UserCircle2,
    },
    {
      name: "Simulator",
      href: `/patients/${patientId}/simulator`,
      icon: Beaker,
    },
    {
      name: "Live Monitor",
      href: `/patients/${patientId}/live-monitor`,
      icon: Radio,
    },
    {
      name: "Nutrition",
      href: `/patients/${patientId}/nutrition`,
      icon: Utensils,
    },
    {
      name: "Care Navigator",
      href: `/patients/${patientId}/care-navigator`,
      icon: Navigation,
    },
    { name: "CDSS", href: `/patients/${patientId}/cdss`, icon: FlaskConical },
    { name: "Devices", href: `/patients/${patientId}/devices`, icon: Watch },
    {
      name: "Health Timeline",
      href: `/patients/${patientId}/timeline`,
      icon: Clock,
    },
    {
      name: "Documents",
      href: `/patients/${patientId}/documents`,
      icon: FileText,
    },
    {
      name: "Appointments",
      href: `/patients/${patientId}/appointments`,
      icon: Calendar,
    },
    {
      name: "Medications",
      href: `/patients/${patientId}/medications`,
      icon: Pill,
    },
    {
      name: "Allergies",
      href: `/patients/${patientId}/allergies`,
      icon: AlertTriangle,
    },
    {
      name: "History",
      href: `/patients/${patientId}/history`,
      icon: FileClock,
    },
  ];
  return (
    <div className="flex flex-col min-h-screen bg-[#030712]">
      {" "}
      {}{" "}
      <div className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#030712]/80 border-b border-border">
        {" "}
        <div className="max-w-7xl mx-auto px-4 sm:px-4 md:px-4 md:px-4 md:px-6 lg:px-4 md:px-4 md:px-4 md:px-8">
          {" "}
          <div className="flex items-center h-16 gap-4">
            {" "}
            <Link
              href="/patients"
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {" "}
              <ChevronLeft className="w-5 h-5" />{" "}
            </Link>{" "}
            <div className="flex-1 flex overflow-x-auto no-scrollbar gap-1 pt-1">
              {" "}
              {tabs.map((tab) => {
                const isActive = tab.exact
                  ? pathname === tab.href
                  : pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`relative whitespace-nowrap px-4 py-2.5 rounded-t-xl text-sm font-medium flex items-center gap-2 transition-colors ${isActive ? "text-cyan-400 bg-muted/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                  >
                    {" "}
                    <tab.icon className="w-4 h-4" /> {tab.name}{" "}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                      />
                    )}{" "}
                  </Link>
                );
              })}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {}{" "}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-4 md:p-4 md:p-4 md:p-6 lg:p-4 md:p-4 md:p-4 md:p-8">
        {" "}
        {children}{" "}
      </div>{" "}
    </div>
  );
}
