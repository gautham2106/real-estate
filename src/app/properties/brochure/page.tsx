import { getProperties } from '@/lib/dal'
import { mockProperties } from '@/lib/mock-data'
import BrochureClient from './BrochureClient'

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

export default async function BrochurePage() {
  const all = isDemoMode ? mockProperties : await getProperties()
  const available = all.filter(p => !['Sold', 'Cancelled'].includes(p.status))
  return <BrochureClient properties={available} />
}
