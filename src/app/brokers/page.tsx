import { getBrokers } from '@/lib/dal'
import BrokersClient from './BrokersClient'

export default async function BrokersPage() {
  const brokers = await getBrokers()
  return <BrokersClient brokers={brokers} />
}
