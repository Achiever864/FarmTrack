import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { HealthBadge } from "../components/HealthBadge.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import {
  Building2,
  Users,
  AlertTriangle,
  UploadCloud,
  FileSpreadsheet,
  ArrowUpRight,
  RefreshCw,
  ShieldAlert,
  Layers,
  CheckCircle2,
  AlertOctagon,
  AlertCircle,
} from "lucide-react";

function KpiCard({ label, value, hint, icon: Icon, tone }) {
  const tones = {
    slate: { icon: "bg-slate-100 text-slate-600", value: "text-slate-900", label: "text-slate-500" },
    emerald: { icon: "bg-emerald-50 text-emerald-600", value: "text-emerald-600", label: "text-emerald-700" },
    amber: { icon: "bg-amber-50 text-amber-600", value: "text-amber-600", label: "text-amber-700" },
    rose: { icon: "bg-rose-50 text-rose-600", value: "text-rose-600", label: "text-rose-700" },
  }[tone];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`text-xs font-semibold uppercase tracking-wider ${tones.label}`}>{label}</div>
          <div className={`font-display text-3xl font-extrabold mt-2 tabular ${tones.value}`}>{value}</div>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tones.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-xs text-slate-500 mt-2">{hint}</div>
    </div>
  );
}

export function OrganizationDashboard() {
  const { id } = useParams();
  const { activeOrg } = useAuth();

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadPortfolio() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.orgs.getPortfolio(id);
      setPortfolio(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPortfolio();
  }, [id]);

  async function handleExportCsv() {
    try {
      const blob = await api.orgs.exportCsv(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-${id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  }

  const canEdit = ["owner", "admin", "manager"].includes(activeOrg?.userRole);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white rounded-2xl border border-slate-200" />
          <div className="h-80 bg-white rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white rounded-2xl border border-rose-200 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Error loading organization portfolio</h2>
          <p className="text-sm text-slate-500">{error || "Access denied or organization not found"}</p>
          <button
            type="button"
            onClick={loadPortfolio}
            className="inline-flex items-center gap-2 mt-2 px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-sm font-semibold transition"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { totalFarms, totalAreaHa, healthDistribution, attentionList, recentAlerts } = portfolio;

  const dist = [
    { key: "healthy", label: "Healthy", color: "bg-emerald-500", count: healthDistribution.healthy || 0 },
    { key: "watch", label: "Watch", color: "bg-amber-500", count: healthDistribution.watch || 0 },
    { key: "at_risk", label: "At Risk", color: "bg-rose-500", count: healthDistribution.at_risk || 0 },
    {
      key: "insufficient_data",
      label: "No data",
      color: "bg-slate-300",
      count: healthDistribution.insufficient_data || 0,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 page-enter">
      <PageHeader
        eyebrow="Organization Portfolio"
        icon={Building2}
        title={activeOrg?.name || "Organization Dashboard"}
        subtitle="Aggregated crop health, hectare tracking, and risk alerts across member smallholdings"
        actions={
          <>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export CSV
            </button>
            {canEdit && (
              <Link
                to={`/org/${id}/import`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-sm font-semibold shadow-sm transition"
              >
                <UploadCloud className="w-4 h-4" />
                Bulk Import
              </Link>
            )}
          </>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="Farms Monitored"
          value={totalFarms}
          hint={`${totalAreaHa} total hectares registered`}
          icon={Layers}
          tone="slate"
        />
        <KpiCard
          label="Healthy Canopy"
          value={healthDistribution.healthy || 0}
          hint={
            totalFarms > 0
              ? `${Math.round(((healthDistribution.healthy || 0) / totalFarms) * 100)}% of portfolio`
              : "0%"
          }
          icon={CheckCircle2}
          tone="emerald"
        />
        <KpiCard
          label="Under Watch"
          value={healthDistribution.watch || 0}
          hint="Mild vegetation or moisture deficit"
          icon={AlertTriangle}
          tone="amber"
        />
        <KpiCard
          label="At Risk (Inspect)"
          value={healthDistribution.at_risk || 0}
          hint="Flagged for ground scout inspection"
          icon={AlertOctagon}
          tone="rose"
        />
      </div>

      {/* Health distribution bar */}
      {totalFarms > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-slate-900 text-sm">Portfolio health distribution</h2>
            <span className="text-xs text-slate-400 tabular">{totalFarms} farms</span>
          </div>
          <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100">
            {dist
              .filter((d) => d.count > 0)
              .map((d) => (
                <div
                  key={d.key}
                  className={`${d.color} transition-all`}
                  style={{ width: `${(d.count / totalFarms) * 100}%` }}
                  title={`${d.label}: ${d.count}`}
                />
              ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {dist.map((d) => (
              <div key={d.key} className="flex items-center gap-2 text-xs text-slate-600">
                <span className={`w-2.5 h-2.5 rounded-full ${d.color}`} />
                {d.label} <strong className="text-slate-900 tabular">{d.count}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attention list + recent alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-2">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <h2 className="font-display font-bold text-slate-900 text-base truncate">
                Farms Needing Attention ({attentionList.length})
              </h2>
            </div>
            <Link
              to={`/org/${id}/farms`}
              className="text-xs font-semibold text-forest-600 hover:text-forest-700 inline-flex items-center gap-0.5 shrink-0"
            >
              Full portfolio <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {attentionList.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-500">
                All member farms are performing within healthy seasonal thresholds.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {attentionList.map((f) => (
                <Link
                  key={f._id}
                  to={`/farms/${f._id}`}
                  className="group py-3.5 -mx-2 px-2 rounded-xl flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="font-bold text-sm text-slate-900 group-hover:text-forest-700 transition truncate">
                      {f.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{f.areaHa} ha</span>
                      {f.farmerName && <span className="truncate">&bull; {f.farmerName}</span>}
                    </div>
                    {f.reasons?.length > 0 && (
                      <p className="text-xs text-slate-600 line-clamp-1">{f.reasons[0]}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <div className="font-display text-base font-extrabold text-slate-900 tabular">
                      {f.score != null ? f.score : "—"}
                      {f.score != null && <span className="text-[11px] text-slate-400 font-semibold">/100</span>}
                    </div>
                    <HealthBadge status={f.status} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-3">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-display font-bold text-slate-900 text-base">Recent Risk Alerts</h2>
            </div>
            <Link to={`/org/${id}/alerts`} className="text-xs font-semibold text-forest-600 hover:text-forest-700">
              Inbox
            </Link>
          </div>

          {recentAlerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No unresolved alerts in this organization.</div>
          ) : (
            <div className="space-y-2.5 max-h-[28rem] overflow-y-auto pr-1">
              {recentAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    alert.severity === "critical"
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : alert.severity === "info"
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold uppercase tracking-wider text-[10px]">
                    <span>{alert.type}</span>
                    <span className="tabular font-semibold opacity-80">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900">{alert.farmId?.name || "Farm Plot"}</div>
                  <div className="text-slate-600 text-[11px] leading-relaxed">{alert.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}