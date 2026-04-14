'use client'

import { Bell, Search, User, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/properties': 'Properties & Land',
  '/seller-leads': 'Seller Leads',
  '/buyer-leads': 'Buyer Leads',
  '/site-visits': 'Site Visits',
  '/deals': 'Deals',
  '/brokers': 'Brokers',
  '/broker-portal': 'Broker Portal',
  '/documents': 'Document Storage',
  '/kanban': 'Kanban Board',
  '/books': 'Books & Files',
  '/commission': 'Commission Calculator',
  '/map': 'Public Map',
  '/alerts': 'Alerts & Reminders',
  '/broker-network': 'Broker Network Tree',
  '/reports': 'Reports',
}

interface HeaderProps {
  userEmail?: string | null
  role?: 'admin' | 'broker' | null
}

export default function Header({ userEmail, role }: HeaderProps) {
  const pathname = usePathname()
  const base = '/' + pathname.split('/')[1]
  const title = titleMap[base] ?? 'Bluesquare CRM'

  const displayName = role === 'admin' ? 'Admin' : role === 'broker' ? 'Broker' : 'User'

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="font-semibold text-slate-800 text-base">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 text-sm bg-slate-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 rounded-lg px-2 py-1 transition-colors">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-slate-800 leading-tight">{displayName}</div>
              <div className="text-xs text-slate-500 truncate max-w-[120px]">
                {userEmail ?? 'Bluesquare'}
              </div>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              title="Sign out"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
