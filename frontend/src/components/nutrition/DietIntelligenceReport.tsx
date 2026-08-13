"use client";
import React, { useState, useEffect } from "react";
import { Utensils, Droplet, Flame } from "lucide-react";
import { DietData } from "@/types";
import { BASE_URL } from "@/services/api";

export const DietIntelligenceReport = ({
  patientId,
}: {
  patientId: string;
}) => {
  const [dietData, setDietData] = useState<DietData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDietData = () => {
    setLoading(true);
    setError(null);
    const id = patientId.replace("P", "");
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${BASE_URL}/diet/${id}/plan`, { headers })
      .then(async (res) => {
        if (!res.ok) {
           throw new Error(`Failed to load Diet Intelligence. Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setDietData(data))
      .catch((err) => {
         console.error("Error fetching diet intelligence:", err);
         setError("Unable to load Diet Intelligence.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDietData();
  }, [patientId]);

  if (loading) {
    return (
      <div className="dark bg-card/40 border border-border rounded-3xl p-4 md:p-6 mb-6 flex items-center justify-center h-40 text-muted-foreground">
        Analyzing patient data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dark bg-card/40 border border-red-500/20 rounded-3xl p-4 md:p-6 mb-6 flex flex-col items-center justify-center h-40 text-red-400">
        <p className="mb-4">{error}</p>
        <button onClick={fetchDietData} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!dietData) {
     return (
      <div className="dark bg-card/40 border border-border rounded-3xl p-4 md:p-6 mb-6 flex items-center justify-center h-40 text-muted-foreground">
        Insufficient patient report data for personalized diet intelligence.
      </div>
    );
  }

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
