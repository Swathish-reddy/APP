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
    <div className="bg-background min-h-screen text-foreground font-sans flex flex-col relative overflow-hidden h-full">
      {}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />
      
      {}
      <TopNavigation />

      {}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10 h-[calc(100vh-64px)] overflow-hidden">
        
        {}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <LeftPanelQueue />
        </div>

        {}
        <div className="lg:col-span-6 h-full overflow-hidden">
          <CenterPanelDashboard />
        </div>

        {}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <RightPanelCapacity />
        </div>

      </div>

      {}
      <AlertCenter />
    </div>
  );
}
