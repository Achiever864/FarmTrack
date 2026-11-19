import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.jsx";
import {
  UploadCloud,
  FileCheck,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  FileJson,
  X,
} from "lucide-react";

export function BulkImport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inputMethod, setInputMethod] = useState("file"); // "file" | "paste"
  const [jsonText, setJsonText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null); // { acceptedCount, rejectedCount, accepted, rejected }

  // Live check of what's in the box (display only)
  const parsedInfo = useMemo(() => {
    if (!jsonText.trim()) return null;
    try {
      const p = JSON.parse(jsonText);
      if (p && p.type === "FeatureCollection" && Array.isArray(p.features)) {
        return { ok: true, count: p.features.length, kind: "GeoJSON features" };
      }
      if (Array.isArray(p)) return { ok: true, count: p.length, kind: "JSON items" };
      return { ok: false, message: "Not a FeatureCollection or JSON array" };
    } catch {
      return { ok: false, message: "Invalid JSON" };
    }
  }, [jsonText]);

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target?.result || "");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function clearInput() {
    setJsonText("");
    setFileName("");
    setReport(null);
    setError(null);
  }

  async function handleImport() {
    setError(null);
    setReport(null);

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseErr) {
      setError("Invalid JSON format. Please ensure valid GeoJSON or JSON syntax.");
      return;
    }

    setLoading(true);

    try {
      let payload = { orgId: id };

      if (parsed.type === "FeatureCollection" && Array.isArray(parsed.features)) {
        payload.features = parsed.features;
      } else if (Array.isArray(parsed)) {
        payload.items = parsed;
      } else {
        throw new Error(
          "Payload must be a GeoJSON FeatureCollection ({ type: 'FeatureCollection', features: [...] }) or a JSON array of items."
        );
      }

      const res = await api.farms.bulkImport(payload);
      setReport(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function loadSampleGeoJson() {
    const sample = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Ondo Central Cooperative - Plot A",
            cropType: "cocoa",
            farmerName: "Bamidele Ogundipe",
            treeAgeYears: 10,
            tags: "Ondo, Central, Premium",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [5.051, 7.095],
                [5.056, 7.095],
                [5.056, 7.091],
                [5.051, 7.091],
                [5.051, 7.095],
              ],
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Ondo Central Cooperative - Plot B",
            cropType: "cocoa",
            farmerName: "Grace Adebayo",
            treeAgeYears: 6,
            tags: "Ondo, South",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [5.061, 7.098],
                [5.067, 7.098],
                [5.067, 7.093],
                [5.061, 7.093],
                [5.061, 7.098],
              ],
            ],
          },
        },
      ],
    };
    setFileName("");
    setJsonText(JSON.stringify(sample, null, 2));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 page-enter">
      <PageHeader
        back
        title="Bulk Import Farm Boundaries"
        subtitle="Import hundreds of cocoa plots at once via a GeoJSON FeatureCollection. Satellite backfill is queued asynchronously."
      />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm"
        >
          <AlertOctagon className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-5">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">Add your GeoJSON</h2>
              <p className="text-xs text-slate-500 mt-0.5">Upload a file or paste the content below.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadSampleGeoJson}
            className="text-xs font-semibold text-forest-600 hover:text-forest-700 shrink-0"
          >
            Insert sample
          </button>
        </div>

        <div className="border-2 border-dashed border-slate-200 hover:border-forest-300 hover:bg-forest-50/40 rounded-2xl p-6 sm:p-8 text-center transition">
          <input
            type="file"
            accept=".geojson,.json"
            onChange={handleFileUpload}
            className="hidden"
            id="geojson-upload"
          />
          <label htmlFor="geojson-upload" className="cursor-pointer space-y-2 block">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-700">Click to upload a .geojson or .json file</div>
            <div className="text-xs text-slate-400">Standard GeoJSON FeatureCollection with closed polygon rings</div>
          </label>
        </div>

        {fileName && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <FileJson className="w-4 h-4 text-forest-600 shrink-0" />
              <span className="truncate font-medium text-slate-700">{fileName}</span>
            </div>
            <button
              type="button"
              onClick={clearInput}
              aria-label="Remove file"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="geojson-text" className="block text-sm font-medium text-slate-700">
              Or paste JSON directly
            </label>
            {parsedInfo && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  parsedInfo.ok
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {parsedInfo.ok ? `${parsedInfo.count} ${parsedInfo.kind} detected` : parsedInfo.message}
              </span>
            )}
          </div>
          <textarea
            id="geojson-text"
            rows={9}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste GeoJSON FeatureCollection here..."
            spellCheck={false}
            className="w-full p-3.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:border-forest-500 transition"
          />
        </div>

        <button
          type="button"
          disabled={!jsonText.trim() || loading}
          onClick={handleImport}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Validating & Importing Polygons...</span>
            </>
          ) : (
            <>
              <FileCheck className="w-4 h-4" />
              <span>Validate & Import Portfolio</span>
            </>
          )}
        </button>
      </div>

      {/* Validation & Execution Report */}
      {report && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-5 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <h2 className="font-display font-bold text-slate-900 text-base">Import Validation Report</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 tabular">
                {report.acceptedCount} accepted
              </span>
              <span className="text-rose-700 font-semibold bg-rose-50 px-3 py-1 rounded-full border border-rose-200 tabular">
                {report.rejectedCount} rejected
              </span>
            </div>
          </div>

          {report.acceptedCount > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Registered and queued for Sentinel satellite backfill</span>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {report.accepted.map((item, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between gap-3">
                    <span className="font-medium text-slate-800 truncate">{item.name}</span>
                    <span className="text-slate-500 tabular shrink-0">{item.areaHa} ha</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.rejectedCount > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>Rejected rows (invalid GeoJSON / coordinates)</span>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-rose-100 text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
                {report.rejected.map((item, idx) => (
                  <div key={idx} className="py-1.5 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                    <span className="font-medium">
                      Row #{item.index + 1}: {item.name || "Untitled"}
                    </span>
                    <span className="text-rose-600 italic">{item.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate(`/org/${id}/farms`)}
            className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-sm font-semibold transition"
          >
            Go to organization farms &rarr;
          </button>
        </div>
      )}
    </div>
  );
}