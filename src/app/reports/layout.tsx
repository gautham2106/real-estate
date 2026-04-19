import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/auth'

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  const role = await getUserRole()
  if (role !== 'admin') redirect('/broker-portal')
  return <>{children}</>
}
