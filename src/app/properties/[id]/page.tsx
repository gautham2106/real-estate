import Link from 'next/link'
import { getUserRole } from '@/lib/auth'
import {
  getPropertyById,
  getSiteVisitsByProperty,
  getDeals,
  getDocumentsByProperty,
} from '@/lib/dal'
import { mockBrokers } from '@/lib/mock-data'
import { daysUntil } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import DeleteButton from '@/components/ui/DeleteButton'
import { deletePropertyAction } from '@/app/actions/properties'
import QuickEnquiryForm from '@/components/properties/QuickEnquiryForm'
import PropertyDetailTabs from './PropertyDetailTabs'

// ─── helpers ─────────────────────────────────────────────

function getBrokerName(brokerId: string | undefined): string {
  if (!brokerId) return '—'
  return mockBrokers.find(b => b.broker_id === brokerId)?.name ?? brokerId
}

// ─── Page ──────────────────────────────────────────────────

export default async function PropertyDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const [property, visits, allDeals, docs, role] = await Promise.all([
    getPropertyById(id),
    getSiteVisitsByProperty(id),
    getDeals(),
    getDocumentsByProperty(id),
    getUserRole(),
  ])

  if (!property) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-700">Property Not Found</h2>
        <p className="text-slate-500">The property with ID &ldquo;{id}&rdquo; does not exist.</p>
        <Link href="/properties" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Back to Properties
        </Link>
      </div>
    )
  }

  const isAdmin = role === 'admin'
  const deals = allDeals.filter(d => d.property_id === id)

  const exclusivityDays = property.exclusivity_end ? daysUntil(property.exclusivity_end) : null
  const brokerName = getBrokerName(property.assigned_broker_id)

  return (
    <div className="max-w-screen-xl space-y-6">
      {/* Back + Header */}
      <div>
        <Link href="/properties" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          ← Back to Properties
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {property.land_code}
              </span>
              <Badge status={property.type} />
              <Badge status={property.status} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{property.title}</h1>
            {property.address && (
              <p className="text-sm text-slate-500">{property.address}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <QuickEnquiryForm propertyId={id} propertyTitle={property.title} />
            <Link
              href={`/properties/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Edit
            </Link>
            {isAdmin && (
              <DeleteButton
                onDelete={deletePropertyAction.bind(null, id)}
                redirectTo="/properties"
              />
            )}
          </div>
        </div>
      </div>

      {/* Tabbed content */}
      <PropertyDetailTabs
        property={property}
        visits={visits}
        deals={deals}
        docs={docs}
        role={role}
        isAdmin={isAdmin}
        brokerName={brokerName}
        exclusivityDays={exclusivityDays}
      />
    </div>
  )
}
