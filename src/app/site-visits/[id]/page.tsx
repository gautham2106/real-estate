import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Building2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import DeleteButton from '@/components/ui/DeleteButton'
import { getSiteVisitById, getPropertyById, getBuyerLeadById, getBrokerById } from '@/lib/dal'
import { getUserRole } from '@/lib/auth'
import { deleteSiteVisitAction } from '@/app/actions/site-visits'
import { formatCurrency } from '@/lib/utils'

const reactionColors: Record<string, string> = {
  Interested: 'text-green-700 bg-green-50 border-green-200',
  Negotiating: 'text-amber-700 bg-amber-50 border-amber-200',
  'Need Time': 'text-blue-700 bg-blue-50 border-blue-200',
  'Not Interested': 'text-red-700 bg-red-50 border-red-200',
}

export default async function SiteVisitDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const [visit, role] = await Promise.all([getSiteVisitById(id), getUserRole()])
  if (!visit) notFound()

  const [property, buyer, broker] = await Promise.all([
    getPropertyById(visit.property_id),
    getBuyerLeadById(visit.buyer_id),
    visit.broker_id ? getBrokerById(visit.broker_id) : Promise.resolve(null),
  ])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/site-visits" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft size={14} /> Back to Site Visits
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-blue-600 font-semibold">{visit.visit_id}</span>
              {visit.outcome && <Badge status={visit.outcome} />}
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              {property?.title ?? 'Site Visit'} × {buyer?.name ?? 'Buyer'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Calendar size={13} />
              {visit.visit_date.split('T')[0]}{visit.visit_time ? ` at ${visit.visit_time}` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/site-visits/${id}/edit`} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Edit
            </Link>
            <DeleteButton onDelete={deleteSiteVisitAction.bind(null, id)} redirectTo="/site-visits" />
          </div>
        </div>
      </div>

      {visit.buyer_reaction && (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${reactionColors[visit.buyer_reaction] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>
          Buyer Reaction: <strong>{visit.buyer_reaction}</strong>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Property */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <Building2 size={15} className="text-blue-600" /> Property
          </div>
          {property ? (
            <div className="space-y-1 text-sm">
              <Link href={`/properties/${property.id}`} className="font-semibold text-blue-700 hover:underline">
                {property.land_code} — {property.title}
              </Link>
              <p className="text-slate-500">{property.area} {property.area_unit} · {property.type}</p>
              <p className="text-slate-500">{property.address}</p>
            </div>
          ) : <p className="text-sm text-slate-400">Property not found</p>}
        </div>

        {/* Buyer */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <User size={15} className="text-purple-600" /> Buyer
          </div>
          {buyer ? (
            <div className="space-y-1 text-sm">
              <Link href={`/buyer-leads/${buyer.id}`} className="font-semibold text-blue-700 hover:underline">{buyer.name}</Link>
              <p className="text-slate-500">{buyer.phone}</p>
              {buyer.preferred_location && <p className="text-slate-500">📍 {buyer.preferred_location}</p>}
            </div>
          ) : <p className="text-sm text-slate-400">Buyer not found</p>}
        </div>
      </div>

      {/* Visit Notes */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="font-semibold text-sm text-slate-700">Visit Details</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {broker && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Broker</p>
              <Link href={`/brokers/${broker.id}`} className="font-medium text-blue-700 hover:underline">{broker.name}</Link>
            </div>
          )}
          {visit.price_discussed && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Price Discussed</p>
              <p className="font-semibold text-slate-800">{formatCurrency(visit.price_discussed)}</p>
            </div>
          )}
          {visit.next_action && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Next Action</p>
              <p className="font-medium text-slate-700">{visit.next_action}</p>
              {visit.next_action_date && <p className="text-xs text-slate-400 mt-0.5">by {visit.next_action_date}</p>}
            </div>
          )}
        </div>

        {[
          { label: 'Buyer Remarks', value: visit.buyer_remarks },
          { label: 'Owner Remarks', value: visit.owner_remarks },
          { label: 'Objections', value: visit.objections },
          { label: 'Internal Note', value: visit.internal_note },
        ].filter(r => r.value).map(r => (
          <div key={r.label}>
            <p className="text-xs text-slate-400 mb-1">{r.label}</p>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
