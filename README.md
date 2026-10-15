# SaaSQuatch 2.0 — B2B Lead Intelligence & Deal Sourcing Platform

> Built for **Caprae Capital Partners** — An enterprise-grade B2B lead generation, scraping intelligence, and search fund deal-sourcing platform paired with a comprehensive M&A handbook, AI enrichment engine, and Salesforce synchronization pipeline.

---

## 🌟 Overview

**SaaSQuatch 2.0** is an operator-led lead sourcing and deal intelligence platform designed to discover, enrich, qualify, and execute outreach to high-conviction bootstrapped and founder-owned B2B software companies.

The application combines a high-performance interactive pipeline UI with server-side AI enrichment (powered by Google Gemini), an email deliverability verifier, a robust Salesforce CRM field-mapping configuration engine, a bulk JSON import engine, and the **Caprae Capital Pre-Work Dossier & Teardown Handbook**.

---

## 🚀 Key Features

### 1. Lead Pipeline & Interactive Table
- **Multi-Vector Filtering**: Filter by keyword search, vertical industry, ARR bands ($1M–$15M+), email verification status, and deal pipeline stage.
- **Selective Row Checkboxes & Batch Actions**:
  - Individual row selection checkboxes with click isolation (`stopPropagation`) to select leads without triggering detail drawers.
  - Master checkbox supporting checked, unchecked, and **indeterminate** states.
  - Floating batch selection bar displaying live selection count, "Deselect All", and targeted export actions.
- **Selection Summary Sidebar**:
  - Live aggregate **ARR calculation** across all currently selected pipeline leads.
  - **Total employee headcount** summation and average workforce sizing.
  - PE operational efficiency metrics, including **ARR per Employee** and average **PE Acquirability Score** (0–100).
  - Selected leads roster with inline company badge, ARR/headcount pills, and individual item deselect controls.
  - Direct batch CSV and JSON export buttons and toggleable sidebar visibility.
- **Historical ARR Sparkline Visualization (Recharts)**:
  - Mini area chart sparkline embedded in every row's **Estimated ARR & Growth** column built with **Recharts**.
  - Displays multi-quarter historical revenue trajectory with glowing gradient fills and responsive min/max domains.
  - Interactive hover tooltips displaying the exact quarter and ARR values (e.g. `2025 Q3: $4.4M ARR`).
  - Annualized YoY growth rate indicator (`+22% YoY` with `TrendingUp` icon).
  - Also embedded directly into the **Financial Profile** card inside the Lead Dossier Drawer.
- **Autonomous Background Lead Scoring & 'Hot' Badges**:
  - **Background Evaluation Daemon**: Continuous background process (`useHotLeadDaemon`) that automatically monitors all pipeline leads and marks candidates as **'Hot'** if their `acquirabilityScore` strictly exceeds **85**.
  - **Visually Distinct 'Hot' Badge in LeadTable**:
    - Highlighted flame badge (`🔥 HOT`) with gradient glowing animation beside the company name on qualifying rows.
    - Prominent **Hot Fit** indicator and highlighted rose score badge in the PE Acquirability column.
    - Subtle warm border accent on Hot table rows for instantaneous identification across the pipeline view.
  - **Telemetry Control Strip**: Real-time status indicator showing active daemon pulse, rule threshold (`Acquirability > 85`), total Hot count, latest audit timestamp/cycle, and manual "Audit Now" and Pause/Resume controls.
  - **Hot Targets Filter**: One-click toggle in the filter bar to isolate only Hot leads exceeding the 85 threshold.
- **Export Selection Engine**:
  - Export either the targeted selection or the full filtered set to **CSV** or **JSON**.
  - Dynamically formatted, timestamped filenames (e.g. `saasquatch_leads_selected_3_2026-10-15.csv`).
- **Live Pipeline Metrics (`PipelineStats`)**: Real-time KPI summaries covering Total Active Targets, **Average Monthly Growth Rate** (`+X.X%/mo` calculated from historical quarterly ARR series and annualized CMGR), Hot Targets (>85), Deliverability Rate, AI Enriched Dossiers, and Total Pipeline ARR with net monthly expansion rate.

### 2. Bulk Lead Import
- **JSON File Ingestion**: Upload custom JSON lead files directly into application state.
- **Runtime Schema Validation**: Rigorous validation against the core `Lead` type definition:
  - Required field validation (`id`, `companyName`, `domain`, `industry`, `decisionMaker`).
  - Strict type checking for nested objects (`decisionMaker.name`, `decisionMaker.email`, `metrics.arr`).
  - Validation error reporting detailing exact record indices and missing/invalid properties.
- **Schema Template & Samples**: In-modal downloadable sample JSON schema for easy import preparation.

### 3. Lead Intelligence Drawer & AI Copilot
- **Deep M&A Thesis**: Evaluates unit economics, defensibility, customer concentration, and transition opportunities for Search Fund / Operator models.
- **Operational Upside & Tech Stack**: Actionable post-acquisition modernization steps (LLM workflow automation, cloud migration, dispatch optimization) and detected software dependencies.
- **Automated Multi-Channel Outreach Sequences**:
  - Founder-to-founder Search Fund / PE Succession Pitch (no broker clichés).
  - High-conversion B2B Commercial Sales Pitch.
  - High-touch LinkedIn InMail (<300 characters).
  - 30-Second Cold Call Script.
- **Custom Pitch Generator**: Uses server-side **Gemini 3.8 Flash** to generate custom outreach pitches tailored to specific company angles and decision-maker roles.

