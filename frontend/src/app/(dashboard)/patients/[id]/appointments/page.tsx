"use client";
import React from "react";
export default async function PatientAppointments({ params }: { params: any }) {
  return (
    <div className="py-6">
      {" "}
      <h2 className="text-2xl font-bold text-foreground tracking-tight">
        Appointments
      </h2>{" "}
      <p className="text-muted-foreground mt-1">
        Manage scheduled visits and consultations.
      </p>{" "}
      <div className="dark mt-8 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 text-center">
        {" "}
        <p className="text-muted-foreground">
          Appointment management module under construction.
        </p>{" "}
      </div>{" "}
    </div>
  );
}
