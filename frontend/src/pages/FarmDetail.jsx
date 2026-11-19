import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { HealthBadge } from "../components/HealthBadge.jsx";
import { FarmMap } from "../components/FarmMap.jsx";
import { TimeseriesChart } from "../components/TimeseriesChart.jsx";
import { FormattedAiMessage } from "../components/FormattedAiMessage.jsx";
import {
  ArrowLeft,
  MapPin,
  TreePine,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Bot,
  Loader2,
  Send,
  User,
  Tag,
  Layers,
} from "lucide-react";

const RING_COLORS = {
  healthy: "#16a34a",
  watch: "#d97706",
  at_risk: "#dc2626",
};

const CONFIDENCE_STYLES = {
  high: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

const QUICK_QUESTIONS = [
  "What should I do on this farm in the next 7 days?",
  "Is my farm at risk from the dry season?",
  "Why did my health score change?",
];

function ScoreRing({ score, status }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const pct = score != null ? Math.max(0, Math.min(100, score)) : 0;
  const color = RING_COLORS[status] || "#94a3b8";

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (pct / 100) * circumference}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-extrabold text-slate-900 tabular leading-none">
          {score != null ? score : "—"}
        </span>
        <span className="text-[10px] font-semibold text-slate-400 mt-1">out of 100</span>
      </div>
    </div>
  );
}

function CardHeader({ title, icon: Icon, iconClass = "text-slate-400" }) {
  return (
    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
      <span>{title}</span>
      <Icon className={`w-4 h-4 ${iconClass}`} />
    </div>
  );
}

