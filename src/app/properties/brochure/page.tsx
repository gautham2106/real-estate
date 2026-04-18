import { getProperties } from '@/lib/dal'
import BrochureClient from './BrochureClient'

export default async function BrochurePage() {
  const properties = await getProperties()
  const available = properties.filter(p => !['Sold', 'Cancelled'].includes(p.status))
  return <BrochureClient properties={available} />
}
