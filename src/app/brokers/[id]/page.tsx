import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, MapPin, Star, Handshake, TrendingUp } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import DeleteButton from '@/components/ui/DeleteButton'
import { getBrokerById, getBrokers } from '@/lib/dal'
import { getUserRole } from '@/lib/auth'
import { deleteBrokerAction } from '@/app/actions/brokers'
import { formatCurrency, formatDate } from '@/lib/utils'

const TIER_COLORS: Record<string, string> = {
  Elite: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Star: 'bg-purple-100 text-purple-800 border-purple-300',
  Active: 'bg-green-100 text-green-800 border-green-300',
  Starter: 'bg-slate-100 text-slate-700 border-slate-300',
  Coordinator: 'bg-blue-100 text-blue-800 border-blue-300',
}

export default async function BrokerDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const [broker, allBrokers, role] = await Promise.all([
    getBrokerById(id),
    getBrokers(),
    getUserRole(),
  ])
  if (!broker) notFound()

  const isAdmin = role === 'admin'
  const recruiter = broker.recruited_by_id ? allBrokers.find(b => b.id === broker.recruited_by_id) : null
  const recruited = allBrokers.filter(b => b.recruited_by_id === id)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/brokers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft size={14} /> Back to Brokers
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
              {broker.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-800">{broker.name}</h1>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TIER_COLORS[broker.tier_level] ?? 'bg-slate-100 text-slate-600'}`}>
                  {broker.tier_level}
                </span>
                <Badge status={broker.status} />
              </div>
              <p className="text-sm text-slate-500 mt-0.5 font-mono">{broker.broker_id}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href={`/brokers/${id}/edit`} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Edit
            </Link>
            {isAdmin && (
              <DeleteButton onDelete={deleteBrokerAction.bind(null, id)} redirectTo="/brokers" label="Delete Broker" />
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Deals Closed', value: broker.deals_closed ?? 0, icon: Handshake },
          { label: 'Commission Earned', value: formatCurrency(broker.total_commission_earned ?? 0), icon: TrendingUp },
          { label: 'Active Leads', value: broker.active_leads_count ?? 0, icon: Star },
          { label: 'Brokers Recruited', value: recruited.length, icon: Star },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className="text-lg font-bold text-slate-800">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Contact */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-semibold text-sm text-slate-700">Contact</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Phone size={14} className="text-slate-400" />
              <a href={`tel:${broker.phone}`} className="hover:text-blue-600">{broker.phone}</a>
            </div>
            {broker.whatsapp && (
              <div className="flex items-center gap-2 text-slate-600">
                <span className="text-slate-400 text-xs">WA</span>
                <a href={`https://wa.me/91${broker.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600">{broker.whatsapp}</a>
              </div>
            )}
            {broker.email && (
              <div className="flex items-center gap-2 text-slate-600">
                <Mail size={14} className="text-slate-400" />
                <a href={`mailto:${broker.email}`} className="hover:text-blue-600">{broker.email}</a>
              </div>
            )}
            {broker.area_coverage && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin size={14} className="text-slate-400" />
                {broker.area_coverage}
              </div>
            )}
          </div>
        </div>

        {/* Network */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-semibold text-sm text-slate-700">Network</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Recruited By</span>
              <span className="font-medium text-slate-700">
                {recruiter ? (
                  <Link href={`/brokers/${recruiter.id}`} className="text-blue-600 hover:underline">{recruiter.name}</Link>
                ) : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Joined</span>
              <span className="font-medium text-slate-700">{broker.joined_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Login Active</span>
              <span className={broker.login_active ? 'text-green-600 font-medium' : 'text-slate-400'}>
                {broker.login_active ? 'Yes' : 'No'}
              </span>
            </div>
            {broker.last_login && (
              <div className="flex justify-between">
                <span className="text-slate-500">Last Login</span>
                <span className="font-medium text-slate-700">{formatDate(broker.last_login)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment */}
        {isAdmin && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-semibold text-sm text-slate-700">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Account</span>
                <span className="font-medium text-slate-700 font-mono">{broker.bank_account ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UPI ID</span>
                <span className="font-medium text-slate-700">{broker.upi_id ?? '—'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Recruited Brokers */}
        {recruited.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-semibold text-sm text-slate-700">Brokers Recruited ({recruited.length})</h3>
            <div className="space-y-1.5">
              {recruited.map(b => (
                <Link key={b.id} href={`/brokers/${b.id}`} className="flex items-center justify-between py-1.5 hover:bg-slate-50 rounded-lg px-1 -mx-1 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">{b.name.charAt(0)}</div>
                    <span className="text-sm font-medium text-slate-700">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${TIER_COLORS[b.tier_level] ?? ''}`}>{b.tier_level}</span>
                    <Badge status={b.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {broker.notes && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-2">Notes</h3>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{broker.notes}</p>
        </div>
      )}
    </div>
  )
}
