import Link from 'next/link'
import { cn, formatCurrency, tierIcon } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { getBrokers, getBuyerLeads, getSellerLeads, getDeals, getLeaderboard, getSiteVisits } from '@/lib/dal'
import { getUser } from '@/lib/auth'
import type { BrokerTier, Broker } from '@/types'
import {
  UserPlus, Home, DollarSign, TrendingUp, ShieldAlert, Trophy, ChevronRight, MapPin, AlertCircle, Activity,
} from 'lucide-react'

const tierConfig: Record<BrokerTier, { next: BrokerTier | null; dealsNeeded: number; label: string }> = {
  Starter:     { next: 'Active',      dealsNeeded: 1,  label: '1 deal to reach Active' },
  Active:      { next: 'Star',        dealsNeeded: 3,  label: '3 deals to reach Star' },
  Star:        { next: 'Elite',       dealsNeeded: 5,  label: '5 deals to reach Elite' },
  Elite:       { next: 'Coordinator', dealsNeeded: 10, label: '10 deals to reach Coordinator' },
  Coordinator: { next: null,          dealsNeeded: 0,  label: 'Top tier — Coordinator' },
}

function QuickAction({ href, icon: Icon, label, color }: { href: string; icon: React.ElementType; label: string; color: string }) {
  return (
    <Link href={href} className={cn('flex items-center gap-3 px-4 py-3 rounded-xl border font-medium text-sm transition-all hover:shadow-sm', color)}>
      <Icon size={18} />
      {label}
      <ChevronRight size={14} className="ml-auto opacity-60" />
    </Link>
  )
}

