import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Syringe, Activity, CalendarClock } from "lucide-react";
interface RecommendationPanelProps {
  recommendations: any;
  onSelectRec: (rec: any) => void;
  selectedRecId: string | null;
}
export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendations,
  onSelectRec,
  selectedRecId,
}) => {
  const renderCategory = (title: string, icon: any, data: any[]) => {
    if (!data || data.length === 0) return null;
    return (
      <div className="mb-6">
        {" "}
        <div className="flex items-center gap-2 mb-3">
          {" "}
          {icon}{" "}
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            {title}
          </h3>{" "}
        </div>{" "}
        <div className="space-y-3">
          {" "}
          {data.map((rec) => (
            <div
              key={rec.id}
              onClick={() => onSelectRec(rec)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${selectedRecId === rec.id ? "bg-primary/5 border-primary shadow-sm" : "bg-card hover:bg-muted/50"}`}
            >
              {" "}
              <div className="flex justify-between items-start mb-2">
                {" "}
                <span className="font-medium text-sm leading-tight">
                  {rec.text}
                </span>{" "}
                <Badge
                  variant={
                    rec.priority === "High"
                      ? "destructive"
                      : rec.priority === "Medium"
                        ? "default"
                        : "secondary"
                  }
                  className="ml-2 shrink-0"
                >
                  {" "}
                  {rec.priority}{" "}
                </Badge>{" "}
              </div>{" "}
              <p className="text-xs text-muted-foreground line-clamp-2">
                {rec.reasoning}
              </p>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>
    );
  };
  return (
    <Card className="h-full flex flex-col border-none shadow-none">
      {" "}
      <CardHeader className="px-0 pt-0">
        <CardTitle>Core Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="px-0 flex-1 overflow-hidden">
        {" "}
        <ScrollArea className="h-[600px] pr-4">
          {" "}
          {recommendations ? (
            <>
              {" "}
              {renderCategory(
                "Diagnostic Tests",
                <Activity className="w-4 h-4 text-purple-500" />,
                recommendations.diagnostic,
              )}{" "}
              {renderCategory(
                "Treatments",
                <Syringe className="w-4 h-4 text-rose-500" />,
                recommendations.treatment,
              )}{" "}
              {renderCategory(
                "Preventive Care",
                <Shield className="w-4 h-4 text-emerald-500" />,
                recommendations.preventive,
              )}{" "}
              {renderCategory(
                "Follow Up",
                <CalendarClock className="w-4 h-4 text-blue-500" />,
                recommendations.follow_up,
              )}{" "}
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Loading recommendations...
            </div>
          )}{" "}
        </ScrollArea>{" "}
      </CardContent>{" "}
    </Card>
  );
};
