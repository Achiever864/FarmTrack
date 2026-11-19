import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { HealthBadge } from "../components/HealthBadge.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import {
  Search,
  FileSpreadsheet,
  PlusCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  Sprout,
  ArrowUpRight,
} from "lucide-react";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "healthy", label: "Healthy" },
  { value: "watch", label: "Watch" },
  { value: "at_risk", label: "At Risk" },
  { value: "insufficient_data", label: "No Data" },
];

export function OrganizationFarms() {
  const { id } = useParams();
  const { activeOrg } = useAuth();

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFarms, setTotalFarms] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const canEdit = ["owner", "admin", "manager"].includes(activeOrg?.userRole);
  const hasFilters = Boolean(search || statusFilter || tagFilter);

  async function loadFarms() {
    setLoading(true);
    setError(null);
    try {
      const params = {
        orgId: id,
        page,
        limit: 15,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (tagFilter) params.tag = tagFilter;

      const res = await api.farms.list(params);
      setFarms(res.farms || []);
      setTotalPages(res.totalPages || 1);
      setTotalFarms(res.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFarms();
  }, [id, page, search, statusFilter, tagFilter]);

  async function handleExportCsv() {
    try {
      const blob = await api.orgs.exportCsv(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-farms-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setTagFilter("");
    setPage(1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 page-enter">
      <PageHeader
        title={`Portfolio Farms (${totalFarms})`}
        subtitle="Filter, inspect, and export member farms across your cooperative or program"
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
                to={`/org/${id}/farms/new`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-sm font-semibold shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                Add Farm
              </Link>
            )}
          </>
        }
      />

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-card">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search farm name..."
            aria-label="Search farms"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:border-forest-500 transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
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
                onClick={() => {
                  setStatusFilter(f.value);
                  setPage(1);
                }}
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
            onClick={loadFarms}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card py-20 text-center text-slate-400">
          <RefreshCw className="w-7 h-7 animate-spin mx-auto text-forest-600 mb-2" />
          <p className="text-sm">Loading farms...</p>
        </div>
      ) : farms.length === 0 && !error ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-forest-50 text-forest-600 flex items-center justify-center mx-auto">
            {hasFilters ? <Search className="w-7 h-7" /> : <Sprout className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {hasFilters ? "No matching farms found" : "No farms in this portfolio yet"}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {hasFilters
              ? "Try a different search or status, or clear the filters."
              : "Add a farm on the map or bulk import a GeoJSON file to get started."}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Farm Name</th>
                  <th className="px-4 py-3.5">Crop & Area</th>
                  <th className="px-4 py-3.5">Farmer</th>
                  <th className="px-4 py-3.5">Health Status</th>
                  <th className="px-4 py-3.5">Score</th>
                  <th className="px-4 py-3.5">Last Synced</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {farms.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/farms/${f._id}`}
                        className="font-bold text-slate-900 hover:text-forest-600 transition"
                      >
                        {f.name}
                      </Link>
                      {f.tags?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {f.tags.slice(0, 2).map((t, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                      <div>{(f.cropType || "").replace("_", " ").toUpperCase()}</div>
                      <div className="text-slate-500 font-semibold tabular">{f.areaHa} ha</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">{f.farmerName || "—"}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <HealthBadge
                        status={f.latestHealth?.status || "insufficient_data"}
                        backfillStatus={f.backfillStatus}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-display font-bold text-slate-900 text-sm tabular">
                      {f.latestHealth?.score != null ? `${f.latestHealth.score}/100` : "—"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500 tabular">
                      {f.lastSyncedAt ? new Date(f.lastSyncedAt).toLocaleDateString() : "Queued"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right text-xs">
                      <Link
                        to={`/farms/${f._id}`}
                        className="inline-flex items-center gap-0.5 font-semibold text-forest-600 hover:text-forest-700"
                      >
                        Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {farms.map((f) => (
              <Link key={f._id} to={`/farms/${f._id}`} className="block p-4 space-y-2.5 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{f.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {(f.cropType || "").replace("_", " ").toUpperCase()} &bull; {f.areaHa} ha
                      {f.farmerName ? ` • ${f.farmerName}` : ""}
                    </div>
                  </div>
                  <HealthBadge
                    status={f.latestHealth?.status || "insufficient_data"}
                    backfillStatus={f.backfillStatus}
                    size="sm"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="tabular">
                    Score:{" "}
                    <strong className="text-slate-900">
                      {f.latestHealth?.score != null ? `${f.latestHealth.score}/100` : "—"}
                    </strong>
                  </span>
                  <span className="tabular">
                    {f.lastSyncedAt ? `Synced ${new Date(f.lastSyncedAt).toLocaleDateString()}` : "Queued"}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
              <div className="tabular">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}