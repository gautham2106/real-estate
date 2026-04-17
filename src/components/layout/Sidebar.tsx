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
  X,
} from 'lucide-react'
import { useState } from 'react'

const ALL_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'broker'] },
  { href: '/properties', label: 'Properties', icon: MapPin, roles: ['admin', 'broker'] },
  { href: '/seller-leads', label: 'Seller Leads', icon: UserMinus, roles: ['admin', 'broker'] },
  { href: '/buyer-leads', label: 'Buyer Leads', icon: UserPlus, roles: ['admin', 'broker'] },
  { href: '/site-visits', label: 'Site Visits', icon: Calendar, roles: ['admin', 'broker'] },
  { href: '/deals', label: 'Deals', icon: Handshake, roles: ['admin', 'broker'] },
  { href: '/brokers', label: 'Brokers', icon: Users, roles: ['admin'] },
  { href: '/broker-portal', label: 'Broker Portal', icon: UserCircle, roles: ['admin', 'broker'] },
  { href: '/documents', label: 'Documents', icon: FolderOpen, roles: ['admin'] },
  { href: '/kanban', label: 'Kanban Board', icon: Columns3, roles: ['admin', 'broker'] },
  { href: '/books', label: 'Books / Files', icon: BookOpen, roles: ['admin'] },
  { href: '/commission', label: 'Commission', icon: Calculator, roles: ['admin', 'broker'] },
  { href: '/map', label: 'Public Map', icon: Globe, roles: ['admin', 'broker'] },
  { href: '/alerts', label: 'Alerts', icon: Bell, roles: ['admin', 'broker'] },
  { href: '/broker-network', label: 'Network Tree', icon: Network, roles: ['admin'] },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin'] },
]

interface SidebarProps {
  role?: 'admin' | 'broker' | null
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ role = 'admin', mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const navItems = ALL_NAV.filter(item => item.roles.includes(role ?? 'admin'))

  const sidebarContent = (
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
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm leading-tight">Bluesquare</div>
            <div className="text-xs text-slate-400">Real Estate CRM</div>
          </div>
        )}
        {/* Close button — only on mobile */}
        {!collapsed && onClose && (
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
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
              onClick={onClose}
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

  return (
    <>
      {/* Desktop: always visible in normal flow */}
      <div className="hidden lg:flex">
        {sidebarContent}
      </div>

      {/* Mobile: fixed overlay drawer */}
      <div className="lg:hidden">
        {/* Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
        )}

        {/* Drawer */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  )
}
