/**
 * Calculates the spherical excess area of a GeoJSON polygon in square meters.
 * Earth radius = 6378137 meters (WGS84 ellipsoid mean radius).
 */
export function calculatePolygonAreaHa(coordinates) {
  const ring = coordinates[0];
  if (!ring || ring.length < 4) return 0;

  const R = 6378137; // meters
  let total = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const p1 = ring[i];
    const p2 = ring[i + 1];

    const lambda1 = (p1[0] * Math.PI) / 180;
    const phi1 = (p1[1] * Math.PI) / 180;
    const lambda2 = (p2[0] * Math.PI) / 180;
    const phi2 = (p2[1] * Math.PI) / 180;

    total += (lambda2 - lambda1) * (2 + Math.sin(phi1) + Math.sin(phi2));
  }

  const areaSqM = Math.abs((total * R * R) / 2);
  const areaHa = areaSqM / 10000;
  return Math.round(areaHa * 100) / 100; // round to 2 decimals
}

/**
 * Calculates the centroid [lng, lat] of a polygon ring.
 */
export function calculateCentroid(coordinates) {
  const ring = coordinates[0];
  if (!ring || ring.length < 4) return [0, 0];

  let sumLng = 0;
  let sumLat = 0;
  const count = ring.length - 1; // exclude duplicate closing vertex

  for (let i = 0; i < count; i++) {
    sumLng += ring[i][0];
    sumLat += ring[i][1];
  }

  return [
    Math.round((sumLng / count) * 1000000) / 1000000,
    Math.round((sumLat / count) * 1000000) / 1000000,
  ];
}

/**
 * Validates a GeoJSON polygon ring.
 * - Must have type === 'Polygon'
 * - Ring must be closed (first coordinate equals last)
 * - Longitude [-180, 180], Latitude [-90, 90]
 * - Minimum 3 distinct vertices (4 coordinates total)
 * - Area within bounds (0.01 ha to 50,000 ha)
 */
export function validatePolygon(geometry) {
  if (!geometry || typeof geometry !== "object") {
    return { valid: false, error: "Geometry must be an object" };
  }

  if (geometry.type !== "Polygon") {
    return { valid: false, error: "Geometry type must be 'Polygon'" };
  }

  if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
    return { valid: false, error: "Polygon must contain at least one ring of coordinates" };
  }

  const ring = geometry.coordinates[0];
  if (!Array.isArray(ring) || ring.length < 4) {
    return {
      valid: false,
      error: "Exterior ring must contain at least 4 coordinates (3 unique vertices + closing point)",
    };
  }

  const first = ring[0];
  const last = ring[ring.length - 1];

  // Check valid numbers
  for (let i = 0; i < ring.length; i++) {
    const pt = ring[i];
    if (!Array.isArray(pt) || pt.length < 2 || typeof pt[0] !== "number" || typeof pt[1] !== "number") {
      return { valid: false, error: `Invalid coordinate at index ${i}` };
    }
    const [lng, lat] = pt;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return {
        valid: false,
        error: `Coordinate [${lng}, ${lat}] out of bounds (lng: -180..180, lat: -90..90)`,
      };
    }
  }

  // Check closed ring
  const isClosed = Math.abs(first[0] - last[0]) < 1e-7 && Math.abs(first[1] - last[1]) < 1e-7;
  if (!isClosed) {
    return { valid: false, error: "Polygon ring is not closed (first point must equal last point)" };
  }

  const areaHa = calculatePolygonAreaHa(geometry.coordinates);
  if (areaHa <= 0) {
    return { valid: false, error: "Polygon area must be greater than 0" };
  }
  if (areaHa > 50000) {
    return { valid: false, error: `Polygon area (${areaHa} ha) exceeds maximum allowed (50,000 ha)` };
  }

  const centroid = calculateCentroid(geometry.coordinates);

  return { valid: true, areaHa, centroid };
}
