// ─── PROPERTY / LAND ────────────────────────────────────────────────────────

export type PropertyType = 'Plot' | 'House' | 'Farm' | 'Commercial'
export type Classification = 'Agricultural' | 'Residential' | 'Commercial'
export type AreaUnit = 'Sqft' | 'Cents' | 'Acres'
export type Facing = 'N' | 'S' | 'E' | 'W'
export type RoadAccess = 'Yes' | 'No' | string
export type WaterSource = 'Yes' | 'No' | 'Borewell' | 'Government'
export type DTCPStatus = 'Yes' | 'No' | 'Applied'
export type LegalStatus = 'Clear' | 'Disputed' | 'Pending'
export type MarketingStatus = 'Not Started' | 'Video Shot' | 'Listed' | 'Promoted'

export type PropertyStatus =
  | 'Available'
  | 'Enquiry Received'
  | 'Site Visit Done'
  | 'Negotiating'
  | 'Token Received'
  | 'MOU Signed'
  | 'Loan Processing'
  | 'Registration Scheduled'
  | 'Registration Done'
  | 'Sold'
  | 'On Hold'
  | 'Exclusivity Expired'
  | 'Cancelled'

export interface Property {
  id: string
  land_code: string
  title: string
  type: PropertyType
  classification: Classification
  area: number
  area_unit: AreaUnit
  price: number
  price_per_sqft?: number
  side_a?: number
  side_b?: number
  side_c?: number
  side_d?: number
  facing?: Facing
  gps_lat?: number
  gps_lng?: number
  address?: string
  landmark?: string
  village?: string
  taluk?: string
  district?: string
  road_access?: RoadAccess
  water?: WaterSource
  electricity?: boolean
  survey_number?: string
  patta_number?: string
  dtcp_approved?: DTCPStatus
  rera_applicable?: boolean
  legal_status?: LegalStatus
  owner_name?: string
  owner_phone?: string
  owner_whatsapp?: string
  owner_aadhaar?: string
  owner_pan?: string
  exclusivity_start?: string
  exclusivity_end?: string
  exclusivity_status?: string
  exclusivity_agreement_url?: string
  marketing_status?: MarketingStatus
  video_link?: string
  assigned_broker_id?: string
  book_id?: string
  status: PropertyStatus
  internal_notes?: string
  created_at: string
  updated_at: string
}

// ─── SELLER LEAD ─────────────────────────────────────────────────────────────

export type SellerLeadStatus =
  | 'New'
  | 'Contacted'
  | 'Property Verified'
  | 'Video Shot'
  | 'Listed'
  | 'Enquiry Received'
  | 'Negotiating'
  | 'MOU Signed'
  | 'Sold'
  | 'Withdrawn'

export interface SellerLead {
  id: string
  lead_id: string
  owner_name: string
  phone: string
  whatsapp?: string
  property_location: string
  approximate_area?: string
  asking_price?: number
  property_type?: PropertyType
  reason_for_selling?: string
  document_status?: string
  source?: string
  added_by_broker_id?: string
  added_at: string
  assigned_to?: string
  status: SellerLeadStatus
  follow_up_date?: string
  notes_history?: NoteEntry[]
  converted_property_id?: string
  created_at: string
}

// ─── BUYER LEAD ──────────────────────────────────────────────────────────────

export type BuyerLeadStatus =
  | 'New'
  | 'Contacted'
  | 'Requirement Understood'
  | 'Property Matched'
  | 'Site Visit Scheduled'
  | 'Site Visited'
  | 'Negotiating'
  | 'Token Paid'
  | 'MOU Signed'
  | 'Loan Applied'
  | 'Registration Done'
  | 'Converted'
  | 'Lost'

export type Purpose = 'Investment' | 'Construction' | 'Agriculture'
export type Urgency = 'Immediate' | '3 months' | '6 months'
export type LeadSource = 'Instagram' | 'Facebook' | 'WhatsApp' | 'Referral' | 'Walk-in'

export interface BuyerLead {
  id: string
  lead_id: string
  name: string
  phone: string
  whatsapp?: string
  email?: string
  budget_min?: number
  budget_max?: number
  preferred_location?: string
  property_type_needed?: PropertyType
  area_required?: string
  purpose?: Purpose
  loan_required?: boolean
  loan_amount?: number
  urgency?: Urgency
  source?: LeadSource
  added_by_broker_id?: string
  added_at: string
  assigned_to?: string
  status: BuyerLeadStatus
  properties_visited?: string[]
  follow_up_date?: string
  notes_history?: NoteEntry[]
  converted_deal_id?: string
  referred_by_name?: string
  referred_by_phone?: string
  created_at: string
}

// ─── SITE VISIT ──────────────────────────────────────────────────────────────

export type BuyerReaction = 'Interested' | 'Not Interested' | 'Negotiating' | 'Need Time'
export type VisitOutcome = 'Progressed' | 'Dropped'

export interface SiteVisit {
  id: string
  visit_id: string
  property_id: string
  buyer_id: string
  visit_date: string
  visit_time?: string
  broker_id?: string
  buyer_reaction?: BuyerReaction
  buyer_remarks?: string
  owner_remarks?: string
  price_discussed?: number
  objections?: string
  internal_note?: string
  next_action?: string
  next_action_date?: string
  outcome?: VisitOutcome
  created_at: string
}

