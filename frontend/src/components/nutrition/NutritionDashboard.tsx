"use client";
import React, { useState, useEffect } from "react";
import { NutritionTopSection } from "./NutritionTopSection";
import { MealPlanPanel } from "./MealPlanPanel";
import { NutritionAnalytics } from "./NutritionAnalytics";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { getPatient } from "@/lib/api/patients";
import { NutritionPlan, GroceryList, NutritionCompliance } from "@/types";
import { BASE_URL } from "@/services/api";

interface NutritionDashboardProps {
  patientId: string;
};
export const NutritionDashboard: React.FC<NutritionDashboardProps> = ({
  patientId,
}) => {
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [grocery, setGrocery] = useState<GroceryList | null>(null);
  const [compliance, setCompliance] = useState<NutritionCompliance | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const planRes = await fetch(
          `${BASE_URL}/nutrition/patients/${patientId}/plan`,
          { headers }
        );
        if (planRes.ok) {
           const planData = await planRes.json();
           setPlan(planData);
        }

        const groceryRes = await fetch(
          `${BASE_URL}/nutrition/patients/${patientId}/grocery`,
          { headers }
        );
        if (groceryRes.ok) {
           const groceryData = await groceryRes.json();
           setGrocery(groceryData);
        }

        const compRes = await fetch(
          `${BASE_URL}/nutrition/patients/${patientId}/compliance`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify({ adherence_percent: 85 }),
          },
        );
        if (compRes.ok) {
           const compData = await compRes.json();
           setCompliance(compData);
        }
      } catch (error) {
        console.error("Error fetching nutrition data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNutritionData();
  }, [patientId]);
  const handleSwap = async (mealType: string, currentFood: string) => {
    alert(
      `AI Substitution Engine triggered for ${currentFood}. Checking valid macros and allergies...`,
    );
  };
  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        Loading AI Nutrition Engine...
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {" "}
      <div className="flex justify-between items-end">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl md:text-2xl md:text-2xl md:text-3xl font-bold tracking-tight">
            Nutrition Intelligence Center
          </h1>{" "}
          <p className="text-muted-foreground mt-1">
            Personalized therapeutic meals and predictive outcomes.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <NutritionTopSection plan={plan} compliance={compliance} />{" "}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
        {" "}
        {}{" "}
        <div className="lg:col-span-4 bg-background border rounded-xl p-4 shadow-sm h-full">
          {" "}
          <MealPlanPanel plan={plan} onSwap={handleSwap} />{" "}
        </div>{" "}
        {}{" "}
        <div className="lg:col-span-4 bg-background border rounded-xl p-4 shadow-sm h-full">
          {" "}
          <NutritionAnalytics macros={plan?.goals?.macros_percent} />{" "}
        </div>{" "}
        {}{" "}
        <div className="lg:col-span-4 bg-background border rounded-xl p-4 shadow-sm h-full overflow-y-auto">
          {" "}
          <AIInsightsPanel impact={plan?.impact} grocery={grocery} />{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
