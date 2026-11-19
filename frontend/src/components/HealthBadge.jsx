import React from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, RefreshCw } from "lucide-react";

export function HealthBadge({ status, backfillStatus, size = "md" }) {
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-[11px] gap-1" : "px-2.5 py-1 text-xs gap-1.5";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  if (backfillStatus === "running" || backfillStatus === "pending") {
    return (
      <span
        className={`inline-flex items-center whitespace-nowrap rounded-full font-semibold border bg-blue-50 text-blue-700 border-blue-200 ${sizeClasses}`}
      >
        <RefreshCw className={`${iconSize} animate-spin`} />
        Syncing Satellite...
      </span>
    );
  }

  const configs = {
    healthy: {
      label: "Healthy",
      style: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },
    watch: {
      label: "Watch",
      style: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertTriangle,
    },
    at_risk: {
      label: "At Risk",
      style: "bg-rose-50 text-rose-700 border-rose-200",
      icon: AlertOctagon,
    },
    insufficient_data: {
      label: "Insufficient Data",
      style: "bg-slate-100 text-slate-600 border-slate-200",
      icon: HelpCircle,
    },
  };

  const config = configs[status] || configs.insufficient_data;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full font-semibold border ${config.style} ${sizeClasses}`}
    >
      <Icon className={iconSize} />
      {config.label}
    </span>
  );
}