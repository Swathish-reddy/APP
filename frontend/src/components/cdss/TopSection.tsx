import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";
interface TopSectionProps {
  patientData: any;
  recommendations: any;
}
export const TopSection: React.FC<TopSectionProps> = ({
  patientData,
  recommendations,
}) => {
  let highPriorityCount = 0;
  if (recommendations) {
    Object.values(recommendations).forEach((cat: any) => {
      if (Array.isArray(cat)) {
        cat.forEach((r: any) => {
          if (r?.priority === "High" || r?.priority === "Critical") {
            highPriorityCount++;
          }
        });
      }
    });
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {" "}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
            Overall Health Status
          </CardTitle>{" "}
          <Activity className="h-4 w-4 text-blue-500" />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-2xl font-bold">
            {patientData?.metrics?.overall_health_score || "--"}/100
          </div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            Based on Twin Engine fusion
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
            High Risk Alerts
          </CardTitle>{" "}
          <AlertTriangle className="h-4 w-4 text-red-500" />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-2xl font-bold">{highPriorityCount}</div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            Urgent clinical actions required
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
            Total Recommendations
          </CardTitle>{" "}
          <CheckCircle className="h-4 w-4 text-amber-500" />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-2xl font-bold">
            {" "}
            {recommendations
              ? Object.values(recommendations).reduce(
                  (acc: number, curr: any) => acc + (Array.isArray(curr) ? curr.length : 0),
                  0,
                )
              : 0}{" "}
          </div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            Across 4 categories
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Next Review
          </CardTitle>{" "}
          <Clock className="h-4 w-4 text-emerald-500" />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-2xl font-bold text-emerald-600">
            Pending
          </div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            Check follow-up plan
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
};
