import { fetchNdvi } from "../services/sentinel.js";
// WHat this does:reads the query params, calls the service, sends the response.
const cache = new Map();

export async function getNdvi(req, res) {
  try {
    const { bbox, from, to } = req.query;

    if (!bbox || !from || !to) {
      return res.status(400).json({ error: "bbox, from, to required" });
    }

    const key = `${bbox}|${from}|${to}`;
    if (cache.has(key)) return res.type("png").send(cache.get(key));

    const img = await fetchNdvi({ bbox: bbox.split(",").map(Number), from, to });
    cache.set(key, img);

    res.type("png").send(img);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}