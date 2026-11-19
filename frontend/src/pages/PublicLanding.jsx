import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  Compass,
  Target,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Building2,
  User,
  Camera,
  Landmark,
  BadgeCheck,
  CheckCheck,
  MapPin,
  Bot,
  PenTool,
  Satellite,
  BellRing,
} from "lucide-react";

// Team member photos imported from src/assets
import ikhuemoisaImg from "../assets/Ikhuemoisa.jpeg";
import hazeemImg from "../assets/Hazeem.jpeg";
import davidImg from "../assets/David.jpeg";
import adeoluwaImg from "../assets/Adeoluwa.jpeg";
import fawasImg from "../assets/Fawas.jpeg";

const TEAM_MEMBERS = [
  {
    id: "igaga",
    name: "Igaga Ikhuemoisa Adeoluwa",
    role: "Founder • Backend & AI Engineer",
    affiliation: "University of Ibadan",
    initials: "IA",
    image: ikhuemoisaImg,
    bio: "Raised with deep roots in rural farming communities, experiencing smallholder agriculture firsthand. Passionate about harnessing modern AI, satellite intelligence, and backend architectures to optimize crop yield and agricultural resilience across Nigeria.",
    theme: {
      bg: "bg-forest-100",
      border: "border-forest-300",
      ring: "ring-forest-500/20",
      text: "text-forest-800",
      roleText: "text-forest-700",
    },
  },
  {
    id: "akano",
    name: "Akano Hazeem Olamilekan",
    role: "Co-Founder • Technology Lead",
    affiliation: "Computer Science • University of Ibadan",
    initials: "AO",
    image: hazeemImg,
    bio: "Multi-award-winning technologist recognized for impactful contributions in the tech ecosystem. Directs product strategy, software reliability, and systems execution to turn complex remote-sensing pipelines into accessible solutions for growers.",
    theme: {
      bg: "bg-emerald-100",
      border: "border-emerald-300",
      ring: "ring-emerald-500/20",
      text: "text-emerald-800",
      roleText: "text-emerald-700",
    },
  },
  {
    id: "kelly",
    name: "Kelly David Osi",
    role: "Agronomic & Agricultural Economics Lead",
    affiliation: "Agriculture & Agricultural Economics • University of Ibadan",
    initials: "KO",
    image: davidImg,
    bio: "Distinguished agricultural scholar renowned for his comprehensive understanding of crop management practices and agricultural economics. Bridges scientific agronomy with practical farm-gate economics to maximize farmer profitability.",
    theme: {
      bg: "bg-amber-100",
      border: "border-amber-300",
      ring: "ring-amber-500/20",
      text: "text-amber-800",
      roleText: "text-amber-700",
    },
  },
  {
    id: "shittu",
    name: "Shittu Adeoluwa Emmanuel",
    role: "Lead Full-Stack Engineer",
    affiliation: "Award-Winning Developer • Systems Analyst",
    initials: "SE",
    image: adeoluwaImg,
    bio: "Celebrated developer lauded for deep technical acumen, analytical problem-solving, and architectural precision. Leads the development of high-performance user interfaces and scalable cloud-connected endpoints.",
    theme: {
      bg: "bg-teal-100",
      border: "border-teal-300",
      ring: "ring-teal-500/20",
      text: "text-teal-800",
      roleText: "text-teal-700",
    },
  },
  {
    id: "ibikunle",
    name: "Ibikunle Fawas Olamide",
    role: "Full-Stack Developer",
    affiliation: "Software Engineering • University of Ibadan",
    initials: "IO",
    image: fawasImg,
    bio: "Versatile software engineer known for exceptional technical range and attention to detail. Drives full-stack feature development, responsive UI workflows, and spatial telemetry integrations across the FarmTrack platform.",
    theme: {
      bg: "bg-indigo-100",
      border: "border-indigo-300",
      ring: "ring-indigo-500/20",
      text: "text-indigo-800",
      roleText: "text-indigo-700",
    },
  },
];

