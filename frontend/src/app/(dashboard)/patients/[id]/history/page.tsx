"use client";
import React from "react";
export default async function PatientHistory({ params }: { params: any }) {
  return (
    <div className="py-6">
      {" "}
      <h2 className="text-2xl font-bold text-foreground tracking-tight">
        Medical History
      </h2>{" "}
      <p className="text-muted-foreground mt-1">
        Comprehensive medical and family history.
      </p>{" "}
      <div className="dark mt-8 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 text-center">
        {" "}
        <p className="text-muted-foreground">
          History module under construction.
        </p>{" "}
      </div>{" "}
    </div>
  );
}
