export function calculatePolygonAreaHa(coordinates) {
  const ring = coordinates[0];
  if (!ring || ring.length < 4) return 0;

  const R = 6378137; // Earth radius in meters
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
  return Math.round(areaHa * 100) / 100;
}

export function calculateCentroid(coordinates) {
  const ring = coordinates[0];
  if (!ring || ring.length < 4) return [0, 0];

  let sumLng = 0;
  let sumLat = 0;
  const count = ring.length - 1;

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
 * Calculates distance between two [lat, lng] coordinates in meters
 */
export function calculateDistanceMeters(coord1, coord2) {
  if (!coord1 || !coord2) return 0;
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
