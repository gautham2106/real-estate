import { getUserRole, getCurrentBrokerId } from '@/lib/auth'
import { getDeals, getProperties, getBrokers, getBuyerLeads } from '@/lib/dal'
import KanbanClient from './KanbanClient'
import type { Deal, DealStatus } from '@/types'

// Spread deals across pipeline stages for a richer demo when there is only one deal in mock data
function spreadDealsAcrossStages(deals: Deal[]): Deal[] {
  if (deals.length >= 5) return deals

  const stages: DealStatus[] = [
    'Created', 'Site Visit Done', 'Negotiation Active', 'Token Paid',
    'MOU Signed', 'Documents Verified', 'Loan Processing',
    'Registration Scheduled', 'Registration Done', 'Closed Won', 'Closed Lost',
  ]
  const base = deals[0]
  if (!base) return deals

  return stages.map((status, i) => ({
    ...base,
    id: String(i + 1),
    deal_id: `DEAL-${String(i + 1).padStart(3, '0')}`,
    status,
    deal_value: [1750000, 2200000, 4500000, 3200000, 5800000, 1200000, 2900000, 3600000, 4100000, 1800000, 2700000][i] ?? base.deal_value,
    created_at: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }))
}

export default async function KanbanPage() {
  const [role, brokerId, properties, brokers, buyerLeads] = await Promise.all([
    getUserRole(),
    getCurrentBrokerId(),
    getProperties(),
    getBrokers(),
    getBuyerLeads(),
  ])
  const isBroker = role === 'broker'
  const deals = await getDeals(isBroker && brokerId ? { brokerId } : undefined)

  const initialDeals = spreadDealsAcrossStages(deals)
  const propertyMap = Object.fromEntries(properties.map((p) => [p.id, { land_code: p.land_code }]))
  const brokerMap = Object.fromEntries(brokers.map((b) => [b.broker_id, b.name]))
  const buyerMap = Object.fromEntries(buyerLeads.map((l) => [l.id, l.name]))
  const brokerOptions = brokers.map((b) => ({ broker_id: b.broker_id, name: b.name }))

  return (
    <KanbanClient
      initialDeals={initialDeals}
      propertyMap={propertyMap}
      brokerMap={brokerMap}
      buyerMap={buyerMap}
      brokerOptions={brokerOptions}
    />
  )
}
