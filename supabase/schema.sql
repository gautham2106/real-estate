-- ══════════════════════════════════════════════════════════
--  Bluesquare Real Estate CRM — Database Schema
-- ══════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── BROKERS ──────────────────────────────────────────────

CREATE TABLE brokers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT UNIQUE NOT NULL,
  photo_url TEXT,
  area_coverage TEXT,
  recruited_by_id UUID REFERENCES brokers(id),
  co_sponsor_1_id UUID REFERENCES brokers(id),
  co_sponsor_2_id UUID REFERENCES brokers(id),
  tier_level TEXT NOT NULL DEFAULT 'Starter' CHECK (tier_level IN ('Starter','Active','Star','Elite','Coordinator')),
  brokers_recruited INTEGER DEFAULT 0,
  override_earnings NUMERIC DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  total_commission_earned NUMERIC DEFAULT 0,
  active_leads_count INTEGER DEFAULT 0,
  total_seller_leads INTEGER DEFAULT 0,
  total_buyer_leads INTEGER DEFAULT 0,
  login_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  joined_date DATE DEFAULT CURRENT_DATE,
  broker_agreement_url TEXT,
  nda_url TEXT,
  bank_account TEXT,
  upi_id TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive','Blacklisted')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BOOKS ────────────────────────────────────────────────

CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id TEXT UNIQUE NOT NULL,
  book_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','Active','Archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PROPERTIES ───────────────────────────────────────────

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  land_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Plot','House','Farm','Commercial')),
  classification TEXT NOT NULL CHECK (classification IN ('Agricultural','Residential','Commercial')),
  area NUMERIC NOT NULL,
  area_unit TEXT NOT NULL CHECK (area_unit IN ('Sqft','Cents','Acres')),
  price NUMERIC NOT NULL,
  price_per_sqft NUMERIC GENERATED ALWAYS AS (
    CASE WHEN area > 0 AND area_unit = 'Sqft' THEN price / area ELSE NULL END
  ) STORED,
  side_a NUMERIC,
  side_b NUMERIC,
  side_c NUMERIC,
  side_d NUMERIC,
  facing TEXT CHECK (facing IN ('N','S','E','W')),
  gps_lat NUMERIC,
  gps_lng NUMERIC,
  address TEXT,
  landmark TEXT,
  village TEXT,
  taluk TEXT,
  district TEXT,
  road_access TEXT,
  water TEXT,
  electricity BOOLEAN,
  survey_number TEXT,
  patta_number TEXT,
  dtcp_approved TEXT CHECK (dtcp_approved IN ('Yes','No','Applied')),
  rera_applicable BOOLEAN,
  legal_status TEXT CHECK (legal_status IN ('Clear','Disputed','Pending')),
  -- Owner info (admin only)
  owner_name TEXT,
  owner_phone TEXT,
  owner_whatsapp TEXT,
  owner_aadhaar TEXT,
  owner_pan TEXT,
  -- Exclusivity
  exclusivity_start DATE,
  exclusivity_end DATE,
  exclusivity_status TEXT,
  exclusivity_agreement_url TEXT,
  -- Marketing
  marketing_status TEXT DEFAULT 'Not Started',
  video_link TEXT,
  -- Management
  assigned_broker_id UUID REFERENCES brokers(id),
  book_id UUID REFERENCES books(id),
  status TEXT NOT NULL DEFAULT 'Available',
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── SELLER LEADS ─────────────────────────────────────────

