import { notFound } from 'next/navigation'
import { getDealById, getProperties, getBuyerLeads, getSellerLeads, getBrokers } from '@/lib/dal'
import EditDealForm from './EditDealForm'

export default async function EditDealPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const [deal, properties, buyers, sellers, brokers] = await Promise.all([
    getDealById(id),
    getProperties(),
    getBuyerLeads(),
    getSellerLeads(),
    getBrokers(),
  ])
  if (!deal) notFound()
  return <EditDealForm deal={deal} properties={properties} buyers={buyers} sellers={sellers} brokers={brokers} />
}
