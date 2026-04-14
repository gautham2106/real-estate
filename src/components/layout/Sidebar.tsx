'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MapPin,
  UserMinus,
  UserPlus,
  Calendar,
  Handshake,
  Users,
  UserCircle,
  FolderOpen,
  Columns3,
  BookOpen,
  Calculator,
  Globe,
  Bell,
  Network,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 1 },
  { href: '/properties', label: 'Properties', icon: MapPin, module: 2 },
  { href: '/seller-leads', label: 'Seller Leads', icon: UserMinus, module: 3 },
  { href: '/buyer-leads', label: 'Buyer Leads', icon: UserPlus, module: 4 },
  { href: '/site-visits', label: 'Site Visits', icon: Calendar, module: 5 },
  { href: '/deals', label: 'Deals', icon: Handshake, module: 6 },
  { href: '/brokers', label: 'Brokers', icon: Users, module: 7 },
  { href: '/broker-portal', label: 'Broker Portal', icon: UserCircle, module: 8 },
  { href: '/documents', label: 'Documents', icon: FolderOpen, module: 9 },
  { href: '/kanban', label: 'Kanban Board', icon: Columns3, module: 10 },
  { href: '/books', label: 'Books / Files', icon: BookOpen, module: 11 },
  { href: '/commission', label: 'Commission', icon: Calculator, module: 12 },
  { href: '/map', label: 'Public Map', icon: Globe, module: 13 },
  { href: '/alerts', label: 'Alerts', icon: Bell, module: 14 },
  { href: '/broker-network', label: 'Network Tree', icon: Network, module: 15 },
  { href: '/reports', label: 'Reports', icon: BarChart3, module: 16 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-slate-900 text-white transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-slate-700', collapsed && 'justify-center px-2')}>
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">B</div>
        {!collapsed && (
          <div>
            <div className="font-bold text-sm leading-tight">Bluesquare</div>
            <div className="text-xs text-slate-400">Real Estate CRM</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-800',
                active ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-slate-300',
                collapsed && 'justify-center px-0'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center gap-2 px-4 py-3 border-t border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
      >
        {collapsed ? <ChevronRight size={16} /> : (
          <>
            <ChevronLeft size={16} />
            <span>Collapse</span>
          </>
        )}
      </button>
    </aside>
  )
}
