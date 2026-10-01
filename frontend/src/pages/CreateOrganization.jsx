import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Building2, ArrowLeft, Plus } from "lucide-react";

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
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-1">
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Create an Organization
          </h1>
          <p className="text-xs text-slate-500">
            Set up a cooperative, development program, or buying company workspace to manage multiple farms and invite team members.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">
              Organization Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Owo Farmers Multipurpose Cooperative"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? "Creating Organization..." : "Create Organization"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
