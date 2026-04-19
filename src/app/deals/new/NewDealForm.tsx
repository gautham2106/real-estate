'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calculator } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { mockProperties, mockBuyerLeads, mockSellerLeads, mockBrokers } from '@/lib/mock-data'
import type { DealStatus } from '@/types'

const dealStatuses: DealStatus[] = [
  'Created', 'Site Visit Done', 'Negotiation Active', 'Token Paid', 'MOU Signed',
  'Documents Verified', 'Loan Processing', 'Registration Scheduled',
  'Registration Done', 'Closed Won', 'Closed Lost',
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-2 mb-4">
      {children}
    </h3>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

interface FormState {
  property_id: string
  buyer_lead_id: string
  seller_lead_id: string
  buyer_broker_id: string
  seller_broker_id: string
  referral_enabled: boolean
  referral_broker_id: string
  co_sponsor_broker_1_id: string
  co_sponsor_broker_2_id: string
  tier1_override_broker_id: string
  tier2_override_broker_id: string
  deal_value: string
  buyer_commission_pct: string
  seller_commission_pct: string
  token_amount: string
  token_date: string
  advance_amount: string
  advance_date: string
  final_amount: string
  final_date: string
  mou_date: string
  registration_date: string
  loan_required: boolean
  loan_amount: string
  bank_name: string
  status: DealStatus
  notes: string
}

const brokerFields: { label: string; key: keyof FormState }[] = [
  { label: 'Buyer Broker', key: 'buyer_broker_id' },
  { label: 'Seller Broker', key: 'seller_broker_id' },
  { label: 'Co-Sponsor 1', key: 'co_sponsor_broker_1_id' },
  { label: 'Co-Sponsor 2', key: 'co_sponsor_broker_2_id' },
  { label: 'Tier 1 Override', key: 'tier1_override_broker_id' },
  { label: 'Tier 2 Override', key: 'tier2_override_broker_id' },
]

export default function NewDealForm({ defaultBuyerId }: { defaultBuyerId?: string }) {
  const [form, setForm] = useState<FormState>({
    property_id: '',
    buyer_lead_id: defaultBuyerId ?? '',
    seller_lead_id: '',
    buyer_broker_id: '',
    seller_broker_id: '',
    referral_enabled: false,
    referral_broker_id: '',
    co_sponsor_broker_1_id: '',
    co_sponsor_broker_2_id: '',
    tier1_override_broker_id: '',
    tier2_override_broker_id: '',
    deal_value: '',
    buyer_commission_pct: '2',
    seller_commission_pct: '2',
    token_amount: '',
    token_date: '',
    advance_amount: '',
    advance_date: '',
    final_amount: '',
    final_date: '',
    mou_date: '',
    registration_date: '',
    loan_required: false,
    loan_amount: '',
    bank_name: '',
    status: 'Created',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const set = (k: keyof FormState, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  // Derived commission calculations — no useState needed
  const dv = parseFloat(form.deal_value) || 0
  const bcp = parseFloat(form.buyer_commission_pct) || 0
  const scp = parseFloat(form.seller_commission_pct) || 0
  const hasTier1 = !!form.tier1_override_broker_id
  const hasTier2 = !!form.tier2_override_broker_id

  const totalCommission = dv * (bcp + scp) / 100
  const buyerBrokerPayout = dv * 0.0125
  const sellerBrokerPayout = dv * 0.0125
  const referralPayout = form.referral_enabled ? dv * 0.0025 : 0
  const tier1Payout = hasTier1 ? dv * 0.001 : 0
  const tier2Payout = hasTier2 ? dv * 0.0005 : 0
  const yourNet = totalCommission - buyerBrokerPayout - sellerBrokerPayout - referralPayout - tier1Payout - tier2Payout

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setServerError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('has_referral', form.referral_enabled ? 'true' : '')
    const { createDealAction } = await import('@/app/actions/deals')
    const result = await createDealAction(formData)
    if (result?.error) {
      setServerError(result.error)
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/deals" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-700 transition-colors">
          <ArrowLeft size={16} />
          Back to Deals
        </Link>
        <span className="text-slate-300">|</span>
        <h2 className="text-xl font-bold text-slate-800">New Deal</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Identity ──────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Identity</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Linked Property" required>
              <select name="property_id" value={form.property_id} onChange={e => set('property_id', e.target.value)} className={inputCls}>
                <option value="">— Select Property —</option>
                {mockProperties.map(p => (
                  <option key={p.id} value={p.id}>{p.land_code} — {p.title}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Linked Buyer Lead">
              <select name="buyer_lead_id" value={form.buyer_lead_id} onChange={e => set('buyer_lead_id', e.target.value)} className={inputCls}>
                <option value="">— Select Buyer Lead —</option>
                {mockBuyerLeads.map(l => (
                  <option key={l.id} value={l.id}>{l.lead_id} — {l.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Linked Seller Lead">
              <select name="seller_lead_id" value={form.seller_lead_id} onChange={e => set('seller_lead_id', e.target.value)} className={inputCls}>
                <option value="">— Select Seller Lead —</option>
                {mockSellerLeads.map(l => (
                  <option key={l.id} value={l.id}>{l.lead_id} — {l.owner_name}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* ── Brokers ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Brokers</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brokerFields.map(({ label, key }) => (
              <FormField key={key} label={label}>
                <select name={key} value={form[key] as string} onChange={e => set(key, e.target.value)} className={inputCls}>
                  <option value="">— None —</option>
                  {mockBrokers.map(b => (
                    <option key={b.id} value={b.id}>{b.broker_id} — {b.name}</option>
                  ))}
                </select>
              </FormField>
            ))}

            <div className="md:col-span-2">
              <FormField label="Referral Broker">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set('referral_enabled', !form.referral_enabled)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.referral_enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.referral_enabled ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-xs text-slate-500">{form.referral_enabled ? 'Enabled (0.25%)' : 'Disabled'}</span>
                  {form.referral_enabled && (
                    <select name="referral_broker_id" value={form.referral_broker_id} onChange={e => set('referral_broker_id', e.target.value)} className={`${inputCls} flex-1`}>
                      <option value="">— Select Referral Broker —</option>
                      {mockBrokers.map(b => (
                        <option key={b.id} value={b.id}>{b.broker_id} — {b.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </FormField>
            </div>
          </div>
        </div>

        {/* ── Financials ─────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Financials</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <FormField label="Deal Value (₹)" required>
              <input name="deal_value" type="number" value={form.deal_value} onChange={e => set('deal_value', e.target.value)} placeholder="e.g. 1750000" className={inputCls} />
            </FormField>
            <FormField label="Buyer Commission %">
              <input name="buyer_commission_pct" type="number" step="0.1" value={form.buyer_commission_pct} onChange={e => set('buyer_commission_pct', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Seller Commission %">
              <input name="seller_commission_pct" type="number" step="0.1" value={form.seller_commission_pct} onChange={e => set('seller_commission_pct', e.target.value)} className={inputCls} />
            </FormField>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator size={15} className="text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Commission Breakdown</span>
              {dv > 0 && <span className="text-xs text-slate-500 ml-auto">Based on {formatCurrency(dv)}</span>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Commission', value: totalCommission, highlight: true },
                { label: 'Buyer Broker (1.25%)', value: buyerBrokerPayout },
                { label: 'Seller Broker (1.25%)', value: sellerBrokerPayout },
                { label: 'Referral (0.25%)', value: referralPayout, muted: !form.referral_enabled },
                { label: 'Tier 1 Override (0.10%)', value: tier1Payout, muted: !hasTier1 },
                { label: 'Tier 2 Override (0.05%)', value: tier2Payout, muted: !hasTier2 },
                { label: 'Your Net', value: yourNet, net: true },
              ].map(({ label, value, highlight, net, muted }) => (
                <div
                  key={label}
                  className={`rounded-lg p-3 ${net ? 'bg-green-50 border border-green-200 col-span-2 md:col-span-1' : highlight ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-slate-200'} ${muted ? 'opacity-40' : ''}`}
                >
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className={`text-sm font-bold ${net ? 'text-green-700' : highlight ? 'text-blue-700' : 'text-slate-800'}`}>
                    {dv > 0 ? formatCurrency(value) : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Payments ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Payments</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Token Amount (₹)">
              <input name="token_amount" type="number" value={form.token_amount} onChange={e => set('token_amount', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Token Date">
              <input name="token_date" type="date" value={form.token_date} onChange={e => set('token_date', e.target.value)} className={inputCls} />
            </FormField>
            <div />
            <FormField label="Advance Amount (₹)">
              <input name="advance_amount" type="number" value={form.advance_amount} onChange={e => set('advance_amount', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Advance Date">
              <input name="advance_date" type="date" value={form.advance_date} onChange={e => set('advance_date', e.target.value)} className={inputCls} />
            </FormField>
            <div />
            <FormField label="Final Amount (₹)">
              <input name="final_amount" type="number" value={form.final_amount} onChange={e => set('final_amount', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Final Date">
              <input name="final_date" type="date" value={form.final_date} onChange={e => set('final_date', e.target.value)} className={inputCls} />
            </FormField>
          </div>
        </div>

        {/* ── Documents ──────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Documents</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="MOU Date">
              <input name="mou_date" type="date" value={form.mou_date} onChange={e => set('mou_date', e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Registration Date">
              <input name="registration_date" type="date" value={form.registration_date} onChange={e => set('registration_date', e.target.value)} className={inputCls} />
            </FormField>
          </div>
        </div>

        {/* ── Loan ───────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Loan</SectionTitle>
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => set('loan_required', !form.loan_required)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.loan_required ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.loan_required ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-slate-700">Loan Required</span>
          </div>
          {form.loan_required && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Loan Amount (₹)">
                <input name="loan_amount" type="number" value={form.loan_amount} onChange={e => set('loan_amount', e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="Bank Name">
                <input name="bank_name" type="text" value={form.bank_name} onChange={e => set('bank_name', e.target.value)} placeholder="e.g. SBI, HDFC" className={inputCls} />
              </FormField>
            </div>
          )}
        </div>

        {/* ── Status & Notes ─────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Status & Notes</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Deal Status">
              <select name="status" value={form.status} onChange={e => set('status', e.target.value as DealStatus)} className={inputCls}>
                {dealStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Notes">
              <textarea name="notes" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Internal notes..." className={inputCls} />
            </FormField>
          </div>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{serverError}</div>
        )}

        <div className="flex items-center gap-3 pb-8">
          <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
            {submitting ? 'Creating...' : 'Create Deal'}
          </button>
          <Link href="/deals" className="px-6 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
