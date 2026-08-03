import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CircleDashed } from "lucide-react";
interface CareJourneyPanelProps {
  pathway: any[];
}
export const CareJourneyPanel: React.FC<CareJourneyPanelProps> = ({
  pathway,
}) => {
  return (
    <Card className="h-full border-none shadow-none relative overflow-hidden">
      {" "}
      <CardHeader className="px-0 pt-0">
        {" "}
        <CardTitle>Care Pathway Timeline</CardTitle>{" "}
      </CardHeader>{" "}
      <CardContent className="px-0">
        {" "}
        <div className="relative pl-8 border-l-2 border-primary/20 space-y-8 mt-6">
          {" "}
          {pathway && pathway.length > 0 ? (
            pathway.map((step, idx) => {
              const isCompleted = step.status === "Completed";
              return (
                <div key={idx} className="relative">
                  {" "}
                  {}{" "}
                  <div
                    className={`absolute -left-[41px] top-0 h-6 w-6 rounded-full flex items-center justify-center bg-background`}
                  >
                    {" "}
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-background rounded-full" />
                    ) : (
                      <CircleDashed className="w-5 h-5 text-muted-foreground bg-background rounded-full" />
                    )}{" "}
                  </div>{" "}
                  <div
                    className={`p-4 rounded-xl border shadow-sm transition-all hover:shadow-md ${isCompleted ? "bg-muted/30 border-emerald-500/30" : "bg-card"}`}
                  >
                    {" "}
                    <div className="flex justify-between items-start mb-2">
                      {" "}
                      <h4
                        className={`font-semibold ${isCompleted ? "text-emerald-700 dark:text-emerald-400" : ""}`}
                      >
                        {step.step}
                      </h4>{" "}
                      <span className="text-xs font-medium text-muted-foreground">
                        {step.date}
                      </span>{" "}
                    </div>{" "}
                    <p className="text-sm text-muted-foreground">
                      {step.detail}
                    </p>{" "}
                  </div>{" "}
                </div>
              );
            })
          ) : (
            <div className="text-sm text-muted-foreground italic">
              No pathway available.
            </div>
          )}{" "}
        </div>{" "}
      </CardContent>{" "}
    </Card>
  );
};
