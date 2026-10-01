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
} from "lucide-react";

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

      {/* The Core Team */}
      <section className="bg-slate-100/80 py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold text-forest-600 uppercase tracking-wider">
              Multidisciplinary Expertise
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Meet the Team Behind FarmTrack
            </h2>
            <p className="text-slate-600 text-sm">
              We bring together agronomic field scientists, aerospace remote-sensing researchers, and software engineers committed to agricultural equity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-forest-100 border-2 border-forest-300 mx-auto flex items-center justify-center text-forest-800 font-bold text-xl shadow-xs">
                AA
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Dr. Aisha Alabi</h4>
                <div className="text-xs font-semibold text-forest-700">Chief Agronomist</div>
                <div className="text-[11px] text-slate-400 mt-0.5">PhD Tree Crop Physiology &bull; CRIN Fellow</div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Over 16 years investigating cocoa physiology, shade tree agroforestry, and Harmattan drought response mechanisms in Ondo State.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 mx-auto flex items-center justify-center text-emerald-800 font-bold text-xl shadow-xs">
                MO
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Michael Osei</h4>
                <div className="text-xs font-semibold text-emerald-700">Lead Geospatial Engineer</div>
                <div className="text-[11px] text-slate-400 mt-0.5">MSc Remote Sensing &bull; Ex-ESA Earth Observation</div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Specialist in Copernicus Sentinel constellation processing, custom radiometric evalscripts, and cloud masking algorithms.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-teal-100 border-2 border-teal-300 mx-auto flex items-center justify-center text-teal-800 font-bold text-xl shadow-xs">
                CE
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Chioma Eze</h4>
                <div className="text-xs font-semibold text-teal-700">Systems Architect</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Distributed Data Systems & Tenancy</div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Architect of our concurrency-controlled queue pipelines, spatial indexing, and strict tenancy security protocols.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-300 mx-auto flex items-center justify-center text-amber-800 font-bold text-xl shadow-xs">
                DM
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">David Mensah</h4>
                <div className="text-xs font-semibold text-amber-700">Cooperative Lead</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Agricultural Extension & Partnerships</div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Leading deployment across 45+ farmer cooperatives in Ghana and Nigeria to ensure tools match real smallholder workflows.
              </p>
            </div>
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
