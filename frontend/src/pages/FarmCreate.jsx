import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { MapDraw } from "../components/MapDraw.jsx";
import {
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Building2,
  User,
  CheckCircle2,
  MapPinned,
} from "lucide-react";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:border-forest-500 transition";

function Field({ label, required, hint, htmlFor, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  const hasBoundary = Boolean(polygonData?.geometry);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs transition shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Register New Farm Boundary
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
            {targetOrgId ? (
              <>
                <Building2 className="w-4 h-4 text-forest-600 shrink-0" />
                <span className="truncate">
                  Adding plot to organization portfolio ({activeOrg?.name || "Organization"})
                </span>
              </>
            ) : (
              <>
                <User className="w-4 h-4 text-forest-600 shrink-0" />
                <span>Registering individual personal farm</span>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Map (first on mobile, right column on desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">Draw Farm Boundary</h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Tap points around your farm on the map, then click the green first marker or press
                "Complete Boundary" to close the shape. Or use "Walk to Map Boundary" to record it with your phone's GPS.
              </p>
            </div>
          </div>

          <MapDraw onPolygonChange={setPolygonData} />
        </div>

        {/* Details form */}
        <div className="order-2 lg:order-1 lg:col-span-1 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-5 lg:sticky lg:top-24">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">Farm Details</h2>
              <p className="text-xs text-slate-500 mt-0.5">Tell us about the plot you just mapped.</p>
            </div>
          </div>

          <Field label="Farm Name" required htmlFor="farm-name">
            <input
              id="farm-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ondo Plot 4 (Idanre Cluster)"
              className={inputClass}
            />
          </Field>

          <Field
            label="Crop Type"
            htmlFor="farm-crop"
            hint="Cocoa uses perennial evergreen growth calibration."
          >
            <select
              id="farm-crop"
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className={inputClass}
            >
              <option value="cocoa">Cocoa (Theobroma cacao) - Default</option>
              <option value="coffee">Coffee</option>
              <option value="oil_palm">Oil Palm</option>
              <option value="rubber">Rubber</option>
              <option value="cashew">Cashew</option>
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tree Age (Years)" htmlFor="farm-age">
              <input
                id="farm-age"
                type="number"
                min="0"
                max="80"
                value={treeAgeYears}
                onChange={(e) => setTreeAgeYears(e.target.value)}
                placeholder="e.g. 8"
                className={inputClass}
              />
            </Field>

            <Field label="Planting Date" htmlFor="farm-planting">
              <input
                id="farm-planting"
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Farmer / Manager Name" htmlFor="farm-farmer">
            <input
              id="farm-farmer"
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              placeholder="e.g. Emmanuel Adeleke"
              className={inputClass}
            />
          </Field>

          <Field
            label="Tags & Clusters"
            htmlFor="farm-tags"
            hint="Separate with commas."
          >
            <input
              id="farm-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Ondo, Cooperative-A, Premium"
              className={inputClass}
            />
          </Field>

          {/* Boundary status */}
          <div
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs ${
              hasBoundary
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            {hasBoundary ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Boundary captured &bull; <strong>{polygonData.areaHa} ha</strong>
                </span>
              </>
            ) : (
              <>
                <MapPinned className="w-4 h-4 text-amber-600 shrink-0" />
                <span>No boundary yet. Draw and close your farm shape on the map first.</span>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-forest-600 hover:bg-forest-700 active:bg-forest-800 text-white font-semibold text-sm shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving & Enqueueing Backfill...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Farm & Start Satellite Ingestion</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}