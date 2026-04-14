import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
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
        <Sidebar role={role} />
        <div className="flex flex-col flex-1 min-h-screen overflow-hidden">
          <Header userEmail={user?.email} role={role} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
