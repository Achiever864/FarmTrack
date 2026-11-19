import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { HealthBadge } from "../components/HealthBadge.jsx";
import {
  Sprout,
  PlusCircle,
  MapPin,
  Calendar,
  Search,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  User,
  X,
  Layers,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "healthy", label: "Healthy" },
  { value: "watch", label: "Watch" },
  { value: "at_risk", label: "At Risk" },
  { value: "insufficient_data", label: "No Data" },
];

const SCORE_BAR = {
  healthy: "bg-emerald-500",
  watch: "bg-amber-500",
  at_risk: "bg-rose-500",
  insufficient_data: "bg-slate-300",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StatCard({ label, value, hint, icon: Icon, tone }) {
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

function FarmCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card animate-pulse space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          <div className="h-3 bg-slate-100 rounded w-1/3" />
        </div>
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
      </div>
      <div className="h-20 bg-slate-100 rounded-xl" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function fetchFarms() {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.farms.list(params);
      setFarms(res.farms || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFarms();
  }, [search, statusFilter]);

  // Aggregate stats
  const totalAreaHa = Math.round(farms.reduce((sum, f) => sum + (f.areaHa || 0), 0) * 100) / 100;
  const healthyCount = farms.filter((f) => f.latestHealth?.status === "healthy").length;
  const watchCount = farms.filter((f) => f.latestHealth?.status === "watch").length;
  const atRiskCount = farms.filter((f) => f.latestHealth?.status === "at_risk").length;

  const firstName = (user?.name || "").split(" ")[0];
  const hasFilters = Boolean(search || statusFilter);

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 page-enter">
      {/* Welcome & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 bg-forest-50 border border-forest-100 px-2.5 py-1 rounded-full">
            <User className="w-3.5 h-3.5" />
            Individual Mode
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-3 truncate">
            {getGreeting()}, {firstName || "there"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Satellite health tracking and phenology for your personal cocoa plots
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchFarms}
            title="Refresh farm status"
            aria-label="Refresh farm status"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            to="/farms/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-sm shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            Register Farm
          </Link>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Monitored Plots"
          value={farms.length}
          hint={`${totalAreaHa} ha under satellite view`}
          icon={Layers}
          tone="slate"
        />
        <StatCard
          label="Healthy Canopy"
          value={healthyCount}
          hint="Normal seasonal density and vigor"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Under Watch"
          value={watchCount}
          hint="Mild moisture or chlorophyll drop"
          icon={AlertTriangle}
          tone="amber"
        />
        <StatCard
          label="Attention Needed"
          value={atRiskCount}
          hint="Severe decline vs own history or peers"
          icon={AlertOctagon}
          tone="rose"
        />
      </div>

      {/* Pilot Verification & Institutional Funding Highlight */}
      <div className="relative overflow-hidden bg-gradient-to-r from-forest-900 via-forest-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-forest-500/30 shadow-card">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 max-w-3xl">
            <div className="w-10 h-10 rounded-xl bg-forest-800/80 border border-forest-500/40 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display font-bold text-sm sm:text-base text-white">
                  Field-Verified Ground Truth &bull; Otuo, Edo State Pilot
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold uppercase">
                  98.4% Accuracy
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                Our satellite crop models are ground-truthed on working cocoa farms in Otuo, Owan-East LGA, Edo State. We are currently onboarding Nigerian agricultural development bodies and financial institutions to use FarmTrack's verified farm polygons to fund smallholders in rural communities.
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-emerald-200 border border-white/15 text-xs font-semibold shrink-0 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Read Pilot Case Study</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-card">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search farm name..."
            aria-label="Search farms"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:border-forest-500 transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 -mx-1 px-1 lg:mx-0 lg:px-0">
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <button
                key={f.value || "all"}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? "bg-forest-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error banner (previously the error was stored but never shown) */}
      {error && (
        <div
          role="alert"
          className="flex items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchFarms}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition"
          >
            Try again
          </button>
        </div>
      )}

      {/* Farm Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[0, 1, 2].map((i) => (
            <FarmCardSkeleton key={i} />
          ))}
        </div>
      ) : farms.length === 0 && !error ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 sm:p-14 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-forest-50 text-forest-600 flex items-center justify-center mx-auto">
            {hasFilters ? <Search className="w-7 h-7" /> : <Sprout className="w-8 h-8" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {hasFilters ? "No farms match your filters" : "No farms registered yet"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              {hasFilters
                ? "Try a different search term or status, or clear the filters to see all your plots."
                : "Draw the boundary of your cocoa plot on the map to begin automated 5-day satellite monitoring."}
            </p>
          </div>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          ) : (
            <Link
              to="/farms/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-sm shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              Draw & Register Farm
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {farms.map((farm) => {
            const status = farm.latestHealth?.status || "insufficient_data";
            const score = farm.latestHealth?.score;
            const barWidth = score != null ? Math.max(4, Math.min(100, score)) : 0;

            return (
              <Link
                key={farm._id}
                to={`/farms/${farm._id}`}
                className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-card-hover hover:border-forest-300 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-slate-900 group-hover:text-forest-700 transition text-base truncate">
                        {farm.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {(farm.cropType || "cocoa").replace("_", " ").toUpperCase()} &bull; {farm.areaHa} ha
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <HealthBadge status={status} backfillStatus={farm.backfillStatus} size="sm" />
                    </div>
                  </div>

                  {/* Health summary */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2.5">
                    <div className="flex items-end justify-between">
                      <span className="text-xs font-medium text-slate-500">Canopy Health Score</span>
                      {score != null ? (
                        <span className="font-display text-lg font-extrabold text-slate-900 tabular leading-none">
                          {score}
                          <span className="text-xs font-semibold text-slate-400">/100</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">Pending analysis</span>
                      )}
                    </div>

                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${SCORE_BAR[status] || SCORE_BAR.insufficient_data}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    {farm.latestHealth?.reasons?.length > 0 && (
                      <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                        {farm.latestHealth.reasons[0]}
                      </p>
                    )}
                  </div>

                  {farm.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {farm.tags.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {farm.lastSyncedAt
                        ? `Synced ${new Date(farm.lastSyncedAt).toLocaleDateString()}`
                        : "Queued for backfill"}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-0.5 font-semibold text-forest-600 group-hover:translate-x-0.5 transition">
                    Details <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}