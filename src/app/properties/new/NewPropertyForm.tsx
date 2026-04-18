'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, MapPin, Plus, X, Image as ImageIcon } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import ShapePreview from '@/components/ui/ShapePreview'
import type { Property } from '@/types'

const GpsPickerMap = dynamic(() => import('@/components/map/GpsPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg">
      <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  ),
})

interface FormState {
  title: string; type: string; classification: string
  area: string; area_unit: string; price: string
  address: string; landmark: string; village: string; taluk: string; district: string
  gps_lat: string; gps_lng: string; facing: string
  road_access: boolean; water: boolean; electricity: boolean
  survey_number: string; patta_number: string; dtcp_approved: string; rera: boolean; legal_status: string
  owner_name: string; owner_phone: string; owner_whatsapp: string; owner_aadhaar: string; owner_pan: string
  exclusivity_start: string; exclusivity_end: string
  assigned_broker: string; property_status: string; internal_notes: string
  side_a: string; side_b: string; side_c: string; side_d: string
  video_link: string
}

const defaultForm: FormState = {
  title: '', type: 'Plot', classification: 'Residential',
  area: '', area_unit: 'Sqft', price: '',
  address: '', landmark: '', village: '', taluk: '', district: '',
  gps_lat: '', gps_lng: '', facing: 'N',
  road_access: false, water: false, electricity: false,
  survey_number: '', patta_number: '', dtcp_approved: 'No', rera: false, legal_status: 'Clear',
  owner_name: '', owner_phone: '', owner_whatsapp: '', owner_aadhaar: '', owner_pan: '',
  exclusivity_start: '', exclusivity_end: '',
  assigned_broker: '', property_status: 'Available', internal_notes: '',
  side_a: '', side_b: '', side_c: '', side_d: '',
  video_link: '',
}

function fromProperty(p: Property): FormState {
  return {
    title: p.title,
    type: p.type,
    classification: p.classification,
    area: String(p.area),
    area_unit: p.area_unit,
    price: String(p.price),
    address: p.address ?? '',
    landmark: '',
    village: p.village ?? '',
    taluk: p.taluk ?? '',
    district: p.district ?? '',
    gps_lat: p.gps_lat ? String(p.gps_lat) : '',
    gps_lng: p.gps_lng ? String(p.gps_lng) : '',
    facing: p.facing ?? 'N',
    road_access: !!(p.road_access && p.road_access !== 'No'),
    water: !!(p.water && p.water !== 'No'),
    electricity: p.electricity ?? false,
    survey_number: p.survey_number ?? '',
    patta_number: p.patta_number ?? '',
    dtcp_approved: p.dtcp_approved ?? 'No',
    rera: p.rera_applicable ?? false,
    legal_status: p.legal_status ?? 'Clear',
    owner_name: p.owner_name ?? '',
    owner_phone: p.owner_phone ?? '',
    owner_whatsapp: p.owner_whatsapp ?? '',
    owner_aadhaar: p.owner_aadhaar ?? '',
    owner_pan: p.owner_pan ?? '',
    exclusivity_start: p.exclusivity_start ?? '',
    exclusivity_end: p.exclusivity_end ?? '',
    assigned_broker: p.assigned_broker_id ?? '',
    property_status: p.status,
    internal_notes: p.internal_notes ?? '',
    side_a: p.side_a ? String(p.side_a) : '',
    side_b: p.side_b ? String(p.side_b) : '',
    side_c: p.side_c ? String(p.side_c) : '',
    side_d: p.side_d ? String(p.side_d) : '',
    video_link: p.video_link ?? '',
  }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">{children}</h3>
}
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}
const inputCls = 'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
const selectCls = inputCls + ' appearance-none'

interface Props {
  isAdmin: boolean
  initialData?: Property
  propertyId?: string
}

