# Instant Mechanic — Live Vehicle Service Operations Dashboard

A live operations dashboard for monitoring bookings, mechanics, customers and
revenue for a vehicle-service company, built for the Instant Mechanic Full
Stack Developer Intern assignment.

![status](https://img.shields.io/badge/status-local--dev--ready-4f8fe8)

---

## 1. Project Overview

**What it is:** a dashboard an ops team could realistically use every day —
an Overview of today's numbers, an Analytics view with trend charts, a
searchable/sortable/paginated Bookings table, a Mechanics roster, and a
Customers list. Booking status changes (`Pending → Assigned → Mechanic On
The Way → Completed`) happen live on screen, pushed over WebSockets, with no
page reload and no manual refresh.

**What I built and why:** rather than hand-wave "live updates" with a
setInterval polling loop on the frontend, I built a small backend-side
simulator that actually advances real documents in MongoDB and emits
Socket.IO events — so what you're watching is genuine state change flowing
through the database and out to every connected browser, which is the same
mechanism a real "mechanic accepts a job" action would use in production.

---

## 2. Tech Stack

| Layer      | Choice                                                        |
|------------|-----------------------------------------------------------------|
| Frontend   | Next.js 16 (App Router), TypeScript, Tailwind CSS v4            |
| Charts     | Recharts                                                         |
| Realtime   | Socket.IO (client + server) — WebSocket transport                |
| Backend    | Node.js, Express                                                 |
| Database   | MongoDB (Mongoose ODM)                                           |
| API docs   | swagger-jsdoc + swagger-ui-express (`/api-docs`)                 |
| Seed data  | @faker-js/faker                                                  |
| Deploy target | Frontend → Vercel · Backend → AWS (EC2 or similar) · DB → MongoDB Atlas |

---

## 3. Architecture

```
 ┌─────────────┐        HTTPS (REST)        ┌──────────────────┐
 │  Next.js     │ ─────────────────────────▶ │  Express API      │
 │  Frontend    │ ◀───────────────────────── │  (Node.js)        │
 │  (Vercel)    │                             │  (AWS EC2)        │
 │              │        WebSocket             │                   │
 │              │ ◀═════════════════════════▶ │  Socket.IO server │
 └─────────────┘                             └─────────┬─────────┘
                                                          │ Mongoose
                                                          ▼
                                                ┌───────────────────┐
                                                │     MongoDB        │
                                                │ (Atlas free tier)  │
                                                └───────────────────┘
```

- **Frontend → API**: plain `fetch` calls through a small typed client
  (`frontend/lib/api.ts`).
- **Frontend → Realtime**: a single Socket.IO connection is opened once at
  the app root (`frontend/lib/live-context.tsx`) and shared via React
  context; pages subscribe to only the events they care about
  (`booking:created`, `booking:updated`, `mechanic:updated`).
- **API → Database**: Mongoose models (`Booking`, `Mechanic`, `Customer`)
  with indexes on the fields the dashboard actually filters/sorts by
  (status, scheduledAt, createdAt, plate).
- **Live simulator** (`backend/src/seed/simulator.js`): runs inside the
  same Node process, on a timer, and (a) advances a few in-flight bookings
  one lifecycle step at a time, assigning a free mechanic on `pending →
  assigned`, and (b) occasionally creates a brand-new incoming booking. Every
  change is written to MongoDB first, then emitted over the socket — so a
  fresh page load and a live update always agree.

---

## 4. Local Setup

### Prerequisites
- Node.js 18+
- A MongoDB connection string — easiest is a free
  [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster, or
  run one locally: `docker run -p 27017:27017 -d mongo`

### Backend

```bash
cd backend
cp .env.example .env        # edit MONGO_URI if not using local default
npm install
npm run seed                 # generates 60 customers, 24 mechanics, 560 bookings
npm run dev                   # starts API + WebSocket server on :4000
```

API is now live at `http://localhost:4000`, docs at
`http://localhost:4000/api-docs`.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                          # starts Next.js on :3000
```

Open `http://localhost:3000`. Bookings will start advancing through their
lifecycle automatically within a few seconds (the simulator ticks every 6s).

---

## 5. Environment Variables

**backend/.env**
| Variable          | Description                                              | Example |
|--------------------|-----------------------------------------------------------|---------|
| `MONGO_URI`        | MongoDB connection string                                  | `mongodb+srv://user:pass@cluster.mongodb.net/instant_mechanic` |
| `PORT`              | API server port                                            | `4000` |
| `CLIENT_ORIGIN`     | Frontend origin allowed by CORS + Socket.IO                | `https://your-app.vercel.app` |
| `ENABLE_SIMULATOR`  | Set `false` to disable the auto-advancing live simulator   | `true` |

**frontend/.env.local**
| Variable               | Description                          | Example |
|-------------------------|----------------------------------------|---------|
| `NEXT_PUBLIC_API_URL`   | Backend base URL (REST + WebSocket)    | `http://localhost:4000` |

---

## 6. API Documentation

Full interactive OpenAPI docs are served at **`/api-docs`** once the backend
is running (JSON spec at `/api-docs.json`). Summary of the major endpoints:

| Method | Endpoint                        | Description |
|--------|----------------------------------|--------------|
| GET    | `/api/dashboard`                 | Aggregated overview counters + chart data (bookings/revenue over time, status & category breakdowns) |
| GET    | `/api/bookings`                  | List bookings — `search`, `status`, `category`, `city`, `sort`, `page`, `limit` |
| GET    | `/api/bookings/export.csv`       | CSV export of filtered bookings |
| GET    | `/api/bookings/:id`              | Single booking, with customer + mechanic populated |
| PATCH  | `/api/bookings/:id/status`       | Advance (or set) a booking's status; emits `booking:updated` over WebSocket |
| GET    | `/api/mechanics`                 | List mechanics — `status`, `search`, `page`, `limit` |
| GET    | `/api/mechanics/:id`             | Single mechanic, with current booking + recent job history |
| GET    | `/api/customers`                 | List customers — `search`, `page`, `limit` |
| GET    | `/api/customers/:id`             | Single customer, with recent bookings |
| GET    | `/health`                        | Health check |

**WebSocket events** (emitted by the server, consumed by the frontend):
`booking:created`, `booking:updated`, `mechanic:updated`.

---

## 7. Deployment

### Frontend → Vercel
1. Push this repo to GitHub.
2. Import the `frontend/` directory as a new Vercel project (set **Root
   Directory** to `frontend`).
3. Add the environment variable `NEXT_PUBLIC_API_URL` pointing at your
   deployed backend.
4. Deploy.

### Backend → AWS
1. Provision an EC2 instance (Free Tier: `t2.micro`, Ubuntu).
2. Install Node.js, clone the repo, `cd backend && npm install`.
3. Set environment variables (`.env` — see above), pointing `CLIENT_ORIGIN`
   at your Vercel URL.
4. Run with a process manager, e.g. `pm2 start src/server.js --name im-api`.
5. Open the chosen port (default 4000) in the instance's security group.
6. (Recommended) put it behind an Nginx reverse proxy / ALB with HTTPS so
   the browser's WebSocket connection isn't blocked by mixed-content rules
   when the frontend is served over HTTPS.

### Database → MongoDB Atlas
Free-tier cluster, network access opened to your EC2 instance's IP (or
`0.0.0.0/0` for a quick demo), connection string in `MONGO_URI`.

---

## 8. AI Usage

- **Tool used:** Claude (Anthropic), via the Claude chat interface.
- **What it was used for:** scaffolding the full project structure (backend
  models/routes/controllers, Next.js app router pages and components),
  writing the MongoDB aggregation pipelines for the dashboard analytics,
  the Socket.IO live-update wiring, the design system (color tokens,
  typography, layout), and this README.
- **What was verified/modified:** every file was syntax-checked
  (`node --check`), the frontend was type-checked (`tsc --noEmit`),
  linted (`eslint`), and built end-to-end (`next build`) during
  development to catch and fix real errors (several Recharts/TypeScript
  type mismatches and a few React-hooks lint rule violations were found
  and fixed this way, not left in place).
- **What's most proud of:** the live simulator is a first-class backend
  citizen, not a frontend fake — it mutates real MongoDB documents and
  drives genuine WebSocket events, so a hard refresh and a live update
  always show the same state.

---

## Submission checklist

- [ ] GitHub Repository: `<add link>`
- [ ] Live Vercel URL: `<add link>`
- [ ] Live Backend URL: `<add link>`
- [ ] API Documentation: `<backend-url>/api-docs`
