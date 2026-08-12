import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  User,
  Stethoscope,
  BarChart2,
  Download,
  ChevronRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
interface ReportPanelProps {
  report: any;
  onChangeType: (type: string) => void;
  reportType: string;
};
export const ReportPanel: React.FC<ReportPanelProps> = ({
  report,
  onChangeType,
  reportType,
}) => {
  const types = [
    {
      id: "patient",
      label: "Patient Report",
      icon: <User className="w-3.5 h-3.5" />,
    },
    {
      id: "clinical",
      label: "Clinical",
      icon: <Stethoscope className="w-3.5 h-3.5" />,
    },
    {
      id: "executive",
      label: "Executive",
      icon: <BarChart2 className="w-3.5 h-3.5" />,
    },
  ];
  return (
    <Card className="h-full border-none shadow-none flex flex-col">
      {" "}
      <CardHeader className="px-0 pt-0">
        {" "}
        <div className="flex items-center justify-between">
          {" "}
          <CardTitle className="flex items-center gap-2 text-base">
            {" "}
            <FileText className="w-5 h-5 text-primary" /> AI Generated
            Report{" "}
          </CardTitle>{" "}
        </div>{" "}
        {}{" "}
        <div className="flex gap-1 mt-2">
          {" "}
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => onChangeType(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${reportType === t.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`}
            >
              {" "}
              {t.icon} {t.label}{" "}
            </button>
          ))}{" "}
        </div>{" "}
      </CardHeader>{" "}
      <CardContent className="px-0 flex-1 overflow-hidden">
        {" "}
        <ScrollArea className="h-[640px] pr-2">
          {" "}
          {report && (
            <div className="space-y-4 text-sm">
              {" "}
              {}{" "}
              <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl">
                {" "}
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  {report.report_type}
                </p>{" "}
                <p className="font-bold text-lg">{report.patient_name}</p>{" "}
                <p className="text-xs text-muted-foreground">
                  {new Date(report.generated_at).toLocaleString()}
                </p>{" "}
                {report.health_score !== undefined && (
                  <div className="flex items-center gap-3 mt-3">
                    {" "}
                    <div className="text-center">
                      {" "}
                      <p className="text-2xl font-bold text-emerald-500">
                        {report.health_score}
                      </p>{" "}
                      <p className="text-[10px] text-muted-foreground">
                        Health Score
                      </p>{" "}
                    </div>{" "}
                    <div className="text-center">
                      {" "}
                      <p
                        className={`text-2xl font-bold ${report.risk_level === "High" || report.risk_level === "Critical" ? "text-red-500" : "text-amber-500"}`}
                      >
                        {report.risk_level}
                      </p>{" "}
                      <p className="text-[10px] text-muted-foreground">
                        Risk Level
                      </p>{" "}
                    </div>{" "}
                  </div>
                )}{" "}
                {report.wellness_score !== undefined && (
                  <div className="mt-3">
                    {" "}
                    <p className="text-2xl font-bold text-indigo-500">
                      {report.wellness_score}
                      <span className="text-sm font-normal text-muted-foreground">
                        /80
                      </span>
                    </p>{" "}
                    <p className="text-[10px] text-muted-foreground">
                      Wellness Score
                    </p>{" "}
                  </div>
                )}{" "}
              </div>{" "}
              {}{" "}
              {report.disease_predictions && (
                <div>
                  {" "}
                  <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-2">
                    Disease Risk Predictions
                  </h4>{" "}
                  <div className="space-y-2">
                    {" "}
                    {report.disease_predictions.map((d: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2.5 rounded-lg border bg-card"
                      >
                        {" "}
                        <div className="flex-1">
                          {" "}
                          <p className="font-medium">{d.disease}</p>{" "}
                          <p className="text-xs text-muted-foreground">
                            {d.severity} • {Math.round(d.confidence * 100)}%
                            confidence
                          </p>{" "}
                        </div>{" "}
                        <div
                          className={`text-lg font-bold ${d.risk_percent > 60 ? "text-red-500" : d.risk_percent > 35 ? "text-amber-500" : "text-emerald-500"}`}
                        >
                          {" "}
                          {d.risk_percent}%{" "}
                        </div>{" "}
                      </div>
                    ))}{" "}
                  </div>{" "}
                </div>
              )}{" "}
              {}{" "}
              {report.risk_profile && (
                <div>
                  {" "}
                  <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-2">
                    Risk Profile
                  </h4>{" "}
                  <div className="space-y-2">
                    {" "}
                    {Object.entries(report.risk_profile).map(
                      ([disease, info]: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-lg border bg-card"
                        >
                          {" "}
                          <span className="font-medium">{disease}</span>{" "}
                          <span
                            className={`font-bold ${info.risk > 60 ? "text-red-500" : info.risk > 35 ? "text-amber-500" : "text-emerald-500"}`}
                          >
                            {info.risk}%
                          </span>{" "}
                        </div>
                      ),
                    )}{" "}
                  </div>{" "}
                </div>
              )}{" "}
              {}{" "}
              {report.recommendations && report.recommendations.length > 0 && (
                <div>
                  {" "}
                  <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-2">
                    Recommendations
                  </h4>{" "}
                  <div className="space-y-2">
                    {" "}
                    {report.recommendations.map((rec: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2.5 rounded-lg border bg-card"
                      >
                        {" "}
                        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />{" "}
                        <p className="text-xs">{rec}</p>{" "}
                      </div>
                    ))}{" "}
                  </div>{" "}
                </div>
              )}{" "}
              {}{" "}
              {report.suggested_diagnostic_tests &&
                report.suggested_diagnostic_tests.length > 0 && (
                  <div>
                    {" "}
                    <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-2">
                      Suggested Tests
                    </h4>{" "}
                    <div className="flex flex-wrap gap-1.5">
                      {" "}
                      {report.suggested_diagnostic_tests.map(
                        (t: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2 py-1 rounded-full"
                          >
                            {t}
                          </span>
                        ),
                      )}{" "}
                    </div>{" "}
                  </div>
                )}{" "}
              {}{" "}
              {report.lifestyle_observations && (
                <div>
                  {" "}
                  <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-2">
                    Lifestyle Analysis
                  </h4>{" "}
                  <div className="space-y-2">
                    {" "}
                    {report.lifestyle_observations.map(
                      (obs: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-2.5 rounded-lg border bg-card"
                        >
                          {" "}
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded ${obs.status === "Excellent" || obs.status === "Good" || obs.status === "Low" || obs.status === "Non-Smoker" ? "bg-emerald-500/10 text-emerald-600" : obs.status === "Moderate" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}
                          >
                            {" "}
                            {obs.status}{" "}
                          </span>{" "}
                          <div>
                            {" "}
                            <p className="font-medium text-xs">
                              {obs.area}
                            </p>{" "}
                            <p className="text-[10px] text-muted-foreground">
                              {obs.detail}
                            </p>{" "}
                          </div>{" "}
                        </div>
                      ),
                    )}{" "}
                  </div>{" "}
                </div>
              )}{" "}
              {}{" "}
              <div className="p-3 bg-muted/50 rounded-lg border text-[10px] text-muted-foreground italic">
                {" "}
                {report.disclaimer}{" "}
              </div>{" "}
            </div>
          )}{" "}
        </ScrollArea>{" "}
      </CardContent>{" "}
    </Card>
  );
};
