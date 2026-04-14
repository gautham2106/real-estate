import { getUserRole } from '@/lib/auth'
import NewPropertyForm from './NewPropertyForm'

export default async function NewPropertyPage() {
  const role = await getUserRole()
  return <NewPropertyForm isAdmin={role === 'admin'} />
}