const INDICES = [
  {
    code: "NDVI",
    name: "Normalized Difference Vegetation Index",
    formula: "(B08 − B04) / (B08 + B04)",
    text: "Measures general vegetative density and photosynthetically active biomass. Tracks broad canopy expansion and recovery after pruning.",
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    code: "NDRE",
    name: "Normalized Difference Red Edge",
    formula: "(B08 − B05) / (B08 + B05)",
    text: "Penetrates deep into dense canopies where NDVI saturates. Detects rapid chlorophyll loss and foliar stress 2–3 weeks before leaves visibly brown.",
    tone: "bg-amber-50 text-amber-700",
  },
  {
    code: "NDMI",
    name: "Normalized Difference Moisture Index",
    formula: "(B08 − B11) / (B08 + B11)",
    text: "Estimates leaf water content using shortwave infrared. Useful for tracking drought stress during dry spells and the Harmattan.",
    tone: "bg-blue-50 text-blue-700",
  },
];

const STEPS = [
  {
    icon: PenTool,
    title: "Map your farm",
    text: "Draw the boundary on a satellite map, or walk the perimeter with your phone's GPS.",
  },
  {
    icon: Satellite,
    title: "We analyze from orbit",
    text: "Sentinel-2 imagery is processed every 5 days, with 18 months of history on day one.",
  },
  {
    icon: BellRing,
    title: "Act before it shows",
    text: "Get health scores, early stress alerts, and AI advice tailored to your plot.",
  },
];

const STATS = [
  { value: "98.4%", label: "Ground-truth fidelity", sub: "Verified at Otuo, Edo State", tone: "text-forest-700" },
  { value: "₦0", label: "Hardware cost to farmer", sub: "Zero physical sensors needed", tone: "text-emerald-700" },
  { value: "18 mo", label: "Historical backfill", sub: "Immediate crop audit on signup", tone: "text-teal-700" },
  { value: "5 days", label: "Satellite refresh", sub: "Automated monitoring cycle", tone: "text-forest-700" },
];

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-3">
      <div className="text-xs font-bold text-forest-600 uppercase tracking-wider">{eyebrow}</div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
      {text && <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{text}</p>}
    </div>
  );
}

function TeamMemberCard({ member }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card text-center space-y-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all h-full">
      <div className="relative mx-auto w-24 h-24">
        {!imageError && member.image ? (
          <img
            src={member.image}
            alt={member.name}
            onError={() => setImageError(true)}
            className={`w-24 h-24 rounded-full object-cover object-top border-2 ${member.theme.border} shadow-sm ring-4 ${member.theme.ring}`}
          />
        ) : (
          <div
            className={`w-24 h-24 rounded-full ${member.theme.bg} border-2 ${member.theme.border} flex flex-col items-center justify-center ${member.theme.text} shadow-sm ring-4 ${member.theme.ring}`}
          >
            <span className="font-display font-bold text-2xl tracking-tight">{member.initials}</span>
            <div className="flex items-center gap-1 text-[10px] font-medium opacity-70 mt-0.5">
              <Camera className="w-3 h-3" />
              <span>Photo</span>
            </div>
          </div>
        )}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-base">{member.name}</h4>
        <div className={`text-xs font-semibold ${member.theme.roleText} mt-0.5`}>{member.role}</div>
        <div className="text-[11px] text-slate-400 mt-0.5">{member.affiliation}</div>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{member.bio}</p>
    </div>
  );
}

