"use client";
import React from "react";
import { Brain, Activity, AlertTriangle, FileCheck } from "lucide-react";
export default function DocumentInsights({ document }: { document: any }) {
  if (!document) {
    return (
      <div className="dark bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center">
        {" "}
        <Brain className="w-12 h-12 text-slate-200 mb-4" />{" "}
        <h3 className="text-slate-400 font-medium">Select a document</h3>{" "}
        <p className="text-sm text-slate-300 mt-1">
          AI insights will appear here
        </p>{" "}
      </div>
    );
  }
  const { ai_summary, abnormalities, structured_data, status } = document;
  return (
    <div className="dark bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
      {" "}
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        {" "}
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          {" "}
          <Brain className="w-5 h-5 text-indigo-400" />{" "}
        </div>{" "}
        <div>
          {" "}
          <h3 className="font-medium text-slate-200">
            AI Document Intelligence
          </h3>{" "}
          <p className="text-xs text-slate-400">
            Auto-extracted analysis
          </p>{" "}
        </div>{" "}
        {status === "Processing" && (
          <span className="ml-auto flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
            {" "}
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>{" "}
            Analyzing...{" "}
          </span>
        )}{" "}
      </div>{" "}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
        {" "}
        {}{" "}
        {ai_summary && (
          <div className="space-y-2">
            {" "}
            <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              {" "}
              <FileCheck className="w-4 h-4" /> Clinical Summary{" "}
            </h4>{" "}
            <div className="dark bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
              {" "}
              <p className="text-sm text-slate-400 leading-relaxed">
                {ai_summary}
              </p>{" "}
            </div>{" "}
          </div>
        )}{" "}
        {}{" "}
        {abnormalities && Object.keys(abnormalities).length > 0 && (
          <div className="space-y-2">
            {" "}
            <h4 className="text-sm font-medium text-amber-500/80 flex items-center gap-2">
              {" "}
              <AlertTriangle className="w-4 h-4" /> Detected Abnormalities{" "}
            </h4>{" "}
            <div className="space-y-2">
              {" "}
              {Object.entries(abnormalities).map(([key, value]: any) => (
                <div
                  key={key}
                  className="flex justify-between items-center bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl"
                >
                  {" "}
                  <span className="text-sm text-slate-300 capitalize">
                    {key.replace("_", " ")}
                  </span>{" "}
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-md ${value === "High" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}
                  >
                    {" "}
                    {value}{" "}
                  </span>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>
        )}{" "}
        {}{" "}
        {structured_data && Object.keys(structured_data).length > 0 && (
          <div className="space-y-2">
            {" "}
            <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              {" "}
              <Activity className="w-4 h-4" /> Extracted Lab Values{" "}
            </h4>{" "}
            <div className="grid grid-cols-2 gap-2">
              {" "}
              {Object.entries(structured_data).map(([key, value]: any) => (
                <div
                  key={key}
                  className="dark bg-slate-800/30 p-3 rounded-xl border border-slate-800 flex flex-col"
                >
                  {" "}
                  <span className="text-xs text-slate-400 capitalize mb-1">
                    {key.replace("_", " ")}
                  </span>{" "}
                  <span className="text-sm font-semibold text-slate-200">
                    {value}
                  </span>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
}
