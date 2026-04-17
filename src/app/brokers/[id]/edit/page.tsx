import { notFound } from 'next/navigation'
import { getBrokerById, getBrokers } from '@/lib/dal'
import EditBrokerForm from './EditBrokerForm'

export default async function EditBrokerPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const [broker, allBrokers] = await Promise.all([getBrokerById(id), getBrokers()])
  if (!broker) notFound()
  return <EditBrokerForm broker={broker} allBrokers={allBrokers} />
}
