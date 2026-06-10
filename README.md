# EcoTwin AI 🌿

> **Your personal AI-powered carbon twin.** Track, forecast, and reduce your daily carbon footprint with scientifically backed coefficients, real environmental datasets, and Llama-powered insights.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-green?logo=supabase)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama--3.1-orange)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-brightgreen)](./LICENSE)

---

## 🎯 Challenge Vertical

**Sustainability & Climate Tech** — PromptWars 2026

---

## 🌍 Problem Statement

Individuals are responsible for ~30% of global greenhouse gas emissions through everyday choices — what they eat, how they commute, how much electricity they consume, and what they buy. Yet most people have no visibility into their actual impact.

Existing carbon trackers either:
- Rely on rough estimates without scientific citations
- Fail to integrate real-world datasets (food databases, live air quality)
- Offer no AI-driven, personalized guidance
- Lack engaging gamification to encourage daily habit change

**EcoTwin AI** solves this by creating a **digital carbon twin** — a persistent, intelligent avatar that synchronizes your daily actions with verified emission coefficients, predicts your 30-year climate trajectory, and gives you instant, personalized guidance.

---

## 🚀 Why EcoTwin AI

| Feature | EcoTwin AI | Generic Trackers |
|---|---|---|
| Scientific citations for every factor | ✅ EPA, DEFRA, IPCC, CEA | ❌ Opaque black boxes |
| Live barcode food scanning (OpenFoodFacts) | ✅ Agribalyse LCA data | ❌ Generic averages |
| Real-time AQI (US EPA AirNow API) | ✅ Geolocation-aware | ❌ Not available |
| AI Twin with Llama-3.1 (Groq) | ✅ Personalized, 60-word tips | ❌ Generic advice |
| 30-Year Lifestyle Simulator | ✅ Paris-aligned projections | ❌ Not available |
| GitHub-style contribution heatmap | ✅ Daily action tracking | ❌ Not available |
| Gamified achievements system | ✅ 6 unlockable badges | ❌ Not available |
| Offline-capable with local cache | ✅ JSON fallback | ❌ API-only |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│               Browser (Next.js Client)           │
│  Landing Page → Auth → Dashboard → Activities   │
│  React Components + Framer Motion + Recharts    │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│            Next.js App Router (Server)           │
│  Server Components + Server Actions             │
│  Middleware: Supabase Session Refresh           │
└───────┬────────────────────────┬────────────────┘
        │                        │
┌───────▼───────┐    ┌──────────▼──────────────┐
│  Supabase     │    │  External APIs           │
│  Auth + RLS   │    │  • US EPA AirNow (AQI)  │
│  Cache Tables │    │  • OpenFoodFacts (LCA)  │
└───────────────┘    │  • OpenStreetMap (Geo)  │
                     │  • Groq (Llama-3.1)     │
┌──────────────────────────────────────────────┐  │
│  Local File Cache (src/data/)               │  │
│  • environmental_cache.json (API responses) │  │
│  • db.json (runtime data — gitignored)      │  │
└──────────────────────────────────────────────┘  │
                                                   └┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Server Actions) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + CSS Variables |
| UI Components | Base UI + Shadcn/UI primitives |
| Animations | Framer Motion 12 |
| Charts | Recharts 3 |
| Auth | Supabase Auth (Email + OAuth) |
| Database | Supabase PostgreSQL (cache tables) |
| AI | Groq Cloud (Llama-3.1-8b-instant) |
| Food Data | OpenFoodFacts API + Agribalyse LCA |
| Air Quality | US EPA AirNow API |
| Geocoding | OpenStreetMap Nominatim |
| Testing | Vitest 4 |

---

## ✨ Features

### 🌀 Carbon Twin Dashboard
- **Concentric Ring Budget Tracker** — Apple Health-style rings for Transport, Food, Energy, Shopping, and Waste against daily budgets
- **12-Month Contribution Heatmap** — GitHub-style grid showing your daily eco-action history with carbon savings per day
- **Live AQI Card** — Real-time Air Quality Index from US EPA AirNow, color-coded and geolocation-aware

### 📊 Analytics & History
- **Emissions Pie Chart** — Category breakdown of your total footprint
- **Trend Area Chart** — Emissions trajectory over time

### 🔭 Future Simulator
- **30-Year Projection** — Adjust diet, commute mode, commute distance, and renewable energy percentage
- **Paris Agreement Alignment** — See if your simulated choices fit the 2030 net-zero target pathway
- **Cumulative savings** in metric tons CO₂e and equivalent trees

### 🤖 AI Twin Assistant
- **Groq Llama-3.1 Powered** — Personalized carbon tips generated after each activity log
- **Floating Chat Drawer** — Ask anything about diet, transport, energy, or recycling
- **Intelligent Fallback** — Scientifically accurate responses even when API is offline

### 🎮 Achievements
- **6 Unlockable Badges** — Twin Initialized, Plant Warrior, Transit Hero, Recycling Champion, Grid Pioneer, Centurion Saver
- **Real Progress Bars** — Calculated from actual logged activity data

### 📋 Weekly Reports
- **Automatic weekly digests** — Emissions totals, category breakdowns, week-over-week trends
- **AI takeaway summaries** — Generated from real activity data

### 🍎 Activity Logging
- **Transport** — 9 modes (petrol, diesel, EV, CNG, bike, bus, train, rickshaw, walking) with geocoded distance
- **Food** — Quick meal log + OpenFoodFacts barcode scanner with Agribalyse Eco-Score
- **Electricity** — 4 grid sources (US, UK, India, Solar) with kWh-based calculation
- **Shopping** — 4 categories with DEFRA spend-based emission factors
- **Waste** — 4 waste types with EPA WARM recycling credit

---

## 📐 Real Data Policy

