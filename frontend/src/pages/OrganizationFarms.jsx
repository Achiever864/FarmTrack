import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { HealthBadge } from "../components/HealthBadge.jsx";
import {
  Search,
  Filter,
  FileSpreadsheet,
  PlusCircle,
  ArrowUpDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";

export function OrganizationFarms() {
  const { id } = useParams();

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFarms, setTotalFarms] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Portfolio Farms ({totalFarms})
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Filter, inspect, and export member farms across your cooperative or program
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export CSV
          </button>
          <Link
            to={`/org/${id}/farms/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            Add Farm
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search farm name or farmer..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Farm Name</th>
                <th className="px-4 py-3.5">Crop & Area</th>
                <th className="px-4 py-3.5">Farmer / Assignee</th>
                <th className="px-4 py-3.5">Health Status</th>
                <th className="px-4 py-3.5">Score</th>
                <th className="px-4 py-3.5">Last Synced</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-forest-600 mb-2" />
                    Loading farms...
                  </td>
                </tr>
              ) : farms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching farms found.
                  </td>
                </tr>
              ) : (
                farms.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      <Link to={`/farms/${f._id}`} className="hover:text-forest-600 transition">
                        {f.name}
                      </Link>
                      {f.tags?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {f.tags.slice(0, 2).map((t, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                      <div>{f.cropType.toUpperCase()}</div>
                      <div className="text-slate-500 font-semibold">{f.areaHa} ha</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                      {f.farmerName || "—"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <HealthBadge
                        status={f.latestHealth?.status || "insufficient_data"}
                        backfillStatus={f.backfillStatus}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-900 text-sm">
                      {f.latestHealth?.score != null ? `${f.latestHealth.score}/100` : "—"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      {f.lastSyncedAt
                        ? new Date(f.lastSyncedAt).toLocaleDateString()
                        : "Queued"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right text-xs">
                      <Link
                        to={`/farms/${f._id}`}
                        className="font-semibold text-forest-600 hover:text-forest-700"
                      >
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
            <div>
              Showing page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
