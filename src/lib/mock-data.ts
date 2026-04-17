import type {
  DashboardMetrics,
  LeaderboardEntry,
  RecentActivity,
  Property,
  SellerLead,
  BuyerLead,
  SiteVisit,
  Deal,
  Broker,
  Alert,
  Book,
  PropertyDocument,
} from '@/types'

// ─── DASHBOARD ───────────────────────────────────────────

export const mockMetrics: DashboardMetrics = {
  total_active_listings: 24,
  total_leads: 87,
  deals_in_pipeline: 12,
  revenue_this_month: 680000,
  your_net_this_month: 210000,
  new_leads_today: 5,
  follow_ups_today: 8,
  expiring_exclusivity: 3,
}

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, broker_id: 'BRK-001', broker_name: 'Arjun Kumar', deals_closed: 6, commission_earned: 180000, tier_level: 'Elite' },
  { rank: 2, broker_id: 'BRK-002', broker_name: 'Priya Sharma', deals_closed: 4, commission_earned: 120000, tier_level: 'Star' },
  { rank: 3, broker_id: 'BRK-003', broker_name: 'Rajesh Nair', deals_closed: 3, commission_earned: 90000, tier_level: 'Star' },
  { rank: 4, broker_id: 'BRK-005', broker_name: 'Suresh Babu', deals_closed: 2, commission_earned: 60000, tier_level: 'Active' },
  { rank: 5, broker_id: 'BRK-004', broker_name: 'Kavitha Raj', deals_closed: 1, commission_earned: 30000, tier_level: 'Active' },
]

export const mockRecentActivity: RecentActivity[] = [
  { id: '1', type: 'lead', description: 'New buyer lead added — Mohan, ₹25L budget, Rasipuram', user: 'Arjun Kumar', timestamp: '2 min ago', link: '/buyer-leads' },
  { id: '2', type: 'deal', description: 'Deal BLU-2026-008 moved to Token Paid — ₹18L', user: 'Priya Sharma', timestamp: '45 min ago', link: '/deals' },
  { id: '3', type: 'property', description: 'New property listed — BLU-2026-012, 2 Acres Farm Land, Salem', user: 'Admin', timestamp: '1 hr ago', link: '/properties' },
  { id: '4', type: 'visit', description: 'Site visit completed — BLU-2026-005 with buyer Ravi (Interested)', user: 'Rajesh Nair', timestamp: '3 hrs ago', link: '/site-visits' },
  { id: '5', type: 'alert', description: 'Exclusivity expiring in 7 days — BLU-2026-003', user: 'System', timestamp: '5 hrs ago', link: '/alerts' },
  { id: '6', type: 'lead', description: 'Seller lead converted to property — BLU-2026-011', user: 'Admin', timestamp: '1 day ago', link: '/seller-leads' },
]

// ─── PROPERTIES ──────────────────────────────────────────

export const mockProperties: Property[] = [
  {
    id: '1', land_code: 'BLU-2026-001', title: 'Prime Plot Near Highway', type: 'Plot', classification: 'Residential',
    area: 2400, area_unit: 'Sqft', price: 1800000, price_per_sqft: 750, facing: 'E',
    gps_lat: 11.4502, gps_lng: 78.0808, address: 'NH-544, Rasipuram', landmark: 'Near BSNL Tower',
    village: 'Rasipuram', taluk: 'Rasipuram', district: 'Namakkal',
    road_access: 'Yes - 30ft', water: 'Government', electricity: true,
    survey_number: 'SUR-2024-441', patta_number: 'PAT-7821', dtcp_approved: 'Yes', legal_status: 'Clear',
    owner_name: 'Murugesan T', owner_phone: '9443211234',
    exclusivity_start: '2026-01-01', exclusivity_end: '2026-06-30', exclusivity_status: 'Active',
    marketing_status: 'Listed', assigned_broker_id: 'BRK-001', status: 'Available',
    created_at: '2026-01-05T10:00:00Z', updated_at: '2026-01-05T10:00:00Z',
  },
  {
    id: '2', land_code: 'BLU-2026-002', title: 'Agricultural Land – Salem Road', type: 'Farm', classification: 'Agricultural',
    area: 5, area_unit: 'Acres', price: 4500000, facing: 'N',
    gps_lat: 11.5102, gps_lng: 78.1208, address: 'Salem Main Road', village: 'Tiruchengode',
    taluk: 'Tiruchengode', district: 'Namakkal',
    road_access: 'Yes - 12ft', water: 'Borewell', electricity: true,
    dtcp_approved: 'No', legal_status: 'Clear',
    owner_name: 'Selvam K', owner_phone: '9443211235',
    exclusivity_start: '2026-02-01', exclusivity_end: '2026-04-20', exclusivity_status: 'Expiring',
    marketing_status: 'Video Shot', assigned_broker_id: 'BRK-002', status: 'Negotiating',
    created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: '3', land_code: 'BLU-2026-003', title: 'Commercial Plot – Bus Stand Area', type: 'Commercial', classification: 'Commercial',
    area: 1800, area_unit: 'Sqft', price: 3200000, price_per_sqft: 1778, facing: 'S',
    address: 'Bus Stand Road, Namakkal', village: 'Namakkal', taluk: 'Namakkal', district: 'Namakkal',
    road_access: 'Yes - 40ft', water: 'Government', electricity: true,
    dtcp_approved: 'Applied', legal_status: 'Clear',
    exclusivity_start: '2026-01-15', exclusivity_end: '2026-04-22', exclusivity_status: 'Expiring',
    marketing_status: 'Listed', assigned_broker_id: 'BRK-003', status: 'Site Visit Done',
    created_at: '2026-01-15T10:00:00Z', updated_at: '2026-02-20T10:00:00Z',
  },
]

