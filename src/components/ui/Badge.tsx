import { cn, statusColor } from '@/lib/utils'

interface BadgeProps {
  status: string
  className?: string
}

export default function Badge({ status, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      statusColor(status),
      className
    )}>
      {status}
    </span>
  )
}
