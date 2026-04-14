'use client'

import { formatCurrency, tierIcon, statusColor } from '@/lib/utils'
import { mockBrokers } from '@/lib/mock-data'
import { Network, TrendingUp, Users } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'

interface BrokerNode {
  id: string; broker_id: string; name: string; tier_level: string
  deals_closed: number; total_commission_earned: number; status: string
  children: BrokerNode[]
}

function buildTree(): BrokerNode[] {
  const map = new Map<string, BrokerNode>()
  mockBrokers.forEach(b => {
    map.set(b.id, {
      id: b.id,
      broker_id: b.broker_id,
      name: b.name,
      tier_level: b.tier_level,
      deals_closed: b.deals_closed ?? 0,
      total_commission_earned: b.total_commission_earned ?? 0,
      status: b.status,
      children: [],
    })
  })
  const roots: BrokerNode[] = []
  mockBrokers.forEach(b => {
    const node = map.get(b.id)!
    if (!b.recruited_by_id) {
      roots.push(node)
    } else {
      const parent = map.get(b.recruited_by_id)
      if (parent) parent.children.push(node)
      else roots.push(node)
    }
  })
  return roots
}

function BrokerCard({ broker, depth = 0 }: { broker: BrokerNode; depth?: number }) {
  const tierColors: Record<string, string> = {
    Coordinator: 'border-l-purple-500',
    Elite: 'border-l-blue-500',
    Star: 'border-l-yellow-400',
    Active: 'border-l-green-400',
    Starter: 'border-l-slate-300',
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-3'} relative`}>
      {depth > 0 && (
        <div className="absolute -left-4 top-6 w-4 h-px bg-slate-300" />
      )}
      {depth > 0 && (
        <div className="absolute -left-4 -top-3 bottom-6 w-px bg-slate-200" />
      )}
      <div className={`bg-white rounded-xl border border-l-4 border-slate-200 p-4 ${tierColors[broker.tier_level] ?? 'border-l-slate-300'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base">{tierIcon(broker.tier_level)}</span>
              <span className="font-semibold text-slate-800">{broker.name}</span>
              <Badge status={broker.tier_level} />
              <Badge status={broker.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{broker.broker_id}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3 text-xs text-slate-600">
          <div>
            <p className="text-slate-400">Deals</p>
            <p className="font-bold text-slate-800 text-base">{broker.deals_closed}</p>
          </div>
          <div>
            <p className="text-slate-400">Commission</p>
            <p className="font-semibold">{formatCurrency(broker.total_commission_earned)}</p>
          </div>
          <div>
            <p className="text-slate-400">Recruits</p>
            <p className="font-bold text-slate-800 text-base">{broker.children.length}</p>
          </div>
        </div>
      </div>
      {broker.children.length > 0 && (
        <div className="relative border-l border-slate-200 ml-4 pl-0">
          {broker.children.map(child => (
            <BrokerCard key={child.id} broker={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function BrokerNetworkPage() {
  const tree = buildTree()
  const totalOverride = mockBrokers.reduce((s, b) => s + (b.override_earnings ?? 0), 0)

  const overrideRows = mockBrokers
    .filter(b => b.recruited_by_id)
    .map(b => ({
      broker: b.name,
      tier: b.tier_level,
      recruit_of: mockBrokers.find(x => x.id === b.recruited_by_id)?.name ?? '—',
      deals: b.deals_closed,
      override_pct: '0.10%',
      override_est: formatCurrency((b.total_commission_earned ?? 0) * 0.001),
    }))

  return (
    <div className="space-y-6 max-w-screen-lg">
      <PageHeader
        title="Broker Network Tree"
        subtitle="Full recruitment hierarchy with tier and override tracking"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <Users size={20} className="text-blue-600" />
          <div>
            <p className="text-xs text-slate-500">Total Brokers</p>
            <p className="text-xl font-bold text-slate-800">{mockBrokers.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <Network size={20} className="text-purple-600" />
          <div>
            <p className="text-xs text-slate-500">Recruited</p>
            <p className="text-xl font-bold text-slate-800">{mockBrokers.filter(b => b.recruited_by_id).length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <TrendingUp size={20} className="text-green-600" />
          <div>
            <p className="text-xs text-slate-500">Override Pool</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(totalOverride)}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Tree */}
        <div className="lg:col-span-3 bg-slate-50 rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
            <Network size={16} />
            Recruitment Tree
          </h3>
          <p className="text-xs text-slate-400 mb-4">Indented by recruitment level</p>
          {tree.map(root => (
            <BrokerCard key={root.id} broker={root} depth={0} />
          ))}
        </div>

        {/* Override Summary */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden self-start">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Override Commissions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tier 1 earns 0.10% on recruit&apos;s deals</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Broker', 'Recruit Of', 'Deals', 'Est. Override'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overrideRows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="text-xs font-medium text-slate-800">{r.broker}</p>
                    <Badge status={r.tier} />
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{r.recruit_of}</td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-slate-700">{r.deals}</td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-green-700">{r.override_est}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