// ─── SELLER LEADS ─────────────────────────────────────────

export const mockSellerLeads: SellerLead[] = [
  {
    id: '1', lead_id: 'SL-001', owner_name: 'Ramesh Babu', phone: '9876001234', whatsapp: '9876001234',
    property_location: 'Namakkal bypass road', approximate_area: '3 Acres', asking_price: 6000000,
    property_type: 'Farm', reason_for_selling: 'Financial need', document_status: 'Patta available',
    source: 'Broker Arjun', added_by_broker_id: 'BRK-001', added_at: '2026-03-10T10:00:00Z',
    status: 'Property Verified', follow_up_date: '2026-04-15',
    notes_history: [{ timestamp: '2026-03-10T10:00:00Z', author: 'Arjun', text: 'Owner open to negotiation' }],
    created_at: '2026-03-10T10:00:00Z',
  },
  {
    id: '2', lead_id: 'SL-002', owner_name: 'Lakshmi Devi', phone: '9876001235',
    property_location: 'Rasipuram town', approximate_area: '1200 Sqft', asking_price: 2200000,
    property_type: 'House', reason_for_selling: 'Relocating to Chennai', document_status: 'All docs available',
    source: 'WhatsApp referral', added_by_broker_id: 'BRK-002', added_at: '2026-03-20T10:00:00Z',
    status: 'New', follow_up_date: '2026-04-14',
    notes_history: [],
    created_at: '2026-03-20T10:00:00Z',
  },
]

// ─── BUYER LEADS ──────────────────────────────────────────

export const mockBuyerLeads: BuyerLead[] = [
  {
    id: '1', lead_id: 'BL-001', name: 'Mohan Raj', phone: '9865001234', whatsapp: '9865001234', email: 'mohan@gmail.com',
    budget_min: 2000000, budget_max: 3000000, preferred_location: 'Rasipuram / Namakkal',
    property_type_needed: 'Plot', area_required: '1500-2400 Sqft',
    purpose: 'Construction', loan_required: true, loan_amount: 1500000,
    urgency: '3 months', source: 'Instagram',
    added_by_broker_id: 'BRK-001', added_at: '2026-04-14T08:00:00Z',
    status: 'Site Visited', follow_up_date: '2026-04-15',
    referred_by_name: 'Suresh Babu',
    referred_by_phone: '9876543214',
    notes_history: [{ timestamp: '2026-04-10T10:00:00Z', author: 'Arjun', text: 'Visited BLU-2026-001, very interested' }],
    created_at: '2026-04-14T08:00:00Z',
  },
  {
    id: '2', lead_id: 'BL-002', name: 'Seetha Raman', phone: '9865001235',
    budget_min: 4000000, budget_max: 6000000, preferred_location: 'Salem Road, Namakkal',
    property_type_needed: 'Farm', area_required: '3-5 Acres',
    purpose: 'Agriculture', loan_required: false,
    urgency: 'Immediate', source: 'Referral',
    added_by_broker_id: 'BRK-002', added_at: '2026-04-12T09:00:00Z',
    status: 'Negotiating', follow_up_date: '2026-04-14',
    notes_history: [],
    created_at: '2026-04-12T09:00:00Z',
  },
]

// ─── SITE VISITS ──────────────────────────────────────────

