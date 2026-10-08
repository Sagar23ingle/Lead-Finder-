# LeadFinder AI — Production AI Lead Finder + Opportunity Engine (Parts 1 & 2)

A fast, production-grade B2B lead generation and intelligence system engineered for digital agencies to discover, audit, score, and close high-value website and design clients.

> **Production Policy:** Zero synthetic/fake leads. All leads are discovered directly from real business data, audited via live HTTP inspection, and scored using real signals. If credentials or services are unconfigured, clear setup guidance is displayed instead of mock responses.

---

## ⚡ What's New in Part 2: AI Lead Analysis & Opportunity Engine

The system does not simply collect businesses — it **identifies the highest-probability client opportunities**:

1. **Live Website Audit (Real HTTP Inspection)**
   - Checks if a website exists. If not, flags it as a primary website acquisition opportunity (+35 score).
   - If a website exists, performs live server-side HTTP request and inspects:
     - Response status & latency in ms
     - SSL (HTTPS) certificate status
     - Mobile usability (`<meta name="viewport">` check)
     - Meta description & basic SEO tags
     - Direct WhatsApp funnel presence (`wa.me` detection)
     - Contact options (`tel:`, `mailto:`, inquiry forms)
     - Clear CTA buttons ("Book", "Quote", "Consultation")
     - Social presence (Instagram, Facebook, LinkedIn, YouTube)
   - *Never claims to check anything that was not actually inspected.*

2. **0–100 Lead Opportunity Score**
   - Automatically ranks leads into 3 actionable tiers:
     - **🔥 HOT (75–100)**: Proven client volume and high reviews, but NO website or a broken site. Highest closing probability.
     - **⚡ WARM (50–74)**: Active business with an outdated website lacking mobile optimization, SSL, or a WhatsApp funnel.
     - **⚪ LOW (<50)**: Modern website already equipped with active lead funnels, or zero reviews/activity.
   - Shows a transparent itemized point breakdown for every score.

3. **AI Opportunity Report**
   - **Main Problem**: Root cause bottleneck (e.g., *"Zero digital portfolio despite 42 Google reviews in Nagpur"*).
   - **Why It Matters**: Concrete impact on their revenue (e.g., *"Losing 40–60% of mobile search traffic to competitors"*).
   - **What Should Be Improved**: Exact architectural fixes.
   - **Recommended Service & Suggested Offer**: Packaged agency offering (e.g., *"Turnkey 5-Page Portfolio + 1-Click WhatsApp Booking"*).
   - **Suggested Price Range**: Realistic local market estimate (e.g., *"₹28,000 – ₹48,000 / $550 – $950 [AI Estimate]"*).
   - **Best Outreach Angle**: Specific psychological hook based on their real reviews and weaknesses.

4. **Personalized Multi-Channel Outreach Copy**
   - **WhatsApp Message**: Short, conversational, references real review ratings and city, includes interactive demo link, with a 1-click **"Open in WhatsApp"** button.
   - **Cold Email**: Subject line + problem-first body focusing on their specific conversion gap.
   - **Instagram / LinkedIn DM**: Quick casual opening with 1-click copy.

5. **AI Website Demo Generator (`/demo/[businessId]`)**
   - Automatically generates a personalized, interactive, mobile-responsive landing page concept for the lead.
   - Tailored to their real business name, category, city, phone, and Google rating.
   - Features customized services, client testimonials, and WhatsApp consultation capture.
   - Includes a **"Copy Shareable Link"** button and a **"Share Pitch via WhatsApp"** button prefilled with the custom pitch for agency owners!

6. **Interactive AI Sales Assistant**
   - Objection handling playbook built into every lead:
     - *"Too expensive"*
     - *"Already have enough clients / word of mouth"*
     - *"Send proposal / details"*
     - *"Not interested right now"*
   - **Prospect Reply Simulator**: Paste any live client response to get instant tactical advice on how to respond and move toward a 10-minute demo call.

7. **Business Intelligence ("Best Opportunities")**
   - Aggregates intelligence across all discovered businesses.
   - Highlights the highest-converting niche and top-performing city.
   - Flags low-priority time-wasters vs high-margin prospects.

---

## 🆓 100% Free Architecture (No Paid Subscriptions Required)

Per the **Free-First Requirement**, the entire core system works **100% FREE**:

- **Built-in Local Opportunity & Audit Engine ($0 / No API Key required):**
  - Performs live HTTP website inspections, computes 0–100 scores, writes custom outreach copy, renders interactive demo websites, and powers the Sales Assistant locally on your machine with zero external fees.
- **Google Gemini AI (Optional 100% Free Tier):**
  - You can optionally add a free `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/) for extra LLM polishing, with zero billing required.
- **Database ($0):**
  - Includes automated persistent local disk storage (`data/leads_storage.json`), or free-tier Supabase PostgreSQL.
- **Google Maps Platform:**
  - Includes Google's recurring $200/month free tier credit covering thousands of Places discovery requests.

---

## 🚀 Quick Setup

### 1. Environment Configuration

Create `.env.local` in the project root:

```env
# 1. Google Maps Platform API Key (Required for live business discovery)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# 2. Google Gemini API Key (Optional Free Tier from https://aistudio.google.com/)
GEMINI_API_KEY=

# 3. Supabase Credentials (Optional: if omitted, automatic persistent local storage is used)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 2. Run the Application

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Part 2 Acceptance Test Verification

1. **Discover Leads:**
   - Search: `India` / `Nagpur` / `Interior Designers` / `10 leads`.
2. **Batch AI Audit:**
   - Click **"Run AI Opportunity Audit on All"** in the table header.
   - The engine performs live HTTP inspection, computes 0–100 scores, and classifies each lead into **HOT**, **WARM**, or **LOW**.
3. **Inspect Lead Modal:**
   - Click any lead or **"Analyze"** button.
   - Review live HTTP audit results (latency, SSL, mobile viewport, WhatsApp funnel).
   - View recommended package, pricing anchor, and best outreach angle.
   - Copy or send personalized WhatsApp, Email, or DM outreach.
4. **Test Live Demo Concept:**
   - Click **"Open Live Demo"** or the eye icon in the table.
   - Opens `/demo/[businessId]` showcasing the tailored responsive concept with 1-click WhatsApp pitch sharing.
5. **Simulate Sales Assistant:**
   - In the modal's Sales Assistant tab, type: *"How much does it cost? We have a tight budget"*.
   - Review the tactical closing advice and copy the suggested response.
6. **Persistence & Refresh:**
   - Refresh the page (`F5`). All analyses, scores, demos, and history remain saved in the database.
