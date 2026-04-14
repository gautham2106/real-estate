'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import ShapePreview from '@/components/ui/ShapePreview'

interface FormState {
  // Identity
  title: string
  type: string
  classification: string
  // Size & Price
  area: string
  area_unit: string
  price: string
  // Location
  address: string
  landmark: string
  village: string
  taluk: string
  district: string
  gps_lat: string
  gps_lng: string
  facing: string
  // Features
  road_access: boolean
  water: boolean
  electricity: boolean
  // Legal
  survey_number: string
  patta_number: string
  dtcp_approved: string
  rera: boolean
  legal_status: string
  // Owner
  owner_name: string
  owner_phone: string
  owner_whatsapp: string
  owner_aadhaar: string
  owner_pan: string
  // Exclusivity
  exclusivity_start: string
  exclusivity_end: string
  // Management
  assigned_broker: string
  property_status: string
  internal_notes: string
}

const initialForm: FormState = {
  title: '', type: 'Plot', classification: 'Residential',
  area: '', area_unit: 'Sqft', price: '',
  address: '', landmark: '', village: '', taluk: '', district: '',
  gps_lat: '', gps_lng: '', facing: 'N',
  road_access: false, water: false, electricity: false,
  survey_number: '', patta_number: '', dtcp_approved: 'No', rera: false, legal_status: 'Clear',
  owner_name: '', owner_phone: '', owner_whatsapp: '', owner_aadhaar: '', owner_pan: '',
  exclusivity_start: '', exclusivity_end: '',
  assigned_broker: '', property_status: 'Available', internal_notes: '',
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

export default function NewPropertyPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const set = (field: keyof FormState | string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setServerError(null)
    const formData = new FormData(e.currentTarget)
    const { createPropertyAction } = await import('@/app/actions/properties')
    const result = await createPropertyAction(formData)
    if (result?.error) {
      setServerError(result.error)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-screen-xl space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <p className="text-green-700 font-semibold text-lg">Property saved successfully!</p>
          <p className="text-green-600 text-sm mt-1">The new property has been added to the system.</p>
          <Link
            href="/properties"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title="Add New Property"
        subtitle="Fill in all details to list a new property"
        action={
          <Link
            href="/properties"
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Properties
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Identity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Identity</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Title" required>
              <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Prime Plot Near Highway" required />
            </Field>
            <Field label="Type" required>
              <select className={selectCls} value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option>Plot</option>
                <option>House</option>
                <option>Farm</option>
                <option>Commercial</option>
              </select>
            </Field>
            <Field label="Classification">
              <select className={selectCls} value={form.classification} onChange={(e) => set('classification', e.target.value)}>
                <option>Agricultural</option>
                <option>Residential</option>
                <option>Commercial</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Size & Price */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Size & Price</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Area" required>
              <input className={inputCls} type="number" value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="e.g. 2400" required />
            </Field>
            <Field label="Area Unit">
              <select className={selectCls} value={form.area_unit} onChange={(e) => set('area_unit', e.target.value)}>
                <option>Sqft</option>
                <option>Cents</option>
                <option>Acres</option>
              </select>
            </Field>
            <Field label="Price (₹)" required>
              <input className={inputCls} type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="e.g. 1800000" required />
            </Field>
          </div>

          {/* Shape measurements + live preview */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Shape Measurements</p>
            <div className="flex flex-col lg:flex-row gap-5">
              <div className="grid grid-cols-2 gap-3 flex-1">
                {(['side_a', 'side_b', 'side_c', 'side_d'] as const).map((k, i) => (
                  <Field key={k} label={`Side ${['A (Top)', 'B (Right)', 'C (Bottom)', 'D (Left)'][i]}`}>
                    <input
                      className={inputCls}
                      type="number"
                      name={k}
                      value={(form as unknown as Record<string, string>)[k] ?? ''}
                      onChange={e => set(k, e.target.value)}
                      placeholder="in feet"
                    />
                  </Field>
                ))}
              </div>
              <ShapePreview
                sideA={parseFloat((form as unknown as Record<string, string>).side_a ?? '0') || 0}
                sideB={parseFloat((form as unknown as Record<string, string>).side_b ?? '0') || 0}
                sideC={parseFloat((form as unknown as Record<string, string>).side_c ?? '0') || 0}
                sideD={parseFloat((form as unknown as Record<string, string>).side_d ?? '0') || 0}
                unit="ft"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Location</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Address">
                <input className={inputCls} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Street / Road / Area" />
              </Field>
            </div>
            <Field label="Landmark">
              <input className={inputCls} value={form.landmark} onChange={(e) => set('landmark', e.target.value)} placeholder="e.g. Near BSNL Tower" />
            </Field>
            <Field label="Village">
              <input className={inputCls} value={form.village} onChange={(e) => set('village', e.target.value)} placeholder="Village name" />
            </Field>
            <Field label="Taluk">
              <input className={inputCls} value={form.taluk} onChange={(e) => set('taluk', e.target.value)} placeholder="Taluk" />
            </Field>
            <Field label="District">
              <input className={inputCls} value={form.district} onChange={(e) => set('district', e.target.value)} placeholder="District" />
            </Field>
            <Field label="GPS Latitude">
              <input className={inputCls} type="number" step="any" value={form.gps_lat} onChange={(e) => set('gps_lat', e.target.value)} placeholder="e.g. 11.4502" />
            </Field>
            <Field label="GPS Longitude">
              <input className={inputCls} type="number" step="any" value={form.gps_lng} onChange={(e) => set('gps_lng', e.target.value)} placeholder="e.g. 78.0808" />
            </Field>
            <Field label="Facing">
              <select className={selectCls} value={form.facing} onChange={(e) => set('facing', e.target.value)}>
                <option value="N">North</option>
                <option value="S">South</option>
                <option value="E">East</option>
                <option value="W">West</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Features</SectionTitle>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.road_access}
                onChange={(e) => set('road_access', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Road Access</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.water}
                onChange={(e) => set('water', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Water</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.electricity}
                onChange={(e) => set('electricity', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Electricity</span>
            </label>
          </div>
        </div>

        {/* Legal */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Legal</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Survey Number">
              <input className={inputCls} value={form.survey_number} onChange={(e) => set('survey_number', e.target.value)} placeholder="Survey No." />
            </Field>
            <Field label="Patta Number">
              <input className={inputCls} value={form.patta_number} onChange={(e) => set('patta_number', e.target.value)} placeholder="Patta No." />
            </Field>
            <Field label="DTCP Approved">
              <select className={selectCls} value={form.dtcp_approved} onChange={(e) => set('dtcp_approved', e.target.value)}>
                <option>Yes</option>
                <option>No</option>
                <option>Applied</option>
              </select>
            </Field>
            <Field label="Legal Status">
              <select className={selectCls} value={form.legal_status} onChange={(e) => set('legal_status', e.target.value)}>
                <option>Clear</option>
                <option>Disputed</option>
                <option>Pending</option>
              </select>
            </Field>
            <div className="flex items-center mt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.rera}
                  onChange={(e) => set('rera', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">RERA Applicable</span>
              </label>
            </div>
          </div>
        </div>

        {/* Owner (Admin Only) */}
        <div className="bg-white rounded-xl border border-amber-200 p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Owner Details</h3>
            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">Admin Only</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Owner Name">
              <input className={inputCls} value={form.owner_name} onChange={(e) => set('owner_name', e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Phone">
              <input className={inputCls} type="tel" value={form.owner_phone} onChange={(e) => set('owner_phone', e.target.value)} placeholder="10-digit mobile" />
            </Field>
            <Field label="WhatsApp">
              <input className={inputCls} type="tel" value={form.owner_whatsapp} onChange={(e) => set('owner_whatsapp', e.target.value)} placeholder="WhatsApp number" />
            </Field>
            <Field label="Aadhaar Number">
              <input className={inputCls} value={form.owner_aadhaar} onChange={(e) => set('owner_aadhaar', e.target.value)} placeholder="XXXX-XXXX-XXXX" />
            </Field>
            <Field label="PAN Number">
              <input className={inputCls} value={form.owner_pan} onChange={(e) => set('owner_pan', e.target.value)} placeholder="ABCDE1234F" />
            </Field>
          </div>
        </div>

        {/* Exclusivity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Exclusivity</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Exclusivity Start Date">
              <input className={inputCls} type="date" value={form.exclusivity_start} onChange={(e) => set('exclusivity_start', e.target.value)} />
            </Field>
            <Field label="Exclusivity End Date">
              <input className={inputCls} type="date" value={form.exclusivity_end} onChange={(e) => set('exclusivity_end', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Management */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Management</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Assigned Broker">
              <select className={selectCls} value={form.assigned_broker} onChange={(e) => set('assigned_broker', e.target.value)}>
                <option value="">— Select Broker —</option>
                <option value="BRK-001">Arjun Kumar</option>
                <option value="BRK-002">Priya Sharma</option>
                <option value="BRK-003">Rajesh Nair</option>
                <option value="BRK-004">Kavitha Raj</option>
                <option value="BRK-005">Suresh Babu</option>
              </select>
            </Field>
            <Field label="Property Status">
              <select className={selectCls} value={form.property_status} onChange={(e) => set('property_status', e.target.value)}>
                <option>Available</option>
                <option>Enquiry Received</option>
                <option>Site Visit Done</option>
                <option>Negotiating</option>
                <option>Token Received</option>
                <option>MOU Signed</option>
                <option>Loan Processing</option>
                <option>Registration Scheduled</option>
                <option>Registration Done</option>
                <option>Sold</option>
                <option>On Hold</option>
                <option>Exclusivity Expired</option>
                <option>Cancelled</option>
              </select>
            </Field>
            <div className="sm:col-span-2 lg:col-span-1">
              <Field label="Internal Notes">
                <textarea
                  className={inputCls + ' resize-none'}
                  rows={3}
                  value={form.internal_notes}
                  onChange={(e) => set('internal_notes', e.target.value)}
                  placeholder="Internal notes (not visible to brokers)"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Actions */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}
        <div className="flex items-center justify-end gap-3 pb-4">
          <Link
            href="/properties"
            className="px-5 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Save Property
          </button>
        </div>
      </form>
    </div>
  )
}
