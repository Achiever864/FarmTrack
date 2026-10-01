import React from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, RefreshCw } from "lucide-react";

export function HealthBadge({ status, backfillStatus, size = "md" }) {
  if (backfillStatus === "running" || backfillStatus === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <RefreshCw className="w-3 h-3 animate-spin" />
        Syncing Satellite...
      </span>
    );
  }

  const configs = {
    healthy: {
      label: "Healthy",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },
    watch: {
      label: "Watch",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertTriangle,
    },
    at_risk: {
      label: "At Risk",
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      icon: AlertOctagon,
    },
    insufficient_data: {
      label: "Insufficient Data",
      bg: "bg-slate-100 text-slate-600 border-slate-200",
      icon: HelpCircle,
    },
  };

  const config = configs[status] || configs.insufficient_data;
  const Icon = config.icon;

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