export function PublicLanding() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-forest-950 text-white pt-14 sm:pt-20 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <BadgeCheck className="w-4 h-4" />
              Field-verified in Edo State, Nigeria
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Space-Powered Agronomic Intelligence for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-forest-400 to-teal-300">
                Perennial Tree Crops
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              FarmTrack connects Earth observation satellites directly with farmers and investors or companies keeping
              track of farm progress. Every 5 days, our algorithms analyze vegetation density, chlorophyll health, and
              canopy moisture across your plot boundaries, detecting stress weeks before it is visible to the naked eye.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-forest-500 hover:bg-forest-400 text-forest-950 font-bold text-sm shadow-lg shadow-forest-900/50 transition-all hover:scale-[1.02]"
              >
                <span>Start Monitoring Your Farms</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-100 border border-white/15 font-semibold text-sm backdrop-blur transition"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Live satellite simulation card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-slate-700/80 bg-slate-800/90 backdrop-blur-xl p-5 sm:p-6 shadow-2xl shadow-forest-950 space-y-5">
              <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-forest-600/30 border border-forest-500/40 flex items-center justify-center text-forest-400 shrink-0">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">Idanre Cluster Cocoa Farm</div>
                    <div className="text-[11px] text-slate-400">Ondo State, Nigeria &bull; 24.8 Hectares</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Healthy
                </span>
              </div>

              <div className="relative h-44 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
                  alt="Canopy Aerial View"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-forest-500/20 to-transparent animate-pulse" />
                <div className="relative z-10 mx-3 p-3 rounded-lg bg-slate-900/80 backdrop-blur border border-forest-500/50 text-center space-y-1">
                  <div className="text-[11px] font-mono text-forest-300">Sentinel-2 Orbit PASS P5D</div>
                  <div className="text-xs text-white font-semibold">Scene Classification: Clear Vegetation (SCL 4)</div>
                  <div className="text-[10px] text-slate-400">Valid Clear Pixels: 94.2% &bull; Confidence: High</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                {[
                  { code: "NDVI", value: "0.74", label: "Canopy Vigor", color: "text-emerald-400" },
                  { code: "NDRE", value: "0.42", label: "Chlorophyll", color: "text-amber-400" },
                  { code: "NDMI", value: "0.26", label: "Canopy Moisture", color: "text-blue-400" },
                ].map((i) => (
                  <div key={i.code} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                    <div className={`text-[10px] uppercase font-semibold ${i.color}`}>{i.code}</div>
                    <div className="font-display text-xl font-extrabold text-white mt-0.5 tabular">{i.value}</div>
                    <div className="text-[9px] text-slate-400">{i.label}</div>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-forest-400 shrink-0" />
                <span>
                  Historical Analysis: Farm is performing <strong className="text-slate-200">+6% above</strong> 25km peer
                  cocoa farms.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip (overlaps hero) */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 text-center shadow-card-hover">
              <div className={`font-display text-2xl sm:text-3xl font-extrabold ${s.tone}`}>{s.value}</div>
              <div className="text-xs font-semibold text-slate-800 mt-1">{s.label}</div>
              <div className="text-[11px] text-slate-500">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-14">
        <SectionHeading
          eyebrow="Our Purpose & Driving Force"
          title="Bridging Space Exploration and Smallholder Prosperity"
          text="Most of the world's cocoa comes from West Africa, grown by smallholder families on plots of just a few hectares. Traditional ground scouting cannot catch early chlorophyll stress or canopy moisture deficits before yields plummet. We are democratizing orbit-level diagnostics for every plot."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-4 hover:border-forest-300 transition">
            <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Our Mission</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              To place satellite grade remote sensing and honest agronomic analytics directly into the hands of
              smallholder farmers, cooperatives, and investors. By removing guesswork, forecasting crop stress weeks
              ahead, and providing verifiable transparency, we protect farmer livelihoods and prevent avoidable harvest
              losses.
            </p>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-4 hover:border-forest-300 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Our Vision</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              A future where every farm in rural Africa is visible, verifiable, and fundable. Where AI turns satellite
              data into clear answers for farmers and funders, so no investment goes unaccounted for and no loss goes
              unseen until it is too late.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <SectionHeading eyebrow="How It Works" title="From boundary to insight in three steps" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="font-display text-4xl font-extrabold text-slate-100">{i + 1}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{s.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The 3-Index Scientific Engine */}
      <section className="bg-slate-100/80 py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <SectionHeading
            eyebrow="Multispectral Precision"
            title="Why NDVI Alone Isn't Enough"
            text="NDVI tends to saturate over dense canopies and can't tell you why a crop is struggling. FarmTrack combines three spectral indices so one signal doesn't hide what another would catch:"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {INDICES.map((i) => (
              <div key={i.code} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs ${i.tone}`}>
                  {i.code}
                </div>
                <h3 className="font-bold text-slate-900 text-base">{i.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{i.formula}</p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{i.text}</p>
              </div>
            ))}
          </div>

          {/* Gemini AI Agronomist Copilot Highlight */}
          <div className="relative overflow-hidden bg-gradient-to-r from-forest-900 via-slate-900 to-emerald-950 p-6 sm:p-8 rounded-3xl border border-emerald-500/40 shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
            <div className="relative space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Powered by Google Gemini</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <Bot className="w-6 h-6 text-emerald-400 shrink-0" />
                AI Agronomist Copilot &bull; Grounded in Space Data
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Raw multispectral numbers can be difficult to interpret in the field. Our Gemini-powered AI Agronomist
                translates complex NDVI, NDRE, and NDMI curves into clear, prioritized diagnostic plans — answering
                farmer questions, detecting black pod humidity thresholds, and tailoring pruning or shade advisories in
                real time.
              </p>
            </div>
            <Link
              to="/register"
              className="relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-900/40 shrink-0 w-full md:w-auto"
            >
              <span>Try AI Mode</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Field Validation Pilot & Institutional Rural Financing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-14">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <BadgeCheck className="w-4 h-4 text-emerald-600" />
            Ground-Truthed in Edo State, Nigeria
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            From Space Orbit to Ground Truth
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            FarmTrack is not a theoretical laboratory concept. We took our satellite telemetry directly to active cocoa
            farmlands in Otuo, Edo State to prove that our orbital models mirror the physical soil and trees and we are
            now partnering with Nigerian organizations to fund rural farmers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Pilot card */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border-2 border-forest-500/80 shadow-md space-y-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-forest-100/60 to-transparent rounded-bl-full pointer-events-none" />

            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Pilot Test: Otuo Cocoa Farmland</h3>
                    <div className="text-xs font-semibold text-forest-700">
                      Owan-East LGA, Edo State, Nigeria &bull; ~7.195&deg;N, 6.012&deg;E
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Ground Truth 100% Verified
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                During our physical field trials in Otuo, our engineering and agronomic team surveyed working cocoa
                smallholdings. We compared Sentinel-2 Level-2A satellite radiometry with direct physical ground
                measurements of tree canopy, leaf chlorophyll, and boundary perimeters.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  {
                    title: "Boundary & Area Fidelity",
                    body: (
                      <>
                        FarmTrack's polygon area matched physical GPS tape ground measurements with{" "}
                        <strong>98.4% precision</strong>, correctly mapping complex tree canopies and slope angles.
                      </>
                    ),
                  },
                  {
                    title: "Chlorophyll & Canopy Health",
                    body: "Satellite NDVI (0.72) and NDRE accurately captured mature cocoa tree health under intercropped shade trees, matching the healthy physical foliage noted on site.",
                  },
                  {
                    title: "Micro-Moisture Detection",
                    body: "NDMI shortwave infrared telemetry correctly detected localized lower-slope moisture retention without installing expensive soil moisture probes.",
                  },
                  {
                    title: "Zero Hardware Burden",
                    body: "Proved that smallholders in remote communities do not need costly IoT sensors, cellular modems, or drone flights to receive institutional agronomic monitoring.",
                  },
                ].map((c) => (
                  <div key={c.title} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{c.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <span className="font-semibold text-slate-700">
                Test Methodology: Ground Truthing &plusmn; 10m Multispectral Pixel Verification
              </span>
              <span className="text-forest-700 font-bold">Otuo, Edo State &bull; Verified</span>
            </div>
          </div>

          {/* Funding card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-forest-950 text-white p-6 sm:p-8 rounded-3xl border border-forest-500/40 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-800/80 border border-forest-500/50 text-emerald-400 flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Unlocking Capital for Rural Farmers</h3>
                  <div className="text-xs font-semibold text-emerald-400">
                    Onboarding Nigerian Financial & Agribusiness Partners
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  Rural Nigerian smallholders have long been locked out of formal agricultural credit. Traditional banks
                  cannot verify whether a farm physically exists, cannot monitor crop health, and view smallholder
                  lending as too risky.
                </p>
                <p>
                  <strong className="text-white">FarmTrack changes everything:</strong> We are actively on the verge of
                  onboarding Nigerian agricultural development bodies, buying alliances, and farmer cooperatives.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    icon: Sparkles,
                    title: "Derisked Smallholder Lending",
                    text: "Banks and cooperatives can inspect verified farm polygons and 18-month historical NDVI health before disbursing low-interest input loans.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Ghost-Farmer Elimination",
                    text: "100% of subsidies, fertilizers, and credit reach genuine farmers with verified boundary coordinates, preventing misallocation of funds.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Direct Economic Impact",
                    text: "Targeting rural smallholders in Edo, Ondo, Osun, and Cross River states to uplift household incomes and protect generational cocoa farmlands.",
                  },
                ].map((b) => (
                  <div key={b.title} className="flex items-start gap-3 bg-slate-800/70 p-3 rounded-xl border border-slate-700/80">
                    <b.icon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-200 leading-relaxed">
                      <strong className="text-white block font-semibold">{b.title}</strong>
                      {b.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Active Institutional Onboarding</span>
              <span>Nigeria &bull; Pan-Africa</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Team */}
      <section className="bg-slate-100/80 py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <SectionHeading
            eyebrow="Multidisciplinary Innovation"
            title="Meet the Team Behind FarmTrack"
            text="Driven by innovators and scholars from the University of Ibadan, our team unites firsthand rural agricultural insight with artificial intelligence, robust full-stack engineering, and agricultural economics."
          />

          <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.id} className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
                <TeamMemberCard member={member} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Modes */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <SectionHeading
          eyebrow="Tailored Experiences"
          title="One Unified Platform, Two Operating Modes"
          text="Whether you farm your own personal land or manage a cooperative portfolio of 5,000 hectares, FarmTrack fits your operations."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {[
            {
              icon: User,
              title: "Individual Farmer Mode",
              sub: "For independent plot owners",
              iconBox: "bg-forest-50 text-forest-600",
              check: "text-forest-600",
              link: "text-forest-600 hover:text-forest-700",
              cta: "Register Personal Account",
              points: [
                "Draw your boundary directly on high-resolution satellite basemaps",
                "Automated 5-day NDVI, NDRE, and NDMI curves going back 1.5 years",
                "Plain-language agronomic findings explaining why scores shifted",
                "Dynamic Sentinel NDVI raster overlays directly on your farm polygon",
              ],
            },
            {
              icon: Building2,
              title: "Organization / Cooperative Mode",
              sub: "For cooperatives, buying companies, NGOs & programs",
              iconBox: "bg-emerald-50 text-emerald-600",
              check: "text-emerald-600",
              link: "text-emerald-600 hover:text-emerald-700",
              cta: "Create Cooperative Workspace",
              points: [
                "Bulk import hundreds of plots via GeoJSON FeatureCollection with live validation reports",
                "Portfolio-wide dashboard with total hectares, health breakdown, and priority inspection lists",
                "Role-based team access: Owners, Admins, Managers, and Field Viewers",
                "Exportable CSV compliance audits and centralized risk alerts inbox",
              ],
            },
          ].map((m) => (
            <div key={m.title} className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-5 flex flex-col">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${m.iconBox}`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{m.title}</h3>
                  <div className="text-xs text-slate-400">{m.sub}</div>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-700 flex-1">
                {m.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${m.check}`} />
                    <span className="leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register" className={`inline-flex items-center gap-1.5 text-sm font-bold ${m.link}`}>
                {m.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-forest-900 via-forest-800 to-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Monitor Your Crop Health From Space?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Join hundreds of cocoa farmers and cooperatives tracking canopy health, preventing drought loss, and
            accessing satellite insights today.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="px-7 py-3.5 rounded-xl bg-forest-400 hover:bg-forest-300 text-forest-950 font-bold text-sm shadow-lg transition"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-100 border border-white/20 text-sm font-semibold transition"
            >
              Sign In to Your Farms
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5 text-forest-800 font-display font-extrabold text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center text-white">
              <Sprout className="w-4 h-4" />
            </div>
            <span>FarmTrack</span>
          </div>

          <div className="text-xs text-slate-500 text-center sm:text-right space-y-1">
            <p>&copy; {new Date().getFullYear()} FarmTrack Technologies Ltd. All rights reserved.</p>
            <p>Multispectral Copernicus Sentinel-2 L2A Data &bull; Calibrated for West Africa Cocoa</p>
          </div>
        </div>
      </footer>
    </div>
  );
}