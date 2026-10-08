-- ====================================================================
-- AI LEAD FINDER - PART 1 DATABASE SCHEMA (Supabase / PostgreSQL)
-- ====================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Businesses table
-- Stores discovered real-world businesses with duplicate prevention via external_id (Google Place ID)
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,               -- Stable Google Place ID or external identifier
    name TEXT NOT NULL,
    category TEXT,                                 -- e.g. "Interior Designer", "Architect"
    address TEXT,
    city TEXT,
    country TEXT,
    phone TEXT,
    website TEXT,
    google_maps_url TEXT,
    rating NUMERIC(2, 1),
    review_count INTEGER DEFAULT 0,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    opening_status TEXT,                           -- e.g. "OPERATIONAL", "CLOSED_TEMPORARILY"
    source TEXT NOT NULL DEFAULT 'google_places',  -- Data source provenance
    raw_data JSONB,                                -- Raw API response stored separately
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for businesses
CREATE INDEX IF NOT EXISTS idx_businesses_external_id ON businesses(external_id);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);

-- 3. Searches table
-- Tracks every user query and parameters
CREATE TABLE IF NOT EXISTS searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,                           -- e.g. "Interior Designers — Nagpur — 50 leads"
    niche TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    leads_requested INTEGER NOT NULL,
    leads_found INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for searches history
CREATE INDEX IF NOT EXISTS idx_searches_created_at ON searches(created_at DESC);

-- 4. Junction table: search_businesses
-- Maps which businesses were returned in each search
CREATE TABLE IF NOT EXISTS search_businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_id UUID NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_search_business UNIQUE(search_id, business_id)
);

CREATE INDEX IF NOT EXISTS idx_search_businesses_search_id ON search_businesses(search_id);
CREATE INDEX IF NOT EXISTS idx_search_businesses_business_id ON search_businesses(business_id);

-- 5. Lead Scores table
-- Schema-ready for lead scoring and qualification in future parts
CREATE TABLE IF NOT EXISTS lead_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    score NUMERIC(4, 1) DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'new',            -- 'new', 'qualified', 'contacted', 'unqualified'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_scores_business_id ON lead_scores(business_id);

-- 6. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trg_businesses_updated_at ON businesses;
CREATE TRIGGER trg_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_lead_scores_updated_at ON lead_scores;
CREATE TRIGGER trg_lead_scores_updated_at
    BEFORE UPDATE ON lead_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Row Level Security (RLS) setup (Open for service role / anon read/write in Part 1)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to businesses" ON businesses FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update to businesses" ON businesses FOR ALL USING (true);

CREATE POLICY "Allow public read access to searches" ON searches FOR SELECT USING (true);
CREATE POLICY "Allow public insert to searches" ON searches FOR ALL USING (true);

CREATE POLICY "Allow public read access to search_businesses" ON search_businesses FOR SELECT USING (true);
CREATE POLICY "Allow public insert to search_businesses" ON search_businesses FOR ALL USING (true);

CREATE POLICY "Allow public read access to lead_scores" ON lead_scores FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update to lead_scores" ON lead_scores FOR ALL USING (true);
