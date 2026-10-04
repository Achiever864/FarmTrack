import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Sprout,
  Building2,
  User,
  PlusCircle,
  LayoutDashboard,
  Users,
  Bell,
  UploadCloud,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";

export function Navbar() {
  const { user, logout, organizations, activeOrg, setActiveOrg, isOrgMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Mode Switcher */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 text-forest-700 font-bold text-xl tracking-tight">
              <div className="w-9 h-9 rounded-lg bg-forest-600 flex items-center justify-center text-white shadow-sm">
                <Sprout className="w-5 h-5" />
              </div>
              <span>FarmTrack</span>
            </Link>

            {/* Context / Org Switcher Dropdown */}
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 transition"
                >
                  {isOrgMode ? (
                    <>
                      <Building2 className="w-4 h-4 text-forest-600" />
                      <span className="max-w-[140px] truncate">{activeOrg.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-forest-100 text-forest-800 uppercase font-semibold">
                        {activeOrg.userRole || "Org"}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Individual Mode</span>
                    </>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {orgDropdownOpen && (
                  <div
                    className="absolute left-0 mt-1 w-64 rounded-xl bg-white shadow-lg border border-slate-100 py-1.5 z-40"
                    onMouseLeave={() => setOrgDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Workspaces
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveOrg(null);
                        setOrgDropdownOpen(false);
                        navigate("/");
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-slate-50 transition ${
                        !isOrgMode ? "bg-forest-50 text-forest-700 font-semibold" : "text-slate-700"
                      }`}
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <div>Individual Portfolio</div>
                        <div className="text-xs text-slate-400 font-normal">Personal registered farms</div>
                      </div>
                    </button>

                    {organizations.length > 0 && (
                      <div className="border-t border-slate-100 my-1" />
                    )}

                    {organizations.map((org) => (
                      <button
                        key={org._id}
                        type="button"
                        onClick={() => {
                          setActiveOrg(org);
                          setOrgDropdownOpen(false);
                          navigate(`/org/${org._id}`);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-50 transition ${
                          activeOrg?._id === org._id
                            ? "bg-forest-50 text-forest-700 font-semibold"
                            : "text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{org.name}</span>
                        </div>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                          {org.userRole}
                        </span>
                      </button>
                    ))}

                    <div className="border-t border-slate-100 my-1" />
                    <Link
                      to="/create-org"
                      onClick={() => setOrgDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-forest-600 hover:bg-forest-50 transition font-medium"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Create New Organization
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1">
              {!isOrgMode ? (
                <>
                  <Link
                    to="/"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive("/") ? "bg-forest-50 text-forest-700 font-semibold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    My Farms
                  </Link>
                  <Link
                    to="/farms/new"
                    className="inline-flex items-center gap-1.5 ml-2 px-3.5 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium shadow-sm transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Register Farm
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={`/org/${activeOrg._id}`}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive(`/org/${activeOrg._id}`)
                        ? "bg-forest-50 text-forest-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Portfolio
                  </Link>
                  <Link
                    to={`/org/${activeOrg._id}/farms`}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive(`/org/${activeOrg._id}/farms`)
                        ? "bg-forest-50 text-forest-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Farms
                  </Link>
                  {["owner", "admin", "manager"].includes(activeOrg.userRole) && (
                    <Link
                      to={`/org/${activeOrg._id}/import`}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        isActive(`/org/${activeOrg._id}/import`)
                          ? "bg-forest-50 text-forest-700 font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <UploadCloud className="w-4 h-4" />
                      Bulk Import
                    </Link>
                  )}
                  <Link
                    to={`/org/${activeOrg._id}/members`}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive(`/org/${activeOrg._id}/members`)
                        ? "bg-forest-50 text-forest-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Team
                  </Link>
                  <Link
                    to={`/org/${activeOrg._id}/alerts`}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive(`/org/${activeOrg._id}/alerts`)
                        ? "bg-forest-50 text-forest-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    Alerts
                  </Link>
                  {["owner", "admin", "manager"].includes(activeOrg.userRole) && (
                    <Link
                      to={`/org/${activeOrg._id}/farms/new`}
                      className="inline-flex items-center gap-1.5 ml-2 px-3.5 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium shadow-sm transition"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Farm
                    </Link>
                  )}
                </>
              )}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
              <Link to="/about" className="hover:text-forest-700 transition">
                Mission & Vision
              </Link>
              <Link to="/about" className="hover:text-forest-700 transition font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Otuo Field Pilot
              </Link>
              <Link to="/about" className="hover:text-forest-700 transition">
                The Team
              </Link>
            </nav>
          )}

          {/* User actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium shadow-sm transition"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