export const mockSiteVisits: SiteVisit[] = [
  {
    id: '1', visit_id: 'SV-001', property_id: '1', buyer_id: '1',
    visit_date: '2026-04-10', visit_time: '10:30', broker_id: 'BRK-001',
    buyer_reaction: 'Interested', buyer_remarks: 'Good location, wants better price',
    price_discussed: 1700000, objections: 'Price slightly high',
    internal_note: 'Buyer seems genuinely interested, loan pre-approval pending',
    next_action: 'Negotiate price', next_action_date: '2026-04-15',
    outcome: 'Progressed', created_at: '2026-04-10T10:30:00Z',
  },
  {
    id: '2', visit_id: 'SV-002', property_id: '1', buyer_id: '2',
    visit_date: '2026-04-05', visit_time: '11:00', broker_id: 'BRK-002',
    buyer_reaction: 'Negotiating', buyer_remarks: 'Likes the plot but asking price is too high. Ready to pay 15L.',
    price_discussed: 1500000, objections: 'Price too high, road width needs expansion',
    internal_note: 'Seetha is a serious buyer — has cash ready. May close fast if price drops.',
    next_action: 'Counter offer from owner', next_action_date: '2026-04-12',
    outcome: 'Progressed', created_at: '2026-04-05T11:00:00Z',
  },
  {
    id: '3', visit_id: 'SV-003', property_id: '1', buyer_id: '2',
    visit_date: '2026-03-22', visit_time: '16:00', broker_id: 'BRK-002',
    buyer_reaction: 'Need Time',
    buyer_remarks: 'First visit, wants to bring family before deciding. Plot dimensions are good.',
    price_discussed: 1800000, objections: 'Wants family approval first',
    internal_note: 'First visit was exploratory. Follow up after family visit.',
    next_action: 'Schedule second visit with family', next_action_date: '2026-03-28',
    outcome: 'Progressed', created_at: '2026-03-22T16:00:00Z',
  },
  {
    id: '4', visit_id: 'SV-004', property_id: '2', buyer_id: '1',
    visit_date: '2026-03-30', visit_time: '09:00', broker_id: 'BRK-003',
    buyer_reaction: 'Not Interested', buyer_remarks: 'Too far from Rasipuram. Not suitable for residential construction.',
    price_discussed: 4500000, objections: 'Location is remote, no nearby schools or shops',
    internal_note: 'Mohan is looking for plots near Rasipuram town, not farm land on Salem highway.',
    next_action: 'Match with closer properties', next_action_date: '2026-04-05',
    outcome: 'Dropped', created_at: '2026-03-30T09:00:00Z',
  },
  {
    id: '5', visit_id: 'SV-005', property_id: '2', buyer_id: '2',
    visit_date: '2026-04-08', visit_time: '08:30', broker_id: 'BRK-002',
    buyer_reaction: 'Interested', buyer_remarks: 'Soil quality is excellent for farming. Borewell already functional.',
    price_discussed: 4200000, objections: 'Patta transfer timeline unclear',
    internal_note: 'Seetha wants a legal opinion on patta transfer before proceeding to token.',
    next_action: 'Get legal clearance report', next_action_date: '2026-04-14',
    outcome: 'Progressed', created_at: '2026-04-08T08:30:00Z',
  },
]

// ─── DEALS ────────────────────────────────────────────────

export const mockDeals: Deal[] = [
  {
    id: '1', deal_id: 'DEAL-001', deal_title: 'BLU-2026-001 × Mohan Raj',
    property_id: '1', buyer_lead_id: '1',
    buyer_broker_id: 'BRK-001', seller_broker_id: 'BRK-002',
    deal_value: 1750000, buyer_commission_pct: 2, seller_commission_pct: 2,
    total_commission: 70000, buyer_broker_payout: 21875, seller_broker_payout: 21875,
    your_net: 26250,
    token_amount: 100000, token_date: '2026-04-12',
    status: 'Token Paid', commission_payment_status: 'Pending',
    created_at: '2026-04-11T10:00:00Z',
  },
]

// ─── BROKERS ──────────────────────────────────────────────

