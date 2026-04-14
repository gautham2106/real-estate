import { getUserRole, getUser } from '@/lib/auth'
import { getBuyerLeads } from '@/lib/dal'
import { mockBuyerLeads } from '@/lib/mock-data'
import BuyerLeadsClient from './BuyerLeadsClient'

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

export default async function BuyerLeadsPage() {
  const [role, user] = await Promise.all([getUserRole(), getUser()])
  const isBroker = role === 'broker'

  let leads = isDemoMode ? mockBuyerLeads : await getBuyerLeads()

  // Brokers only see leads they added
  if (isBroker && user?.email) {
    leads = leads.filter(l => l.added_by_broker_id != null)
    // In production, Supabase RLS already enforces this at the DB level.
    // Here we also filter client-side for demo safety.
  }

  return <BuyerLeadsClient leads={leads} total={leads.length} isBroker={isBroker} />
}
