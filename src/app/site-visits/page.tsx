import { getUserRole, getCurrentBrokerId } from '@/lib/auth'
import { getSiteVisits, getProperties, getBuyerLeads, getBrokers } from '@/lib/dal'
import SiteVisitsClient from './SiteVisitsClient'

export default async function SiteVisitsPage() {
  const [role, brokerId, properties, buyerLeads, brokers] = await Promise.all([
    getUserRole(),
    getCurrentBrokerId(),
    getProperties(),
    getBuyerLeads(),
    getBrokers(),
  ])
  const isBroker = role === 'broker'
  const siteVisits = await getSiteVisits(isBroker && brokerId ? { brokerId } : undefined)

  return (
    <SiteVisitsClient
      siteVisits={siteVisits}
      properties={properties}
      buyerLeads={buyerLeads}
      brokers={brokers}
    />
  )
}
