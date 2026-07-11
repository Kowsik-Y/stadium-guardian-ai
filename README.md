# Stadium Guardian AI (EcoFlow)

> **Real-Time Tournament Spectator Safety & Operational Logistics Orchestrator.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&style=flat-square)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&style=flat-square)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&style=flat-square)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-11.x-orange?logo=firebase&style=flat-square)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-Orchestrator-10b981?style=flat-square)](https://ai.google.dev)
[![PWA](https://img.shields.io/badge/PWA-installable-0ea5e9?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](./LICENSE)

Stadium Guardian AI (EcoFlow) is a production-ready, full-stack stadium operations assistant designed for volunteers and tournament operations control rooms at mega-stadium events (such as the FIFA World Cup 2026). It treats a 90,000-person stadium as a "temporary city" and utilizes Generative AI to provide explainable decision-making during high-density scenarios.

---

## Problem Statement

During major stadium matches, stadium volunteers (often young and inexperieced) are stationed on the ground to manage crowd flows, direct spectators, and handle incidents. They face severe friction points:
- **Crowd Congestion Blindness**: Volunteers cannot see live wait times or gates bottlenecks.
- **Language & Dialect Barriers**: Communicating with international fans without appropriate dialect registers (e.g. Moroccan Arabic).
- **Incident Escalation Lag**: Difficulty distinguishing between standard spectator queries (e.g., restroom directions) and high-stakes emergencies (e.g., medical distress or crowd crush).

**Stadium Guardian AI addresses these directly:**
- A **Live SVG HUD Map** showing crowd density percentages, wait times, risk scores, and smart trash bins fill states.
- A **multilingual AI Copilot** translating volunteer queries, generating public scripts in multiple languages, and classifying registers (e.g. Moroccan Arabic `عباد بزاف`).
- **Explainable AI (XAI)** reasoning details printed side-by-side with actions, so managers know the *why* behind redirections.
- An **Ingestion Test Bed** allowing judges to drag and drop custom CSV files to test AI routing.

---

## Features Breakdown

| Feature Module | Description | Actionable Loop |
|---|---|---|
| **Live Operations HUD** | Dynamic maps displaying Gates A, B, C, D wait times, risk score, and trash bin fullness levels. | **INPUT**: Sensors tracking densities and garbage loads dynamically. |
| **AI Reasoning Engine** | Server-side Gemini integration forecasting bottleneck spillages and routing marshalling dispatches. | **REASONING**: AI predicts spillage timelines and suggests redirections. |
| **Volunteer AI Copilot** | Chat widget translates ground notes and automatically detects dialects (e.g. Moroccan Arabic). | **EXPLAINABLE DECISION**: XAI JSON panel shows reasoning telemetry. |
| **Emergency Escaler** | Scans queries for medical alerts (e.g. "cannot breathe"), escalating to high-priority dispatches. | **ACTION**: EMT teams dispatched, volunteer safety script generated. |
| **Sustainability Grid** | Monitors Smart Trash Bins fill levels, routing sanitation crews (`CREW-DELTA`) before crowd peaks. | **ACTION**: Proactive cleaning routes assigned to prevent overflows. |
| **Operations Analytics** | Recharts area and bar graphs mapping crowd relief, alerts status, and Gemini confidence trends. | **METRICS**: Feedback loop validation of operations quality. |
| **CSV Test Bed** | Drag-and-drop CSV parser validating headers and inputs, overriding telemetry streams. | **TESTING**: Dynamic evaluation of arbitrary gate sensors. |
| **Installable PWA** | Web App Manifest and Service Worker support. Installable on Android and iOS devices. | **OFFLINE**: Offline assets caching for high-density networks. |

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2.10 — App Router, Turbopack |
| **Runtime** | React 19.0.0 |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS v4 — dark-theme glassmorphism, pulse states, micro-animations |
| **Database / Sync** | Firebase Firestore (primary) / LocalStorage Sandbox (fallback) |
| **Authentication** | Firebase Authentication (Email/Password) / One-Click Preset Profiles (fallback) |
| **AI Orchestration** | Google Gemini API / Vertex AI (`@google/generative-ai` SDK) |
| **Charts** | Recharts (dynamic client-side rendering) |
| **CSV Parser** | PapaParse + Zod-like type validation |
| **Animations** | Framer Motion + Canvas Confetti alerts |
| **Icons** | Lucide React |

---

## Project Structure

```
src/
├── app/                        # Next.js App Router Pages
│   ├── api/
│   │   ├── reasoning/          # Telemetry predictive reasoning API
│   │   └── copilot/            # Chat translator and emergency router API
│   ├── analytics/              # Recharts operations metrics page
│   ├── copilot/                # AI assistant chat interface page
│   ├── dashboard/              # Live map HUD page
│   ├── upload/                 # CSV ingestion test bed page
│   ├── globals.css             # Tailwind v4 directives & root theme
│   ├── layout.tsx              # Font loader, global AppProvider, ClientShell
│   ├── manifest.ts             # PWA app web manifest configuration
│   └── page.tsx                # Server-side redirect pointing to /dashboard
├── components/
│   ├── ClientShell.tsx         # Sidebar, weather banner, alert count widget
│   └── Login.tsx               # Quick-access volunteer profiles login
├── context/
│   └── AppContext.tsx          # Global context composer — composes all hooks
├── hooks/
│   ├── useAuth.ts              # Authentication state, login/logout handlers
│   ├── useFirestoreSync.ts     # Firestore/LocalStorage sync, incident CRUD
│   ├── useSimulation.ts        # Real-time sensor drift simulation loop
│   └── useAiReasoning.ts       # Proactive Gemini reasoning engine integration
└── lib/
    ├── firebase.ts             # Firebase App/Auth/Firestore init scripts
    ├── firestoreSync.ts        # Atomic batch write helpers for Firestore
    ├── focusTrap.ts            # WCAG 2.1 keyboard focus trap utility
    ├── gemini.ts               # Gemini model singleton
    ├── mockCopilot.ts          # Deterministic sandbox fallback for AI Copilot
    ├── proxy.ts                # API route HOF: security, auth, error handling
    ├── types.ts                # Strict TypeScript model interfaces
    └── stadiumState.ts         # Preset lookups, default states, O(1) map searches
public/
├── icon-192.png                # Mascot maskable PWA icon
├── icon-512.png                # PWA splash screen icon
└── sw.js                       # Service Worker for offline static caching
tests/
├── copilot-translation.test.ts # AI Copilot dialect & emergency classification
├── firestore-sync.test.ts      # Firestore batch write helpers
├── focus-trap.test.ts          # WCAG keyboard focus trap utility
├── gemini-singleton.test.ts    # Gemini SDK singleton initialization
├── mock-copilot-edge-cases.test.ts  # Edge cases: empty input, long input, mixed language
├── proxy.test.ts               # API proxy HOF: security, auth, error handling
├── simulation-tick.test.ts     # Simulation tick: density clamping, bin fill, concessions
└── stadium-state.test.ts       # Stadium state lookups and O(1) search helpers
```

---

## Security & Accessibility (WCAG 2.1 AA)

We enforce standard security and accessibility parameters:
- **HttpOnly Variables**: Sensitive API keys (`GEMINI_API_KEY`) remain strictly on the server-side Next.js route handlers.
- **Mock Bypass Isolation**: Preset logins (ending in `@fifa.com`) bypass Firebase network auth checks, logging in simulated users instantly without querying credentials.
- **Aria landmarks**: Full semantic layout navigation (`<header>`, `<aside>`, `<main>`), keyboard focus rings, and screen-reader tags on inputs.

*See [`SECURITY.md`](./SECURITY.md) for Firestore recommended security rules.*

---

## Setup & Installation

### 1. Prerequisites
- Node.js v18 or later
- npm v9 or later

### 2. Install Packages
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file at the root:
```env
# Gemini API Key (Required for live GenAI reasoning)
GEMINI_API_KEY="your_gemini_api_key_here"

# Google Maps (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_maps_key_here"

# Firebase Config (Optional - fellback to local sandbox if missing)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
```
*Note: If these variables are empty, the app runs in Sandbox Simulation mode automatically.*

### 4. Run Development Server
```bash
npm run dev
```

---

## Containerization & Deployment

Stadium Guardian AI is fully containerized.

### Build and Start Docker Container:
```bash
docker compose up --build -d
```
Access [http://localhost:3000](http://localhost:3000) on your local browser.

### Cloud Run Deployment Instructions:
Enable the Artifact Registry and deploy the standalone Next.js build:
```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT/stadium-guardian/app:latest
gcloud run deploy stadium-guardian-ai \
    --image us-central1-docker.pkg.dev/YOUR_PROJECT/stadium-guardian/app:latest \
    --set-env-vars="GEMINI_API_KEY=YOUR_API_KEY" \
    --allow-unauthenticated \
    --region us-central1
```

---

## How This Addresses the Problem Statement

This section explicitly maps each **Challenge 4: Smart Stadiums & Tournament Operations** requirement to a concrete implementation:

| Challenge Requirement | Implementation |
|---|---|
| **Real-time crowd monitoring & management** | Live SVG HUD map with gate density %, wait times, and arrival rates updated every 5 s via simulated sensor drift. `src/hooks/useSimulation.ts` |
| **AI-driven decision support** | Gemini 1.5 Flash API called server-side via `/api/reasoning` with full telemetry context. Returns structured JSON with `incident_type`, `predictive_reasoning`, and `action_plan`. `src/app/api/reasoning/route.ts` |
| **Multilingual communication for international fans** | Copilot generates volunteer scripts and fan announcements in English, Spanish, French, and Arabic (including Moroccan dialect). `src/app/api/copilot/route.ts` |
| **Explainable AI (XAI) reasoning** | Every AI response includes a `predictive_reasoning` field with plain-English explanation of *why* an action is recommended. Displayed side-by-side with actions in the UI. |
| **Emergency escalation & response** | Three-tier incident classification: `ROUTINE` → `URGENT` → `CRITICAL_EMERGENCY`. Medical keywords and crowd-crush dialect markers trigger immediate CRITICAL_EMERGENCY dispatch with EMT routing. `src/lib/mockCopilot.ts` |
| **Sustainability & smart waste management** | Smart Bin telemetry tracks fill levels per concourse. Bins filling above 85% with no assigned crew proactively trigger Gemini AI to dispatch `CREW-DELTA` sanitation teams before overflow. |
| **Volunteer support tooling** | Volunteer AI Copilot provides direct ground-level instructions, multilingual fan scripts, and contextual situational awareness — replacing paper playbooks. |
| **Data ingestion & custom scenarios** | CSV Test Bed (`/upload`) accepts drag-and-drop sensor files with header validation, overriding live telemetry to simulate arbitrary scenarios for evaluation and training. |
| **Offline / low-connectivity operation** | PWA with Service Worker caching critical assets. All telemetry falls back to LocalStorage when Firebase is unavailable, ensuring no single point of failure in stadium network conditions. |
| **Performance at scale** | Firebase Firestore with O(1) hash-map lookups (`lookupGate`, `lookupBin`, `lookupConcession`). Batch writes throttled to every ~30 s to handle 90,000-person stadium throughput. |

---

## Context-Aware AI Decision Making

The AI reasoning engine adapts its responses based on multiple simultaneous contextual signals — it is **not** a static rule engine:

| Context Signal | How AI Uses It |
|---|---|
| **Gate crowd density (0–100%)** | Density > 80% → `URGENT` dispatch. Density > 80% + high arrival rate → `CRITICAL_EMERGENCY` crowd crush risk. Redirects fans to lowest-density gate. |
| **Stadium capacity & arrival rate** | Combines gate density with fans/min arrival to calculate bottleneck timeline (e.g. "will exceed safe capacity in 4 minutes"). |
| **Weather conditions** | Hot conditions (> 29°C) combined with high density triggers hydration station deployment and heat-stroke risk escalation. |
| **Time-of-event phase** | Bin fill rates and concession queues are weighted against halftime approach — AI proactively dispatches crews *before* the halftime rush, not after. |
| **Smart bin fill levels** | Bins > 85% full with unassigned crews → proactive dispatch. Bins with active crews → tracks drain progress tick-by-tick. |
| **Medical case count** | `nearby_medical_cases > 3` → immediate `CRITICAL_EMERGENCY` with Medical Response Unit Alpha and triage area setup. |
| **Volunteer input dialect** | Moroccan Arabic (`عباد بزاف`, `مخنق`) → CRITICAL_EMERGENCY crowd crush. Spanish confusion → URGENT redirect. English routine queries → ROUTINE navigation. |
| **Concession stock levels** | Stock < 15% auto-restock trigger. Queue > 40 → BUSY status + crew dispatch to open reserve counters. |

All of these signals are passed as a single telemetry JSON packet to Gemini with each reasoning request, enabling **multi-signal correlated decisions** rather than single-dimension rule matching.

---

## Test Coverage Summary

**47 tests across 8 test files** — run with `npm test` or `npm run test:coverage` for a full HTML coverage report.

| Test File | What's Covered |
|---|---|
| `stadium-state.test.ts` | Initial state structure, O(1) gate/bin/concession lookups, null returns for missing IDs |
| `copilot-translation.test.ts` | Moroccan Arabic crowd crisis detection, medical emergency escalation, bin overflow routing, restroom queries, standard fallback |
| `mock-copilot-edge-cases.test.ts` | Empty input, 500+ char input, whitespace-only, case-insensitive matching, all four translation keys always present, action_plan shape, priority ordering (medical beats sustainability) |
| `simulation-tick.test.ts` | Gate density clamping (max 98%, min 10%), arrival rate floor (20/min), wait-time formula at boundaries, bin fill progression, crew drain to zero & crew release, fill-rate vs density correlation, concession OPEN/BUSY/CLOSED thresholds |
| `proxy.test.ts` | Request passthrough, unhandled exception → 500 envelope, volunteer Bearer token auth, supervisor Bearer token auth, missing env secret → unauthenticated |
| `firestore-sync.test.ts` | Single atomic batch write for full stadium state, correct document path construction, collection seeding |
| `focus-trap.test.ts` | Focusable element enumeration in DOM order, Tab wrapping last → first, Shift-Tab wrapping first → last |
| `gemini-singleton.test.ts` | SDK initialized once per module load, model instance reference stability |