**EcoTwin AI never fabricates carbon values.**

Every emission factor is sourced from a peer-reviewed or government-published dataset:

| Category | Source | Year | Reference |
|---|---|---|---|
| Transport (car, bus, train) | US EPA & UK DEFRA | 2024 | [DEFRA GHG Factors](https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024) |
| Transport (auto-rickshaw) | India ARAI & IPCC | 2023 | [ARAI India](https://www.araiindia.com/) |
| Electricity (US regions) | US EPA eGRID | 2024 | [EPA eGRID](https://www.epa.gov/egrid) |
| Electricity (India) | India Central Electricity Authority | 2024 | [CEA CDM DB v19](https://cea.nic.in/cdm-co2-baseline-database-for-indian-power-sector/) |
| Electricity (UK) | UK DEFRA | 2024 | [DEFRA GHG Factors](https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024) |
| Electricity (Solar) | NREL Lifecycle Assessment | 2023 | [NREL LCA](https://www.nrel.gov/analysis/life-cycle-assessment.html) |
| Food (diet patterns) | Our World In Data / Poore & Nemecek | 2018 | [Science (2018)](https://www.science.org/doi/10.1126/science.aaq0216) |
| Food (product barcodes) | OpenFoodFacts + Agribalyse | 2024 | [OpenFoodFacts](https://world.openfoodfacts.org/) |
| Shopping (spend-based) | UK DEFRA | 2024 | [DEFRA GHG Factors](https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024) |
| Waste | US EPA WARM Model | 2023 | [EPA WARM](https://www.epa.gov/warm) |
| Air Quality | US EPA AirNow | Live | [AirNow API](https://docs.airnowapi.org/) |

**If real data is unavailable:** the app shows a graceful empty state or error card. It never fabricates values.

---

## 🤖 AI Approach

### Groq Llama-3.1-8b-instant

EcoTwin uses **Groq's ultra-fast inference** to power two AI features:

1. **Post-Activity Insight Generation** — After logging, the user's recent 10 activities are sent as context. The model generates a 1-2 sentence, personalized tip. Output is sanitized: HTML stripped, wrapping quotes removed, length capped at 300 chars, error messages rejected.

2. **Conversational Twin Assistant** — A chat interface with a hardened system prompt that restricts the model to carbon/sustainability topics only, mitigating prompt injection attempts.

### AI Safeguards
- Inputs truncated to 500 characters before API call
- Chat history limited to last 10 messages (prevents context overflow)
- Per-user rate limiting (5 insights/min, 20 chats/min)
- Output sanitization rejects error messages from being stored as insights
- System prompt explicitly blocks topic drift and instruction leakage

### Carbon Calculation Transparency
Every activity form includes a **Calculation Inspector** component that shows users:
- The exact emission factor being applied
- Its scientific source and year
- The formula used
- Assumptions and limitations

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 20+
- A Supabase project ([supabase.com](https://supabase.com))
- A Groq API key ([console.groq.com](https://console.groq.com))
- A US EPA AirNow API key ([docs.airnowapi.org](https://docs.airnowapi.org)) *(optional — degrades gracefully)*

### 1. Clone the repository

```bash
git clone https://github.com/Bhavdeep-Sai/EcoTwin-AI.git
cd EcoTwin-AI
npm install
```

### 2. Configure environment variables

Create a `.env.local` file:

```env
# Supabase (get from your project settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Groq AI (required for AI Twin features)
GROQ_API_KEY=gsk_your_groq_key

# EPA AirNow (optional — AQI card degrades gracefully without it)
AIRNOW_API_KEY=your_airnow_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Supabase database

Run the SQL schema in your Supabase SQL editor:

```bash
# Apply base schema (auth tables + cache tables)
cat supabase_schema.sql

# Apply extensions (environmental cache tables)
cat supabase_schema_extensions.sql
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Running Tests

```bash
# Run all tests once
npm test

# Watch mode during development
npm run test:watch

# With coverage report
npm run test:coverage
```

---

## 🚀 Deployment

Deployed on **Vercel**: [View Live Demo →](#)

To deploy your own instance:

1. Fork this repository
2. Import into [Vercel](https://vercel.com)
3. Set all environment variables in the Vercel dashboard
4. Deploy

---

## 📸 Screenshots

> See the live deployment for the full interactive experience.

| Dashboard | Activity Log | Future Simulator |
|---|---|---|
| Carbon rings + heatmap | 5-category forms | 30-year projections |

---

## 🔮 Scientific Assumptions

The Future Simulator uses deterministic coefficients:
- **Diet rates**: Vegan 0.8 kg/day, Vegetarian 1.2 kg/day, Average 2.0 kg/day, Meat-Heavy 3.5 kg/day (3 meals/day)
- **Baseline**: 40 km/day petrol commute, 30 kWh/day home energy, average mixed diet
- **30-Year extrapolation**: Assumes static lifestyle inputs. Real outcomes vary with grid decarbonization, behavioral shifts, and policy changes.
- **Paris Pathway**: Baseline emissions halving by 2030, net zero by 2050, modeled as exponential decay.

---

## 🗺️ Future Improvements

- [ ] Google OAuth / GitHub social login
- [ ] Mobile app (React Native) with camera barcode scanning
- [ ] Supabase full migration (replace JSON flat-file store)
- [ ] India CEA regional grid breakdown (state-level emission factors)
- [ ] Carbon offset marketplace integration
- [ ] Export weekly reports as PDF
- [ ] Multi-user household tracking

---

## 📄 License

MIT License — see [LICENSE](./LICENSE)

---

## 👤 Contributors

**Bhavdeep Sai** — Full-stack development, AI integration, scientific data sourcing

---

*Built for PromptWars 2026 — Sustainability & Climate Tech vertical*
