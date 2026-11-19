import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function PageHeader({ title, subtitle, eyebrow, icon: Icon, back = false, actions }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        {back && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 uppercase tracking-wider">
              {Icon && <Icon className="w-4 h-4" />}
              <span>{eyebrow}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1 break-words">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-2xl">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}