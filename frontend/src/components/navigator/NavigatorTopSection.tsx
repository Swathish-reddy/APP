import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Stethoscope,
  Building2,
  AlertCircle,
  ArrowRightCircle,
} from "lucide-react";
interface NavigatorTopSectionProps {
  recommendations: any;
  pathway: any;
}
export const NavigatorTopSection: React.FC<NavigatorTopSectionProps> = ({
  recommendations,
  pathway,
}) => {
  const topDoc = recommendations?.doctors?.[0];
  const topHosp = recommendations?.hospitals?.[0];
  const isUrgent =
    topHosp?.match_score > 90 &&
    topHosp?.emergency_readiness?.includes("Level 1");
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {" "}
      <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
            Top Doctor Match
          </CardTitle>{" "}
          <Stethoscope className="h-4 w-4 text-indigo-500" />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-lg font-bold truncate">
            {topDoc ? topDoc.name : "Loading..."}
          </div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            {topDoc?.specialization}
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card className="bg-gradient-to-br from-teal-500/10 to-teal-600/5 border-teal-500/20">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-400">
            Top Facility Match
          </CardTitle>{" "}
          <Building2 className="h-4 w-4 text-teal-500" />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-lg font-bold truncate">
            {topHosp ? topHosp.name : "Loading..."}
          </div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            {topHosp?.distance_miles} miles away
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card
        className={`bg-gradient-to-br border ${isUrgent ? "from-red-500/10 to-red-600/5 border-red-500/20" : "from-slate-500/10 to-slate-600/5 border-slate-500/20"}`}
      >
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle
            className={`text-sm font-medium ${isUrgent ? "text-red-700 dark:text-red-400" : "text-foreground dark:text-muted-foreground"}`}
          >
            Urgency Status
          </CardTitle>{" "}
          <AlertCircle
            className={`h-4 w-4 ${isUrgent ? "text-red-500" : "text-muted-foreground"}`}
          />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-xl font-bold">
            {isUrgent ? "High / Emergency" : "Standard Routine"}
          </div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            Based on Twin Vitals & Risk
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
            Next Action
          </CardTitle>{" "}
          <ArrowRightCircle className="h-4 w-4 text-blue-500" />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-lg font-bold truncate">
            {" "}
            {(pathway &&
              pathway.find((p: any) => p.status === "Pending")?.step) ||
              "All clear"}{" "}
          </div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            Follow Care Journey
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
};
