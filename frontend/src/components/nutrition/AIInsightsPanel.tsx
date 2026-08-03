import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, TrendingDown, Target, ShoppingBag } from "lucide-react";
import { GroceryList } from "@/types";

interface AIInsightsPanelProps {
  impact?: Record<string, string>;
  grocery: GroceryList | null;
}
export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  impact,
  grocery,
}) => {
  return (
    <Card className="h-full border-none shadow-none flex flex-col">
      {" "}
      <CardHeader className="px-0 pt-0">
        {" "}
        <CardTitle className="flex items-center gap-2">
          {" "}
          <BrainCircuit className="w-5 h-5 text-primary" /> AI Insights &
          Impact{" "}
        </CardTitle>{" "}
      </CardHeader>{" "}
      <CardContent className="px-0 flex-1 space-y-6">
        {" "}
        {}{" "}
        {impact && (
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-4">
            {" "}
            <h4 className="flex items-center gap-2 font-medium text-sm text-primary">
              {" "}
              <Target className="w-4 h-4" /> Expected Clinical Impact{" "}
            </h4>{" "}
            <div className="grid grid-cols-2 gap-4">
              {" "}
              <div className="bg-background rounded-lg p-3 border">
                {" "}
                <p className="text-xs text-muted-foreground mb-1">
                  Weight Change
                </p>{" "}
                <p className="text-lg font-bold text-emerald-600 flex items-center">
                  {" "}
                  <TrendingDown className="w-4 h-4 mr-1" />{" "}
                  {impact.expected_weight_change_kg} kg{" "}
                </p>{" "}
              </div>{" "}
              <div className="bg-background rounded-lg p-3 border">
                {" "}
                <p className="text-xs text-muted-foreground mb-1">
                  HbA1c Reduction
                </p>{" "}
                <p className="text-lg font-bold text-emerald-600 flex items-center">
                  {" "}
                  <TrendingDown className="w-4 h-4 mr-1" />{" "}
                  {impact.hba1c_reduction}%{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div>
              {" "}
              <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                Reasoning
              </h5>{" "}
              <p className="text-sm font-medium">{impact.reasoning}</p>{" "}
            </div>{" "}
          </div>
        )}{" "}
        {}{" "}
        {grocery && (
          <div>
            {" "}
            <h4 className="flex items-center gap-2 font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
              {" "}
              <ShoppingBag className="w-4 h-4" /> Smart Grocery List{" "}
            </h4>{" "}
            <div className="text-sm p-4 bg-muted/40 rounded-xl border">
              {" "}
              <div className="flex justify-between items-center mb-3 pb-2 border-b">
                {" "}
                <span className="font-medium">Estimated Cost</span>{" "}
                <span className="font-bold text-primary">
                  {grocery.estimated_cost}
                </span>{" "}
              </div>{" "}
              <ul className="space-y-2">
                {" "}
                {grocery.items?.map((item, idx: number) => (
                  <li
                    key={idx}
                    className="flex justify-between text-muted-foreground"
                  >
                    {" "}
                    <span>{item.name}</span>{" "}
                    <span className="font-medium text-foreground">
                      {item.amount}
                    </span>{" "}
                  </li>
                ))}{" "}
              </ul>{" "}
            </div>{" "}
          </div>
        )}{" "}
      </CardContent>{" "}
    </Card>
  );
};
