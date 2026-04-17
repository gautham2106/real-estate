import { getSiteVisits, getProperties, getBuyerLeads, getBrokers } from '@/lib/dal'
import SiteVisitsClient from './SiteVisitsClient'

export default async function SiteVisitsPage() {
  const [siteVisits, properties, buyerLeads, brokers] = await Promise.all([
    getSiteVisits(),
    getProperties(),
    getBuyerLeads(),
    getBrokers(),
  ])

  return (
    <SiteVisitsClient
      siteVisits={siteVisits}
      properties={properties}
      buyerLeads={buyerLeads}
      brokers={brokers}
    />
  )
}
