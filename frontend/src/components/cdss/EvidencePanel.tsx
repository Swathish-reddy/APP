import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, TrendingUp, TrendingDown, Target, AlertCircle, Info } from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

interface EvidencePanelProps {
  selectedRec: any;
};
export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  selectedRec,
}) => {
  if (!selectedRec) {
    return (
      <Card className="h-full border-none shadow-none flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
        <BrainCircuit className="w-12 h-12 mb-4 opacity-20" />
        <p>Select a recommendation or disease prediction to view Explainable AI (XAI) details.</p>
      </Card>
    );
  }

  // If passed from cdss recommendations, we might need to map it,
  // if selected.
  // if not full XAI object format
  const xai = selectedRec.disease ? selectedRec : {
    disease: "Selected Condition",
    natural_language_explanation: selectedRec.reasoning || "Analysis complete.",
    prediction_score: 50,
    risk_comparison: { patient_risk: 50, population_average: 35 },
    shap_explanation: [],
    positive_factors: [],
    negative_factors: []
  };

  const shapData = xai.shap_explanation?.map((s: any) => ({
    name: s.feature,
    value: s.impact * 100, // percentage
    type: s.type
  })) || [];

  return (
    <Card className="h-full border-none shadow-none flex flex-col bg-transparent">
      <CardHeader className="px-0 pt-0 pb-2 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BrainCircuit className="w-5 h-5 text-indigo-500" /> Explainable AI (XAI) Insights
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-0 flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {}
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
          <h4 className="flex items-center gap-2 font-medium text-sm text-indigo-700 dark:text-indigo-400 mb-2">
            <Info className="w-4 h-4" /> AI Interpretation
          </h4>
          <p className="text-sm font-medium text-slate-700 dark:text-foreground">
            {xai.natural_language_explanation}
          </p>
        </div>

        {}
        {shapData.length > 0 && (
          <div>
            <h4 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wider flex items-center">
              <Target className="w-4 h-4 mr-2" /> Feature Contribution (SHAP)
            </h4>
            <div className="h-48 w-full bg-card rounded-xl border p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={shapData} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{fontSize: 10}} />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 10, fill: '#64748b'}} width={80} />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Impact']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <ReferenceLine x={0} stroke="#94a3b8" />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {shapData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.type === 'positive' ? '#ef4444' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-center">
              Red bars increase risk, Green bars decrease risk.
            </p>
          </div>
        )}

        {}
        <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider flex items-center text-red-500">
              <TrendingUp className="w-4 h-4 mr-1" /> Elevating Factors
            </h4>
            <div className="space-y-2">
              {xai.top_features?.map((f: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/30">
                  <span className="text-xs font-medium text-slate-700 dark:text-foreground">{f.name}</span>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">{f.impact}</span>
                </div>
              ))}
              {(!xai.top_features || xai.top_features.length === 0) && (
                <div className="text-xs text-muted-foreground p-2">No elevating factors identified.</div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider flex items-center text-emerald-500">
              <TrendingDown className="w-4 h-4 mr-1" /> Mitigating Factors
            </h4>
            <div className="space-y-2">
              {xai.negative_factors?.map((f: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-xs font-medium text-slate-700 dark:text-foreground">{f.name}</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{f.impact}</span>
                </div>
              ))}
              {(!xai.negative_factors || xai.negative_factors.length === 0) && (
                <div className="text-xs text-muted-foreground p-2 text-center border border-dashed rounded-lg">No mitigating factors</div>
              )}
            </div>
          </div>
        </div>

        {}
        {xai.risk_comparison && (
          <div className="bg-slate-50 dark:bg-card/50 p-4 rounded-xl border">
            <h4 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wider flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" /> Cohort Comparison
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">Patient Risk</span>
                  <span className="font-bold text-red-500">{xai.risk_comparison.patient_risk}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-muted rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.min(100, xai.risk_comparison.patient_risk)}%` }}></div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-muted-foreground">Population Average</span>
                  <span className="font-bold text-blue-500">{xai.risk_comparison.population_average}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-muted rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, xai.risk_comparison.population_average)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

