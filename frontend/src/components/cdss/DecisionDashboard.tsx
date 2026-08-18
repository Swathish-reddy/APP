"use client";
import { BASE_URL } from "../../services/api";
import React, { useState, useEffect } from "react";
import { TopSection } from "./TopSection";
import { RecommendationPanel } from "./RecommendationPanel";
import { DecisionExplorer } from "./DecisionExplorer";
import { EvidencePanel } from "./EvidencePanel";
import { ActionPlanPanel } from "./ActionPlanPanel";
import { DoctorDiscovery } from "./DoctorDiscovery";
import { ReportAnalysis } from "./ReportAnalysis";
import { getPatient } from "@/lib/api/patients";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Stethoscope, FileText, CheckCircle, Navigation2 } from "lucide-react";

interface DecisionDashboardProps {
  patientId: string;
};
export const DecisionDashboard: React.FC<DecisionDashboardProps> = ({ patientId }) => {
  const [patientData, setPatientData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [pathways, setPathways] = useState<any[]>([]);
  const [actionPlan, setActionPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState<any>(null);

  useEffect(() => {
    const fetchCDSSData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const pid = patientId.replace("P", "");
        
        const patient = await getPatient(patientId);
        setPatientData(patient);
        
        const recRes = await fetch(`${BASE_URL}/cdss/${pid}/recommendations`, { headers });
        if (recRes.ok) setRecommendations(await recRes.json());
        
        const pathRes = await fetch(`${BASE_URL}/cdss/pathways/diabetes`, { headers });
        if (pathRes.ok) setPathways(await pathRes.json());
        
        const actionPlanRes = await fetch(`${BASE_URL}/cdss/${pid}/action-plan`, { headers });
        if (actionPlanRes.ok) setActionPlan(await actionPlanRes.json());
        
      } catch (error) {
        console.error("Error fetching CDSS data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCDSSData();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
        <Activity className="w-10 h-10 text-blue-500 animate-pulse" />
        <p className="text-muted-foreground font-medium">Initializing Clinical Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-2xl md:text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Clinical Decision Intelligence Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Evidence-based personalized treatment, actionable insights, and full clinical workspace.
          </p>
        </div>
      </div>

      <TopSection patientData={patientData} recommendations={recommendations} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
        {}
        <div className="lg:col-span-4 bg-card/60 dark:bg-card/60 border rounded-2xl p-4 shadow-sm backdrop-blur-md h-full flex flex-col">
          <RecommendationPanel
            recommendations={recommendations}
            onSelectRec={setSelectedRec}
            selectedRecId={selectedRec?.id || null}
          />
        </div>

        {}
        <div className="lg:col-span-8 bg-card/60 dark:bg-card/60 border rounded-2xl p-4 shadow-sm backdrop-blur-md h-full flex flex-col">
          <Tabs defaultValue="xai" className="h-full flex flex-col">
            <TabsList className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-cols-6 gap-2 mb-4 bg-transparent w-full h-auto">
              <TabsTrigger value="xai" className="text-xs py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-foreground rounded-lg shadow-sm">
                Explainable AI
              </TabsTrigger>
              <TabsTrigger value="action" className="text-xs py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-foreground rounded-lg shadow-sm">
                Action Plan
              </TabsTrigger>
              <TabsTrigger value="pathways" className="text-xs py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-foreground rounded-lg shadow-sm">
                Pathways
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-xs py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-foreground rounded-lg shadow-sm">
                Reports AI
              </TabsTrigger>
              <TabsTrigger value="doctors" className="text-xs py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-foreground rounded-lg shadow-sm">
                Find Doctors
              </TabsTrigger>
            </TabsList>

            <TabsContent value="xai" className="flex-1 mt-0">
              <EvidencePanel selectedRec={selectedRec} />
            </TabsContent>
            
            <TabsContent value="action" className="flex-1 mt-0">
              <ActionPlanPanel plan={actionPlan} />
            </TabsContent>
            
            <TabsContent value="pathways" className="flex-1 mt-0">
              <div className="h-full">
                <DecisionExplorer pathways={pathways} />
              </div>
            </TabsContent>
            
            <TabsContent value="reports" className="flex-1 mt-0">
              <ReportAnalysis patientId={patientId} />
            </TabsContent>
            
            <TabsContent value="doctors" className="flex-1 mt-0 overflow-y-auto custom-scrollbar pr-2">
              <DoctorDiscovery patientId={patientId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
