import { getUserRole, getCurrentBrokerId } from '@/lib/auth'
import { getSellerLeads } from '@/lib/dal'
import SellerLeadsClient from './SellerLeadsClient'

export default async function SellerLeadsPage() {
  const [role, brokerId] = await Promise.all([getUserRole(), getCurrentBrokerId()])
  const isBroker = role === 'broker'
  const leads = await getSellerLeads(isBroker && brokerId ? { brokerId } : undefined)
  return <SellerLeadsClient leads={leads} total={leads.length} isBroker={isBroker} />
}
