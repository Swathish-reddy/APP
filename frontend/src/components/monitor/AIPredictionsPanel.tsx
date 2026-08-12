import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, TrendingDown, Activity, ActivitySquare } from "lucide-react";

interface AIPredictionsPanelProps {
  predictions: any;
};
export const AIPredictionsPanel: React.FC<AIPredictionsPanelProps> = ({ predictions }) => {
  if (!predictions) {
    return (
      <Card className="h-full border-none shadow-none bg-muted/10 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Waiting for AI Intelligence...</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-none shadow-none bg-muted/10">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" /> AI Forecasting & Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        <div className="flex justify-between items-center bg-background rounded-lg p-3 shadow-sm">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">AI HEALTH SCORE</p>
            <div className="text-2xl font-bold font-mono text-emerald-500">{predictions.health_score}/100</div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-semibold">CV RISK</p>
            <div className="text-xl font-bold font-mono text-orange-500">{predictions.cardiovascular_risk}</div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <ActivitySquare className="w-3 h-3" /> PREDICTED PROGRESSION
          </h4>
          <div className="space-y-2">
            {predictions.predictions?.map((pred: any, idx: number) => (
              <div key={idx} className="bg-background rounded-lg p-3 shadow-sm border border-transparent hover:border-border transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{pred.condition}</span>
                  <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                    {(pred.probability * 100).toFixed(0)}% Prob
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {pred.trend === 'Increasing' ? (
                      <TrendingUp className="w-3 h-3 text-red-500" />
                    ) : pred.trend === 'Decreasing' ? (
                      <TrendingDown className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Activity className="w-3 h-3 text-blue-500" />
                    )}
                    {pred.trend}
                  </span>
                  <span>Within {pred.timeframe}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
