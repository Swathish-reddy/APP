import React from "react";
import { cn } from "@/lib/utils";
interface RiskBadgeProps {
  score: number;
  className?: string;
};
export default function RiskBadge({ score, className }: RiskBadgeProps) {
  let riskLevel = "Critical Risk";
  let colorClass = "bg-red-500/10 text-red-500 border-red-500/20";
  let dotClass = "bg-red-500";
  if (score >= 90) {
    riskLevel = "Low Risk";
    colorClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    dotClass = "bg-emerald-500";
  } else if (score >= 70) {
    riskLevel = "Moderate Risk";
    colorClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    dotClass = "bg-amber-500";
  } else if (score >= 50) {
    riskLevel = "High Risk";
    colorClass = "bg-orange-500/10 text-orange-500 border-orange-500/20";
    dotClass = "bg-orange-500";
  }
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium tracking-wide shadow-sm",
        colorClass,
        className,
      )}
    >
      {" "}
      <span
        className={cn("h-1.5 w-1.5 rounded-full animate-pulse", dotClass)}
      />{" "}
      {riskLevel}{" "}
    </div>
  );
}
