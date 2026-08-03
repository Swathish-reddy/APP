import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, AlertCircle, CheckCircle2, Zap, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
interface ReasoningPanelProps {
  chain: any[];
}
const typeConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  biomarker: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  mechanism: {
    icon: <Zap className="w-4 h-4" />,
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  diagnosis: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
  },
  consequence: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  action: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
};
export const ReasoningPanel: React.FC<ReasoningPanelProps> = ({ chain }) => {
  return (
    <Card className="h-full border-none shadow-none flex flex-col">
      {" "}
      <CardHeader className="px-0 pt-0">
        {" "}
        <CardTitle className="flex items-center gap-2 text-base">
          {" "}
          <GitBranch className="w-5 h-5 text-primary" /> Medical Reasoning
          Chain{" "}
        </CardTitle>{" "}
        <p className="text-xs text-muted-foreground">
          Step-by-step clinical logic connecting your biomarkers to outcomes
        </p>{" "}
      </CardHeader>{" "}
      <CardContent className="px-0 flex-1">
        {" "}
        <ScrollArea className="h-[560px] pr-2">
          {" "}
          {chain && chain.length > 0 ? (
            <div className="relative">
              {" "}
              {}{" "}
              <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-border" />{" "}
              <div className="space-y-4">
                {" "}
                {chain.map((node: any, idx: number) => {
                  const cfg = typeConfig[node.type] || typeConfig.action;
                  return (
                    <div key={idx} className="flex items-start gap-4 relative">
                      {" "}
                      {}{" "}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background z-10 ${cfg.color} border-current`}
                      >
                        {" "}
                        {cfg.icon}{" "}
                      </div>{" "}
                      {}{" "}
                      <div
                        className={`flex-1 p-3 rounded-xl border text-sm ${cfg.bg}`}
                      >
                        {" "}
                        <div className="flex justify-between items-start">
                          {" "}
                          <p className={`font-semibold ${cfg.color}`}>
                            {node.node}
                          </p>{" "}
                          <span className="text-[10px] uppercase font-mono text-muted-foreground ml-2 flex-shrink-0 bg-background/60 px-1.5 py-0.5 rounded">
                            {" "}
                            {node.type}{" "}
                          </span>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>
                  );
                })}{" "}
              </div>{" "}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
              {" "}
              <Info className="w-4 h-4" /> No significant reasoning chains
              detected for this patient.{" "}
            </div>
          )}{" "}
        </ScrollArea>{" "}
      </CardContent>{" "}
    </Card>
  );
};
