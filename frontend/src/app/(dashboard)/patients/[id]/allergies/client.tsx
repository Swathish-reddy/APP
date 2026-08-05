"use client";
import { useParams } from 'next/navigation';
import React from "react";
export default function PatientAllergies() {
  const params = useParams();
  return (
    <div className="py-4 md:py-6">
      {" "}
      <h2 className="text-2xl font-bold text-foreground tracking-tight">
        Allergies
      </h2>{" "}
      <p className="text-muted-foreground mt-1">
        Known allergies and adverse reactions.
      </p>{" "}
      <div className="dark mt-8 bg-card/40 border border-border rounded-3xl p-4 md:p-8 text-center">
        {" "}
        <p className="text-muted-foreground">
          Allergies module under construction.
        </p>{" "}
      </div>{" "}
    </div>
  );
}



