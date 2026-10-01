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
  Layers,
  Search,
  Filter,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Individual Mode &bull; Satellite health tracking and phenology for your personal cocoa plots
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchFarms}
            title="Refresh farm status"
            className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            to="/farms/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-medium text-sm shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            Register Farm
          </Link>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Monitored Plots
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{farms.length}</div>
          <div className="text-xs text-slate-500 mt-1">{totalAreaHa} hectares under satellite view</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Healthy Canopy
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{healthyCount}</div>
          <div className="text-xs text-slate-500 mt-1">Normal seasonal density and vigor</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-xs">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Under Watch
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">{watchCount}</div>
          <div className="text-xs text-slate-500 mt-1">Mild moisture or chlorophyll drop</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-xs">
          <div className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
            Attention Needed
          </div>
          <div className="text-3xl font-extrabold text-rose-600 mt-2">{atRiskCount}</div>
          <div className="text-xs text-slate-500 mt-1">Severe decline vs own history or peers</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search farm name or region..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
          >
            <option value="">All Health Statuses</option>
            <option value="healthy">Healthy</option>
            <option value="watch">Watch</option>
            <option value="at_risk">At Risk</option>
            <option value="insufficient_data">Insufficient Data</option>
          </select>
        </div>
      </div>

      {/* Farm Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-forest-600 mb-3" />
          <p className="text-sm">Loading farms and satellite observations...</p>
        </div>
      ) : farms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-forest-50 text-forest-600 flex items-center justify-center mx-auto">
            <Sprout className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No farms registered yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              Draw the boundary of your cocoa plot on the map to begin automated 5-day satellite monitoring.
            </p>
          </div>
          <Link
            to="/farms/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-medium text-sm shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            Draw & Register Farm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {farms.map((farm) => {
            const status = farm.latestHealth?.status || "insufficient_data";
            const score = farm.latestHealth?.score;

            return (
              <Link
                key={farm._id}
                to={`/farms/${farm._id}`}
                className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-forest-200 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-forest-600 transition text-base line-clamp-1">
                        {farm.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{farm.cropType.toUpperCase()} &bull; {farm.areaHa} ha</span>
                      </div>
                    </div>
                    <HealthBadge status={status} backfillStatus={farm.backfillStatus} size="sm" />
                  </div>

                  {/* Health summary */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-slate-500">Canopy Health Score:</span>
                      <span className="font-bold text-slate-900">
                        {score != null ? `${score}/100` : "Pending Analysis"}
                      </span>
                    </div>

                    {farm.latestHealth?.reasons?.length > 0 && (
                      <p className="text-slate-600 text-[11px] line-clamp-2">
                        {farm.latestHealth.reasons[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
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
