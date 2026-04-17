import { notFound } from 'next/navigation'
import { getSiteVisitById, getProperties, getBuyerLeads, getBrokers } from '@/lib/dal'
import EditSiteVisitForm from './EditSiteVisitForm'

export default async function EditSiteVisitPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const [visit, properties, buyers, brokers] = await Promise.all([
    getSiteVisitById(id),
    getProperties(),
    getBuyerLeads(),
    getBrokers(),
  ])
  if (!visit) notFound()
  return <EditSiteVisitForm visit={visit} properties={properties} buyers={buyers} brokers={brokers} />
}
