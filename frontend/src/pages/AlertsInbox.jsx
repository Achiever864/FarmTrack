import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client.js";
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  RefreshCw,
  Filter,
} from "lucide-react";

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>Alerts & Early Warnings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Organization Risk Inbox
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Deduplicated anomaly alerts for chlorophyll stress, moisture deficits, and canopy decline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                statusFilter === "active"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("resolved")}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                statusFilter === "resolved"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Resolved
            </button>
          </div>

          <button
            type="button"
            onClick={loadAlerts}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-forest-600 mb-2" />
            Loading organization alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500 text-sm">
            No {statusFilter} alerts found. The portfolio is currently operating normally!
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                alert.severity === "critical"
                  ? "border-rose-200 hover:border-rose-300"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      alert.severity === "critical"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {alert.severity === "critical" ? (
                      <AlertOctagon className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    {alert.type}
                  </span>

                  <span className="text-xs text-slate-400">
                    Observed: {new Date(alert.observedAt).toLocaleDateString()}
                  </span>

                  {alert.acknowledgedBy && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                      Acknowledged by {alert.acknowledgedBy.name}
                    </span>
                  )}
                </div>

                <div className="font-bold text-slate-900 text-sm">
                  <Link
                    to={`/farms/${alert.farmId?._id}`}
                    className="hover:text-forest-600 transition underline underline-offset-2"
                  >
                    {alert.farmId?.name || "Farm Plot"}
                  </Link>
                  <span className="font-normal text-slate-500 text-xs ml-2">
                    ({alert.farmId?.cropType} &bull; {alert.farmId?.areaHa} ha)
                  </span>
                </div>

                <p className="text-xs text-slate-600">{alert.message}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {statusFilter === "active" && (
                  <>
                    {!alert.acknowledgedBy && (
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(alert._id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleResolve(alert._id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition inline-flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Resolved
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
