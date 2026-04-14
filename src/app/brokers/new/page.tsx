'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { mockBrokers } from '@/lib/mock-data'
import type { BrokerStatus } from '@/types'

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

const brokerStatuses: BrokerStatus[] = ['Active', 'Inactive', 'Blacklisted']

export default function NewBrokerPage() {
  // Identity
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [areaCoverage, setAreaCoverage] = useState('')

  // Network
  const [recruitedById, setRecruitedById] = useState('')
  const [coSponsor1Id, setCoSponsor1Id] = useState('')
  const [coSponsor2Id, setCoSponsor2Id] = useState('')

  // Access
  const [loginActive, setLoginActive] = useState(true)

  // Payment
  const [bankAccount, setBankAccount] = useState('')
  const [upiId, setUpiId] = useState('')

  // Meta
  const [status, setStatus] = useState<BrokerStatus>('Active')
  const [notes, setNotes] = useState('')

  // File state (display only)
  const [agreementFile, setAgreementFile] = useState<File | null>(null)
  const [ndaFile, setNdaFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Broker added successfully! (client-side demo)')
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/brokers"
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Brokers
        </Link>
        <span className="text-slate-300">|</span>
        <h2 className="text-xl font-bold text-slate-800">Add Broker</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Identity ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Identity</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Kumar"
                className={inputCls}
                required
              />
            </FormField>
            <FormField label="Phone" required>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                className={inputCls}
                required
              />
            </FormField>
            <FormField label="WhatsApp Number">
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Same as phone if same"
                className={inputCls}
              />
            </FormField>
            <FormField label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="broker@example.com"
                className={inputCls}
              />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Area Coverage">
                <input
                  type="text"
                  value={areaCoverage}
                  onChange={(e) => setAreaCoverage(e.target.value)}
                  placeholder="e.g. Rasipuram, Namakkal, Salem"
                  className={inputCls}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* ── Network ──────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Network</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Recruited By">
              <select
                value={recruitedById}
                onChange={(e) => setRecruitedById(e.target.value)}
                className={selectCls}
              >
                <option value="">— None —</option>
                {mockBrokers.map((b) => (
                  <option key={b.id} value={b.broker_id}>
                    {b.broker_id} — {b.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Co-Sponsor 1">
              <select
                value={coSponsor1Id}
                onChange={(e) => setCoSponsor1Id(e.target.value)}
                className={selectCls}
              >
                <option value="">— None —</option>
                {mockBrokers.map((b) => (
                  <option key={b.id} value={b.broker_id}>
                    {b.broker_id} — {b.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Co-Sponsor 2">
              <select
                value={coSponsor2Id}
                onChange={(e) => setCoSponsor2Id(e.target.value)}
                className={selectCls}
              >
                <option value="">— None —</option>
                {mockBrokers.map((b) => (
                  <option key={b.id} value={b.broker_id}>
                    {b.broker_id} — {b.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* ── Access ───────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Access</SectionTitle>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLoginActive((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                loginActive ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  loginActive ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-slate-700">
              Login Active
              <span className={`ml-2 text-xs font-semibold ${loginActive ? 'text-green-700' : 'text-slate-400'}`}>
                {loginActive ? 'Enabled' : 'Disabled'}
              </span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            When enabled, the broker can log in to the broker portal.
          </p>
        </div>

        {/* ── Legal / Documents ────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Legal Documents</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Broker Agreement">
              <label className="flex flex-col items-center gap-2 px-4 py-6 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-slate-50">
                <span className="text-2xl">📄</span>
                <span className="text-xs text-slate-500">
                  {agreementFile ? agreementFile.name : 'Click to upload PDF'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setAgreementFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </FormField>
            <FormField label="NDA (Non-Disclosure Agreement)">
              <label className="flex flex-col items-center gap-2 px-4 py-6 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-slate-50">
                <span className="text-2xl">🔏</span>
                <span className="text-xs text-slate-500">
                  {ndaFile ? ndaFile.name : 'Click to upload PDF'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setNdaFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </FormField>
          </div>
        </div>

        {/* ── Payment ──────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Payment Details</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Bank Account Number">
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Account number"
                className={inputCls}
              />
            </FormField>
            <FormField label="UPI ID">
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. broker@upi"
                className={inputCls}
              />
            </FormField>
          </div>
        </div>

        {/* ── Status & Notes ───────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Status & Notes</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Broker Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BrokerStatus)}
                className={selectCls}
              >
                {brokerStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Internal notes..."
                className={inputCls}
              />
            </FormField>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Broker
          </button>
          <Link
            href="/brokers"
            className="px-6 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
