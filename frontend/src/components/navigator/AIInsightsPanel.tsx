import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Target, Lightbulb, Link } from "lucide-react";
interface AIInsightsPanelProps {
  provider: any;
  type: string;
};
export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  provider,
  type,
}) => {
  if (!provider) {
    return (
      <Card className="h-full border-none shadow-none flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
        {" "}
        <BrainCircuit className="w-12 h-12 mb-4 opacity-20" />{" "}
        <p>Select a provider to view AI Matching Insights.</p>{" "}
      </Card>
    );
  }
  const xai = provider.xai || {};
  return (
    <Card className="h-full border-none shadow-none">
      {" "}
      <CardHeader className="px-0 pt-0">
        {" "}
        <CardTitle className="flex items-center gap-2">
          {" "}
          <BrainCircuit className="w-5 h-5 text-primary" /> Explainable AI (XAI)
          Match{" "}
        </CardTitle>{" "}
      </CardHeader>{" "}
      <CardContent className="px-0 space-y-6">
        {" "}
        {}{" "}
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
          {" "}
          <h4 className="flex items-center gap-2 font-medium text-sm text-primary mb-2">
            {" "}
            <Lightbulb className="w-4 h-4" /> Why Selected{" "}
          </h4>{" "}
          <p className="text-sm font-medium">
            {xai.why_selected ||
              "Strong overall profile match for your twin data."}
          </p>{" "}
        </div>{" "}
        {}{" "}
        <div>
          {" "}
          <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            {" "}
            <Link className="w-4 h-4" /> Matching Criteria{" "}
          </h4>{" "}
          <div className="flex flex-wrap gap-2">
            {" "}
            {xai.matching_criteria ? (
              xai.matching_criteria.map((crit: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-muted px-3 py-1 rounded-full text-xs font-medium border"
                >
                  {" "}
                  {crit}{" "}
                </span>
              ))
            ) : (
              <span className="bg-muted px-3 py-1 rounded-full text-xs font-medium border">
                Base Rank
              </span>
            )}{" "}
          </div>{" "}
        </div>{" "}
        {}{" "}
        <div>
          {" "}
          <h4 className="flex items-center gap-2 font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">
            {" "}
            <Target className="w-4 h-4" /> Expected Outcome{" "}
          </h4>{" "}
          <div className="text-sm p-4 bg-card rounded-xl border">
            {" "}
            {xai.expected_outcome || "Standard positive care trajectory."}{" "}
          </div>{" "}
        </div>{" "}
        <div className="pt-4 border-t">
          {" "}
          <p className="text-xs text-muted-foreground text-center">
            {" "}
            AI Match Score:{" "}
            <span className="font-bold text-primary">
              {provider.match_score}/100
            </span>{" "}
          </p>{" "}
        </div>{" "}
      </CardContent>{" "}
    </Card>
  );
};
