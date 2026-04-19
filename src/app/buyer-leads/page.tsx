import { getUserRole, getCurrentBrokerId } from '@/lib/auth'
import { getBuyerLeads } from '@/lib/dal'
import BuyerLeadsClient from './BuyerLeadsClient'

export default async function BuyerLeadsPage() {
  const [role, brokerId] = await Promise.all([getUserRole(), getCurrentBrokerId()])
  const isBroker = role === 'broker'
  const leads = await getBuyerLeads(isBroker && brokerId ? { brokerId } : undefined)
  return <BuyerLeadsClient leads={leads} total={leads.length} isBroker={isBroker} />
}
