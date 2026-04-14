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

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
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

const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
const selectCls = inputCls

export default function NewDealPage() {
  // Identity
  const [propertyId, setPropertyId] = useState('')
  const [buyerLeadId, setBuyerLeadId] = useState('')
  const [sellerLeadId, setSellerLeadId] = useState('')

  // Brokers
  const [buyerBrokerId, setBuyerBrokerId] = useState('')
  const [sellerBrokerId, setSellerBrokerId] = useState('')
  const [referralBrokerId, setReferralBrokerId] = useState('')
  const [referralEnabled, setReferralEnabled] = useState(false)
  const [coSponsor1Id, setCoSponsor1Id] = useState('')
  const [coSponsor2Id, setCoSponsor2Id] = useState('')
  const [tier1OverrideId, setTier1OverrideId] = useState('')
  const [tier2OverrideId, setTier2OverrideId] = useState('')

  // Financials
  const [dealValue, setDealValue] = useState('')
  const [buyerCommPct, setBuyerCommPct] = useState('2')
  const [sellerCommPct, setSellerCommPct] = useState('2')

  // Payments
  const [tokenAmount, setTokenAmount] = useState('')
  const [tokenDate, setTokenDate] = useState('')
  const [advanceAmount, setAdvanceAmount] = useState('')
  const [advanceDate, setAdvanceDate] = useState('')
  const [finalAmount, setFinalAmount] = useState('')
  const [finalDate, setFinalDate] = useState('')

  // Documents
  const [mouDate, setMouDate] = useState('')
  const [regDate, setRegDate] = useState('')

  // Loan
  const [loanRequired, setLoanRequired] = useState(false)
  const [loanAmount, setLoanAmount] = useState('')
  const [bankName, setBankName] = useState('')

  // Meta
  const [status, setStatus] = useState<DealStatus>('Created')
  const [notes, setNotes] = useState('')

  // ── Reactive calculations ──────────────────────────────────
  const dv = parseFloat(dealValue) || 0
  const bcp = parseFloat(buyerCommPct) || 0
  const scp = parseFloat(sellerCommPct) || 0

  const totalCommission = dv * (bcp + scp) / 100
  const buyerBrokerPayout = dv * 0.0125
  const sellerBrokerPayout = dv * 0.0125
  const referralPayout = referralEnabled ? dv * 0.0025 : 0
  const tier1Payout = dv * 0.001
  const tier2Payout = dv * 0.0005
  const yourNet =
    totalCommission - buyerBrokerPayout - sellerBrokerPayout - referralPayout - tier1Payout - tier2Payout

  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setServerError(null)
    const formData = new FormData(e.currentTarget)
    // Append computed commission fields
    formData.set('buyer_commission_pct', buyerCommPct)
    formData.set('seller_commission_pct', sellerCommPct)
    formData.set('has_referral', referralEnabled ? 'true' : '')
    const { createDealAction } = await import('@/app/actions/deals')
    const result = await createDealAction(formData)
    if (result?.error) {
      setServerError(result.error)
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/deals"
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Deals
        </Link>
        <span className="text-slate-300">|</span>
        <h2 className="text-xl font-bold text-slate-800">New Deal</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Identity ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Identity</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Linked Property" required>
              <select
                name="property_id"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className={selectCls}
              >
                <option value="">— Select Property —</option>
                {mockProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.land_code} — {p.title}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Linked Buyer Lead">
              <select
                name="buyer_lead_id"
                value={buyerLeadId}
                onChange={(e) => setBuyerLeadId(e.target.value)}
                className={selectCls}
              >
                <option value="">— Select Buyer Lead —</option>
                {mockBuyerLeads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.lead_id} — {l.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Linked Seller Lead">
              <select
                name="seller_lead_id"
                value={sellerLeadId}
                onChange={(e) => setSellerLeadId(e.target.value)}
                className={selectCls}
              >
                <option value="">— Select Seller Lead —</option>
                {mockSellerLeads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.lead_id} — {l.owner_name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* ── Brokers ──────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Brokers</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Buyer Broker', value: buyerBrokerId, set: setBuyerBrokerId },
              { label: 'Seller Broker', value: sellerBrokerId, set: setSellerBrokerId },
              { label: 'Co-Sponsor 1', value: coSponsor1Id, set: setCoSponsor1Id },
              { label: 'Co-Sponsor 2', value: coSponsor2Id, set: setCoSponsor2Id },
              { label: 'Tier 1 Override', value: tier1OverrideId, set: setTier1OverrideId },
              { label: 'Tier 2 Override', value: tier2OverrideId, set: setTier2OverrideId },
            ].map(({ label, value, set }) => (
              <FormField key={label} label={label}>
                <select value={value} onChange={(e) => set(e.target.value)} className={selectCls}>
                  <option value="">— None —</option>
                  {mockBrokers.map((b) => (
                    <option key={b.id} value={b.broker_id}>
                      {b.broker_id} — {b.name}
                    </option>
                  ))}
                </select>
              </FormField>
            ))}

            {/* Referral with toggle */}
            <div className="md:col-span-2">
              <FormField label="Referral Broker">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setReferralEnabled((v) => !v)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      referralEnabled ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        referralEnabled ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-slate-500">
                    {referralEnabled ? 'Enabled (0.25%)' : 'Disabled'}
                  </span>
                  {referralEnabled && (
                    <select
                      value={referralBrokerId}
                      onChange={(e) => setReferralBrokerId(e.target.value)}
                      className={`${selectCls} flex-1`}
                    >
                      <option value="">— Select Referral Broker —</option>
                      {mockBrokers.map((b) => (
                        <option key={b.id} value={b.broker_id}>
                          {b.broker_id} — {b.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </FormField>
            </div>
          </div>
        </div>

        {/* ── Financials ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Financials</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <FormField label="Deal Value (₹)" required>
              <input
                name="deal_value"
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="e.g. 1750000"
                className={inputCls}
              />
            </FormField>
            <FormField label="Buyer Commission %">
              <input
                type="number"
                step="0.1"
                value={buyerCommPct}
                onChange={(e) => setBuyerCommPct(e.target.value)}
                className={inputCls}
              />
            </FormField>
            <FormField label="Seller Commission %">
              <input
                type="number"
                step="0.1"
                value={sellerCommPct}
                onChange={(e) => setSellerCommPct(e.target.value)}
                className={inputCls}
              />
            </FormField>
          </div>

          {/* Auto-calculated breakdown */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator size={15} className="text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Commission Breakdown</span>
              {dv > 0 && (
                <span className="text-xs text-slate-500 ml-auto">
                  Based on {formatCurrency(dv)}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Commission', value: totalCommission, highlight: true },
                { label: 'Buyer Broker Payout (1.25%)', value: buyerBrokerPayout },
                { label: 'Seller Broker Payout (1.25%)', value: sellerBrokerPayout },
                { label: `Referral Payout (0.25%)`, value: referralPayout, muted: !referralEnabled },
                { label: 'Tier 1 Override (0.10%)', value: tier1Payout },
                { label: 'Tier 2 Override (0.05%)', value: tier2Payout },
                { label: 'Your Net', value: yourNet, net: true },
              ].map(({ label, value, highlight, net, muted }) => (
                <div
                  key={label}
                  className={`rounded-lg p-3 ${
                    net
                      ? 'bg-green-50 border border-green-200 col-span-2 md:col-span-1'
                      : highlight
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-white border border-slate-200'
                  } ${muted ? 'opacity-40' : ''}`}
                >
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p
                    className={`text-sm font-bold ${
                      net ? 'text-green-700' : highlight ? 'text-blue-700' : 'text-slate-800'
                    }`}
                  >
                    {dv > 0 ? formatCurrency(value) : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Payments ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Payments</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Token Amount (₹)">
              <input name="token_amount" type="number" value={tokenAmount} onChange={(e) => setTokenAmount(e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Token Date">
              <input name="token_date" type="date" value={tokenDate} onChange={(e) => setTokenDate(e.target.value)} className={inputCls} />
            </FormField>
            <div /> {/* spacer */}
            <FormField label="Advance Amount (₹)">
              <input type="number" value={advanceAmount} onChange={(e) => setAdvanceAmount(e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Advance Date">
              <input type="date" value={advanceDate} onChange={(e) => setAdvanceDate(e.target.value)} className={inputCls} />
            </FormField>
            <div />
            <FormField label="Final Amount (₹)">
              <input type="number" value={finalAmount} onChange={(e) => setFinalAmount(e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Final Date">
              <input type="date" value={finalDate} onChange={(e) => setFinalDate(e.target.value)} className={inputCls} />
            </FormField>
          </div>
        </div>

        {/* ── Documents ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Documents</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="MOU Date">
              <input type="date" value={mouDate} onChange={(e) => setMouDate(e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Registration Date">
              <input type="date" value={regDate} onChange={(e) => setRegDate(e.target.value)} className={inputCls} />
            </FormField>
          </div>
        </div>

        {/* ── Loan ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Loan</SectionTitle>
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setLoanRequired((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                loanRequired ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  loanRequired ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-slate-700">Loan Required</span>
          </div>
          {loanRequired && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Loan Amount (₹)">
                <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="Bank Name">
                <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. SBI, HDFC" className={inputCls} />
              </FormField>
            </div>
          )}
        </div>

        {/* ── Status & Notes ───────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Status & Notes</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Deal Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as DealStatus)} className={selectCls}>
                {dealStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Notes">
              <textarea
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Internal notes..."
                className={inputCls}
              />
            </FormField>
          </div>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create Deal'}
          </button>
          <Link
            href="/deals"
            className="px-6 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
