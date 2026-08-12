import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
interface DecisionExplorerProps {
  pathways: any[];
};
export const DecisionExplorer: React.FC<DecisionExplorerProps> = ({
  pathways,
}) => {
  return (
    <Card className="h-full border-muted bg-slate-50/50 dark:bg-card/50 relative overflow-hidden">
      {" "}
      {}{" "}
      <div className="absolute top-0 right-0 w-full md:w-full md:w-full md:w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />{" "}
      <div className="absolute bottom-0 left-0 w-full md:w-full md:w-full md:w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />{" "}
      <CardHeader>
        {" "}
        <CardTitle>Treatment Pathway</CardTitle>{" "}
      </CardHeader>{" "}
      <CardContent>
        {" "}
        <div className="relative pl-6 border-l-2 border-primary/20 space-y-8 mt-4">
          {" "}
          {pathways && pathways.length > 0 ? (
            pathways.map((step, idx) => (
              <div key={idx} className="relative">
                {" "}
                {}{" "}
                <div className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm" />{" "}
                <div className="bg-card p-4 rounded-xl border shadow-sm transition-all hover:shadow-md">
                  {" "}
                  <div className="flex justify-between items-start mb-2">
                    {" "}
                    <h4 className="font-semibold">{step.action}</h4>{" "}
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {step.duration}
                    </span>{" "}
                  </div>{" "}
                  <p className="text-sm text-muted-foreground">
                    {step.details}
                  </p>{" "}
                </div>{" "}
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground italic">
              No pathways available. Select a specific condition.
            </div>
          )}{" "}
        </div>{" "}
      </CardContent>{" "}
    </Card>
  );
};
