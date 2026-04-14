import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: number; label: string }
  href?: string
  alert?: boolean
}

export default function StatCard({
  title, value, subtitle, icon: Icon, iconColor = 'text-blue-600',
  iconBg = 'bg-blue-100', trend, href, alert,
}: StatCardProps) {
  const card = (
    <div className={cn(
      'bg-white rounded-xl p-5 border transition-all duration-200',
      href ? 'hover:shadow-md hover:border-blue-300 cursor-pointer' : '',
      alert ? 'border-orange-300 bg-orange-50' : 'border-slate-200',
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{title}</p>
          <p className={cn('text-2xl font-bold mt-1', alert ? 'text-orange-700' : 'text-slate-800')}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          {trend && (
            <p className={cn('text-xs mt-1.5 font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl ml-3 shrink-0', iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
    </div>
  )
  return href ? <Link href={href}>{card}</Link> : card
}
