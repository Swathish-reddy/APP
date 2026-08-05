import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle, XCircle, CalendarClock } from "lucide-react";

interface ActionPlanPanelProps {
  plan: any;
}

export const ActionPlanPanel: React.FC<ActionPlanPanelProps> = ({ plan }) => {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [skippedItems, setSkippedItems] = useState<Set<string>>(new Set());

  if (!plan) return <div className="p-4 md:p-8 text-center text-muted-foreground animate-pulse">Generating Action Plan...</div>;

  const handleMarkComplete = (actionId: string) => {
    setCompletedItems(prev => new Set(prev).add(actionId));
  };

  const handleSkip = (actionId: string) => {
    setSkippedItems(prev => new Set(prev).add(actionId));
  };

  // Map category to a specific color/icon if desired
  const categoryStyles: Record<string, string> = {
    "Immediate Actions": "text-red-500 border-red-500/20 bg-red-50/50 dark:bg-red-950/20",
    "Emergency Warning": "text-red-600 border-red-600/30 bg-red-100/50 dark:bg-red-900/30",
    "Diet Plan": "text-emerald-500 border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20",
    "Exercise Plan": "text-orange-500 border-orange-500/20 bg-orange-50/50 dark:bg-orange-950/20",
    "Medication Reminder": "text-purple-500 border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20",
    "Doctor Consultation": "text-blue-500 border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20",
    "Recommended Tests": "text-indigo-500 border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20",
  };

  const actionCategories = Object.entries(plan.action_plan || {});

  return (
    <Card className="h-full border-none shadow-none flex flex-col bg-transparent">
      <CardHeader className="px-0 pt-0 pb-2 flex-shrink-0">
        <CardTitle className="text-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Personalized Action Plan
          </div>
          <div className="text-xs font-normal text-muted-foreground flex items-center gap-2">
            Progress: 
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${Math.min(100, completedItems.size * 10 + (plan.progress?.daily_progress || 0))}%` }}
              ></div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-0 space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
        {actionCategories.length === 0 && (
          <div className="text-center text-muted-foreground p-4 md:p-8 border border-dashed rounded-xl">
            No specific actions required at this time. Maintain healthy lifestyle.
          </div>
        )}
        
        {actionCategories.map(([category, items]: [string, any]) => (
          items.length > 0 && (
            <div key={category} className="space-y-3">
              <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                {category}
              </h3>
              {items.map((item: any, idx: number) => {
                const actionId = `${category}-${idx}`;
                const isCompleted = completedItems.has(actionId);
                const isSkipped = skippedItems.has(actionId);
                const style = categoryStyles[category] || "text-slate-700 border-slate-200 bg-card";
                
                if (isSkipped) return null; // Hide skipped items

                return (
                  <div 
                    key={idx} 
                    className={`flex items-start justify-between p-3.5 rounded-xl border transition-all duration-300 ${isCompleted ? 'opacity-50 grayscale bg-slate-50' : style}`}
                  >
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {item.action}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{item.reason}</span>
                      </p>
                    </div>
                    {!isCompleted && (
                      <div className="flex flex-col gap-2 ml-4 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700 w-full justify-start"
                          onClick={() => handleMarkComplete(actionId)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Done
                        </Button>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 bg-slate-100 hover:bg-slate-200 text-slate-600"
                            title="Reschedule"
                          >
                            <CalendarClock className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 bg-red-50 hover:bg-red-100 text-red-500"
                            onClick={() => handleSkip(actionId)}
                            title="Skip"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {isCompleted && (
                      <div className="ml-4 flex items-center text-emerald-500 font-medium text-xs">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Completed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ))}
      </CardContent>
    </Card>
  );
};

