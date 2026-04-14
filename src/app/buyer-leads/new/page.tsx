'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { mockBrokers } from '@/lib/mock-data'

interface FormState {
  name: string
  phone: string
  whatsapp: string
  email: string
  budget_min: string
  budget_max: string
  preferred_location: string
  property_type_needed: string
  area_required: string
  purpose: string
  loan_required: boolean
  loan_amount: string
  urgency: string
  source: string
  assigned_to: string
  follow_up_date: string
  notes: string
}

const initialForm: FormState = {
  name: '',
  phone: '',
  whatsapp: '',
  email: '',
  budget_min: '',
  budget_max: '',
  preferred_location: '',
  property_type_needed: 'Plot',
  area_required: '',
  purpose: 'Construction',
  loan_required: false,
  loan_amount: '',
  urgency: '3 months',
  source: '',
  assigned_to: '',
  follow_up_date: '',
  notes: '',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">
      {children}
    </h3>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
const selectCls = inputCls + ' appearance-none'

export default function NewBuyerLeadPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setServerError(null)
    const formData = new FormData(e.currentTarget)
    // Append boolean separately
    formData.set('loan_required', form.loan_required ? 'true' : '')
    const { createBuyerLeadAction } = await import('@/app/actions/leads')
    const result = await createBuyerLeadAction(formData)
    if (result?.error) {
      setServerError(result.error)
      setSubmitting(false)
    }
    // On success, the server action redirects
  }

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title="Add Buyer Lead"
        subtitle="Capture a new property buyer inquiry"
        action={
          <Link
            href="/buyer-leads"
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Buyer Leads
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Buyer Contact */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Buyer Contact</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Name" required>
              <input
                name="name"
                className={inputCls}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Full name"
                required
              />
            </Field>
            <Field label="Phone" required>
              <input
                name="phone"
                className={inputCls}
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="10-digit mobile"
                required
              />
            </Field>
            <Field label="WhatsApp Number">
              <input
                name="whatsapp"
                className={inputCls}
                type="tel"
                value={form.whatsapp}
                onChange={(e) => set('whatsapp', e.target.value)}
                placeholder="If different from phone"
              />
            </Field>
            <Field label="Email">
              <input
                name="email"
                className={inputCls}
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="buyer@example.com"
              />
            </Field>
          </div>
        </div>

        {/* Requirement */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Requirement</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Budget Minimum (₹)">
              <input
                name="budget_min"
                className={inputCls}
                type="number"
                value={form.budget_min}
                onChange={(e) => set('budget_min', e.target.value)}
                placeholder="e.g. 2000000"
              />
            </Field>
            <Field label="Budget Maximum (₹)">
              <input
                name="budget_max"
                className={inputCls}
                type="number"
                value={form.budget_max}
                onChange={(e) => set('budget_max', e.target.value)}
                placeholder="e.g. 4000000"
              />
            </Field>
            <Field label="Preferred Location">
              <input
                name="preferred_location"
                className={inputCls}
                value={form.preferred_location}
                onChange={(e) => set('preferred_location', e.target.value)}
                placeholder="e.g. Rasipuram / Namakkal"
              />
            </Field>
            <Field label="Property Type Needed">
              <select
                name="property_type_needed"
                className={selectCls}
                value={form.property_type_needed}
                onChange={(e) => set('property_type_needed', e.target.value)}
              >
                <option>Plot</option>
                <option>House</option>
                <option>Farm</option>
                <option>Commercial</option>
              </select>
            </Field>
            <Field label="Area Required">
              <input
                name="area_required"
                className={inputCls}
                value={form.area_required}
                onChange={(e) => set('area_required', e.target.value)}
                placeholder="e.g. 1500–2400 Sqft or 3–5 Acres"
              />
            </Field>
            <Field label="Purpose">
              <select
                name="purpose"
                className={selectCls}
                value={form.purpose}
                onChange={(e) => set('purpose', e.target.value)}
              >
                <option>Investment</option>
                <option>Construction</option>
                <option>Agriculture</option>
              </select>
            </Field>
          </div>

          {/* Loan Toggle */}
          <div className="mt-5 flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.loan_required}
                  onChange={(e) => set('loan_required', e.target.checked)}
                />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
              </div>
              <span className="text-sm font-medium text-slate-700">Loan Required</span>
            </label>
            {form.loan_required && (
              <div className="max-w-xs">
                <Field label="Loan Amount (₹)">
                  <input
                    name="loan_amount"
                    className={inputCls}
                    type="number"
                    value={form.loan_amount}
                    onChange={(e) => set('loan_amount', e.target.value)}
                    placeholder="e.g. 1500000"
                  />
                </Field>
              </div>
            )}
          </div>
        </div>

        {/* Lead Management */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Lead Management</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Urgency">
              <select
                name="urgency"
                className={selectCls}
                value={form.urgency}
                onChange={(e) => set('urgency', e.target.value)}
              >
                <option>Immediate</option>
                <option>3 months</option>
                <option>6 months</option>
              </select>
            </Field>
            <Field label="Source">
              <select
                name="source"
                className={selectCls}
                value={form.source}
                onChange={(e) => set('source', e.target.value)}
              >
                <option value="">— Select Source —</option>
                <option>Instagram</option>
                <option>Facebook</option>
                <option>WhatsApp</option>
                <option>Referral</option>
                <option>Walk-in</option>
              </select>
            </Field>
            <Field label="Assigned To">
              <select
                name="assigned_to"
                className={selectCls}
                value={form.assigned_to}
                onChange={(e) => set('assigned_to', e.target.value)}
              >
                <option value="">— Select Broker —</option>
                {mockBrokers.map((b) => (
                  <option key={b.broker_id} value={b.broker_id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Follow Up Date">
              <input
                name="follow_up_date"
                className={inputCls}
                type="date"
                value={form.follow_up_date}
                onChange={(e) => set('follow_up_date', e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes">
                <textarea
                  name="notes_history"
                  className={inputCls + ' resize-none'}
                  rows={3}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Any additional requirements or context about this buyer"
                />
              </Field>
            </div>
          </div>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <Link
            href="/buyer-leads"
            className="px-5 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save Buyer Lead'}
          </button>
        </div>
      </form>
    </div>
  )
}
