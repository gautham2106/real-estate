import { getBrokers, getBuyerLeads, getProperties } from '@/lib/dal'
import NewSiteVisitForm from './NewSiteVisitForm'

export default async function NewSiteVisitPage(props: {
  searchParams: Promise<{ buyer_id?: string; property_id?: string }>
}) {
  const params = await props.searchParams
  const [brokers, buyerLeads, properties] = await Promise.all([
    getBrokers(),
    getBuyerLeads(),
    getProperties(),
  ])

  // Pre-select broker if coming from a buyer lead page
  const defaultBuyer = params.buyer_id ? buyerLeads.find(l => l.id === params.buyer_id) : undefined
  const defaultBrokerId = defaultBuyer?.added_by_broker_id ?? ''

  return (
    <NewSiteVisitForm
      brokers={brokers}
      buyerLeads={buyerLeads}
      properties={properties}
      initialBuyerId={params.buyer_id}
      initialPropertyId={params.property_id}
      initialBrokerId={defaultBrokerId}
    />
  )
}
