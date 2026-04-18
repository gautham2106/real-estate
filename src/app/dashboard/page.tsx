import {
  Building2, Users, Handshake, IndianRupee,
  Clock, Activity,
  Trophy, Crown,
} from 'lucide-react'
import Link from 'next/link'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import FollowUpsPanel from '@/components/dashboard/FollowUpsPanel'
import { formatCurrency, tierIcon, activityIcon } from '@/lib/utils'
import { getDashboardMetrics, getLeaderboard, getRecentActivity, getFollowUpsToday } from '@/lib/dal'

export default async function DashboardPage() {
  const [m, leaderboard, recentActivity, followUps] = await Promise.all([
    getDashboardMetrics(),
    getLeaderboard(),
    getRecentActivity(),
    getFollowUpsToday(),
  ])

  // Build greeting subtitle
  const urgentParts: string[] = []
  if (m.follow_ups_today > 0) urgentParts.push(`${m.follow_ups_today} follow-up${m.follow_ups_today !== 1 ? 's' : ''} due`)
  if (m.expiring_exclusivity > 0) urgentParts.push(`${m.expiring_exclusivity} exclusivity alert${m.expiring_exclusivity !== 1 ? 's' : ''}`)
  const greetingSubtitle = urgentParts.length > 0
    ? urgentParts.join(' · ')
    : 'All clear today — no urgent alerts'

  return (
    <div className="space-y-6 max-w-screen-xl">

      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Good morning, Admin 👋</h2>
        <p className="text-sm text-slate-500 mt-0.5">{greetingSubtitle}</p>
      </div>

      {/* Secondary metrics — thin strip, no chrome, above main KPIs */}
      <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
        <span>Your Net: <span className="font-semibold text-slate-700">{formatCurrency(m.your_net_this_month)}</span></span>
        <span className="text-slate-300">|</span>
        <span>New Leads: <span className="font-semibold text-slate-700">{m.new_leads_today}</span></span>
        <span className="text-slate-300">|</span>
        <span>Follow-Ups: <span className={`font-semibold ${m.follow_ups_today > 5 ? 'text-orange-600' : 'text-slate-700'}`}>{m.follow_ups_today}</span></span>
        <span className="text-slate-300">|</span>
        <span>Expiring: <span className={`font-semibold ${m.expiring_exclusivity > 0 ? 'text-orange-600' : 'text-slate-700'}`}>{m.expiring_exclusivity}</span></span>
      </div>

      {/* Primary 4 KPI cards — horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 -mx-4 px-4 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:mx-0 md:px-0">
        <div className="snap-start shrink-0 w-52 md:w-auto">
          <StatCard
            title="Active Listings"
            value={m.total_active_listings}
            subtitle="Properties on market"
            icon={Building2}
            iconBg="bg-blue-100" iconColor="text-blue-600"
            href="/properties"
          />
        </div>
        <div className="snap-start shrink-0 w-52 md:w-auto">
          <StatCard
            title="Total Leads"
            value={m.total_leads}
            subtitle="Buy + Sell combined"
            icon={Users}
            iconBg="bg-purple-100" iconColor="text-purple-600"
            href="/buyer-leads"
          />
        </div>
        <div className="snap-start shrink-0 w-52 md:w-auto">
          <StatCard
            title="Deals in Pipeline"
            value={m.deals_in_pipeline}
            subtitle="Active deal stages"
            icon={Handshake}
            iconBg="bg-green-100" iconColor="text-green-600"
            href="/deals"
          />
        </div>
        <div className="snap-start shrink-0 w-52 md:w-auto">
          <StatCard
            title="Revenue This Month"
            value={formatCurrency(m.revenue_this_month)}
            subtitle="Total deal value closed"
            icon={IndianRupee}
            iconBg="bg-emerald-100" iconColor="text-emerald-600"
            href="/reports"
          />
        </div>
      </div>

      {/* Follow-Ups Today panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Clock size={17} className="text-blue-500" />
            <h3 className="font-semibold text-slate-800">Follow-Ups Due Today</h3>
            {followUps.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {followUps.length}
              </span>
            )}
          </div>
          <Link href="/alerts" className="text-xs text-blue-600 hover:underline font-medium">
            All alerts →
          </Link>
        </div>
        <p className="text-xs text-slate-400 mb-4">Call, reschedule, or mark done directly from here</p>
        <FollowUpsPanel items={followUps} />
      </div>

      {/* Bottom section: Leaderboard + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Broker Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-yellow-500" />
            <h3 className="font-semibold text-slate-800">Broker Leaderboard</h3>
            <span className="ml-auto text-xs text-slate-400">This month</span>
          </div>
          <div className="space-y-2">
            {leaderboard.map((b) => (
              <div key={b.broker_id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  b.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                  b.rank === 2 ? 'bg-slate-100 text-slate-600' :
                  b.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'
                }`}>
                  {b.rank === 1 ? <Crown size={14} /> : b.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-slate-800 truncate">{b.broker_name}</p>
                    <span className="text-xs">{tierIcon(b.tier_level)}</span>
                  </div>
                  <p className="text-xs text-slate-500">{b.deals_closed} deals · {formatCurrency(b.commission_earned)}</p>
                </div>
                <Badge status={b.tier_level} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-blue-500" />
            <h3 className="font-semibold text-slate-800">Recent Activity</h3>
            <span className="ml-auto text-xs text-slate-400">Live feed</span>
          </div>
          <div className="space-y-1">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-lg shrink-0 mt-0.5">{activityIcon(item.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 leading-snug">{item.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{item.user}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{item.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions — 3 role-appropriate links for admin */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-3">Quick Actions</h3>
        <div className="flex gap-2">
          <Link
            href="/properties/new"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Property
          </Link>
          <Link
            href="/deals/new"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
          >
            New Deal
          </Link>
          <Link
            href="/commission"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-orange-500 text-white hover:bg-orange-600"
          >
            Commission Calc
          </Link>
        </div>
      </div>
    </div>
  )
}
