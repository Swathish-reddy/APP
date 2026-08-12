import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Alert } from "@/types";

interface AlertsPanelProps {
  alerts: Alert[];
};
export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "Critical":
        return <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />;
      case "High":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "Medium":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "Low":
        return <Info className="w-5 h-5 text-yellow-500" />;
      case "Information":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-emerald-500" />;
    }
  };
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500/10 border-red-500/30";
      case "High":
        return "bg-orange-500/10 border-orange-500/30";
      case "Medium":
        return "bg-amber-500/10 border-amber-500/30";
      case "Low":
        return "bg-yellow-500/10 border-yellow-500/30";
      case "Information":
        return "bg-blue-500/10 border-blue-500/30";
      default:
        return "bg-emerald-500/10 border-emerald-500/30";
    }
  };
  return (
    <Card className="h-full flex flex-col border-none shadow-none">
      {" "}
      <CardHeader className="px-4 py-3 border-b">
        {" "}
        <CardTitle className="text-sm flex items-center gap-2">
          {" "}
          <Bell className="w-4 h-4" /> Live Alert Feed{" "}
        </CardTitle>{" "}
      </CardHeader>{" "}
      <CardContent className="p-0 flex-1 overflow-hidden bg-muted/5">
        {" "}
        <ScrollArea className="h-[400px]">
          {" "}
          {alerts?.length > 0 ? (
            <div className="p-4 space-y-3">
              {" "}
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${getAlertColor(alert.severity)}`}
                >
                  {" "}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getAlertIcon(alert.severity)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm">
                          {alert.type}
                        </h4>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {new Date(alert.time).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-foreground">
                        {alert.message}
                      </p>
                      {alert.confidence && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          AI Confidence: {(alert.confidence * 100).toFixed(0)}%
                        </p>
                      )}
                      {alert.recommended_action && (
                        <div className="mt-2 bg-background/50 p-2 rounded-md border text-xs">
                          <span className="font-semibold block mb-1">Recommended Action:</span>
                          {alert.recommended_action}
                        </div>
                      )}
                      {alert.doctor_notification && (
                        <p className="text-[10px] text-blue-500 mt-1 font-medium">
                          {alert.doctor_notification}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}{" "}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
              {" "}
              <Bell className="w-8 h-8 mb-2 opacity-20" />{" "}
              <p className="text-sm">No active alerts</p>{" "}
            </div>
          )}{" "}
        </ScrollArea>{" "}
      </CardContent>{" "}
    </Card>
  );
};
