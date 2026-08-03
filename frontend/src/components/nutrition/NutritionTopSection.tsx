import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Target, Flame, BrainCircuit, CheckCircle2 } from "lucide-react";
import { NutritionPlan, NutritionCompliance } from "@/types";

interface NutritionTopSectionProps {
  plan: NutritionPlan | null;
  compliance: NutritionCompliance | null;
}
export const NutritionTopSection: React.FC<NutritionTopSectionProps> = ({
  plan,
  compliance,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {" "}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
            Current Program
          </CardTitle>{" "}
          <Activity className="h-4 w-4 text-green-500" />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-xl font-bold">
            {plan?.program || "Loading..."}
          </div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            Based on Twin Risk Factors
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
            Daily Target
          </CardTitle>{" "}
          <Flame className="h-4 w-4 text-orange-500" />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-2xl font-bold">
            {plan?.goals?.target_calories || 0} kcal
          </div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            TDEE Adjusted
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
            Hydration Goal
          </CardTitle>{" "}
          <Droplets className="h-4 w-4 text-blue-500" />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-2xl font-bold">
            {plan?.goals?.hydration_liters || 0} L
          </div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            Daily requirement
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
        {" "}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {" "}
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
            Diet Adherence
          </CardTitle>{" "}
          <Target className="h-4 w-4 text-purple-500" />{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="text-2xl font-bold">
            {compliance
              ? `${Math.round(compliance.current_adherence_avg)}%`
              : "--"}
          </div>{" "}
          <p className="text-xs text-muted-foreground mt-1">
            7-day average
          </p>{" "}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
};
