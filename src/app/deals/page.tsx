import { getDeals, getProperties, getBrokers } from '@/lib/dal'
import DealsClient from './DealsClient'

export default async function DealsPage() {
  const [deals, properties, brokers] = await Promise.all([
    getDeals(),
    getProperties(),
    getBrokers(),
  ])

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
