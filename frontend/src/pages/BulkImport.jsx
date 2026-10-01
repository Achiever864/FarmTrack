import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import {
  UploadCloud,
  FileCheck,
  AlertOctagon,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  FileText,
} from "lucide-react";

export function BulkImport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inputMethod, setInputMethod] = useState("file"); // "file" | "paste"
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null); // { acceptedCount, rejectedCount, accepted, rejected }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target?.result || "");
    };
    reader.readAsText(file);
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
    setJsonText(JSON.stringify(sample, null, 2));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Bulk Import Farm Boundaries
          </h1>
          <p className="text-sm text-slate-500">
            Import hundreds of cocoa plots at once via GeoJSON FeatureCollection. Satellite backfill will be queued asynchronously.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <UploadCloud className="w-4 h-4 text-forest-600" />
            <span>Select or Paste GeoJSON</span>
          </div>

          <button
            type="button"
            onClick={loadSampleGeoJson}
            className="text-xs font-semibold text-forest-600 hover:text-forest-700"
          >
            Insert Sample GeoJSON
          </button>
        </div>

        <div className="border-2 border-dashed border-slate-200 hover:border-forest-300 rounded-xl p-6 text-center cursor-pointer transition">
          <input
            type="file"
            accept=".geojson,.json"
            onChange={handleFileUpload}
            className="hidden"
            id="geojson-upload"
          />
          <label htmlFor="geojson-upload" className="cursor-pointer space-y-2 block">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">
              Click to upload .geojson or .json file
            </div>
            <div className="text-xs text-slate-400">
              Standard GeoJSON FeatureCollection with closed polygon rings
            </div>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">
            Or Paste JSON Content Directly
          </label>
          <textarea
            rows={8}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste GeoJSON FeatureCollection here..."
            className="w-full p-3 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
          />
        </div>

        <button
          type="button"
          disabled={!jsonText.trim() || loading}
          onClick={handleImport}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50"
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-base">Import Validation Report</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {report.acceptedCount} Accepted
              </span>
              <span className="text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                {report.rejectedCount} Rejected
              </span>
            </div>
          </div>

          {report.acceptedCount > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Successfully Registered & Queued for Sentinel Satellite Backfill:</span>
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {report.accepted.map((item, idx) => (
                  <div key={idx} className="py-1 flex justify-between">
                    <span className="font-medium text-slate-800">{item.name}</span>
                    <span className="text-slate-500">{item.areaHa} ha</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.rejectedCount > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>Rejected Rows (Invalid GeoJSON / Coordinates):</span>
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-rose-100 text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
                {report.rejected.map((item, idx) => (
                  <div key={idx} className="py-1 flex justify-between gap-4">
                    <span className="font-medium">
                      Row #{item.index + 1}: {item.name || "Untitled"}
                    </span>
                    <span className="text-rose-600 italic">{item.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate(`/org/${id}/farms`)}
              className="text-xs font-semibold text-forest-600 hover:text-forest-700 underline"
            >
              Go to organization farms list &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