export default function NewPropertyForm({ isAdmin, initialData, propertyId }: Props) {
  const isEditMode = !!propertyId
  const [form, setForm] = useState<FormState>(() =>
    initialData ? fromProperty(initialData) : defaultForm
  )
  const [photoUrls, setPhotoUrls] = useState<string[]>(initialData?.photo_urls ?? [''])
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showMapPicker, setShowMapPicker] = useState(false)

  const set = (field: keyof FormState | string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setServerError(null)
    const formData = new FormData(e.currentTarget)
    if (isEditMode) {
      const { updatePropertyAction } = await import('@/app/actions/properties')
      const result = await updatePropertyAction(propertyId!, formData)
      if (result?.error) setServerError(result.error)
      else setSubmitted(true)
    } else {
      const { createPropertyAction } = await import('@/app/actions/properties')
      const result = await createPropertyAction(formData)
      if (result?.error) setServerError(result.error)
      else setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-screen-xl space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <p className="text-green-700 font-semibold text-lg">
            {isEditMode ? 'Property updated successfully!' : 'Property saved successfully!'}
          </p>
          <p className="text-green-600 text-sm mt-1">
            {isEditMode ? 'Your changes have been saved.' : 'The new property has been added to the system.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {isEditMode && (
              <Link href={`/properties/${propertyId}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                View Property
              </Link>
            )}
            <Link href="/properties" className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              Back to Properties
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title={isEditMode ? `Edit Property` : 'Add New Property'}
        subtitle={isEditMode ? `Editing ${initialData?.land_code ?? ''}` : 'Fill in all details to list a new property'}
        action={
          <Link
            href={isEditMode ? `/properties/${propertyId}` : '/properties'}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={15} />{isEditMode ? 'Back to Property' : 'Back to Properties'}
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Identity</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Title" required>
              <input name="title" className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Prime Plot Near Highway" required />
            </Field>
            <Field label="Type" required>
              <select name="type" className={selectCls} value={form.type} onChange={e => set('type', e.target.value)}>
                {['Plot','House','Farm','Commercial'].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Classification">
              <select name="classification" className={selectCls} value={form.classification} onChange={e => set('classification', e.target.value)}>
                {['Agricultural','Residential','Commercial'].map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Size & Price */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Size & Price</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Area" required>
              <input name="area" className={inputCls} type="number" value={form.area} onChange={e => set('area', e.target.value)} placeholder="e.g. 2400" required />
            </Field>
            <Field label="Area Unit">
              <select name="area_unit" className={selectCls} value={form.area_unit} onChange={e => set('area_unit', e.target.value)}>
                {['Sqft','Cents','Acres'].map(u => <option key={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Price (₹)" required>
              <input name="price" className={inputCls} type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 1800000" required />
            </Field>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Shape Measurements</p>
            <div className="flex flex-col lg:flex-row gap-5">
              <div className="grid grid-cols-2 gap-3 flex-1">
                {(['side_a','side_b','side_c','side_d'] as const).map((k, i) => (
                  <Field key={k} label={`Side ${['A (Top)','B (Right)','C (Bottom)','D (Left)'][i]}`}>
                    <input className={inputCls} type="number" name={k}
                      value={form[k] as string}
                      onChange={e => set(k, e.target.value)} placeholder="in feet" />
                  </Field>
                ))}
              </div>
              <ShapePreview
                sideA={parseFloat(form.side_a) || 0}
                sideB={parseFloat(form.side_b) || 0}
                sideC={parseFloat(form.side_c) || 0}
                sideD={parseFloat(form.side_d) || 0}
                facing={form.facing || undefined}
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
              <Field label="Address"><input name="address" className={inputCls} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street / Road / Area" /></Field>
            </div>
            <Field label="Landmark"><input name="landmark" className={inputCls} value={form.landmark} onChange={e => set('landmark', e.target.value)} placeholder="e.g. Near BSNL Tower" /></Field>
            <Field label="Village"><input name="village" className={inputCls} value={form.village} onChange={e => set('village', e.target.value)} placeholder="Village name" /></Field>
            <Field label="Taluk"><input name="taluk" className={inputCls} value={form.taluk} onChange={e => set('taluk', e.target.value)} placeholder="Taluk" /></Field>
            <Field label="District"><input name="district" className={inputCls} value={form.district} onChange={e => set('district', e.target.value)} placeholder="District" /></Field>
            <Field label="GPS Latitude">
              <input name="gps_lat" className={inputCls} type="number" step="any" value={form.gps_lat} onChange={e => set('gps_lat', e.target.value)} placeholder="e.g. 11.4502" />
            </Field>
            <Field label="GPS Longitude">
              <input name="gps_lng" className={inputCls} type="number" step="any" value={form.gps_lng} onChange={e => set('gps_lng', e.target.value)} placeholder="e.g. 78.0808" />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <button
                type="button"
                onClick={() => setShowMapPicker(v => !v)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <MapPin size={14} />
                {showMapPicker ? 'Hide Map' : (form.gps_lat && form.gps_lng ? 'Edit Pin on Map' : 'Drop Pin on Map')}
              </button>
              {form.gps_lat && form.gps_lng && !showMapPicker && (
                <p className="mt-1.5 text-xs text-slate-500">
                  📍 {parseFloat(form.gps_lat).toFixed(6)}, {parseFloat(form.gps_lng).toFixed(6)}
                  <button type="button" onClick={() => { set('gps_lat', ''); set('gps_lng', '') }} className="ml-2 text-red-400 hover:text-red-600">✕ Clear</button>
                </p>
              )}
              {showMapPicker && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 320 }}>
                  <GpsPickerMap
                    lat={form.gps_lat}
                    lng={form.gps_lng}
                    onPick={(lat, lng) => { set('gps_lat', String(lat)); set('gps_lng', String(lng)) }}
                  />
                </div>
              )}
            </div>
            <Field label="Facing">
              <select name="facing" className={selectCls} value={form.facing} onChange={e => set('facing', e.target.value)}>
                <option value="N">North</option><option value="S">South</option><option value="E">East</option><option value="W">West</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Features</SectionTitle>
          <div className="flex flex-wrap gap-6">
            {(['road_access','water','electricity'] as const).map(f => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name={f} checked={form[f] as boolean} onChange={e => set(f, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-slate-700">{f === 'road_access' ? 'Road Access' : f.charAt(0).toUpperCase() + f.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Legal</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Survey Number"><input name="survey_number" className={inputCls} value={form.survey_number} onChange={e => set('survey_number', e.target.value)} placeholder="Survey No." /></Field>
            <Field label="Patta Number"><input name="patta_number" className={inputCls} value={form.patta_number} onChange={e => set('patta_number', e.target.value)} placeholder="Patta No." /></Field>
            <Field label="DTCP Approved">
              <select name="dtcp_approved" className={selectCls} value={form.dtcp_approved} onChange={e => set('dtcp_approved', e.target.value)}>
                {['Yes','No','Applied'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Legal Status">
              <select name="legal_status" className={selectCls} value={form.legal_status} onChange={e => set('legal_status', e.target.value)}>
                {['Clear','Disputed','Pending'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <div className="flex items-center mt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="rera_applicable" checked={form.rera} onChange={e => set('rera', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-slate-700">RERA Applicable</span>
              </label>
            </div>
          </div>
        </div>

        {/* Owner Details — Admin Only */}
        {isAdmin && (
          <div className="bg-white rounded-xl border border-amber-200 p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Owner Details</h3>
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">Admin Only</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Owner Name"><input name="owner_name" className={inputCls} value={form.owner_name} onChange={e => set('owner_name', e.target.value)} placeholder="Full name" /></Field>
              <Field label="Phone"><input name="owner_phone" className={inputCls} type="tel" value={form.owner_phone} onChange={e => set('owner_phone', e.target.value)} placeholder="10-digit mobile" /></Field>
              <Field label="WhatsApp"><input name="owner_whatsapp" className={inputCls} type="tel" value={form.owner_whatsapp} onChange={e => set('owner_whatsapp', e.target.value)} placeholder="WhatsApp number" /></Field>
              <Field label="Aadhaar Number"><input name="owner_aadhaar" className={inputCls} value={form.owner_aadhaar} onChange={e => set('owner_aadhaar', e.target.value)} placeholder="XXXX-XXXX-XXXX" /></Field>
              <Field label="PAN Number"><input name="owner_pan" className={inputCls} value={form.owner_pan} onChange={e => set('owner_pan', e.target.value)} placeholder="ABCDE1234F" /></Field>
            </div>
          </div>
        )}

        {/* Exclusivity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Exclusivity</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Exclusivity Start Date"><input name="exclusivity_start" className={inputCls} type="date" value={form.exclusivity_start} onChange={e => set('exclusivity_start', e.target.value)} /></Field>
            <Field label="Exclusivity End Date"><input name="exclusivity_end" className={inputCls} type="date" value={form.exclusivity_end} onChange={e => set('exclusivity_end', e.target.value)} /></Field>
          </div>
        </div>

        {/* Photos & Media */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Photos & Media</SectionTitle>
          <div className="space-y-4">
            {/* Photo URLs */}
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Property Photos <span className="text-slate-400">(paste image URLs)</span></p>
              <div className="space-y-2">
                {photoUrls.map((url, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-shrink-0 mt-1">
                      {url ? (
                        <img
                          src={url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-100"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                          <ImageIcon size={16} className="text-slate-400" />
                        </div>
                      )}
                    </div>
                    <input
                      name="photo_urls"
                      type="url"
                      value={url}
                      onChange={e => setPhotoUrls(prev => prev.map((u, j) => j === i ? e.target.value : u))}
                      placeholder="https://example.com/photo.jpg"
                      className={inputCls + ' flex-1'}
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrls(prev => prev.length === 1 ? [''] : prev.filter((_, j) => j !== i))}
                      className="mt-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPhotoUrls(prev => [...prev, ''])}
                className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                <Plus size={14} /> Add another photo URL
              </button>
            </div>
            {/* Video */}
            <Field label="Video Link (YouTube / Drive)">
              <input name="video_link" className={inputCls} type="url" value={form.video_link}
                onChange={e => set('video_link', e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </Field>
          </div>
        </div>

        {/* Management */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionTitle>Management</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Assigned Broker">
              <select name="assigned_broker_id" className={selectCls} value={form.assigned_broker} onChange={e => set('assigned_broker', e.target.value)}>
                <option value="">— Select Broker —</option>
                {[['BRK-001','Arjun Kumar'],['BRK-002','Priya Sharma'],['BRK-003','Rajesh Nair'],['BRK-004','Kavitha Raj'],['BRK-005','Suresh Babu']].map(([id,name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </Field>
            <Field label="Property Status">
              <select name="status" className={selectCls} value={form.property_status} onChange={e => set('property_status', e.target.value)}>
                {['Available','Enquiry Received','Site Visit Done','Negotiating','Token Received','MOU Signed','Loan Processing','Registration Scheduled','Registration Done','Sold','On Hold','Exclusivity Expired','Cancelled'].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            {isAdmin && (
              <div className="sm:col-span-2 lg:col-span-1">
                <Field label="Internal Notes">
                  <textarea name="internal_notes" className={inputCls + ' resize-none'} rows={3} value={form.internal_notes}
                    onChange={e => set('internal_notes', e.target.value)} placeholder="Internal notes (not visible to brokers)" />
                </Field>
              </div>
            )}
          </div>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{serverError}</div>
        )}
        <div className="flex items-center justify-end gap-3 pb-4">
          <Link href={isEditMode ? `/properties/${propertyId}` : '/properties'} className="px-5 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</Link>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            {isEditMode ? 'Save Changes' : 'Save Property'}
          </button>
        </div>
      </form>
    </div>
  )
}
