# SaaSQuatch 2.0: AI-Enriched Lead Intelligence & Deal Sourcing Platform

A next-generation enterprise lead generation, deep AI enrichment, and acquisition deal-sourcing engine built to enhance Caprae Capital's proprietary SaaSQuatch tool, accompanied by an interactive pre-work interview submission dossier.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural direction and scope have been refined based on your clarification answers:
> - **Primary Strategic Focus**: Quality First approach with deep AI enrichment, verification, and lead scoring.
> - **Core Capability**: Live scraping simulation with real-time domain extraction, AI qualification scoring, and email verification deliverability.
> - **Submission Companion**: Integrated Caprae Candidate Dossier featuring complete, authoritative answers to the handbook's business questions, a 2-minute video script, and cloud backend architecture documentation.

- **Confirmed Decision 1**: High-fidelity dual-mode application featuring both the live operational **SaaSQuatch 2.0 Lead Intelligence Tool** and the **Caprae Interview & Architecture Dossier**.
- **Confirmed Decision 2**: Server-side Google Gemini 3.8 Flash integration (`@google/genai`) for real-time live company intelligence, ICP scoring, and cold outreach sequence generation.
- **Confirmed Decision 3**: Comprehensive data export (CSV/JSON), deliverability verification simulator (MX check, catch-all detection, bounce risk calculation), and search fund acquisition criteria filters.

---

## 1. Overview & Core Concept

- **What It Does**: SaaSQuatch 2.0 is an advanced B2B lead generation and intelligence platform designed specifically for private equity firms, search fund operators, and modern growth teams. It scrapes, verifies, enriches, and scores prospects with actionable intelligence (M&A readiness, estimated ARR/EBITDA, technographics, verified decision-maker emails, and hyper-personalized outreach sequences).
- **Target Audience / Persona**: Acquisition entrepreneurs (ETAs), private equity deal sourcers at Caprae Capital, M&A as a Service (MaaS) operators, and high-velocity B2B sales development teams.
- **Key Value**: Replaces noisy, low-quality scraping lists with verified, high-horse-power deal targets and sales leads, cutting manual prospect research from 45 minutes down to seconds while delivering higher response rates.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Lead Sourcing & Live Scraper Hub**:
   - Filter by Industry, Location, Tech Stack, Estimated Revenue, and Search Fund / PE criteria (e.g. Owner Retirement / Succession risk, Bootstrapped SaaS, Low digital presence).
   - Trigger a live scrape simulation with real-time terminal feedback, progress telemetry, and extracted prospect cards.
2. **Deep AI Lead Enrichment & Verification**:
   - Inspect individual leads in an expandable detail modal or split-pane view.
   - Run the **Gemini AI Enrichment Engine** to generate executive summaries, M&A opportunity scores, ICP match analysis, and customized multi-channel outreach pitches (Email, LinkedIn, Cold Call script).
   - Test email deliverability with real-time MX check, syntax verification, and bounce risk assessment.
3. **Pipeline & Multi-Format Export**:
   - Organize leads into custom stages (Qualified, Deal Pipeline, Outreach Ready, Archived).
   - Bulk export cleaned data to CSV and formatted JSON ready for CRM insertion (HubSpot, Salesforce).
4. **Caprae Pre-Work Handbook Submission Dossier**:
   - Tabbed executive dossier containing articulate, deeply researched answers to all questions in Section 4 (Caprae Mission, Why Caprae, ETA & PE transformation, Horsepower vs Mileage, employment terms) and Section 7 (Unfair advantage, "Take down legends", Culture).
   - Production-ready 2-minute video walkthrough script with timing, visual cues, and narration points.
   - Comprehensive system architecture documentation (GCP Cloud Run, PostgreSQL schema, Redis caching, proxy rotation, and CAPTCHA handling).

### Visual Identity & Theme
- **Aesthetic Direction**: High-conviction institutional SaaS aesthetic with clean typography, sharp borders, deep slate accents, and purposeful data density. Inspired by modern financial technology and developer platforms (Linear, Carta, Stripe Dashboard).
- **Color Palette**:
  - Neutral Canvas: Clean crisp white `#FFFFFF` with soft off-white workspaces `#F8FAFC` and subtle dark mode slate `#0F172A`.
  - Structural Surfaces: Hairline border tones `#E2E8F0` / `#1E293B` and quiet neutral cards.
  - Accent Budget: Deep Navy `#0F172A` paired with Emerald Green `#059669` (high deliverability / verified status) and Electric Blue `#2563EB` for primary action anchors.
