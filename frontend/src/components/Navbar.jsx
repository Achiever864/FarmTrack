import React, { useState, useEffect, useRef } from "react";
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
  Sparkles,
  Menu,
  X,
  List,
  Check,
} from "lucide-react";

function NavItem({ to, icon: Icon, active, children, mobile = false, onClick }) {
  const base = mobile
    ? "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition"
    : "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition";
  const state = active
    ? "bg-forest-50 text-forest-700 font-semibold"
    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100";

  return (
    <Link to={to} onClick={onClick} className={`${base} ${state}`}>
      {Icon && <Icon className={mobile ? "w-5 h-5" : "w-4 h-4"} />}
      {children}
    </Link>
  );
}

export function Navbar() {
  const { user, logout, organizations, activeOrg, setActiveOrg, isOrgMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const canEditOrg = isOrgMode && ["owner", "admin", "manager"].includes(activeOrg?.userRole);

  // Close menus whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
    setOrgDropdownOpen(false);
  }, [location.pathname]);

  // Close workspace dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOrgDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Build the link list once, reuse for desktop + mobile
  const links = [];
  let cta = null;

  if (user && !isOrgMode) {
    links.push({ to: "/", label: "My Farms", icon: Sprout });
    cta = { to: "/farms/new", label: "Register Farm" };
  } else if (user && isOrgMode) {
    links.push({ to: `/org/${activeOrg._id}`, label: "Portfolio", icon: LayoutDashboard });
    links.push({ to: `/org/${activeOrg._id}/farms`, label: "Farms", icon: List });
    if (canEditOrg) {
      links.push({ to: `/org/${activeOrg._id}/import`, label: "Bulk Import", icon: UploadCloud });
    }
    links.push({ to: `/org/${activeOrg._id}/members`, label: "Team", icon: Users });
    links.push({ to: `/org/${activeOrg._id}/alerts`, label: "Alerts", icon: Bell });
    if (canEditOrg) {
      cta = { to: `/org/${activeOrg._id}/farms/new`, label: "Add Farm" };
    }
  }

  const initials = (user?.name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

  function switchToIndividual() {
    setActiveOrg(null);
    setOrgDropdownOpen(false);
    navigate("/");
  }

  function switchToOrg(org) {
    setActiveOrg(org);
    setOrgDropdownOpen(false);
    navigate(`/org/${org._id}`);
  }

  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand & Workspace Switcher */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-forest-800 font-display font-extrabold text-xl tracking-tight shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center text-white shadow-sm">
                <Sprout className="w-5 h-5" />
              </div>
              <span className={user ? "max-[420px]:hidden" : ""}>FarmTrack</span>
            </Link>

            {user && (
              <div className="relative min-w-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={orgDropdownOpen}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 transition max-w-full"
                >
                  {isOrgMode ? (
                    <>
                      <Building2 className="w-4 h-4 text-forest-600 shrink-0" />
                      <span className="max-w-[110px] sm:max-w-[160px] truncate">{activeOrg.name}</span>
                      <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-md bg-forest-100 text-forest-800 uppercase font-bold tracking-wide">
                        {activeOrg.userRole || "Org"}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">Individual</span>
                      <span className="hidden sm:inline">Mode</span>
                    </>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                      orgDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {orgDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-card-hover border border-slate-200 py-2 z-40 animate-fade-in">
                    <div className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Workspaces
                    </div>

                    <button
                      type="button"
                      onClick={switchToIndividual}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition ${
                        !isOrgMode ? "bg-forest-50 text-forest-700 font-semibold" : "text-slate-700"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div>Individual Portfolio</div>
                        <div className="text-xs text-slate-400 font-normal">Personal registered farms</div>
                      </div>
                      {!isOrgMode && <Check className="w-4 h-4 text-forest-600 shrink-0" />}
                    </button>

                    {organizations.length > 0 && <div className="border-t border-slate-100 my-1.5" />}

                    <div className="max-h-64 overflow-y-auto">
                      {organizations.map((org) => {
                        const selected = activeOrg?._id === org._id;
                        return (
                          <button
                            key={org._id}
                            type="button"
                            onClick={() => switchToOrg(org)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition ${
                              selected ? "bg-forest-50 text-forest-700 font-semibold" : "text-slate-700"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4 text-slate-500" />
                            </div>
                            <span className="flex-1 truncate">{org.name}</span>
                            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize shrink-0">
                              {org.userRole}
                            </span>
                            {selected && <Check className="w-4 h-4 text-forest-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 my-1.5" />
                    <Link
                      to="/create-org"
                      onClick={() => setOrgDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-forest-600 hover:bg-forest-50 transition font-semibold"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Create New Organization
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          {user ? (
            <nav className="hidden lg:flex items-center gap-1">
              {links.map((l) => (
                <NavItem key={l.to} to={l.to} icon={l.icon} active={isActive(l.to)}>
                  {l.label}
                </NavItem>
              ))}
              {cta && (
                <Link
                  to={cta.to}
                  className="inline-flex items-center gap-1.5 ml-2 px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-sm font-semibold shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  {cta.label}
                </Link>
              )}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600">
              <Link to="/about" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-forest-700 transition">
                Mission & Vision
              </Link>
              <Link
                to="/about"
                className="font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition"
              >
                Otuo Field Pilot
              </Link>
              <Link to="/about" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-forest-700 transition">
                The Team
              </Link>
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user ? (
              <>
                <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>AI Mode Active</span>
                </span>

                <div className="hidden lg:flex items-center gap-2.5 pl-2 border-l border-slate-200">
                  <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-800 border border-forest-200 flex items-center justify-center text-xs font-bold">
                    {initials}
                  </div>
                  <div className="text-right hidden xl:block leading-tight">
                    <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                    <div className="text-xs text-slate-500 max-w-[160px] truncate">{user.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    title="Sign out"
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile menu toggle */}
                <button
                  type="button"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileOpen}
                  className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 sm:px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-sm font-semibold shadow-sm transition"
                >
                  <span className="hidden sm:inline">Create Account</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel (logged-in users) */}
      {user && mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white animate-fade-in">
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-4 space-y-4">
            <nav className="space-y-1">
              {links.map((l) => (
                <NavItem
                  key={l.to}
                  to={l.to}
                  icon={l.icon}
                  active={isActive(l.to)}
                  mobile
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </NavItem>
              ))}
            </nav>

            {cta && (
              <Link
                to={cta.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-sm font-semibold shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                {cta.label}
              </Link>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-forest-100 text-forest-800 border border-forest-200 flex items-center justify-center text-sm font-bold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="text-sm font-semibold text-slate-800 truncate">{user.name}</div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-sm font-medium transition shrink-0"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}