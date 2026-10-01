import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { HealthBadge } from "../components/HealthBadge.jsx";
import { FarmMap } from "../components/FarmMap.jsx";
import { TimeseriesChart } from "../components/TimeseriesChart.jsx";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  TreePine,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Info,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

export function FarmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [farm, setFarm] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [farmData, tsData, analysisData] = await Promise.all([
        api.farms.getById(id),
        api.farms.getTimeseries(id),
        api.farms.getAnalysis(id),
      ]);
      setFarm(farmData);
      setTimeseries(tsData || []);
      setAnalysis(analysisData || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // Poll backfill status every 6 seconds if pending or running
    const interval = setInterval(() => {
      if (farm?.backfillStatus === "pending" || farm?.backfillStatus === "running") {
        loadData();
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [id, farm?.backfillStatus]);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this farm and all its satellite observations?")) {
      return;
    }
    setDeleting(true);
    try {
      await api.farms.delete(id);
      navigate("/");
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
      setDeleting(false);
    }
  }

  if (loading && !farm) {
    return (
      <div className="py-24 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-forest-600 mb-3" />
        <p className="text-sm">Retrieving farm geometry and satellite index history...</p>
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 text-rose-700">
          <h2 className="text-lg font-bold">Error loading farm</h2>
          <p className="text-sm mt-1">{error || "Farm not found"}</p>
          <Link to="/" className="mt-4 inline-block font-semibold underline text-sm">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const health = analysis?.health || farm.latestHealth || {};
  const phenology = analysis?.phenology;
  const alerts = analysis?.alerts || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{farm.name}</h1>
              <HealthBadge
                status={health.status || "insufficient_data"}
                backfillStatus={farm.backfillStatus}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                {farm.cropType.toUpperCase()} &bull; {farm.areaHa} ha
              </span>
              {farm.farmerName && <span>Farmer: {farm.farmerName}</span>}
              {farm.tags?.length > 0 && (
                <span>Tags: {farm.tags.join(", ")}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            title="Refresh satellite data"
            className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            title="Delete farm"
            className="p-2.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Backfill in progress banner */}
      {(farm.backfillStatus === "pending" || farm.backfillStatus === "running") && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
          <div>
            <strong>Satellite Backfill in Progress:</strong> We are querying the Sentinel-2 L2A archive for the past 1.5 years across this farm polygon. Refresh in a few moments to view updated charts.
          </div>
        </div>
      )}

      {/* Grid: Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Health Score Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Canopy Health Score</span>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900">
              {health.score != null ? health.score : "—"}
            </span>
            <span className="text-slate-400 text-sm font-medium">/ 100</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Confidence:</span>
            <span className="capitalize font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {health.confidence || "Low"}
            </span>
          </div>

          {health.reasons && health.reasons.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Analysis Findings</div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                {health.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Growth & Phenology Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Growth & Phenology</span>
            <TreePine className="w-4 h-4 text-forest-600" />
          </div>

          <div>
            <div className="text-lg font-bold text-slate-900">
              {phenology?.maturityLabel || "Mature Productive Cocoa"}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {phenology?.treeAgeYears != null
                ? `Tree age: ~${phenology.treeAgeYears} years`
                : "Estimated from ground profile"}
            </div>
          </div>

          {phenology?.currentSeason && (
            <div className="bg-forest-50 p-2.5 rounded-lg border border-forest-100 text-xs space-y-1">
              <div className="font-semibold text-forest-800">
                Current Season: {phenology.currentSeason.name}
              </div>
              <div className="text-forest-700 text-[11px]">
                {phenology.currentSeason.description}
              </div>
            </div>
          )}

          {phenology?.trend && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Recent Trend:</span>
              <span className="flex items-center gap-1 font-semibold capitalize text-slate-800">
                {phenology.trend.direction === "rising" && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                {phenology.trend.direction === "declining" && <TrendingDown className="w-3.5 h-3.5 text-rose-600" />}
                {phenology.trend.direction === "stable" && <Minus className="w-3.5 h-3.5 text-slate-400" />}
                {phenology.trend.direction} (Δ {phenology.trend.delta})
              </span>
            </div>
          )}
        </div>

        {/* Alerts & Advisories Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Active Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>

          {alerts.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>No abnormal stress, moisture deficit, or decline signals detected.</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`p-2.5 rounded-lg text-xs border ${
                    alert.severity === "critical"
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  <div className="font-semibold uppercase tracking-wider text-[10px]">
                    {alert.type} &bull; {alert.severity}
                  </div>
                  <div className="mt-0.5">{alert.message}</div>
                </div>
              ))}
            </div>
          )}

          <div className="text-[11px] text-slate-400 pt-1">
            Satellite signals highlight anomalies for targeted ground scout visits.
          </div>
        </div>
      </div>

      {/* Main Map & NDVI Image Overlay */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Farm Boundary & Satellite Overlay</h2>
        <FarmMap farm={farm} healthStatus={health.status || "healthy"} />
      </div>

      {/* Time-Series Vegetation History Chart */}
      <div className="space-y-2">
        <TimeseriesChart observations={timeseries} />
      </div>
    </div>
  );
}
