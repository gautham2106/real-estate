import Link from 'next/link'
import { Building2, CheckCircle, TrendingUp, PlusCircle } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import { getUserRole } from '@/lib/auth'
import { getProperties } from '@/lib/dal'
import { mockProperties, mockBrokers } from '@/lib/mock-data'
import PropertiesTable from '@/components/properties/PropertiesTable'

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

export default async function PropertiesPage() {
  const [role, properties] = await Promise.all([
    getUserRole(),
    isDemoMode ? Promise.resolve(mockProperties) : getProperties(),
  ])
  const isAdmin = role === 'admin'

  const available = properties.filter(p => p.status === 'Available').length
  const negotiatingOrSold = properties.filter(p => p.status === 'Negotiating' || p.status === 'Sold').length

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title="Properties & Land"
        subtitle={`${properties.length} properties in the system`}
        action={
          <div className="flex gap-2">
            <Link href="/properties/brochure" className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              📄 Brochure
            </Link>
            {isAdmin && (
              <Link href="/properties/new" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <PlusCircle size={15} />
                Add Property
              </Link>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Properties" value={properties.length} subtitle="All listings" icon={Building2} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatCard title="Available" value={available} subtitle="Ready to sell" icon={CheckCircle} iconBg="bg-green-100" iconColor="text-green-600" />
        <StatCard title="Negotiating / Sold" value={negotiatingOrSold} subtitle="Active pipeline" icon={TrendingUp} iconBg="bg-yellow-100" iconColor="text-yellow-600" />
      </div>

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700">
          Owner contact details are visible to admins only.
        </div>
      )}

      <PropertiesTable
        properties={properties}
        isAdmin={isAdmin}
        brokerEntries={mockBrokers.map((b) => [b.broker_id, b.name])}
      />
    </div>
  )
}
