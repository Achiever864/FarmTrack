import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { MapDraw } from "../components/MapDraw.jsx";
import { Sprout, ArrowLeft, Check, AlertCircle } from "lucide-react";

export function FarmCreate() {
  const { activeOrg, isOrgMode } = useAuth();
  const { orgId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [cropType, setCropType] = useState("cocoa");
  const [treeAgeYears, setTreeAgeYears] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [polygonData, setPolygonData] = useState(null); // { geometry, areaHa, centroid }

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const targetOrgId = orgId || (isOrgMode ? activeOrg?._id : null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!polygonData || !polygonData.geometry) {
      setError("Please draw a closed farm boundary polygon on the map before saving.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        geometry: polygonData.geometry,
        cropType,
        treeAgeYears: treeAgeYears ? Number(treeAgeYears) : null,
        plantingDate: plantingDate || null,
        farmerName: farmerName.trim() || null,
        tags: tagsInput
          ? tagsInput.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        orgId: targetOrgId || undefined,
      };

      const created = await api.farms.create(payload);
      navigate(`/farms/${created._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
            Register New Farm Boundary
          </h1>
          <p className="text-sm text-slate-500">
            {targetOrgId
              ? `Adding plot to organization portfolio (${activeOrg?.name || "Organization"})`
              : "Registering individual personal farm"}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Attributes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
            Farm Details
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">
              Farm Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ondo Plot 4 (Idanre Cluster)"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">
              Crop Type
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
            >
              <option value="cocoa">Cocoa (Theobroma cacao) - Default</option>
              <option value="coffee">Coffee</option>
              <option value="oil_palm">Oil Palm</option>
              <option value="rubber">Rubber</option>
              <option value="cashew">Cashew</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Cocoa uses perennial evergreen growth calibration.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">
                Tree Age (Years)
              </label>
              <input
                type="number"
                min="0"
                max="80"
                value={treeAgeYears}
                onChange={(e) => setTreeAgeYears(e.target.value)}
                placeholder="e.g. 8"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">
                Planting Date
              </label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">
              Farmer / Manager Name
            </label>
            <input
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              placeholder="e.g. Emmanuel Adeleke"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">
              Tags & Clusters (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Ondo, Cooperative-A, Premium"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? "Saving & Enqueueing Backfill..." : "Save Farm & Start Satellite Ingestion"}</span>
            </button>
          </div>
        </div>

        {/* Right Map Drawing Tool */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Draw Farm Polygon
              </h2>
              <p className="text-xs text-slate-500">
                Click on the map around your farm boundary. Double-click or click the green first marker to close the ring.
              </p>
            </div>

            <MapDraw onPolygonChange={setPolygonData} />
          </div>
        </div>
      </form>
    </div>
  );
}
