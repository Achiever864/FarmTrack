import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Building2, ArrowLeft, Plus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const BENEFITS = [
  "Register or bulk import hundreds of member farms",
  "Portfolio-wide health dashboard and risk ranking",
  "Invite your team with owner, admin, manager and viewer roles",
  "Export CSV audits for your funders and partners",
];

export function CreateOrganization() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { refreshOrganizations, setActiveOrg } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.orgs.create({ name: name.trim() });
      await refreshOrganizations();
      setActiveOrg(res.org);
      navigate(`/org/${res.org._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 space-y-6 page-enter">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-forest-500 to-forest-700 text-white flex items-center justify-center shadow-md shadow-forest-900/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Create an Organization</h1>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Set up a cooperative, development program, or buying company workspace to manage multiple farms and
              invite team members.
            </p>
          </div>
        </div>

        <ul className="space-y-2.5 bg-forest-50/60 border border-forest-100 rounded-xl p-4">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-px" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="org-name" className="block text-sm font-medium text-slate-700">
              Organization name <span className="text-rose-500">*</span>
            </label>
            <input
              id="org-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Owo Farmers Multipurpose Cooperative"
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:border-forest-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{loading ? "Creating Organization..." : "Create Organization"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}