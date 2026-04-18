'use client'

import { Bell, Search, User, LogOut, Menu } from 'lucide-react'
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
  '/search': 'Search',
  '/calendar': 'Calendar',
}

interface HeaderProps {
  userEmail?: string | null
  role?: 'admin' | 'broker' | null
  onMobileNavToggle?: () => void
}

export default function Header({ userEmail, role, onMobileNavToggle }: HeaderProps) {
  const pathname = usePathname()
  const base = '/' + pathname.split('/')[1]
  const title = titleMap[base] ?? 'Bluesquare CRM'

  const displayName = role === 'admin' ? 'Admin' : role === 'broker' ? 'Broker' : 'User'

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        {onMobileNavToggle && (
          <button
            onClick={onMobileNavToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
        )}
        <h1 className="font-semibold text-slate-800 text-base">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <form method="get" action="/search" className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            name="q"
            placeholder="Search leads, properties…"
            className="pl-9 pr-4 py-1.5 text-sm bg-slate-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
          />
        </form>
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 rounded-lg px-2 py-1 transition-colors">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="text-sm hidden sm:block">
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
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