export const mockBrokers: Broker[] = [
  {
    id: '1', broker_id: 'BRK-001', name: 'Arjun Kumar', phone: '9876543210', email: 'arjun@bluesquare.in',
    tier_level: 'Elite', deals_closed: 6, total_commission_earned: 180000, active_leads_count: 12,
    total_seller_leads: 8, total_buyer_leads: 15, login_active: true,
    joined_date: '2025-01-15', status: 'Active', created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: '2', broker_id: 'BRK-002', name: 'Priya Sharma', phone: '9876543211', email: 'priya@bluesquare.in',
    recruited_by_id: '1', tier_level: 'Star', deals_closed: 4, total_commission_earned: 120000, active_leads_count: 8,
    total_seller_leads: 5, total_buyer_leads: 10, login_active: true,
    joined_date: '2025-02-10', status: 'Active', created_at: '2025-02-10T10:00:00Z',
  },
  {
    id: '3', broker_id: 'BRK-003', name: 'Rajesh Nair', phone: '9876543212', email: 'rajesh@bluesquare.in',
    recruited_by_id: '1', tier_level: 'Star', deals_closed: 3, total_commission_earned: 90000, active_leads_count: 6,
    total_seller_leads: 4, total_buyer_leads: 7, login_active: true,
    joined_date: '2025-03-01', status: 'Active', created_at: '2025-03-01T10:00:00Z',
  },
  {
    id: '4', broker_id: 'BRK-004', name: 'Kavitha Raj', phone: '9876543213', email: 'kavitha@bluesquare.in',
    recruited_by_id: '2', tier_level: 'Active', deals_closed: 1, total_commission_earned: 30000, active_leads_count: 3,
    total_seller_leads: 2, total_buyer_leads: 4, login_active: true,
    joined_date: '2025-06-20', status: 'Active', created_at: '2025-06-20T10:00:00Z',
  },
  {
    id: '5', broker_id: 'BRK-005', name: 'Suresh Babu', phone: '9876543214', email: 'suresh@bluesquare.in',
    recruited_by_id: '2', tier_level: 'Active', deals_closed: 2, total_commission_earned: 60000, active_leads_count: 5,
    total_seller_leads: 3, total_buyer_leads: 6, login_active: true,
    joined_date: '2025-05-05', status: 'Active', created_at: '2025-05-05T10:00:00Z',
  },
]

// ─── ALERTS ───────────────────────────────────────────────

export const mockAlerts: Alert[] = [
  { id: '1', type: 'Exclusivity Expiring', message: 'BLU-2026-002 exclusivity expires in 6 days', related_id: '2', related_type: 'property', is_done: false, created_at: '2026-04-14T06:00:00Z' },
  { id: '2', type: 'Exclusivity Expiring', message: 'BLU-2026-003 exclusivity expires in 8 days', related_id: '3', related_type: 'property', is_done: false, created_at: '2026-04-14T06:00:00Z' },
  { id: '3', type: 'Follow Up Due', message: 'Follow up due with Seetha Raman (BL-002) today', related_id: '2', related_type: 'buyer_lead', is_done: false, created_at: '2026-04-14T06:00:00Z' },
  { id: '4', type: 'Follow Up Due', message: 'Follow up due with Lakshmi Devi (SL-002) today', related_id: '2', related_type: 'seller_lead', is_done: false, created_at: '2026-04-14T06:00:00Z' },
  { id: '5', type: 'Deal Stuck', message: 'DEAL-001 stuck in Token Paid for 2 days', related_id: '1', related_type: 'deal', is_done: false, created_at: '2026-04-14T06:00:00Z' },
  { id: '6', type: 'New Lead', message: 'New buyer lead added by Arjun Kumar — Mohan Raj', related_id: '1', related_type: 'buyer_lead', is_done: true, created_at: '2026-04-14T08:00:00Z' },
]

// ─── BOOKS ────────────────────────────────────────────────

export const mockBooks: Book[] = [
  {
    id: '1', book_id: 'BK-001', book_name: 'Rasipuram Plots 2026', description: 'All residential plots in Rasipuram area',
    property_ids: ['1'], total_properties: 1, total_value: 1800000, status: 'Active', created_at: '2026-01-01T00:00:00Z',
  },
]

// ─── DOCUMENTS ────────────────────────────────────────────

export const mockDocuments: PropertyDocument[] = [
  {
    id: '1', document_id: 'DOC-001', property_id: '1', folder: 'Legal',
    document_name: 'Patta (Land Record)', file_url: null, file_size: null,
    status: 'Received', issue_notes: null, uploaded_by: 'Arjun Kumar',
    upload_date: '2026-04-10', verified_by: null, created_at: '2026-04-10T10:00:00Z',
  },
  {
    id: '2', document_id: 'DOC-002', property_id: '1', folder: 'Survey',
    document_name: 'Survey FMB Sketch', file_url: null, file_size: null,
    status: 'Pending', issue_notes: 'Waiting from village office', uploaded_by: 'Arjun Kumar',
    upload_date: '2026-04-10', verified_by: null, created_at: '2026-04-10T10:05:00Z',
  },
  {
    id: '3', document_id: 'DOC-003', property_id: '2', folder: 'Legal',
    document_name: 'Sale Deed (Draft)', file_url: null, file_size: null,
    status: 'Issue', issue_notes: 'Seller name mismatch — needs correction', uploaded_by: 'Priya Sharma',
    upload_date: '2026-04-12', verified_by: null, created_at: '2026-04-12T09:00:00Z',
  },
  {
    id: '4', document_id: 'DOC-004', property_id: '1', folder: 'Owner Docs',
    document_name: 'Owner Aadhaar Card', file_url: null, file_size: null,
    status: 'Verified', issue_notes: null, uploaded_by: 'Arjun Kumar',
    upload_date: '2026-04-11', verified_by: 'Admin', created_at: '2026-04-11T11:00:00Z',
  },
]
