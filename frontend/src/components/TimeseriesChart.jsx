import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { Info, Activity } from "lucide-react";

function Segmented({ options, value, onChange, activeClass = "text-slate-800" }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 text-xs shrink-0">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
            value === o.value
              ? `bg-white shadow-xs ${o.activeClass || activeClass}`
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ReadingTile({ label, hint, value, tone }) {
  const tones = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
  }[tone];

  return (
    <div className={`rounded-xl border p-3 ${tones}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider">{label}</div>
      <div className="font-display text-xl font-extrabold tabular mt-0.5">
        {value != null ? Number(value).toFixed(2) : "—"}
      </div>
      <div className="text-[10px] text-slate-500 mt-0.5">{hint}</div>
    </div>
  );
}

export function TimeseriesChart({ observations = [] }) {
  const [timeRange, setTimeRange] = useState("1y"); // "6m" | "1y" | "all"
  const [selectedMetric, setSelectedMetric] = useState("all"); // "all" | "ndvi" | "ndre" | "ndmi"

  const filteredData = useMemo(() => {
    if (!observations || observations.length === 0) return [];

    let cutoffDate = null;
    const now = new Date();
    if (timeRange === "6m") {
      cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
    } else if (timeRange === "1y") {
      cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
    }

    return observations
      .filter((o) => (!cutoffDate ? true : new Date(o.obsDate) >= cutoffDate))
      .map((o) => ({
        date: new Date(o.obsDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "2-digit",
        }),
        fullDate: new Date(o.obsDate).toISOString().slice(0, 10),
        ndvi: o.ndviMean != null ? Number(o.ndviMean) : null,
        ndre: o.ndreMean != null ? Number(o.ndreMean) : null,
        ndmi: o.ndmiMean != null ? Number(o.ndmiMean) : null,
        validPct:
          o.totalPixels > 0 ? Math.round((o.validPixels / o.totalPixels) * 100) : 0,
      }));
  }, [observations, timeRange]);

  // Latest reading (presentation only, derived from the same observations prop)
  const latest = useMemo(() => {
    if (!observations || observations.length === 0) return null;
    for (let i = observations.length - 1; i >= 0; i--) {
      if (observations[i].ndviMean != null) return observations[i];
    }
    return null;
  }, [observations]);

  if (!observations || observations.length === 0) {
    return (
      <div className="min-h-64 flex flex-col items-center justify-center text-center border border-dashed border-slate-300 rounded-2xl bg-white text-slate-500 text-sm p-8 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
          <Activity className="w-6 h-6" />
        </div>
        <p className="font-semibold text-slate-700">No satellite observations recorded yet</p>
        <p className="text-xs text-slate-400 max-w-xs">
          Historical 5-day intervals will appear here once the backfill is completed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-5">
      {/* Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-base">Vegetation & Moisture History</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            5-day Sentinel-2 L2A observations (B04, B05, B08, B11)
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 lg:mx-0 lg:px-0 lg:pb-0">
          <Segmented
            value={selectedMetric}
            onChange={setSelectedMetric}
            options={[
              { value: "all", label: "All" },
              { value: "ndvi", label: "NDVI", activeClass: "text-emerald-700" },
              { value: "ndre", label: "NDRE", activeClass: "text-amber-700" },
              { value: "ndmi", label: "NDMI", activeClass: "text-blue-700" },
            ]}
          />
          <Segmented
            value={timeRange}
            onChange={setTimeRange}
            options={[
              { value: "6m", label: "6M" },
              { value: "1y", label: "1Y" },
              { value: "all", label: "All time" },
            ]}
          />
        </div>
      </div>

      {/* Latest readings */}
      {latest && (
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Latest reading &bull; {new Date(latest.obsDate).toISOString().slice(0, 10)}
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <ReadingTile label="NDVI" hint="Canopy vigor" value={latest.ndviMean} tone="emerald" />
            <ReadingTile label="NDRE" hint="Chlorophyll" value={latest.ndreMean} tone="amber" />
            <ReadingTile label="NDMI" hint="Canopy moisture" value={latest.ndmiMean} tone="blue" />
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="h-64 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 10, right: 16, left: -14, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              minTickGap={28}
            />
            <YAxis
              domain={[0, 1]}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 backdrop-blur text-white text-xs p-3 rounded-xl shadow-lg border border-slate-800 space-y-1.5">
                      <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
                        {data.fullDate}
                      </div>
                      {data.ndvi != null && (
                        <div className="flex items-center justify-between gap-4 text-emerald-400">
                          <span>NDVI (Greenness):</span>
                          <span className="font-mono font-bold">{data.ndvi.toFixed(3)}</span>
                        </div>
                      )}
                      {data.ndre != null && (
                        <div className="flex items-center justify-between gap-4 text-amber-400">
                          <span>NDRE (Chlorophyll):</span>
                          <span className="font-mono font-bold">{data.ndre.toFixed(3)}</span>
                        </div>
                      )}
                      {data.ndmi != null && (
                        <div className="flex items-center justify-between gap-4 text-blue-400">
                          <span>NDMI (Moisture):</span>
                          <span className="font-mono font-bold">{data.ndmi.toFixed(3)}</span>
                        </div>
                      )}
                      <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-800">
                        Usable Clear Pixels: {data.validPct}%
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
            />

            {/* Threshold Reference Lines */}
            <ReferenceLine y={0.55} stroke="#16a34a" strokeDasharray="3 3" opacity={0.4} />
            <ReferenceLine y={0.12} stroke="#3b82f6" strokeDasharray="3 3" opacity={0.3} />

            {/* Lines with connectNulls=false to show cloud gaps honestly */}
            {(selectedMetric === "all" || selectedMetric === "ndvi") && (
              <Line
                type="monotone"
                dataKey="ndvi"
                name="NDVI (Canopy Vigor)"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: "#16a34a" }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            )}

            {(selectedMetric === "all" || selectedMetric === "ndre") && (
              <Line
                type="monotone"
                dataKey="ndre"
                name="NDRE (Chlorophyll / Stress)"
                stroke="#d97706"
                strokeWidth={2}
                dot={{ r: 2, fill: "#d97706" }}
                activeDot={{ r: 4 }}
                connectNulls={false}
              />
            )}

            {(selectedMetric === "all" || selectedMetric === "ndmi") && (
              <Line
                type="monotone"
                dataKey="ndmi"
                name="NDMI (Canopy Moisture)"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 2, fill: "#2563eb" }}
                activeDot={{ r: 4 }}
                connectNulls={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cloud Gap Notice */}
      <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-600">Honest data integrity:</strong> gaps in the curves represent dates when
          dense cloud cover obscured the satellite view (&lt; 20% clear pixels). No artificial interpolation is applied,
          so heavy rainy seasons are never misrepresented.
        </span>
      </div>
    </div>
  );
}