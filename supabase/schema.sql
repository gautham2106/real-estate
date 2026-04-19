-- ══════════════════════════════════════════════════════════════════
--  BLUESQUARE REAL ESTATE CRM — COMPLETE DATABASE SCHEMA
--  Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ══════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- 1. EXTENSIONS
-- ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ────────────────────────────────────────────────────────────────
-- 2. SEQUENCES  (atomic ID counters — called via nextval() RPC)
-- ────────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS property_seq     START 1;
CREATE SEQUENCE IF NOT EXISTS buyer_lead_seq   START 1;
CREATE SEQUENCE IF NOT EXISTS seller_lead_seq  START 1;
CREATE SEQUENCE IF NOT EXISTS site_visit_seq   START 1;
CREATE SEQUENCE IF NOT EXISTS deal_seq         START 1;
CREATE SEQUENCE IF NOT EXISTS broker_seq       START 1;
CREATE SEQUENCE IF NOT EXISTS document_seq     START 1;
CREATE SEQUENCE IF NOT EXISTS book_seq         START 1;


-- ────────────────────────────────────────────────────────────────
-- 3. TABLES  (in dependency order)
-- ────────────────────────────────────────────────────────────────

-- ── 3a. BROKERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brokers (
  id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id               TEXT    UNIQUE NOT NULL,         -- BRK-001
  auth_user_id            UUID    UNIQUE,                  -- → auth.users.id
  name                    TEXT    NOT NULL,
  phone                   TEXT    NOT NULL,
  whatsapp                TEXT,
  email                   TEXT    UNIQUE NOT NULL,
  photo_url               TEXT,
  area_coverage           TEXT,
  -- network hierarchy (self-referential)
  recruited_by_id         UUID    REFERENCES brokers(id) ON DELETE SET NULL,
  co_sponsor_1_id         UUID    REFERENCES brokers(id) ON DELETE SET NULL,
  co_sponsor_2_id         UUID    REFERENCES brokers(id) ON DELETE SET NULL,
  -- tier & performance (denormalised for leaderboard speed)
  tier_level              TEXT    NOT NULL DEFAULT 'Starter'
                            CHECK (tier_level IN ('Starter','Active','Star','Elite','Coordinator')),
  brokers_recruited       INT     NOT NULL DEFAULT 0,
  override_earnings       NUMERIC(14,2) NOT NULL DEFAULT 0,
  deals_closed            INT     NOT NULL DEFAULT 0,
  total_commission_earned NUMERIC(14,2) NOT NULL DEFAULT 0,
  active_leads_count      INT     NOT NULL DEFAULT 0,
  total_seller_leads      INT     NOT NULL DEFAULT 0,
  total_buyer_leads       INT     NOT NULL DEFAULT 0,
  -- access
  login_active            BOOLEAN NOT NULL DEFAULT true,
  last_login              TIMESTAMPTZ,
  joined_date             DATE    NOT NULL DEFAULT CURRENT_DATE,
  -- documents
  broker_agreement_url    TEXT,
  nda_url                 TEXT,
  bank_account            TEXT,
  upi_id                  TEXT,
  status                  TEXT    NOT NULL DEFAULT 'Active'
                            CHECK (status IN ('Active','Inactive','Blacklisted')),
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3b. BOOKS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id     TEXT UNIQUE NOT NULL,    -- BOOK-001
  book_name   TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'Open'
                CHECK (status IN ('Open','Active','Archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3c. PROPERTIES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS properties (
  id                        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  land_code                 TEXT    UNIQUE NOT NULL,   -- BLU-2026-001
  title                     TEXT    NOT NULL,
  type                      TEXT    NOT NULL DEFAULT 'Plot'
                              CHECK (type IN ('Plot','House','Farm','Commercial')),
  classification            TEXT    NOT NULL DEFAULT 'Residential'
                              CHECK (classification IN ('Agricultural','Residential','Commercial')),
  area                      NUMERIC(10,2) NOT NULL,
  area_unit                 TEXT    NOT NULL DEFAULT 'Sqft'
                              CHECK (area_unit IN ('Sqft','Cents','Acres')),
  price                     NUMERIC(14,2) NOT NULL,
  -- computed: only meaningful when area_unit = Sqft
  price_per_sqft            NUMERIC(10,2) GENERATED ALWAYS AS (
                              CASE WHEN area > 0 AND area_unit = 'Sqft'
                              THEN ROUND(price / area, 2) ELSE NULL END
                            ) STORED,
  -- plot shape (ft)
  side_a                    NUMERIC(8,2),   -- front (road side)
  side_b                    NUMERIC(8,2),   -- right
  side_c                    NUMERIC(8,2),   -- back
  side_d                    NUMERIC(8,2),   -- left
  facing                    TEXT CHECK (facing IN ('N','S','E','W')),
  -- GPS
  gps_lat                   NUMERIC(11,7),
  gps_lng                   NUMERIC(11,7),
  -- location
  address                   TEXT,
  landmark                  TEXT,
  village                   TEXT,
  taluk                     TEXT,
  district                  TEXT,
  -- features
  road_access               TEXT,   -- 'Yes' | 'No' | description
  water                     TEXT    CHECK (water IN ('Yes','No','Borewell','Government')),
  electricity               BOOLEAN NOT NULL DEFAULT false,
  -- legal
  survey_number             TEXT,
  patta_number              TEXT,
  dtcp_approved             TEXT    CHECK (dtcp_approved IN ('Yes','No','Applied')),
  rera_applicable           BOOLEAN NOT NULL DEFAULT false,
  legal_status              TEXT    CHECK (legal_status IN ('Clear','Disputed','Pending')),
  -- owner info (admin-only — enforce in RLS + app layer)
  owner_name                TEXT,
  owner_phone               TEXT,
  owner_whatsapp            TEXT,
  owner_aadhaar             TEXT,
  owner_pan                 TEXT,
  -- exclusivity
  exclusivity_start         DATE,
  exclusivity_end           DATE,
  exclusivity_status        TEXT,
  exclusivity_agreement_url TEXT,
  -- marketing & media
  marketing_status          TEXT    DEFAULT 'Not Started'
                              CHECK (marketing_status IN ('Not Started','Video Shot','Listed','Promoted')),
  video_link                TEXT,
  photo_urls                TEXT[]  NOT NULL DEFAULT '{}',
  -- management
  assigned_broker_id        UUID    REFERENCES brokers(id) ON DELETE SET NULL,
  book_id                   UUID    REFERENCES books(id) ON DELETE SET NULL,
  status                    TEXT    NOT NULL DEFAULT 'Available'
                              CHECK (status IN (
                                'Available','Enquiry Received','Site Visit Done','Negotiating',
                                'Token Received','MOU Signed','Loan Processing',
                                'Registration Scheduled','Registration Done',
                                'Sold','On Hold','Exclusivity Expired','Cancelled'
                              )),
  internal_notes            TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3d. SELLER LEADS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seller_leads (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id               TEXT UNIQUE NOT NULL,   -- SL-001
  owner_name            TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  whatsapp              TEXT,
  property_location     TEXT NOT NULL,
  approximate_area      TEXT,
  asking_price          NUMERIC(14,2),
  property_type         TEXT CHECK (property_type IN ('Plot','House','Farm','Commercial')),
  reason_for_selling    TEXT,
  document_status       TEXT,
  source                TEXT CHECK (source IN (
                          'Instagram','Facebook','WhatsApp','Referral','Walk-in','Website','Other'
                        )),
  added_by_broker_id    UUID REFERENCES brokers(id) ON DELETE SET NULL,
  added_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_to           UUID REFERENCES brokers(id) ON DELETE SET NULL,
  status                TEXT NOT NULL DEFAULT 'New'
                          CHECK (status IN (
                            'New','Contacted','Property Verified','Video Shot','Listed',
                            'Enquiry Received','Negotiating','MOU Signed','Sold','Withdrawn'
                          )),
  follow_up_date        DATE,
  -- array of {timestamp, author, text, interaction_type?} objects
  notes_history         JSONB NOT NULL DEFAULT '[]',
  converted_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3e. BUYER LEADS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS buyer_leads (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id              TEXT UNIQUE NOT NULL,   -- BL-001
  name                 TEXT NOT NULL,
  phone                TEXT NOT NULL,
  whatsapp             TEXT,
  email                TEXT,
  -- requirements
  budget_min           NUMERIC(14,2),
  budget_max           NUMERIC(14,2),
  preferred_location   TEXT,
  property_type_needed TEXT CHECK (property_type_needed IN ('Plot','House','Farm','Commercial')),
  area_required        TEXT,
  purpose              TEXT CHECK (purpose IN ('Investment','Construction','Agriculture','Residential')),
  loan_required        BOOLEAN NOT NULL DEFAULT false,
  loan_amount          NUMERIC(14,2),
  urgency              TEXT CHECK (urgency IN ('Immediate','3 months','6 months')),
  -- attribution
  source               TEXT CHECK (source IN (
                         'Instagram','Facebook','WhatsApp','Referral','Walk-in','Website','Other'
                       )),
  added_by_broker_id   UUID REFERENCES brokers(id) ON DELETE SET NULL,
  added_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_to          UUID REFERENCES brokers(id) ON DELETE SET NULL,
  -- workflow
  status               TEXT NOT NULL DEFAULT 'New'
                         CHECK (status IN (
                           'New','Contacted','Requirement Understood','Property Matched',
                           'Site Visit Scheduled','Site Visited','Negotiating','Token Paid',
                           'MOU Signed','Loan Applied','Registration Done','Converted','Lost'
                         )),
  properties_visited   UUID[]  NOT NULL DEFAULT '{}',
  follow_up_date       DATE,
  -- interaction history — each entry: {timestamp, author, text, interaction_type?}
  notes_history        JSONB NOT NULL DEFAULT '[]',
  -- referral
  referred_by_name     TEXT,
  referred_by_phone    TEXT,
  -- conversion (FK added after deals table exists)
  converted_deal_id    UUID,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3f. SITE VISITS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_visits (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id         TEXT UNIQUE NOT NULL,   -- SV-001
  property_id      UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id         UUID NOT NULL REFERENCES buyer_leads(id) ON DELETE CASCADE,
  broker_id        UUID REFERENCES brokers(id) ON DELETE SET NULL,
  visit_date       DATE NOT NULL,
  visit_time       TIME,
  buyer_reaction   TEXT CHECK (buyer_reaction IN ('Interested','Not Interested','Negotiating','Need Time')),
  buyer_remarks    TEXT,
  owner_remarks    TEXT,
  price_discussed  NUMERIC(14,2),
  objections       TEXT,
  internal_note    TEXT,
  next_action      TEXT,
  next_action_date DATE,
  outcome          TEXT CHECK (outcome IN ('Progressed','Dropped')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3g. DEALS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id                     TEXT UNIQUE NOT NULL,   -- DEAL-001
  deal_title                  TEXT NOT NULL,
  -- linked entities
  property_id                 UUID NOT NULL REFERENCES properties(id),
  buyer_lead_id               UUID NOT NULL REFERENCES buyer_leads(id),
  seller_lead_id              UUID REFERENCES seller_leads(id) ON DELETE SET NULL,
  -- brokers involved in the deal
  buyer_broker_id             UUID REFERENCES brokers(id) ON DELETE SET NULL,
  seller_broker_id            UUID REFERENCES brokers(id) ON DELETE SET NULL,
  referral_broker_id          UUID REFERENCES brokers(id) ON DELETE SET NULL,
  co_sponsor_broker_1_id      UUID REFERENCES brokers(id) ON DELETE SET NULL,
  co_sponsor_broker_2_id      UUID REFERENCES brokers(id) ON DELETE SET NULL,
  tier1_override_broker_id    UUID REFERENCES brokers(id) ON DELETE SET NULL,
  tier2_override_broker_id    UUID REFERENCES brokers(id) ON DELETE SET NULL,
  -- commission structure
  deal_value                  NUMERIC(14,2) NOT NULL,
  buyer_commission_pct        NUMERIC(5,2)  NOT NULL DEFAULT 2.00,
  seller_commission_pct       NUMERIC(5,2)  NOT NULL DEFAULT 2.00,
  total_commission            NUMERIC(14,2) GENERATED ALWAYS AS (
                                ROUND(deal_value * (buyer_commission_pct + seller_commission_pct) / 100, 2)
                              ) STORED,
  -- broker payouts (calculated by app and stored)
  buyer_broker_payout         NUMERIC(14,2),
  seller_broker_payout        NUMERIC(14,2),
  referral_payout             NUMERIC(14,2),
  co_sponsor_1_payout         NUMERIC(14,2),
  co_sponsor_2_payout         NUMERIC(14,2),
  tier1_override_payout       NUMERIC(14,2),
  tier2_override_payout       NUMERIC(14,2),
  your_net                    NUMERIC(14,2),
  -- payment milestones
  token_amount                NUMERIC(14,2),
  token_date                  DATE,
  advance_amount              NUMERIC(14,2),
  advance_date                DATE,
  final_amount                NUMERIC(14,2),
  final_date                  DATE,
  -- documents
  mou_date                    DATE,
  mou_document_url            TEXT,
  registration_date           DATE,
  registration_document_url   TEXT,
  -- loan
  loan_required               BOOLEAN NOT NULL DEFAULT false,
  loan_status                 TEXT    DEFAULT 'Not Applied'
                                CHECK (loan_status IN ('Not Applied','Applied','Approved','Rejected','Disbursed')),
  loan_amount                 NUMERIC(14,2),
  bank_name                   TEXT,
  -- workflow
  status                      TEXT    NOT NULL DEFAULT 'Created'
                                CHECK (status IN (
                                  'Created','Site Visit Done','Negotiation Active','Token Paid',
                                  'MOU Signed','Documents Verified','Loan Processing',
                                  'Registration Scheduled','Registration Done',
                                  'Closed Won','Closed Lost'
                                )),
  closed_reason               TEXT,
  commission_payment_status   TEXT    DEFAULT 'Pending'
                                CHECK (commission_payment_status IN ('Pending','Partial','Released')),
  commission_released_date    DATE,
  notes                       TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deferred FK: buyer_leads.converted_deal_id → deals
ALTER TABLE buyer_leads
  ADD CONSTRAINT fk_buyer_leads_converted_deal
  FOREIGN KEY (converted_deal_id) REFERENCES deals(id) ON DELETE SET NULL;

-- ── 3h. DOCUMENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   TEXT UNIQUE NOT NULL,   -- DOC-001
  property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  folder        TEXT NOT NULL DEFAULT 'Legal'
                  CHECK (folder IN ('Legal','Survey','Photos','Owner Docs','Agreements')),
  document_name TEXT NOT NULL,
  file_url      TEXT,
  file_size     INT,             -- bytes
  status        TEXT NOT NULL DEFAULT 'Pending'
                  CHECK (status IN ('Pending','Received','Verified','Issue','Original Submitted')),
  issue_notes   TEXT,
  uploaded_by   TEXT,
  uploaded_at   TIMESTAMPTZ DEFAULT now(),
  verified_by   TEXT,
  verified_date TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3i. ALERTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL
                  CHECK (type IN (
                    'Exclusivity Expiring','Follow Up Due','Deal Stuck',
                    'Document Missing','New Lead','Commission Due',
                    'Broker Inactive','No Enquiry'
                  )),
  message       TEXT NOT NULL,
  related_id    UUID,
  related_type  TEXT,   -- 'property'|'buyer_lead'|'seller_lead'|'deal'|'broker'
  is_done       BOOLEAN NOT NULL DEFAULT false,
  snoozed_until TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3j. ACTIVITY LOG ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT NOT NULL,    -- 'Property Created', 'Deal Updated', …
  description  TEXT NOT NULL,
  actor        TEXT NOT NULL DEFAULT 'System',
  related_id   UUID,
  related_type TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ────────────────────────────────────────────────────────────────
-- 4. INDEXES
-- ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_properties_status       ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type         ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_district     ON properties(district);
CREATE INDEX IF NOT EXISTS idx_properties_broker       ON properties(assigned_broker_id);
CREATE INDEX IF NOT EXISTS idx_properties_excl_end     ON properties(exclusivity_end) WHERE exclusivity_end IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_buyer_leads_status      ON buyer_leads(status);
CREATE INDEX IF NOT EXISTS idx_buyer_leads_broker      ON buyer_leads(added_by_broker_id);
CREATE INDEX IF NOT EXISTS idx_buyer_leads_follow_up   ON buyer_leads(follow_up_date) WHERE follow_up_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_seller_leads_status     ON seller_leads(status);
CREATE INDEX IF NOT EXISTS idx_seller_leads_broker     ON seller_leads(added_by_broker_id);
CREATE INDEX IF NOT EXISTS idx_seller_leads_follow_up  ON seller_leads(follow_up_date) WHERE follow_up_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_site_visits_property    ON site_visits(property_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_buyer       ON site_visits(buyer_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_broker      ON site_visits(broker_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_date        ON site_visits(visit_date);

CREATE INDEX IF NOT EXISTS idx_deals_property          ON deals(property_id);
CREATE INDEX IF NOT EXISTS idx_deals_buyer_lead        ON deals(buyer_lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_status            ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_buyer_broker      ON deals(buyer_broker_id);
CREATE INDEX IF NOT EXISTS idx_deals_seller_broker     ON deals(seller_broker_id);

CREATE INDEX IF NOT EXISTS idx_documents_property      ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active           ON alerts(is_done, created_at) WHERE NOT is_done;
CREATE INDEX IF NOT EXISTS idx_activity_log_created    ON activity_log(created_at DESC);


-- ────────────────────────────────────────────────────────────────
-- 5. TRIGGERS
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ────────────────────────────────────────────────────────────────
-- 6. RPC FUNCTIONS  (callable via supabase.rpc())
-- ────────────────────────────────────────────────────────────────

-- nextval wrapper — app calls: supabase.rpc('nextval', { sequence_name: 'deal_seq' })
CREATE OR REPLACE FUNCTION nextval(sequence_name TEXT)
RETURNS BIGINT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT nextval(sequence_name::regclass);
$$;

-- generate_land_code() — returns next BLU-YYYY-NNN code
CREATE OR REPLACE FUNCTION generate_land_code()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'BLU-' || EXTRACT(YEAR FROM now())::TEXT
         || '-' || LPAD(nextval('property_seq')::TEXT, 3, '0');
$$;


-- ────────────────────────────────────────────────────────────────
-- 7. SEED DATA — demo brokers
-- ────────────────────────────────────────────────────────────────

INSERT INTO brokers (broker_id, name, phone, email, tier_level, deals_closed,
                     total_commission_earned, status, joined_date)
VALUES
  ('BRK-001','Arjun Kumar',  '9876543210','arjun@bluesquare.in', 'Elite',       6, 180000,'Active','2025-01-15'),
  ('BRK-002','Priya Sharma', '9876543211','priya@bluesquare.in', 'Star',         4, 120000,'Active','2025-02-10'),
  ('BRK-003','Rajesh Nair',  '9876543212','rajesh@bluesquare.in','Star',         3,  90000,'Active','2025-03-01'),
  ('BRK-004','Kavitha Raj',  '9876543213','kavitha@bluesquare.in','Active',      1,  30000,'Active','2025-06-20'),
  ('BRK-005','Suresh Babu',  '9876543214','suresh@bluesquare.in','Active',       2,  60000,'Active','2025-05-05')
ON CONFLICT (broker_id) DO NOTHING;
