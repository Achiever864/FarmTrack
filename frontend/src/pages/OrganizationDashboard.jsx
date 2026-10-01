import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { HealthBadge } from "../components/HealthBadge.jsx";
import {
  Building2,
  Sprout,
  Users,
  AlertTriangle,
  UploadCloud,
  FileSpreadsheet,
  ArrowUpRight,
  RefreshCw,
  MapPin,
  ShieldAlert,
} from "lucide-react";

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

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-forest-600 mb-3" />
        <p className="text-sm">Calculating portfolio aggregates and distribution...</p>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 text-rose-700">
          <h2 className="text-lg font-bold">Error loading organization portfolio</h2>
          <p className="text-sm mt-1">{error || "Access denied or organization not found"}</p>
        </div>
      </div>
    );
  }

  const { totalFarms, totalAreaHa, healthDistribution, attentionList, mapFarms, recentAlerts } =
    portfolio;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Portfolio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Organization Portfolio</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {activeOrg?.name || "Organization Dashboard"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Aggregated crop health, hectare tracking, and risk alerts across member smallholdings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export CSV
          </button>

          <Link
            to={`/org/${id}/import`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium shadow-sm transition"
          >
            <UploadCloud className="w-4 h-4" />
            Bulk Import
          </Link>
        </div>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Farms Monitored
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{totalFarms}</div>
          <div className="text-xs text-slate-500 mt-1">{totalAreaHa} total hectares registered</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Healthy Canopy
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {healthDistribution.healthy || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalFarms > 0
              ? `${Math.round(((healthDistribution.healthy || 0) / totalFarms) * 100)}% of portfolio`
              : "0%"}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Under Watch
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">
            {healthDistribution.watch || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Mild vegetation or moisture deficit</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs">
          <div className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
            At Risk (Inspect)
          </div>
          <div className="text-3xl font-extrabold text-rose-600 mt-2">
            {healthDistribution.at_risk || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Flagged for ground scout inspection</div>
        </div>
      </div>

      {/* Main Section: High Risk Farms Needing Inspection & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Attention List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h2 className="font-bold text-slate-900 text-base">
                Farms Needing Attention ({attentionList.length})
              </h2>
            </div>
            <Link
              to={`/org/${id}/farms`}
              className="text-xs font-semibold text-forest-600 hover:text-forest-700 inline-flex items-center gap-0.5"
            >
              View Full Portfolio <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {attentionList.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              All member farms are currently performing within expected healthy seasonal thresholds!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {attentionList.map((f) => (
                <div key={f._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Link
                      to={`/farms/${f._id}`}
                      className="font-bold text-sm text-slate-900 hover:text-forest-600 transition"
                    >
                      {f.name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{f.areaHa} ha</span>
                      {f.farmerName && <span>&bull; Farmer: {f.farmerName}</span>}
                    </div>
                    {f.reasons?.length > 0 && (
                      <p className="text-xs text-slate-600 line-clamp-1">{f.reasons[0]}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-slate-900">
                      {f.score != null ? `${f.score}/100` : "—"}
                    </div>
                    <div className="mt-1">
                      <HealthBadge status={f.status} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Alerts Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-base">Recent Risk Alerts</h2>
            </div>
            <Link
              to={`/org/${id}/alerts`}
              className="text-xs font-semibold text-forest-600 hover:text-forest-700"
            >
              Inbox
            </Link>
          </div>

          {recentAlerts.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No unresolved alerts in this organization.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    alert.severity === "critical"
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold uppercase tracking-wider text-[10px]">
                    <span>{alert.type}</span>
                    <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="font-medium text-slate-900">
                    {alert.farmId?.name || "Farm Plot"}
                  </div>
                  <div className="text-slate-600 text-[11px]">{alert.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
