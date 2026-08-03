"use client";
import React from "react";
export default async function PatientAllergies({ params }: { params: any }) {
  return (
    <div className="py-6">
      {" "}
      <h2 className="text-2xl font-bold text-foreground tracking-tight">
        Allergies
      </h2>{" "}
      <p className="text-muted-foreground mt-1">
        Known allergies and adverse reactions.
      </p>{" "}
      <div className="dark mt-8 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 text-center">
        {" "}
        <p className="text-muted-foreground">
          Allergies module under construction.
        </p>{" "}
      </div>{" "}
    </div>
  );
}
