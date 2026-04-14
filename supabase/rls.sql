-- ══════════════════════════════════════════════════════════
--  Bluesquare CRM — Row Level Security Policies
--  Run this AFTER schema.sql
-- ══════════════════════════════════════════════════════════

-- Helper function: get calling user's role from JWT metadata
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    'broker'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper: get calling user's broker row
CREATE OR REPLACE FUNCTION auth_broker_id()
RETURNS UUID AS $$
  SELECT id FROM brokers
  WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ─── Enable RLS on all tables ────────────────────────────

ALTER TABLE brokers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE books         ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties    ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_leads  ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_leads   ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits   ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log  ENABLE ROW LEVEL SECURITY;

-- ─── BROKERS ─────────────────────────────────────────────
-- Admin: full CRUD. Broker: can only read their own row.

CREATE POLICY "brokers_admin_all" ON brokers
  FOR ALL USING (auth_role() = 'admin');

CREATE POLICY "brokers_broker_self" ON brokers
  FOR SELECT USING (
    auth_role() = 'broker' AND id = auth_broker_id()
  );

-- ─── BOOKS ───────────────────────────────────────────────
-- Admin only

CREATE POLICY "books_admin_all" ON books
  FOR ALL USING (auth_role() = 'admin');

-- ─── PROPERTIES ──────────────────────────────────────────
-- Admin: full CRUD. Broker: can read all properties, can update properties assigned to them.

CREATE POLICY "properties_admin_all" ON properties
  FOR ALL USING (auth_role() = 'admin');

CREATE POLICY "properties_broker_select" ON properties
  FOR SELECT USING (auth_role() = 'broker');

CREATE POLICY "properties_broker_update_own" ON properties
  FOR UPDATE USING (
    auth_role() = 'broker' AND assigned_broker_id = auth_broker_id()
  );

-- ─── SELLER LEADS ────────────────────────────────────────
-- Admin: full CRUD. Broker: read & create. Update own leads.

CREATE POLICY "seller_leads_admin_all" ON seller_leads
  FOR ALL USING (auth_role() = 'admin');

CREATE POLICY "seller_leads_broker_select" ON seller_leads
  FOR SELECT USING (auth_role() = 'broker');

CREATE POLICY "seller_leads_broker_insert" ON seller_leads
  FOR INSERT WITH CHECK (auth_role() = 'broker');

CREATE POLICY "seller_leads_broker_update_own" ON seller_leads
  FOR UPDATE USING (
    auth_role() = 'broker' AND added_by_broker_id = auth_broker_id()
  );

-- ─── BUYER LEADS ─────────────────────────────────────────

CREATE POLICY "buyer_leads_admin_all" ON buyer_leads
  FOR ALL USING (auth_role() = 'admin');

CREATE POLICY "buyer_leads_broker_select" ON buyer_leads
  FOR SELECT USING (auth_role() = 'broker');

CREATE POLICY "buyer_leads_broker_insert" ON buyer_leads
  FOR INSERT WITH CHECK (auth_role() = 'broker');

CREATE POLICY "buyer_leads_broker_update_own" ON buyer_leads
  FOR UPDATE USING (
    auth_role() = 'broker' AND added_by_broker_id = auth_broker_id()
  );

-- ─── SITE VISITS ─────────────────────────────────────────

CREATE POLICY "site_visits_admin_all" ON site_visits
  FOR ALL USING (auth_role() = 'admin');

CREATE POLICY "site_visits_broker_select" ON site_visits
  FOR SELECT USING (auth_role() = 'broker');

CREATE POLICY "site_visits_broker_insert" ON site_visits
  FOR INSERT WITH CHECK (auth_role() = 'broker');

-- ─── DEALS ───────────────────────────────────────────────
-- Admin: full CRUD. Broker: read deals where they are buyer or seller broker.

CREATE POLICY "deals_admin_all" ON deals
  FOR ALL USING (auth_role() = 'admin');

CREATE POLICY "deals_broker_select" ON deals
  FOR SELECT USING (
    auth_role() = 'broker' AND (
      buyer_broker_id = auth_broker_id() OR
      seller_broker_id = auth_broker_id() OR
      referral_broker_id = auth_broker_id()
    )
  );

-- ─── DOCUMENTS ───────────────────────────────────────────
-- Admin only

CREATE POLICY "documents_admin_all" ON documents
  FOR ALL USING (auth_role() = 'admin');

-- ─── ALERTS ──────────────────────────────────────────────
-- Admin only (alerts are system-generated for admin)

CREATE POLICY "alerts_admin_all" ON alerts
  FOR ALL USING (auth_role() = 'admin');

-- ─── ACTIVITY LOG ────────────────────────────────────────

CREATE POLICY "activity_log_admin_all" ON activity_log
  FOR ALL USING (auth_role() = 'admin');
