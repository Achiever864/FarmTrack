import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { UserPlus, Trash2, Mail, RefreshCw, Check, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

const ROLE_STYLES = {
  owner: "bg-forest-100 text-forest-800 border-forest-200",
  admin: "bg-blue-50 text-blue-700 border-blue-200",
  manager: "bg-amber-50 text-amber-700 border-amber-200",
  viewer: "bg-slate-100 text-slate-600 border-slate-200",
};

const ROLE_INFO = [
  { role: "Owner", text: "Full control of the organization." },
  { role: "Admin", text: "Manage members, farms and alerts." },
  { role: "Manager", text: "Add and edit farms." },
  { role: "Viewer", text: "Read-only access to the portfolio." },
];

function initialsOf(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export function OrganizationMembers() {
  const { id } = useParams();
  const { user, activeOrg } = useAuth();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(null);

  async function loadMembers() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.orgs.getMembers(id);
      setMembers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [id]);

  async function handleInvite(e) {
    e.preventDefault();
    setInviting(true);
    setInviteSuccess(null);
    setError(null);

    try {
      await api.orgs.addMember(id, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteSuccess(`Successfully added ${inviteEmail} as ${inviteRole}`);
      setInviteEmail("");
      loadMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await api.orgs.updateMemberRole(id, userId, newRole);
      loadMembers();
    } catch (err) {
      alert(`Role update failed: ${err.message}`);
    }
  }

  async function handleRemove(userId, memberName) {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this organization?`)) {
      return;
    }
    try {
      await api.orgs.removeMember(id, userId);
      loadMembers();
    } catch (err) {
      alert(`Remove failed: ${err.message}`);
    }
  }

  const canManage = ["owner", "admin"].includes(activeOrg?.userRole);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 page-enter">
      <PageHeader
        back
        title="Team Members & Roles"
        subtitle="Manage who can view, edit, or administer your cooperative portfolio"
      />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {inviteSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <Check className="w-4 h-4 shrink-0" />
          <span>{inviteSuccess}</span>
        </div>
      )}

      {/* Invite Member (Owner and Admin only) */}
      {canManage && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center gap-2 font-display font-bold text-slate-900">
            <UserPlus className="w-4 h-4 text-forest-600" />
            <span>Invite team member</span>
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            The person must already have a FarmTrack account with this email address.
          </p>

          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative w-full sm:flex-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                aria-label="Member email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="agronomist@cooperative.org"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:border-forest-500 transition"
              />
            </div>

            <select
              value={inviteRole}
              aria-label="Member role"
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full sm:w-56 py-3 px-3.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:border-forest-500 transition"
            >
              <option value="viewer">Viewer (Read-only)</option>
              <option value="manager">Manager (Add/Edit Farms)</option>
              <option value="admin">Admin (Manage All)</option>
            </select>

            <button
              type="submit"
              disabled={inviting}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {inviting && <Loader2 className="w-4 h-4 animate-spin" />}
              {inviting ? "Adding..." : "Add Member"}
            </button>
          </form>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-slate-900 text-base">Active Members</h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full tabular">
            {members.length}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-14 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-forest-600 mb-2" />
              <p className="text-sm">Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="py-14 text-center text-sm text-slate-400">No members yet.</div>
          ) : (
            members.map((m) => (
              <div
                key={m._id}
                className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-forest-100 text-forest-800 border border-forest-200 flex items-center justify-center text-xs font-bold shrink-0">
                    {initialsOf(m.userId?.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">
                      {m.userId?.name}
                      {m.userId?._id === user?._id && (
                        <span className="ml-2 text-[10px] font-bold text-forest-700 bg-forest-50 border border-forest-100 px-1.5 py-0.5 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{m.userId?.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:shrink-0 pl-13 sm:pl-0">
                  {canManage && m.role !== "owner" ? (
                    <select
                      value={m.role}
                      aria-label={`Role for ${m.userId?.name}`}
                      onChange={(e) => handleRoleChange(m.userId?._id, e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-500/40 transition"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1.5 rounded-lg border font-semibold text-xs uppercase ${
                        ROLE_STYLES[m.role] || ROLE_STYLES.viewer
                      }`}
                    >
                      {m.role}
                    </span>
                  )}

                  {canManage && m.role !== "owner" && m.userId?._id !== user?._id && (
                    <button
                      type="button"
                      onClick={() => handleRemove(m.userId?._id, m.userId?.name)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove member"
                      aria-label={`Remove ${m.userId?.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Role guide */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
        <div className="flex items-center gap-2 font-display font-bold text-slate-900 text-sm mb-3">
          <ShieldCheck className="w-4 h-4 text-forest-600" />
          What each role can do
        </div>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {ROLE_INFO.map((r) => (
            <div key={r.role} className="flex items-start gap-2.5 text-xs">
              <span
                className={`px-2 py-0.5 rounded-md border font-semibold uppercase text-[10px] shrink-0 ${
                  ROLE_STYLES[r.role.toLowerCase()]
                }`}
              >
                {r.role}
              </span>
              <span className="text-slate-600 leading-relaxed">{r.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}