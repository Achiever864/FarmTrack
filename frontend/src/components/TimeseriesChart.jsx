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
import { Info } from "lucide-react";

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

  if (!observations || observations.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-sm">
        <p>No satellite observation intervals recorded yet.</p>
        <p className="text-xs text-slate-400 mt-1">
          Historical 5-day intervals will appear here once backfill is completed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      {/* Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-base">
            Vegetation & Moisture History
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            5-day Sentinel-2 L2A observations (B04, B05, B08, B11)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Metric Selector */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => setSelectedMetric("all")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                selectedMetric === "all" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Indices
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric("ndvi")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                selectedMetric === "ndvi" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              NDVI
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric("ndre")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                selectedMetric === "ndre" ? "bg-white text-amber-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              NDRE
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric("ndmi")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                selectedMetric === "ndmi" ? "bg-white text-blue-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              NDMI
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            {["6m", "1y", "all"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md font-medium uppercase transition ${
                  timeRange === r ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
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
                    <div className="bg-slate-900/90 backdrop-blur text-white text-xs p-3 rounded-lg shadow-lg border border-slate-800 space-y-1.5">
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
      <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-500">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Honest Data Integrity:</strong> Gaps in the curves represent dates when dense cloud cover obscured satellite view (&lt; 20% clear pixels). No artificial interpolation is applied to prevent misleading inferences during heavy rainy seasons.
        </span>
      </div>
    </div>
  );
}
