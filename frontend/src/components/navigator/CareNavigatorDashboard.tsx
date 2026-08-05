"use client";
import React, { useState, useEffect } from "react";
import { NavigatorTopSection } from "./NavigatorTopSection";
import { ProvidersPanel } from "./ProvidersPanel";
import { CareJourneyPanel } from "./CareJourneyPanel";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
interface CareNavigatorDashboardProps {
  patientId: string;
}
export const CareNavigatorDashboard: React.FC<CareNavigatorDashboardProps> = ({
  patientId,
}) => {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [pathway, setPathway] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<{
    provider: any;
    type: string;
  } | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const recRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/navigator/${patientId}/recommendations`,
        );
        const recData = await recRes.json();
        setRecommendations(recData);
        const pathRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/navigator/${patientId}/pathway`,
        );
        const pathData = await pathRes.json();
        setPathway(pathData);
        if (recData?.doctors?.length > 0) {
          setSelectedProvider({ provider: recData.doctors[0], type: "doctor" });
        }
      } catch (error) {
        console.error("Error fetching navigator data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);
  const handleBookAppointment = async (providerId: string) => {
    alert(
      `Booking requested for provider ID: ${providerId}. Confirming availability...`,
    );
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/navigator/${patientId}/appointments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider_id: providerId,
            type: "In-Person",
            date: "TBD",
          }),
        },
      );
      alert("Appointment successfully booked in the ecosystem.");
    } catch (err) {
      console.error("Booking error", err);
    }
  };
  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        Loading Care Navigator Engine...
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {" "}
      <div className="flex justify-between items-end">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Care Navigator Intelligence Center
          </h1>{" "}
          <p className="text-muted-foreground mt-1">
            AI-matched doctors, hospitals, and end-to-end care pathways.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <NavigatorTopSection
        recommendations={recommendations}
        pathway={pathway}
      />{" "}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
        {" "}
        {}{" "}
        <div className="lg:col-span-4 bg-background border rounded-xl p-4 shadow-sm h-full flex flex-col">
          {" "}
          <Tabs defaultValue="doctors" className="h-full flex flex-col">
            {" "}
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-4">
              {" "}
              <TabsTrigger value="doctors">Doctors</TabsTrigger>{" "}
              <TabsTrigger value="hospitals">Hospitals</TabsTrigger>{" "}
            </TabsList>{" "}
            <TabsContent value="doctors" className="flex-1 mt-0">
              {" "}
              <ProvidersPanel
                doctors={recommendations?.doctors}
                onSelectProvider={(p) =>
                  setSelectedProvider({ provider: p, type: "doctor" })
                }
                onBook={handleBookAppointment}
              />{" "}
            </TabsContent>{" "}
            <TabsContent value="hospitals" className="flex-1 mt-0">
              {" "}
              <ProvidersPanel
                doctors={recommendations?.hospitals}
                onSelectProvider={(p) =>
                  setSelectedProvider({ provider: p, type: "hospital" })
                }
                onBook={handleBookAppointment}
              />{" "}
            </TabsContent>{" "}
          </Tabs>{" "}
        </div>{" "}
        {}{" "}
        <div className="lg:col-span-4 bg-background border rounded-xl p-4 shadow-sm h-full">
          {" "}
          <CareJourneyPanel pathway={pathway} />{" "}
        </div>{" "}
        {}{" "}
        <div className="lg:col-span-4 bg-background border rounded-xl p-4 shadow-sm h-full">
          {" "}
          <AIInsightsPanel
            provider={selectedProvider?.provider}
            type={selectedProvider?.type || ""}
          />{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