### 4. Salesforce CRM Integration & Field Mapping
- **Custom Field Mapping Configuration (`SalesforceMappingSettings`)**:
  - Visual mapping table connecting SaaSQuatch data attributes (`companyName`, `domain`, `arr`, `ebitda`, `decisionMakerEmail`, etc.) to standard and custom Salesforce CRM fields (e.g., `Company`, `Website`, `AnnualRevenue`, `EBITDA__c`, `Decision_Maker_Email__c`).
  - Field transformation options: `Raw`, `Lowercase`, `Uppercase`, `Trim Whitespace`, `Number Format`, `Currency Format`.
  - Add, edit, remove, reset to defaults, and test payload serialization in real time.
- **Visual Sync Status Badges**:
  - Dedicated **Salesforce Sync** column in the `LeadTable` displaying instantaneous visual state for every lead row.
  - **Synced Badge**: Emerald badge with a `CheckCircle2` icon displaying "Synced", detailed record ID, and sync timestamp.
  - **Pending Badge**: Amber badge with a `Clock` icon displaying "Pending", enabling one-click lead dossier inspection and sync execution.
  - Dynamically transitions in real-time immediately when a lead is synced via the dossier drawer.
- **Real-Time Sync Animation**:
  - Interactive "Sync to Salesforce" button with a spinning sync indicator while the API handshake is in progress.
  - Transitions to an animated green checkmark with persistent synced timestamp and Salesforce record ID upon success.

### 5. Email Verification & Deliverability Engine
- **Multi-Factor Deliverability Checks**: RFC 5322 syntax validation, MX record resolution, disposable email blacklist detection, and catch-all domain identification.
- **Stand-Alone Verifier Modal**: Test any corporate email address on the fly with deliverability scoring (0–100) and actionable deliverability recommendations.

### 6. Caprae Capital Pre-Work Dossier
- Complete strategic responses and technical teardowns addressing:
  - **Search Fund & M&A as a Service (MaaS)** sourcing methodologies.
  - **Scraping Architecture**: Anti-bot evasion, residential proxy rotation, TLS fingerprinting (JA3/JA4), headless browser clusters (Playwright), and CAPTCHA bypass.
  - **7-Year Post-Acquisition Value Creation Roadmap**: Cloud migration, LLM-driven internal operations, API monetizations, and enterprise governance.
  - **Technical Architecture Teardown**: Data pipelines, deduplication heuristics, security, and schema designs.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Node.js, Express (`server.ts`), Vite middleware mode in development.
- **AI Integration**: `@google/genai` SDK with `gemini-3.8-flash` structured JSON outputs and resilient fallbacks.
- **Build & Dev Tooling**: Vite 8, `tsx`, TypeScript compiler (`tsc`).

---

## 📁 Project Structure

```
├── server.ts                       # Express backend server with Gemini AI and CRM APIs
├── src/
│   ├── App.tsx                     # Main dashboard controller, state management, & tabs
│   ├── main.tsx                    # React DOM entry point
│   ├── index.css                   # Tailwind CSS styling entry
│   ├── components/
│   │   ├── BulkImportModal.tsx     # JSON lead upload with runtime validation
│   │   ├── CapraeDossierView.tsx   # Comprehensive Caprae submission dossier handbook
│   │   ├── EmailVerifierModal.tsx  # Standalone email validation tool
│   │   ├── Header.tsx              # Top navigation bar and action triggers
│   │   ├── LeadDrawer.tsx          # Detail view with AI analysis, sequences, & sync
│   │   ├── LeadFilters.tsx         # Search, filters, and export controls
│   │   ├── LeadTable.tsx           # Checkbox-enabled lead table with batch selection bar
│   │   ├── PipelineStats.tsx       # Live KPI overview cards
│   │   ├── SalesforceMappingSettings.tsx # CRM custom schema field mapping engine
│   │   └── ScraperConsoleModal.tsx # Interactive scraping simulation console
│   ├── data/
│   │   └── mockLeads.ts            # High-fidelity target company dataset
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces and domain models
│   └── utils/
│       └── validation.ts           # Schema validation helpers for JSON import
├── metadata.json                   # Applet metadata configuration
├── package.json                    # Project dependencies and npm scripts
└── tsconfig.json                   # TypeScript configuration
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or bun

### Installation

1. Clone or navigate into the repository:
   ```bash
   git clone <repo-url>
   cd <project-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up Environment Variables:
   Create a `.env` file in the root directory if you want live Gemini AI generation:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```
   *Note: If `GEMINI_API_KEY` is omitted, the application automatically uses built-in, high-quality contextual fallbacks for offline operation.*

4. Start the Development Server:
   ```bash
   npm run dev
   ```
   The application will start at `http://localhost:3000`.

5. Build for Production:
   ```bash
   npm run build
   npm start
   ```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `POST` | `/api/leads/verify-email` | Syntax, MX, disposable, and catch-all email verification |
| `POST` | `/api/leads/enrich` | Comprehensive company M&A thesis, tech stack, and outreach sequences via Gemini 3.8 Flash |
| `POST` | `/api/leads/generate-custom-pitch` | Personalized outreach copy based on custom angles and target roles |
| `POST` | `/api/leads/sync-salesforce` | Simulates Salesforce CRM sync with custom field mappings and returns a Salesforce ID |

---

## 📄 License

Proprietary — Created for Caprae Capital Partners.