- **Typography & Tabular Discipline**:
  - Display & Headings: `Plus Jakarta Sans` for modern authoritative weight.
  - Body Text: `DM Sans` / `Inter` with relaxed reading measures.
  - Telemetry & Metrics: Monospace `tabular-nums` for lead scores, deliverability percentages, and revenue ranges.
- **Zero-Pill Discipline**:
  - Tags, categories, and timestamps rendered as clean unboxed text with typographic separators (`·` or `/`).
  - No decorative pulsing dots or pseudo-code comment headers.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Live Interactive Scraper Simulation with Real Gemini AI Integration**
  - *Chosen Approach*: Deliver a pre-seeded, realistic dataset of 25+ rich B2B and M&A target companies, paired with a live scraping engine that queries real-world domains via server-side Gemini 3.8 Flash for live enrichment and personalized pitch generation.
  - *Why*: Allows instant usability out-of-the-box without requiring live Puppeteer headless browser cluster setup in the sandbox, while providing genuine server-side AI execution.
  - *Alternatives Considered*: Pure static mock data (lacks technical impressiveness) vs full headless browser crawler in Cloud Run (would require external headless Chrome infrastructure and proxy accounts).
- **Decision 2: Integrated Caprae Interview Dossier**
  - *Chosen Approach*: Seamlessly embed the complete handbook submission packet inside an easily switchable executive view with copy-to-clipboard, video script cue card teleprompter, and PDF/Markdown download.
  - *Why*: Directly satisfies the hiring committee's evaluation criteria (10 pts Business Understanding, 10 pts Technicality, 10 pts UX/UI) in one unified, memorable package.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SaaSQuatch 2.0 Client UI                        │
│   (React 19 + TypeScript + Tailwind CSS v4 + Lucide Icons + Motion)    │
├───────────────┬───────────────────────┬────────────────────────────────┤
│  Lead Scraper │  AI Enrichment Modal  │  Caprae Submission Dossier     │
│  & Filter Bar │  & Email Verifier     │  & Video Script Teleprompter   │
└───────┬───────┴───────────┬───────────┴────────────────┬───────────────┘
        │                   │                            │
        ▼                   ▼                            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Express 4 Server Proxy                           │
│                      (Port 3000 / API Routes)                          │
├───────────────────────────────┬────────────────────────────────────────┤
│  POST /api/leads/enrich       │  POST /api/leads/verify-email          │
│  (Gemini 3.8 Flash SDK)       │  (DNS/MX & Deliverability Algorithm)   │
├───────────────────────────────┴────────────────────────────────────────┤
│  POST /api/leads/outreach     │  GET /api/leads/export                 │
│  (Personalized Pitch AI)      │  (CSV & JSON Serialization Engine)     │
└───────────────────────────────┴────────────────────────────────────────┘
```

### Data Model & State
- **Lead Entity**:
  - `id`: Unique identifier
  - `companyName`: Business name
  - `domain`: Web domain
  - `industry`: Target vertical (Vertical SaaS, MaaS, Niche Manufacturing, Healthcare IT, etc.)
  - `location`: Headquarters (City, State, Country)
  - `employeeCount`: Range and exact count
  - `estimatedRevenue`: ARR / EBITDA estimate
  - `decisionMaker`: Full name, verified title, direct email, LinkedIn URL
  - `verification`: Status (`verified`, `risky`, `unverified`), deliverability score (0-100%), MX record presence, catch-all flag
  - `peSignals`: Acquisition readiness factors (bootstrapped, aging founder, low digital footprint, steady cashflow)
  - `aiSummary`: Auto-generated business model teardown
  - `outreachPitches`: Dynamic email angle, LinkedIn note, and phone hook
- **Server API Implementation**:
  - `server.ts`: Express application integrating `@google/genai` with `gemini-3.8-flash` for lead analysis and pitch synthesis.
  - Safe error handling and graceful fallbacks for rate limits.

---

## 5. Verification & Implementation Sequence

1. Configure `metadata.json` and entry HTML with authentic SaaSQuatch branding.
2. Build server-side Express endpoints in `server.ts` utilizing `@google/genai` (`gemini-3.8-flash`) with proper `httpOptions` headers.
3. Build client-side services, lead state management, deliverability verification routines, and pre-seeded rich dataset.
4. Construct the modular UI:
   - Header with view switcher (SaaSQuatch Engine vs Caprae Pre-Work Dossier).
   - Live Scraper & Filter console with instant search and search fund acquisition criteria.
   - Data Table with sortable columns, deliverability indicators, and quick action drawers.
   - Lead Detail & AI Enrichment Drawer with live Gemini generation.
   - Caprae Handbook Submission & Video Script Teleprompter.
5. Compile and lint verify the application for production readiness.
