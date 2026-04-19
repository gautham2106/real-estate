import { getUserRole, getCurrentBrokerId } from '@/lib/auth'
import { getDeals, getProperties, getBrokers } from '@/lib/dal'
import DealsClient from './DealsClient'

export default async function DealsPage() {
  const [role, brokerId, properties, brokers] = await Promise.all([
    getUserRole(),
    getCurrentBrokerId(),
    getProperties(),
    getBrokers(),
  ])
  const isBroker = role === 'broker'
  const deals = await getDeals(isBroker && brokerId ? { brokerId } : undefined)

  const propertyMap = Object.fromEntries(properties.map((p) => [p.id, p.land_code]))
  const brokerMap = Object.fromEntries(brokers.map((b) => [b.broker_id, b.name]))

  return (
    <DealsClient
      deals={deals}
      propertyMap={propertyMap}
      brokerMap={brokerMap}
    />
  )
}
