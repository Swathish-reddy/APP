"use client";
import React, { useState, useEffect } from "react";
import { Utensils, Droplet, Flame } from "lucide-react";
import { DietData } from "@/types";

export const DietIntelligenceReport = ({
  patientId,
}: {
  patientId: string;
}) => {
  const [dietData, setDietData] = useState<DietData | null>(null);
  useEffect(() => {
    const id = patientId.replace("P", "");
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`http://localhost:8000/api/v1/diet/${id}/plan`, { headers })
      .then((res) => res.json())
      .then((data) => setDietData(data))
      .catch((err) => console.error("Error fetching diet intelligence:", err));
  }, [patientId]);
  if (!dietData) return null;
  return (
    <div className="dark bg-card/40 border border-border rounded-3xl p-4 md:p-4 md:p-4 md:p-6 mb-6">
      {" "}
      <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
        {" "}
        <Utensils className="w-6 h-6 text-green-400" /> AI Diet
        Intelligence{" "}
      </h3>{" "}
      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {" "}
        <div className="dark bg-muted/50 p-4 rounded-xl border border-border/50">
          {" "}
          <p className="text-muted-foreground text-xs uppercase mb-1 font-semibold flex items-center gap-1">
            {" "}
            <Flame className="w-3 h-3 text-orange-400" /> Caloric Targets{" "}
          </p>{" "}
          <p className="text-foreground text-sm whitespace-pre-wrap">
            {dietData["3_daily_energy_requirements"]?.target_calories} kcal/day
          </p>{" "}
        </div>{" "}
        <div className="dark bg-muted/50 p-4 rounded-xl border border-border/50">
          {" "}
          <p className="text-muted-foreground text-xs uppercase mb-1 font-semibold">
            Macronutrient Ratio
          </p>{" "}
          <p className="text-foreground text-sm whitespace-pre-wrap">
            Protein: {dietData["4_macronutrient_requirements"]?.protein}, Carbs: {dietData["4_macronutrient_requirements"]?.carbs}, Fats: {dietData["4_macronutrient_requirements"]?.fats}
          </p>{" "}
        </div>{" "}
        <div className="dark bg-muted/50 p-4 rounded-xl border border-border/50">
          {" "}
          <p className="text-muted-foreground text-xs uppercase mb-1 font-semibold flex items-center gap-1">
            {" "}
            <Droplet className="w-3 h-3 text-blue-400" /> Hydration{" "}
          </p>{" "}
          <p className="text-foreground text-sm whitespace-pre-wrap">
            {dietData["11_hydration_plan"]}
          </p>{" "}
        </div>{" "}
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl md:col-span-3">
          {" "}
          <p className="text-green-400 text-xs uppercase mb-2 font-semibold">
            Clinical Dietary Restrictions (Foods to Avoid)
          </p>{" "}
          <p className="text-foreground text-sm whitespace-pre-wrap">
            {dietData["10_foods_to_avoid"]?.join(", ")}
          </p>{" "}
        </div>{" "}
        <div className="dark bg-muted/50 p-4 rounded-xl border border-border/50 md:col-span-3">
          {" "}
          <p className="text-muted-foreground text-xs uppercase mb-2 font-semibold">
            Suggested Meal Plan
          </p>{" "}
          <p className="text-foreground text-sm whitespace-pre-wrap">
            {dietData["8_personalized_meal_plan"]}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
