'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { mockBrokers } from '@/lib/mock-data'

interface FormState {
  owner_name: string
  phone: string
  whatsapp: string
  property_location: string
  approximate_area: string
  asking_price: string
  property_type: string
  reason_for_selling: string
  document_status: string
  source: string
  assigned_to: string
  follow_up_date: string
  notes: string
}

const initialForm: FormState = {
  owner_name: '',
  phone: '',
  whatsapp: '',
  property_location: '',
  approximate_area: '',
  asking_price: '',
  property_type: 'Plot',
  reason_for_selling: '',
  document_status: '',
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

export default function NewSellerLeadPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const set = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-screen-xl space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <p className="text-green-700 font-semibold text-lg">Seller lead saved successfully!</p>
          <p className="text-green-600 text-sm mt-1">The new seller lead has been added to the system.</p>
          <Link
            href="/seller-leads"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Seller Leads
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title="Add Seller Lead"
        subtitle="Capture a new property seller inquiry"
        action={
          <Link
            href="/seller-leads"
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Seller Leads
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Owner Contact */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Owner Contact</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Owner Name" required>
              <input
                className={inputCls}
                value={form.owner_name}
                onChange={(e) => set('owner_name', e.target.value)}
                placeholder="Full name"
                required
              />
            </Field>
            <Field label="Phone" required>
              <input
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
                className={inputCls}
                type="tel"
                value={form.whatsapp}
                onChange={(e) => set('whatsapp', e.target.value)}
                placeholder="If different from phone"
              />
            </Field>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Property Details</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-2">
              <Field label="Property Location" required>
                <input
                  className={inputCls}
                  value={form.property_location}
                  onChange={(e) => set('property_location', e.target.value)}
                  placeholder="Village / Area / Road"
                  required
                />
              </Field>
            </div>
            <Field label="Approximate Area">
              <input
                className={inputCls}
                value={form.approximate_area}
                onChange={(e) => set('approximate_area', e.target.value)}
                placeholder="e.g. 3 Acres or 1200 Sqft"
              />
            </Field>
            <Field label="Asking Price (₹)">
              <input
                className={inputCls}
                type="number"
                value={form.asking_price}
                onChange={(e) => set('asking_price', e.target.value)}
                placeholder="e.g. 5000000"
              />
            </Field>
            <Field label="Property Type">
              <select
                className={selectCls}
                value={form.property_type}
                onChange={(e) => set('property_type', e.target.value)}
              >
                <option>Plot</option>
                <option>House</option>
                <option>Farm</option>
                <option>Commercial</option>
              </select>
            </Field>
            <Field label="Reason for Selling">
              <input
                className={inputCls}
                value={form.reason_for_selling}
                onChange={(e) => set('reason_for_selling', e.target.value)}
                placeholder="e.g. Financial need, relocation"
              />
            </Field>
            <Field label="Document Status">
              <input
                className={inputCls}
                value={form.document_status}
                onChange={(e) => set('document_status', e.target.value)}
                placeholder="e.g. Patta available, All docs ready"
              />
            </Field>
          </div>
        </div>

        {/* Lead Management */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Lead Management</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Source">
              <select
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
                <option>Broker</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Assigned To">
              <select
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
                className={inputCls}
                type="date"
                value={form.follow_up_date}
                onChange={(e) => set('follow_up_date', e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Notes">
                <textarea
                  className={inputCls + ' resize-none'}
                  rows={3}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Any additional observations or context about this lead"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <Link
            href="/seller-leads"
            className="px-5 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Save Seller Lead
          </button>
        </div>
      </form>
    </div>
  )
}
