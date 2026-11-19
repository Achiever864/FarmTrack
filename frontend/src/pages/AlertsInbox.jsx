import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.jsx";
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const SEVERITY = {
  critical: {
    badge: "bg-rose-100 text-rose-800",
    card: "border-rose-200 hover:border-rose-300",
    icon: AlertOctagon,
  },
  warning: {
    badge: "bg-amber-100 text-amber-800",
    card: "border-slate-200 hover:border-slate-300",
    icon: AlertTriangle,
  },
  info: {
    badge: "bg-blue-100 text-blue-800",
    card: "border-slate-200 hover:border-slate-300",
    icon: Info,
  },
};

export function AlertsInbox() {
  const { id } = useParams();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("active"); // "active" | "resolved"

  async function loadAlerts() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.orgs.getAlerts(id, { status: statusFilter });
      setAlerts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, [id, statusFilter]);

  async function handleAcknowledge(alertId) {
    try {
      await api.orgs.acknowledgeAlert(alertId, "acknowledge");
      loadAlerts();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  }

  async function handleResolve(alertId) {
    try {
      await api.orgs.acknowledgeAlert(alertId, "resolve");
      loadAlerts();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 page-enter">
      <PageHeader
        eyebrow="Alerts & Early Warnings"
        icon={Bell}
        title="Organization Risk Inbox"
        subtitle="Deduplicated anomaly alerts for chlorophyll stress, moisture deficits, and canopy decline"
        actions={
          <>
            <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-white text-xs shadow-xs">
              {["active", "resolved"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-lg font-semibold capitalize transition ${
                    statusFilter === s ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={loadAlerts}
              aria-label="Refresh alerts"
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </>
        }
      />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-forest-600 mb-2" />
            <p className="text-sm">Loading organization alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {statusFilter === "active" ? "All clear" : "Nothing resolved yet"}
            </h3>
            <p className="text-sm text-slate-500">
              No {statusFilter} alerts found.{" "}
              {statusFilter === "active" && "The portfolio is currently operating normally."}
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const sev = SEVERITY[alert.severity] || SEVERITY.warning;
            const SevIcon = sev.icon;

            return (
              <div
                key={alert._id}
                className={`bg-white p-4 sm:p-5 rounded-2xl border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${sev.card}`}
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${sev.badge}`}
                    >
                      <SevIcon className="w-3.5 h-3.5" />
                      {alert.type}
                    </span>

                    <span className="text-xs text-slate-400 tabular">
                      Observed {new Date(alert.observedAt).toLocaleDateString()}
                    </span>

                    {alert.acknowledgedBy && (
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                        Acknowledged by {alert.acknowledgedBy.name}
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-slate-900 text-sm">
                    <Link
                      to={`/farms/${alert.farmId?._id}`}
                      className="hover:text-forest-600 transition underline underline-offset-2 decoration-slate-300"
                    >
                      {alert.farmId?.name || "Farm Plot"}
                    </Link>
                    <span className="font-normal text-slate-500 text-xs ml-2">
                      ({(alert.farmId?.cropType || "").replace("_", " ")} &bull; {alert.farmId?.areaHa} ha)
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
                </div>

                {statusFilter === "active" && (
                  <div className="flex items-center gap-2 shrink-0">
                    {!alert.acknowledgedBy && (
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(alert._id)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleResolve(alert._id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}