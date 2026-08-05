import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
interface NutritionAnalyticsProps {
  macros?: Record<string, number>;
}
export const NutritionAnalytics: React.FC<NutritionAnalyticsProps> = ({
  macros,
}) => {
  const macroData = macros
    ? [
        { name: "Carbs", value: macros.carbs, color: "#3b82f6" },
        { name: "Protein", value: macros.protein, color: "#10b981" },
        { name: "Fat", value: macros.fat, color: "#f59e0b" },
      ]
    : [];
  return (
    <Card className="h-full border-none shadow-none flex flex-col">
      {" "}
      <CardHeader className="px-0 pt-0">
        {" "}
        <CardTitle>Macro Breakdown</CardTitle>{" "}
      </CardHeader>{" "}
      <CardContent className="px-0 flex-1 flex flex-col items-center justify-center min-h-[300px]">
        {" "}
        {macros ? (
          <div className="w-full h-full relative">
            {" "}
            <ResponsiveContainer width="100%" height={250}>
              {" "}
              <PieChart>
                {" "}
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {" "}
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}{" "}
                </Pie>{" "}
                <RechartsTooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #1e293b", backgroundColor: "#0f172a" }}
                  formatter={(value: any) => [`${value}%`, "Percentage"]}
                />{" "}
                <Legend verticalAlign="bottom" height={36} />{" "}
              </PieChart>{" "}
            </ResponsiveContainer>{" "}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">No data</div>
        )}{" "}
      </CardContent>{" "}
    </Card>
  );
};
