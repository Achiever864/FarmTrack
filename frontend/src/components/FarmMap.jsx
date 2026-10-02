import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Layers, Eye, EyeOff } from "lucide-react";
import { api } from "../api/client.js";

export function FarmMap({ farm, healthStatus = "healthy" }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const ndviLayerRef = useRef(null);
  const [showNdviOverlay, setShowNdviOverlay] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || !farm?.geometry?.coordinates) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const ring = farm.geometry.coordinates[0];
    const latLngs = ring.map((pt) => [pt[1], pt[0]]);

    // Calculate bounds
    const bounds = L.latLngBounds(latLngs);
    const map = L.map(mapContainerRef.current).fitBounds(bounds, { padding: [30, 30] });
    mapInstanceRef.current = map;

    // Base satellite imagery
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri",
      maxZoom: 19,
    }).addTo(map);

    // Color by health
    const statusColors = {
      healthy: { color: "#16a34a", fill: "#22c55e" },
      watch: { color: "#d97706", fill: "#f59e0b" },
      at_risk: { color: "#dc2626", fill: "#ef4444" },
      insufficient_data: { color: "#2563eb", fill: "#3b82f6" },
    };
    const c = statusColors[healthStatus] || statusColors.healthy;

    // Draw boundary polygon
    const poly = L.polygon(latLngs, {
      color: c.color,
      fillColor: c.fill,
      fillOpacity: 0.35,
      weight: 3,
    }).addTo(map);

    poly.bindPopup(`
      <div style="font-family: sans-serif; font-size: 13px;">
        <strong>${farm.name}</strong><br/>
        Crop: ${farm.cropType || "Cocoa"}<br/>
        Area: ${farm.areaHa} ha<br/>
        Health: <strong>${healthStatus.replace("_", " ").toUpperCase()}</strong>
      </div>
    `);

    // Centroid marker
    if (farm.centroid?.coordinates) {
      const [lng, lat] = farm.centroid.coordinates;
      L.circleMarker([lat, lng], {
        radius: 6,
        fillColor: "#ffffff",
        color: c.color,
        weight: 3,
        fillOpacity: 1,
      }).addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [farm, healthStatus]);

  // Handle NDVI raster overlay toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !farm?.geometry?.coordinates) return;

    if (!showNdviOverlay) {
      if (ndviLayerRef.current) {
        map.removeLayer(ndviLayerRef.current);
        ndviLayerRef.current = null;
      }
      return;
    }

    setOverlayLoading(true);

    const ring = farm.geometry.coordinates[0];
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    for (const [lng, lat] of ring) {
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    }

    const bbox = [minLng, minLat, maxLng, maxLat];
    const to = new Date().toISOString().slice(0, 10);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 45); // last 45 days
    const from = fromDate.toISOString().slice(0, 10);

    const overlayUrl = api.ndvi.getOverlayUrl({ bbox, from, to });
    const imageBounds = [[minLat, minLng], [maxLat, maxLng]];

    const imageOverlay = L.imageOverlay(overlayUrl, imageBounds, {
      opacity: 0.75,
      interactive: false,
    });

    imageOverlay.on("load", () => setOverlayLoading(false));
    imageOverlay.on("error", () => {
      setOverlayLoading(false);
      console.warn("Could not load Sentinel NDVI image overlay.");
    });

    imageOverlay.addTo(map);
    ndviLayerRef.current = imageOverlay;

    return () => {
      if (ndviLayerRef.current && map) {
        map.removeLayer(ndviLayerRef.current);
        ndviLayerRef.current = null;
      }
    };
  }, [showNdviOverlay, farm]);

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Overlay Toggle Control */}
      <div className="absolute top-3 right-3 z-20">
        <button
          type="button"
          onClick={() => setShowNdviOverlay(!showNdviOverlay)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition ${
            showNdviOverlay
              ? "bg-forest-600 text-white hover:bg-forest-700"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{showNdviOverlay ? "Hide NDVI Overlay" : "Show NDVI Overlay"}</span>
          {overlayLoading && <span className="animate-spin text-xs">⏳</span>}
        </button>
      </div>
    </div>
  );
}
