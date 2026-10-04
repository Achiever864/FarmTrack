import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { calculatePolygonAreaHa, calculateCentroid, calculateDistanceMeters } from "./geoHelper.js";
import {
  Undo2,
  RotateCcw,
  Check,
  MapPin,
  Navigation,
  Footprints,
  Loader2,
  Pin,
  Pause,
  Play,
  Trash2,
  AlertCircle,
  LocateFixed,
} from "lucide-react";

export function MapDraw({ initialCoordinates = null, onPolygonChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userLocationLayerRef = useRef(null);
  const walkLayerRef = useRef(null);

  const [points, setPoints] = useState([]); // [[lat, lng], ...]
  const [isClosed, setIsClosed] = useState(false);
  const [areaHa, setAreaHa] = useState(0);

  // Geolocation & Walk Tracking states
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isWalking, setIsWalking] = useState(false);
  const [isWalkPaused, setIsWalkPaused] = useState(false);
  const [walkStats, setWalkStats] = useState({
    distanceMeters: 0,
    accuracy: null,
    currentPos: null,
  });

  const watchIdRef = useRef(null);
  const walkTrailRef = useRef([]);
  const lastRecordedPosRef = useRef(null);
  const isWalkPausedRef = useRef(false);

  // Keep ref synchronized with state for geolocation callback
  useEffect(() => {
    isWalkPausedRef.current = isWalkPaused;
  }, [isWalkPaused]);

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

    markersLayerRef.current = L.layerGroup().addTo(map);
    userLocationLayerRef.current = L.layerGroup().addTo(map);
    walkLayerRef.current = L.layerGroup().addTo(map);

    map.on("click", (e) => {
      // Disallow clicking map if in active walk tracking mode or polygon closed
      if (isWalking) return;
      setPoints((prev) => {
        if (isClosed) return prev;
        const next = [...prev, [e.latlng.lat, e.latlng.lng]];
        return next;
      });
    });

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
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

      if (isFirst && !isClosed && points.length >= 3 && !isWalking) {
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
        color: isWalking ? "#10b981" : "#3b82f6",
        weight: isWalking ? 3.5 : 2,
        dashArray: isWalking ? undefined : "4, 6",
      }).addTo(map);
      polygonLayerRef.current = polyline;
    }
  }, [points, isClosed, isWalking]);

  function closePolygon() {
    if (points.length < 3) return;
    setIsClosed(true);
  }

  function handleUndo() {
    if (isWalking) return;
    if (isClosed) {
      setIsClosed(false);
      return;
    }
    setPoints((prev) => prev.slice(0, -1));
  }

  function handleReset() {
    if (isWalking) {
      discardWalk();
      return;
    }
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

  // --- Feature 1: Find My Location ---
  function handleFindLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const map = mapInstanceRef.current;
        if (!map) return;

        // Smoothly fly to user position
        map.flyTo([latitude, longitude], 17, { animate: true, duration: 1.2 });

        // Render distinct location pulse and accuracy ring
        if (userLocationLayerRef.current) {
          userLocationLayerRef.current.clearLayers();

          const accuracyCircle = L.circle([latitude, longitude], {
            radius: Math.max(accuracy, 12),
            color: "#3b82f6",
            fillColor: "#60a5fa",
            fillOpacity: 0.15,
            weight: 1.5,
          });

          const locationMarker = L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: "#2563eb",
            color: "#ffffff",
            weight: 2.5,
            opacity: 1,
            fillOpacity: 1,
          }).bindPopup(`
            <div class="text-xs p-1">
              <strong class="text-slate-900 block font-bold">Your Current GPS Location</strong>
              <span class="text-slate-500">Accuracy: &plusmn;${Math.round(accuracy)} meters</span>
            </div>
          `);

          userLocationLayerRef.current.addLayer(accuracyCircle);
          userLocationLayerRef.current.addLayer(locationMarker);
        }
      },
      (err) => {
        setLocating(false);
        let msg = "Could not retrieve your location. Please check browser GPS permissions.";
        if (err.code === 1) msg = "Location permission denied. Please allow location access in your browser settings.";
        else if (err.code === 2) msg = "GPS position unavailable. Please ensure location services are enabled.";
        else if (err.code === 3) msg = "Location request timed out. Please try again.";
        setLocationError(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }

  // --- Feature 2: Walk to Map (Field Walk Boundary Tracking) ---
  function startWalkingBoundary() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is required for walk boundary tracking.");
      return;
    }

    // Reset previous drawing
    setPoints([]);
    setIsClosed(false);
    setAreaHa(0);
    setLocationError(null);
    walkTrailRef.current = [];
    lastRecordedPosRef.current = null;

    setIsWalking(true);
    setIsWalkPaused(false);
    setWalkStats({ distanceMeters: 0, accuracy: null, currentPos: null });

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const currentCoord = [latitude, longitude];

        // Update live user marker on map
        setWalkStats((prev) => ({
          ...prev,
          accuracy: Math.round(accuracy),
          currentPos: currentCoord,
        }));

        const map = mapInstanceRef.current;
        if (map && walkLayerRef.current) {
          walkLayerRef.current.clearLayers();

          // Render live pulsing walker marker
          const walkerMarker = L.circleMarker(currentCoord, {
            radius: 9,
            fillColor: "#10b981",
            color: "#ffffff",
            weight: 3,
            opacity: 1,
            fillOpacity: 1,
          }).bindTooltip("Tracking live steps...", { permanent: false, direction: "top" });

          const walkerAccuracy = L.circle(currentCoord, {
            radius: Math.max(accuracy, 6),
            color: "#10b981",
            fillColor: "#34d399",
            fillOpacity: 0.12,
            weight: 1,
          });

          walkLayerRef.current.addLayer(walkerAccuracy);
          walkLayerRef.current.addLayer(walkerMarker);
        }

        // If paused, do not record steps into perimeter
        if (isWalkPausedRef.current) return;

        // Jitter filter: check distance from last recorded point
        const lastPos = lastRecordedPosRef.current;
        if (!lastPos) {
          // First point: record immediately and center map
          walkTrailRef.current = [currentCoord];
          lastRecordedPosRef.current = currentCoord;
          setPoints([currentCoord]);
          if (map) map.setView(currentCoord, 18);
        } else {
          const stepDist = calculateDistanceMeters(lastPos, currentCoord);
          // Only record if moved at least 3.5 meters (avoids stationary GPS jitter)
          if (stepDist >= 3.5) {
            walkTrailRef.current.push(currentCoord);
            lastRecordedPosRef.current = currentCoord;

            setWalkStats((prev) => ({
              ...prev,
              distanceMeters: Math.round(prev.distanceMeters + stepDist),
            }));

            setPoints([...walkTrailRef.current]);

            // Keep map in view
            if (map && !map.getBounds().contains(currentCoord)) {
              map.panTo(currentCoord);
            }
          }
        }
      },
      (err) => {
        console.error("Walk GPS error:", err);
        setLocationError("GPS signal dropped or paused during walk tracking.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000,
      }
    );

    watchIdRef.current = watchId;
  }

  // Pin a manual corner point at sharp boundary corners regardless of threshold
  function pinCornerPoint() {
    if (!isWalking || !walkStats.currentPos) return;
    const currentCoord = walkStats.currentPos;
    const lastPos = lastRecordedPosRef.current;
    const stepDist = lastPos ? calculateDistanceMeters(lastPos, currentCoord) : 0;

    walkTrailRef.current.push(currentCoord);
    lastRecordedPosRef.current = currentCoord;

    setWalkStats((prev) => ({
      ...prev,
      distanceMeters: Math.round(prev.distanceMeters + stepDist),
    }));

    setPoints([...walkTrailRef.current]);
  }

  function togglePauseWalk() {
    setIsWalkPaused((prev) => !prev);
  }

  function finishWalkBoundary() {
    if (walkTrailRef.current.length < 3) {
      alert("At least 3 boundary vertices are required to close a farm polygon. Keep walking along the boundary perimeter.");
      return;
    }

    // Stop GPS watch
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (walkLayerRef.current) {
      walkLayerRef.current.clearLayers();
    }

    setIsWalking(false);
    setIsWalkPaused(false);
    closePolygon();
  }

  function discardWalk() {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (walkLayerRef.current) {
      walkLayerRef.current.clearLayers();
    }
    setIsWalking(false);
    setIsWalkPaused(false);
    walkTrailRef.current = [];
    lastRecordedPosRef.current = null;
    setPoints([]);
    setIsClosed(false);
    setAreaHa(0);
    setWalkStats({ distanceMeters: 0, accuracy: null, currentPos: null });
    if (onPolygonChange) onPolygonChange(null);
  }

  return (
    <div className="space-y-3">
      {/* Top Action & Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Complete / Status button */}
          {!isClosed ? (
            <button
              type="button"
              disabled={points.length < 3 || isWalking}
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

          {/* Find My Location Button */}
          <button
            type="button"
            onClick={handleFindLocation}
            disabled={locating || isWalking}
            title="Center map on your current GPS location"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-50 text-xs font-semibold transition"
          >
            {locating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-forest-600" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5 text-forest-600" />
            )}
            <span>{locating ? "Locating..." : "Find My Location"}</span>
          </button>

          {/* Walk Boundary Mode Toggle */}
          {!isWalking ? (
            <button
              type="button"
              onClick={startWalkingBoundary}
              disabled={isClosed}
              title="Walk the farm perimeter with your phone to record boundaries automatically"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold shadow-xs transition"
            >
              <Footprints className="w-3.5 h-3.5 text-emerald-300" />
              <span>Walk to Map Boundary</span>
            </button>
          ) : null}

          {/* Standard manual drawing controls */}
          {!isWalking && (
            <>
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
            </>
          )}
        </div>

        {/* Calculated Area Gauge */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Calculated Area:</span>
            <span className="font-bold text-slate-800 text-sm">{areaHa.toFixed(2)} ha</span>
          </div>

          {areaHa > 0 && areaHa < 0.5 && (
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
              Notice: Under 0.5 ha has higher pixel edge noise.
            </span>
          )}
        </div>
      </div>

      {/* Geolocation Notice / Error banner */}
      {locationError && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Preset cocoa jump points */}
      <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto pb-1">
        <span className="flex items-center gap-1 font-medium text-slate-600 shrink-0">
          <MapPin className="w-3.5 h-3.5 text-forest-600" /> Jump to:
        </span>
        <button
          type="button"
          onClick={() => jumpToRegion(7.195, 6.012, "Otuo, Edo State")}
          className="px-2.5 py-1 rounded-md bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200 font-semibold shrink-0 transition"
        >
          Otuo Pilot Farm (Edo State, Nigeria)
        </button>
        <button
          type="button"
          onClick={() => jumpToRegion(7.098, 5.056, "Ondo, Nigeria")}
          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
        >
          Ondo Cocoa Belt (Nigeria)
        </button>
        <button
          type="button"
          onClick={() => jumpToRegion(6.215, -2.486, "Sefwi Wiawso, Ghana")}
          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
        >
          Western Region (Ghana)
        </button>
        <button
          type="button"
          onClick={() => jumpToRegion(6.827, -5.289, "Yamoussoukro, Côte d'Ivoire")}
          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
        >
          Yamoussoukro (Côte d'Ivoire)
        </button>
      </div>

      {/* Map Viewport & Overlay HUDs */}
      <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-slate-300 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Walk Tracking Floating HUD */}
        {isWalking && (
          <div className="absolute top-4 left-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl border border-emerald-500/40 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isWalkPaused ? "bg-amber-400" : "bg-emerald-400"} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isWalkPaused ? "bg-amber-500" : "bg-emerald-500"}`} />
                </span>
                <span className="font-bold text-xs tracking-wider uppercase text-emerald-400">
                  {isWalkPaused ? "GPS Tracking Paused" : "Live GPS Field Walk Active"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div>
                  <span className="text-slate-400">Vertices: </span>
                  <strong className="text-white">{points.length}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Distance: </span>
                  <strong className="text-white">{walkStats.distanceMeters} m</strong>
                </div>
                {walkStats.accuracy !== null && (
                  <div>
                    <span className="text-slate-400">GPS Accuracy: </span>
                    <strong className="text-emerald-300">&plusmn;{walkStats.accuracy}m</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Walk action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={pinCornerPoint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-semibold shadow-xs transition"
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>Pin Corner Here</span>
                </button>

                <button
                  type="button"
                  onClick={togglePauseWalk}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                >
                  {isWalkPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isWalkPaused ? "Resume Walk" : "Pause Walk"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={finishWalkBoundary}
                  disabled={points.length < 3}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow-md transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Finish & Close Polygon</span>
                </button>

                <button
                  type="button"
                  onClick={discardWalk}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-medium transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Discard</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state guidance */}
        {!isWalking && points.length === 0 && (
          <div className="absolute top-4 left-4 z-20 bg-slate-900/85 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl text-xs shadow-lg max-w-sm border border-slate-700/60 pointer-events-none">
            <p className="font-semibold text-emerald-300 mb-0.5">Two Ways to Map Your Farm Boundary:</p>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>&bull; <strong>Click on Map:</strong> Click points around your boundary to draw manually.</li>
              <li>&bull; <strong>Walk to Map:</strong> Click "Walk to Map Boundary" and walk your farm's perimeter.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

