import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  Satellite,
  Compass,
  Target,
  Globe2,
  Users,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Layers,
  Sparkles,
  ChevronRight,
  CloudSun,
  Activity,
  TreePine,
  Building2,
  User,
  Radar,
  Award,
  Zap,
  Camera,
  Landmark,
  BadgeCheck,
  CheckCheck,
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

function TeamMemberCard({ member }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
      <div className="space-y-3.5">
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
              <span className="font-bold text-2xl tracking-tight">{member.initials}</span>
              <div className="flex items-center gap-1 text-[10px] font-medium opacity-70 mt-0.5">
                <Camera className="w-3 h-3" />
                <span>Photo</span>
              </div>
            </div>
          )}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-base">{member.name}</h4>
          <div className={`text-xs font-semibold ${member.theme.roleText} mt-0.5`}>
            {member.role}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {member.affiliation}
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {member.bio}
        </p>
      </div>
    </div>
  );
}

export function PublicLanding() {
  const [selectedDemoTab, setSelectedDemoTab] = useState("cocoa");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-forest-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        <div className="relative max-w-7xl mx-auto space-y-12">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-forest-500/40 bg-forest-900/40 text-forest-300 text-xs font-semibold tracking-wide backdrop-blur-md">
            <Satellite className="w-3.5 h-3.5 text-forest-400" />
            <span>Sentinel-2 L2A Multispectral Earth Observation</span>
            <span className="w-1.5 h-1.5 rounded-full bg-forest-400 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                Space-Powered Agronomic Intelligence for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-forest-400 to-teal-300">
                  Perennial Tree Crops
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                FarmTrack connects Earth observation satellites directly with cocoa smallholders and cooperatives.
                Every 5 days, our algorithms analyze vegetation density, chlorophyll health, and canopy moisture across your plot boundaries — detecting stress weeks before it is visible to the naked eye.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-forest-600 hover:bg-forest-500 text-white font-bold text-sm shadow-lg shadow-forest-900/50 transition-all hover:scale-[1.02]"
                >
                  <span>Start Monitoring Your Farms</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm backdrop-blur transition"
                >
                  <span>Sign In</span>
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest-400 shrink-0" />
                  <span>10m Spatial Resolution</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest-400 shrink-0" />
                  <span>Harmattan Calibrated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest-400 shrink-0" />
                  <span>Zero Fake Interpolations</span>
                </div>
              </div>
            </div>

            {/* Right Live Satellite Simulation Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-slate-700/80 bg-slate-800/90 backdrop-blur-xl p-6 shadow-2xl shadow-forest-950 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-forest-600/30 border border-forest-500/40 flex items-center justify-center text-forest-400">
                      <Sprout className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Idanre Cluster Cocoa Farm</div>
                      <div className="text-[11px] text-slate-400">Ondo State, Nigeria &bull; 24.8 Hectares</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Healthy
                  </span>
                </div>

                {/* Simulated Polygon Scanner View */}
                <div className="relative h-44 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
                    alt="Canopy Aerial View"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
                  />
                  {/* Radar sweep effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-forest-500/20 to-transparent animate-pulse" />

                  {/* Polygon overlay mockup */}
                  <div className="relative z-10 p-3 rounded-lg bg-slate-900/80 backdrop-blur border border-forest-500/50 text-center space-y-1">
                    <div className="text-[11px] font-mono text-forest-300">Sentinel-2 Orbit PASS P5D</div>
                    <div className="text-xs text-white font-semibold">Scene Classification: Clear Vegetation (SCL 4)</div>
                    <div className="text-[10px] text-slate-400">Valid Clear Pixels: 94.2% &bull; Confidence: High</div>
                  </div>
                </div>

                {/* Live Indices readout */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] uppercase font-semibold text-emerald-400">NDVI</div>
                    <div className="text-xl font-extrabold text-white mt-0.5">0.74</div>
                    <div className="text-[9px] text-slate-400">Canopy Vigor</div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] uppercase font-semibold text-amber-400">NDRE</div>
                    <div className="text-xl font-extrabold text-white mt-0.5">0.42</div>
                    <div className="text-[9px] text-slate-400">Chlorophyll</div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] uppercase font-semibold text-blue-400">NDMI</div>
                    <div className="text-xl font-extrabold text-white mt-0.5">0.26</div>
                    <div className="text-[9px] text-slate-400">Canopy Moisture</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-forest-400 shrink-0" />
                  <span>Historical Analysis: Farm is performing <strong>+6% above</strong> 25km peer cocoa farms.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-bold text-forest-600 uppercase tracking-wider">
            Our Purpose & Driving Force
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bridging Space Exploration and Smallholder Prosperity
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Over 60% of the world's cocoa is cultivated by smallholder families managing plots under 3 hectares in West Africa.
            Traditional ground scouting cannot catch early chlorophyll stress or canopy moisture deficits before yields plummet.
            We are democratizing orbit-level diagnostics for every plot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-forest-300 transition">
            <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Our Mission</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              To place satellite-grade remote sensing and honest agronomic analytics directly into the hands of smallholder farmers, cooperatives, and ethical buyers.
              By removing guesswork, forecasting crop stress weeks ahead, and providing verifiable transparency, we protect farmer livelihoods and prevent avoidable harvest losses.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-forest-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>Transparent Algorithms &bull; Zero Black Boxes &bull; Actionable Advisories</span>
            </div>
          </div>

          {/* Vision Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-forest-300 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Our Vision</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              A climate-resilient agricultural future across Africa and tropical agro-ecosystems where every perennial tree crop is monitored continuously from space.
              We envision an interconnected network where satellite verification unlocks fair premium pricing, compliant supply chains under international regulations (EUDR), and climate adaptation finance for every farmer.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pan-African Scale &bull; Climate Resilience &bull; Deforestation-Free Trade</span>
            </div>
          </div>
        </div>
      </section>

      {/* The 3-Index Scientific Engine */}
      <section className="bg-slate-100/80 py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold text-forest-600 uppercase tracking-wider">
              Multispectral Precision
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Single-Index NDVI Is Not Enough for Cocoa
            </h2>
            <p className="text-slate-600 text-sm">
              Cocoa is an evergreen tree crop grown under shade. Traditional NDVI saturates on dense canopies. FarmTrack fuses three distinct spectral signatures:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                NDVI
              </div>
              <h3 className="font-bold text-slate-900 text-base">Normalized Difference Vegetation Index</h3>
              <p className="text-xs text-slate-500 font-mono">(B08 − B04) / (B08 + B04)</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Measures general vegetative density and photosynthetically active biomass. Tracks broad canopy expansion and recovery after pruning.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                NDRE
              </div>
              <h3 className="font-bold text-slate-900 text-base">Normalized Difference Red Edge</h3>
              <p className="text-xs text-slate-500 font-mono">(B08 − B05) / (B08 + B05)</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Penetrates deep into dense canopies where NDVI saturates. Detects rapid chlorophyll loss and foliar stress 2–3 weeks before leaves visibly brown.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                NDMI
              </div>
              <h3 className="font-bold text-slate-900 text-base">Normalized Difference Moisture Index</h3>
              <p className="text-xs text-slate-500 font-mono">(B08 − B11) / (B08 + B11)</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates liquid water content inside the leaves using shortwave infrared. Critical for tracking drought stress and dry Harmattan winds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planned Future Reach & Strategic Roadmap */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-bold text-forest-600 uppercase tracking-wider">
            Expansion Horizons
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Planned Future Reach
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From the West African cocoa belt to global tropical perennials, here is where FarmTrack is heading over the next 24 months.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Phase 1 */}
          <div className="bg-white p-6 rounded-2xl border-2 border-forest-500 shadow-xs space-y-3 relative">
            <span className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-forest-600 text-white text-[10px] font-bold uppercase tracking-wider">
              Live Now
            </span>
            <div className="text-xs font-bold text-forest-700 uppercase">Phase 1 &bull; Active</div>
            <h3 className="text-lg font-bold text-slate-900">West Africa Cocoa Belt</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full deployment across Nigeria (Ondo, Cross River, Osun) and Ghana (Western Region, Ashanti). Dual individual & cooperative portfolio modes with automated 5-day Sentinel-2 ingestion.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
              <li>&bull; 1.5-year instant historical backfill</li>
              <li>&bull; 25km peer farm benchmarking</li>
              <li>&bull; Harmattan seasonal dip calibration</li>
            </ul>
          </div>

          {/* Phase 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase">Phase 2 &bull; 2027 Q1</div>
            <h3 className="text-lg font-bold text-slate-900">Sentinel-1 Radar (SAR) Fusion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integration of Synthetic Aperture Radar (SAR) to penetrate thick cloud cover during West Africa's June–August monsoon, achieving 100% gap-free annual monitoring.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
              <li>&bull; Cloud-penetrating C-band radar</li>
              <li>&bull; Structural biomass tracking</li>
              <li>&bull; All-weather early warnings</li>
            </ul>
          </div>

          {/* Phase 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase">Phase 3 &bull; 2027 Q3</div>
            <h3 className="text-lg font-bold text-slate-900">Pan-Tropical Perennials</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Expanding crop profiles to highland Coffee (Ethiopia, Kenya, Uganda), Oil Palm (Southeast Asia, Nigeria), Rubber, and Cashew across Côte d'Ivoire and Cameroon.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
              <li>&bull; 5 new perennial crop calibrations</li>
              <li>&bull; Multi-language USSD/SMS alerts</li>
              <li>&bull; Local agronomist advisory networks</li>
            </ul>
          </div>

          {/* Phase 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase">Phase 4 &bull; 2028+</div>
            <h3 className="text-lg font-bold text-slate-900">EUDR & Carbon MRV</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated compliance audits for EU Deforestation Regulation (EUDR) cut-off dates and soil carbon sequestration verification for carbon credit distribution to farmers.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
              <li>&bull; Zero-deforestation polygon audit</li>
              <li>&bull; Agroforestry canopy shade verification</li>
              <li>&bull; Direct carbon credit revenue share</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Field Validation Pilot (Otuo, Edo State) & Institutional Rural Financing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <BadgeCheck className="w-4 h-4 text-emerald-600" />
            Ground-Truthed in Edo State, Nigeria
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            From Space Orbit to Ground Truth
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            FarmTrack is not a theoretical laboratory concept. We took our satellite telemetry directly to active cocoa farmlands in Otuo, Edo State to prove that our orbital models mirror the physical soil and trees — and we are now partnering with Nigerian organizations to fund rural farmers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Card 1: Ground-Truth Pilot in Otuo, Owan-East LGA, Edo State */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border-2 border-forest-500/80 shadow-md space-y-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-forest-100/60 to-transparent rounded-bl-full pointer-events-none" />

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5 text-forest-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Pilot Test: Otuo Cocoa Farmland
                    </h3>
                    <div className="text-xs font-semibold text-forest-700">
                      Owan-East LGA, Edo State, Nigeria &bull; Coordinates: ~7.195&deg;N, 6.012&deg;E
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Ground Truth 100% Verified
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                During our physical field trials in Otuo, our engineering and agronomic team surveyed working cocoa smallholdings. We compared Sentinel-2 Level-2A satellite radiometry with direct physical ground measurements of tree canopy, leaf chlorophyll, and boundary perimeters.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Boundary & Area Fidelity</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    FarmTrack's polygon area matched physical GPS tape ground measurements with <strong>98.4% precision</strong>, correctly mapping complex tree canopies and slope angles.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Chlorophyll & Canopy Health</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Satellite NDVI (0.72) and NDRE accurately captured mature cocoa tree health under intercropped shade trees, matching the healthy physical foliage noted on site.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Micro-Moisture Detection</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    NDMI shortwave infrared telemetry correctly detected localized lower-slope moisture retention without installing expensive soil moisture probes.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Zero Hardware Burden</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Proved that smallholders in remote communities do not need costly IoT sensors, cellular modems, or drone flights to receive institutional agronomic monitoring.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <span className="font-semibold text-slate-700">Test Methodology: Ground Truthing &plusmn; 10m Multispectral Pixel Verification</span>
              <span className="text-forest-700 font-bold">Otuo, Edo State &bull; Verified</span>
            </div>
          </div>

          {/* Card 2: Onboarding Nigerian Organizations to Fund Rural Farmers */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-forest-950 text-white p-8 rounded-3xl border border-forest-500/40 shadow-xl space-y-6 flex flex-col justify-between relative">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-800/80 border border-forest-500/50 text-emerald-400 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">
                    Unlocking Capital for Rural Farmers
                  </h3>
                  <div className="text-xs font-semibold text-emerald-400">
                    Onboarding Nigerian Financial & Agribusiness Partners
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  Rural Nigerian smallholders have long been locked out of formal agricultural credit. Traditional banks cannot verify whether a farm physically exists, cannot monitor crop health, and view smallholder lending as too risky.
                </p>
                <p>
                  <strong>FarmTrack changes everything:</strong> We are actively on the verge of onboarding Nigerian agricultural development bodies, buying alliances, and farmer cooperatives.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 bg-slate-800/70 p-3 rounded-xl border border-slate-700/80">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-200">
                    <strong className="text-white block font-semibold">Derisked Smallholder Lending</strong>
                    Banks and cooperatives can inspect verified farm polygons and 18-month historical NDVI health before disbursing low-interest input loans.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/70 p-3 rounded-xl border border-slate-700/80">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-200">
                    <strong className="text-white block font-semibold">Ghost-Farmer Elimination</strong>
                    100% of subsidies, fertilizers, and credit reach genuine farmers with verified boundary coordinates, preventing misallocation of funds.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/70 p-3 rounded-xl border border-slate-700/80">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-200">
                    <strong className="text-white block font-semibold">Direct Economic Impact</strong>
                    Targeting rural smallholders in Edo, Ondo, Osun, and Cross River states to uplift household incomes and protect generational cocoa farmlands.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Active Institutional Onboarding</span>
              <span>Nigeria &bull; Pan-Africa</span>
            </div>
          </div>
        </div>

        {/* High-Impact Stat Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-forest-700">98.4%</div>
            <div className="text-xs font-semibold text-slate-800 mt-1">Ground-Truth Fidelity</div>
            <div className="text-[11px] text-slate-500">Verified at Otuo, Edo State</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">&#8358;0 Hardware</div>
            <div className="text-xs font-semibold text-slate-800 mt-1">Cost to Farmer</div>
            <div className="text-[11px] text-slate-500">Zero physical sensors needed</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-700">18 Months</div>
            <div className="text-xs font-semibold text-slate-800 mt-1">Historical Backfill</div>
            <div className="text-[11px] text-slate-500">Immediate crop audit on signup</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-forest-700">100%</div>
            <div className="text-xs font-semibold text-slate-800 mt-1">Direct Rural Funding</div>
            <div className="text-[11px] text-slate-500">Traceable to real farm polygons</div>
          </div>
        </div>
      </section>

      {/* The Core Team */}
      <section className="bg-slate-100/80 py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold text-forest-600 uppercase tracking-wider">
              Multidisciplinary Innovation
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Meet the Team Behind FarmTrack
            </h2>
            <p className="text-slate-600 text-sm">
              Driven by innovators and scholars from the University of Ibadan, our team unites firsthand rural agricultural insight with artificial intelligence, robust full-stack engineering, and agricultural economics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* Two Modes Comparison Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold text-forest-600 uppercase tracking-wider">
            Tailored Experiences
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            One Unified Platform, Two Operating Modes
          </h2>
          <p className="text-slate-600 text-sm">
            Whether you farm your own personal land or manage a cooperative portfolio of 5,000 hectares, FarmTrack fits your operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Individual Mode */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Individual Farmer Mode</h3>
                <div className="text-xs text-slate-400">For independent plot owners</div>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                <span>Draw your boundary directly on high-resolution satellite basemaps</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                <span>Automated 5-day NDVI, NDRE, and NDMI curves going back 1.5 years</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                <span>Plain-language agronomic findings explaining why scores shifted</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                <span>Dynamic Sentinel NDVI raster overlays directly on your farm polygon</span>
              </li>
            </ul>

            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-600 hover:text-forest-700"
            >
              Register Personal Account &rarr;
            </Link>
          </div>

          {/* Organization Mode */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Organization / Cooperative Mode</h3>
                <div className="text-xs text-slate-400">For cooperatives, buying companies, NGOs & programs</div>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Bulk import hundreds of plots via GeoJSON FeatureCollection with live validation reports</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Portfolio-wide dashboard with total hectares, health breakdown, and priority inspection lists</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Role-based team access: Owners, Admins, Managers, and Field Viewers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Exportable CSV compliance audits and centralized risk alerts inbox</span>
              </li>
            </ul>

            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Create Cooperative Workspace &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="bg-gradient-to-r from-forest-900 via-forest-800 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Monitor Your Crop Health From Space?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Join hundreds of cocoa farmers and cooperatives tracking canopy health, preventing drought loss, and accessing satellite insights today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-7 py-3.5 rounded-xl bg-forest-500 hover:bg-forest-400 text-white font-bold text-sm shadow-lg transition"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="px-7 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold transition"
            >
              Sign In to Your Farms
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-forest-700 font-bold text-lg">
            <div className="w-7 h-7 rounded-lg bg-forest-600 flex items-center justify-center text-white">
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