CREATE TABLE seller_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id TEXT UNIQUE NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  property_location TEXT NOT NULL,
  approximate_area TEXT,
  asking_price NUMERIC,
  property_type TEXT,
  reason_for_selling TEXT,
  document_status TEXT,
  source TEXT,
  added_by_broker_id UUID REFERENCES brokers(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_to UUID REFERENCES brokers(id),
  status TEXT NOT NULL DEFAULT 'New',
  follow_up_date DATE,
  notes_history JSONB DEFAULT '[]',
  converted_property_id UUID REFERENCES properties(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BUYER LEADS ──────────────────────────────────────────

CREATE TABLE buyer_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  preferred_location TEXT,
  property_type_needed TEXT,
  area_required TEXT,
  purpose TEXT CHECK (purpose IN ('Investment','Construction','Agriculture')),
  loan_required BOOLEAN,
  loan_amount NUMERIC,
  urgency TEXT CHECK (urgency IN ('Immediate','3 months','6 months')),
  source TEXT,
  added_by_broker_id UUID REFERENCES brokers(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_to UUID REFERENCES brokers(id),
  status TEXT NOT NULL DEFAULT 'New',
  follow_up_date DATE,
  notes_history JSONB DEFAULT '[]',
  converted_deal_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SITE VISITS ──────────────────────────────────────────

CREATE TABLE site_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id TEXT UNIQUE NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id),
  buyer_id UUID NOT NULL REFERENCES buyer_leads(id),
  visit_date DATE NOT NULL,
  visit_time TIME,
  broker_id UUID REFERENCES brokers(id),
  buyer_reaction TEXT CHECK (buyer_reaction IN ('Interested','Not Interested','Negotiating','Need Time')),
  buyer_remarks TEXT,
  owner_remarks TEXT,
  price_discussed NUMERIC,
  objections TEXT,
  internal_note TEXT,
  next_action TEXT,
  next_action_date DATE,
  outcome TEXT CHECK (outcome IN ('Progressed','Dropped')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DEALS ────────────────────────────────────────────────

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id TEXT UNIQUE NOT NULL,
  deal_title TEXT NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id),
  buyer_lead_id UUID NOT NULL REFERENCES buyer_leads(id),
  seller_lead_id UUID REFERENCES seller_leads(id),
  buyer_broker_id UUID REFERENCES brokers(id),
  seller_broker_id UUID REFERENCES brokers(id),
  referral_broker_id UUID REFERENCES brokers(id),
  co_sponsor_broker_1_id UUID REFERENCES brokers(id),
  co_sponsor_broker_2_id UUID REFERENCES brokers(id),
  tier1_override_broker_id UUID REFERENCES brokers(id),
  tier2_override_broker_id UUID REFERENCES brokers(id),
  deal_value NUMERIC NOT NULL,
  buyer_commission_pct NUMERIC NOT NULL DEFAULT 2,
  seller_commission_pct NUMERIC NOT NULL DEFAULT 2,
  total_commission NUMERIC GENERATED ALWAYS AS (
    deal_value * (buyer_commission_pct + seller_commission_pct) / 100
  ) STORED,
  buyer_broker_payout NUMERIC,
  seller_broker_payout NUMERIC,
  referral_payout NUMERIC,
  tier1_override_payout NUMERIC,
  tier2_override_payout NUMERIC,
  your_net NUMERIC,
  token_amount NUMERIC,
  token_date DATE,
  advance_amount NUMERIC,
  advance_date DATE,
  final_amount NUMERIC,
  final_date DATE,
  mou_date DATE,
  mou_document_url TEXT,
  registration_date DATE,
  registration_document_url TEXT,
  loan_required BOOLEAN,
  loan_status TEXT DEFAULT 'Not Applied',
  loan_amount NUMERIC,
  bank_name TEXT,
  status TEXT NOT NULL DEFAULT 'Created',
  closed_reason TEXT,
  commission_payment_status TEXT DEFAULT 'Pending',
  commission_released_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DOCUMENTS ────────────────────────────────────────────

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id TEXT UNIQUE NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id),
  folder TEXT NOT NULL CHECK (folder IN ('Legal','Survey','Photos','Owner Docs','Agreements')),
  document_name TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Received','Verified','Issue','Original Submitted')),
  issue_notes TEXT,
  uploaded_by TEXT,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  verified_by TEXT,
  verified_date TIMESTAMPTZ
);

-- ─── ALERTS ───────────────────────────────────────────────

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  related_type TEXT,
  is_done BOOLEAN DEFAULT false,
  snoozed_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ACTIVITY LOG ─────────────────────────────────────────

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  actor TEXT NOT NULL,
  related_id UUID,
  related_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SEED DATA (sequences for IDs) ───────────────────────

CREATE SEQUENCE IF NOT EXISTS property_seq START 1;
CREATE SEQUENCE IF NOT EXISTS seller_lead_seq START 1;
CREATE SEQUENCE IF NOT EXISTS buyer_lead_seq START 1;
CREATE SEQUENCE IF NOT EXISTS site_visit_seq START 1;
CREATE SEQUENCE IF NOT EXISTS deal_seq START 1;
CREATE SEQUENCE IF NOT EXISTS broker_seq START 1;
CREATE SEQUENCE IF NOT EXISTS document_seq START 1;
CREATE SEQUENCE IF NOT EXISTS book_seq START 1;

-- Auto-generate land codes: BLU-YYYY-NNN
CREATE OR REPLACE FUNCTION generate_land_code()
RETURNS TEXT AS $$
  SELECT 'BLU-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(nextval('property_seq')::TEXT, 3, '0');
$$ LANGUAGE SQL;

-- ─── DEMO DATA ────────────────────────────────────────────

INSERT INTO brokers (broker_id, name, phone, email, tier_level, deals_closed, total_commission_earned, status, joined_date) VALUES
  ('BRK-001', 'Arjun Kumar', '9876543210', 'arjun@bluesquare.in', 'Elite', 6, 180000, 'Active', '2025-01-15'),
  ('BRK-002', 'Priya Sharma', '9876543211', 'priya@bluesquare.in', 'Star', 4, 120000, 'Active', '2025-02-10'),
  ('BRK-003', 'Rajesh Nair', '9876543212', 'rajesh@bluesquare.in', 'Star', 3, 90000, 'Active', '2025-03-01'),
  ('BRK-004', 'Kavitha Raj', '9876543213', 'kavitha@bluesquare.in', 'Active', 1, 30000, 'Active', '2025-06-20'),
  ('BRK-005', 'Suresh Babu', '9876543214', 'suresh@bluesquare.in', 'Active', 2, 60000, 'Active', '2025-05-05');