export default async function BrokerPortalPage() {
  const [user, allBrokers, allBuyerLeads, allSellerLeads, allDeals, allVisits, leaderboard] = await Promise.all([
    getUser(),
    getBrokers(),
    getBuyerLeads(),
    getSellerLeads(),
    getDeals(),
    getSiteVisits(),
    getLeaderboard(),
  ])

  // Match broker by email or user_metadata.broker_id; fallback to first (demo)
  let broker: Broker | undefined
  if (user) {
    const brokerId = (user as { user_metadata?: { broker_id?: string } }).user_metadata?.broker_id
    if (brokerId) broker = allBrokers.find(b => b.broker_id === brokerId)
    if (!broker) broker = allBrokers.find(b => b.email === user.email)
  }
  if (!broker) broker = allBrokers[0]

  if (!broker) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-3">
        <p className="text-slate-600">No broker profile found for your account.</p>
        <p className="text-slate-400 text-sm">Contact the admin to set up your broker profile.</p>
      </div>
    )
  }

  // Use broker.id (UUID) for all ownership checks — consistent with how leads/deals store broker FK
  const myBuyerLeads = allBuyerLeads.filter(l => l.added_by_broker_id === broker!.id)
  const mySellerLeads = allSellerLeads.filter(l => l.added_by_broker_id === broker!.id)
  const myDeals = allDeals.filter(d =>
    d.buyer_broker_id === broker!.id ||
    d.seller_broker_id === broker!.id ||
    d.referral_broker_id === broker!.id ||
    d.co_sponsor_broker_1_id === broker!.id ||
    d.co_sponsor_broker_2_id === broker!.id
  )
  const myVisits = allVisits.filter(v => v.broker_id === broker!.id)
  const myLeadsTotal = myBuyerLeads.length + mySellerLeads.length
  const myCommission = broker.total_commission_earned ?? 0
  const myRank = leaderboard.find(e => e.broker_id === broker!.broker_id)?.rank ?? '—'

  // Activity this month
  const thisMonth = new Date().toISOString().slice(0, 7)
  const leadsThisMonth = [...myBuyerLeads, ...mySellerLeads].filter(l => l.created_at?.startsWith(thisMonth)).length
  const visitsThisMonth = myVisits.filter(v => v.visit_date?.startsWith(thisMonth)).length
  const dealsInProgress = myDeals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.status)).length

  // Overdue follow-ups
  const today = new Date().toISOString().split('T')[0]
  const overdueLeads = [...myBuyerLeads, ...mySellerLeads].filter(l =>
    l.follow_up_date && l.follow_up_date < today && !['Closed Won', 'Closed Lost', 'Listed'].includes(l.status)
  )

  const tierInfo = tierConfig[broker.tier_level]
  const dealsDone = broker.deals_closed ?? 0
  const progressPct = tierInfo.dealsNeeded > 0 ? Math.min(100, Math.round((dealsDone / tierInfo.dealsNeeded) * 100)) : 100

  const recentBuyerLeads = [...myBuyerLeads]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6 max-w-screen-xl">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <p className="text-blue-200 text-sm mb-1">Broker Portal</p>
          <h2 className="text-2xl font-bold">Welcome back, {broker.name}!</h2>
          <p className="text-blue-200 text-sm mt-1">
            {broker.broker_id} &nbsp;·&nbsp; Joined {new Date(broker.joined_date).toLocaleDateString('en-IN')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tierIcon(broker.tier_level)}</span>
          <div className="text-right">
            <p className="text-xs text-blue-200">Current Tier</p>
            <p className="text-lg font-bold">{broker.tier_level}</p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <ShieldAlert size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Broker View — Restricted:</span> You can only see your own leads and deals.
          Owner details, other brokers&apos; data, and confidential financials are hidden. Contact admin for access.
        </p>
      </div>

      {/* Overdue Follow-ups Alert */}
      {overdueLeads.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-xl px-5 py-4">
          <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 mb-2">
              {overdueLeads.length} overdue follow-up{overdueLeads.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-1">
              {overdueLeads.slice(0, 5).map(l => {
                const name = 'name' in l ? l.name : l.owner_name
                const type = 'name' in l ? 'buyer' : 'seller'
                return (
                  <Link
                    key={l.id}
                    href={`/${type}-leads/${l.id}`}
                    className="flex items-center gap-2 text-xs text-red-700 hover:text-red-900"
                  >
                    <span className="font-mono">{l.lead_id}</span>
                    <span>{name}</span>
                    <span className="text-red-400">— due {l.follow_up_date}</span>
                  </Link>
                )
              })}
              {overdueLeads.length > 5 && (
                <p className="text-xs text-red-500">+{overdueLeads.length - 5} more</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Personal Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Leads', value: myLeadsTotal, sub: `${myBuyerLeads.length} buyer · ${mySellerLeads.length} seller`, icon: UserPlus, bg: 'bg-blue-100', ic: 'text-blue-600' },
          { label: 'Deals Closed', value: broker.deals_closed ?? 0, sub: 'All time', icon: Home, bg: 'bg-green-100', ic: 'text-green-600' },
          { label: 'Commission Earned', value: formatCurrency(myCommission), sub: 'Total paid out', icon: DollarSign, bg: 'bg-purple-100', ic: 'text-purple-600' },
          { label: 'Leaderboard Rank', value: `#${myRank}`, sub: 'Among all brokers', icon: Trophy, bg: 'bg-amber-100', ic: 'text-amber-600' },
        ].map(({ label, value, sub, icon: Icon, bg, ic }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${bg} ml-3`}>
                <Icon size={20} className={ic} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity This Month */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-700">Activity This Month</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-3xl font-bold text-blue-700">{leadsThisMonth}</p>
            <p className="text-xs text-blue-600 mt-1">Leads Added</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <p className="text-3xl font-bold text-amber-700">{visitsThisMonth}</p>
            <p className="text-xs text-amber-600 mt-1">Site Visits</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-3xl font-bold text-green-700">{dealsInProgress}</p>
            <p className="text-xs text-green-600 mt-1">Deals in Progress</p>
          </div>
        </div>
      </div>

      {/* Tier Progress + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-700">Tier Progress</h3>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{tierIcon(broker.tier_level)}</span>
            <div>
              <p className="font-bold text-slate-800">{broker.tier_level}</p>
              <p className="text-xs text-slate-500">
                {tierInfo.next ? `Next: ${tierIcon(tierInfo.next)} ${tierInfo.next}` : 'Highest tier achieved'}
              </p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{dealsDone} deals done</span>
            <span>{tierInfo.dealsNeeded > 0 ? `${tierInfo.dealsNeeded} needed` : 'Max tier'}</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-xs text-slate-500">{tierInfo.label}</p>
          <div className="mt-4 flex items-center gap-1">
            {(['Starter', 'Active', 'Star', 'Elite', 'Coordinator'] as BrokerTier[]).map((tier, i) => (
              <div key={tier} className="flex items-center gap-1">
                <div className={cn('flex flex-col items-center gap-0.5', tier === broker!.tier_level ? 'opacity-100' : 'opacity-40')}>
                  <span className="text-base">{tierIcon(tier)}</span>
                  <span className="text-[9px] text-slate-500">{tier}</span>
                </div>
                {i < 4 && <div className="w-4 h-px bg-slate-200 mb-3" />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-700">Leaderboard</h3>
          </div>
          <div className="space-y-2">
            {leaderboard.map(entry => (
              <div
                key={entry.broker_id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                  entry.broker_id === broker!.broker_id ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'
                )}
              >
                <span className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  entry.rank === 1 ? 'bg-amber-400 text-white' :
                  entry.rank === 2 ? 'bg-slate-400 text-white' :
                  entry.rank === 3 ? 'bg-orange-400 text-white' : 'bg-slate-200 text-slate-600'
                )}>
                  {entry.rank}
                </span>
                <span className="text-base shrink-0">{tierIcon(entry.tier_level)}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', entry.broker_id === broker!.broker_id ? 'text-blue-800' : 'text-slate-800')}>
                    {entry.broker_name}
                    {entry.broker_id === broker!.broker_id && <span className="ml-1 text-[10px] text-blue-600">(You)</span>}
                  </p>
                  <p className="text-xs text-slate-400">{entry.deals_closed} deals</p>
                </div>
                <span className="text-xs font-semibold text-green-700 shrink-0">{formatCurrency(entry.commission_earned)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Recent Buyer Leads */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">My Recent Buyer Leads</h3>
          <Link href="/buyer-leads" className="text-xs text-blue-600 hover:underline">View all</Link>
        </div>
        {recentBuyerLeads.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">No buyer leads yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Lead ID', 'Name', 'Budget', 'Source', 'Status', 'Follow-up'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBuyerLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">
                      <Link href={`/buyer-leads/${lead.id}`} className="hover:underline">{lead.lead_id}</Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{lead.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {lead.budget_min && lead.budget_max
                        ? `${formatCurrency(lead.budget_min)} – ${formatCurrency(lead.budget_max)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{lead.source ?? '—'}</td>
                    <td className="px-4 py-3"><Badge status={lead.status} /></td>
                    <td className="px-4 py-3 text-xs">
                      {lead.follow_up_date ? (
                        <span className={lead.follow_up_date < today ? 'text-red-600 font-semibold' : 'text-slate-500'}>
                          {lead.follow_up_date < today ? '⚠ ' : ''}{lead.follow_up_date}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* My Deals */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">My Deals</h3>
          <Link href="/deals" className="text-xs text-blue-600 hover:underline">View all</Link>
        </div>
        {myDeals.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">No deals yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Deal ID', 'Title', 'Deal Value', 'My Payout', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myDeals.map(deal => {
                  const isBuyer = deal.buyer_broker_id === broker!.id
                  const payout = isBuyer ? (deal.buyer_broker_payout ?? 0) : (deal.seller_broker_payout ?? 0)
                  return (
                    <tr key={deal.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-blue-700">{deal.deal_id}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{deal.deal_title}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(deal.deal_value)}</td>
                      <td className="px-4 py-3 text-green-700 font-semibold">{formatCurrency(payout)}</td>
                      <td className="px-4 py-3"><Badge status={deal.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction href="/buyer-leads/new" icon={UserPlus} label="Add Buyer Lead" color="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100" />
          <QuickAction href="/seller-leads/new" icon={Home} label="Add Seller Lead" color="border-green-200 bg-green-50 text-green-700 hover:bg-green-100" />
          <QuickAction href="/site-visits/new" icon={MapPin} label="Log Site Visit" color="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" />
          <QuickAction href="/commission" icon={DollarSign} label="Commission Calculator" color="border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100" />
        </div>
      </div>
    </div>
  )
}
