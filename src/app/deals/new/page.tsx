import { getBrokers, getBuyerLeads, getSellerLeads, getProperties } from '@/lib/dal'
import NewDealForm from './NewDealForm'

export default async function NewDealPage(props: {
  searchParams: Promise<{ buyer_id?: string }>
}) {
  const { buyer_id } = await props.searchParams
  const [brokers, buyerLeads, sellerLeads, properties] = await Promise.all([
    getBrokers(),
    getBuyerLeads(),
    getSellerLeads(),
    getProperties(),
  ])

  // If coming from a buyer lead page, pre-select that lead's broker too
  const defaultBuyer = buyer_id ? buyerLeads.find(l => l.id === buyer_id) : undefined
  const defaultBuyerBrokerId = defaultBuyer?.added_by_broker_id ?? ''

  return (
    <NewDealForm
      brokers={brokers}
      buyerLeads={buyerLeads}
      sellerLeads={sellerLeads}
      properties={properties}
      defaultBuyerId={buyer_id}
      defaultBuyerBrokerId={defaultBuyerBrokerId}
    />
  )
}
