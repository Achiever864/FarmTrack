# FarmTrack: Satellite Crop Monitoring System

FarmTrack is an enterprise-grade satellite vegetation and crop health monitoring platform tailored specifically for perennial tree crops (with primary calibration for **Cocoa** in the West African cocoa belt, extensible to coffee, oil palm, rubber, and cashew).

The system operates in **two seamless modes**:
1. **Individual Mode:** Single farmers register and monitor their personal cocoa plots, track multi-year historical vegetation vigor, and receive early stress and drought warnings.
2. **Organization Mode:** Cooperatives, buying companies, NGOs, and sustainability programs register hundreds of member farms, manage team roles (Owner, Admin, Manager, Viewer), view portfolio health aggregates and risk rankings, and export CSV compliance audits.

---

## Architecture & Data Flow

```
User / Organization draws or imports farm boundary (GeoJSON Polygon)
                        ↓
Node.js Express backend validates closed ring, coordinate order [lng, lat], spherical area
                        ↓
Async Queue triggers historical backfill (1.5 years) or daily Cron Delta Sync
                        ↓
Sentinel Hub Statistical API (POST /api/v1/statistics with B04, B05, B08, B11, SCL)
                        ↓
Idempotent upsert into MongoDB `observations` (filtering cloudy dates with < 20% valid pixels)
                        ↓
Inference Layer (`services/analysis`):
  • Crop Health vs own history (same 30-day season window in prior years)
  • Crop Health vs 25km peer cocoa farms (2dsphere index)
  • Early warning: NDRE chlorophyll drop while NDVI lags
  • Moisture: NDMI drought deficit
  • Spatial patchiness: NDVI standard deviation across plot
  • Harmattan seasonal dry-dip context (Nigeria/Ghana Dec-Feb expected dips)
  • Confidence score (based on plot area and valid pixel density)
                        ↓
Deduplicated Alerts Engine (Stress, Drought, Decline, Patchiness)
                        ↓
Modern React Frontend (Interactive Leaflet boundary drawing, Sentinel NDVI raster toggle, honest cloud-gap Recharts time-series)
```

---

## Agronomic Calibration: The Cocoa Reality

Unlike annual grain crops (corn, wheat), **cocoa is a perennial, evergreen shade tree crop**:
- **NDVI does not show annual emergence-to-harvest curve:** Cocoa canopy stays high year-round. Growth/phenology combines **tree age / planting date** (seedling, establishing, mature, old/declining) with seasonal context, not curve shape alone.
- **Harmattan Dry Season (Dec–Feb):** West African cocoa experiences natural dry winds and canopy thinning. The system accounts for this expected seasonal dip and compares each farm to its **own same-period history** and **nearby peers** so normal dry seasons are not falsely diagnosed as disease.
- **Chlorophyll Early Warning:** Chlorophyll decline (NDRE) manifests before broad canopy loss (NDVI).
- **Honest Cloud Gaps:** Heavy rainy seasons produce cloudy intervals. The platform displays real gaps rather than false interpolations.
- **Confidence Scoring:** High-resolution 10m pixels have edge blending on small plots (< 0.5 ha). The system marks small plots with lower confidence and surfaces transparent reasoning.

---

## API Endpoints

### Authentication & Sessions
- `POST /auth/register` — Create account (returns user and JWT)
- `POST /auth/login` — Sign in
- `GET /auth/me` — Current authenticated session

### Farms & Ingestion
- `POST /farms` — Validate GeoJSON polygon, calculate area, save farm, and enqueue asynchronous backfill
- `GET /farms` — List farms (scoped to user or organization, paginated, searchable, filterable by health status and tags)
- `GET /farms/:id` — Farm metadata and latest health
- `PATCH /farms/:id` — Update farm properties or boundary
- `DELETE /farms/:id` — Delete farm and cascade delete its observations and alerts
- `GET /farms/:id/timeseries` — Time-series observations for charts
- `GET /farms/:id/analysis` — Health score, confidence, phenology maturity, plain-language reasons, active alerts
- `POST /farms/import` — Bulk import via GeoJSON FeatureCollection or JSON rows with validation report

### Organizations & Tenancy (RBAC)
- `POST /orgs` — Create organization (creator becomes owner)
- `GET /orgs` — List user's organizations
- `GET /orgs/:id` — Organization details & member counts
- `GET /orgs/:id/portfolio` — Portfolio aggregate statistics, health distribution breakdown, at-risk attention list, and recent alerts
- `GET /orgs/:id/portfolio/export` — Download portfolio audit as CSV
- `GET /orgs/:id/members` — Team members and roles
- `POST /orgs/:id/members` — Invite/add member with role (`admin`, `manager`, `viewer`)
- `PATCH /orgs/:id/members/:userId` — Change member role
- `DELETE /orgs/:id/members/:userId` — Remove member
- `GET /orgs/:id/alerts` — Organization risk inbox
- `PATCH /orgs/alerts/:alertId` — Acknowledge or resolve alert

### Satellite Image Overlay
- `GET /ndvi` — Dynamic Sentinel Process API raster image overlay for map bounding boxes

---

## Environment Configuration

Backend configuration in `backend/.env`:
```env
PORT=4000
MONGODB_URI=mongodb://...
JWT_SECRET=your_secret_jwt_key
SH_ID=your_sentinel_hub_client_id
SH_SECRET=your_sentinel_hub_client_secret
VALID_PIXEL_THRESHOLD=0.20
SYNC_CONCURRENCY=3
```

---

## Quick Start

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
# Server running on http://localhost:4000
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend running on http://localhost:5173
```
