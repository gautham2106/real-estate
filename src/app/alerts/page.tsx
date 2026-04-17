import { getAlerts } from '@/lib/dal'
import AlertsClient from './AlertsClient'

export default async function AlertsPage() {
  // Fetch all alerts (including done) so client can toggle visibility
  const alerts = await getAlerts(true)
  return <AlertsClient initialAlerts={alerts} />
}
