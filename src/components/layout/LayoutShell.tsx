'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutShellProps {
  role: 'admin' | 'broker' | null
  userEmail?: string
  children: React.ReactNode
}

export default function LayoutShell({ role, userEmail, children }: LayoutShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <>
      <Sidebar
        role={role}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="flex flex-col flex-1 min-h-screen overflow-hidden">
        <Header
          userEmail={userEmail}
          role={role}
          onMobileNavToggle={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </>
  )
}
