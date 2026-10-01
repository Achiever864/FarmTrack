import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  ArrowLeft,
  Mail,
  RefreshCw,
  Check,
} from "lucide-react";

export function OrganizationMembers() {
  const { id } = useParams();
  const { user, activeOrg } = useAuth();
  const navigate = useNavigate();

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
            Team Members & Roles
          </h1>
          <p className="text-sm text-slate-500">
            Manage who can view, edit, or administer your cooperative portfolio
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {inviteSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{inviteSuccess}</span>
        </div>
      )}

      {/* Invite Member Box (Only for Owner and Admin) */}
      {canManage && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
            <UserPlus className="w-4 h-4 text-forest-600" />
            <span>Invite Team Member</span>
          </div>

          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="agronomist@cooperative.org"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
              />
            </div>

            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full sm:w-40 py-2.5 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
            >
              <option value="viewer">Viewer (Read-only)</option>
              <option value="manager">Manager (Add/Edit Farms)</option>
              <option value="admin">Admin (Manage All)</option>
            </select>

            <button
              type="submit"
              disabled={inviting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-medium text-sm shadow-sm transition disabled:opacity-50"
            >
              {inviting ? "Adding..." : "Add Member"}
            </button>
          </form>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-semibold text-slate-800 text-sm">
          Active Members ({members.length})
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-forest-600 mb-2" />
              Loading members...
            </div>
          ) : (
            members.map((m) => (
              <div key={m._id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-sm">{m.userId?.name}</div>
                  <div className="text-xs text-slate-500">{m.userId?.email}</div>
                </div>

                <div className="flex items-center gap-3">
                  {canManage && m.role !== "owner" ? (
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.userId?._id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs uppercase">
                      {m.role}
                    </span>
                  )}

                  {canManage && m.role !== "owner" && m.userId?._id !== user?._id && (
                    <button
                      type="button"
                      onClick={() => handleRemove(m.userId?._id, m.userId?.name)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 transition"
                      title="Remove member"
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
    </div>
  );
}
