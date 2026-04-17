import type { Metadata } from 'next'
import './globals.css'
import LayoutShell from '@/components/layout/LayoutShell'
import { getUser, getUserRole } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Bluesquare Real Estate CRM',
  description: 'Real Estate CRM for Bluesquare — Properties, Leads, Deals & Broker Management',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, role] = await Promise.all([getUser(), getUserRole()])

  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex bg-slate-50 text-slate-900">
        <LayoutShell role={role} userEmail={user?.email}>
          {children}
        </LayoutShell>
      </body>
    </html>
  )
}
