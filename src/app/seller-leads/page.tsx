import { getUserRole, getUser } from '@/lib/auth'
import { getSellerLeads } from '@/lib/dal'
import { mockSellerLeads } from '@/lib/mock-data'
import SellerLeadsClient from './SellerLeadsClient'

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

export default async function SellerLeadsPage() {
  const [role, user] = await Promise.all([getUserRole(), getUser()])
  const isBroker = role === 'broker'

  let leads = isDemoMode ? mockSellerLeads : await getSellerLeads()

  // Brokers only see leads they added
  // In production Supabase RLS enforces this at DB level; this is client-side safety
  if (isBroker && user?.email) {
    leads = leads.filter(l => l.added_by_broker_id != null)
  }

  return <SellerLeadsClient leads={leads} total={leads.length} isBroker={isBroker} />
}