export function FarmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [farm, setFarm] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Gemini AI Advisory states
  const [aiAdvisory, setAiAdvisory] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiQuery, setAiQuery] = useState("");

  async function generateAiAdvisory(customQuery = "") {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await api.ai.getFarmAdvisory(id, customQuery);
      setAiAdvisory(res.advisory);
      setAiQuery("");
    } catch (err) {
      setAiError(err.message || "Failed to generate AI advisory");
    } finally {
      setAiLoading(false);
    }
  }

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
      <div className="py-28 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-forest-600 mb-3" />
        <p className="text-sm">Retrieving farm geometry and satellite index history...</p>
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white rounded-2xl border border-rose-200 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Error loading farm</h2>
          <p className="text-sm text-slate-500">{error || "Farm not found"}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-2 px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-sm font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const health = analysis?.health || farm.latestHealth || {};
  const phenology = analysis?.phenology;
  const alerts = analysis?.alerts || [];
  const status = health.status || "insufficient_data";
  const syncing = farm.backfillStatus === "pending" || farm.backfillStatus === "running";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 page-enter">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 break-words">
                {farm.name}
              </h1>
              <HealthBadge status={status} backfillStatus={farm.backfillStatus} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-2">
              <span className="inline-flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                {farm.cropType.replace("_", " ").toUpperCase()} &bull; {farm.areaHa} ha
              </span>
              {farm.farmerName && (
                <span className="inline-flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {farm.farmerName}
                </span>
              )}
              {farm.tags?.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {farm.tags.join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadData}
            title="Refresh satellite data"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs text-sm font-medium transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            title="Delete farm"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{deleting ? "Deleting..." : "Delete"}</span>
          </button>
        </div>
      </div>

      {/* Backfill in progress banner */}
      {syncing && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Satellite backfill in progress.</strong> We are querying the Sentinel-2 L2A archive for the past
            1.5 years across this farm polygon. This page updates automatically.
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {/* Health Score Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <CardHeader title="Canopy Health Score" icon={ShieldCheck} />

          <div className="flex items-center gap-5">
            <ScoreRing score={health.score} status={status} />
            <div className="space-y-2.5 min-w-0">
              <HealthBadge status={status} backfillStatus={farm.backfillStatus} size="sm" />
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Confidence</span>
                <span
                  className={`capitalize font-semibold px-2 py-0.5 rounded-md border ${
                    CONFIDENCE_STYLES[health.confidence] || CONFIDENCE_STYLES.low
                  }`}
                >
                  {health.confidence || "Low"}
                </span>
              </div>
            </div>
          </div>

          {health.reasons && health.reasons.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Analysis findings
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                {health.reasons.map((r, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest-500 shrink-0 mt-1.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Growth & Phenology Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <CardHeader title="Growth & Phenology" icon={TreePine} iconClass="text-forest-600" />

          <div>
            <div className="font-display text-lg font-bold text-slate-900">
              {phenology?.maturityLabel || "Mature Productive Cocoa"}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {phenology?.treeAgeYears != null
                ? `Tree age: ~${phenology.treeAgeYears} years`
                : "Estimated from ground profile"}
            </div>
          </div>

          {phenology?.currentSeason && (
            <div className="bg-forest-50 p-3.5 rounded-xl border border-forest-100 space-y-1">
              <div className="text-[11px] font-semibold text-forest-700 uppercase tracking-wider">
                Current season
              </div>
              <div className="text-sm font-semibold text-forest-900">{phenology.currentSeason.name}</div>
              <div className="text-xs text-forest-800/80 leading-relaxed">
                {phenology.currentSeason.description}
              </div>
            </div>
          )}

          {phenology?.trend && (
            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3">
              <span className="text-xs text-slate-500">Recent trend</span>
              <span className="flex items-center gap-1.5 text-sm font-semibold capitalize text-slate-800">
                {phenology.trend.direction === "rising" && <TrendingUp className="w-4 h-4 text-emerald-600" />}
                {phenology.trend.direction === "declining" && <TrendingDown className="w-4 h-4 text-rose-600" />}
                {phenology.trend.direction === "stable" && <Minus className="w-4 h-4 text-slate-400" />}
                {phenology.trend.direction}
                <span className="text-xs font-medium text-slate-400 tabular">(Δ {phenology.trend.delta})</span>
              </span>
            </div>
          )}
        </div>

        {/* Alerts Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-4 md:col-span-2 xl:col-span-1">
          <CardHeader title={`Active Alerts (${alerts.length})`} icon={AlertTriangle} iconClass="text-amber-500" />

          {alerts.length === 0 ? (
            <div className="flex items-start gap-2.5 text-xs text-emerald-700 bg-emerald-50 p-3.5 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                No abnormal stress, moisture deficit, or decline signals detected.
              </span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`p-3 rounded-xl text-xs border ${
                    alert.severity === "critical"
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : alert.severity === "info"
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  <div className="font-bold uppercase tracking-wider text-[10px]">
                    {alert.type} &bull; {alert.severity}
                  </div>
                  <div className="mt-1 leading-relaxed">{alert.message}</div>
                </div>
              ))}
            </div>
          )}

          <div className="text-[11px] text-slate-400 leading-relaxed">
            Satellite signals highlight anomalies so you can target ground scout visits.
          </div>
        </div>
      </div>

      {/* Map & NDVI Overlay */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-forest-600" />
          <h2 className="font-display text-base font-bold text-slate-900">Farm Boundary & Satellite Overlay</h2>
        </div>
        <FarmMap farm={farm} healthStatus={status === "insufficient_data" && !health.status ? "healthy" : status} />
      </section>

      {/* Time-Series Vegetation History Chart */}
      <section>
        <TimeseriesChart observations={timeseries} />
      </section>

      {/* FarmTrack AI Diagnostic Advisory Card */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-forest-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-forest-500/40 shadow-card-hover space-y-5">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-forest-600/30 border border-forest-500/40 flex items-center justify-center shadow-inner shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">FarmTrack AI Agronomic Advisory</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Gemini 3.5
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Satellite telemetry synthesis & localized West African crop recommendations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => generateAiAdvisory()}
            disabled={aiLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-500 hover:bg-forest-400 disabled:opacity-40 text-forest-950 font-bold text-xs shadow-md transition shrink-0"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{aiAdvisory ? "Regenerate Advisory" : "Generate AI Health Report"}</span>
          </button>
        </div>

        {/* AI Error Alert */}
        {aiError && (
          <div
            role="alert"
            className="relative p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300"
          >
            ⚠️ {aiError}
          </div>
        )}

        {/* Loading Indicator */}
        {aiLoading && (
          <div className="relative py-10 text-center space-y-3 text-slate-300">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
            <p className="text-xs font-medium max-w-sm mx-auto leading-relaxed">
              Google Gemini is analyzing this farm's Sentinel-2 NDVI, NDRE, NDMI indices and seasonal calendar...
            </p>
          </div>
        )}

        {/* Advisory Output */}
        {!aiLoading && aiAdvisory && (
          <div className="relative space-y-4">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 text-xs sm:text-sm text-slate-200 leading-relaxed max-h-[600px] overflow-y-auto shadow-inner">
              <FormattedAiMessage content={aiAdvisory} isDark={true} />
            </div>

            {/* Follow-up question */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (aiQuery.trim()) generateAiAdvisory(aiQuery.trim());
              }}
              className="flex flex-col sm:flex-row items-stretch gap-2"
            >
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask a specific follow-up question about this plot..."
                disabled={aiLoading}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-forest-500/50 focus:border-forest-500 transition"
              />
              <button
                type="submit"
                disabled={!aiQuery.trim() || aiLoading}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-forest-600 hover:bg-forest-500 disabled:opacity-40 text-white font-semibold text-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </form>
          </div>
        )}

        {/* Empty State */}
        {!aiLoading && !aiAdvisory && (
          <div className="relative space-y-4">
            <div className="p-4 sm:p-5 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3 text-xs sm:text-sm text-slate-300">
              <Bot className="w-6 h-6 text-emerald-400 shrink-0" />
              <span className="leading-relaxed">
                Click <strong className="text-white">"Generate AI Health Report"</strong> for an immediate agronomic
                evaluation of canopy chlorophyll, moisture deficits, and a tailored 14-day field schedule. Or start with
                a quick question:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => generateAiAdvisory(q)}
                  className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}