import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coffee, Sun, Moon, Apple, RefreshCw } from "lucide-react";
import { NutritionPlan, Meal } from "@/types";

interface MealPlanPanelProps {
  plan: NutritionPlan | null;
  onSwap: (mealType: string, currentFood: string) => void;
};
export const MealPlanPanel: React.FC<MealPlanPanelProps> = ({
  plan,
  onSwap,
}) => {
  const renderMeal = (type: string, icon: React.ReactNode, meal: Meal | undefined) => {
    if (!meal) return null;
    return (
      <div className="p-4 bg-card rounded-xl border mb-4 hover:shadow-md transition-shadow">
        {" "}
        <div className="flex items-center justify-between mb-2">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            {icon}{" "}
            <h4 className="font-semibold text-sm uppercase tracking-wider">
              {type}
            </h4>{" "}
          </div>{" "}
          <span className="text-sm font-medium text-muted-foreground">
            {meal.calories} kcal
          </span>{" "}
        </div>{" "}
        <div className="flex items-center justify-between mt-3">
          {" "}
          <p className="text-sm font-medium">{meal.name}</p>{" "}
          <button
            onClick={() => onSwap(type, meal.name)}
            className="p-1.5 text-muted-foreground hover:bg-muted rounded-full transition-colors"
            title="Find Substitution"
          >
            {" "}
            <RefreshCw className="w-4 h-4" />{" "}
          </button>{" "}
        </div>{" "}
        <div className="flex gap-2 mt-3">
          {" "}
          <Badge variant="outline" className="text-xs">
            P: {meal.protein}g
          </Badge>{" "}
          <Badge variant="outline" className="text-xs">
            C: {meal.carbs}g
          </Badge>{" "}
          <Badge variant="outline" className="text-xs">
            F: {meal.fat}g
          </Badge>{" "}
        </div>{" "}
      </div>
    );
  };
  return (
    <Card className="h-full border-none shadow-none flex flex-col">
      {" "}
      <CardHeader className="px-0 pt-0">
        {" "}
        <CardTitle>Daily Meal Plan</CardTitle>{" "}
      </CardHeader>{" "}
      <CardContent className="px-0 flex-1 overflow-hidden">
        {" "}
        <ScrollArea className="h-[600px] pr-4">
          {" "}
          {plan?.daily_plan ? (
            <>
              {" "}
              {renderMeal(
                "Breakfast",
                <Coffee className="w-4 h-4 text-amber-600" />,
                plan.daily_plan.breakfast,
              )}{" "}
              {renderMeal(
                "Lunch",
                <Sun className="w-4 h-4 text-amber-500" />,
                plan.daily_plan.lunch,
              )}{" "}
              {renderMeal(
                "Snack",
                <Apple className="w-4 h-4 text-green-500" />,
                plan.daily_plan.snacks,
              )}{" "}
              {renderMeal(
                "Dinner",
                <Moon className="w-4 h-4 text-indigo-500" />,
                plan.daily_plan.dinner,
              )}{" "}
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Loading meals...
            </div>
          )}{" "}
        </ScrollArea>{" "}
      </CardContent>{" "}
    </Card>
  );
};
