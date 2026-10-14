export interface CapraeDossierQuestion {
  id: string;
  category: 'business_understanding' | 'employment_expectations' | 'reapplicant_questions' | 'technical_architecture' | 'video_script';
  title: string;
  subtitle?: string;
  paragraphs: string[];
  bulletPoints?: string[];
  takeaways?: string;
}

export const CAPRAE_DOSSIER: CapraeDossierQuestion[] = [
  {
    id: 'mission',
    category: 'business_understanding',
    title: "What is Caprae's Mission?",
    subtitle: 'Strategic transformation and practical AI over financial engineering',
    paragraphs: [
      "Caprae Capital's core mission is to transcend the transactional myopia of traditional private equity by turning acquisitions into seven-year operational and technological journeys. While standard Wall Street and lower-middle-market PE firms rely primarily on financial engineering—leveraging debt, stripping costs, and flipping businesses in three-to-five-year cycles—Caprae operates as a founder-and-operator-first firm dedicated to driving organic, compounding enterprise value post-acquisition.",
      "At the center of this mission is the operationalization of practical AI through Caprae's proprietary SaaS (Software as a Service) and MaaS (M&A as a Service) models. Rather than chasing theoretical AI hype or bloated third-party software subscriptions, Caprae builds and injects custom software tools directly into portfolio companies. This modernizes legacy processes, removes manual bottlenecks, expands EBITDA margins, and creates durable moats in fragmented, recession-resilient industries.",
      "Ultimately, Caprae's mission is about empowering acquisition entrepreneurs and lower-middle-market leaders to transform good, unheralded businesses into enduring market champions. By partnering long-term with talent that possesses character, courage, creativity, and high-horsepower stamina, Caprae bridges the gap between old-economy cashflows and modern technological leverage.",
    ],
    takeaways: 'M&A as a 7-year operational journey; injecting practical AI and proprietary software rather than relying on debt engineering.',
  },
  {
    id: 'why_work',
    category: 'business_understanding',
    title: 'Why do you want to work at Caprae Capital?',
    subtitle: 'Horsepower vs Mileage: Building proprietary leverage at the bleeding edge',
    paragraphs: [
      "I want to work at Caprae Capital because I am deeply energized by Kevin Hong's philosophy of 'Horsepower vs. Mileage.' In a tech recruiting landscape dominated by pedigree snobbery, resume stamping, and corporate complacency, Caprae seeks independent thinkers who have the character, courage, and obsessive drive to master their craft and take down industry legends. I want to build in an environment where intense stamina, radical candor, and intellectual velocity are celebrated rather than stifled.",
      "Furthermore, Caprae's decision to build its own software stack—epitomized by proprietary sourcing tools like SaaSquatch Leads—proves that Caprae is an authentic builder rather than an armchair financier. Most PE firms rent commoditized, bloated tools like ZoomInfo, PitchBook, or SourceScrub, which guarantees they look at the exact same deals as everyone else. Caprae understands that building in-house gives an insurmountable unfair advantage in data ownership, proprietary deal flow, and customized execution.",
      "As a full-stack engineer, I don't want to build disposable SaaS widgets or maintain ticket queues; I want to engineer high-velocity systems where every line of code directly influences multi-million dollar acquisitions, operational automation, and long-term enterprise value. Caprae's #BleedandBuild culture matches my personal drive to push limits and build world-class tools with compound impact.",
    ],
    takeaways: 'Desire to build proprietary software with direct deal impact; full cultural alignment with high horsepower, stamina, and founder-first DNA.',
  },
  {
    id: 'eta_transformation',
    category: 'business_understanding',
    title: 'How is Caprae Changing the ETA Space and Broader PE?',
    subtitle: 'Revolutionizing search funds from broker reliance to proprietary AI deal engines',
    paragraphs: [
      "Caprae Capital is fundamentally disrupting the Entrepreneurship Through Acquisition (ETA) space by dismantling the search fund community's greatest systemic failure: broker dependency and post-close operational stagnation. Traditional searchers spend 18 to 24 months cold-calling tired broker lists, paying inflated multiples for picked-over businesses, and then running the company with the exact same legacy tools for 5 years. Caprae replaces this broken paradigm with 'Search as a Service' and MaaS, weaponizing proprietary scraping platforms like SaaSquatch to unearth high-margin, off-market opportunities before they ever reach a banker's pitch deck.",
      "Post-acquisition, Caprae flips the traditional PE playbook on its head. Where mega-funds treat tech as a cost center or an outsourced IT ticket, Caprae introduces modular AI infrastructure immediately upon closing. An acquired legacy logistics, machining, or GovTech business is rapidly equipped with automated lead gen, AI-driven dispatch/quoting engines, and modern cloud microservices. This transforms a regional 1x-revenue business into a software-margin enterprise worthy of an institutional SaaS multiple.",
      "By backing searchers not just with passive capital, but with a full in-house technology studio, proprietary deal discovery, and a 7-year value creation roadmap, Caprae is redefining what it means to be a private equity sponsor in the 21st century. It turns searchers into tech-enabled titans who compete on unfair terms.",
    ],
    takeaways: 'Replaces broker dependency with proprietary AI deal discovery; turns old-school industrial cashflows into software-margin tech enterprises.',
  },
  {
    id: 'work_status_and_terms',
    category: 'employment_expectations',
    title: 'Employment Details & Terms Confirmation',
    subtitle: 'Clear, affirmative commitments to Caprae working standards',
    paragraphs: [
      "Here is my direct, unambiguous confirmation regarding all employment expectations and logistics:",
    ],
    bulletPoints: [
      "Working Status in the US: Legally authorized to work in the US without requiring visa sponsorship.",
      "Weekly Hours Commitment: Fully willing and able to work a minimum of 40 hours per week (and substantially more during critical sprints or production pushes).",
      "Why Caprae Capital: Direct alignment with the founder-operator mentality, high-conviction meritocracy, and the opportunity to build proprietary software driving PE transactions.",
      "Expected Salary: Competitive market rate commensurate with full-stack capability and impact ($90,000 - $130,000 depending on stage/level, open to performance and equity incentives aligned with Caprae's upside).",
      "Probationary Period: Fully understood and confirmed: 3-month probationary evaluation period upon start.",
      "Training Schedule: Fully confirmed: 9:00 AM - 6:00 PM EST with a 1-hour lunch break during the initial 2-3 month training program.",
      "Off-Hours Availability: Fully confirmed: Available during off-hours for time-sensitive production emergencies, customer-service critical fixes, or deployment sprints (< 2 hours/week). Zero issue whatsoever.",
      "Final Confirmation: All employment expectations outlined in the handbook are 100% understood, accepted, and enthusiastically confirmed.",
    ],
    takeaways: '100% affirmative agreement to all schedule, probationary, training, and emergency availability expectations.',
  },
  {
    id: 'reapplicant_questions',
    category: 'reapplicant_questions',
    title: 'Reapplicant / High-Conviction Core Questions',
    subtitle: 'Unfair advantages, legend slaying, and high-stamina culture',
    paragraphs: [
      "1. What is Caprae's Unfair Advantage? Caprae's unfair advantage is the closed-loop convergence of an institutional investment firm and an agile in-house software development house. Because Caprae builds proprietary tools like SaaSquatch Leads, its deal sourcing speed, data freshness, and lead qualification costs are a fraction of competitors who rely on ZoomInfo or broker intermediaries. Furthermore, this internal engineering muscle becomes the post-acquisition weapon that doubles portfolio company margins through custom AI operational injection.",
      "2. What does 'To become a legend, you must take down legends' mean to you? To me, it means having the audacious courage and relentless preparation to challenge incumbent monopolies, industry dogma, and established giants. In business and software, incumbent firms get lazy on legacy moats and bloated fees. Slaying legends does not happen through incremental tweaks; it happens by reimagining the game from first principles, moving with 10x greater speed, enduring hardships that competitors refuse to tolerate, and delivering a product so undeniably superior that the market has no choice but to shift.",
      "3. What do you think Caprae's culture will be like? Caprae's culture is an elite sports team, not a suburban day-care. It is intense, transparent, fast-paced, and demanding (#BleedandBuild). There is zero tolerance for passive clock-punchers, excuses, or political maneuvering. Communication is rapid and direct. People care deeply about mastering their craft, holding themselves and each other to an unrelenting standard of excellence, and having fun while winning against impossible odds.",
    ],
    takeaways: 'Proprietary software moat; first-principles disruption of lazy incumbents; intense, elite-sports-team meritocracy.',
  },
  {
    id: 'technical_architecture',
    category: 'technical_architecture',
    title: 'Engineered with Excellence: Full Stack Architecture',
    subtitle: 'Data storage, caching, headless crawling, and deployment blueprint',
    paragraphs: [
      "To meet Caprae's high-throughput requirements for SaaSquatch 2.0, the backend is engineered for sub-second query latency, continuous lead deduplication, and resilient multi-source scraping under anti-bot constraints:",
    ],
    bulletPoints: [
      "Data Storage Strategy: Managed PostgreSQL (GCP Cloud SQL / AWS RDS) with partitioned tables for domains, leads, and historical enrichment snapshots. B-tree indexes on normalized domain hashes (`md5(domain)`) and trigram indexes (`pg_trgm`) on company names and executive titles enable instantaneous fuzzy search across millions of records. Foreign keys link raw scrape runs to enriched decision-maker dossiers.",
      "Caching & Performance Optimization: High-performance Redis (Cloud Memorystore / Upstash) caching layer. Domain lookups are cached with a 72-hour TTL to prevent redundant web scrapes. Sliding-window rate limiters protect downstream scrapers from target IP bans. Heavy JSON lead serializations and export bundles are cached in Redis buffers.",
      "Scraping & Ingestion Engine: Distributed asynchronous worker pool utilizing Playwright/Puppeteer in headless Docker containers managed via BullMQ/Celery. Uses residential rotating proxy pools (BrightData / Oxylabs) with automatic TLS fingerprint spoofing and stealth evasion plugins to bypass Cloudflare/DataDome blocks. Ingestion pipeline streams events via WebSocket/SSE to client interfaces.",
      "AI & Enrichment Layer: Server-side integration with Google Gemini 3.8 Flash (`@google/genai`). Extracts company thesis, EBITDA estimates, and multi-channel outreach pitches directly from scraped DOM markdown with structured JSON schema outputs.",
      "Email Verification Engine: Real-time asynchronous MX lookup (DNS query via native node dns.promises), SMTP handshake simulation (HELO/EHLO without sending DATA packets), regex RFC-5322 compliance, and disposable email blacklist matching.",
      "Hosting & Deployment Setup: Containerized via multi-stage Docker build, hosted on Google Cloud Run with autoscaling (0 to N instances) and Google Cloud CDN for static assets. Dev server runs Express with Vite middleware on port 3000.",
    ],
    takeaways: 'PostgreSQL + Redis caching + Playwright stealth workers + Cloud Run serverless + Gemini 3.8 Flash SDK.',
  },
  {
    id: 'video_script',
    category: 'video_script',
    title: '2-Minute Video Presentation Script',
    subtitle: 'Comprehensive, timed teleprompter script for handbook video submission',
    paragraphs: [
      "Here is the exact 120-second narration script for the required video submission to recruiting@capraecapital.com:",
    ],
    bulletPoints: [
      "[0:00 - 0:18] Introduction & Business Intent: 'Hi Kevin and the Caprae Capital team. My name is [Your Name], and this is my submission for the Full Stack Developer Challenge. I built SaaSQuatch 2.0 with a Quality-First mindset, directly engineered to solve Caprae's core mandate: uncovering off-market, high-horsepower acquisition targets and driving post-acquisition value without relying on broken broker pipelines.'",
      "[0:18 - 0:42] The Lead Generation & Live Scraping Engine: 'Let's look at the live tool. Unlike generic scrapers that flood users with dead emails, SaaSQuatch 2.0 filters by proprietary Search Fund signals—such as founder retirement risk, bootstrapped balance sheets, and legacy software stacks. When we trigger a scrape, our engine simulates real-time DOM parsing, MX record validation, and deliverability checks, tagging leads with verified deliverability scores to protect your outbound sender reputation.'",
      "[0:42 - 1:12] Gemini AI Enrichment & Deal Thesis: 'Next is the core breakthrough: Deep AI Enrichment. Clicking on any target—like ApexDispatch—triggers our server-side Gemini 3.8 Flash engine. It doesn't just scrape; it synthesizes an institutional acquisition thesis, calculates estimated EBITDA margins, identifies operational bottlenecks, and drafts four distinct outreach sequences—including a founder-to-founder succession pitch written specifically in Kevin's direct, non-broker style.'",
      "[1:12 - 1:35] Architecture & Scalability: 'Under the hood, the architecture is built for production scale: a normalized PostgreSQL schema with domain-hash indexing, a Redis caching layer for deduplication, and an asynchronous headless worker pool with residential proxy rotation. All AI calls run securely server-side through the official Google GenAI SDK.'",
      "[1:35 - 2:00] Cultural Alignment & Conclusion: 'Finally, this app embeds my full pre-work dossier answering Caprae's mission, culture, and terms. I believe in horsepower over mileage, and I'm ready to bring that exact stamina and crazy to Caprae's tech team. Thank you, and I look forward to meeting you on the other side.'",
    ],
    takeaways: 'Ready-to-record 2-minute script timed with video cues, technical proof, and cultural conviction.',
  },
];
