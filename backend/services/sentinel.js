const TOKEN_URL = "https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token";
const PROCESS_URL = "https://services.sentinel-hub.com/api/v1/process";

let token = null;
let tokenExpiry = 0;

export async function getToken() {
  if (token && Date.now() < tokenExpiry) return token;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SH_ID,
      client_secret: process.env.SH_SECRET,
    }),
  });

  if (!res.ok) throw new Error(`token ${res.status}: ${await res.text()}`);

  const data = await res.json();
  token = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return token;
}

const evalscript = `//VERSION=3
function setup() {
  return { input: ["B04", "B08", "dataMask"], output: { bands: 4 } };
}
function evaluatePixel(s) {
  const n = (s.B08 - s.B04) / (s.B08 + s.B04);
  let c;
  if (n < 0) c = [0.5, 0.5, 0.5];
  else if (n < 0.2) c = [0.8, 0.7, 0.5];
  else if (n < 0.4) c = [0.7, 0.85, 0.4];
  else if (n < 0.6) c = [0.3, 0.7, 0.2];
  else c = [0.0, 0.4, 0.1];
  return [c[0], c[1], c[2], s.dataMask];
}`;

export async function fetchNdvi({ bbox, from, to }) {
  const t = await getToken();

  const res = await fetch(PROCESS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
      Accept: "image/png",
    },
    body: JSON.stringify({
      input: {
        bounds: {
          bbox,
          properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
        },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: {
              timeRange: { from: `${from}T00:00:00Z`, to: `${to}T23:59:59Z` },
              maxCloudCoverage: 30,
              mosaickingOrder: "leastCC",
            },
          },
        ],
      },
      output: { width: 512, height: 512 },
      evalscript,
    }),
  });

  if (!res.ok) throw new Error(`process ${res.status}: ${await res.text()}`);

  return Buffer.from(await res.arrayBuffer());
}