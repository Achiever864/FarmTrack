import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { calculatePolygonAreaHa, calculateCentroid } from "./geoHelper.js";
import { Undo2, RotateCcw, Check, MapPin } from "lucide-react";

export function MapDraw({ initialCoordinates = null, onPolygonChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [points, setPoints] = useState([]); // [[lat, lng], ...]
  const [isClosed, setIsClosed] = useState(false);
  const [areaHa, setAreaHa] = useState(0);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: West Africa cocoa belt (Ondo, Nigeria ~ 7.10, 5.05)
    const map = L.map(mapContainerRef.current).setView([7.10, 5.05], 13);
    mapInstanceRef.current = map;

    // Base satellite / hybrid map tile layer
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      maxZoom: 19,
    }).addTo(map);

    // Overlay labels for context
    L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    map.on("click", (e) => {
      setPoints((prev) => {
        if (isClosed) return prev;
        const next = [...prev, [e.latlng.lat, e.latlng.lng]];
        return next;
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update polygon and markers whenever points or isClosed state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markersLayerRef.current) markersLayerRef.current.clearLayers();
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    if (points.length === 0) {
      setAreaHa(0);
      if (onPolygonChange) onPolygonChange(null);
      return;
    }

    // Draw vertex markers
    points.forEach((pt, idx) => {
      const isFirst = idx === 0;
      const marker = L.circleMarker(pt, {
        radius: isFirst && !isClosed ? 8 : 5,
        fillColor: isFirst ? "#22c55e" : "#3b82f6",
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      });

      if (isFirst && !isClosed && points.length >= 3) {
        marker.bindTooltip("Click to close polygon", { permanent: true, direction: "top" });
        marker.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          closePolygon();
        });
      }

      markersLayerRef.current.addLayer(marker);
    });

    // Draw line or polygon
    if (isClosed && points.length >= 3) {
      const closedPoints = [...points, points[0]];
      const poly = L.polygon(closedPoints, {
        color: "#16a34a",
        fillColor: "#22c55e",
        fillOpacity: 0.35,
        weight: 3,
      }).addTo(map);
      polygonLayerRef.current = poly;

      // Convert [lat, lng] to GeoJSON [lng, lat]
      const geoJsonCoords = closedPoints.map((p) => [p[1], p[0]]);
      const area = calculatePolygonAreaHa([geoJsonCoords]);
      const centroid = calculateCentroid([geoJsonCoords]);
      setAreaHa(area);

      if (onPolygonChange) {
        onPolygonChange({
          geometry: {
            type: "Polygon",
            coordinates: [geoJsonCoords],
          },
          areaHa: area,
          centroid,
        });
      }
    } else if (points.length >= 2) {
      const polyline = L.polyline(points, {
        color: "#3b82f6",
        weight: 2,
        dashArray: "4, 6",
      }).addTo(map);
      polygonLayerRef.current = polyline;
    }
  }, [points, isClosed]);

  function closePolygon() {
    if (points.length < 3) return;
    setIsClosed(true);
  }

  function handleUndo() {
    if (isClosed) {
      setIsClosed(false);
      return;
    }
    setPoints((prev) => prev.slice(0, -1));
  }

  function handleReset() {
    setPoints([]);
    setIsClosed(false);
    setAreaHa(0);
    if (onPolygonChange) onPolygonChange(null);
  }

  function jumpToRegion(lat, lng, name) {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 14);
    }
  }

  return (
    <div className="space-y-3">
      {/* Controls & Area Gauge */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          {!isClosed ? (
            <button
              type="button"
              disabled={points.length < 3}
              onClick={closePolygon}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition"
            >
              <Check className="w-4 h-4" />
              Complete Boundary ({points.length} vertices)
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <Check className="w-4 h-4 text-emerald-600" />
              Polygon Closed
            </span>
          )}

          <button
            type="button"
            disabled={points.length === 0}
            onClick={handleUndo}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 text-xs font-medium transition"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Undo Point
          </button>

          <button
            type="button"
            disabled={points.length === 0}
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 disabled:opacity-40 text-xs font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Calculated Area:</span>
            <span className="font-bold text-slate-800 text-sm">{areaHa.toFixed(2)} ha</span>
          </div>

          {areaHa > 0 && areaHa < 0.5 && (
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Notice: Under 0.5 ha has higher pixel edge noise.
            </span>
          )}
        </div>
      </div>

      {/* Preset cocoa jump points */}
      <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto pb-1">
        <span className="flex items-center gap-1 font-medium text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-forest-600" /> Jump to:
        </span>
        <button
          type="button"
          onClick={() => jumpToRegion(7.098, 5.056, "Ondo, Nigeria")}
          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Ondo Cocoa Belt (Nigeria)
        </button>
        <button
          type="button"
          onClick={() => jumpToRegion(6.215, -2.486, "Sefwi Wiawso, Ghana")}
          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Western Region (Ghana)
        </button>
        <button
          type="button"
          onClick={() => jumpToRegion(6.827, -5.289, "Yamoussoukro, Côte d'Ivoire")}
          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Yamoussoukro (Côte d'Ivoire)
        </button>
      </div>

      {/* Map viewport */}
      <div className="relative w-full h-[480px] rounded-xl overflow-hidden border border-slate-300 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />

        {points.length === 0 && (
          <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur text-white px-3 py-2 rounded-lg text-xs shadow pointer-events-none">
            Click points on the map around your cocoa farm boundary to draw the polygon.
          </div>
        )}
      </div>
    </div>
  );
}
