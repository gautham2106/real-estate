import {
  Building2, Users, Handshake, IndianRupee, TrendingUp,
  UserPlus, Bell, Clock, AlertTriangle, Activity,
  Trophy, Crown,
} from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import { formatCurrency, tierIcon, activityIcon } from '@/lib/utils'
import { getDashboardMetrics, getLeaderboard, getRecentActivity } from '@/lib/dal'

export default async function DashboardPage() {
  const [m, leaderboard, recentActivity] = await Promise.all([
    getDashboardMetrics(),
    getLeaderboard(),
    getRecentActivity(),
  ])

  return (
    <div className="space-y-6 max-w-screen-xl">

      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Good morning, Admin 👋</h2>
        <p className="text-sm text-slate-500 mt-0.5">Here&apos;s what&apos;s happening at Bluesquare today.</p>
      </div>

      {/* Metric Cards — Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Listings"
          value={m.total_active_listings}
          subtitle="Properties on market"
          icon={Building2}
          iconBg="bg-blue-100" iconColor="text-blue-600"
          href="/properties"
          trend={{ value: 12, label: 'vs last month' }}
        />
        <StatCard
          title="Total Leads"
          value={m.total_leads}
          subtitle="Buy + Sell combined"
          icon={Users}
          iconBg="bg-purple-100" iconColor="text-purple-600"
          href="/buyer-leads"
          trend={{ value: 8, label: 'vs last month' }}
        />
        <StatCard
          title="Deals in Pipeline"
          value={m.deals_in_pipeline}
          subtitle="Active deal stages"
          icon={Handshake}
          iconBg="bg-green-100" iconColor="text-green-600"
          href="/deals"
          trend={{ value: 5, label: 'vs last month' }}
        />
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(m.revenue_this_month)}
          subtitle="Total deal value closed"
          icon={IndianRupee}
          iconBg="bg-emerald-100" iconColor="text-emerald-600"
          href="/reports"
          trend={{ value: 22, label: 'vs last month' }}
        />
      </div>

      {/* Metric Cards — Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Your Net This Month"
          value={formatCurrency(m.your_net_this_month)}
          subtitle="After broker payouts"
          icon={TrendingUp}
          iconBg="bg-indigo-100" iconColor="text-indigo-600"
          href="/commission"
        />
        <StatCard
          title="New Leads Today"
          value={m.new_leads_today}
          subtitle="Added in last 24 hrs"
          icon={UserPlus}
          iconBg="bg-cyan-100" iconColor="text-cyan-600"
          href="/buyer-leads"
        />
        <StatCard
          title="Follow-Ups Today"
          value={m.follow_ups_today}
          subtitle="Due right now"
          icon={Clock}
          iconBg="bg-yellow-100" iconColor="text-yellow-600"
          href="/alerts"
          alert={m.follow_ups_today > 5}
        />
        <StatCard
          title="Expiring Exclusivity"
          value={m.expiring_exclusivity}
          subtitle="Within 30 days"
          icon={AlertTriangle}
          iconBg="bg-red-100" iconColor="text-red-600"
          href="/properties"
          alert={m.expiring_exclusivity > 0}
        />
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

      {/* Quick Links */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '+ Add Property', href: '/properties', color: 'bg-blue-600 text-white hover:bg-blue-700' },
            { label: '+ Add Buyer Lead', href: '/buyer-leads', color: 'bg-purple-600 text-white hover:bg-purple-700' },
            { label: '+ Add Seller Lead', href: '/seller-leads', color: 'bg-indigo-600 text-white hover:bg-indigo-700' },
            { label: '+ New Deal', href: '/deals', color: 'bg-green-600 text-white hover:bg-green-700' },
            { label: 'Commission Calc', href: '/commission', color: 'bg-orange-500 text-white hover:bg-orange-600' },
            { label: 'View Kanban', href: '/kanban', color: 'bg-slate-700 text-white hover:bg-slate-800' },
            { label: 'View Reports', href: '/reports', color: 'bg-teal-600 text-white hover:bg-teal-700' },
          ].map((a) => (
            <a
              key={a.href}
              href={a.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${a.color}`}
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
