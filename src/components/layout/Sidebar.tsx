'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, MapPin, UserMinus, UserPlus, Calendar,
  Handshake, Users, UserCircle, FolderOpen, Columns3,
  BookOpen, Calculator, Globe, Bell, Network, BarChart3,
  ChevronLeft, ChevronRight, X, Search,
} from 'lucide-react'
import { useState } from 'react'

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  roles: string[]
}

type NavGroup = {
  label: string
  roles: string[]       // group visible if user has any of these roles
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    roles: ['admin', 'broker'],
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'broker'] },
      { href: '/search',    label: 'Search',    icon: Search,          roles: ['admin', 'broker'] },
      { href: '/calendar',  label: 'Calendar',  icon: Calendar,        roles: ['admin', 'broker'] },
      { href: '/alerts',    label: 'Alerts',    icon: Bell,            roles: ['admin', 'broker'] },
      { href: '/kanban',    label: 'Pipeline',  icon: Columns3,        roles: ['admin', 'broker'] },
    ],
  },
  {
    label: 'Leads',
    roles: ['admin', 'broker'],
    items: [
      { href: '/seller-leads', label: 'Seller Leads', icon: UserMinus, roles: ['admin', 'broker'] },
      { href: '/buyer-leads',  label: 'Buyer Leads',  icon: UserPlus,  roles: ['admin', 'broker'] },
      { href: '/site-visits',  label: 'Site Visits',  icon: MapPin,    roles: ['admin', 'broker'] },
    ],
  },
  {
    label: 'Properties',
    roles: ['admin', 'broker'],
    items: [
      { href: '/properties', label: 'Properties', icon: MapPin, roles: ['admin', 'broker'] },
      { href: '/map',        label: 'Public Map', icon: Globe,  roles: ['admin', 'broker'] },
    ],
  },
  {
    label: 'Deals & Finance',
    roles: ['admin', 'broker'],
    items: [
      { href: '/deals',      label: 'Deals',      icon: Handshake, roles: ['admin', 'broker'] },
      { href: '/commission', label: 'Commission', icon: Calculator, roles: ['admin', 'broker'] },
    ],
  },
  {
    label: 'Brokers',
    roles: ['admin', 'broker'],
    items: [
      { href: '/brokers',        label: 'Brokers',       icon: Users,       roles: ['admin'] },
      { href: '/broker-portal',  label: 'My Portal',     icon: UserCircle,  roles: ['admin', 'broker'] },
      { href: '/broker-network', label: 'Network Tree',  icon: Network,     roles: ['admin'] },
    ],
  },
  {
    label: 'Admin',
    roles: ['admin'],
    items: [
      { href: '/documents', label: 'Documents', icon: FolderOpen, roles: ['admin'] },
      { href: '/books',     label: 'Books / Files', icon: BookOpen, roles: ['admin'] },
      { href: '/reports',   label: 'Reports',   icon: BarChart3,  roles: ['admin'] },
    ],
  },
]

interface SidebarProps {
  role?: 'admin' | 'broker' | null
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ role = 'admin', mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const userRole = role ?? 'admin'

  const visibleGroups = NAV_GROUPS
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.roles.includes(userRole)),
    }))
    .filter(group => group.items.length > 0 && group.roles.includes(userRole))

  const sidebarContent = (
    <aside
      className={cn(
        'flex flex-col h-screen bg-slate-900 text-white transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-4 border-b border-slate-700/60',
        collapsed && 'justify-center px-2'
      )}>
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
          B
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm leading-tight tracking-tight">Bluesquare</div>
            <div className="text-xs text-slate-400">Real Estate CRM</div>
          </div>
        )}
        {!collapsed && onClose && (
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Grouped nav */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 scrollbar-thin">
        {visibleGroups.map((group) => (
          <div key={group.label} className="pb-1">
            {/* Group label */}
            {!collapsed && (
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                {group.label}
              </p>
            )}
            {collapsed && <div className="my-1 mx-2 border-t border-slate-700/50" />}

            {group.items.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm transition-all',
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    collapsed && 'justify-center px-0 mx-1'
                  )}
                >
                  <Icon size={17} className="shrink-0" />
                  {!collapsed && <span className="truncate font-medium">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center gap-2 px-4 py-3 border-t border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs"
      >
        {collapsed ? <ChevronRight size={15} /> : (
          <>
            <ChevronLeft size={15} />
            <span>Collapse</span>
          </>
        )}
      </button>
    </aside>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      <div className="lg:hidden">
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-[1000]" onClick={onClose} />
        )}
        <div className={cn(
          'fixed inset-y-0 left-0 z-[1001] w-72 transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          {sidebarContent}
        </div>
      </div>
    </>
  )
}