// ─── DEAL ────────────────────────────────────────────────────────────────────

export type DealStatus =
  | 'Created'
  | 'Site Visit Done'
  | 'Negotiation Active'
  | 'Token Paid'
  | 'MOU Signed'
  | 'Documents Verified'
  | 'Loan Processing'
  | 'Registration Scheduled'
  | 'Registration Done'
  | 'Closed Won'
  | 'Closed Lost'

export type LoanStatus = 'Not Applied' | 'Applied' | 'Approved' | 'Rejected' | 'Disbursed'
export type CommissionPaymentStatus = 'Pending' | 'Partial' | 'Released'

export interface Deal {
  id: string
  deal_id: string
  deal_title: string
  property_id: string
  buyer_lead_id: string
  seller_lead_id?: string
  buyer_broker_id?: string
  seller_broker_id?: string
  referral_broker_id?: string
  co_sponsor_broker_1_id?: string
  co_sponsor_broker_2_id?: string
  tier1_override_broker_id?: string
  tier2_override_broker_id?: string
  deal_value: number
  buyer_commission_pct: number
  seller_commission_pct: number
  total_commission?: number
  buyer_broker_payout?: number
  seller_broker_payout?: number
  referral_payout?: number
  tier1_override_payout?: number
  tier2_override_payout?: number
  your_net?: number
  token_amount?: number
  token_date?: string
  advance_amount?: number
  advance_date?: string
  final_amount?: number
  final_date?: string
  mou_date?: string
  mou_document_url?: string
  registration_date?: string
  registration_document_url?: string
  loan_required?: boolean
  loan_status?: LoanStatus
  loan_amount?: number
  bank_name?: string
  status: DealStatus
  closed_reason?: string
  commission_payment_status?: CommissionPaymentStatus
  commission_released_date?: string
  notes?: string
  created_at: string
}

// ─── BROKER ──────────────────────────────────────────────────────────────────

export type BrokerTier = 'Starter' | 'Active' | 'Star' | 'Elite' | 'Coordinator'
export type BrokerStatus = 'Active' | 'Inactive' | 'Blacklisted'

export interface Broker {
  id: string
  broker_id: string
  name: string
  phone: string
  whatsapp?: string
  email: string
  photo_url?: string
  area_coverage?: string
  recruited_by_id?: string
  co_sponsor_1_id?: string
  co_sponsor_2_id?: string
  tier_level: BrokerTier
  brokers_recruited?: number
  override_earnings?: number
  deals_closed?: number
  total_commission_earned?: number
  active_leads_count?: number
  total_seller_leads?: number
  total_buyer_leads?: number
  login_active: boolean
  last_login?: string
  joined_date: string
  broker_agreement_url?: string
  nda_url?: string
  bank_account?: string
  upi_id?: string
  status: BrokerStatus
  notes?: string
  created_at: string
}

// ─── DOCUMENT ────────────────────────────────────────────────────────────────

export type DocumentFolder = 'Legal' | 'Survey' | 'Photos' | 'Owner Docs' | 'Agreements'
export type DocumentStatus = 'Pending' | 'Received' | 'Verified' | 'Issue' | 'Original Submitted'

export interface PropertyDocument {
  id: string
  document_id: string
  property_id: string
  folder: DocumentFolder
  document_name: string
  file_url?: string | null
  file_size?: number | null
  status: DocumentStatus
  issue_notes?: string | null
  uploaded_by?: string | null
  upload_date: string
  verified_by?: string | null
  verified_date?: string | null
  created_at: string
}

// ─── BOOK / FILE ─────────────────────────────────────────────────────────────

export type BookStatus = 'Open' | 'Active' | 'Archived'

export interface Book {
  id: string
  book_id: string
  book_name: string
  description?: string
  property_ids: string[]
  total_properties?: number
  total_value?: number
  status: BookStatus
  created_at: string
}

// ─── ALERT ───────────────────────────────────────────────────────────────────

export type AlertType =
  | 'Exclusivity Expiring'
  | 'Follow Up Due'
  | 'Deal Stuck'
  | 'Document Missing'
  | 'New Lead'
  | 'Commission Due'
  | 'Broker Inactive'
  | 'No Enquiry'

export interface Alert {
  id: string
  type: AlertType
  message: string
  related_id?: string
  related_type?: string
  is_done: boolean
  snoozed_until?: string
  created_at: string
}

// ─── SHARED ──────────────────────────────────────────────────────────────────

export interface NoteEntry {
  timestamp: string
  author: string
  text: string
}

export interface DashboardMetrics {
  total_active_listings: number
  total_leads: number
  deals_in_pipeline: number
  revenue_this_month: number
  your_net_this_month: number
  new_leads_today: number
  follow_ups_today: number
  expiring_exclusivity: number
}

export interface LeaderboardEntry {
  broker_id: string
  broker_name: string
  broker_photo?: string
  deals_closed: number
  commission_earned: number
  tier_level: BrokerTier
  rank: number
}

export interface RecentActivity {
  id: string
  type: string
  description: string
  user: string
  timestamp: string
  link?: string
}
