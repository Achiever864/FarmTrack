import React from "react";
import { Link } from "react-router-dom";
import { Sprout, Satellite, Activity, Bot, History } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Satellite,
    title: "Satellite monitoring every 5 days",
    text: "Sentinel-2 imagery over your exact farm boundary, with no sensors to install.",
  },
  {
    icon: Activity,
    title: "Stress caught early",
    text: "NDVI, NDRE and NDMI reveal chlorophyll and moisture problems before they are visible.",
  },
  {
    icon: History,
    title: "18 months of history",
    text: "Every farm you register gets an instant historical crop audit.",
  },
  {
    icon: Bot,
    title: "AI agronomist copilot",
    text: "Plain-language advice and action plans grounded in your farm's own data.",
  },
];

export function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Brand panel (desktop only) */}
      <aside className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_30%_20%,#000_60%,transparent_100%)]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-forest-500/20 blur-3xl" />
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between w-full p-12 xl:p-16">
          <Link to="/" className="inline-flex items-center gap-2.5 font-display font-extrabold text-xl tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center shadow-lg shadow-forest-950/40">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            FarmTrack
          </Link>

          <div className="space-y-8 max-w-md">
            <div className="space-y-3">
              <h2 className="font-display text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
                See your farm the way{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                  satellites do
                </span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Space-powered agronomic intelligence for cocoa and other perennial tree crops across West Africa.
              </p>
            </div>

            <ul className="space-y-4">
              {HIGHLIGHTS.map((h) => (
                <li key={h.title} className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                    <h.icon className="w-4.5 h-4.5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{h.title}</div>
                    <div className="text-xs text-slate-400 leading-relaxed mt-0.5">{h.text}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-500">
            Copernicus Sentinel-2 L2A data &bull; Calibrated for the West African cocoa belt
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-4 sm:px-8 py-10 sm:py-14 bg-slate-50">
        <div className="w-full max-w-md space-y-7 animate-fade-in">
          <div className="space-y-3">
            <div className="lg:hidden w-12 h-12 rounded-2xl bg-gradient-to-br from-forest-500 to-forest-700 text-white flex items-center justify-center shadow-md shadow-forest-900/20">
              <Sprout className="w-6 h-6" />
            </div>
            {eyebrow && (
              <div className="text-xs font-bold text-forest-600 uppercase tracking-wider">{eyebrow}</div>
            )}
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 leading-relaxed">{subtitle}</p>}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8">
            {children}
          </div>

          {footer && <div className="text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </main>
    </div>
  );
}