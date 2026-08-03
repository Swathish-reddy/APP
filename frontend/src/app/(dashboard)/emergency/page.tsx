"use client";
import React from "react";
import TopNavigation from "../../../components/emergency/TopNavigation";
import LeftPanelQueue from "../../../components/emergency/LeftPanelQueue";
import CenterPanelDashboard from "../../../components/emergency/CenterPanelDashboard";
import RightPanelCapacity from "../../../components/emergency/RightPanelCapacity";
import AlertCenter from "../../../components/emergency/AlertCenter";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EmergencyCommandCenter() {
  const router = useRouter();

  return (
    <div className="bg-slate-950 min-h-screen text-slate-300 font-sans flex flex-col relative overflow-hidden h-full">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />
      
      {/* 1. Top Navigation */}
      <TopNavigation />

      {/* Main Grid Layout */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* 2. Left Panel: Queue (3 columns) */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <LeftPanelQueue />
        </div>

        {/* 3. Center Panel: Live Dashboard (6 columns) */}
        <div className="lg:col-span-6 h-full overflow-hidden">
          <CenterPanelDashboard />
        </div>

        {/* 4. Right Panel: Hospital Capacity (3 columns) */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <RightPanelCapacity />
        </div>

      </div>

      {/* Global Alerts Overlay */}
      <AlertCenter />
    </div>
  );
}
